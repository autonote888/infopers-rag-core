export type MenuKey =
  // 1. BERANDA & PROFIL KELEMBAGAAN
  | "sotk_ssdm"
  | "program_unggulan"
  | "statistik_personel"
  | "data_polda"
  | "data_satker"
  | "data_polda_satker"
  // 2. PERENCANAAN STRATEGIS & PREDIKSI (DALPERS & RENMIN)
  | "prediksi_bup"
  | "prediksi_intake"
  | "analisis_formasi"
  | "proyeksi_belanja_jf"
  | "dokumen_perencanaan"
  | "record_memory"
  // 3. FITUR AI UNGGULAN SSDM
  | "smart_qa_ai"
  | "ai_rekomendasi_mutasi"
  | "validasi_ocr"
  | "generator_rh"
  // 4. PEMBINAAN KARIER (BIRO BINKAR)
  | "rekam_jejak_ukp"
  | "talent_pool_dikbang"
  | "status_verifikasi_adm"
  // 5. PERAWATAN PERSONEL & PSIKOLOGI (BIRO WATPERS & RO PSIKOLOGI)
  | "psikologi_senpi"
  | "peringatan_mpp_kgb"
  | "tanda_kehormatan"
  | "layanan_mandiri"
  // 6. INTEGRITAS & TATA KELOLA DATA (INTERNAL IT SSDM)
  | "pengaturan_rbac"
  | "audit_trail";

export interface UserSession {
  nip_nrp: string;
  username: string;
  nama: string;
  pangkat: string;
  role_level: string;
}

export interface PersonelListItem {
  nip_nrp: string;
  nama: string;
  pangkat: string;
  satker: string;
  polda: string;
  tunkin: number;
  jabatan_jf: string;
  sertifikasi: string;
}
