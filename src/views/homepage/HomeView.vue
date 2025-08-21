<template>
  <div class="Dashboard">
    <div class="Dashboard__header">
      <span class="PageTitle">{{ $t('dashboard.title') }}</span>
    </div>
    <div class="Dashboard__content">
      <div class="Dashboard__mainStats ContentCard">
        <KeyNumbers />
      </div>
      <div class="Dashboard__charts">
        <div class="ContentCard">
          <InterventionSectorChart :data="InterventionSectorChartData" />
        </div>
        <div class="ContentCard">
          <BeneficiaryTypeChart :data="BeneficiaryTypeChartData" />
        </div>
        <div class="d-flex ContentCard">
          <BeneficiariesNumbers />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useApplicationStore } from '@/stores/applicationStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { computed, onMounted } from 'vue'
import BeneficiariesNumbers from './components/BeneficiariesNumbers.vue'
import BeneficiaryTypeChart from './components/BeneficiaryTypeChart.vue'
import InterventionSectorChart from './components/InterventionSectorChart.vue'
import KeyNumbers from './components/KeyNumbers.vue'
const appStore = useApplicationStore()
const dashboardStore = useDashboardStore()

onMounted(async () => {
  await dashboardStore.fetchStats()
  console.log(dashboardStore.stats)
  appStore.isLoading = false
})

const InterventionSectorChartData = computed(() => {
  const data = dashboardStore.stats?.interventions_fields_details || []
  return {
    labels: data.map((d) => d.secteur),
    values: data.map((d) => d.occurrences),
  }
})
const BeneficiaryTypeChartData = computed(() => {
  return dashboardStore.stats?.beneficiaries_types_details || []
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
