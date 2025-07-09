<template>
  <v-dialog v-model="showDialog" fullscreen> Yo </v-dialog>
</template>
<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { computed } from 'vue'

const projectsStore = useProjectsStore()
const authStore = useAuthenticationStore()
const showDialog = computed(() => projectsStore.projectToEdit !== null)
</script>
