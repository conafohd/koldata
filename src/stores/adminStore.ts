import { NotificationType } from "@/models/enums/NotificationType"
import type { UserInfos } from "@/models/interfaces/UserInfos"
import { i18n } from "@/plugins/i18n"
import { AdminMembersDbService } from "@/services/admin/AdminMembersDbService"
import { addNotification } from "@/services/NotificationsService"
import { defineStore } from "pinia"
import { ref, type Ref } from "vue"

export const useAdminStore = defineStore('admin', () => {
    const membersList: Ref<UserInfos[]> = ref([])

    async function getAdminMembers() {
        try {
            membersList.value = await AdminMembersDbService.getAdminMembers()
        } catch (error) {
            console.log('Error fetching users:', error)
        }
    }

    async function setMemberEditPermission(memberId: string, associationId: string) {
        try {
            await AdminMembersDbService.setMemberEditPermission(memberId, associationId)
            addNotification(i18n.t('adminMembers.addPermissionSuccess'), NotificationType.SUCCESS)
            await getAdminMembers()
        } catch (error) {
            console.log('Error setting member permission:', error)
        }
    }

    async function setMemberCreationPermission(memberId: string) {
        try {
            await AdminMembersDbService.setMemberCreationPermission(memberId)
            addNotification(i18n.t('adminMembers.addPermissionSuccess'), NotificationType.SUCCESS)
            await getAdminMembers()
        } catch (error) {
            console.log('Error setting member permission:', error)
        }
    }

    async function removeMemberPermission(id: string) {
        try {
            await AdminMembersDbService.deleteMemberPermission(id)
            addNotification(i18n.t('adminMembers.deletePermissionSuccess'), NotificationType.SUCCESS)
            await getAdminMembers()
        } catch (error) {
            console.log('Error removing member permission:', error)
        }
    }
    return { membersList, getAdminMembers, setMemberEditPermission, setMemberCreationPermission, removeMemberPermission }
})