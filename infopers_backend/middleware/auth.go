package middleware

import (
	"context"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"infopers_backend/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
)

type contextKey string

const UserContextKey = contextKey("userClaims")

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

var (
	defaultKeycloakValidator *KeycloakValidator
	validatorOnce            sync.Once
)

func GetKeycloakValidator(keycloakBaseURL, realmName string) *KeycloakValidator {
	validatorOnce.Do(func() {
		if keycloakBaseURL == "" {
			keycloakBaseURL = "http://localhost:8080"
		}
		if realmName == "" {
			realmName = "ssdm-polri"
		}
		jwksURL := fmt.Sprintf("%s/realms/%s/protocol/openid-connect/certs", keycloakBaseURL, realmName)
		defaultKeycloakValidator = &KeycloakValidator{
			jwksURL:    jwksURL,
			cachedKeys: make(map[string]*rsa.PublicKey),
		}
	})
	return defaultKeycloakValidator
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

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(v.jwksURL)
	if err != nil {
		return nil, fmt.Errorf("gagal menghubungi JWKS Keycloak (%s): %v", v.jwksURL, err)
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

// Generate JWT Token Lokal
func GenerateJWT(nipNrp, username, roleLevel, nama, pangkat, secret string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &models.JWTClaims{
		NipNrp:    nipNrp,
		Username:  username,
		RoleLevel: roleLevel,
		Nama:      nama,
		Pangkat:   pangkat,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "ssdm-polri-infopers",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// Hash password with salt
func HashPassword(plainText, salt string) string {
	hasher := sha256.New()
	hasher.Write([]byte(plainText + salt))
	return hex.EncodeToString(hasher.Sum(nil))
}

// Auth Middleware Universal: Mendukung Token Keycloak (RS256) & Token Lokal (HS256)
func AuthMiddleware(secret string, keycloakOpts ...string) mux.MiddlewareFunc {
	kcURL := "http://localhost:8080"
	kcRealm := "ssdm-polri"
	if len(keycloakOpts) > 0 && keycloakOpts[0] != "" {
		kcURL = keycloakOpts[0]
	}
	if len(keycloakOpts) > 1 && keycloakOpts[1] != "" {
		kcRealm = keycloakOpts[1]
	}
	kcValidator := GetKeycloakValidator(kcURL, kcRealm)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"status":  "error",
					"message": "Token otentikasi tidak ditemukan. Silakan login kembali.",
				})
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"status":  "error",
					"message": "Format header otentikasi tidak valid (Gunakan Bearer <token>)",
				})
				return
			}

			tokenString := parts[1]

			// Parse unverified header terlebih dahulu untuk mengetahui jenis token (RS256 Keycloak vs HS256 Lokal)
			parser := jwt.NewParser()
			unverifiedToken, _, _ := parser.ParseUnverified(tokenString, jwt.MapClaims{})

			var finalClaims *models.JWTClaims
			algStr := ""
			if unverifiedToken != nil && unverifiedToken.Header != nil {
				if alg, ok := unverifiedToken.Header["alg"].(string); ok {
					algStr = alg
				}
			}

			if algStr == "RS256" {
				// 1. Verifikasi Token Keycloak (RS256 via JWKS)
				kcClaims := &KeycloakClaims{}
				token, err := jwt.ParseWithClaims(tokenString, kcClaims, func(t *jwt.Token) (interface{}, error) {
					if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
						return nil, fmt.Errorf("algoritma signing tidak terduga: %v", t.Header["alg"])
					}
					kid, ok := t.Header["kid"].(string)
					if !ok {
						return nil, fmt.Errorf("header token tidak memiliki field 'kid'")
					}
					return kcValidator.GetKey(kid)
				})

				if err == nil && token.Valid {
					// Ekstrak role dari Keycloak Realm Access
					roleLevel := "PERSONEL"
					for _, role := range kcClaims.RealmAccess.Roles {
						if role == "SUPERADMIN" {
							roleLevel = "SUPERADMIN"
							break
						} else if role == "ADMIN_POLDA" {
							roleLevel = "ADMIN_POLDA"
						} else if role == "ADMIN_POLRES" && roleLevel != "ADMIN_POLDA" {
							roleLevel = "ADMIN_POLRES"
						}
					}

					nama := kcClaims.Name
					if nama == "" {
						nama = kcClaims.PreferredUsername
					}

					pangkat := "ANGGOTA POLRI"
					if roleLevel == "SUPERADMIN" {
						pangkat = "KOMBES POL"
					}

					finalClaims = &models.JWTClaims{
						NipNrp:    kcClaims.PreferredUsername,
						Username:  kcClaims.PreferredUsername,
						RoleLevel: roleLevel,
						Nama:      nama,
						Pangkat:   pangkat,
					}
				}
			}

			// 2. Jika bukan token Keycloak atau verifikasi RS256 tidak terpenuhi, verifikasi sebagai token HS256 lokal
			if finalClaims == nil {
				claims := &models.JWTClaims{}
				token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
					if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
						return nil, fmt.Errorf("metode signing tidak valid")
					}
					return []byte(secret), nil
				})

				if err == nil && token.Valid {
					finalClaims = claims
				}
			}

			if finalClaims == nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"status":  "error",
					"message": "Token tidak valid atau kedaluwarsa (Verifikasi Keycloak / Lokal gagal)",
				})
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, finalClaims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

