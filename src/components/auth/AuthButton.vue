<template>
  <v-btn
    v-if="!authStore.authSession"
    color="main-blue"
    :to="{ name: 'auth-sign-in' }"
    prepend-icon="$login"
    variant="tonal"

  >
    {{ $t('auth.signIn') }}
  </v-btn>
  <v-btn
    v-else
    :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
    @click="authStore.signOut"
    prepend-icon="$logout"
    variant="tonal"

  >
    {{ $t('auth.signOut') }}</v-btn
  >
</template>
<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authStore'
const authStore = useAuthenticationStore()
</script>
