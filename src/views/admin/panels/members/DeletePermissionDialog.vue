<template>
  <v-dialog v-model="showDeleteDialog" max-width="400px">
    <v-card>
      <v-card-title>{{ $t('adminMembers.deleteDialog.title') }}</v-card-title>
      <v-card-text>
        {{ $t('adminMembers.deleteDialog.message') }}
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
import { useAdminStore } from '@/stores/adminStore'
import type { ModelRef } from 'vue'

const showDeleteDialog: ModelRef<boolean | undefined> = defineModel('showDeleteDialog')
const permissionId: ModelRef<string | undefined> = defineModel('permissionId')
const adminStore = useAdminStore()

const confirmRemovePermission = () => {
  adminStore.removeMemberPermission(permissionId.value as string)
  showDeleteDialog.value = false
}
</script>
