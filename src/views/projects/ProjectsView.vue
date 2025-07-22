<template>
  <div class="Projects">
    <header class="Projects__header">
      <div class="d-flex align-center">
        <h1 class="PageTitle">{{ $t('projects.title') }}</h1>
        <v-chip color="main-blue" class="ml-2" size="small">{{ projects.length }}</v-chip>
      </div>
      <div class="d-flex align-center">
        <v-chip color="light-blue" class="mr-2" size="small">{{ filteredProjects.length }}</v-chip>
        <v-btn variant="text" size="small" class="Projects__reset-btn" @click="resetFilters">
          {{ $t('associations.resetFilters') }}
        </v-btn>
      </div>
    </header>
    <section class="Projects__filters">
      <v-text-field
        :placeholder="$t('projects.filters.search')"
        variant="outlined"
        density="compact"
        hide-details
        class="Projects__search-field"
        v-model="searchQuery"
        clearable
      />
      <v-select
        :label="$t('projects.filters.association')"
        :items="associations.sort((a, b) => a.nom.localeCompare(b.nom))"
        :item-title="(item) => item.nom"
        :item-value="(item) => item.id"
        v-model="selectedAssociation"
        variant="outlined"
        density="compact"
        hide-details
        class="Projects__select"
        clearable
      />
      <v-select
        :label="$t('projects.filters.status')"
        :items="Object.values(ProjectStatus)"
        :item-title="(item) => $t(`projects.form.lists.projectStatus.${item}`)"
        :item-value="(item) => item"
        v-model="selectedProjectStatus"
        variant="outlined"
        density="compact"
        hide-details
        class="Projects__select"
        clearable
      />
    </section>
    <div class="Projects__map" ref="projectsMapContainer"></div>
  </div>
</template>
<script setup lang="ts">
import { ProjectStatus } from '@/models/enums/projects/ProjectStatus'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { Map } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeMount, onMounted, ref } from 'vue'

const applicationStore = useApplicationStore()
const projectsStore = useProjectsStore()
const associationsStore = useAssociationsStore()
const { projectsList: projects } = storeToRefs(projectsStore)
const { associationsList: associations } = storeToRefs(associationsStore)
onBeforeMount(() => {
  projectsStore.getProjectsList()
  associationsStore.getAssociationsList()
})
onMounted(async () => {
  applicationStore.isLoading = false
  await nextTick()
  initMap()
})

const searchQuery = ref('')
const selectedAssociation = ref<string | null>(null)
const selectedProjectStatus = ref<ProjectStatus | null>(null)
const filteredProjects = computed(() => {
  if (!searchQuery.value && !selectedProjectStatus.value && !selectedAssociation.value) {
    return projects.value
  }
  const projectsFilteredByAssociation = selectedAssociation.value
    ? projects.value.filter((project) => project.association_id === selectedAssociation.value)
    : projects.value
  const projectsFilteredByStatus = selectedProjectStatus.value
    ? projectsFilteredByAssociation.filter(
        (project) => project.statut_projet === selectedProjectStatus.value,
      )
    : projectsFilteredByAssociation
  return searchQuery.value
    ? projectsFilteredByStatus.filter((project) =>
        project.intitule_projet.toLowerCase().includes(searchQuery.value.toLowerCase()),
      )
    : projectsFilteredByStatus
})
function resetFilters() {
  searchQuery.value = ''
  selectedAssociation.value = null
  selectedProjectStatus.value = null
}

const projectsMapContainer = ref<HTMLElement>()
const map = ref<Map>()
function initMap() {
  if (!projectsMapContainer.value) return
  map.value = new Map({
    container: projectsMapContainer.value,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [21.7587, -4.0383],
    zoom: 4,
  })
}
</script>

<style scoped lang="scss">
.Projects {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  &__reset-btn {
    color: #666;
    font-size: 0.875rem;
    text-transform: none;
    letter-spacing: normal;
  }

  &__filters {
    display: grid;
    grid-template-columns: 1fr repeat(4, minmax(12rem, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: end;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    @media (max-width: 1024px) and (min-width: 769px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &__search-field {
    min-width: 15rem;
  }
}
.Projects__map {
  width: 100%;
  min-width: 100%;
  min-height: 32rem;
}
</style>
