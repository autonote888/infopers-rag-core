package main

import (
	"log"
	"net/http"

	"infopers_backend/config"
	"infopers_backend/database"
	"infopers_backend/handlers"
	"infopers_backend/middleware"

	"github.com/gorilla/mux"
)

func main() {
	// 1. Inisialisasi Konfigurasi
	cfg := config.LoadConfig()

	// 2. Inisialisasi Koneksi Database PostgreSQL
	db, err := database.InitDB(cfg)
	if err != nil {
		log.Fatalf("Fatal Database Error: %v", err)
	}
	defer db.Close()
	log.Println("Berhasil terhubung ke database PostgreSQL.")

	// 3. Inisialisasi Handlers
	authH := handlers.NewAuthHandler(db, cfg)
	dashH := handlers.NewDashboardHandler(db)
	persH := handlers.NewPersonelHandler(db)
	aiH := handlers.NewAIHandler(db)
	remH := handlers.NewRemunerasiHandler(db)
	sysH := handlers.NewSystemHandler()
	poldaH := handlers.NewPoldaHandler(db)
	docsH := handlers.NewDocsHandler()

	// 4. Inisialisasi Routing Mux
	r := mux.NewRouter()

	// Public Routes (Termasuk Swagger UI & OpenAPI Specification)
	r.HandleFunc("/swagger", docsH.ServeSwaggerUI).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/docs/openapi.json", docsH.ServeOpenAPIJSON).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/system/logs", docsH.GetLogs).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/login", authH.Login).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/polda/summary", poldaH.GetPoldaSummary).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/polda/satker", poldaH.GetSatkerByPolda).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/ai/ask", aiH.Ask).Methods("POST", "OPTIONS")
	r.HandleFunc("/api/ai/ollama-status", aiH.GetOllamaStatus).Methods("GET", "OPTIONS")

	// Protected Routes (JWT Required - Mendukung Token Keycloak RS256 & Token Lokal HS256)
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.AuthMiddleware(cfg.JWTSecret, cfg.KeycloakURL, cfg.KeycloakRealm))

	api.HandleFunc("/auth/me", authH.Me).Methods("GET")
	api.HandleFunc("/dashboard/stats", dashH.GetStats).Methods("GET")
	api.HandleFunc("/personel", persH.GetList).Methods("GET")
	api.HandleFunc("/personel", persH.CreatePersonel).Methods("POST")
	api.HandleFunc("/personel/{nip_nrp}", persH.GetDetail).Methods("GET")
	api.HandleFunc("/personel/{nip_nrp}", persH.UpdatePersonel).Methods("PUT")
	api.HandleFunc("/personel/{nip_nrp}", persH.DeletePersonel).Methods("DELETE")
	api.HandleFunc("/polda/summary", poldaH.GetPoldaSummary).Methods("GET")
	api.HandleFunc("/polda/satker", poldaH.GetSatkerByPolda).Methods("GET")
	api.HandleFunc("/ai/ask", aiH.Ask).Methods("POST")
	api.HandleFunc("/ai/ollama-status", aiH.GetOllamaStatus).Methods("GET")
	api.HandleFunc("/remunerasi/simulasi", remH.GetSimulasi).Methods("GET")
	api.HandleFunc("/audit/hash-chain", remH.GetHashChain).Methods("GET")
	api.HandleFunc("/system/device-resources", sysH.GetDeviceResources).Methods("GET")

	// 5. Inisialisasi Middleware CORS
	corsHandler := middleware.SetupCORS()
	handler := corsHandler.Handler(r)

	// 6. Jalankan HTTP Server
	log.Printf("Server SSDM Go Backend berjalan di http://localhost%s\n", cfg.Port)
	if err := http.ListenAndServe(cfg.Port, handler); err != nil {
		log.Fatalf("Server gagal dijalankan: %v", err)
	}
}
