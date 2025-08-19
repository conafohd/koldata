<template>
  <KeyNumber
    :label="$t(`dashboard.mainStats.ngos_count`)"
    :keyNumber="dashboardStore.stats?.ngos_count as number"
    class="Dashboard__keyNumber"
  />
  <KeyNumber
    :label="$t(`dashboard.mainStats.projects_count`)"
    :keyNumber="dashboardStore.stats?.projects_count as number"
    class="Dashboard__keyNumber"
  />
  <KeyNumber
    :label="$t(`dashboard.mainStats.budget_count`)"
    :keyNumber="(dashboardStore.stats?.budget_count! / 1000000) as number"
    isMillion
    class="Dashboard__keyNumber"
  />
  <KeyNumber
    :label="$t(`dashboard.mainStats.territories_count`)"
    :keyNumber="dashboardStore.stats?.territories_count as number"
    class="Dashboard__keyNumber"
  />
  <KeyNumber
    :label="$t(`dashboard.mainStats.interventions_fields_count`)"
    :keyNumber="dashboardStore.stats?.interventions_fields_count as number"
    class="Dashboard__keyNumber"
  />
</template>
<script lang="ts" setup>
import { useDashboardStore } from '@/stores/dashboardStore'
import KeyNumber from './KeyNumber.vue'
const dashboardStore = useDashboardStore()
</script>
