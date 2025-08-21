<template>
  <div class="BeneficiariesNumbers">
    <div class="d-flex flex-column align-center">
      <span class="BeneficiariesNumbers__label">{{
        $t('dashboard.beneficiariesCount.target')
      }}</span>
      <span class="BeneficiariesNumbers__value BeneficiariesNumbers__value--target">{{
        formatNumber(dashboardStore.stats?.beneficiaries_count.target)
      }}</span>
    </div>

    <div class="d-flex flex-column align-center">
      <span class="BeneficiariesNumbers__label">{{
        $t('dashboard.beneficiariesCount.beneficiaries')
      }}</span>
      <span class="BeneficiariesNumbers__value BeneficiariesNumbers__value--beneficiaries">{{
        formatNumber(dashboardStore.stats?.beneficiaries_count.beneficiaries)
      }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { formatNumber } from '@/services/utils/FormatNumber'
import { useDashboardStore } from '@/stores/dashboardStore'

const dashboardStore = useDashboardStore()
</script>
<style lang="scss">
.BeneficiariesNumbers {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  justify-content: space-around;
}
.BeneficiariesNumbers__label {
  font-weight: 600;
}
.BeneficiariesNumbers__value {
  font-size: 3rem;
  font-weight: bolder;
  &--target {
    color: rgb(var(--v-theme-light-blue));
  }
  &--beneficiaries {
    color: rgb(var(--v-theme-main-blue));
  }
}
</style>
