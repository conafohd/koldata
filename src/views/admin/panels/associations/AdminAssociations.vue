<template>
  <div class="AdminAssociations mt-4">
    <div class="AdminAssociations__header">
      <h1 class="PageSubtitle">{{ $t('adminAssociations.title') }}</h1>
      <div class="d-flex align-center">
        <v-text-field
          variant="outlined"
          density="compact"
          append-inner-icon="$magnify"
          :label="$t('adminAssociations.search')"
          :placeholder="$t('adminAssociations.searchPlaceholder')"
          v-model="searchQuery"
          clearable
          hide-details
          class="AdminAssociations__search mr-4"
        />
        <v-btn color="main-purple" @click="addNewAssociation()">
          {{ $t('adminAssociations.add') }}
        </v-btn>
      </div>
    </div>
    <div class="AdminAssociations__table">
      <v-data-table
        :headers="headers"
        :items="filteredAssociations"
        item-key="name"
        :items-per-page-text="$t('adminAssociations.associationsTable.itemsPerPage')"
      >
        <template #item.nom="{ item }">
          {{ item.nom }}
          <v-icon
            icon="$newBox"
            color="main-purple"
            class="ml-2"
            v-if="item.newAssociation"
          ></v-icon>
        </template>
        <template #item.waiting_for_validation="{ item }">
          <div class="d-flex justify-center">
            <v-icon
              icon="$closeThick"
              class="mr-1"
              color="error"
              v-if="item.waiting_for_validation || item.newAssociation"
            ></v-icon>
            <v-icon icon="$checkCircle" class="mr-1" color="success" v-else></v-icon>
          </div>
        </template>
        <template #item.actions="{ item }">
          <v-icon
            icon="$squareEditOutline"
            class="mr-1 cursor-pointer"
            color="light-blue"
            @click.stop="
              item.newAssociation ? validateNewAssociation(item.id) : editAssociation(item.id)
            "
          ></v-icon>
          <v-icon
            icon="$trashCanOutline"
            class="cursor-pointer"
            color="main-purple"
            @click.stop="deleteAssociation(item.id)"
          ></v-icon>
        </template>
      </v-data-table>
    </div>
  </div>
  <v-dialog v-model="showDeleteDialog" max-width="400px">
    <v-card>
      <v-card-title>{{ $t('adminAssociations.delete') }}</v-card-title>
      <v-card-text>
        {{ $t('adminAssociations.deleteMessage') }}
      </v-card-text>
      <v-card-actions>
        <v-btn @click="confirmDeleteAssociation">{{ $t('adminAssociations.confirm') }}</v-btn>
        <v-btn @click="showDeleteDialog = false">{{ $t('adminAssociations.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Association } from '@/models/interfaces/Association'
import { i18n } from '@/plugins/i18n'
import { debounce } from '@/services/utils/Debounce'
import { useAssociationsStore } from '@/stores/associationsStore'
import { computed, onMounted, ref, watch } from 'vue'
const associationsStore = useAssociationsStore()

onMounted(async () => {
  await associationsStore.getAssociationsList()
})

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const updateSearchQuery = debounce((value: string) => {
  debouncedSearchQuery.value = value
}, 300)
watch(searchQuery, (newValue) => {
  updateSearchQuery(newValue)
})

const sortedAssociations = computed(() => {
  return [...associationsStore.associationsList, ...associationsStore.newAssociationsList].sort(
    (a, b) => {
      const getPriority = (item: Association) => {
        if (item.newAssociation) return 3 // Highest priority
        if (item.waiting_for_validation) return 2 // Medium priority
        return 1 // Lower priority
      }

      return getPriority(b) - getPriority(a)
    },
  )
})
const filteredAssociations = computed(() => {
  if (debouncedSearchQuery.value) {
    return sortedAssociations.value.filter((association) =>
      association.nom.toLowerCase().includes(debouncedSearchQuery.value.toLowerCase()),
    )
  }
  return sortedAssociations.value
})
const headers = [
  { title: i18n.t('adminAssociations.associationsTable.name'), key: 'nom' },
  { title: i18n.t('adminAssociations.associationsTable.type'), key: 'type_org' },
  { title: i18n.t('adminAssociations.associationsTable.update'), key: 'waiting_for_validation' },
  {
    title: i18n.t('adminAssociations.associationsTable.actions'),
    key: 'actions',
    value: (item: Association) => item.id,
  },
]

function addNewAssociation() {
  associationsStore.associationToCreate = true
}

function editAssociation(id: string) {
  associationsStore.activeAssociationEdition(id as string)
}

function validateNewAssociation(id: string) {
  associationsStore.activeNewAssociationEdition(id)
}

const showDeleteDialog = ref(false)
const associationToDelete = ref<string | null>(null)

function deleteAssociation(id: string) {
  associationToDelete.value = id
  showDeleteDialog.value = true
}

function confirmDeleteAssociation() {
  if (associationToDelete.value) {
    associationsStore.removeAssociation(associationToDelete.value)
    associationToDelete.value = null
  }
  showDeleteDialog.value = false
}
</script>

<style scoped lang="scss">
.AdminAssociations {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}
.AdminAssociations__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.AdminAssociations__search {
  width: 20em;
}
.AdminAssociations__table {
  overflow: auto;
  flex: 1;
}
</style>
