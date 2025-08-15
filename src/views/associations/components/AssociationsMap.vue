<template>
  <div class="AssociationsMapContainer">
    <div ref="associationsMapContainer" class="AssociationsMap"></div>
  </div>
</template>
<script lang="ts" setup>
import associationPin from '@/assets/img/association-pin.png'
import circleYellowImg from '@/assets/img/circle-yellow.png'
import type { Association } from '@/models/interfaces/Association'
import { useAssociationsStore } from '@/stores/associationsStore'
import Spiderfy from '@nazka/map-gl-js-spiderfy'
import { Map, type Feature } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
const mapData = computed(() => {
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

  map.value.on('load', async () => {
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
  })
}

const selectedAssociation = ref<Association | null>(null)
function showAssociationPopUp(id: string) {
  // Implement the logic to handle the selected association
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
</style>
