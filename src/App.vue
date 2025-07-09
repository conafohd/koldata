<template>
  <div class="App">
    <Header />
    <div v-show="!appStore.isLoading" class="App__content"><RouterView /></div>
    <Loader v-show="appStore.isLoading" />
    <NotificationBox />
    <AssociationForm v-if="associationsStore.associationToEdit" />
    <ProjectForm v-if="projectsStore.projectToEdit" />
  </div>
</template>

<script setup lang="ts">
import '@/assets/styles/main.scss'
import { useAuthenticationStore } from '@/stores/authStore'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useApplicationStore } from './stores/applicationStore'
import { useAssociationsStore } from './stores/associationsStore'
import { useProjectsStore } from './stores/projectsStore'
import Header from './views/_layout/header/Header.vue'
import Loader from './views/_layout/loader/Loader.vue'
import NotificationBox from './views/_layout/notification/NotificationBox.vue'
import AssociationForm from './views/associations/components/AssociationForm.vue'
import ProjectForm from './views/projects/components/ProjectForm.vue'
const authStore = useAuthenticationStore()
const appStore = useApplicationStore()
const associationsStore = useAssociationsStore()
const projectsStore = useProjectsStore()

onMounted(() => {
  authStore.initAuth()
  appStore.setActiveTab()
})
</script>

<style scoped lang="scss">
.App {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.App__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  padding-top: 1rem;
}
</style>
