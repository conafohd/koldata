import type { InterventionSector } from "../enums/InterventionSector";
import type { ProjectBeneficiaryType } from "../enums/projects/ProjectBeneficiaryType";
import type { ProjectFunder } from "../enums/projects/ProjectFunder";
import type { ProjectServiceType } from "../enums/projects/ProjectServiceType";
import type { ProjectStatus } from "../enums/projects/ProjectStatus";

export interface Project {
  id: string;
  intitule_projet: string;
  partenaire_financier_technique: string;
  noms_bailleurs_fonds: ProjectFunder[];
  autre_bailleur_fonds: string | null;
  secteurs_intervention: InterventionSector[];
  autre_secteur_intervention: string | null;
  date_debut_projet: string | null;
  date_fin_projet: string | null;
  statut_projet: ProjectStatus | null;
  province: string[];
  territoire: string[];
  zone_sante: string[];
  aire_sante: string;
  localite_village_quartier: string;
  budget_projet: number;
  types_services_fournis: ProjectServiceType[];
  autre_type_services_fournis: string | null;
  types_beneficiaires_populations_cibles: ProjectBeneficiaryType[];
  autre_types_beneficiaires_populations_cibles: string | null;
  nombre_total_personnes_cibles: number;
  nombre_hommes: number | null;
  nombre_femmes: number | null;
  nombre_filles: number | null;
  nombre_garcons: number | null;
  nombre_personnes_atteintes: number | null;
  nombre_personnes_handicapees: number | null;
  nombre_personnes_agees: number | null;
  consortium: boolean;
  partenaires_consortium: string | null;
  association_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  waiting_for_validation: boolean
  newProject?: boolean;
}

export type CreateProject = Omit<Project, 'id' | 'created_at' | 'updated_at' | 'created_by'>

export interface ProjectUpdate extends Project {
  projet_id: string;
}

export interface ProjectService {
    sector: InterventionSector
    type: ProjectServiceType
}