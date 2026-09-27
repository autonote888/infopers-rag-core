package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"infopers_backend/config"
	"infopers_backend/middleware"
	"infopers_backend/models"
)

type AuthHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewAuthHandler(db *sql.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{db: db, cfg: cfg}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "Format data request tidak valid",
		})
		return
	}

	trimmedUser := strings.TrimSpace(req.Username)
	cleanInputUser := strings.Trim(trimmedUser, "'\" ")

	var (
		storedPasswordHash string
		rawNipNrp          string
		roleLevel          string
		usernameDB         string
	)

	query := `
		SELECT 
			COALESCE(password_hash, ''), 
			COALESCE(nip_nrp, ''), 
			COALESCE(role_level, ''),
			COALESCE(username, '')
		FROM public.dummy_user_access
		WHERE username = $1 OR username = $2 OR REPLACE(username, '''', '') = $3
		LIMIT 1;
	`

	err := h.db.QueryRow(query, trimmedUser, "'"+cleanInputUser, cleanInputUser).Scan(
		&storedPasswordHash, &rawNipNrp, &roleLevel, &usernameDB,
	)

	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "Username atau password tidak terdaftar",
		})
		return
	}

	hashedInput := middleware.HashPassword(req.Password, h.cfg.SALT)
	if storedPasswordHash != hashedInput && storedPasswordHash != req.Password {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "Kombinasi kata sandi tidak cocok",
		})
		return
	}

	cleanNipNrp := strings.Trim(rawNipNrp, "'\" ")
	var nama, pangkat string

	_ = h.db.QueryRow(`
		SELECT COALESCE(nama, ''), COALESCE(pangkat, '') 
		FROM public.data_polri_september_2026 
		WHERE REPLACE(nip_nrp, '''', '') = $1 
		LIMIT 1;
	`, cleanNipNrp).Scan(&nama, &pangkat)

	if nama == "" && roleLevel == "SUPERADMIN" {
		nama = "SUPER ADMINISTRATOR SSDM"
		pangkat = "KOMBES POL"
	}

	token, err := middleware.GenerateJWT(cleanNipNrp, usernameDB, roleLevel, nama, pangkat, h.cfg.JWTSecret)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "Gagal membuat sesi token autentikasi",
		})
		return
	}

	resp := models.LoginResponse{
		Status:  "success",
		Message: "Autentikasi Presisi Berhasil. Sesi terverifikasi.",
		Token:   token,
		User: models.UserProfile{
			NipNrp:    cleanNipNrp,
			Username:  usernameDB,
			Nama:      nama,
			Pangkat:   pangkat,
			RoleLevel: roleLevel,
		},
	}

	json.NewEncoder(w).Encode(resp)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims, ok := r.Context().Value(middleware.UserContextKey).(*models.JWTClaims)
	if !ok || claims == nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Unauthorized"})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"user":   claims,
	})
}
