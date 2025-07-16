export interface NominatimResult {
  place_id: string
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
  address?: {
    country?: string
    state?: string
    city?: string
    town?: string
    village?: string
    road?: string
    house_number?: string
    postcode?: string
  }
}

export interface LocationSearchOptions {
  limit?: number
  countryCode?: string
  additionalParams?: Record<string, string>
}