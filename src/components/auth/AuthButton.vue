<template>
  <v-btn
    v-if="!authStore.authSession"
    color="main-blue"
    @click="authStore.showAuthModal = true"
    prepend-icon="$login"
  >
    {{ $t('auth.signIn') }}
  </v-btn>
  <v-btn v-else color="main-blue" @click="authStore.signOut" prepend-icon="$logout">
    {{ $t('auth.signOut') }}</v-btn
  >
</template>
<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authStore'
const authStore = useAuthenticationStore()
</script>
