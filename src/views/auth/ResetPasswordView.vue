<template>
  <AuthPageLayout
    :title="$t('auth.pages.resetPassword.title')"
    :subtitle="$t('auth.pages.resetPassword.subtitle')"
    icon="$lockReset"
  >
    <v-form class="ResetPasswordView__form" @submit.prevent="handleSubmit">
      <div class="ResetPasswordView__field">
        <label class="ResetPasswordView__fieldLabel" for="reset-password-password">{{ $t('auth.forms.labels.newPassword') }}</label>
        <v-text-field
          id="reset-password-password"
          v-model="password"
          hide-details="auto"
          autofocus
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
          variant="outlined"
          prepend-inner-icon="$lockOutline"
          :append-inner-icon="showPassword ? '$eyeOff' : '$eye'"
          @click:append-inner="showPassword = !showPassword"
          :disabled="isSubmitting"
          required
        />
      </div>

      <div class="ResetPasswordView__field">
        <label class="ResetPasswordView__fieldLabel" for="reset-password-confirm">{{ $t('auth.forms.labels.confirmPassword') }}</label>
        <v-text-field
          id="reset-password-confirm"
          v-model="confirmPassword"
          hide-details="auto"
          :type="showConfirmPassword ? 'text' : 'password'"
          autocomplete="new-password"
          variant="outlined"
          prepend-inner-icon="$lockOutline"
          :append-inner-icon="showConfirmPassword ? '$eyeOff' : '$eye'"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
          :disabled="isSubmitting"
          :error-messages="confirmPasswordErrors"
          required
        />
      </div>

      <!-- Password Requirements -->
      <PasswordRequirements :password="password" />

      <v-alert v-if="error" type="error" density="compact" variant="tonal">{{ error }}</v-alert>

      <v-btn color="main-blue" type="submit" :loading="isSubmitting" :disabled="!password || !confirmPassword || !isPasswordValid" block size="large">
        {{ $t('auth.resetPassword') }}
      </v-btn>
    </v-form>

    <template #footer>
      <RouterLink 
      class="ResetPasswordView__back" 
      :to="{
        name: 'auth-sign-in',
        ...(route.query.redirect && { query: { redirect: route.query.redirect } })
      }"
    >
        {{ $t('auth.pages.resetPassword.backToSignIn') }}
      </RouterLink>
    </template>
  </AuthPageLayout>
</template>

<script setup lang="ts">
import { supabase } from '@/plugins/supabase'
import AuthPageLayout from '@/views/auth/components/AuthPageLayout.vue'
import PasswordRequirements from '@/views/auth/components/PasswordRequirements.vue'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthenticationStore } from '@/stores/authStore'
import { usePasswordValidation } from '@/composables/usePasswordValidation'

const router = useRouter()
const route = useRoute()
const authStore = useAuthenticationStore()
const { t } = useI18n()

const password = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Password validation using composable
const { isPasswordValid } = usePasswordValidation(password)

const confirmPasswordErrors = computed(() => {
  const errors = []
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    errors.push(t('auth.forms.errors.passwordMismatch'))
  }
  return errors
})

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect !== 'string' || !redirect.startsWith('/')) {
    return '/'
  }
  return redirect
})

async function handleSubmit() {
  if (!password.value || !confirmPassword.value || isSubmitting.value) {
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = t('auth.forms.errors.passwordMismatch')
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    const token = route.query.token as string
    const email = route.query.email as string
    const isVerified = route.query.verified === 'true'
    
    let isSuccess = false
    
    if (isVerified) {
      // If already verified via OTP, just update the password
      const { error } = await supabase.auth.updateUser({
        password: password.value
      })
      
      if (error) {
        console.error('Password update error:', error)
        isSuccess = false
      } else {
        isSuccess = true
      }
    } else {
      // Use the original flow for email link tokens
      isSuccess = await authStore.resetPasswordWithToken(password.value, token || 'recovery', email || '')
    }

    if (isSuccess) {
      await router.push({
        name: 'auth-sign-in',
        query: { 
          'reset-success': 'true',
          ...(route.query.redirect && { redirect: route.query.redirect })
        },
      })
    } else {
      error.value = t('auth.pages.resetPassword.errors.unableToUpdate')
    }
  } catch (submitError) {
    console.error(submitError)
    error.value = t('auth.pages.resetPassword.errors.unexpected')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.ResetPasswordView__form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.ResetPasswordView__fieldLabel {
  display: inline-block;
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.ResetPasswordView__back {
  color: rgb(var(--v-theme-main-blue));
  text-decoration: none;
  font-weight: 600;
}
</style>
