package models

import "github.com/golang-jwt/jwt/v5"

// JWT Claims
type JWTClaims struct {
	NipNrp    string `json:"nip_nrp"`
	Username  string `json:"username"`
	RoleLevel string `json:"role_level"`
	Nama      string `json:"nama"`
	Pangkat   string `json:"pangkat"`
	jwt.RegisteredClaims
}

// Request & Response Auth
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserProfile struct {
	NipNrp    string `json:"nip_nrp"`
	Username  string `json:"username"`
	Nama      string `json:"nama"`
	Pangkat   string `json:"pangkat"`
	RoleLevel string `json:"role_level"`
}

type LoginResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	Token   string      `json:"token,omitempty"`
	User    UserProfile `json:"user,omitempty"`
}

// AI Query
type AIQueryRequest struct {
	Query        string  `json:"query"`
	Mode         string  `json:"mode"`          // "rag_ollama", "tanya_personel", "self_service"
	Model        string  `json:"model,omitempty"` // e.g. "llama3:8b", "qwen2.5:7b"
	Host         string  `json:"host,omitempty"`  // e.g. "http://localhost:11434"
	SystemPrompt string  `json:"system_prompt,omitempty"`
	Temperature  float64 `json:"temperature,omitempty"`
}
