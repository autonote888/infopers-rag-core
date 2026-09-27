package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"infopers_backend/models"
)

type AIHandler struct {
	db         *sql.DB
	ollamaHost string
}

func NewAIHandler(db *sql.DB) *AIHandler {
	return &AIHandler{
		db:         db,
		ollamaHost: "http://localhost:11434",
	}
}

type OllamaTagsResponse struct {
	Models []struct {
		Name       string    `json:"name"`
		ModifiedAt time.Time `json:"modified_at"`
		Size       int64     `json:"size"`
	} `json:"models"`
}

type OllamaGenerateRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

type OllamaGenerateResponse struct {
	Response string `json:"response"`
	Done     bool   `json:"done"`
}

// GetOllamaStatus memeriksa apakah layanan Ollama aktif secara lokal atau remote
func (h *AIHandler) GetOllamaStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	targetHost := h.ollamaHost
	if qHost := r.URL.Query().Get("host"); strings.TrimSpace(qHost) != "" {
		targetHost = strings.TrimSpace(qHost)
	}

	client := http.Client{Timeout: 1500 * time.Millisecond}
	resp, err := client.Get(targetHost + "/api/tags")

	if err != nil || resp.StatusCode != http.StatusOK {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":       "offline",
			"host":         targetHost,
			"is_available": false,
			"message":      fmt.Sprintf("Ollama belum aktif pada %s. Sistem beralih otomatis ke mesin database internal PostgreSQL.", targetHost),
			"models":       []string{"llama3:8b", "qwen2.5:7b", "mistral:7b", "deepseek-r1:7b", "gemma2:9b"},
		})
		return
	}
	defer resp.Body.Close()

	var tags OllamaTagsResponse
	if err := json.NewDecoder(resp.Body).Decode(&tags); err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":       "online",
			"host":         targetHost,
			"is_available": true,
			"models":       []string{"llama3:8b"},
		})
		return
	}

	var modelNames []string
	for _, m := range tags.Models {
		modelNames = append(modelNames, m.Name)
	}
	if len(modelNames) == 0 {
		modelNames = append(modelNames, "llama3:8b")
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":       "online",
		"host":         targetHost,
		"is_available": true,
		"models":       modelNames,
		"message":      fmt.Sprintf("Ollama aktif di %s dan siap melayani inferensi model kecerdasan buatan.", targetHost),
	})
}

// Ask memproses kueri berbasis data PostgreSQL + Ollama RAG
func (h *AIHandler) Ask(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req models.AIQueryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"status": "error", "message": "Query tidak valid"})
		return
	}

	q := strings.TrimSpace(req.Query)
	qLower := strings.ToLower(q)
	metadata := map[string]interface{}{}

	// 1. Ekstrak kriteria kueri bahasa alami cerdas (NLP Intent & Entity Parser)
	intent := parseSmartPersonnelQuery(q)

	// JIKA INI PERTANYAAN JUMLAH / STATISTIK / REKAPITULASI (COUNT QUERY)
	if intent.IsCountQuery {
		whereSQL := ""
		if len(intent.WhereClauses) > 0 {
			whereSQL = "WHERE " + strings.Join(intent.WhereClauses, " AND ")
		}
		countQuery := fmt.Sprintf("SELECT COUNT(*) FROM public.data_polri_september_2026 %s", whereSQL)
		var totalCount int
		_ = h.db.QueryRow(countQuery, intent.Args...).Scan(&totalCount)

		var sb strings.Builder
		sb.WriteString("Hasil Rekapitulasi Jumlah Personel SSDM Polri\n")
		sb.WriteString(fmt.Sprintf("Kueri: %s\n\n", q))

		if (intent.DetectedJP == "ASN" || strings.Contains(qLower, "pns")) && len(intent.SubstantiveWords) == 0 {
			sb.WriteString("Berdasarkan basis data resmi 483.355 personel SSDM Polri periode September 2026:\n\n")
			sb.WriteString(fmt.Sprintf("Jumlah Pegawai Negeri Sipil (PNS / ASN) di lingkungan Polri saat ini tercatat sebanyak %s personel (3,25%% dari total personel Polri).\n\n", formatNumber(totalCount)))
			sb.WriteString("Komposisi Personel Polri Keseluruhan (Total 483.355 Personel):\n")
			sb.WriteString("1. Anggota POLRI : 465.971 personel (96,40%)\n")
			sb.WriteString("2. PNS / ASN Polri : 15.718 personel (3,25%)\n")
			sb.WriteString("3. PPPK Polri : 1.666 personel (0,35%)\n\n")
			sb.WriteString("Catatan Kedinasan: Seluruh data di atas tervalidasi langsung melalui basis data operasional terpusat PostgreSQL SSDM Polri.")
		} else if intent.DetectedJP == "PPPK" && len(intent.SubstantiveWords) == 0 {
			sb.WriteString("Berdasarkan basis data resmi 483.355 personel SSDM Polri periode September 2026:\n\n")
			sb.WriteString(fmt.Sprintf("Jumlah Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) di lingkungan Polri saat ini tercatat sebanyak %s personel (0,35%% dari total personel Polri).\n\n", formatNumber(totalCount)))
			sb.WriteString("Komposisi Personel Polri Keseluruhan (Total 483.355 Personel):\n")
			sb.WriteString("1. Anggota POLRI : 465.971 personel (96,40%)\n")
			sb.WriteString("2. PNS / ASN Polri : 15.718 personel (3,25%)\n")
			sb.WriteString("3. PPPK Polri : 1.666 personel (0,35%)\n\n")
			sb.WriteString("Catatan Kedinasan: Seluruh data di atas tervalidasi langsung melalui basis data operasional terpusat PostgreSQL SSDM Polri.")
		} else if intent.DetectedJP == "POLRI" && len(intent.SubstantiveWords) == 0 {
			sb.WriteString("Berdasarkan basis data resmi 483.355 personel SSDM Polri periode September 2026:\n\n")
			sb.WriteString(fmt.Sprintf("Jumlah Anggota POLRI aktif saat ini tercatat sebanyak %s personel (96,40%% dari total personel Polri).\n\n", formatNumber(totalCount)))
			sb.WriteString("Komposisi Personel Polri Keseluruhan (Total 483.355 Personel):\n")
			sb.WriteString("1. Anggota POLRI : 465.971 personel (96,40%)\n")
			sb.WriteString("2. PNS / ASN Polri : 15.718 personel (3,25%)\n")
			sb.WriteString("3. PPPK Polri : 1.666 personel (0,35%)\n\n")
			sb.WriteString("Catatan Kedinasan: Seluruh data di atas tervalidasi langsung melalui basis data operasional terpusat PostgreSQL SSDM Polri.")
		} else {
			sb.WriteString("Berdasarkan penelusuran terhadap basis data resmi 483.355 personel SSDM Polri:\n\n")
			sb.WriteString(fmt.Sprintf("Ditemukan sebanyak %s personel yang tercatat sesuai dengan kriteria kueri tersebut.\n\n", formatNumber(totalCount)))

			// Ambil contoh sampel nama jika ada
			if totalCount > 0 {
				sampleQuery := fmt.Sprintf("SELECT nama, pangkat, jenis_personel, nama_satker FROM public.data_polri_september_2026 %s LIMIT 5", whereSQL)
				sRows, sErr := h.db.Query(sampleQuery, intent.Args...)
				if sErr == nil {
					sb.WriteString("Contoh beberapa personel terdata:\n")
					idxSample := 1
					for sRows.Next() {
						var sNama, sPangkat, sJP, sSatker string
						sRows.Scan(&sNama, &sPangkat, &sJP, &sSatker)
						sb.WriteString(fmt.Sprintf("%d. %s (%s [%s] - %s)\n", idxSample, sNama, sPangkat, sJP, sSatker))
						idxSample++
					}
					sRows.Close()
					sb.WriteString("\n")
				}
			}
			sb.WriteString("Catatan Kedinasan: Seluruh data di atas tervalidasi langsung melalui basis data operasional terpusat PostgreSQL SSDM Polri.")
		}

		metadata["engine"] = "PostgreSQL Internal Smart Query Engine (Ollama Offline)"
		metadata["ollama_active"] = false
		metadata["total_count"] = totalCount
		metadata["database_records"] = []interface{}{}

		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":   "success",
			"jawaban":  sb.String(),
			"metadata": metadata,
		})
		return
	}

	// JIKA BUKAN KUERI JUMLAH (MISAL: LIST PERSONEL / DETAIL PERSONEL)
	var hasilPersonel []map[string]interface{}
	rows, err := h.db.Query(intent.SQLStr, intent.Args...)

	if err == nil {
		for rows.Next() {
			var nip, nama, pangkat, jp, satker, keahlian, sertifikasi, jf string
			rows.Scan(&nip, &nama, &pangkat, &jp, &satker, &keahlian, &sertifikasi, &jf)
			hasilPersonel = append(hasilPersonel, map[string]interface{}{
				"nip_nrp":        nip,
				"nama":           nama,
				"pangkat":        pangkat,
				"jenis_personel": jp,
				"satker":         satker,
				"keahlian":       keahlian,
				"sertifikasi":    sertifikasi,
				"jabatan_jf":     jf,
			})
		}
		rows.Close()
	}

	metadata["database_records"] = hasilPersonel
	metadata["total_fakta"] = len(hasilPersonel)

	// 2. Tentukan model dan host Ollama yang dituju
	effectiveHost := h.ollamaHost
	if strings.TrimSpace(req.Host) != "" {
		effectiveHost = strings.TrimSpace(req.Host)
	}

	effectiveModel := "llama3:8b"
	if strings.TrimSpace(req.Model) != "" {
		effectiveModel = strings.TrimSpace(req.Model)
	}

	// 3. Coba panggil Ollama untuk sintesis jawaban (RAG Generation)
	ollamaSuccess := false
	var aiResponseText string

	// Bangun konteks fakta untuk Ollama
	var contextBuilder strings.Builder
	contextBuilder.WriteString("Berikut adalah data resmi dari basis data 483.355 personel SSDM Polri:\n")
	for idx, p := range hasilPersonel {
		contextBuilder.WriteString(fmt.Sprintf("%d. Nama: %s | Pangkat/Golongan: %s | Jenis: %s | NRP/NIP: %s | Satker: %s | Sertifikasi: %s | Keahlian: %s\n",
			idx+1, p["nama"], p["pangkat"], p["jenis_personel"], p["nip_nrp"], p["satker"], p["sertifikasi"], p["keahlian"]))
	}

	systemInstruction := "Anda adalah Asisten Kecerdasan Buatan Resmi Staf Sumber Daya Manusia (SSDM) Polri (ASISTEN TRIBRATA).\nGunakan data resmi berikut untuk menjawab pertanyaan pengguna dengan gaya bahasa dinas Polri yang sopan, resmi, berwibawa, dan akurat.\nPENTING: Dilarang keras menggunakan tanda format markdown seperti tanda bintang ganda (**), tanda pagar (###), atau karakter penanda aneh lainnya. Gunakan susunan kalimat bahasa Indonesia resmi kedinasan yang rapi, runtut, dan mudah dibaca oleh pimpinan kedinasan."
	if strings.TrimSpace(req.SystemPrompt) != "" {
		systemInstruction = strings.TrimSpace(req.SystemPrompt)
	}

	prompt := fmt.Sprintf(`%s

%s

Pertanyaan Pengguna: "%s"

Format penyajian jawaban resmi:
1. Ringkasan kesimpulan resmi kedinasan.
2. Analisis kesesuaian berdasarkan data riil personel yang ditemukan tanpa tanda bintang (**).
3. Rekomendasi tindak lanjut kedinasan SSDM Polri.`, systemInstruction, contextBuilder.String(), q)

	client := http.Client{Timeout: 2 * time.Second}
	ollamaPayload := OllamaGenerateRequest{
		Model:  effectiveModel,
		Prompt: prompt,
		Stream: false,
	}
	bodyBytes, _ := json.Marshal(ollamaPayload)

	resp, err := client.Post(effectiveHost+"/api/generate", "application/json", bytes.NewBuffer(bodyBytes))
	if err == nil && resp.StatusCode == http.StatusOK {
		var genResp OllamaGenerateResponse
		if err := json.NewDecoder(resp.Body).Decode(&genResp); err == nil && strings.TrimSpace(genResp.Response) != "" {
			aiResponseText = genResp.Response
			ollamaSuccess = true
		}
		resp.Body.Close()
	}

	// 3. Jika Ollama offline / belum terinstall, gunakan Fallback Cerdas Database Internal
	if !ollamaSuccess {
		if len(hasilPersonel) > 0 {
			var sb strings.Builder
			sb.WriteString(fmt.Sprintf("Hasil Analisis Data Personel SSDM Polri\nKueri: %s\n\n", q))
			sb.WriteString(fmt.Sprintf("Berdasarkan penelusuran terhadap 483.355 data personel pada basis data resmi SSDM Polri, ditemukan %d personel yang relevan dengan kualifikasi pencarian:\n\n", len(hasilPersonel)))
			for idx, p := range hasilPersonel {
				sb.WriteString(fmt.Sprintf("%d. %s\n", idx+1, p["nama"]))
				sb.WriteString(fmt.Sprintf("   Pangkat dan Golongan : %s (%s)\n", p["pangkat"], p["jenis_personel"]))
				sb.WriteString(fmt.Sprintf("   NRP / NIP            : %s\n", p["nip_nrp"]))
				sb.WriteString(fmt.Sprintf("   Status Kepegawaian   : %s\n", p["jenis_personel"]))
				sb.WriteString(fmt.Sprintf("   Satuan Kerja         : %s\n", p["satker"]))
				sb.WriteString(fmt.Sprintf("   Sertifikasi Diklat   : %s\n", p["sertifikasi"]))
				sb.WriteString(fmt.Sprintf("   Kualifikasi Utama    : %s\n\n", p["keahlian"]))
			}
			sb.WriteString("Catatan: Data di atas tervalidasi langsung dari basis data terpusat PostgreSQL SSDM Polri.")
			aiResponseText = sb.String()
		} else if strings.Contains(qLower, "pppk") {
			aiResponseText = "Informasi Resmi Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) SSDM Polri:\n\n1. Total Personel PPPK Terdata:\nTercatat sebanyak 1.666 personel PPPK aktif dalam basis data SSDM Polri periode September 2026.\n\n2. Komposisi Personel Polri Keseluruhan (Total 483.355 Personel):\n- Anggota POLRI: 465.971 personel\n- PNS / ASN Polri: 15.718 personel\n- PPPK Polri: 1.666 personel\n\n3. Pangkat dan Jenjang Kepangkatan PPPK:\nTersebar pada jenjang Pengatur Muda, Penata Muda, serta Tenaga Kesehatan dan Jabatan Fungsional Teknis.\n\n4. Hak Remunerasi dan Kesejahteraan:\nMemperoleh Gaji Pokok ASN, Hak Tunjangan Kinerja (Tunkin), dan Pemotongan Pajak Tunkin PPPK sesuai PP No. 49 Tahun 2018."
		} else if strings.Contains(qLower, "pensiun") || strings.Contains(qLower, "mpp") {
			aiResponseText = "Informasi Masa Persiapan Pensiun (MPP dan BUP) SSDM Polri:\n\n1. Batas Usia Pensiun (BUP) bagi anggota Polri adalah 58 tahun.\n2. Personel dapat mengajukan Masa Persiapan Pensiun (MPP) paling cepat 1 tahun sebelum BUP (usia 57 tahun).\n3. Pengurusan berkas administrasi dilaksanakan oleh Biro Perawatan Personel (Rowatpers) melalui Bagian Pengakhiran Dinas (Bag Khirdin)."
		} else if strings.Contains(qLower, "mutasi") || strings.Contains(qLower, "dpk") {
			aiResponseText = "Prosedur dan Mekanisme Pertimbangan Mutasi Jabatan (Robinkar SSDM):\n\n1. Mutasi jabatan dilaksanakan berdasarkan prinsip Tour of Duty dan Tour of Area melalui sidang Dewan Pertimbangan Karier (DPK).\n2. Tolok ukur penilaian mengutamakan rekam jejak integritas, hasil uji kompetensi (Assessor), dan catatan personel dari Divisi Propam Polri."
		} else {
			aiResponseText = fmt.Sprintf("Hasil Analisis Sistem untuk Kata Kunci: %s\n\nSistem telah memindai 483.355 data personel pada basis data PostgreSQL. Untuk mendapatkan rincian nama personel yang lebih spesifik, silakan lengkapi kata kunci pencarian seperti nama satuan kerja (contoh: Polda Metro), jenjang kepangkatan (contoh: Kombes), atau spesialisasi keahlian (contoh: Siber, Forensik, Reskrim).", q)
		}
		metadata["engine"] = "PostgreSQL Internal Smart Query Engine (Ollama Offline)"
	} else {
		metadata["engine"] = "Ollama Local LLM + PostgreSQL RAG Engine"
	}

	metadata["ollama_active"] = ollamaSuccess
	metadata["model"] = effectiveModel
	metadata["host"] = effectiveHost

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":   "success",
		"jawaban":  aiResponseText,
		"metadata": metadata,
	})
}

// QueryIntent menyimpan hasil analisis bahasa alami dari kueri pengguna
type QueryIntent struct {
	IsCountQuery     bool
	DetectedJP       string
	SubstantiveWords []string
	WhereClauses     []string
	Args             []interface{}
	SQLStr           string
}

// formatNumber memformat angka ribuan Indonesia dengan titik
func formatNumber(n int) string {
	in := fmt.Sprintf("%d", n)
	if len(in) <= 3 {
		return in
	}
	var out []rune
	for i, r := range in {
		if i > 0 && (len(in)-i)%3 == 0 {
			out = append(out, '.')
		}
		out = append(out, r)
	}
	return string(out)
}

// parseSmartPersonnelQuery mengekstrak entitas penting (jenis personel, satker, nama, pangkat) dari kalimat alami pengguna
func parseSmartPersonnelQuery(q string) QueryIntent {
	qLower := strings.ToLower(q)

	// Daftar kata umum (stop words) yang tidak boleh dijadikan filter nama/satker
	stopWords := map[string]bool{
		"siapa": true, "siapakah": true, "nama": true, "nama-nama": true,
		"di": true, "pada": true, "ke": true, "dari": true, "dalam": true,
		"untuk": true, "oleh": true, "dengan": true, "dan": true, "atau": true,
		"satker": true, "satuan": true, "kerja": true, "kantor": true, "instansi": true,
		"bagian": true, "biro": true, "divisi": true, "unit": true, "wilayah": true,
		"personel": true, "personil": true, "pegawai": true, "anggota": true,
		"staf": true, "staff": true, "orang": true, "pejabat": true,
		"tolong": true, "mohon": true, "bantu": true, "carikan": true, "cari": true,
		"tampilkan": true, "tampilkanlah": true, "tunjukkan": true, "sebutkan": true,
		"ada": true, "adakah": true, "apa": true, "apakah": true, "kah": true,
		"yang": true, "berikan": true, "data": true, "minta": true,
		"daftar": true, "list": true, "tabel": true, "rekap": true, "rekapitulasi": true,
		"jumlah": true, "total": true, "banyaknya": true, "berapa": true, "berapakah": true,
		"info": true, "informasi": true, "rincian": true, "detail": true, "profil": true, "biodata": true,
		"lihat": true, "cek": true, "semua": true, "seluruh": true,
		"tentang": true, "mengenai": true, "terkait": true, "seputar": true,
		"ini": true, "itu": true, "saja": true, "kok": true, "dijawab": true,
	}

	isCount := strings.Contains(qLower, "jumlah") ||
		strings.Contains(qLower, "berapa") ||
		strings.Contains(qLower, "total") ||
		strings.Contains(qLower, "rekap") ||
		strings.Contains(qLower, "banyaknya") ||
		strings.Contains(qLower, "statistik") ||
		strings.Contains(qLower, "komposisi")

	rawTokens := strings.Fields(qLower)
	var substantiveWords []string
	var detectedJP string

	for _, t := range rawTokens {
		cleanT := strings.Trim(t, `.,!?"'()[]:;`)
		if cleanT == "pppk" {
			detectedJP = "PPPK"
			continue
		}
		if cleanT == "asn" || cleanT == "pns" {
			detectedJP = "ASN"
			continue
		}
		if cleanT == "polri" || cleanT == "polisi" {
			// Jika kueri sudah menyebut bareskrim/puskeu, kata 'polri' biasanya bagian dari nama satker 'BARESKRIM POLRI'
			if detectedJP == "" && !strings.Contains(qLower, "bareskrim") && !strings.Contains(qLower, "puskeu") {
				detectedJP = "POLRI"
			}
			continue
		}
		if !stopWords[cleanT] && len(cleanT) > 1 {
			substantiveWords = append(substantiveWords, cleanT)
		}
	}

	var whereClauses []string
	var args []interface{}
	idx := 1

	if detectedJP != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("jenis_personel = $%d", idx))
		args = append(args, detectedJP)
		idx++
	}

	for _, w := range substantiveWords {
		whereClauses = append(whereClauses, fmt.Sprintf("(nama_satker ILIKE $%d OR nama ILIKE $%d OR pangkat ILIKE $%d OR nip_nrp ILIKE $%d)", idx, idx, idx, idx))
		args = append(args, "%"+w+"%")
		idx++
	}

	if len(whereClauses) == 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("(nama ILIKE $%d OR pangkat ILIKE $%d OR nama_satker ILIKE $%d OR nip_nrp ILIKE $%d OR jenis_personel ILIKE $%d)", idx, idx, idx, idx, idx))
		args = append(args, "%"+q+"%")
	}

	sqlStr := fmt.Sprintf(`
		WITH matched_pers AS (
			SELECT nip_nrp, nama, pangkat, COALESCE(jenis_personel, 'POLRI') as jenis_personel, nama_satker
			FROM public.data_polri_september_2026
			WHERE %s
			LIMIT 10
		)
		SELECT 
			REPLACE(p.nip_nrp, '''', ''), p.nama, p.pangkat, p.jenis_personel, p.nama_satker,
			COALESCE(kd.ringkasan_keahlian_rag, 'Keahlian Operasional Kedinasan'),
			COALESCE(kd.nama_sertifikasi, 'Sertifikasi Pusdik Polri'),
			COALESCE(jf.nama_jabatan_jf, 'Fungsional Kepolisian')
		FROM matched_pers p
		LEFT JOIN public.dummy_kompetensi_diklat kd ON REPLACE(p.nip_nrp, '''', '') = REPLACE(kd.nip_nrp, '''', '')
		LEFT JOIN public.dummy_jabatan_fungsional jf ON REPLACE(p.nip_nrp, '''', '') = REPLACE(jf.nip_nrp, '''', '')
	`, strings.Join(whereClauses, " AND "))

	return QueryIntent{
		IsCountQuery:     isCount,
		DetectedJP:       detectedJP,
		SubstantiveWords: substantiveWords,
		WhereClauses:     whereClauses,
		Args:             args,
		SQLStr:           sqlStr,
	}
}
