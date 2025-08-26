import { InterventionSector } from "@/models/enums/InterventionSector";
import { ProjectServiceType } from "@/models/enums/projects/ProjectServiceType";

export const PROJECT_SERVICES_BY_SECTOR: Record<InterventionSector, ProjectServiceType[]> = {
  [InterventionSector.PROTECTION]: [
    ProjectServiceType.HUMAN_RIGHTS_AWARENESS,
    ProjectServiceType.PSYCHOSOCIAL_SUPPORT,
    ProjectServiceType.GBV_MONITORING_REFERRAL,
    ProjectServiceType.LEGAL_SUPPORT,
    ProjectServiceType.SAFE_SPACES
  ],
  
  [InterventionSector.NUTRITION]: [
    ProjectServiceType.MALNUTRITION_SCREENING,
    ProjectServiceType.THERAPEUTIC_FOOD_DISTRIBUTION,
    ProjectServiceType.NUTRITIONAL_AWARENESS,
    ProjectServiceType.BREASTFEEDING_SUPPORT,
    ProjectServiceType.COMMUNITY_RELAY_TRAINING
  ],
  
  [InterventionSector.LOGISTICS]: [
    ProjectServiceType.TRANSPORT_DISTRIBUTION,
    ProjectServiceType.STOCK_MANAGEMENT,
    ProjectServiceType.PROCUREMENT,
    ProjectServiceType.TEMPORARY_INFRASTRUCTURE_SETUP,
    ProjectServiceType.EQUIPMENT_MAINTENANCE
  ],
  
  [InterventionSector.WASH]: [
    ProjectServiceType.WATER_POINT_CONSTRUCTION,
    ProjectServiceType.HYGIENE_KIT_DISTRIBUTION,
    ProjectServiceType.HYGIENE_PROMOTION,
    ProjectServiceType.LATRINE_CONSTRUCTION,
    ProjectServiceType.WATER_TREATMENT
  ],
  
  [InterventionSector.HEALTH]: [
    ProjectServiceType.MEDICAL_CONSULTATIONS,
    ProjectServiceType.VACCINATION_CAMPAIGNS,
    ProjectServiceType.MEDICAL_DISTRIBUTION,
    ProjectServiceType.REPRODUCTIVE_HEALTH,
    ProjectServiceType.MEDICAL_STAFF_TRAINING,
    ProjectServiceType.MEDICAL_AWARENESS
  ],
  
  [InterventionSector.FOOD_SECURITY]: [
    ProjectServiceType.FOOD_DISTRIBUTION,
    ProjectServiceType.AGRICULTURAL_PRODUCTION_SUPPORT,
    ProjectServiceType.CASH_TRANSFERS,
    ProjectServiceType.AGRICULTURAL_TECHNIQUES_TRAINING,
    ProjectServiceType.COMMUNITY_GARDENS,
    ProjectServiceType.FOOD_AWARENESS
  ],
  
  [InterventionSector.SHELTER]: [
    ProjectServiceType.EMERGENCY_SHELTER_CONSTRUCTION,
    ProjectServiceType.HOUSING_REHABILITATION,
    ProjectServiceType.TARP_MATERIALS_DISTRIBUTION,
    ProjectServiceType.TEMPORARY_SITE_DEVELOPMENT,
    ProjectServiceType.SELF_CONSTRUCTION_ASSISTANCE
  ],
  
  [InterventionSector.EDUCATION]: [
    ProjectServiceType.SCHOOL_REHABILITATION,
    ProjectServiceType.SCHOOL_KIT_DISTRIBUTION,
    ProjectServiceType.NON_FORMAL_EDUCATION,
    ProjectServiceType.TEACHER_TRAINING,
    ProjectServiceType.SCHOOL_PROTECTION_AWARENESS
  ],
  
  [InterventionSector.INTER_AGENCY_COORDINATION]: [
    ProjectServiceType.SECTORAL_MEETINGS,
    ProjectServiceType.INTERVENTION_HARMONIZATION,
    ProjectServiceType.NEEDS_MONITORING,
    ProjectServiceType.COMMON_RESPONSE_PLANS,
    ProjectServiceType.INTER_AGENCY_DATABASE_MANAGEMENT
  ],
  
  [InterventionSector.OTHER]: []
};
