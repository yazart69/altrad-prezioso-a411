export interface Profile {
  id: string;
  matricule: string;
  nom: string;
  role: 'admin' | 'chef_chantier' | 'chef_equipe' | 'operateur' | 'interimaire';
  status: 'disponible' | 'conges' | 'maladie' | 'arret';
  telephone?: string;
  email?: string;
}

export interface Project {
  id: string;
  nom: string;
  adresse?: string;
  ville?: string;
  equipe: string[]; // Tableau d'IDs des profils
  budget_heures: number;
}

export interface Attendance {
  id: string;
  user_id: string;
  project_id: string;
  check_in: string;
  check_out?: string;
  gps_lat_in?: number;
  gps_lng_in?: number;
  signature_in?: string; // base64
}

export interface InventoryItem {
  id: string;
  project_id: string;
  item_name: string;
  quantity_current: number;
  quantity_initial: number;
  threshold_alert: number;
  unit: string;
}
