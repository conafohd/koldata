import { NotificationType } from "@/models/enums/NotificationType"
import { TablesList } from "@/models/enums/TablesList"
import { UserRole } from "@/models/enums/UserRole"
import type { UserInfos } from "@/models/interfaces/UserInfos"
import { i18n } from "@/plugins/i18n"
import { supabase } from "@/plugins/supabase"
import { addNotification } from "../NotificationsService"
import { PostgrestError } from "@/models/enums/PostgrestError"

export class AdminMembersDbService {
    public static async getAdminMembers() {
        const { data: users, error } = await supabase.rpc('get_verified_admin_members')
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
        const { error } = await supabase.from(TablesList.USER_PROFILES).update({ role: UserRole.READER }).eq('id', id)
        if (error) {
            addNotification(i18n.t('adminMembers.deletePermissionError'), NotificationType.ERROR)
            throw error
        }
    }

    public static async getAssociationMembers(associationId: string): Promise<UserInfos[]> {
        const { data: users, error } = await supabase
            .from(TablesList.USER_PROFILES)
            .select('*')
            .eq('edit_association_id', associationId)
            .in('role', [UserRole.READER, UserRole.PENDING])

        if (error) {
            addNotification(i18n.t('associations.members.fetchError'), NotificationType.ERROR)
            throw error
        }

        return users ?? []
    }

    public static async manageAssociationMember(
        action: 'approve' | 'delete',
        memberId: string,
        associationId: string,
    ) {
        const { error } = await supabase.functions.invoke('manage-association-members', {
            body: {
                action,
                memberId,
                associationId,
            },
        })

        if (error) {
            addNotification(
                i18n.t(
                    action === 'approve'
                        ? 'associations.members.approveError'
                        : 'associations.members.deleteError',
                ),
                NotificationType.ERROR,
            )
            throw error
        }
    }
}
