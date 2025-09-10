<template>
  <div class="AssociationsInfos">
    <div class="AssociationInfo__card ContentCard">
      <span class="ContentCard__title">
        <v-icon icon="$informationSlabBoxOutline" class="mr-1" color="light-blue"></v-icon>
        {{ $t('associations.form.categories.organisation') }}</span
      >
      <div class="ContentCard__content">
        <span class="ContentCard__contentTitle">{{ $t('associations.form.fields.type_org') }}</span>
        <span
          class="ContentCard__contentText"
          v-if="association.type_org !== AssociationType.OTHER"
        >
          {{ $t(`associations.form.lists.type_org.${association.type_org}`) }}
        </span>
        <span class="ContentCard__contentText" v-if="association.type_org_autre">
          {{ association.type_org_autre }}
        </span>
      </div>
      <div class="ContentCard__content">
        <span class="ContentCard__contentTitle">{{
          $t('associations.form.fields.annee_creation')
        }}</span>
        <span class="ContentCard__contentText">
          {{ association.annee_creation }}
        </span>
      </div>
      <v-divider color="light-blue mb-3 mt-3" thickness="2" opacity="1"></v-divider>
      <div class="ContentCard__content">
        <span class="ContentCard__contentTitle">{{
          $t('associations.form.hints.ressources_humaines')
        }}</span>
        <div class="d-flex justify-space-around mt-2">
          <div class="d-flex flex-column align-center">
            <span class="ContentCard__contentText AssociationInfo__mainNumber">
              {{ association.nb_salaries }}
            </span>
            <span class="ContentCard__contentText">{{
              $t('associations.infosCard.nb_salaries')
            }}</span>
          </div>
          <div class="d-flex flex-column align-center">
            <span class="ContentCard__contentText AssociationInfo__mainNumber">
              {{ association.nb_benevoles }}
            </span>
            <span class="ContentCard__contentText">{{
              $t('associations.infosCard.nb_benevoles')
            }}</span>
          </div>
        </div>
      </div>
      <div class="ContentCard__content mt-5">
        <span class="ContentCard__contentTitle">{{ $t('associations.infosCard.projects') }}</span>
        <div class="d-flex justify-space-around mt-2">
          <div class="d-flex flex-column align-center">
            <span class="ContentCard__contentText AssociationInfo__mainNumber">
              {{ getProjectsCount() }}
            </span>
            <span class="ContentCard__contentText">{{ $t('associations.infosCard.total') }}</span>
          </div>
          <div class="d-flex flex-column align-center">
            <span class="ContentCard__contentText AssociationInfo__mainNumber">
              {{ getConsortiumCount() }}
            </span>
            <span class="ContentCard__contentText">{{
              $t('associations.infosCard.consortium', getConsortiumCount())
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Location -->
    <div class="AssociationInfo__card AssociationInfo__card--flex2 ContentCard">
      <span class="ContentCard__title">
        <v-icon icon="$selectMarker" class="mr-1" color="light-blue"></v-icon>
        {{ $t('associations.form.categories.location') }}</span
      >
      <div class="AssociationInfo__dualCol">
        <div>
          <div class="ContentCard__content">
            <span class="ContentCard__contentTitle">{{
              $t('associations.form.fields.province')
            }}</span>
            <span class="ContentCard__contentText">
              {{ adminBoundStore.getProvinceNameFromCode(association.province) }}
            </span>
          </div>
          <div class="ContentCard__content">
            <span class="ContentCard__contentTitle">{{
              $t('associations.form.fields.territoire')
            }}</span>
            <span class="ContentCard__contentText">
              {{ adminBoundStore.getTerritoryNameFromCode(association.territoire) }}
            </span>
          </div>
          <div class="ContentCard__content">
            <span class="ContentCard__contentTitle">{{
              $t('associations.form.fields.zone_sante')
            }}</span>
            <span class="ContentCard__contentText">
              {{ adminBoundStore.getHealthZoneNameFromCode(association.zone_sante) }}
            </span>
          </div>
          <div class="ContentCard__content">
            <span class="ContentCard__contentTitle">{{
              $t('associations.form.fields.aire_sante')
            }}</span>
            <span class="ContentCard__contentText">
              {{ association.aire_sante }}
            </span>
          </div>
          <div class="ContentCard__content">
            <span class="ContentCard__contentTitle">{{
              $t('associations.form.fields.localite')
            }}</span>
            <span class="ContentCard__contentText">
              {{ association.localite }}
            </span>
          </div>
          <div class="ContentCard__content">
            <span class="ContentCard__contentTitle">{{
              $t('associations.infosCard.coord_gps')
            }}</span>
            <div class="d-flex flex-wrap">
              <span class="ContentCard__contentText">
                {{ association.latitude }} / {{ association.longitude }}</span
              >
              <div class="d-flex justify-space-around">
                <span class="ContentCard__contentText" v-if="association.altitude">
                  Alt: {{ association.altitude }} m
                </span>
                <span class="ContentCard__contentText" v-if="association.precision">
                  Precision: {{ association.precision }} m
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="AssociationInfo__map" ref="assoMap"></div>
      </div>
    </div>

    <!-- Contacts -->
    <div class="AssociationInfo__card AssociationInfo__card--contact ContentCard">
      <span class="ContentCard__title">
        <v-icon icon="$cardAccountMailOutline" class="mr-1" color="light-blue"></v-icon>
        {{ $t('associations.form.categories.contacts') }}</span
      >
      <div class="ContentCard__content">
        <span class="ContentCard__contentTitle">{{ $t('associations.infosCard.contact') }}</span>
        <span class="ContentCard__contentText">
          <v-icon icon="$accountCircleOutline" color="main-blue" class="mr-1"></v-icon>
          {{ association.nom_contact }}
        </span>
        <span class="ContentCard__contentText">
          <v-icon icon="$cardAccountPhoneOutline" color="main-blue" class="mr-1"></v-icon>
          {{ association.tel_contact }}
        </span>
        <span class="ContentCard__contentText">
          <v-icon icon="$cardAccountMailOutline" color="main-blue" class="mr-1"></v-icon>
          {{ association.email_contact }}
        </span>
      </div>
      <v-divider color="light-blue mb-3 mt-3" thickness="2" opacity="1"></v-divider>
      <div class="ContentCard__content">
        <span class="ContentCard__contentTitle">{{ $t('associations.infosCard.ongMail') }}</span>
        <span class="ContentCard__contentText">{{ association.email_org }}</span>
        <span class="ContentCard__contentTitle">{{ $t('associations.infosCard.website') }}</span>
        <span class="ContentCard__contentText">{{ association.website }}</span>
      </div>
      <v-divider color="light-blue mb-3 mt-3" thickness="2" opacity="1"></v-divider>
      <div class="ContentCard__content">
        <span class="ContentCard__contentTitle mb-2">{{
          $t('associations.infosCard.socialMedia')
        }}</span>
        <div class="d-flex flex-wrap ga-3 align-center">
          <a
            :href="association.facebook"
            target="_blank"
            rel="noopener noreferrer"
            v-if="association.facebook"
          >
            <img src="@/assets/img/facebook.svg" alt="facebook" />
          </a>
          <a
            :href="association.twitter"
            target="_blank"
            rel="noopener noreferrer"
            v-if="association.twitter"
          >
            <img src="@/assets/img/twitter.svg" alt="twitter" />
          </a>
          <a
            :href="association.instagram"
            target="_blank"
            rel="noopener noreferrer"
            v-if="association.instagram"
          >
            <img src="@/assets/img/instagram.svg" alt="instagram" />
          </a>
          <a
            :href="association.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            v-if="association.linkedin"
          >
            <img src="@/assets/img/linkedin.svg" alt="linkedin" />
          </a>
          <a
            :href="association.tiktok"
            target="_blank"
            rel="noopener noreferrer"
            v-if="association.tiktok"
          >
            <img src="@/assets/img/tiktok.svg" alt="tiktok" />
          </a>
        </div>
      </div>
    </div>

    <!-- Infos -->
    <div class="AssociationInfo__card AssociationInfo__card--flex2 ContentCard">
      <span class="ContentCard__title">
        <v-icon icon="$chartBoxMultipleOutline" class="mr-1" color="light-blue"></v-icon>
        {{ $t('associations.infosCard.interventionSectors') }}</span
      >
      <div class="ContentCard__content">
        <span class="ContentCard__contentTitle">{{
          $t('associations.form.fields.secteurs_interv')
        }}</span>
        <div class="d-flex flex-wrap ga-2 mt-2">
          <template v-for="sector in association.secteurs_interv" :key="sector">
            <v-chip color="main-blue" v-if="sector !== InterventionSector.OTHER">{{
              sector
            }}</v-chip>
          </template>
          <v-chip color="main-blue" v-if="association.secteurs_interv_autre">{{
            association.secteurs_interv_autre
          }}</v-chip>
        </div>
        <span class="ContentCard__contentTitle mt-6">{{
          $t('associations.form.hints.budgets_history')
        }}</span>
        <div class="d-flex justify-space-around mt-2 flex-wrap">
          <div class="d-flex align-center">
            <span class="ContentCard__contentTitle">2022:</span>
            <span class="ContentCard__contentText ml-2">{{ association.budget_2022 }} $US</span>
          </div>
          <div class="d-flex align-center">
            <span class="ContentCard__contentTitle">2023:</span>
            <span class="ContentCard__contentText ml-2">{{ association.budget_2023 }} $US</span>
          </div>
          <div class="d-flex align-center">
            <span class="ContentCard__contentTitle">2024:</span>
            <span class="ContentCard__contentText ml-2">{{ association.budget_2024 }} $US</span>
          </div>
          <div class="d-flex align-center">
            <span class="ContentCard__contentTitle">2025:</span>
            <span class="ContentCard__contentText ml-2">{{ association.budget_2025 }} $US</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { InterventionSector } from '@/models/enums/InterventionSector'
import { AssociationType } from '@/models/enums/associations/AssociationType'
import type { Association } from '@/models/interfaces/Association'
import { useAdminBoundariesStore } from '@/stores/adminBoundariesStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { Map, Marker, NavigationControl, type LngLatLike } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { onMounted, ref } from 'vue'
const props = defineProps<{
  association: Association
}>()
const adminBoundStore = useAdminBoundariesStore()
const projectsStore = useProjectsStore()
function getProjectsCount(): number {
  return (
    projectsStore.projectsList.filter((project) => project.association_id === props.association.id)
      .length || 0
  )
}
function getConsortiumCount(): number {
  return (
    projectsStore.projectsList
      .filter((project) => project.association_id === props.association.id)
      .filter((p) => p.consortium).length || 0
  )
}

const assoMap = ref<HTMLElement>()
const map = ref<Map>()
const marker = ref<Marker>()
onMounted(async () => {
  await adminBoundStore.fetchBoundaries()
  if (!assoMap.value) return
  map.value = new Map({
    container: assoMap.value,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: getInitialCenter(),
    zoom: 7,
    minZoom: 3,
  })
  map.value.addControl(new NavigationControl(), 'top-right')
  marker.value = new Marker().setLngLat(getInitialCenter()).addTo(map.value)
})

const getInitialCenter = (): LngLatLike => {
  if (props.association.latitude && props.association.longitude) {
    return [props.association.longitude, props.association.latitude]
  }
  // Default to DRC center
  return [21.7587, -4.0383]
}
</script>

<style lang="scss" scoped>
@media (max-width: $bp-sm) {
  .AssociationsInfos {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .AssociationInfo__card {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 1rem;
  }
  .AssociationInfo__dualCol {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .AssociationInfo__map {
    width: 100%;
    height: 25rem;
    margin-top: 1rem;
  }
}
@media (min-width: $bp-sm) {
  .AssociationsInfos {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .AssociationInfo__card {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    max-width: 63%;
    padding: 1rem;
    &--flex2 {
      flex-grow: 2;
    }
    &--contact {
      max-width: 35%;
    }
  }
  .AssociationInfo__dualCol {
    display: flex;
    justify-content: space-between;
  }
  .AssociationInfo__map {
    width: 25rem;
    height: 100%;
  }
}

.AssociationInfo__mainNumber {
  font-size: 1.3rem;
  font-weight: 600;
  color: rgb(var(--v-theme-main-blue));
}
</style>
