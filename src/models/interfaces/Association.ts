import type { InterventionSector } from "../enums/InterventionSector";
import type { AssociationType } from "../enums/associations/AssociationType";

/** Annual budgets keyed by year string, e.g. { "2024": 1200, "2023": 900 }. */
export type BudgetByYear = Record<string, number>;

export interface Association {
  id: string;
  created_at: string;
  created_by: string;
  logo_url: string | null;
  nom: string;
  acronyme: string;
  desc: string;
  type_org: AssociationType;
  type_org_autre: string | null;
  annee_creation: number;
  secteurs_interv: InterventionSector[];
  secteurs_interv_autre: string | null;
  province: string;
  territoire: string;
  zone_sante: string;
  aire_sante: string;
  localite: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  precision: number | null;
  budget: BudgetByYear | null;
  nb_salaries: number;
  nb_benevoles: number;
  nom_resp_edition: string;
  email_resp_edition: string;
  email_org: string;
  nom_contact: string;
  tel_contact: string;
  email_contact: string;
  website: string | null;
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  autre_social_media: string | null;
  updated_at: string;
  waiting_for_validation: boolean;
  newAssociation?: boolean
}

export type AssociationCreate = Omit<Association, 'id' | 'created_at' | 'updated_at'>

export interface AssociationUpdate extends Association {
  association_id: string;
}
