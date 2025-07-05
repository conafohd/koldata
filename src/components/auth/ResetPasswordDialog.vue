<template>
  <v-dialog v-model="authStore.showResetPasswordModal" max-width="400">
    <template #default>
      <v-card>
        <v-card-title class="text-h5">
          {{ $t('auth.resetPassword') }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="updatePassword">
            <v-text-field
              :label="$t('auth.forms.labels.password')"
              v-model="resetPasswordForm.form.newPassword.value.value"
              :error-messages="resetPasswordForm.form.newPassword.errorMessage.value"
              @blur="resetPasswordForm.form.newPassword.handleBlur"
              type="password"
              autocomplete="new-password"
            />
            <v-text-field
              :label="$t('auth.forms.labels.confirmPassword')"
              v-model="resetPasswordForm.form.confirmNewPassword.value.value"
              :error-messages="resetPasswordForm.form.confirmNewPassword.errorMessage.value"
              @blur="resetPasswordForm.form.confirmNewPassword.handleBlur"
              type="password"
              autocomplete="new-password"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="authStore.showResetPasswordModal = false">
            {{ $t('forms.cancel') }}
          </v-btn>
          <v-btn @click="updatePassword" color="main-purple">
            {{ $t('forms.validate') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { AuthFormValidator } from '@/services/AuthFormService'
import { useAuthenticationStore } from '@/stores/authStore'
const authStore = useAuthenticationStore()
const resetPasswordForm = AuthFormValidator.getResetPasswordForm()

function updatePassword() {
  authStore.updatePassword(resetPasswordForm.form.newPassword.value.value)
}
</script>
