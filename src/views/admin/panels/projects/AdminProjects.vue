<template>
  <div class="AdminProjects mt-4">
    <div class="AdminProjects__header">
      <h1 class="PageSubtitle">{{ $t('adminProjects.title') }}</h1>
      <div class="d-flex align-center">
        <v-text-field
          variant="outlined"
          density="compact"
          :label="$t('adminProjects.search')"
          :placeholder="$t('adminProjects.searchPlaceholder')"
          v-model="searchQuery"
          clearable
          hide-details
          class="AdminProjects__search mr-4"
        />
        <v-btn color="main-purple" @click="addNewProject()">
          {{ $t('adminProjects.add') }}
        </v-btn>
      </div>
    </div>
    <div class="AdminProjects__table">
      <v-data-table
        :headers="headers"
        :items="filteredProjects"
        item-key="intitule_projet"
        :items-per-page-text="$t('adminProjects.projectsTable.itemsPerPage')"
      >
        <template #item.waiting_for_validation="{ item }">
          <div class="d-flex justify-center">
            <v-icon
              icon="$closeThick"
              class="mr-1"
              color="error"
              v-if="item.waiting_for_validation || item.newProject"
            ></v-icon>
            <v-icon icon="$checkCircle" class="mr-1" color="success" v-else></v-icon>
          </div>
        </template>
        <template #item.actions="{ item }">
          <v-icon
            icon="$squareEditOutline"
            class="mr-1 cursor-pointer"
            color="light-blue"
            @click.stop="item.newProject ? validateNewProject(item.id) : editProject(item.id)"
          ></v-icon>
          <v-icon
            icon="$trashCanOutline"
            class="cursor-pointer"
            color="main-purple"
            @click.stop="deleteProject(item.id)"
          ></v-icon>
        </template>
      </v-data-table>
    </div>
  </div>
  <v-dialog v-model="showCreateDialog" max-width="400px">
    <v-card>
      <v-card-title>{{ $t('adminProjects.add') }}</v-card-title>
      <v-card-text>
        <div class="d-flex flex-column ga-6">
          <span>{{ $t('adminProjects.addMessage') }}</span>
          <v-autocomplete
            :items="associationsStore.associationsList"
            item-title="nom"
            item-value="id"
            variant="outlined"
            :label="$t('adminProjects.selectAssociation')"
            v-model="associationToAddProject"
          />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="confirmAddNewProject">{{ $t('adminProjects.confirm') }}</v-btn>
        <v-btn @click="showCreateDialog = false">{{ $t('adminProjects.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showDeleteDialog" max-width="400px">
    <v-card>
      <v-card-title>{{ $t('adminProjects.delete') }}</v-card-title>
      <v-card-text>
        {{ $t('adminProjects.deleteMessage') }}
      </v-card-text>
      <v-card-actions>
        <v-btn @click="confirmDeleteProject">{{ $t('adminProjects.confirm') }}</v-btn>
        <v-btn @click="showDeleteDialog = false">{{ $t('adminProjects.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Project } from '@/models/interfaces/Project'
import { i18n } from '@/plugins/i18n'
import { debounce } from '@/services/utils/Debounce'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { computed, onMounted, ref, watch } from 'vue'
const associationsStore = useAssociationsStore()
const projectStore = useProjectsStore()

onMounted(async () => {
  await Promise.all([associationsStore.getAssociationsList(), projectStore.getProjectsList()])
})

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const updateSearchQuery = debounce((value: string) => {
  debouncedSearchQuery.value = value
}, 300)
watch(searchQuery, (newValue) => {
  updateSearchQuery(newValue)
})

const sortedProjects = computed(() => {
  return [...projectStore.projectsList, ...projectStore.newProjectsList]
    .sort((a, b) => Number(!!b.waiting_for_validation) - Number(!!a.waiting_for_validation))
    .sort((a, b) => Number(!!b.newProject) - Number(!!a.newProject))
})

const filteredProjects = computed(() => {
  if (debouncedSearchQuery.value) {
    return sortedProjects.value.filter((project) =>
      project.intitule_projet.toLowerCase().includes(debouncedSearchQuery.value.toLowerCase()),
    )
  }
  return sortedProjects.value
})
const headers = [
  { title: i18n.t('adminProjects.projectsTable.name'), key: 'intitule_projet' },
  { title: i18n.t('adminProjects.projectsTable.status'), key: 'statut_projet' },
  { title: i18n.t('adminProjects.projectsTable.update'), key: 'waiting_for_validation' },
  {
    title: i18n.t('adminProjects.projectsTable.actions'),
    key: 'actions',
    value: (item: Project) => item.id,
  },
]

const showCreateDialog = ref(false)
const associationToAddProject = ref<string | null>(null)
function addNewProject() {
  showCreateDialog.value = true
}

function confirmAddNewProject() {
  projectStore.activeProjectCreation(associationToAddProject.value as string)
  showCreateDialog.value = false
  associationToAddProject.value = null
}

function validateNewProject(id: string) {
  projectStore.activeNewProjectEdition(id)
}

function editProject(id: string) {
  projectStore.activeProjectEdition(id)
}

const showDeleteDialog = ref(false)
const projectToDelete = ref<string | null>(null)
function deleteProject(id: string) {
  projectToDelete.value = id
  showDeleteDialog.value = true
}

function confirmDeleteProject() {
  if (projectToDelete.value) {
    projectStore.deleteProject(projectToDelete.value)
    projectToDelete.value = null
  }
  showDeleteDialog.value = false
}
</script>

<style scoped lang="scss">
.AdminProjects {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}
.AdminProjects__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.AdminProjects__search {
  width: 25rem;
}
.AdminProjects__table {
  overflow: auto;
  flex: 1;
}
</style>
