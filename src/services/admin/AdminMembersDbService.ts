import { NotificationType } from "@/models/enums/NotificationType"
import { TablesList } from "@/models/enums/TablesList"
import { UserRole } from "@/models/enums/UserRole"
import { i18n } from "@/plugins/i18n"
import { supabase } from "@/plugins/supabase"
import { addNotification } from "../NotificationsService"
import { PostgrestError } from "@/models/enums/PostgrestError"

export class AdminMembersDbService {
    public static async getAdminMembers() {
        const { data: users, error } = await supabase.from(TablesList.USER_PROFILES).select('*').not('role', 'eq', UserRole.ADMIN)
        if (error) {
            addNotification(i18n.t('adminMembers.fetchError'), NotificationType.ERROR)
            throw error
        }
        return users
    }

    public static async setMemberEditPermission(memberId: string, associationId: string) {
        const { error } = await supabase.from(TablesList.USER_PROFILES).update({ edit_association_id: associationId, role: UserRole.EDITOR }).eq('id', memberId)
        if (error) {
            console.log('error', error, error.code, PostgrestError.DUPLICATE_KEY, error.code == PostgrestError.DUPLICATE_KEY);
            if (error.code == PostgrestError.DUPLICATE_KEY) {
                addNotification(i18n.t('adminMembers.alreadyAnotherEditorError'), NotificationType.ERROR)
            } else {
                addNotification(i18n.t('adminMembers.addPermissionError'), NotificationType.ERROR)
            }
            throw error
        }
    }

    public static async setMemberCreationPermission(memberId: string) {
        const { error } = await supabase.from(TablesList.USER_PROFILES).update({ edit_association_id: null, role: UserRole.CREATOR }).eq('id', memberId)
        if (error) {
            addNotification(i18n.t('adminMembers.addPermissionError'), NotificationType.ERROR)
            throw error
        }
    }

    public static async deleteMemberPermission(id: string) {
        const { error } = await supabase.from(TablesList.USER_PROFILES).update({ edit_association_id: null, role: UserRole.READER }).eq('id', id)
        if (error) {
            addNotification(i18n.t('adminMembers.deletePermissionError'), NotificationType.ERROR)
            throw error
        }
    }
}