<template>
  <div class="Dashboard">
    <div class="Dashboard__header">
      <span class="PageTitle">{{ $t('dashboard.title') }}</span>
    </div>
    <div class="Dashboard__content">
      <div class="Dashboard__mainStats ContentCard">
        <KeyNumber
          v-for="(value, key) in dashboardStore.stats"
          :key="key"
          :label="$t(`dashboard.mainStats.${key}`)"
          :keyNumber="value"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useApplicationStore } from '@/stores/applicationStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { onMounted } from 'vue'
import KeyNumber from './components/KeyNumber.vue'
const appStore = useApplicationStore()
const dashboardStore = useDashboardStore()

onMounted(async () => {
  await dashboardStore.fetchStats()
  appStore.isLoading = false
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
  padding: 1rem;
  justify-content: space-between;

  @media (max-width: $bp-sm) {
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
  }
}
</style>
