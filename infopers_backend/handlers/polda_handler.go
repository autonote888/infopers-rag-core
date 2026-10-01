package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type PoldaHandler struct {
	db *sql.DB
}

func NewPoldaHandler(db *sql.DB) *PoldaHandler {
	return &PoldaHandler{db: db}
}

type PoldaSummaryItem struct {
	Polda          string `json:"polda"`
	JumlahSatker   int    `json:"jumlah_satker"`
	TotalPersonel  int    `json:"total_personel"`
	JumlahPolri    int    `json:"jumlah_polri"`
	JumlahPNS      int    `json:"jumlah_pns"`
	JumlahPPPK     int    `json:"jumlah_pppk"`
}

type SatkerDetailItem struct {
	Polda         string `json:"polda"`
	Satker        string `json:"satker"`
	TotalPersonel int    `json:"total_personel"`
	JumlahPolri   int    `json:"jumlah_polri"`
	JumlahPNS     int    `json:"jumlah_pns"`
	JumlahPPPK    int    `json:"jumlah_pppk"`
}

// GetPoldaSummary mengambil daftar semua Polda dan jumlah satker dari pgAdmin / PostgreSQL
func (h *PoldaHandler) GetPoldaSummary(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	t0 := time.Now()

	query := `
		SELECT 
			COALESCE(NULLIF(nama_polda, ''), 'MABES POLRI') AS polda,
			COUNT(DISTINCT NULLIF(nama_satker, '')) AS jumlah_satker,
			COUNT(*) AS total_personel,
			COUNT(*) FILTER (WHERE jenis_personel = 'POLRI' OR jenis_personel IS NULL) AS polri,
			COUNT(*) FILTER (WHERE jenis_personel = 'ASN' OR jenis_personel = 'PNS') AS pns,
			COUNT(*) FILTER (WHERE jenis_personel = 'PPPK') AS pppk
		FROM public.data_polri_september_2026
		WHERE nama_polda IS NOT NULL AND nama_polda != '' AND nama_polda != 'MABES POLRI'
		GROUP BY polda
		ORDER BY polda ASC;
	`

	rows, err := h.db.Query(query)
	if err != nil {
		http.Error(w, `{"status":"error","message":"Gagal mengambil data polda dari PostgreSQL"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var list []PoldaSummaryItem
	totalSemuaSatker := 0
	totalSemuaPersonel := 0

	for rows.Next() {
		var item PoldaSummaryItem
		err := rows.Scan(
			&item.Polda,
			&item.JumlahSatker,
			&item.TotalPersonel,
			&item.JumlahPolri,
			&item.JumlahPNS,
			&item.JumlahPPPK,
		)
		if err == nil {
			list = append(list, item)
			totalSemuaSatker += item.JumlahSatker
			totalSemuaPersonel += item.TotalPersonel
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"data": map[string]interface{}{
			"list_polda":            list,
			"total_polda":           len(list),
			"total_satker_nasional": totalSemuaSatker,
			"total_personel":        totalSemuaPersonel,
			"query_time_ms":         time.Since(t0).Milliseconds(),
			"sumber":                "PostgreSQL pgAdmin (public.data_polri_september_2026)",
		},
	})
}

// GetSatkerByPolda mengambil rincian daftar satker pada suatu polda atau seluruh satker nasional
func (h *PoldaHandler) GetSatkerByPolda(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	poldaNama := strings.TrimSpace(r.URL.Query().Get("polda"))
	isAll := poldaNama == "" || strings.EqualFold(poldaNama, "ALL") || strings.EqualFold(poldaNama, "SEMUA")

	t0 := time.Now()
	var rows *sql.Rows
	var err error

	if isAll {
		query := `
			SELECT 
				COALESCE(NULLIF(nama_polda, ''), 'MABES POLRI') AS polda,
				COALESCE(NULLIF(nama_satker, ''), 'SATKER UTAMA') AS satker,
				COUNT(*) AS total_personel,
				COUNT(*) FILTER (WHERE jenis_personel = 'POLRI' OR jenis_personel IS NULL) AS polri,
				COUNT(*) FILTER (WHERE jenis_personel = 'ASN' OR jenis_personel = 'PNS') AS pns,
				COUNT(*) FILTER (WHERE jenis_personel = 'PPPK') AS pppk
			FROM public.data_polri_september_2026
			WHERE nama_satker IS NOT NULL AND nama_satker != ''
			GROUP BY polda, satker
			ORDER BY polda ASC, satker ASC;
		`
		rows, err = h.db.Query(query)
	} else {
		query := `
			SELECT 
				COALESCE(NULLIF(nama_polda, ''), 'MABES POLRI') AS polda,
				COALESCE(NULLIF(nama_satker, ''), 'SATKER UTAMA') AS satker,
				COUNT(*) AS total_personel,
				COUNT(*) FILTER (WHERE jenis_personel = 'POLRI' OR jenis_personel IS NULL) AS polri,
				COUNT(*) FILTER (WHERE jenis_personel = 'ASN' OR jenis_personel = 'PNS') AS pns,
				COUNT(*) FILTER (WHERE jenis_personel = 'PPPK') AS pppk
			FROM public.data_polri_september_2026
			WHERE nama_polda ILIKE $1 AND nama_satker IS NOT NULL AND nama_satker != ''
			GROUP BY polda, satker
			ORDER BY satker ASC;
		`
		rows, err = h.db.Query(query, poldaNama)
	}

	if err != nil {
		http.Error(w, `{"status":"error","message":"Gagal mengambil data satker dari PostgreSQL"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var list []SatkerDetailItem
	totalPersonelSatker := 0

	for rows.Next() {
		var item SatkerDetailItem
		err := rows.Scan(
			&item.Polda,
			&item.Satker,
			&item.TotalPersonel,
			&item.JumlahPolri,
			&item.JumlahPNS,
			&item.JumlahPPPK,
		)
		if err == nil {
			list = append(list, item)
			totalPersonelSatker += item.TotalPersonel
		}
	}

	labelPolda := poldaNama
	if isAll {
		labelPolda = "SELURUH POLDA / NASIONAL"
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"data": map[string]interface{}{
			"polda":                 labelPolda,
			"list_satker":           list,
			"jumlah_satker":         len(list),
			"total_personel":        totalPersonelSatker,
			"query_time_ms":         time.Since(t0).Milliseconds(),
			"sumber":                "PostgreSQL pgAdmin (public.data_polri_september_2026)",
		},
	})
}
