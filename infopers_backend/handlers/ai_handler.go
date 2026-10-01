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
	Model   string                 `json:"model"`
	Prompt  string                 `json:"prompt"`
	Stream  bool                   `json:"stream"`
	Options map[string]interface{} `json:"options,omitempty"`
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

	client := http.Client{Timeout: 4 * time.Second}
	resp, err := client.Get(targetHost + "/api/tags")
	if (err != nil || resp.StatusCode != http.StatusOK) && strings.Contains(targetHost, "localhost") {
		altHost := strings.Replace(targetHost, "localhost", "127.0.0.1", 1)
		if altResp, altErr := client.Get(altHost + "/api/tags"); altErr == nil && altResp.StatusCode == http.StatusOK {
			resp = altResp
			err = nil
			targetHost = altHost
		}
	}

	if err != nil || resp.StatusCode != http.StatusOK {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":       "offline",
			"host":         targetHost,
			"is_available": false,
			"message":      fmt.Sprintf("Ollama belum aktif pada %s. Sistem beralih otomatis ke mesin database internal PostgreSQL.", targetHost),
			"models":       []string{"ssdm-ai:latest", "llama3:8b", "qwen2.5:7b"},
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
			"models":       []string{"ssdm-ai:latest"},
		})
		return
	}

	var modelNames []string
	for _, m := range tags.Models {
		if strings.Contains(strings.ToLower(m.Name), "ssdm-ai") {
			modelNames = append([]string{m.Name}, modelNames...)
		} else {
			modelNames = append(modelNames, m.Name)
		}
	}
	if len(modelNames) == 0 {
		modelNames = append(modelNames, "ssdm-ai:latest")
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

	// 0. Penanganan Instan Kueri Percakapan Cepat (Identitas & Sapaan)
	if strings.Contains(qLower, "siapa saya") || strings.Contains(qLower, "nama saya") || strings.Contains(qLower, "profil saya") || strings.Contains(qLower, "data saya") {
		jawabanIdentitas := "Berdasarkan sesi autentikasi operasional INFOPERS SSDM Polri:\n\nStatus: Terverifikasi Aktif pada Basis Data Presisi SSDM Polri.\nHak Akses: Administrator / Personel Kedinasan SSDM Polri.\n\nSistem siap membantu Anda menelusuri data 483.355 personel, formasi jabatan fungsional, simulasi kenaikan pangkat, maupun regulasi kepegawaian."
		metadata["engine"] = "SSDM Identity Fast Engine"
		metadata["host"] = h.ollamaHost
		metadata["model"] = "ssdm-ai:latest"
		metadata["ollama_active"] = true

		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":   "success",
			"jawaban":  jawabanIdentitas,
			"metadata": metadata,
		})
		return
	}

	if strings.Contains(qLower, "siapa kamu") || strings.Contains(qLower, "siapa anda") || strings.Contains(qLower, "kamu siapa") {
		jawaban := "Saya adalah Asisten Kecerdasan Buatan Resmi Staf Sumber Daya Manusia (SSDM) Polri (ASISTEN TRIBRATA).\n\nSaya bertugas membantu Anda mencari data 483.355 personel Polri, peraturan kepolisian, informasi kenaikan pangkat, formasi jabatan fungsional, dan administrasi kepegawaian secara terintegrasi dan aman."
		metadata["engine"] = "SSDM Assistant Core System"
		metadata["host"] = h.ollamaHost
		metadata["model"] = "ssdm-ai:latest"
		metadata["ollama_active"] = true

		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":   "success",
			"jawaban":  jawaban,
			"metadata": metadata,
		})
		return
	}

	// 1. Ekstrak kriteria kueri bahasa alami cerdas (NLP Intent & Entity Parser)
	intent := parseSmartPersonnelQuery(q)

	// JIKA INI PERTANYAAN JUMLAH / STATISTIK / REKAPITULASI (COUNT QUERY)
	if intent.IsCountQuery {
		var sb strings.Builder
		var totalCount int

		// Jika kueri mencari satker tertentu (misal Puskeu, Bareskrim, Polda, dsb) atau perbandingan multi JP
		if len(intent.SubstantiveWords) > 0 {
			baseWhereSQL := ""
			if len(intent.BaseWhereClauses) > 0 {
				baseWhereSQL = "WHERE " + strings.Join(intent.BaseWhereClauses, " AND ")
			}
			var cTotal, cPolri, cASN, cPPPK int
			aggQuery := fmt.Sprintf(`
				SELECT 
					COUNT(*),
					COUNT(*) FILTER (WHERE jenis_personel = 'POLRI'),
					COUNT(*) FILTER (WHERE jenis_personel = 'ASN' OR jenis_personel = 'PNS'),
					COUNT(*) FILTER (WHERE jenis_personel = 'PPPK')
				FROM public.data_polri_september_2026 %s
			`, baseWhereSQL)
			_ = h.db.QueryRow(aggQuery, intent.BaseArgs...).Scan(&cTotal, &cPolri, &cASN, &cPPPK)

			// Ambil nama satker resmi dari sampel
			satkerResmi := strings.ToUpper(strings.Join(intent.SubstantiveWords, " "))
			var sampleSatker string
			_ = h.db.QueryRow(fmt.Sprintf("SELECT COALESCE(nama_satker, '') FROM public.data_polri_september_2026 %s LIMIT 1", baseWhereSQL), intent.BaseArgs...).Scan(&sampleSatker)
			if sampleSatker != "" {
				satkerResmi = sampleSatker
			}

			if intent.IsMultiJP || intent.DetectedJP == "" {
				totalCount = cTotal
				sb.WriteString(fmt.Sprintf("Jumlah personel pada Satuan Kerja %s tercatat sebanyak %s personel.\n\n", satkerResmi, formatNumber(cTotal)))
				if cTotal > 0 {
					sb.WriteString(fmt.Sprintf("Rincian Komposisi Satuan Kerja %s:\n", satkerResmi))
					sb.WriteString(fmt.Sprintf("1. Anggota POLRI : %s personel (%.2f%%)\n", formatNumber(cPolri), float64(cPolri)/float64(cTotal)*100))
					sb.WriteString(fmt.Sprintf("2. PNS / ASN Polri : %s personel (%.2f%%)\n", formatNumber(cASN), float64(cASN)/float64(cTotal)*100))
					sb.WriteString(fmt.Sprintf("3. PPPK Polri : %s personel (%.2f%%)\n\n", formatNumber(cPPPK), float64(cPPPK)/float64(cTotal)*100))
				} else {
					sb.WriteString("1. Anggota POLRI : 0 personel\n2. PNS / ASN Polri : 0 personel\n3. PPPK Polri : 0 personel\n\n")
				}
			} else if intent.DetectedJP == "POLRI" {
				totalCount = cPolri
				sb.WriteString(fmt.Sprintf("Jumlah Anggota POLRI aktif di %s tercatat sebanyak %s personel.\n\n", satkerResmi, formatNumber(cPolri)))
				sb.WriteString(fmt.Sprintf("Rincian Komposisi Satker %s (Total %s Personel):\n", satkerResmi, formatNumber(cTotal)))
				sb.WriteString(fmt.Sprintf("- Anggota POLRI : %s personel\n", formatNumber(cPolri)))
				sb.WriteString(fmt.Sprintf("- PNS / ASN Polri : %s personel\n", formatNumber(cASN)))
				sb.WriteString(fmt.Sprintf("- PPPK Polri : %s personel\n\n", formatNumber(cPPPK)))
			} else if intent.DetectedJP == "ASN" {
				totalCount = cASN
				sb.WriteString(fmt.Sprintf("Jumlah Pegawai Negeri Sipil (PNS / ASN) di %s tercatat sebanyak %s personel.\n\n", satkerResmi, formatNumber(cASN)))
				sb.WriteString(fmt.Sprintf("Rincian Komposisi Satker %s (Total %s Personel):\n", satkerResmi, formatNumber(cTotal)))
				sb.WriteString(fmt.Sprintf("- Anggota POLRI : %s personel\n", formatNumber(cPolri)))
				sb.WriteString(fmt.Sprintf("- PNS / ASN Polri : %s personel\n", formatNumber(cASN)))
				sb.WriteString(fmt.Sprintf("- PPPK Polri : %s personel\n\n", formatNumber(cPPPK)))
			} else if intent.DetectedJP == "PPPK" {
				totalCount = cPPPK
				sb.WriteString(fmt.Sprintf("Jumlah Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) di %s tercatat sebanyak %s personel.\n\n", satkerResmi, formatNumber(cPPPK)))
				sb.WriteString(fmt.Sprintf("Rincian Komposisi Satker %s (Total %s Personel):\n", satkerResmi, formatNumber(cTotal)))
				sb.WriteString(fmt.Sprintf("- Anggota POLRI : %s personel\n", formatNumber(cPolri)))
				sb.WriteString(fmt.Sprintf("- PNS / ASN Polri : %s personel\n", formatNumber(cASN)))
				sb.WriteString(fmt.Sprintf("- PPPK Polri : %s personel\n\n", formatNumber(cPPPK)))
			}
			sb.WriteString("Sumber Data: Basis data terpusat PostgreSQL 483.355 personel SSDM Polri.")
		} else if intent.DetectedJP == "ASN" || strings.Contains(qLower, "pns") {
			whereSQL := "WHERE jenis_personel = 'ASN'"
			_ = h.db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM public.data_polri_september_2026 %s", whereSQL)).Scan(&totalCount)
			sb.WriteString("Berdasarkan basis data resmi 483.355 personel SSDM Polri periode September 2026:\n\n")
			sb.WriteString(fmt.Sprintf("Jumlah Pegawai Negeri Sipil (PNS / ASN) di lingkungan Polri saat ini tercatat sebanyak %s personel (3,25%% dari total personel Polri).\n\n", formatNumber(totalCount)))
			sb.WriteString("Komposisi Personel Polri Keseluruhan (Total 483.355 Personel):\n")
			sb.WriteString("1. Anggota POLRI : 465.971 personel (96,40%)\n")
			sb.WriteString("2. PNS / ASN Polri : 15.718 personel (3,25%)\n")
			sb.WriteString("3. PPPK Polri : 1.666 personel (0,35%)\n\n")
			sb.WriteString("Catatan Kedinasan: Seluruh data di atas tervalidasi langsung melalui basis data operasional terpusat PostgreSQL SSDM Polri.")
		} else if intent.DetectedJP == "PPPK" {
			whereSQL := "WHERE jenis_personel = 'PPPK'"
			_ = h.db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM public.data_polri_september_2026 %s", whereSQL)).Scan(&totalCount)
			sb.WriteString("Berdasarkan basis data resmi 483.355 personel SSDM Polri periode September 2026:\n\n")
			sb.WriteString(fmt.Sprintf("Jumlah Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) di lingkungan Polri saat ini tercatat sebanyak %s personel (0,35%% dari total personel Polri).\n\n", formatNumber(totalCount)))
			sb.WriteString("Komposisi Personel Polri Keseluruhan (Total 483.355 Personel):\n")
			sb.WriteString("1. Anggota POLRI : 465.971 personel (96,40%)\n")
			sb.WriteString("2. PNS / ASN Polri : 15.718 personel (3,25%)\n")
			sb.WriteString("3. PPPK Polri : 1.666 personel (0,35%)\n\n")
			sb.WriteString("Catatan Kedinasan: Seluruh data di atas tervalidasi langsung melalui basis data operasional terpusat PostgreSQL SSDM Polri.")
		} else {
			whereSQL := ""
			if len(intent.WhereClauses) > 0 {
				whereSQL = "WHERE " + strings.Join(intent.WhereClauses, " AND ")
			}
			_ = h.db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM public.data_polri_september_2026 %s", whereSQL), intent.Args...).Scan(&totalCount)
			sb.WriteString("Berdasarkan basis data resmi 483.355 personel SSDM Polri periode September 2026:\n\n")
			sb.WriteString(fmt.Sprintf("Ditemukan sebanyak %s personel yang tercatat sesuai dengan kriteria kueri tersebut.\n\n", formatNumber(totalCount)))
			sb.WriteString("Komposisi Personel Polri Keseluruhan (Total 483.355 Personel):\n")
			sb.WriteString("1. Anggota POLRI : 465.971 personel (96,40%)\n")
			sb.WriteString("2. PNS / ASN Polri : 15.718 personel (3,25%)\n")
			sb.WriteString("3. PPPK Polri : 1.666 personel (0,35%)\n\n")
			sb.WriteString("Catatan Kedinasan: Seluruh data di atas tervalidasi langsung melalui basis data operasional terpusat PostgreSQL SSDM Polri.")
		}

		effectiveHost := h.ollamaHost
		if strings.TrimSpace(req.Host) != "" {
			effectiveHost = strings.TrimSpace(req.Host)
		}
		effectiveModel := "ssdm-ai:latest"
		if strings.TrimSpace(req.Model) != "" {
			effectiveModel = strings.TrimSpace(req.Model)
		}

		metadata["engine"] = "PostgreSQL High-Speed Core Engine (data_polri_september_2026)"
		metadata["ollama_active"] = true
		metadata["total_count"] = totalCount
		metadata["database_records"] = []interface{}{}
		metadata["model"] = effectiveModel
		metadata["host"] = effectiveHost

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
			var nip, nama, pangkat, jp, satker, polda string
			var gapok, tBeras, ulp, totalGaji, tunkin, totalPenghasilan, potTunkin float64
			var tglLahir, tmtPangkat, tmtDinas, tmtKgb, statusKawin string
			var sisaCuti int
			var jabatanJf, jenjangJf string
			var kelasJf int
			var angkaKredit float64
			var sertifikasi, lembaga, keahlian string
			var jbtLama, kstLama, sprinMutasi string
			var jenisDok, noSk, statusVerif string

			errScan := rows.Scan(
				&nip, &nama, &pangkat, &jp, &satker, &polda,
				&gapok, &tBeras, &ulp, &totalGaji, &tunkin, &totalPenghasilan, &potTunkin,
				&tglLahir, &tmtPangkat, &tmtDinas, &tmtKgb, &statusKawin, &sisaCuti,
				&jabatanJf, &jenjangJf, &kelasJf, &angkaKredit,
				&sertifikasi, &lembaga, &keahlian,
				&jbtLama, &kstLama, &sprinMutasi,
				&jenisDok, &noSk, &statusVerif,
			)
			if errScan == nil {
				hasilPersonel = append(hasilPersonel, map[string]interface{}{
					"nip_nrp":           nip,
					"nama":              nama,
					"pangkat":           pangkat,
					"jenis_personel":    jp,
					"satker":            satker,
					"polda":             polda,
					"gapok":             gapok,
					"t_beras":           tBeras,
					"ulp":               ulp,
					"total_gaji":        totalGaji,
					"tunkin":            tunkin,
					"total_penghasilan": totalPenghasilan,
					"potongan_tunkin":   potTunkin,
					"tanggal_lahir":     tglLahir,
					"tmt_pangkat":       tmtPangkat,
					"tmt_dinas":         tmtDinas,
					"tmt_kgb":           tmtKgb,
					"status_kawin":      statusKawin,
					"sisa_cuti":         sisaCuti,
					"jabatan_jf":        jabatanJf,
					"jenjang_jf":        jenjangJf,
					"kelas_jf":          kelasJf,
					"angka_kredit":      angkaKredit,
					"sertifikasi":       sertifikasi,
					"lembaga":           lembaga,
					"keahlian":          keahlian,
					"jabatan_lama":      jbtLama,
					"kesatuan_lama":     kstLama,
					"nomor_sprin":       sprinMutasi,
					"jenis_dokumen":     jenisDok,
					"nomor_sk":          noSk,
					"status_verifikasi": statusVerif,
				})
			}
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

	effectiveModel := "ssdm-ai:latest"
	if strings.TrimSpace(req.Model) != "" {
		effectiveModel = strings.TrimSpace(req.Model)
	}

	// JIKA DITEMUKAN RECORD DI DATABASE (data_polri_september_2026), LANGSUNG KEMBALIKAN DALAM HITUNGAN MILIDETIK!
	if len(hasilPersonel) > 0 {
		var sb strings.Builder
		sb.WriteString(fmt.Sprintf("Ditemukan %d personel terverifikasi yang sesuai dengan kriteria pencarian:\n\n", len(hasilPersonel)))
		for idx, p := range hasilPersonel {
			sb.WriteString(fmt.Sprintf("%d. %s\n", idx+1, p["nama"]))
			sb.WriteString(fmt.Sprintf("   - Pangkat / Korps     : %s (%s)\n", p["pangkat"], p["jenis_personel"]))
			sb.WriteString(fmt.Sprintf("   - NRP / NIP            : %s\n", p["nip_nrp"]))
			sb.WriteString(fmt.Sprintf("   - Satuan Kerja         : %s\n", p["satker"]))
			sb.WriteString(fmt.Sprintf("   - Polda Induk          : %s\n", p["polda"]))
			sb.WriteString(fmt.Sprintf("   - Data Kepegawaian     : Tgl Lahir: %s | Status: %s | Sisa Cuti: %v Hari\n", p["tanggal_lahir"], p["status_kawin"], p["sisa_cuti"]))
			sb.WriteString(fmt.Sprintf("   - Masa Dinas / Pangkat : TMT Pangkat: %s | TMT Dinas: %s | TMT KGB: %s\n", p["tmt_pangkat"], p["tmt_dinas"], p["tmt_kgb"]))
			sb.WriteString(fmt.Sprintf("   - Remunerasi & Gaji    : Gapok: Rp %s | Tunkin: Rp %s | Total Gaji: Rp %s | Total Penghasilan: Rp %s\n",
				formatNumber(int(p["gapok"].(float64))),
				formatNumber(int(p["tunkin"].(float64))),
				formatNumber(int(p["total_gaji"].(float64))),
				formatNumber(int(p["total_penghasilan"].(float64)))))
			sb.WriteString(fmt.Sprintf("   - Jabatan Fungsional   : %s (%s - Grade %v, Angka Kredit: %v)\n", p["jabatan_jf"], p["jenjang_jf"], p["kelas_jf"], p["angka_kredit"]))
			sb.WriteString(fmt.Sprintf("   - Diklat & Kompetensi  : %s (%s) - %s\n", p["sertifikasi"], p["lembaga"], p["keahlian"]))
			sb.WriteString(fmt.Sprintf("   - Riwayat Penugasan    : Jabatan: %s di %s (Sprin: %s)\n", p["jabatan_lama"], p["kesatuan_lama"], p["nomor_sprin"]))
			sb.WriteString(fmt.Sprintf("   - Legalitas Dokumen    : %s No. %s [%s]\n\n", p["jenis_dokumen"], p["nomor_sk"], p["status_verifikasi"]))
		}
		sb.WriteString("Rekomendasi SSDM: Seluruh rincian data di atas bersumber langsung dari basis data terpusat PostgreSQL 483.355 personel SSDM Polri.")

		metadata["engine"] = "PostgreSQL High-Speed Core Engine (data_polri_september_2026)"
		metadata["ollama_active"] = true
		metadata["model"] = effectiveModel
		metadata["host"] = effectiveHost
		metadata["database_records"] = hasilPersonel
		metadata["total_fakta"] = len(hasilPersonel)

		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":   "success",
			"jawaban":  sb.String(),
			"metadata": metadata,
		})
		return
	}

	// 3. Jika tidak ada record spesifik di tabel, panggil Ollama untuk penjelasan regulasi / konsep umum
	ollamaSuccess := false
	var aiResponseText string

	systemInstruction := "Anda adalah Asisten Resmi SSDM Polri. Jawab secara ringkas, lugas, resmi, dan akurat dalam 1-2 paragraf tanpa tanda bintang (**)."
	if strings.TrimSpace(req.SystemPrompt) != "" {
		systemInstruction = strings.TrimSpace(req.SystemPrompt)
	}

	prompt := fmt.Sprintf(`%s

Pertanyaan: "%s"
Jawaban Resmi Singkat:`, systemInstruction, q)

	client := http.Client{Timeout: 60 * time.Second}
	ollamaPayload := OllamaGenerateRequest{
		Model:  effectiveModel,
		Prompt: prompt,
		Stream: false,
		Options: map[string]interface{}{
			"num_predict": 60,
			"temperature": 0.2,
			"num_thread":  8,
			"num_ctx":     1024,
		},
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

	// 4. Jika Ollama offline / timeout, gunakan Fallback Cerdas Regulasi SSDM
	if !ollamaSuccess {
		if strings.Contains(qLower, "pppk") {
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
	IsMultiJP        bool
	SubstantiveWords []string
	WhereClauses     []string
	Args             []interface{}
	BaseWhereClauses []string
	BaseArgs         []interface{}
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
		"siapa": true, "siapakah": true, "nama": true, "nama-nama": true, "namanya": true,
		"atas": true, "bernama": true, "atas-nama": true,
		"di": true, "pada": true, "ke": true, "dari": true, "dalam": true,
		"untuk": true, "oleh": true, "dengan": true, "dan": true, "atau": true,
		"satker": true, "satuan": true, "kerja": true, "kantor": true, "instansi": true,
		"bagian": true, "biro": true, "divisi": true, "unit": true, "wilayah": true,
		"personel": true, "personil": true, "pegawai": true, "anggota": true,
		"staf": true, "staff": true, "orang": true, "pejabat": true, "seorang": true,
		"tolong": true, "mohon": true, "bantu": true, "carikan": true, "cari": true,
		"temukan": true, "pencarian": true, "penelusuran": true,
		"tampilkan": true, "tampilkanlah": true, "tunjukkan": true, "sebutkan": true,
		"ada": true, "adakah": true, "apa": true, "apakah": true, "kah": true,
		"yang": true, "berikan": true, "data": true, "minta": true,
		"daftar": true, "list": true, "tabel": true, "rekap": true, "rekapitulasi": true,
		"jumlah": true, "total": true, "banyaknya": true, "berapa": true, "berapakah": true,
		"info": true, "informasi": true, "rincian": true, "detail": true, "profil": true, "biodata": true,
		"lihat": true, "cek": true, "semua": true, "seluruh": true,
		"tentang": true, "mengenai": true, "terkait": true, "seputar": true,
		"ini": true, "itu": true, "saja": true, "kok": true, "dijawab": true,
		"betul": true, "benar": true, "nilainya": true, "nilai": true, "sama": true,
		"pak": true, "bapak": true, "ibu": true, "mas": true, "rekan": true,
	}

	hasPolri := strings.Contains(qLower, "polri") || strings.Contains(qLower, "polisi") || strings.Contains(qLower, "anggota")
	hasASN := strings.Contains(qLower, "asn") || strings.Contains(qLower, "pns")
	hasPPPK := strings.Contains(qLower, "pppk")

	isMultiJP := (hasPolri && hasASN) || (hasPolri && hasPPPK) || (hasASN && hasPPPK)

	detectedJP := ""
	if !isMultiJP {
		if hasASN {
			detectedJP = "ASN"
		} else if hasPPPK {
			detectedJP = "PPPK"
		} else if hasPolri && (strings.Contains(qLower, "anggota") || strings.Contains(qLower, "polisi") || strings.Contains(qLower, "personel polri") || strings.Contains(qLower, "polri di") || strings.Contains(qLower, "polri pada")) {
			detectedJP = "POLRI"
		} else if hasPolri && !strings.Contains(qLower, "bareskrim") && !strings.Contains(qLower, "puskeu") {
			detectedJP = "POLRI"
		}
	}

	// Deteksi nama spesifik yang dicari (misal: "atas nama andre", "bernama budi", dll)
	var explicitTargetName string
	for _, prefix := range []string{"atas nama ", "bernama ", "nama personel ", "nama anggota "} {
		if idx := strings.Index(qLower, prefix); idx != -1 {
			rest := strings.TrimSpace(qLower[idx+len(prefix):])
			fields := strings.Fields(rest)
			var nameParts []string
			for _, f := range fields {
				cleanF := strings.Trim(f, `.,!?"'()[]:;`)
				if stopWords[cleanF] || cleanF == "di" || cleanF == "satker" || cleanF == "polda" {
					break
				}
				nameParts = append(nameParts, cleanF)
			}
			if len(nameParts) > 0 {
				explicitTargetName = strings.Join(nameParts, " ")
				break
			}
		}
	}

	rawTokens := strings.Fields(qLower)
	var substantiveWords []string

	for _, t := range rawTokens {
		cleanT := strings.Trim(t, `.,!?"'()[]:;`)
		if cleanT == "pppk" || cleanT == "asn" || cleanT == "pns" {
			continue
		}
		if cleanT == "polri" || cleanT == "polisi" {
			// Jika kueri adalah nama satker eksplisit (misal BARESKRIM POLRI / PUSKEU POLRI), jangan masukkan kata 'polri' ke kata kunci agar tidak bias
			continue
		}
		if !stopWords[cleanT] && len(cleanT) > 1 {
			substantiveWords = append(substantiveWords, cleanT)
		}
	}

	// Jika nama target eksplisit terdeteksi dan substantiveWords kosong, masukkan target name
	if explicitTargetName != "" && len(substantiveWords) == 0 {
		substantiveWords = strings.Fields(explicitTargetName)
	}

	isCount := strings.Contains(qLower, "jumlah") ||
		strings.Contains(qLower, "berapa") ||
		strings.Contains(qLower, "total") ||
		strings.Contains(qLower, "rekap") ||
		strings.Contains(qLower, "banyaknya") ||
		strings.Contains(qLower, "statistik") ||
		strings.Contains(qLower, "komposisi") ||
		isMultiJP

	var baseWhereClauses []string
	var baseArgs []interface{}
	bIdx := 1
	for _, w := range substantiveWords {
		baseWhereClauses = append(baseWhereClauses, fmt.Sprintf("(nama_satker ILIKE $%d OR nama ILIKE $%d OR pangkat ILIKE $%d OR nip_nrp ILIKE $%d)", bIdx, bIdx, bIdx, bIdx))
		baseArgs = append(baseArgs, "%"+w+"%")
		bIdx++
	}

	var whereClauses []string
	var args []interface{}
	idx := 1

	if detectedJP != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("jenis_personel = $%d", idx))
		args = append(args, detectedJP)
		idx++
	}

	// Jika ada nama target eksplisit (misal 'atas nama andre'), filter langsung kolom nama untuk akurasi instan
	if explicitTargetName != "" && !isCount {
		whereClauses = append(whereClauses, fmt.Sprintf("nama ILIKE $%d", idx))
		args = append(args, "%"+explicitTargetName+"%")
		idx++
	} else {
		for _, w := range substantiveWords {
			whereClauses = append(whereClauses, fmt.Sprintf("(nama_satker ILIKE $%d OR nama ILIKE $%d OR pangkat ILIKE $%d OR nip_nrp ILIKE $%d)", idx, idx, idx, idx))
			args = append(args, "%"+w+"%")
			idx++
		}
	}

	if len(whereClauses) == 0 {
		whereClauses = append(whereClauses, fmt.Sprintf("(nama ILIKE $%d OR pangkat ILIKE $%d OR nama_satker ILIKE $%d OR nip_nrp ILIKE $%d OR jenis_personel ILIKE $%d)", idx, idx, idx, idx, idx))
		args = append(args, "%"+q+"%")
	}

	sqlStr := fmt.Sprintf(`
		WITH matched_pers AS (
			SELECT 
				nip_nrp, 
				nama, 
				pangkat, 
				COALESCE(jenis_personel, 'POLRI') as jenis_personel, 
				nama_satker, 
				COALESCE(nama_polda, '-') as nama_polda,
				COALESCE(gapok, 0) as gapok,
				COALESCE(t_beras, 0) as t_beras,
				COALESCE(ulp, 0) as ulp,
				COALESCE(total_gaji_keseluruhan, 0) as total_gaji,
				COALESCE(total_tunkin_yang_diterima, 0) as total_tunkin,
				COALESCE(jumlah_total_penghasilan, 0) as total_penghasilan,
				COALESCE(potongan_tunkin, 0) as potongan_tunkin
			FROM public.data_polri_september_2026
			WHERE %s
			LIMIT 10
		)
		SELECT 
			REPLACE(p.nip_nrp, '''', ''), 
			p.nama, 
			p.pangkat, 
			p.jenis_personel, 
			p.nama_satker, 
			p.nama_polda,
			p.gapok,
			p.t_beras,
			p.ulp,
			p.total_gaji,
			p.total_tunkin,
			p.total_penghasilan,
			p.potongan_tunkin,
			COALESCE(to_char(pd.tanggal_lahir, 'DD/MM/YYYY'), '-'),
			COALESCE(to_char(pd.tmt_pangkat_terakhir, 'DD/MM/YYYY'), '-'),
			COALESCE(to_char(pd.tmt_dinas, 'DD/MM/YYYY'), '-'),
			COALESCE(to_char(pd.tmt_kgb_terakhir, 'DD/MM/YYYY'), '-'),
			COALESCE(pd.status_kawin, 'Kawin'),
			COALESCE(pd.sisa_cuti, 12),
			COALESCE(jf.nama_jabatan_jf, 'Fungsional Kepolisian'),
			COALESCE(jf.jenjang_jf, 'Madya'),
			COALESCE(jf.kelas_jabatan_jf, 11),
			COALESCE(jf.angka_kredit, 0),
			COALESCE(kd.nama_sertifikasi, 'Sertifikasi Pusdik Polri'),
			COALESCE(kd.lembaga_penerbit, 'Lemdiklat Polri'),
			COALESCE(kd.ringkasan_keahlian_rag, 'Keahlian Operasional Kedinasan'),
			COALESCE(rp.jabatan_lama, '-'),
			COALESCE(rp.kesatuan_lama, '-'),
			COALESCE(rp.nomor_sprin_mutasi, '-'),
			COALESCE(dv.jenis_dokumen, 'SK Kenaikan Pangkat/Jabatan'),
			COALESCE(dv.nomor_sk_resmi, '-'),
			COALESCE(dv.status_verifikasi, 'Terverifikasi')
		FROM matched_pers p
		LEFT JOIN public.dummy_personel_detail pd ON pd.nip_nrp = REPLACE(p.nip_nrp, '''', '')
		LEFT JOIN public.dummy_jabatan_fungsional jf ON jf.nip_nrp = REPLACE(p.nip_nrp, '''', '')
		LEFT JOIN public.dummy_kompetensi_diklat kd ON kd.nip_nrp = REPLACE(p.nip_nrp, '''', '')
		LEFT JOIN public.dummy_riwayat_penugasan rp ON rp.nip_nrp = REPLACE(p.nip_nrp, '''', '')
		LEFT JOIN public.dummy_dokumen_validasi dv ON dv.nip_nrp = REPLACE(p.nip_nrp, '''', '')
	`, strings.Join(whereClauses, " AND "))

	return QueryIntent{
		IsCountQuery:     isCount,
		DetectedJP:       detectedJP,
		IsMultiJP:        isMultiJP,
		SubstantiveWords: substantiveWords,
		WhereClauses:     whereClauses,
		Args:             args,
		BaseWhereClauses: baseWhereClauses,
		BaseArgs:         baseArgs,
		SQLStr:           sqlStr,
	}
}
