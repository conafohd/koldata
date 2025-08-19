<template>
  <div class="Dashboard">
    <div class="Dashboard__header">
      <span class="PageTitle">{{ $t('dashboard.title') }}</span>
    </div>
    <div class="Dashboard__content">
      <div class="Dashboard__mainStats ContentCard">
        <KeyNumbers />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useApplicationStore } from '@/stores/applicationStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { onMounted } from 'vue'
import KeyNumbers from './components/KeyNumbers.vue'
const appStore = useApplicationStore()
const dashboardStore = useDashboardStore()

onMounted(async () => {
  await dashboardStore.fetchStats()
  console.log(dashboardStore.stats)
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
</style>
