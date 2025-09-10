<template>
  <div class="Geocoder">
    <v-text-field
      v-model="searchQuery"
      :label="$t('geocoding.searchLabel')"
      :placeholder="$t('geocoding.searchPlaceholder')"
      variant="outlined"
      prepend-inner-icon="$magnify"
      :loading="isSearching"
      clearable
      hide-details
      @input="handleSearchInput"
    />

    <v-list v-if="searchResults.length > 0 && searchQuery" class="Geocoder__searchResults">
      <v-list-item
        v-for="result in searchResults"
        :key="result.place_id"
        @click="selectSearchResult(result)"
        class="Geocoder__searchResults--item"
      >
        <v-list-item-title>{{ result.display_name }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <v-list v-if="searchQuery && searchResults.length === 0" class="Geocoder__searchResults">
      <v-list-item>
        <v-list-item-title v-if="isSearching">{{ $t('geocoding.searching') }}</v-list-item-title>
        <v-list-item-title v-else>{{ $t('geocoding.noResults') }}</v-list-item-title>
      </v-list-item>
    </v-list>

    <div class="Geocoder__coordinatesInput">
      <v-text-field
        v-model="latitudeInput"
        :label="$t('associations.form.fields.latitude')"
        variant="outlined"
        type="number"
        step="any"
        :error-messages="latitudeError"
        @input="handleCoordinateInput"
        :hide-details="!latitudeError"
      />
      <v-text-field
        v-model="longitudeInput"
        :label="$t('associations.form.fields.longitude')"
        variant="outlined"
        type="number"
        step="any"
        :error-messages="longitudeError"
        @input="handleCoordinateInput"
        :hide-details="!longitudeError"
      />
    </div>

    <div ref="mapContainer" class="Geocoder__mapContainer" />
  </div>
</template>

<script setup lang="ts">
import type { NominatimResult } from '@/models/interfaces/Geocoding'
import { i18n } from '@/plugins/i18n'
import { GeocodingService } from '@/services/forms/GeocodingService'
import { debounce } from '@/services/utils/Debounce'
import { Map, Marker, NavigationControl, type LngLatLike } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

interface Props {
  latitude: number | null
  longitude: number | null
  onCoordinatesChange: (lat: number, lng: number) => void
}

const props = defineProps<Props>()

const mapContainer = ref<HTMLElement>()
const map = ref<Map>()
const marker = ref<Marker>()
const searchQuery = ref('')
const searchResults = ref<NominatimResult[]>([])
const isSearching = ref(false)
const latitudeInput = ref('')
const longitudeInput = ref('')

const latitudeError = computed(() => {
  const lat = parseFloat(latitudeInput.value)
  if (isNaN(lat) || lat < -90 || lat > 90) {
    return i18n.t('geocoding.latitudeError')
  }
  return null
})
const longitudeError = computed(() => {
  const lng = parseFloat(longitudeInput.value)
  if (isNaN(lng) || lng < -180 || lng > 180) {
    return i18n.t('geocoding.longitudeError')
  }
  return null
})

const debouncedSearch = debounce(async (query: string) => {
  if (query.length < 3) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    const results = await GeocodingService.searchLocation(query)
    searchResults.value = results
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}, 300)

const debouncedCoordinateUpdate = debounce(() => {
  const lat = parseFloat(latitudeInput.value)
  const lng = parseFloat(longitudeInput.value)

  if (!isNaN(lat) && !isNaN(lng) && !latitudeError.value && !longitudeError.value) {
    updateMarkerPosition(lat, lng)
    props.onCoordinatesChange(lat, lng)
  }
}, 500)

const initializeMap = () => {
  if (!mapContainer.value) return
  map.value = new Map({
    container: mapContainer.value,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: getInitialCenter(),
    zoom: 10,
  })
  map.value.addControl(new NavigationControl(), 'top-right')
  marker.value = new Marker({ draggable: true }).setLngLat(getInitialCenter()).addTo(map.value)

  marker.value.on('dragend', () => {
    const lngLat = marker.value!.getLngLat()
    updateCoordinateInputs(lngLat.lat, lngLat.lng)
    props.onCoordinatesChange(lngLat.lat, lngLat.lng)
  })
  map.value.on('click', (event) => {
    const { lng, lat } = event.lngLat
    marker.value!.setLngLat([lng, lat])
    updateCoordinateInputs(lat, lng)
    props.onCoordinatesChange(lat, lng)
    map.value!.easeTo({
      center: [lng, lat],
      duration: 500,
    })
  })
}

const getInitialCenter = (): LngLatLike => {
  if (props.latitude && props.longitude) {
    return [props.longitude, props.latitude]
  }
  // Default to DRC center
  return [21.7587, -4.0383]
}

const updateMarkerPosition = (lat: number, lng: number) => {
  if (marker.value && map.value) {
    marker.value.setLngLat([lng, lat])
    map.value!.easeTo({
      center: [lng, lat],
      duration: 500,
    })
  }
}

const updateCoordinateInputs = (lat: number, lng: number) => {
  latitudeInput.value = lat.toFixed(6)
  longitudeInput.value = lng.toFixed(6)
}

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  debouncedSearch(searchQuery.value)
}

const handleCoordinateInput = () => {
  debouncedCoordinateUpdate()
}

const selectSearchResult = (result: NominatimResult) => {
  const lat = parseFloat(result.lat)
  const lng = parseFloat(result.lon)

  updateMarkerPosition(lat, lng)
  updateCoordinateInputs(lat, lng)
  props.onCoordinatesChange(lat, lng)

  searchResults.value = []
  searchQuery.value = ''
}

watch(
  () => [props.latitude, props.longitude],
  ([newLat, newLng]) => {
    if (newLat && newLng) {
      latitudeInput.value = newLat.toString()
      longitudeInput.value = newLng.toString()
      updateMarkerPosition(newLat, newLng)
    }
  },
  { immediate: true },
)

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  map.value?.remove()
})
</script>

<style scoped lang="scss">
.Geocoder {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .Geocoder__searchResults {
    max-height: 20rem;
    overflow-y: auto;
    border: 1px solid rgb(var(--v-theme-main-grey));
    border-radius: 4px;
    margin-top: -1rem;

    .Geocoder__searchResults--item {
      cursor: pointer;

      &:hover {
        background-color: #f5f5f5;
      }
    }
  }

  .Geocoder__coordinatesInput {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .Geocoder__mapContainer {
    height: 15rem;
    border-radius: 4px;
    border: 1px solid rgb(var(--v-theme-light-grey));
  }
}
</style>
