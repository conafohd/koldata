import { NotificationType } from '@/models/enums/NotificationType'
import { UserRole } from '@/models/enums/UserRole'
import type { UserInfos } from '@/models/interfaces/UserInfos'
import { i18n } from '@/plugins/i18n'
import { AdminMembersDbService } from '@/services/admin/AdminMembersDbService'
import { addNotification } from '@/services/NotificationsService'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  const membersList: Ref<UserInfos[]> = ref([])
  const associationMembersList: Ref<UserInfos[]> = ref([])

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

  async function removeMemberPermission(id: string, role: UserRole) {
    try {
      if (role === UserRole.CREATOR) {
        await AdminMembersDbService.deleteCreator(id)
        addNotification(i18n.t('adminMembers.deleteCreatorSuccess'), NotificationType.SUCCESS)
      } else {
        await AdminMembersDbService.deleteMemberPermission(id)
        addNotification(i18n.t('adminMembers.deletePermissionSuccess'), NotificationType.SUCCESS)
      }
      await getAdminMembers()
    } catch (error) {
      console.log('Error removing member permission:', error)
    }
  }

  async function getAssociationMembers(associationId: string) {
    try {
      associationMembersList.value =
        await AdminMembersDbService.getAssociationMembers(associationId)
    } catch (error) {
      console.log('Error fetching association members:', error)
    }
  }

  async function approveAssociationMember(memberId: string, associationId: string) {
    try {
      await AdminMembersDbService.manageAssociationMember('approve', memberId, associationId)
      addNotification(i18n.t('associations.members.approveSuccess'), NotificationType.SUCCESS)
      await getAssociationMembers(associationId)
    } catch (error) {
      console.log('Error approving association member:', error)
    }
  }

  async function deleteAssociationMember(memberId: string, associationId: string) {
    try {
      await AdminMembersDbService.manageAssociationMember('delete', memberId, associationId)
      addNotification(i18n.t('associations.members.deleteSuccess'), NotificationType.SUCCESS)
      await getAssociationMembers(associationId)
    } catch (error) {
      console.log('Error deleting association member:', error)
    }
  }

  return {
    membersList,
    associationMembersList,
    getAdminMembers,
    setMemberEditPermission,
    setMemberCreationPermission,
    removeMemberPermission,
    getAssociationMembers,
    approveAssociationMember,
    deleteAssociationMember,
  }
})
