<template>
  <div class="AuthRoutesLayout">
    <RouterView v-slot="{ Component, route: activeRoute }">
      <Transition name="AuthRouteFade" mode="out-in">
        <component :is="Component" :key="activeRoute.fullPath" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped lang="scss">
.AuthRoutesLayout {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(160deg, #f6f7f8 0%, #ecf1f6 100%);
}

.AuthRouteFade-enter-active,
.AuthRouteFade-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.AuthRouteFade-enter-from,
.AuthRouteFade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
