import type { DashboardStats } from "@/models/interfaces/DashboardStats";
import { i18n } from "@/plugins/i18n";
import { supabase } from "@/plugins/supabase";
import { addNotification } from "@/services/NotificationsService";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useDashboardStore = defineStore('dashboard', () => {
    const stats = ref<DashboardStats | null>(null)

    const fetchStats = async (asso: string | null, province: string[] | null, territory: string[] | null, healthzone: string[] | null, year: number[] | null) => {
        const { data, error } = await supabase.rpc('get_db_stats', {
            p_asso: asso,
            p_province: province,
            p_territory: territory,
            p_healthzone: healthzone,
            p_year: year
        });
        if (error) {
            addNotification(i18n.t('dashboard.fetchError'))
            console.error('Error fetching dashboard stats:', error)
            return
        }
        stats.value = data as DashboardStats
    }

    return {
        stats,
        fetchStats
    }
})