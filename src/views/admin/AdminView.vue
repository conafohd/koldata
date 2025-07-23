<template>
  <div class="Admin">
    <div class="d-flex align-center">
      <h1 class="PageTitle">{{ $t('admin.title') }}</h1>
    </div>
    <div class="Admin--switch">
      <v-btn-toggle v-model="selectedTab" color="light-blue" rounded="0" group>
        <v-btn value="members"> {{ $t('admin.members') }} </v-btn>
        <v-btn value="assos"> {{ $t('admin.assos') }} </v-btn>
        <v-btn value="projects"> {{ $t('admin.projects') }} </v-btn>
      </v-btn-toggle>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useApplicationStore } from '@/stores/applicationStore'
import { onMounted, ref } from 'vue'

const applicationStore = useApplicationStore()
onMounted(() => {
  applicationStore.isLoading = false
})

const selectedTab = ref('members')
</script>

<style scoped lang="scss">
.Admin {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
}
.Admin--switch {
  margin-top: 2rem;
  display: flex;
  @media (max-width: $bp-sm) {
    justify-content: center;
  }
}
</style>
