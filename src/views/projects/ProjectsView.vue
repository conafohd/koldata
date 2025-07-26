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
import circleYellowImg from '@/assets/img/circle-yellow.png'
import projectPin from '@/assets/img/project-pin.png'
import { ProjectStatus } from '@/models/enums/projects/ProjectStatus'
import { ProjectsMapService } from '@/services/projects/ProjectsMapService'
import { debounce } from '@/services/utils/Debounce'
import { useAdminBoundariesStore } from '@/stores/adminBoundariesStore'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useProjectsStore } from '@/stores/projectsStore'
import Spiderfy from '@nazka/map-gl-js-spiderfy'
import { Map, type Feature } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { storeToRefs } from 'pinia'
import {
  computed,
  nextTick,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type Ref,
} from 'vue'

const applicationStore = useApplicationStore()
const projectsStore = useProjectsStore()
const associationsStore = useAssociationsStore()
const adminBoundStore = useAdminBoundariesStore()
const { projectsList: projects } = storeToRefs(projectsStore)
const { associationsList: associations } = storeToRefs(associationsStore)
onBeforeMount(async () => {
  await projectsStore.getProjectsList()
  await associationsStore.getAssociationsList()
  await adminBoundStore.fetchBoundaries()
})
onMounted(async () => {
  applicationStore.isLoading = false
  await nextTick()
  projectsGeojson.value = ProjectsMapService.getProjectsGeoJson(projects.value)
  initMap()
})

onUnmounted(() => {
  map.value?.remove()
})

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedAssociation = ref<string | null>(null)
const selectedProjectStatus = ref<ProjectStatus | null>(null)
const updateSearchQuery = debounce((value: string) => {
  debouncedSearchQuery.value = value
}, 300)

watch(searchQuery, (newValue) => {
  updateSearchQuery(newValue)
})
const filteredProjects = computed(() => {
  let result = projects.value

  if (selectedAssociation.value) {
    result = result.filter((project) => project.association_id === selectedAssociation.value)
  }

  if (selectedProjectStatus.value) {
    result = result.filter((project) => project.statut_projet === selectedProjectStatus.value)
  }

  if (debouncedSearchQuery.value) {
    const query = debouncedSearchQuery.value.toLowerCase()
    result = result.filter((project) => project.intitule_projet.toLowerCase().includes(query))
  }

  return result
})
function resetFilters() {
  searchQuery.value = ''
  selectedAssociation.value = null
  selectedProjectStatus.value = null
}

const projectsMapContainer = ref<HTMLElement>()
const map = ref<Map>()
const projectsGeojson: Ref<any> = ref(null)
function initMap() {
  if (!projectsMapContainer.value) return
  if (!projectsGeojson.value || projectsGeojson.value.features.length === 0) return

  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY
  map.value = new Map({
    container: projectsMapContainer.value,
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
    center: [21.7587, -4.0383],
    zoom: 4,
  })

  map.value.on('load', async () => {
    map.value?.addSource('projectsSource', {
      type: 'geojson',
      data: projectsGeojson.value,
      cluster: true,
    })

    const yellowImage = await map.value?.loadImage(circleYellowImg)
    if (yellowImage && yellowImage.data) {
      map.value?.addImage('cluster', yellowImage.data)
    }
    const projectPinImage = await map.value?.loadImage(projectPin)
    if (projectPinImage && projectPinImage.data) {
      map.value?.addImage('projectPin', projectPinImage.data)
    }

    map.value?.addLayer({
      id: 'projectsCluster',
      type: 'symbol',
      source: 'projectsSource',
      filter: ['has', 'point_count'],
      layout: {
        'icon-image': 'cluster',
        'icon-size': 0.8,
        'icon-allow-overlap': true,
      },
    })

    map.value?.addLayer({
      id: 'projects',
      type: 'symbol',
      source: 'projectsSource',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'projectPin',
        'icon-size': 0.8,
        'icon-allow-overlap': true,
      },
    })

    map.value?.on('click', 'projects', (e) => {
      const features = map.value?.queryRenderedFeatures(e.point, { layers: ['projects'] })
      if (!features || features.length === 0) return
      setSelectedProject(features[0].properties.id)
    })

    map.value?.addLayer({
      id: 'clusterCount',
      type: 'symbol',
      source: 'projectsSource',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
    })

    const spiderfy = new Spiderfy(
      map.value as any,
      {
        onLeafClick: (f: Feature) => setSelectedProject(f.properties.id),
        minZoomLevel: 8,
        zoomIncrement: 2,
        spiderLeavesLayout: {
          'icon-image': 'projectPin',
          'icon-size': 0.8,
          'icon-allow-overlap': true,
        },
      } as any,
    )
    spiderfy.applyTo('projectsCluster')
  })
}

watch(
  [() => filteredProjects.value, () => adminBoundStore.provincesList],
  () => {
    projectsGeojson.value = ProjectsMapService.getProjectsGeoJson(filteredProjects.value) as any
    if (map.value) {
      const source = map.value.getSource('projectsSource')
      if (source) {
        ;(source as any).setData(ProjectsMapService.getProjectsGeoJson(filteredProjects.value))
      }
    } else {
      initMap()
    }
  },
  { deep: true },
)

function setSelectedProject(id: string) {
  const project = projectsStore.projectsList.find((project) => project.id === id)
  if (project) {
    projectsStore.selectedProject = project
  }
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
