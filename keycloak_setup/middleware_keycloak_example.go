package middleware

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
)

// KeycloakClaims merepresentasikan payload token JWT resmi dari Keycloak
type KeycloakClaims struct {
	ResourceAccess map[string]struct {
		Roles []string `json:"roles"`
	} `json:"resource_access"`
	RealmAccess struct {
		Roles []string `json:"roles"`
	} `json:"realm_access"`
	PreferredUsername string `json:"preferred_username"`
	Email             string `json:"email"`
	Name              string `json:"name"`
	GivenName         string `json:"given_name"`
	FamilyName        string `json:"family_name"`
	jwt.RegisteredClaims
}

// JWKKey merepresentasikan public key di endpoint JWKS Keycloak
type JWKKey struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	Alg string `json:"alg"`
	Use string `json:"use"`
	N   string `json:"n"`
	E   string `json:"e"`
}

type JWKSResponse struct {
	Keys []JWKKey `json:"keys"`
}

// KeycloakValidator mengelola cache public key untuk verifikasi instan (<1ms)
type KeycloakValidator struct {
	jwksURL    string
	cachedKeys map[string]*rsa.PublicKey
	mu         sync.RWMutex
	lastFetch  time.Time
}

func NewKeycloakValidator(keycloakBaseURL, realmName string) *KeycloakValidator {
	jwksURL := fmt.Sprintf("%s/realms/%s/protocol/openid-connect/certs", keycloakBaseURL, realmName)
	return &KeycloakValidator{
		jwksURL:    jwksURL,
		cachedKeys: make(map[string]*rsa.PublicKey),
	}
}

// GetKey mengambil RSA Public Key berdasarkan Key ID (kid) di header JWT
func (v *KeycloakValidator) GetKey(kid string) (*rsa.PublicKey, error) {
	v.mu.RLock()
	key, exists := v.cachedKeys[kid]
	recent := time.Since(v.lastFetch) < 1*time.Hour
	v.mu.RUnlock()

	if exists && recent {
		return key, nil
	}

	// Fetch / Refresh JWKS dari server Keycloak
	v.mu.Lock()
	defer v.mu.Unlock()

	resp, err := http.Get(v.jwksURL)
	if err != nil {
		return nil, fmt.Errorf("gagal menghubungi JWKS Keycloak: %v", err)
	}
	defer resp.Body.Close()

	var jwks JWKSResponse
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return nil, fmt.Errorf("gagal decode JWKS: %v", err)
	}

	v.cachedKeys = make(map[string]*rsa.PublicKey)
	for _, k := range jwks.Keys {
		if k.Kty == "RSA" {
			pubKey, err := parseRSAPublicKey(k.N, k.E)
			if err == nil {
				v.cachedKeys[k.Kid] = pubKey
			}
		}
	}
	v.lastFetch = time.Now()

	pubKey, ok := v.cachedKeys[kid]
	if !ok {
		return nil, fmt.Errorf("kunci kid '%s' tidak ditemukan di JWKS Keycloak", kid)
	}
	return pubKey, nil
}

func parseRSAPublicKey(nStr, eStr string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(nStr)
	if err != nil {
		return nil, err
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(eStr)
	if err != nil {
		return nil, err
	}

	var eInt int
	for _, b := range eBytes {
		eInt = (eInt << 8) | int(b)
	}

	n := new(big.Int).SetBytes(nBytes)
	return &rsa.PublicKey{
		N: n,
		E: eInt,
	}, nil
}

// KeycloakAuthMiddleware memvalidasi token JWT Keycloak untuk REST API Golang
func KeycloakAuthMiddleware(validator *KeycloakValidator) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"status":  "error",
					"message": "Token Keycloak tidak ditemukan pada header Authorization",
				})
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"status":  "error",
					"message": "Format token tidak valid (Gunakan Bearer <token_keycloak>)",
				})
				return
			}

			tokenString := parts[1]
			claims := &KeycloakClaims{}

			token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
					return nil, fmt.Errorf("algoritma signing tidak terduga: %v", t.Header["alg"])
				}
				kid, ok := t.Header["kid"].(string)
				if !ok {
					return nil, fmt.Errorf("header token tidak memiliki field 'kid'")
				}
				return validator.GetKey(kid)
			})

			if err != nil || !token.Valid {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"status":  "error",
					"message": "Token Keycloak tidak valid atau telah kedaluwarsa: " + err.Error(),
				})
				return
			}

			// Simpan klaim identitas ke context HTTP request
			ctx := context.WithValue(r.Context(), "keycloakUser", claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
