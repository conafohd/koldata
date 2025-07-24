export interface Province {
    id: number
    province: string
    centroid: {
        coordinates: [number, number]
    }
}

export interface Territory {
    id: number
    province: string
    territoire: string
    centroid: {
        coordinates: [number, number]
    }
}

export interface HealthZone {
    id: number
    territoire: string
    zone_sante: string
    centroid: {
        coordinates: [number, number]
    }
}