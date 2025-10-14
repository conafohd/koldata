<template>
  <div class="Projects">
    <PageHeader
      :title="$t('projects.title')"
      :active-filters-count="activeFiltersCount"
      :items-total-count="projects.length"
      :items-filters-count="filteredProjects.length"
      @reset-filters="resetFilters" />
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
      <v-autocomplete
        :label="$t('projects.filters.association')"
        :items="associations.sort((a, b) => a.nom.localeCompare(b.nom))"
        :item-title="(item) => item.nom"
        :item-value="(item) => item.id"
        v-model="selectedAssociation"
        variant="outlined"
        density="compact"
        hide-details
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
        clearable
      />
      <v-autocomplete
        :label="$t('projects.filters.province')"
        :items="adminBoundStore.provincesList"
        item-title="province"
        item-value="province_c"
        v-model="selectedProvince"
        variant="outlined"
        density="compact"
        hide-details
        multiple
        clearable
      />
      <v-autocomplete
        :label="$t('projects.filters.territory')"
        :items="territoriesList"
        item-title="territoire"
        item-value="territoire_c"
        v-model="selectedTerritory"
        variant="outlined"
        density="compact"
        hide-details
        multiple
        clearable
      />
      <v-autocomplete
        :label="$t('projects.filters.healthZone')"
        :items="healthZonesList"
        item-title="zone_sante"
        item-value="zone_sante_c"
        v-model="selectedHealthZone"
        variant="outlined"
        density="compact"
        hide-details
        multiple
        clearable
      />
      <v-text-field
        variant="outlined"
        :label="$t('projects.form.fields.date_debut_projet')"
        v-model="selectedStartDate"
        readonly
        @click="openDatePicker('start')"
        append-inner-icon="$calendar"
        @click:append-inner="openDatePicker('start')"
        density="compact"
        clearable
        hide-details
      />
      <v-text-field
        variant="outlined"
        :label="$t('projects.form.fields.date_fin_projet')"
        v-model="selectedEndDate"
        readonly
        @click="openDatePicker('end')"
        append-inner-icon="$calendar"
        @click:append-inner="openDatePicker('end')"
        density="compact"
        clearable
        hide-details
      />
      <v-select
        :label="$t('projects.filters.intervention_scope')"
        :items="Object.values(InterventionSector)"
        :item-title="(item) => $t(`intervention_sector.${item}`)"
        :item-value="(item) => item"
        v-model="selectedInterventionSector"
        variant="outlined"
        density="compact"
        hide-details
        clearable
      />
    </section>
    <div class="d-flex justify-center mt-3" v-if="!showMap">
      {{ $t('projects.loadingMap') }}
    </div>
    <div class="Projects__map MapBackground" ref="projectsMapContainer" v-show="showMap"></div>
  </div>
  <v-dialog v-model="showStartDatePicker" max-width="400px">
    <v-card>
      <v-card-title>{{ $t('projects.form.fields.date_debut_projet') }}</v-card-title>
      <v-card-text>
        <v-date-picker
          v-model="tempStartDate"
          color="light-blue"
          @update:model-value="onStartDateSelected"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="showStartDatePicker = false">{{ $t('forms.cancel') }}</v-btn>
        <v-btn @click="confirmStartDate" color="primary">{{ $t('forms.confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="showEndDatePicker" max-width="400px">
    <v-card>
      <v-card-title>{{ $t('projects.form.fields.date_fin_projet') }}</v-card-title>
      <v-card-text>
        <v-date-picker
          color="light-blue"
          v-model="tempEndDate"
          @update:model-value="onEndDateSelected"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="showEndDatePicker = false">{{ $t('forms.cancel') }}</v-btn>
        <v-btn @click="confirmEndDate" color="primary">{{ $t('forms.confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import circleYellowImg from '@/assets/img/circle-yellow.png'
import projectPin from '@/assets/img/project-pin.png'
import { InterventionSector } from '@/models/enums/InterventionSector'
import { ProjectStatus } from '@/models/enums/projects/ProjectStatus'
import { ProjectsMapService } from '@/services/projects/ProjectsMapService'
import { debounce } from '@/services/utils/Debounce'
import { formatDateToString } from '@/services/utils/FormatDate'
import { useAdminBoundariesStore } from '@/stores/adminBoundariesStore'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useProjectsStore } from '@/stores/projectsStore'
import Spiderfy from '@nazka/map-gl-js-spiderfy'
import { Map, NavigationControl, type Feature } from 'maplibre-gl'
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
import PageHeader from '../_layout/page/PageHeader.vue'
import { MapService } from '@/services/MapService'

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

const territoriesList = computed(() => {
  if (!selectedProvince.value) {
    return adminBoundStore.territoriesList
  } else {
    return adminBoundStore.territoriesList.filter((t) =>
      selectedProvince.value?.includes(t.province_c),
    )
  }
})
const healthZonesList = computed(() => {
  if (!selectedTerritory.value) {
    return adminBoundStore.healthZonesList
  } else {
    return adminBoundStore.healthZonesList.filter((h) =>
      selectedTerritory.value?.includes(h.territoire_c),
    )
  }
})

//-------------------- Filters --------------------------\\

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedAssociation = ref<string | null>(null)
const selectedProjectStatus = ref<ProjectStatus | null>(null)
const selectedProvince = ref<string[] | null>(null)
const selectedTerritory = ref<string[] | null>(null)
const selectedHealthZone = ref<string[] | null>(null)
const selectedStartDate = ref<string | null>(null)
const selectedEndDate = ref<string | null>(null)
const selectedInterventionSector: Ref<InterventionSector | null> = ref(null)
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

  if (selectedProvince.value && selectedProvince.value.length > 0) {
    result = result.filter((project) =>
      project.province.some((province) => selectedProvince.value?.includes(province)),
    )
  }

  if (selectedTerritory.value && selectedTerritory.value.length > 0) {
    result = result.filter((project) => {
      if (project.territoire) {
        return project.territoire.some((territoire) =>
          selectedTerritory.value?.includes(territoire),
        )
      }
      return false
    })
  }

  if (selectedHealthZone.value && selectedHealthZone.value.length > 0) {
    result = result.filter((project) => {
      if (project.zone_sante) {
        return project.zone_sante.some((zone) => selectedHealthZone.value?.includes(zone))
      }
      return false
    })
  }

  if (selectedStartDate.value) {
    result = result.filter((project) => {
      if (project.date_debut_projet) {
        return new Date(project.date_debut_projet) >= new Date(selectedStartDate.value as string)
      }
      return false
    })
  }

  if (selectedEndDate.value) {
    result = result.filter((project) => {
      if (project.date_fin_projet) {
        return new Date(project.date_fin_projet) <= new Date(selectedEndDate.value as string)
      }
      return false
    })
  }

  if (selectedInterventionSector.value) {
    result = result.filter((project) =>
      project.secteurs_intervention.includes(
        selectedInterventionSector.value as InterventionSector,
      ),
    )
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
  selectedProvince.value = null
  selectedTerritory.value = null
  selectedHealthZone.value = null
  selectedStartDate.value = null
  selectedEndDate.value = null
  selectedInterventionSector.value = null
}

const activeFiltersCount = computed(() => [
  searchQuery.value,
  selectedAssociation.value,
  selectedProjectStatus.value,
  selectedProvince.value,
  selectedTerritory.value,
  selectedHealthZone.value,
  selectedStartDate.value,
  selectedEndDate.value,
  selectedInterventionSector.value,
].filter(filter => filter != null && filter != '').length)

const showStartDatePicker = ref(false)
const showEndDatePicker = ref(false)
const tempStartDate = ref<Date | null>(null)
const tempEndDate = ref<Date | null>(null)
function openDatePicker(type: 'start' | 'end') {
  if (type === 'start') {
    tempStartDate.value = selectedStartDate.value ? new Date(selectedStartDate.value) : null
    showStartDatePicker.value = true
  } else {
    tempEndDate.value = selectedEndDate.value ? new Date(selectedEndDate.value) : null
    showEndDatePicker.value = true
  }
}
function onStartDateSelected(date: Date | null) {
  tempStartDate.value = date
}

function onEndDateSelected(date: Date | null) {
  tempEndDate.value = date
}

function confirmStartDate() {
  if (tempStartDate.value) {
    selectedStartDate.value = formatDateToString(tempStartDate.value)
  }
  showStartDatePicker.value = false
}

function confirmEndDate() {
  if (tempEndDate.value) {
    selectedEndDate.value = formatDateToString(tempEndDate.value)
  }
  showEndDatePicker.value = false
}

//-------------------- Map --------------------------\\

const projectsMapContainer = ref<HTMLElement>()
const map = ref<Map>()
const projectsGeojson: Ref<any> = ref(null)
const showMap = ref(false)
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
  map.value.addControl(new NavigationControl(), 'top-right')

  map.value.on('load', async () => {
    showMap.value = true
    map.value?.setProjection({
      type: 'globe',
    })
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
        onLeafHover: (f: Feature, event: any) => {
          const canvas = event.target.getCanvas()
          canvas.style.cursor = f ? 'pointer' : ''
        },
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
    
    MapService.addCursorPointerOnHover(['projectsCluster', 'projects', 'clusterCount'], map.value)
  })
}

watch([() => filteredProjects.value, () => adminBoundStore.provincesList], () => {
  projectsGeojson.value = ProjectsMapService.getProjectsGeoJson(filteredProjects.value) as any
  if (map.value) {
    const source = map.value.getSource('projectsSource')
    if (source) {
      ;(source as any).setData(ProjectsMapService.getProjectsGeoJson(filteredProjects.value))
    }
  } else {
    initMap()
  }
})

function setSelectedProject(id: string) {
  const project = projectsStore.projectsList.find((project) => project.id === id)
  if (project) {
    projectsStore.showAssociationInProjectCard = true
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

  &__filters {
    display: grid;
    grid-template-columns: repeat(4, minmax(12rem, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    align-items: end;

    @media (max-width: $bp-sm) {
      grid-template-columns: 1fr;
    }

    @media (max-width: $bp-lg) and (min-width: $bp-sm) {
      grid-template-columns: 1fr 1fr;
    }

    @media (min-width: $bp-lg) {
      > *:first-child {
        grid-column: span 2;
      }
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
  text-align: center;
}
</style>
