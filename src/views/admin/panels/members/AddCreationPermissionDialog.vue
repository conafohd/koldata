<template>
  <v-dialog v-model="showAddCreateDialog" max-width="400px">
    <v-card>
      <v-card-title>{{ $t('adminMembers.addCreationDialog.title') }}</v-card-title>
      <v-card-text>
        <div class="AddPermissionForm">
          <div class="Form__fields">
            <v-select
              variant="outlined"
              :label="$t('adminMembers.addCreationDialog.selectMember')"
              v-model="selectedUser"
              :items="membersList"
              :item-title="
                (item) => (item ? `${item.first_name || ''} ${item.last_name || ''}`.trim() : '')
              "
              item-value="id"
              required
            >
            </v-select>
          </div>
        </div>
      </v-card-text>
      <div class="AddPermissionForm__actions">
        <v-btn
          @click="confirmAddCreationPermission"
          color="main-purple"
          :disabled="!selectedUser"
          >{{ $t('adminMembers.addCreationDialog.confirm') }}</v-btn
        >
        <v-btn @click="showAddCreateDialog = false">{{
          $t('adminMembers.addCreationDialog.cancel')
        }}</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { useAdminStore } from '@/stores/adminStore'
import { storeToRefs } from 'pinia'
import { ref, type ModelRef } from 'vue'

const adminStore = useAdminStore()
const showAddCreateDialog: ModelRef<boolean | undefined> = defineModel('showAddCreateDialog')

const { membersList } = storeToRefs(adminStore)
const selectedUser = ref(null)

const confirmAddCreationPermission = () => {
  adminStore.setMemberCreationPermission(selectedUser.value!)
  showAddCreateDialog.value = false
}
</script>

<style scoped lang="scss">
.AddPermissionForm {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.AddPermissionForm__actions {
  display: flex;
  justify-content: end;
  gap: 1rem;
  margin-right: 1rem;
  margin-bottom: 1rem;
}
</style>
