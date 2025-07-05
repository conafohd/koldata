<template>
  <v-dialog v-model="authStore.showForgotPasswordModal" max-width="400">
    <template #default>
      <v-card>
        <v-card-title class="text-h5">
          {{ $t('auth.forgotPassword') }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="recoverPassword">
            <v-text-field
              :label="$t('auth.forms.labels.email')"
              v-model="email"
              type="email"
              autocomplete="email"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="authStore.showForgotPasswordModal = false">
            {{ $t('forms.cancel') }}
          </v-btn>
          <v-btn @click="recoverPassword" color="main-purple">
            {{ $t('forms.validate') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authStore'
import { ref } from 'vue'
const email = ref('')
const authStore = useAuthenticationStore()

function recoverPassword() {
  if (!email.value) {
    return
  }
  authStore.recoverPassword(email.value)
}
</script>
