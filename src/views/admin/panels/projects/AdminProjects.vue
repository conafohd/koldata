<template>
  <div class="AdminProjects mt-4">
    <div class="AdminProjects__header">
      <h1 class="PageSubtitle">{{ $t('adminProjects.title') }}</h1>
      <v-btn color="main-purple" @click="addNewProject()">
        {{ $t('adminProjects.add') }}
      </v-btn>
    </div>
    <div class="AdminProjects__table">
      <v-data-table
        :headers="headers"
        :items="sortedProjects"
        item-key="intitule_projet"
        :items-per-page-text="$t('adminProjects.projectsTable.itemsPerPage')"
      >
        <template #item.waiting_for_validation="{ item }">
          <div class="d-flex justify-center">
            <v-icon
              icon="$closeThick"
              class="mr-1"
              color="error"
              v-if="item.waiting_for_validation"
            ></v-icon>
            <v-icon icon="$checkCircle" class="mr-1" color="success" v-else></v-icon>
          </div>
        </template>
        <template #item.actions="{ item }">
          <v-icon
            icon="$squareEditOutline"
            class="mr-1 cursor-pointer"
            color="light-blue"
            @click.stop="editProject(item.id)"
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
import { useAssociationsStore } from '@/stores/associationsStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { computed, onMounted, ref } from 'vue'
const associationsStore = useAssociationsStore()
const projectStore = useProjectsStore()

onMounted(async () => {
  await Promise.all([associationsStore.getAssociationsList(), projectStore.getProjectsList()])
})

const sortedProjects = computed(() => {
  return [...projectStore.projectsList]
    .sort((a, b) => Number(b.waiting_for_validation) - Number(a.waiting_for_validation))
    .sort((a, b) => Number(b.newProject) - Number(a.newProject))
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
.AdminProjects__table {
  overflow: auto;
  flex: 1;
}
</style>
