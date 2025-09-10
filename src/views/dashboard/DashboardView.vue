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
        <div class="ContentCard ChartCard">
          <BarChart :data="interventionSectorChartData" :title="$t('dashboard.chart1.title')" />
        </div>
        <div class="ContentCard position-relative ChartCard">
          <div class="BeneficiaryTypeChart--info" @click="showBeneficiariesInfosDialog = true">
            <v-icon icon="$informationSlabBoxOutline" size="x-large"></v-icon>
          </div>

          <DoughnutChart
            :dataset="beneficiaryTypeChartData"
            :title="$t('dashboard.chart2.title')"
          />
        </div>
        <div class="d-flex ContentCard ChartCard">
          <BeneficiariesKeyNumbers />
        </div>
        <div class="d-flex ContentCard ChartCard">
          <BarChart :data="beneficiaryGendersChartData" :title="$t('dashboard.chart3.title')" />
        </div>
        <div class="d-flex ContentCard ChartCard">
          <DoughnutChart
            :dataset="beneficiaryAgesChartData"
            :title="$t('dashboard.chart4.title')"
          />
        </div>
        <div class="d-flex ContentCard ChartCard">
          <div class="Dashboard__disabled">
            <div class="Dashboard__disabled--leftBlock">
              <img
                src="@/assets/img/disabled.min.svg"
                alt="Disability Awareness"
                class="Dashboard__disabled--image"
              />
            </div>
            <div class="Dashboard__disabled--rightBlock">
              <span class="Dashboard__disabled--title">{{
                $t('dashboard.disabledCount.title')
              }}</span>
              <span class="Dashboard__disabled--count">{{ formatNumber(disabledCount) }}</span>
              <span class="Dashboard__disabled--percentage">{{
                $t('dashboard.disabledCount.percentage', {
                  count: disabledPercentage,
                })
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <BeneficiariesTypeInfosDialog
    v-model:showBeneficiariesInfosDialog="showBeneficiariesInfosDialog"
  />
</template>
<script setup lang="ts">
import { i18n } from '@/plugins/i18n'
import { formatNumber } from '@/services/utils/FormatNumber'
import { useAdminBoundariesStore } from '@/stores/adminBoundariesStore'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAssociationsStore } from '@/stores/associationsStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, ref, watchEffect } from 'vue'
import BarChart from './components/BarChart.vue'
import BeneficiariesKeyNumbers from './components/BeneficiariesKeyNumbers.vue'
import BeneficiariesTypeInfosDialog from './components/BeneficiariesTypeInfosDialog.vue'
import DoughnutChart from './components/DoughnutChart.vue'
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
    labels: data.map((d) => i18n.t('intervention_sector.' + d.secteur)),
    values: data.map((d) => d.occurrences),
  }
})
const beneficiaryTypeChartData = computed(() => {
  return (
    dashboardStore.stats?.beneficiaries_types_details.map((d) => ({
      label: i18n.t('projects.form.lists.beneficiariesTypes.' + d.type),
      value: d.occurrences,
    })) || []
  )
})
const showBeneficiariesInfosDialog = ref(false)
const beneficiaryGendersChartData = computed(() => {
  if (!dashboardStore.stats) {
    return { labels: [], values: [] }
  }
  return {
    labels: [i18n.t('dashboard.chart3.nb_women'), i18n.t('dashboard.chart3.nb_men')],
    values: [
      dashboardStore.stats?.beneficiaries_profile_details.nb_women +
        dashboardStore.stats?.beneficiaries_profile_details.nb_girls +
        dashboardStore.stats?.beneficiaries_profile_details.nb_old_women,
      dashboardStore.stats?.beneficiaries_profile_details.nb_men +
        dashboardStore.stats?.beneficiaries_profile_details.nb_old_men +
        dashboardStore.stats?.beneficiaries_profile_details.nb_boys,
    ],
  }
})
const beneficiaryAgesChartData = computed(() => {
  if (!dashboardStore.stats) {
    return []
  }
  return [
    {
      label: i18n.t('dashboard.chart4.nb_youngs'),
      value:
        dashboardStore.stats?.beneficiaries_profile_details.nb_boys +
        dashboardStore.stats?.beneficiaries_profile_details.nb_girls,
    },
    {
      label: i18n.t('dashboard.chart4.nb_adults'),
      value:
        dashboardStore.stats?.beneficiaries_profile_details.nb_men +
        dashboardStore.stats?.beneficiaries_profile_details.nb_women,
    },
    {
      label: i18n.t('dashboard.chart4.nb_elderly'),
      value:
        dashboardStore.stats?.beneficiaries_profile_details.nb_old_men +
        dashboardStore.stats?.beneficiaries_profile_details.nb_old_women,
    },
  ]
})

const disabledCount = computed(() => {
  return dashboardStore.stats?.beneficiaries_profile_details.nb_disabled || 0
})
const disabledPercentage = computed(() => {
  if (
    !dashboardStore.stats ||
    dashboardStore.stats.beneficiaries_profile_details.total_population === 0
  ) {
    return '0%'
  }
  const percentage =
    (dashboardStore.stats?.beneficiaries_profile_details.nb_disabled /
      dashboardStore.stats.beneficiaries_profile_details.total_population) *
    100
  return percentage.toFixed(2) + '%'
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
    grid-column: span 2;
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

.ChartCard {
  height: 18rem;
  @media (max-width: $bp-sm) {
    height: 15rem;
  }
}
.BeneficiaryTypeChart--info {
  position: absolute;
  right: 1rem;
  top: 1rem;
  font-size: 0.8rem;
  z-index: 100;
  cursor: pointer;
}

.Dashboard__disabled {
  display: flex;
  &--leftBlock {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(var(--v-theme-light-blue));
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }
  &--rightBlock {
    display: flex;
    flex: 2;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border-top-right-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
    padding-left: 2rem;
  }
  &--image {
    max-height: 10rem;
    margin: auto;
  }
  &--title {
    font-size: 1.2rem;
    font-weight: 500;
  }
  &--count {
    font-size: 2.5rem;
    font-weight: bold;
    margin-top: 0.5rem;
    color: rgb(var(--v-theme-main-blue));
  }
  &--percentage {
    font-style: italic;
  }
}
</style>
