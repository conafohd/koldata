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
  <v-tooltip v-else :disabled="!tooltipLines.length" location="bottom">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :color="authStore.isAdmin ? 'main-purple' : 'main-blue'"
        @click="authStore.signOut"
        prepend-icon="$logout"
        variant="tonal"
      >
        {{ $t('auth.signOut') }}
      </v-btn>
    </template>

    <div class="AuthButtonTooltip">
      <div
        v-for="line in tooltipLines"
        :key="line"
        class="AuthButtonTooltip__line"
      >
        {{ line }}
      </div>
    </div>
  </v-tooltip>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useAuthenticationStore } from '@/stores/authStore'

const authStore = useAuthenticationStore()

const tooltipLines = computed(() => {
  const firstName = authStore.userInfos?.first_name?.trim() ?? ''
  const lastName = authStore.userInfos?.last_name?.trim() ?? ''
  const email = authStore.userInfos?.email?.trim() ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  return [fullName, email].filter(Boolean)
})
</script>
<style scoped lang="scss">
.AuthButtonTooltip {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.AuthButtonTooltip__line {
  line-height: 1.2;
}
</style>
