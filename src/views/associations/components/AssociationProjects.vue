<template>
  <div class="Projects__ctn ContentCard">
    <div class="Projects__header">
      <span class="ContentCard__title">
        <v-icon icon="$applicationArrayOutline" class="mr-1" color="light-blue"></v-icon>
        {{ $t('associations.projectsLabel') }}
      </span>
      <v-btn
        :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
        prepend-icon="$plus"
        @click="addProject"
        v-if="hasEditPermission && !appStore.mobile"
        >{{ $t('associations.addProject') }}</v-btn
      >
    </div>
    <div class="Projects__table">
      <v-data-table
        :headers="appStore.mobile ? headersMobile : headers"
        :items="projects"
        item-key="name"
        hide-default-footer
        @click:row="handleRowClick"
      >
        <template #item.intitule_projet="{ value }">
          {{ value }}
          <v-tooltip :text="$t('admin.disclaimer')" v-if="hasEditPermission">
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                icon="$timerEditOutline"
                :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
                class="ml-2"
                v-if="projects.find((p) => p.intitule_projet === value)?.waiting_for_validation"
              ></v-icon>
            </template>
          </v-tooltip>
          <v-tooltip :text="$t('projects.associationTable.newProject')">
            <template v-slot:activator="{ props }">
              <v-icon
                v-bind="props"
                icon="$newBox"
                :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
                class="ml-2"
                v-if="projects.find((p) => p.intitule_projet === value)?.newProject"
              ></v-icon>
            </template>
          </v-tooltip>
        </template>
        <template #item.statut_projet="{ value }">
          <v-chip
            :border="`${getStatusColor(value)} thin opacity-25`"
            :color="getStatusColor(value)"
            :text="getStatusValue(value)"
          />
        </template>
        <template #item.actions="{ value }">
          <div class="d-flex justify-center">
            <template v-if="projects.find((p) => p.id === value)?.newProject">
              <v-tooltip
                :text="$t('projects.associationTable.validateNewProject')"
                v-if="authStore.isAdmin"
              >
                <template v-slot:activator="{ props }">
                  <v-icon
                    v-bind="props"
                    icon="$fileCheckOutline"
                    class="cursor-pointer"
                    color="main-purple"
                    @click.stop="validateProject(value)"
                  ></v-icon>
                </template>
              </v-tooltip>
              <v-tooltip :text="$t('projects.associationTable.validationPending')" v-else>
                <template v-slot:activator="{ props }">
                  <v-icon v-bind="props" icon="$receiptClock" color="main-grey"></v-icon>
                </template>
              </v-tooltip>
            </template>
            <template v-else>
              <v-icon
                icon="$squareEditOutline"
                class="mr-1 cursor-pointer"
                color="light-blue"
                @click.stop="editProject(value)"
                v-if="hasEditPermission"
              ></v-icon>
              <v-icon
                icon="$trashCanOutline"
                class="cursor-pointer"
                color="main-purple"
                v-if="authStore.isAdmin"
                @click.stop="deleteProject(value)"
              ></v-icon>
            </template>
          </div>
        </template>
      </v-data-table>
    </div>
  </div>
  <v-dialog v-model="showDeleteDialog" max-width="400px">
    <v-card>
      <v-card-title>{{ $t('projects.deleteProject') }}</v-card-title>
      <v-card-text>
        {{ $t('projects.confirmDeleteProject') }}
      </v-card-text>
      <v-card-actions>
        <v-btn @click="confirmDeleteProject">{{ $t('projects.confirm') }}</v-btn>
        <v-btn @click="showDeleteDialog = false">{{ $t('projects.cancel') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { ProjectFunder } from '@/models/enums/projects/ProjectFunder'
import { ProjectStatus } from '@/models/enums/projects/ProjectStatus'
import type { Project } from '@/models/interfaces/Project'
import { i18n } from '@/plugins/i18n'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { onBeforeMount, ref } from 'vue'

const props = defineProps<{
  projects: Project[]
  associationId: string
}>()

const authStore = useAuthenticationStore()
const projectsStore = useProjectsStore()
const appStore = useApplicationStore()

const hasEditPermission =
  authStore.isAdmin || authStore.userInfos?.edit_association_id === props.associationId

function handleRowClick(e: MouseEvent, item: any) {
  projectsStore.selectedProject = item.item
}

function editProject(projectId: string) {
  projectsStore.activeProjectEdition(projectId)
}

function addProject() {
  projectsStore.activeProjectCreation(props.associationId)
}

function validateProject(projectId: string) {
  projectsStore.activeNewProjectEdition(projectId)
}

const showDeleteDialog = ref(false)
const projectToDelete = ref<string | null>(null)
function deleteProject(projectId: string) {
  projectToDelete.value = projectId
  showDeleteDialog.value = true
}
function confirmDeleteProject() {
  if (projectToDelete.value) {
    projectsStore.deleteProject(projectToDelete.value)
    projectToDelete.value = null
  }
  showDeleteDialog.value = false
}

const headers = [
  { title: i18n.t('projects.associationTable.intitule_projet'), key: 'intitule_projet' },
  { title: i18n.t('projects.associationTable.statut_projet'), key: 'statut_projet' },
  {
    title: i18n.t('projects.associationTable.noms_bailleurs_fonds'),
    key: 'noms_bailleurs_fonds',
    value: (item: Project) => {
      if (!item.autre_bailleur_fonds) {
        return item.noms_bailleurs_fonds.filter((p) => p !== ProjectFunder.OTHER).join(', ')
      }
      return (
        item.noms_bailleurs_fonds.filter((p) => p !== ProjectFunder.OTHER).join(', ') +
        item.autre_bailleur_fonds
      )
    },
  },
  {
    title: i18n.t('projects.associationTable.nombre_total_personnes_cibles'),
    key: 'nombre_total_personnes_cibles',
  },
  {
    title: i18n.t('projects.associationTable.timeline'),
    key: 'timeline',
    value: (item: Project) => getTimeline(item),
  },
  {
    title: i18n.t('projects.associationTable.budget_projet'),
    key: 'budget_projet',
    value: (item: Project) => `${item.budget_projet} $`,
  },
]

const headersMobile = [
  { title: i18n.t('projects.associationTable.intitule_projet'), key: 'intitule_projet' },
  { title: i18n.t('projects.associationTable.statut_projet'), key: 'statut_projet' },
]

onBeforeMount(() => {
  if (authStore.isAdmin || authStore.userInfos?.edit_association_id === props.associationId) {
    headers.push({
      title: i18n.t('projects.associationTable.actions'),
      key: 'actions',
      value: (item: Project) => item.id,
    })
  }
})

function getTimeline(item: Project) {
  if (item.date_debut_projet && item.date_fin_projet) {
    return (
      i18n.t('projects.associationTable.from') +
      ' ' +
      new Date(item.date_debut_projet).toLocaleDateString() +
      ' ' +
      i18n.t('projects.associationTable.to') +
      ' ' +
      new Date(item.date_fin_projet).toLocaleDateString()
    )
  } else if (item.date_debut_projet) {
    return item.date_debut_projet + ' - ' + i18n.t('projects.associationTable.unknownEndDate')
  }
  return i18n.t('projects.associationTable.unknownDates')
}

function getStatusColor(status: string) {
  if (status === ProjectStatus.ON_GOING) {
    return 'main-blue'
  } else if (status === ProjectStatus.FINISHED) {
    return 'main-grey'
  }
  return 'light-grey'
}

function getStatusValue(status: string) {
  if (status === ProjectStatus.ON_GOING) {
    return i18n.t('projects.associationTable.onGoing')
  } else if (status === ProjectStatus.FINISHED) {
    return i18n.t('projects.associationTable.finished')
  }
  return i18n.t('projects.associationTable.unknown')
}
</script>

<style scoped lang="scss">
.Projects__ctn {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}
.Projects__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1;
}
</style>
