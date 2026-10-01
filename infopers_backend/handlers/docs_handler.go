package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type APILogEntry struct {
	ID         string `json:"id"`
	Timestamp  string `json:"timestamp"`
	Method     string `json:"method"`
	Path       string `json:"path"`
	Status     int    `json:"status"`
	DurationMs int64  `json:"duration_ms"`
	ClientIP   string `json:"client_ip"`
	Action     string `json:"action"`
	Details    string `json:"details"`
}

type DocsHandler struct {
	mu   sync.RWMutex
	logs []APILogEntry
}

var globalDocsHandler *DocsHandler

func NewDocsHandler() *DocsHandler {
	h := &DocsHandler{
		logs: make([]APILogEntry, 0),
	}

	// Seed data awal log sistem pengiriman data
	now := time.Now()
	h.logs = append(h.logs,
		APILogEntry{
			ID:         "log_init_01",
			Timestamp:  now.Add(-10 * time.Minute).Format("2006-01-02 15:04:05"),
			Method:     "POST",
			Path:       "/api/login",
			Status:     200,
			DurationMs: 42,
			ClientIP:   "127.0.0.1",
			Action:     "AUTENTIKASI_USER",
			Details:    "Login berhasil untuk pengguna: admin.nasional (Role: SUPERADMIN)",
		},
		APILogEntry{
			ID:         "log_init_02",
			Timestamp:  now.Add(-8 * time.Minute).Format("2006-01-02 15:04:05"),
			Method:     "GET",
			Path:       "/api/personel",
			Status:     200,
			DurationMs: 18,
			ClientIP:   "127.0.0.1",
			Action:     "BACA_DATA_PERSONEL",
			Details:    "Pengambilan daftar personel aktif (Limit: 50, Query PostgreSQL)",
		},
		APILogEntry{
			ID:         "log_init_03",
			Timestamp:  now.Add(-5 * time.Minute).Format("2006-01-02 15:04:05"),
			Method:     "POST",
			Path:       "/api/ai/ask",
			Status:     200,
			DurationMs: 685,
			ClientIP:   "127.0.0.1",
			Action:     "KUERI_RAG_OLLAMA",
			Details:    "Pencarian cerdas data personel via Model Ollama (ssdm-ai:latest)",
		},
		APILogEntry{
			ID:         "log_init_04",
			Timestamp:  now.Add(-2 * time.Minute).Format("2006-01-02 15:04:05"),
			Method:     "GET",
			Path:       "/api/audit/hash-chain",
			Status:     200,
			DurationMs: 12,
			ClientIP:   "127.0.0.1",
			Action:     "VERIFIKASI_AUDIT",
			Details:    "Pengecekan integritas rantai blok remunerasi dan mutasi",
		},
	)

	globalDocsHandler = h
	return h
}

func RecordAPILog(method, path string, status int, durationMs int64, clientIP, action, details string) {
	if globalDocsHandler == nil {
		return
	}
	globalDocsHandler.AddLog(APILogEntry{
		ID:         fmt.Sprintf("log_%d", time.Now().UnixNano()),
		Timestamp:  time.Now().Format("2006-01-02 15:04:05"),
		Method:     method,
		Path:       path,
		Status:     status,
		DurationMs: durationMs,
		ClientIP:   clientIP,
		Action:     action,
		Details:    details,
	})
}

func (h *DocsHandler) AddLog(entry APILogEntry) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Tambahkan ke depan (terbaru di atas)
	h.logs = append([]APILogEntry{entry}, h.logs...)
	if len(h.logs) > 100 {
		h.logs = h.logs[:100] // Simpan 100 entri terakhir
	}
}

func (h *DocsHandler) GetLogs(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	h.mu.RLock()
	defer h.mu.RUnlock()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"total":  len(h.logs),
		"data":   h.logs,
	})
}

// ServeOpenAPIJSON menghasilkan spesifikasi OpenAPI 3.0 standar untuk Swagger UI
func (h *DocsHandler) ServeOpenAPIJSON(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	spec := map[string]interface{}{
		"openapi": "3.0.3",
		"info": map[string]interface{}{
			"title":       "Dokumentasi API SSDM Polri Presisi",
			"description": "Spesifikasi resmi REST API backend Golang untuk sistem INFOPERS SSDM Polri. Mendukung manajemen CRUD Personel langsung ke basis data PostgreSQL 18 serta integrasi pencarian cerdas Model Ollama.",
			"version":     "2026.1.0",
			"contact": map[string]interface{}{
				"name":  "Biro Binkar & Dalpers SSDM Polri",
				"email": "infopers@polri.go.id",
			},
		},
		"servers": []map[string]interface{}{
			{
				"url":         "http://localhost:8085",
				"description": "Server Lokal Backend SSDM Polri (Port 8085)",
			},
		},
		"components": map[string]interface{}{
			"securitySchemes": map[string]interface{}{
				"BearerAuth": map[string]interface{}{
					"type":         "http",
					"scheme":       "bearer",
					"bearerFormat": "JWT",
					"description":  "Masukkan token JWT yang didapatkan dari endpoint /api/login",
				},
			},
		},
		"paths": map[string]interface{}{
			"/api/login": map[string]interface{}{
				"post": map[string]interface{}{
					"summary":     "Autentikasi Pengguna (Login)",
					"description": "Memverifikasi kredensial personel/admin dan mengembalikan JWT token.",
					"tags":        []string{"Autentikasi"},
					"requestBody": map[string]interface{}{
						"required": true,
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type": "object",
									"properties": map[string]interface{}{
										"username": map[string]interface{}{"type": "string", "example": "admin.nasional"},
										"password": map[string]interface{}{"type": "string", "example": "Polri2026!"},
									},
									"required": []string{"username", "password"},
								},
							},
						},
					},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{"description": "Login berhasil, token JWT disertakan."},
						"401": map[string]interface{}{"description": "Kredensial username/password salah."},
					},
				},
			},
			"/api/personel": map[string]interface{}{
				"get": map[string]interface{}{
					"summary":     "Daftar Rincian Personel (Read/Search)",
					"description": "Mengambil daftar personel dari PostgreSQL dengan filter nama/NRP, korps, limit, dan pagination.",
					"tags":        []string{"CRUD Personel"},
					"security":    []map[string]interface{}{{"BearerAuth": []string{}}},
					"parameters": []map[string]interface{}{
						{"name": "search", "in": "query", "description": "Pencarian nama atau NRP", "schema": map[string]interface{}{"type": "string"}},
						{"name": "jenis_personel", "in": "query", "description": "Filter korps: POLRI, ASN, PPPK, atau ALL", "schema": map[string]interface{}{"type": "string"}},
						{"name": "limit", "in": "query", "description": "Jumlah data per halaman", "schema": map[string]interface{}{"type": "integer", "default": 50}},
						{"name": "offset", "in": "query", "description": "Offset data", "schema": map[string]interface{}{"type": "integer", "default": 0}},
					},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{"description": "Daftar personel berhasil didapatkan."},
					},
				},
				"post": map[string]interface{}{
					"summary":     "Tambah Data Personel Baru (Create)",
					"description": "Menambahkan entri personel baru langsung ke tabel data_polri_september_2026 dan relasi jabatan fungsional.",
					"tags":        []string{"CRUD Personel"},
					"security":    []map[string]interface{}{{"BearerAuth": []string{}}},
					"requestBody": map[string]interface{}{
						"required": true,
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type": "object",
									"properties": map[string]interface{}{
										"nip_nrp":          map[string]interface{}{"type": "string", "example": "04031518"},
										"nama":             map[string]interface{}{"type": "string", "example": "YUSUF HAMBALI"},
										"pangkat":          map[string]interface{}{"type": "string", "example": "BRIPDA"},
										"jenis_personel":   map[string]interface{}{"type": "string", "example": "POLRI"},
										"nama_satker":      map[string]interface{}{"type": "string", "example": "BARESKRIM POLRI"},
										"nama_polda":       map[string]interface{}{"type": "string", "example": "MABES POLRI"},
										"nama_jabatan_jf":  map[string]interface{}{"type": "string", "example": "Penyidik Siber"},
										"jenjang_jf":       map[string]interface{}{"type": "string", "example": "Pertama"},
										"kelas_jabatan_jf": map[string]interface{}{"type": "integer", "example": 10},
										"total_tunkin":     map[string]interface{}{"type": "number", "example": 3319000},
									},
									"required": []string{"nip_nrp", "nama", "pangkat", "nama_satker"},
								},
							},
						},
					},
					"responses": map[string]interface{}{
						"201": map[string]interface{}{"description": "Data personel berhasil disimpan ke database."},
					},
				},
			},
			"/api/personel/{nip_nrp}": map[string]interface{}{
				"put": map[string]interface{}{
					"summary":     "Perbarui Data & Jabatan Personel (Update)",
					"description": "Memperbarui kepangkatan, satker, jabatan fungsional, dan kelas jabatan personel di PostgreSQL.",
					"tags":        []string{"CRUD Personel"},
					"security":    []map[string]interface{}{{"BearerAuth": []string{}}},
					"parameters": []map[string]interface{}{
						{"name": "nip_nrp", "in": "path", "required": true, "schema": map[string]interface{}{"type": "string"}},
					},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{"description": "Data personel berhasil diperbarui."},
					},
				},
				"delete": map[string]interface{}{
					"summary":     "Hapus Personel (Delete)",
					"description": "Menghapus data personel dan relasinya secara permanen dari basis data.",
					"tags":        []string{"CRUD Personel"},
					"security":    []map[string]interface{}{{"BearerAuth": []string{}}},
					"parameters": []map[string]interface{}{
						{"name": "nip_nrp", "in": "path", "required": true, "schema": map[string]interface{}{"type": "string"}},
					},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{"description": "Data personel berhasil dihapus."},
					},
				},
			},
			"/api/ai/ask": map[string]interface{}{
				"post": map[string]interface{}{
					"summary":     "Tanya Jawab Cerdas Personel (RAG / AI)",
					"description": "Menjawab pertanyaan bahasa alami dengan Model Ollama terpadu dan grounding data riil SSDM Polri.",
					"tags":        []string{"Kecerdasan Buatan (RAG)"},
					"security":    []map[string]interface{}{{"BearerAuth": []string{}}},
					"requestBody": map[string]interface{}{
						"required": true,
						"content": map[string]interface{}{
							"application/json": map[string]interface{}{
								"schema": map[string]interface{}{
									"type": "object",
									"properties": map[string]interface{}{
										"query": map[string]interface{}{"type": "string", "example": "Berapa jumlah personel polri di puskeu?"},
										"mode":  map[string]interface{}{"type": "string", "example": "rag_ollama"},
										"model": map[string]interface{}{"type": "string", "example": "ssdm-ai:latest"},
									},
									"required": []string{"query"},
								},
							},
						},
					},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{"description": "Balasan naratif dan tabel fakta berhasil dihasilkan."},
					},
				},
			},
			"/api/system/logs": map[string]interface{}{
				"get": map[string]interface{}{
					"summary":     "Log Pengiriman Data Sistem (Live Transaction Log)",
					"description": "Mengambil rekam jejak pengiriman data, timestamp, method, endpoint, IP, status code, dan aksi.",
					"tags":        []string{"Sistem & Audit"},
					"responses": map[string]interface{}{
						"200": map[string]interface{}{"description": "Daftar log pengiriman data sistem berhasil didapatkan."},
					},
				},
			},
		},
	}

	json.NewEncoder(w).Encode(spec)
}

// ServeSwaggerUI menyajikan halaman Swagger UI interaktif langsung di browser
func (h *DocsHandler) ServeSwaggerUI(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	html := `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Swagger UI - Dokumentasi API SSDM Polri Presisi</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
  <link rel="icon" type="image/png" href="/SSDM_Polri.png" />
  <style>
    body { margin: 0; background: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .topbar-wrapper img { content: url('/SSDM_Polri.png'); width: 40px; height: 40px; }
    .topbar { background-color: #0f172a !important; padding: 10px 0; border-bottom: 2px solid #3b82f6; }
    .swagger-ui .info .title { color: #0f172a; font-weight: 800; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/api/docs/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`

	w.Write([]byte(html))
}
