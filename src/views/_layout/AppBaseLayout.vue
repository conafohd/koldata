<template>
  <div class="AppBaseLayout">
    <Header />
    <div class="AppBaseLayout__content">
      <RouterView />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import Footer from '@/views/_layout/footer/Footer.vue'
import Header from '@/views/_layout/header/Header.vue'
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

  .AppBaseLayout__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 1;
    padding-top: 1rem;
  }
}

</style>
