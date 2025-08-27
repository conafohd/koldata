<template>
  <div class="Dashboard">
    <div class="Dashboard__header">
      <span class="PageTitle">{{ $t('dashboard.title') }}</span>
    </div>
    <div class="Dashboard__filters">
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
      <v-select
        :label="$t('dashboard.filters.year')"
        :items="[2025, 2024, 2023, 2022]"
        v-model="selectedYear"
        variant="outlined"
        density="compact"
        hide-details
        multiple
        clearable
      />
    </div>
    <div class="Dashboard__content">
      <div class="Dashboard__mainStats ContentCard">
        <KeyNumbers />
      </div>
      <div class="Dashboard__charts">
        <div class="ContentCard">
          <BarChart :data="interventionSectorChartData" :title="$t('dashboard.chart1.title')" />
        </div>
        <div class="ContentCard">
          <BeneficiaryTypeChart :data="beneficiaryTypeChartData" />
        </div>
        <div class="d-flex ContentCard">
          <BeneficiariesKeyNumbers />
        </div>
        <div class="d-flex ContentCard">
          <BarChart :data="beneficiaryProfileChartData" :title="$t('dashboard.chart3.title')" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { i18n } from '@/plugins/i18n'
import { useAdminBoundariesStore } from '@/stores/adminBoundariesStore'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, ref, watchEffect } from 'vue'
import BarChart from './components/BarChart.vue'
import BeneficiariesKeyNumbers from './components/BeneficiariesKeyNumbers.vue'
import BeneficiaryTypeChart from './components/BeneficiaryTypeChart.vue'
import KeyNumbers from './components/KeyNumbers.vue'
const appStore = useApplicationStore()
const dashboardStore = useDashboardStore()
const associationsStore = useAssociationsStore()
const adminBoundStore = useAdminBoundariesStore()
const { associationsList: associations } = storeToRefs(associationsStore)

const territoriesList = computed(() => {
  if (!selectedProvince.value) {
    return adminBoundStore.territoriesList
  } else {
    return adminBoundStore.territoriesList.filter((t) => t.province_c === selectedProvince.value)
  }
})
const healthZonesList = computed(() => {
  if (!selectedTerritory.value) {
    return adminBoundStore.healthZonesList
  } else {
    return adminBoundStore.healthZonesList.filter((h) => h.territoire_c === selectedTerritory.value)
  }
})

onBeforeMount(async () => {
  await Promise.all([
    dashboardStore.fetchStats(
      selectedAssociation.value,
      selectedProvince.value,
      selectedTerritory.value,
      selectedHealthZone.value,
      selectedYear.value,
    ),
    associationsStore.getAssociationsList(),
    adminBoundStore.fetchBoundaries(),
  ])
  appStore.isLoading = false
})

//-------------------- Filters --------------------------\\
const selectedAssociation = ref<string | null>(null)
const selectedProvince = ref<string[] | null>(null)
const selectedTerritory = ref<string[] | null>(null)
const selectedHealthZone = ref<string[] | null>(null)
const selectedYear = ref<number[] | null>(null)

const arrayToNull = <T,>(arr: T[] | null): T[] | null => {
  return arr && arr.length > 0 ? arr : null
}

watchEffect(async () => {
  await dashboardStore.fetchStats(
    selectedAssociation.value,
    arrayToNull(selectedProvince.value),
    arrayToNull(selectedTerritory.value),
    arrayToNull(selectedHealthZone.value),
    arrayToNull(selectedYear.value),
  )
})

const interventionSectorChartData = computed(() => {
  const data = dashboardStore.stats?.interventions_fields_details || []
  return {
    labels: data.map((d) => d.secteur),
    values: data.map((d) => d.occurrences),
  }
})
const beneficiaryTypeChartData = computed(() => {
  return dashboardStore.stats?.beneficiaries_types_details || []
})
const beneficiaryProfileChartData = computed(() => {
  return {
    labels: [
      i18n.t('dashboard.chart3.nb_women'),
      i18n.t('dashboard.chart3.nb_men'),
      i18n.t('dashboard.chart3.nb_boys'),
      i18n.t('dashboard.chart3.nb_girls'),
      i18n.t('dashboard.chart3.nb_elderly'),
      i18n.t('dashboard.chart3.nb_disabled'),
    ],
    values: [
      dashboardStore.stats?.beneficiaries_profile_details.nb_women,
      dashboardStore.stats?.beneficiaries_profile_details.nb_men,
      dashboardStore.stats?.beneficiaries_profile_details.nb_boys,
      dashboardStore.stats?.beneficiaries_profile_details.nb_girls,
      dashboardStore.stats?.beneficiaries_profile_details.nb_elderly,
      dashboardStore.stats?.beneficiaries_profile_details.nb_disabled,
    ],
  } as any
})
</script>

<style lang="scss">
.Dashboard {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  gap: 1rem;
}
.Dashboard__header {
  display: flex;
  width: 100%;

  @media (max-width: $bp-sm) {
    justify-content: center;
  }
}
.Dashboard__filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(12rem, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: end;

  @media (max-width: $bp-sm) {
    grid-template-columns: 1fr;
  }
}
@media (min-width: $bp-sm) {
  .Dashboard__filters > :first-child {
    grid-column: span 2; /* il s'étend sur 2 colonnes */
  }
}

.Dashboard__content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  gap: 1rem;
}

.Dashboard__mainStats {
  display: flex;
  padding: 0.3rem 1rem;
  justify-content: space-around;

  @media (max-width: $bp-sm) {
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
  }
}
.Dashboard__keyNumber {
  @media (min-width: $bp-sm) {
    width: 20%;
  }
}
.Dashboard__charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 18rem);
  gap: 1rem;
  width: 100%;

  @media (max-width: $bp-sm) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, 15rem);
  }

  > * {
    padding: 1rem;
  }
}
</style>
