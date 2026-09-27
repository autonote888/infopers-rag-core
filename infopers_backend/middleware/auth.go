package middleware

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"infopers_backend/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
)

type contextKey string

const UserContextKey = contextKey("userClaims")

// Generate JWT Token
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

// Auth Middleware
func AuthMiddleware(secret string) mux.MiddlewareFunc {
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
			claims := &models.JWTClaims{}

			token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("metode signing tidak valid")
				}
				return []byte(secret), nil
			})

			if err != nil || !token.Valid {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{
					"status":  "error",
					"message": "Token tidak valid atau kedaluwarsa",
				})
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
