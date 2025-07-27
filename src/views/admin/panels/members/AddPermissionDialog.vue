<template>
  <v-dialog v-model="showAddDialog" max-width="400px">
    <v-card>
      <v-card-title>{{
        selectedMemberId
          ? $t('adminMembers.addDialog.titleEdit')
          : $t('adminMembers.addDialog.title')
      }}</v-card-title>
      <v-card-text>
        <div class="AddPermissionForm">
          <div class="Form__fields">
            <v-select
              variant="outlined"
              :label="$t('adminMembers.addDialog.selectMember')"
              v-model="memberPermissionForm.form.memberId.value.value"
              :error-messages="memberPermissionForm.form.memberId.errorMessage.value"
              @blur="memberPermissionForm.form.memberId.handleBlur"
              :items="membersList"
              item-title="first_name"
              item-value="id"
              required
            >
            </v-select>
          </div>
          <div class="Form__fields">
            <v-select
              variant="outlined"
              :label="$t('adminMembers.addDialog.selectAssociation')"
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
        <v-btn @click="confirmAddPermission" color="main-purple">{{
          $t('adminMembers.addDialog.confirm')
        }}</v-btn>
        <v-btn @click="showAddDialog = false">{{ $t('adminMembers.addDialog.cancel') }}</v-btn>
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
const showAddDialog: ModelRef<boolean | undefined> = defineModel('showAddDialog')
const selectedAssociationId: ModelRef<string | undefined> = defineModel('selectedAssociationId')
const selectedMemberId: ModelRef<string | undefined> = defineModel('selectedMemberId')

const { associationsList } = storeToRefs(associationsStore)
const { membersList } = storeToRefs(adminStore)

const memberPermissionForm = AdminMemberFormService.getMemberPermissionForm(
  selectedMemberId.value,
  selectedAssociationId.value,
)
const confirmAddPermission = () => {
  adminStore.setMemberPermission(
    memberPermissionForm.form.memberId.value.value,
    memberPermissionForm.form.associationId.value.value,
  )
  showAddDialog.value = false
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
