<template>
  <Header />
  <RouterView />
  <NotificationBox />
</template>

<script setup lang="ts">
import '@/assets/styles/main.scss'
import { onMounted, ref, type Ref } from 'vue'
import { RouterView } from 'vue-router'
import { supabase } from './plugins/supabase'
import Header from './views/_layout/header/Header.vue'

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
import NotificationBox from './views/_layout/notification/NotificationBox.vue'
const authStore = useAuthenticationStore()
onMounted(() => {
  authStore.initAuth()
})
</script>

<style scoped lang="scss">
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
