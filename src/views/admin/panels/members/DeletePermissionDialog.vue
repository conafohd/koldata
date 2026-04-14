<template>
  <v-dialog v-model="showDeleteDialog" max-width="400px">
    <v-card>
      <v-card-title>{{ dialogTitle }}</v-card-title>
      <v-card-text>
        {{ dialogMessage }}
      </v-card-text>
      <v-card-actions>
        <v-btn @click="confirmRemovePermission">{{
          $t('adminMembers.deleteDialog.confirm')
        }}</v-btn>
        <v-btn @click="showDeleteDialog = false">{{
          $t('adminMembers.deleteDialog.cancel')
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { UserRole } from '@/models/enums/UserRole'
import { i18n } from '@/plugins/i18n'
import { computed } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import type { ModelRef } from 'vue'

const showDeleteDialog: ModelRef<boolean | undefined> = defineModel('showDeleteDialog')
const permissionId: ModelRef<string | undefined> = defineModel('permissionId')
const permissionRole: ModelRef<UserRole | undefined> = defineModel('permissionRole')
const adminStore = useAdminStore()

const isCreatorDeletion = computed(() => permissionRole.value === UserRole.CREATOR)
const dialogTitle = computed(() =>
  isCreatorDeletion.value
    ? i18n.t('adminMembers.deleteDialog.creatorTitle')
    : i18n.t('adminMembers.deleteDialog.title'),
)
const dialogMessage = computed(() =>
  isCreatorDeletion.value
    ? i18n.t('adminMembers.deleteDialog.creatorMessage')
    : i18n.t('adminMembers.deleteDialog.message'),
)

const confirmRemovePermission = () => {
  adminStore.removeMemberPermission(permissionId.value as string, permissionRole.value as UserRole)
  showDeleteDialog.value = false
}
</script>
