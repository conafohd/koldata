<template>
  <div class="AssociationsMapContainer">
    <div ref="associationsMapContainer" class="AssociationsMap MapBackground">
      <div class="AssociationDescription" v-if="selectedAssociation">
        <div class="d-flex align-center">
          <div class="d-flex flex-column align-center">
            <img
              :src="selectedAssociation.logo_url"
              alt="logo"
              v-if="selectedAssociation.logo_url"
              class="AssociationDescription__logo"
            />
            <span class="AssociationDescription__title">{{ selectedAssociation.nom }}</span>
          </div>
          <v-icon
            icon="$close"
            class="ml-3 cursor-pointer"
            @click="selectedAssociation = null"
          ></v-icon>
        </div>
        <div class="mt-2 text-justify" v-if="selectedAssociation.desc">
          {{ selectedAssociation.desc }}
        </div>
        <v-btn
          variant="outlined"
          size="small"
          color="light-blue"
          class="mt-2"
          @click="associationsStore.navigateToAssociation(selectedAssociation.id)"
          >{{ $t('associations.accessToAssociation') }}</v-btn
        >
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import associationPin from '@/assets/img/association-pin.png'
import circleYellowImg from '@/assets/img/circle-yellow.png'
import type { Association } from '@/models/interfaces/Association'
import { MapService } from '@/services/MapService'
import { useAssociationsStore } from '@/stores/associationsStore'
import Spiderfy from '@nazka/map-gl-js-spiderfy'
import type { FeatureCollection, GeoJsonProperties, Point } from 'geojson'
import { GeoJSONSource, Map, NavigationControl, type Feature } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
const props = defineProps<{
  associations: Association[]
}>()
const associationsStore = useAssociationsStore()

onMounted(() => {
  initMap()
})
onUnmounted(() => {
  map.value?.remove()
})
const associationsMapContainer = ref<HTMLElement>()
const map = ref<Map>()

const mapData = computed<FeatureCollection<Point, GeoJsonProperties>>(() => {
  return {
    type: 'FeatureCollection',
    features: props.associations.map((association: Association) => ({
      type: 'Feature',
      properties: { id: association.id },
      geometry: {
        type: 'Point',
        coordinates: [association.longitude, association.latitude],
      },
    })),
  }
})

function initMap() {
  const apiKey = import.meta.env.VITE_MAPTILER_API_KEY
  map.value = new Map({
    container: associationsMapContainer.value as HTMLElement,
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
    center: [21.7587, -4.0383],
    zoom: 4,
  })
  map.value.addControl(new NavigationControl(), 'top-right')

  map.value.on('load', async () => {
    map.value?.setProjection({
      type: 'globe',
    })
    map.value?.addSource('associationsSource', {
      type: 'geojson',
      data: mapData.value,
      cluster: true,
    })
    const yellowImage = await map.value?.loadImage(circleYellowImg)
    if (yellowImage && yellowImage.data) {
      map.value?.addImage('cluster', yellowImage.data)
    }
    const associationPinImage = await map.value?.loadImage(associationPin)
    if (associationPinImage && associationPinImage.data) {
      map.value?.addImage('associationPin', associationPinImage.data)
    }
    map.value?.addLayer({
      id: 'associationsCluster',
      type: 'symbol',
      source: 'associationsSource',
      filter: ['has', 'point_count'],
      layout: {
        'icon-image': 'cluster',
        'icon-size': 0.8,
        'icon-allow-overlap': true,
      },
    })

    map.value?.addLayer({
      id: 'associations',
      type: 'symbol',
      source: 'associationsSource',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'associationPin',
        'icon-size': 0.8,
        'icon-allow-overlap': true,
      },
    })

    map.value?.on('click', 'associations', (e) => {
      const features = map.value?.queryRenderedFeatures(e.point, { layers: ['associations'] })
      if (!features || features.length === 0) return
      showAssociationPopUp(features[0].properties.id)
    })

    map.value?.addLayer({
      id: 'clusterCount',
      type: 'symbol',
      source: 'associationsSource',
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
        onLeafClick: (f: Feature) => showAssociationPopUp(f.properties.id),
        onLeafHover: (f: Feature, event: any) => {
          const canvas = event.target.getCanvas()
          if (f) {
            canvas.style.cursor = 'pointer'
          } else {
            canvas.style.cursor = ''
          }
        },
        minZoomLevel: 8,
        zoomIncrement: 2,
        spiderLeavesLayout: {
          'icon-image': 'associationPin',
          'icon-size': 0.8,
          'icon-allow-overlap': true,
        },
      } as any,
    )
    spiderfy.applyTo('associationsCluster')

    MapService.addCursorPointerOnHover(['associationsCluster', 'associations', 'clusterCount'], map.value)
  })
}

watch(
  () => props.associations,
  () => {
    if (map.value?.getSource('associationsSource')) {
      ;(map.value.getSource('associationsSource') as GeoJSONSource).setData(mapData.value)
    }
  },
)

const selectedAssociation = ref<Association | null>(null)
function showAssociationPopUp(id: string) {
  selectedAssociation.value = associationsStore.associationsList.find((a) => a.id === id) || null
}
</script>
<style lang="scss">
.AssociationsMapContainer {
  display: flex;
  flex-grow: 1;
  height: 500px;
}
.AssociationsMap {
  height: 100%;
  width: 100%;
}
.AssociationDescription {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  background-color: white;
  width: 15rem;
  height: 100%;
  max-height: 100%;
  overflow: auto;
  z-index: 3000;
  border: 1px solid rgb(var(--v-theme-main-grey));
  align-items: center;
  padding: 1rem;
}
.AssociationDescription__title {
  font-weight: 600;
  color: rgb(var(--v-theme-main-grey));
  text-align: center;
}
.AssociationDescription__logo {
  max-width: 5rem;
  height: auto;
  margin-bottom: 0.5rem;
}
</style>
