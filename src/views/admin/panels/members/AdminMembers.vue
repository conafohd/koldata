<template>
  <div class="AdminMembers mt-4">
    <div class="AdminMembers__header">
      <h1 class="PageSubtitle">{{ $t('adminMembers.title') }}</h1>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn color="main-purple" v-bind="props" prepend-icon="$arrowDownBoldCircleOutline">
            {{ $t('adminMembers.add') }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="addNewEditPermission()">
            <v-list-item-title
              ><v-icon icon="$circleEditOutline" class="mr-2"></v-icon
              >{{ $t('adminMembers.addEditor') }}</v-list-item-title
            >
          </v-list-item>
          <v-list-item @click="addNewCreatePermission()">
            <v-list-item-title
              ><v-icon icon="$plusCircleOutline" class="mr-2"></v-icon
              >{{ $t('adminMembers.addCreator') }}</v-list-item-title
            >
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <div>
      <v-data-table
        :headers="headers"
        :items="editorsList"
        item-key="name"
        :items-per-page="-1"
        hide-default-footer
      >
        <template #item.role="{ item }">
          <v-tooltip :text="$t('adminMembers.membersTable.editTooltip')">
            <template #activator="{ props }">
              <v-icon
                v-if="item.role === UserRole.EDITOR"
                icon="$circleEditOutline"
                v-bind="props"
              ></v-icon>
            </template>
          </v-tooltip>
          <v-tooltip :text="$t('adminMembers.membersTable.createTooltip')">
            <template #activator="{ props }">
              <v-icon
                v-if="item.role === UserRole.CREATOR"
                icon="$plusCircleOutline"
                v-bind="props"
              ></v-icon>
            </template>
            <span>{{ $t('adminMembers.membersTable.createTooltip') }}</span>
          </v-tooltip>
        </template>
        <template #item.actions="{ item }">
          <v-icon
            icon="$squareEditOutline"
            class="mr-1 cursor-pointer"
            color="light-blue"
            @click.stop="editMemberPermission(item.id, item.edit_association_id)"
            v-if="item.role === UserRole.EDITOR"
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
  <AddEditPermissionDialog
    v-if="showAddEditDialog"
    v-model:showAddEditDialog="showAddEditDialog"
    v-model:selectedMemberId="selectedMemberId"
    v-model:selectedAssociationId="selectedAssociationId"
  />
  <AddCreationPermissionDialog
    v-if="showAddCreateDialog"
    v-model:showAddCreateDialog="showAddCreateDialog"
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
import AddCreationPermissionDialog from './AddCreationPermissionDialog.vue'
import AddEditPermissionDialog from './AddEditPermissionDialog.vue'
import DeletePermissionDialog from './DeletePermissionDialog.vue'

const adminStore = useAdminStore()
const associationsStore = useAssociationsStore()
const { membersList } = storeToRefs(adminStore)
const editorsList = computed(() => {
  return membersList.value.filter(
    (member: UserInfos) => member.role === UserRole.EDITOR || member.role === UserRole.CREATOR,
  )
})

onMounted(async () => {
  await Promise.all([associationsStore.getAssociationsList(), adminStore.getAdminMembers()])
})

const headers = [
  { title: i18n.t('adminMembers.membersTable.editRight'), key: 'role' },
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

const showAddEditDialog = ref(false)
const selectedAssociationId = ref('')
const selectedMemberId = ref('')
function editMemberPermission(memberId: string, associationId: string) {
  selectedAssociationId.value = associationId
  selectedMemberId.value = memberId
  showAddEditDialog.value = true
}

function addNewEditPermission() {
  console.log('da')
  selectedAssociationId.value = ''
  selectedMemberId.value = ''
  showAddEditDialog.value = true
}

const showAddCreateDialog = ref(false)
function addNewCreatePermission() {
  selectedAssociationId.value = ''
  selectedMemberId.value = ''
  showAddCreateDialog.value = true
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
