import { NotificationType } from '@/models/enums/NotificationType';
import type { LocationSearchOptions, NominatimResult } from '@/models/interfaces/Geocoding';
import { i18n } from '@/plugins/i18n';
import { addNotification } from '../NotificationsService';

export class GeocodingService {
  public static async searchLocation(
    query: string, 
    options: LocationSearchOptions = {}
  ): Promise<NominatimResult[]> {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: options.limit?.toString() || '5',
      countrycodes: options.countryCode || 'cd', // DRC by default
      ...options.additionalParams
    })
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          'User-Agent': 'AssociationApp/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return this.mapNominatimResults(data)
    } catch (error) {
      console.error('Location search failed:', error)
      addNotification(i18n.t('geocoding.error'), NotificationType.ERROR)
      throw new Error('Failed to search location')
    }
  }
  
  private static mapNominatimResults(data: NominatimResult[]): NominatimResult[] {
    return data.map(item => ({
      place_id: item.place_id,
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      type: item.type,
      importance: item.importance,
      address: item.address
    }))
  }
}
