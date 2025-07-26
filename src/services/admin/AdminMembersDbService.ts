import { NotificationType } from "@/models/enums/NotificationType"
import { i18n } from "@/plugins/i18n"
import { supabase } from "@/plugins/supabase"
import { addNotification } from "../NotificationsService"

export class AdminMembersDbService {
    public static async getAdminMembers() {
        const { data: users, error } = await supabase.from('user_profiles').select('*').not('role', 'eq', 'admin')
        if (error) {
            addNotification(i18n.t('adminMembers.fetchError'), NotificationType.ERROR)
            throw error
        }
        return users
    }
}