export interface DashboardStats {
    ngos_count: number
    projects_count: number
    budget_count: number
    territories_count: number
    interventions_fields_count: number
    interventions_fields_details: {
        secteur: string,
        occurrences: number
    }[]
    beneficiaries_types_details: {
        type: string
        occurrences: number
        percentage: number
    }[]
    beneficiaries_count: {
        target: number
        beneficiaries: number
    }
}