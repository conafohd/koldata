export interface Province {
    id: number
    province: string
    province_c: string
    centroid: {
        type: string
        coordinates: [number, number]
    }
}

export interface Territory {
    id: number
    province_c: string
    territoire_c: string
    territoire: string
    centroid: {
        type: string
        coordinates: [number, number]
    }
}

export interface HealthZone {
    id: number
    province_c: string
    territoire_c: string
    zone_sante_c: string
    zone_sante: string
    centroid: {
        type: string
        coordinates: [number, number]
    }
}