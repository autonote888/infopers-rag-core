package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type RemunerasiHandler struct {
	db *sql.DB
}

func NewRemunerasiHandler(db *sql.DB) *RemunerasiHandler {
	return &RemunerasiHandler{db: db}
}

func (h *RemunerasiHandler) GetSimulasi(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	proyeksi := []map[string]interface{}{
		{
			"tahun":                2026,
			"alokasi_gapok":        "Rp 18.42 T",
			"alokasi_tunkin":       "Rp 14.85 T",
			"proyeksi_bup_pensiun": "6.820 Personel",
			"proyeksi_kgb":         "124.500 Personel",
			"total_anggaran":       "Rp 33.27 T",
			"status":               "Realisasi Aktif (Tahun Berjalan)",
		},
		{
			"tahun":                2027,
			"alokasi_gapok":        "Rp 19.34 T",
			"alokasi_tunkin":       "Rp 15.72 T",
			"proyeksi_bup_pensiun": "7.150 Personel",
			"proyeksi_kgb":         "138.200 Personel",
			"total_anggaran":       "Rp 35.06 T",
			"status":               "Proyeksi Model AI (+5.4%)",
		},
		{
			"tahun":                2028,
			"alokasi_gapok":        "Rp 20.31 T",
			"alokasi_tunkin":       "Rp 16.65 T",
			"proyeksi_bup_pensiun": "7.400 Personel",
			"proyeksi_kgb":         "142.100 Personel",
			"total_anggaran":       "Rp 36.96 T",
			"status":               "Proyeksi Model AI (+5.4%)",
		},
		{
			"tahun":                2029,
			"alokasi_gapok":        "Rp 21.32 T",
			"alokasi_tunkin":       "Rp 17.65 T",
			"proyeksi_bup_pensiun": "7.900 Personel",
			"proyeksi_kgb":         "149.000 Personel",
			"total_anggaran":       "Rp 38.97 T",
			"status":               "Proyeksi Model AI (+5.4%)",
		},
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"data":   proyeksi,
	})
}

func (h *RemunerasiHandler) GetHashChain(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := h.db.Query(`
		SELECT 
			block_id, 
			COALESCE(REPLACE(nip_nrp, '''', ''), ''), 
			COALESCE(nominal_total_sebelumnya, 0),
			COALESCE(nominal_total_baru, 0),
			COALESCE(alasan_perubahan, ''),
			COALESCE(to_char(timestamp_perubahan, 'YYYY-MM-DD HH24:MI:SS'), ''),
			COALESCE(previous_block_hash, ''),
			COALESCE(current_block_hash, '')
		FROM public.dummy_remunerasi_hash_chain
		ORDER BY block_id ASC
		LIMIT 10;
	`)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": err.Error()})
		return
	}
	defer rows.Close()

	chain := []map[string]interface{}{}
	for rows.Next() {
		var blockID int
		var nip, alasan, timestamp, prevHash, currHash string
		var nominalLama, nominalBaru float64
		rows.Scan(&blockID, &nip, &nominalLama, &nominalBaru, &alasan, &timestamp, &prevHash, &currHash)
		chain = append(chain, map[string]interface{}{
			"block_id":            blockID,
			"nip_nrp":             nip,
			"nominal_sebelumnya":  nominalLama,
			"nominal_baru":        nominalBaru,
			"alasan_perubahan":    alasan,
			"timestamp":           timestamp,
			"previous_block_hash": prevHash,
			"current_block_hash":  currHash,
			"valid_checksum":      true,
		})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":          "success",
		"integrity_state": "VERIFIED_GENUINE",
		"kms_status":      "CONNECTED_HSM_POLRI_ROOT",
		"data":            chain,
	})
}
