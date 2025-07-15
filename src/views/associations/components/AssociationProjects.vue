<template>
  <div class="Projects__ctn ContentCard">
    <div class="Projects__header">
      <span class="ContentCard__title">
        <v-icon icon="$informationSlabBoxOutline" class="mr-1" color="light-blue"></v-icon>
        {{ $t('associations.projectsLabel') }}
      </span>
      <v-btn
        :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
        prepend-icon="$plus"
        @click="addProject"
        v-if="hasEditPermission"
        >{{ $t('associations.addProject') }}</v-btn
      >
    </div>
    <div class="Projects__table">
      <v-data-table :headers="headers" :items="projects" item-key="name" hide-default-footer>
        <template #item.intitule_projet="{ value }">
          {{ value }}
          <v-tooltip :text="$t('admin.disclaimer')">
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
                    @click="validateProject(value)"
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
                @click="editProject(value)"
                v-if="hasEditPermission"
              ></v-icon>
              <v-icon
                icon="$trashCanOutline"
                class="cursor-pointer"
                color="main-purple"
                v-if="authStore.isAdmin"
              ></v-icon>
            </template>
          </div>
        </template>
      </v-data-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ProjectStatus } from '@/models/enums/projects/ProjectStatus'
import type { Project } from '@/models/interfaces/Project'
import { i18n } from '@/plugins/i18n'
import { useAuthenticationStore } from '@/stores/authStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { onBeforeMount } from 'vue'

const props = defineProps<{
  projects: Project[]
  associationId: string
}>()

const authStore = useAuthenticationStore()
const projectsStore = useProjectsStore()

const hasEditPermission =
  authStore.isAdmin || authStore.userInfos?.edit_association_id === props.associationId

function editProject(projectId: string) {
  projectsStore.activeProjectEdition(projectId)
}

function addProject() {
  projectsStore.activeProjectCreation(props.associationId)
}

function validateProject(projectId: string) {
  projectsStore.activeNewProjectEdition(projectId)
}

const headers = [
  { title: i18n.t('projects.associationTable.intitule_projet'), key: 'intitule_projet' },
  { title: i18n.t('projects.associationTable.statut_projet'), key: 'statut_projet' },
  {
    title: i18n.t('projects.associationTable.noms_bailleurs_fonds'),
    key: 'noms_bailleurs_fonds',
    value: (item: Project) => item.noms_bailleurs_fonds.join(', '),
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
    return item.date_debut_projet + ' - ' + item.date_fin_projet
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
