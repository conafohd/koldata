<template>
  <div class="BeneficiariesNumbers">
    <span class="BeneficiariesNumbers__title">{{
      $t('dashboard.beneficiariesCount.beneficiaries')
    }}</span>
    <span class="BeneficiariesNumbers__percentage">{{ percentage + '%' }}</span>

    <v-progress-linear
      :model-value="percentage"
      height="25"
      rounded
      color="light-blue"
      striped
    ></v-progress-linear>
    <div class="BeneficiariesNumbers__details">
      <span class="BeneficiariesNumbers__details--beneficiariesCount">{{
        formatNumber(dashboardStore.stats?.beneficiaries_count.beneficiaries)
      }}</span>
      <div>
        <span>{{ $t('dashboard.beneficiariesCount.objective') }}: </span>
        <span class="BeneficiariesNumbers__details--objectiveCount">{{
          formatNumber(dashboardStore.stats?.beneficiaries_count.target)
        }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { formatNumber } from '@/services/utils/FormatNumber'
import { useDashboardStore } from '@/stores/dashboardStore'
import { computed } from 'vue'

const dashboardStore = useDashboardStore()

const percentage = computed(() =>
  (
    ((dashboardStore.stats?.beneficiaries_count.beneficiaries as number) * 100) /
    (dashboardStore.stats?.beneficiaries_count.target as number)
  ).toFixed(2),
)
</script>
<style lang="scss">
.BeneficiariesNumbers {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 3rem;
  font-size: 1.2rem;
}
.BeneficiariesNumbers__title {
  font-weight: bolder;
}
.BeneficiariesNumbers__percentage {
  font-size: 2rem;
  font-weight: bolder;
}

.BeneficiariesNumbers__details {
  display: flex;
  align-items: center;
  justify-content: space-around;
  width: 100%;

  &--beneficiariesCount {
    font-size: 1.6rem;
    font-weight: bolder;
  }

  &--objectiveCount {
    font-size: 1.4rem;
    font-weight: bolder;
  }
}
</style>
