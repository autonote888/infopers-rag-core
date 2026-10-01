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

	var conditions []string
	var args []interface{}
	idx := 1

	if search != "" {
		conditions = append(conditions, fmt.Sprintf("(p.nama ILIKE $%d OR p.nip_nrp ILIKE $%d OR p.pangkat ILIKE $%d OR p.nama_satker ILIKE $%d)", idx, idx, idx, idx))
		args = append(args, "%"+search+"%")
		idx++
	}

	if polda != "" {
		conditions = append(conditions, fmt.Sprintf("p.nama_polda ILIKE $%d", idx))
		args = append(args, "%"+polda+"%")
		idx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		WITH matched AS (
			SELECT p.nip_nrp, p.nama, p.pangkat, COALESCE(p.jenis_personel, 'POLRI') as jenis_personel,
			       p.nama_satker, p.nama_polda, COALESCE(p.total_tunkin_yang_diterima, 0) as total_tunkin_yang_diterima
			FROM public.data_polri_september_2026 p
			%s
			LIMIT 25
		)
		SELECT 
			COALESCE(REPLACE(m.nip_nrp, '''', ''), '') as nip_nrp,
			COALESCE(m.nama, '') as nama,
			COALESCE(m.pangkat, '') as pangkat,
			m.jenis_personel,
			COALESCE(m.nama_satker, '') as satker,
			COALESCE(m.nama_polda, '') as polda,
			m.total_tunkin_yang_diterima as tunkin,
			COALESCE(jf.nama_jabatan_jf, 'Staf Fungsional Umum') as jabatan_jf,
			COALESCE(kd.nama_sertifikasi, 'Dikbangspes Polri') as sertifikasi
		FROM matched m
		LEFT JOIN public.dummy_jabatan_fungsional jf ON jf.nip_nrp = REPLACE(m.nip_nrp, '''', '')
		LEFT JOIN public.dummy_kompetensi_diklat kd ON kd.nip_nrp = REPLACE(m.nip_nrp, '''', '')
	`, whereClause)

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

type PersonelPayload struct {
	NipNrp           string  `json:"nip_nrp"`
	Nama             string  `json:"nama"`
	Pangkat          string  `json:"pangkat"`
	JenisPersonel    string  `json:"jenis_personel"`
	NamaSatker       string  `json:"nama_satker"`
	NamaPolda        string  `json:"nama_polda"`
	KodeSatker       string  `json:"kode_satker"`
	Gapok            float64 `json:"gapok"`
	TotalTunkin      float64 `json:"total_tunkin"`
	TotalGaji        float64 `json:"total_gaji"`
	TotalPenghasilan float64 `json:"total_penghasilan"`
	// Jabatan
	NamaJabatanJF    string  `json:"nama_jabatan_jf"`
	JenjangJF        string  `json:"jenjang_jf"`
	KelasJabatanJF   int     `json:"kelas_jabatan_jf"`
	AngkaKredit      float64 `json:"angka_kredit"`
	// Detail
	SisaCuti         int     `json:"sisa_cuti"`
	StatusKawin      string  `json:"status_kawin"`
}

// CreatePersonel membuat record personel baru langsung ke database
func (h *PersonelHandler) CreatePersonel(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req PersonelPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Format data tidak valid"})
		return
	}

	cleanNIP := strings.TrimSpace(req.NipNrp)
	if cleanNIP == "" || strings.TrimSpace(req.Nama) == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "NRP/NIP dan Nama wajib diisi"})
		return
	}

	jp := req.JenisPersonel
	if jp == "" {
		jp = "POLRI"
	}

	// Cek apakah NRP sudah ada
	var exists bool
	_ = h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM public.data_polri_september_2026 WHERE REPLACE(nip_nrp, '''', '') = $1)", cleanNIP).Scan(&exists)
	if exists {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "NRP/NIP sudah terdaftar di database. Silakan gunakan fitur Edit."})
		return
	}

	// 1. Simpan ke data_polri_september_2026
	_, err := h.db.Exec(`
		INSERT INTO public.data_polri_september_2026 (
			nip_nrp, nama, pangkat, jenis_personel, nama_satker, nama_polda, kode_satker,
			gapok, total_tunkin_yang_diterima, total_gaji_keseluruhan, jumlah_total_penghasilan, namabulan_periodegaji
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'SEPTEMBER 2026')
	`, cleanNIP, req.Nama, req.Pangkat, jp, req.NamaSatker, req.NamaPolda, req.KodeSatker, req.Gapok, req.TotalTunkin, req.TotalGaji, req.TotalPenghasilan)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Gagal menyimpan data ke database: " + err.Error()})
		return
	}

	// 2. Simpan Jabatan Fungsional
	if req.NamaJabatanJF != "" {
		_, _ = h.db.Exec("DELETE FROM public.dummy_jabatan_fungsional WHERE REPLACE(nip_nrp, '''', '') = $1", cleanNIP)
		_, _ = h.db.Exec(`
			INSERT INTO public.dummy_jabatan_fungsional (nip_nrp, nama_jabatan_jf, jenjang_jf, kelas_jabatan_jf, angka_kredit, tmt_jabatan_jf)
			VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
		`, cleanNIP, req.NamaJabatanJF, req.JenjangJF, req.KelasJabatanJF, req.AngkaKredit)
	}

	// 3. Simpan Personel Detail
	sisaCuti := req.SisaCuti
	if sisaCuti == 0 {
		sisaCuti = 12
	}
	_, _ = h.db.Exec("DELETE FROM public.dummy_personel_detail WHERE REPLACE(nip_nrp, '''', '') = $1", cleanNIP)
	_, _ = h.db.Exec(`
		INSERT INTO public.dummy_personel_detail (nip_nrp, sisa_cuti, status_kawin, tmt_dinas, tmt_pangkat_terakhir)
		VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE)
	`, cleanNIP, sisaCuti, req.StatusKawin)

	w.WriteHeader(http.StatusCreated)
	RecordAPILog("POST", "/api/personel", 201, 15, r.RemoteAddr, "TAMBAH_PERSONEL", fmt.Sprintf("Penambahan data baru NRP: %s, Nama: %s, Pangkat: %s", cleanNIP, req.Nama, req.Pangkat))
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Data personel dan jabatan berhasil ditambahkan ke database",
		"nip_nrp": cleanNIP,
	})
}

// UpdatePersonel memperbarui data personel & jabatan langsung ke database
func (h *PersonelHandler) UpdatePersonel(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	nipNrp := strings.Trim(vars["nip_nrp"], "'\" ")

	var req PersonelPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Format data tidak valid"})
		return
	}

	// 1. Update data_polri_september_2026
	_, err := h.db.Exec(`
		UPDATE public.data_polri_september_2026
		SET nama = $1, pangkat = $2, jenis_personel = $3, nama_satker = $4, nama_polda = $5,
		    gapok = $6, total_tunkin_yang_diterima = $7, total_gaji_keseluruhan = $8, jumlah_total_penghasilan = $9
		WHERE REPLACE(nip_nrp, '''', '') = $10
	`, req.Nama, req.Pangkat, req.JenisPersonel, req.NamaSatker, req.NamaPolda, req.Gapok, req.TotalTunkin, req.TotalGaji, req.TotalPenghasilan, nipNrp)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Gagal update data utama: " + err.Error()})
		return
	}

	// 2. Update / Insert dummy_jabatan_fungsional
	if req.NamaJabatanJF != "" {
		_, _ = h.db.Exec("DELETE FROM public.dummy_jabatan_fungsional WHERE REPLACE(nip_nrp, '''', '') = $1", nipNrp)
		_, _ = h.db.Exec(`
			INSERT INTO public.dummy_jabatan_fungsional (nip_nrp, nama_jabatan_jf, jenjang_jf, kelas_jabatan_jf, angka_kredit, tmt_jabatan_jf)
			VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
		`, nipNrp, req.NamaJabatanJF, req.JenjangJF, req.KelasJabatanJF, req.AngkaKredit)
	}

	// 3. Update / Insert dummy_personel_detail
	_, _ = h.db.Exec("DELETE FROM public.dummy_personel_detail WHERE REPLACE(nip_nrp, '''', '') = $1", nipNrp)
	_, _ = h.db.Exec(`
		INSERT INTO public.dummy_personel_detail (nip_nrp, sisa_cuti, status_kawin, tmt_dinas, tmt_pangkat_terakhir)
		VALUES ($1, $2, $3, CURRENT_DATE, CURRENT_DATE)
	`, nipNrp, req.SisaCuti, req.StatusKawin)

	RecordAPILog("PUT", "/api/personel/"+nipNrp, 200, 12, r.RemoteAddr, "UBAH_PERSONEL", fmt.Sprintf("Pembaruan data/jabatan NRP: %s (%s)", nipNrp, req.Nama))
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Data personel dan jabatan berhasil diperbarui di database",
	})
}

// DeletePersonel menghapus data personel dari database
func (h *PersonelHandler) DeletePersonel(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	vars := mux.Vars(r)
	nipNrp := strings.Trim(vars["nip_nrp"], "'\" ")

	_, err := h.db.Exec("DELETE FROM public.data_polri_september_2026 WHERE REPLACE(nip_nrp, '''', '') = $1", nipNrp)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Gagal menghapus data: " + err.Error()})
		return
	}

	_, _ = h.db.Exec("DELETE FROM public.dummy_jabatan_fungsional WHERE REPLACE(nip_nrp, '''', '') = $1", nipNrp)
	_, _ = h.db.Exec("DELETE FROM public.dummy_personel_detail WHERE REPLACE(nip_nrp, '''', '') = $1", nipNrp)
	_, _ = h.db.Exec("DELETE FROM public.dummy_riwayat_penugasan WHERE REPLACE(nip_nrp, '''', '') = $1", nipNrp)
	_, _ = h.db.Exec("DELETE FROM public.dummy_dokumen_validasi WHERE REPLACE(nip_nrp, '''', '') = $1", nipNrp)
	_, _ = h.db.Exec("DELETE FROM public.dummy_remunerasi_hash_chain WHERE REPLACE(nip_nrp, '''', '') = $1", nipNrp)

	RecordAPILog("DELETE", "/api/personel/"+nipNrp, 200, 10, r.RemoteAddr, "HAPUS_PERSONEL", fmt.Sprintf("Penghapusan data personel NRP: %s", nipNrp))
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Data personel berhasil dihapus dari database",
	})
}
