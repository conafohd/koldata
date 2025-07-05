<template>Admin</template>
<script setup lang="ts">
import { useApplicationStore } from '@/stores/applicationStore'
import { onMounted } from 'vue'

const applicationStore = useApplicationStore()
onMounted(() => {
  applicationStore.isLoading = false
})
</script>
