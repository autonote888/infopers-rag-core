package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

type PersonelHandler struct {
	db *sql.DB
}

func NewPersonelHandler(db *sql.DB) *PersonelHandler {
	return &PersonelHandler{db: db}
}

func (h *PersonelHandler) GetList(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	search := strings.TrimSpace(r.URL.Query().Get("q"))
	polda := strings.TrimSpace(r.URL.Query().Get("polda"))

	query := `
		SELECT 
			COALESCE(REPLACE(p.nip_nrp, '''', ''), '') as nip_nrp,
			COALESCE(p.nama, '') as nama,
			COALESCE(p.pangkat, '') as pangkat,
			COALESCE(p.jenis_personel, 'POLRI') as jenis_personel,
			COALESCE(p.nama_satker, '') as satker,
			COALESCE(p.nama_polda, '') as polda,
			COALESCE(p.total_tunkin_yang_diterima, 0) as tunkin,
			COALESCE(jf.nama_jabatan_jf, 'Staf Fungsional Umum') as jabatan_jf,
			COALESCE(kd.nama_sertifikasi, 'Dikbangspes Polri') as sertifikasi
		FROM public.data_polri_september_2026 p
		LEFT JOIN public.dummy_jabatan_fungsional jf ON REPLACE(p.nip_nrp, '''', '') = REPLACE(jf.nip_nrp, '''', '')
		LEFT JOIN public.dummy_kompetensi_diklat kd ON REPLACE(p.nip_nrp, '''', '') = REPLACE(kd.nip_nrp, '''', '')
	`

	var conditions []string
	var args []interface{}
	idx := 1

	if search != "" {
		conditions = append(conditions, fmt.Sprintf("(p.nama ILIKE $%d OR REPLACE(p.nip_nrp, '''', '') ILIKE $%d OR p.jenis_personel ILIKE $%d OR p.pangkat ILIKE $%d)", idx, idx, idx, idx))
		args = append(args, "%"+search+"%")
		idx++
	}

	if polda != "" {
		conditions = append(conditions, fmt.Sprintf("p.nama_polda ILIKE $%d", idx))
		args = append(args, "%"+polda+"%")
		idx++
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	query += " LIMIT 25;"

	rows, err := h.db.Query(query, args...)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": err.Error()})
		return
	}
	defer rows.Close()

	list := []map[string]interface{}{}
	for rows.Next() {
		var nip, nama, pangkat, jp, satker, poldaNama, jf, sertifikasi string
		var tunkin float64
		err := rows.Scan(&nip, &nama, &pangkat, &jp, &satker, &poldaNama, &tunkin, &jf, &sertifikasi)
		if err == nil {
			list = append(list, map[string]interface{}{
				"nip_nrp":        nip,
				"nama":           nama,
				"pangkat":        pangkat,
				"jenis_personel": jp,
				"satker":         satker,
				"polda":          poldaNama,
				"tunkin":         tunkin,
				"jabatan_jf":     jf,
				"sertifikasi":    sertifikasi,
			})
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"data":   list,
	})
}

func (h *PersonelHandler) GetDetail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	nipNrp := strings.Trim(vars["nip_nrp"], "'\" ")

	var utamaJSON []byte
	err := h.db.QueryRow(`
		SELECT row_to_json(t) FROM (
			SELECT * FROM public.data_polri_september_2026 
			WHERE REPLACE(nip_nrp, '''', '') = $1 
			LIMIT 1
		) t;
	`, nipNrp).Scan(&utamaJSON)

	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Personel tidak ditemukan"})
		return
	}

	var detailJSON []byte
	_ = h.db.QueryRow(`
		SELECT row_to_json(t) FROM (
			SELECT * FROM public.dummy_personel_detail 
			WHERE REPLACE(nip_nrp, '''', '') = $1 
			LIMIT 1
		) t;
	`, nipNrp).Scan(&detailJSON)

	var jfJSON []byte
	_ = h.db.QueryRow(`
		SELECT row_to_json(t) FROM (
			SELECT * FROM public.dummy_jabatan_fungsional 
			WHERE REPLACE(nip_nrp, '''', '') = $1 
			LIMIT 1
		) t;
	`, nipNrp).Scan(&jfJSON)

	var diklatJSON []byte
	_ = h.db.QueryRow(`
		SELECT row_to_json(t) FROM (
			SELECT * FROM public.dummy_kompetensi_diklat 
			WHERE REPLACE(nip_nrp, '''', '') = $1 
			LIMIT 1
		) t;
	`, nipNrp).Scan(&diklatJSON)

	var riwayatJSON []byte
	_ = h.db.QueryRow(`
		SELECT json_agg(t) FROM (
			SELECT * FROM public.dummy_riwayat_penugasan 
			WHERE REPLACE(nip_nrp, '''', '') = $1 
			ORDER BY tanggal_mulai DESC 
			LIMIT 5
		) t;
	`, nipNrp).Scan(&riwayatJSON)

	var dokumenJSON []byte
	_ = h.db.QueryRow(`
		SELECT json_agg(t) FROM (
			SELECT * FROM public.dummy_dokumen_validasi 
			WHERE REPLACE(nip_nrp, '''', '') = $1 
			LIMIT 5
		) t;
	`, nipNrp).Scan(&dokumenJSON)

	var hashJSON []byte
	_ = h.db.QueryRow(`
		SELECT json_agg(t) FROM (
			SELECT * FROM public.dummy_remunerasi_hash_chain 
			WHERE REPLACE(nip_nrp, '''', '') = $1 
			ORDER BY timestamp_perubahan DESC 
			LIMIT 5
		) t;
	`, nipNrp).Scan(&hashJSON)

	var utamaMap, detailMap, jfMap, diklatMap map[string]interface{}
	var riwayatList, dokumenList, hashList []interface{}

	json.Unmarshal(utamaJSON, &utamaMap)
	json.Unmarshal(detailJSON, &detailMap)
	json.Unmarshal(jfJSON, &jfMap)
	json.Unmarshal(diklatJSON, &diklatMap)
	json.Unmarshal(riwayatJSON, &riwayatList)
	json.Unmarshal(dokumenJSON, &dokumenList)
	json.Unmarshal(hashJSON, &hashList)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"data": map[string]interface{}{
			"utama":              utamaMap,
			"detail":             detailMap,
			"jabatan_fungsional": jfMap,
			"diklat_kompetensi":  diklatMap,
			"riwayat_penugasan":  riwayatList,
			"dokumen_validasi":   dokumenList,
			"remunerasi_audit":   hashList,
		},
	})
}
