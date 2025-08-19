<template>
  <div class="BeneficiariesNumbers">
    <span class="BeneficiariesNumbers__label">{{ $t('dashboard.beneficiariesCount.target') }}</span>
    <span class="BeneficiariesNumbers__value">{{
      formatNumber(dashboardStore.stats?.beneficiaries_count.target)
    }}</span>
    <span class="BeneficiariesNumbers__label">{{
      $t('dashboard.beneficiariesCount.beneficiaries')
    }}</span>
    <span class="BeneficiariesNumbers__value">{{
      formatNumber(dashboardStore.stats?.beneficiaries_count.beneficiaries)
    }}</span>
  </div>
</template>
<script lang="ts" setup>
import { formatNumber } from '@/services/utils/FormatNumber'
import { useDashboardStore } from '@/stores/dashboardStore'

const dashboardStore = useDashboardStore()
</script>
<style>
.BeneficiariesNumbers {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}
.BeneficiariesNumbers__label {
  font-weight: 600;
}
.BeneficiariesNumbers__value {
  font-size: 3rem;
  font-weight: bolder;
  color: rgb(var(--v-theme-light-blue));
  /* line-height: 1.2; */
}
</style>
