<template>
  <div class="App">
    <Header />
    <div v-show="!appStore.isLoading" class="App__content"><RouterView /></div>
    <Loader v-show="appStore.isLoading" />
    <NotificationBox />
    <AssociationForm v-if="associationsStore.editStatus" />
  </div>
</template>

<script setup lang="ts">
import '@/assets/styles/main.scss'
import { onMounted, ref, type Ref } from 'vue'
import { RouterView } from 'vue-router'
import { supabase } from './plugins/supabase'
import Header from './views/_layout/header/Header.vue'
import Loader from './views/_layout/loader/Loader.vue'

const appStore = useApplicationStore()
const associationsStore = useAssociationsStore()

const data: Ref<any[]> = ref([])
async function fetchData() {
  const { data: associations, error } = await supabase.from('associations').select('*')
  console.log('fetchedData', associations)
  console.log('error', error)
  if (error) {
    console.error('Error fetching data:', error)
  } else {
    data.value = associations
  }
}
onMounted(() => {
  fetchData()
})

import { useAuthenticationStore } from '@/stores/authStore'
import { useApplicationStore } from './stores/applicationStore'
import { useAssociationsStore } from './stores/associationsStore'
import NotificationBox from './views/_layout/notification/NotificationBox.vue'
import AssociationForm from './views/associations/components/AssociationForm.vue'
const authStore = useAuthenticationStore()
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
