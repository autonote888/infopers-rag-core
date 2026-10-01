export type MenuKey =
  | "portal_landing"
  | "crud_personel"
  | "sotk_ssdm"
  | "statistik_personel"
  | "data_polda"
  | "data_satker"
  | "smart_qa_ai";

export interface UserSession {
  nip_nrp: string;
  username: string;
  nama: string;
  pangkat: string;
  role_level: string;
  is_keycloak?: boolean;
  id_token?: string;
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
