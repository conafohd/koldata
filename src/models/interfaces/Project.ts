export interface Project {
  id: string;
  intitule_projet: string;
  partenaire_financier_technique: string | null;
  noms_bailleurs_fonds: string[];
  autre_bailleur_fonds: string | null;
  secteurs_intervention: string[];
  autre_secteur_intervention: string | null;
  date_debut_projet: string;
  date_fin_projet: string | null;
  statut_projet: string;
  province: string;
  territoire: string;
  aire_sante: string;
  localite_village_quartier: string;
  budget_projet: number;
  types_services_fournis: string[];
  autre_type_services_fournis: string | null;
  types_beneficiaires_populations_cibles: string[];
  autre_types_beneficiaires_populations_cibles: string | null;
  nombre_total_personnes_cibles: number;
  nombre_hommes: number | null;
  nombre_femmes: number | null;
  nombre_filles: number | null;
  nombre_garcons: number | null;
  nombre_personnes_atteintes: number | null;
  nombre_personnes_handicapees: number | null;
  nombre_personnes_agees: number | null;
  association_id: string;
  created_at: string | null;
  updated_at: string | null;
  created_by: string;
  waiting_for_validation: boolean
}

export type CreateProject = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>

export interface ProjectUpdate extends Project {
  projet_id: string;
}