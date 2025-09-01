<template>
  <v-dialog v-model="showAddEditDialog" max-width="400px">
    <v-card>
      <v-card-title>{{
        selectedMemberId
          ? $t('adminMembers.addEditDialog.titleEdit')
          : $t('adminMembers.addEditDialog.title')
      }}</v-card-title>
      <v-card-text>
        <div class="AddPermissionForm">
          <div class="Form__fields">
            <v-select
              variant="outlined"
              :label="$t('adminMembers.addEditDialog.selectMember')"
              v-model="memberPermissionForm.form.memberId.value.value"
              :error-messages="memberPermissionForm.form.memberId.errorMessage.value"
              @blur="memberPermissionForm.form.memberId.handleBlur"
              :items="membersList"
              :item-title="
                (item) => (item ? `${item.first_name || ''} ${item.last_name || ''}`.trim() : '')
              "
              item-value="id"
              required
            >
            </v-select>
          </div>
          <div class="Form__fields">
            <v-select
              variant="outlined"
              :label="$t('adminMembers.addEditDialog.selectAssociation')"
              v-model="memberPermissionForm.form.associationId.value.value"
              :error-messages="memberPermissionForm.form.associationId.errorMessage.value"
              @blur="memberPermissionForm.form.associationId.handleBlur"
              :items="associationsList"
              item-title="nom"
              item-value="id"
              required
            />
          </div>
        </div>
      </v-card-text>
      <div class="AddPermissionForm__actions">
        <v-btn @click="confirmAddEditPermission" color="main-purple">{{
          $t('adminMembers.addEditDialog.confirm')
        }}</v-btn>
        <v-btn @click="showAddEditDialog = false">{{
          $t('adminMembers.addEditDialog.cancel')
        }}</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { AdminMemberFormService } from '@/services/admin/AdminMemberFormService'
import { useAdminStore } from '@/stores/adminStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { storeToRefs } from 'pinia'
import { type ModelRef } from 'vue'

const associationsStore = useAssociationsStore()
const adminStore = useAdminStore()
const showAddEditDialog: ModelRef<boolean | undefined> = defineModel('showAddEditDialog')
const selectedAssociationId: ModelRef<string | undefined> = defineModel('selectedAssociationId')
const selectedMemberId: ModelRef<string | undefined> = defineModel('selectedMemberId')

const { associationsList } = storeToRefs(associationsStore)
const { membersList } = storeToRefs(adminStore)

const memberPermissionForm = AdminMemberFormService.getMemberPermissionForm(
  selectedMemberId.value,
  selectedAssociationId.value,
)
const confirmAddEditPermission = () => {
  adminStore.setMemberEditPermission(
    memberPermissionForm.form.memberId.value.value,
    memberPermissionForm.form.associationId.value.value,
  )
  showAddEditDialog.value = false
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
