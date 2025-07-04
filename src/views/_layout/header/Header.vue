<template>
  <HeaderMobile v-if="appStore.mobile" />
  <HeaderDesktop v-else />
  <AuthDialog />
</template>

<script setup lang="ts">
import AuthDialog from '@/components/auth/AuthDialog.vue'
import { useApplicationStore } from '@/stores/applicationStore'
import HeaderDesktop from './HeaderDesktop.vue'
import HeaderMobile from './HeaderMobile.vue'
const appStore = useApplicationStore()
</script>
