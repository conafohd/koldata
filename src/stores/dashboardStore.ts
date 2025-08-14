import type { DashboardStats } from "@/models/interfaces/DashboardStats";
import { i18n } from "@/plugins/i18n";
import { supabase } from "@/plugins/supabase";
import { addNotification } from "@/services/NotificationsService";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useDashboardStore = defineStore('dashboard', () => {
    const stats = ref<DashboardStats | null>(null)

    const fetchStats = async (force = false) => {
        if (stats.value && !force) return;
        const { data, error } = await supabase.rpc('get_db_stats')
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