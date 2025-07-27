<template>
  <div class="AdminMembers">
    <div class="AdminMembers__header">
      <h1 class="PageSubtitle">{{ $t('adminMembers.title') }}</h1>
      <v-btn color="main-purple" @click="addNewPermission()"> {{ $t('adminMembers.add') }} </v-btn>
    </div>
    <div class="AdminMembers__list">
      <v-data-table :headers="headers" :items="editorsList" item-key="name" hide-default-footer>
        <template #item.actions="{ item }">
          <v-icon
            icon="$squareEditOutline"
            class="mr-1 cursor-pointer"
            color="light-blue"
            @click.stop="editMemberPermission(item.id, item.edit_association_id)"
          ></v-icon>
          <v-icon
            icon="$trashCanOutline"
            class="cursor-pointer"
            color="main-purple"
            @click.stop="deleteMemberPermission(item.id)"
          ></v-icon>
        </template>
      </v-data-table>
    </div>
  </div>
  <DeletePermissionDialog
    v-model:showDeleteDialog="showDeleteDialog"
    v-model:permissionId="permissionToDelete"
  />
  <AddPermissionDialog
    v-if="showAddDialog"
    v-model:showAddDialog="showAddDialog"
    v-model:selectedMemberId="selectedMemberId"
    v-model:selectedAssociationId="selectedAssociationId"
  />
</template>
<script setup lang="ts">
import { UserRole } from '@/models/enums/UserRole'
import type { UserInfos } from '@/models/interfaces/UserInfos'
import { i18n } from '@/plugins/i18n'
import { useAdminStore } from '@/stores/adminStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import AddPermissionDialog from './AddPermissionDialog.vue'
import DeletePermissionDialog from './DeletePermissionDialog.vue'

const adminStore = useAdminStore()
const associationsStore = useAssociationsStore()
const { membersList } = storeToRefs(adminStore)
const editorsList = computed(() => {
  return membersList.value.filter((member: UserInfos) => member.role === UserRole.EDITOR)
})

onMounted(async () => {
  await associationsStore.getAssociationsList()
  await adminStore.getAdminMembers()
})

const headers = [
  { title: i18n.t('adminMembers.membersTable.firstName'), key: 'first_name' },
  { title: i18n.t('adminMembers.membersTable.lastName'), key: 'last_name' },
  { title: i18n.t('adminMembers.membersTable.email'), key: 'email' },
  {
    title: i18n.t('adminMembers.membersTable.association'),
    key: 'edit_association_id',
    value: (item: UserInfos) =>
      associationsStore.associationsList.find(
        (association) => association.id === item.edit_association_id,
      )?.nom,
  },
  {
    title: i18n.t('adminMembers.membersTable.actions'),
    key: 'actions',
    value: (item: UserInfos) => item.id,
  },
]

const showAddDialog = ref(false)
const selectedAssociationId = ref('')
const selectedMemberId = ref('')
function editMemberPermission(memberId: string, associationId: string) {
  selectedAssociationId.value = associationId
  selectedMemberId.value = memberId
  showAddDialog.value = true
}

function addNewPermission() {
  selectedAssociationId.value = ''
  selectedMemberId.value = ''
  showAddDialog.value = true
}

const permissionToDelete = ref('')
const showDeleteDialog = ref(false)
function deleteMemberPermission(id: string) {
  permissionToDelete.value = id
  showDeleteDialog.value = true
}
</script>

<style scoped lang="scss">
.AdminMembers {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}
.AdminMembers__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
</style>
