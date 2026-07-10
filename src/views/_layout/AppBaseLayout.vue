<template>
  <div class="AppBaseLayout" :class="{ 'AppBaseLayout--wide': isWide }">
    <Header />
    <div class="AppBaseLayout__content">
      <RouterView />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Footer from '@/views/_layout/footer/Footer.vue'
import Header from '@/views/_layout/header/Header.vue'

const route = useRoute()
// The assessment edit form has a side panel, so it needs more horizontal room
const isWide = computed(() => route.name === 'assessments-edit')
</script>

<style lang="scss">
.AppBaseLayout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 1100px;
  max-width: 100%;
  padding: 1rem;
  margin: 0 auto;

  &--wide {
    width: 1400px;
  }

  .AppBaseLayout__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    padding-top: 1rem;
  }
}

</style>
