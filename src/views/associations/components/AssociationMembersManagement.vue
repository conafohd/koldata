<template>
  <div class="AssociationMembers">
    <div class="AssociationMembers__header">
      <h2 class="PageSubtitle">{{ $t('associations.members.title') }}</h2>
      <v-text-field
        v-model="searchQuery"
        variant="outlined"
        density="compact"
        append-inner-icon="$magnify"
        :label="$t('associations.members.search')"
        :placeholder="$t('associations.members.searchPlaceholder')"
        clearable
        hide-details
        class="AssociationMembers__search"
      />
    </div>

    <v-data-table
      :headers="headers"
      :items="filteredMembers"
      item-key="id"
      :items-per-page="-1"
      hide-default-footer
    >
      <template #item.role="{ item }">
        <div class="AssociationMembers__status">
          <v-chip
            :color="item.role === UserRole.PENDING ? 'orange-darken-1' : 'main-blue'"
            size="small"
            variant="flat"
          >
            {{ $t(`associations.members.status.${item.role}`) }}
          </v-chip>
        </div>
      </template>

      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template #item.actions="{ item }">
        <div class="AssociationMembers__actions">
          <v-tooltip v-if="item.role === UserRole.PENDING" :text="$t('associations.members.table.approve')">
            <template #activator="{ props }">
              <v-icon
                v-bind="props"
                icon="$checkCircleOutline"
                color="light-blue"
                class="mr-2 cursor-pointer"
                @click.stop="openDialog('approve', item)"
              />
            </template>
          </v-tooltip>
          <v-tooltip :text="$t('associations.members.table.delete')">
            <template #activator="{ props }">
              <v-icon
                v-bind="props"
                icon="$trashCanOutline"
                color="main-purple"
                class="cursor-pointer"
                @click.stop="openDialog('delete', item)"
              />
            </template>
          </v-tooltip>
        </div>
      </template>

      <template #bottom />
      <template #no-data>
        <div class="py-6 text-center">
          {{ $t('associations.members.empty') }}
        </div>
      </template>
    </v-data-table>

    <v-dialog v-model="showDialog" max-width="440px">
      <v-card>
        <v-card-title>
          {{
            $t(
              selectedAction === 'approve'
                ? 'associations.members.dialog.approveTitle'
                : 'associations.members.dialog.deleteTitle',
            )
          }}
        </v-card-title>
        <v-card-text>
          {{
            $t(
              selectedAction === 'approve'
                ? 'associations.members.dialog.approveMessage'
                : 'associations.members.dialog.deleteMessage',
            )
          }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDialog = false">
            {{ $t('associations.members.dialog.cancel') }}
          </v-btn>
          <v-btn
            :color="selectedAction === 'approve' ? 'light-blue' : 'main-purple'"
            @click="confirmAction"
          >
            {{ $t('associations.members.dialog.confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { UserRole } from '@/models/enums/UserRole'
import type { UserInfos } from '@/models/interfaces/UserInfos'
import { i18n } from '@/plugins/i18n'
import { debounce } from '@/services/utils/Debounce'
import { useAdminStore } from '@/stores/adminStore'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  associationId: string
}>()

const adminStore = useAdminStore()
const { associationMembersList } = storeToRefs(adminStore)

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedMember = ref<UserInfos | null>(null)
const selectedAction = ref<'approve' | 'delete'>('approve')
const showDialog = ref(false)

const updateSearchQuery = debounce((value: string) => {
  debouncedSearchQuery.value = value
}, 300)

watch(searchQuery, (newValue) => {
  updateSearchQuery(newValue)
})

const sortedMembers = computed(() => {
  return [...associationMembersList.value].sort((a, b) => {
    if (a.role !== b.role) {
      return a.role === UserRole.PENDING ? -1 : 1
    }

    if (a.role === UserRole.PENDING && b.role === UserRole.PENDING) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }

    return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
  })
})

const filteredMembers = computed(() => {
  if (!debouncedSearchQuery.value) {
    return sortedMembers.value
  }

  const normalizedQuery = debouncedSearchQuery.value.toLowerCase()

  return sortedMembers.value.filter((member) =>
    member.first_name.toLowerCase().includes(normalizedQuery)
    || member.last_name.toLowerCase().includes(normalizedQuery)
    || member.email.toLowerCase().includes(normalizedQuery),
  )
})

const headers = [
  { title: i18n.t('associations.members.table.status'), key: 'role' },
  { title: i18n.t('associations.members.table.firstName'), key: 'first_name' },
  { title: i18n.t('associations.members.table.lastName'), key: 'last_name' },
  { title: i18n.t('associations.members.table.email'), key: 'email' },
  { title: i18n.t('associations.members.table.createdAt'), key: 'created_at' },
  { title: i18n.t('associations.members.table.actions'), key: 'actions', sortable: false },
]

onMounted(async () => {
  await adminStore.getAssociationMembers(props.associationId)
})

function openDialog(action: 'approve' | 'delete', member: UserInfos) {
  selectedAction.value = action
  selectedMember.value = member
  showDialog.value = true
}

async function confirmAction() {
  if (!selectedMember.value) {
    return
  }

  if (selectedAction.value === 'approve') {
    await adminStore.approveAssociationMember(selectedMember.value.id, props.associationId)
  } else {
    await adminStore.deleteAssociationMember(selectedMember.value.id, props.associationId)
  }

  showDialog.value = false
  selectedMember.value = null
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped lang="scss">
.AssociationMembers {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}

.AssociationMembers__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;

  @media (max-width: $bp-sm) {
    flex-direction: column;
    align-items: stretch;
  }
}

.AssociationMembers__search {
  width: 20em;

  @media (max-width: $bp-sm) {
    width: 100%;
  }
}

.AssociationMembers__status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.AssociationMembers__actions {
  display: flex;
  align-items: center;
}
</style>
