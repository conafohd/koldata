import { NotificationType } from "@/models/enums/NotificationType"
import { TablesList } from "@/models/enums/TablesList"
import type { HealthZone, Province, Territory } from "@/models/interfaces/AdminBoundaries"
import { i18n } from "@/plugins/i18n"
import { supabase } from "@/plugins/supabase"
import { addNotification } from "@/services/NotificationsService"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"

export const useAdminBoundariesStore = defineStore('adminBoundaries', () => {
    const provincesList: Ref<Province[]> = ref([])
    const territoriesList: Ref<Territory[]> = ref([])
    const healthZonesList: Ref<HealthZone[]> = ref([])

    function getProvinceNameFromCode(code: string) {
        const province = provincesList.value.find((p) => p.province_c === code)
        return province ? province.province : code
    }
    function getTerritoryNameFromCode(code: string) {
        const territory = territoriesList.value.find((t) => t.territoire_c === code)
        return territory ? territory.territoire : code
    }
    function getHealthZoneNameFromCode(code: string) {
        const healthZone = healthZonesList.value.find((h) => h.zone_sante_c === code)
        return healthZone ? healthZone.zone_sante : code
    }

    const fetchBoundaries = async () => {
        if (provincesList.value.length > 0 && territoriesList.value.length > 0 && healthZonesList.value.length > 0) {
            return
        }
        try {
            const [
                { data: provinces, error: provincesError },
                { data: territories, error: territoriesError },
                { data: health_areas, error: healthAreasError }
            ] = await Promise.all([
                supabase.from(TablesList.PROVINCES).select('*').order('province', { ascending: true }),
                supabase.from(TablesList.TERRITORIES).select('*').order('territoire', { ascending: true }),
                supabase.from(TablesList.HEALTH_ZONES).select('*').order('zone_sante', { ascending: true })
            ]);

            if (provincesError) {
                console.error('Error fetching provinces:', provincesError);
                addNotification(i18n.t('error.errorFetchingProvinces'), NotificationType.ERROR)
            } else {
                provincesList.value = provinces;
            }

            if (territoriesError) {
                console.error('Error fetching territories:', territoriesError);
                addNotification(i18n.t('error.errorFetchingTerritories'), NotificationType.ERROR)
            } else {
                territoriesList.value = territories;
            }

            if (healthAreasError) {
                console.error('Error fetching health areas:', healthAreasError);
                addNotification(i18n.t('error.errorFetchingHealthAreas'), NotificationType.ERROR)
            } else {
                healthZonesList.value = health_areas;
            }

        } catch (error) {
            console.error('Error fetching boundaries:', error);
            addNotification(i18n.t('error.errorFetchingBoundaries'), NotificationType.ERROR)
        }
    };

    return { provincesList, territoriesList, healthZonesList, getProvinceNameFromCode,
        getTerritoryNameFromCode, getHealthZoneNameFromCode, fetchBoundaries }
})