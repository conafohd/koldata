<template>Carte des projets</template>
<script setup lang="ts">
import { useApplicationStore } from '@/stores/applicationStore'
import { onMounted } from 'vue'

const applicationStore = useApplicationStore()
onMounted(() => {
  // Simulate data fetching
  setTimeout(() => {
    applicationStore.isLoading = false
  }, 3000) // Adjust the timeout as needed
})
</script>
