<template>
  <AuthPageLayout
    :title="$t('auth.pages.forgotPassword.title')"
    :subtitle="$t('auth.pages.forgotPassword.subtitle')"
    icon="$lockReset"
  >
    <v-form class="ForgotPasswordView__form" @submit.prevent="handleSubmit">
      <div class="ForgotPasswordView__field">
        <label class="ForgotPasswordView__fieldLabel" for="forgot-password-email">{{ $t('auth.forms.labels.email') }}</label>
        <v-text-field
          id="forgot-password-email"
          v-model="email"
          hide-details="auto"
          autofocus
          type="email"
          autocomplete="email"
          variant="outlined"
          prepend-inner-icon="$emailOutline"
          :disabled="isSubmitting"
          required
        />
      </div>

      <v-alert v-if="error" type="error" density="compact" variant="tonal">{{ error }}</v-alert>

      <v-btn color="main-blue" type="submit" :loading="isSubmitting" :disabled="!email" block size="large">
        {{ $t('auth.sendResetLink') }}
      </v-btn>
    </v-form>

    <template #footer>
      <RouterLink class="ForgotPasswordView__back" :to="{ name: 'auth-sign-in' }">
        {{ $t('auth.pages.forgotPassword.backToSignIn') }}
      </RouterLink>
    </template>
  </AuthPageLayout>
</template>

<script setup lang="ts">
import AuthPageLayout from '@/views/auth/components/AuthPageLayout.vue'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthenticationStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthenticationStore()
const { t } = useI18n()

const email = ref('')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect !== 'string' || !redirect.startsWith('/')) {
    return '/'
  }
  return redirect
})

async function handleSubmit() {
  if (!email.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    const isSuccess = await authStore.recoverPassword(
      email.value.trim(), 
      route.query.redirect as string
    )

    if (isSuccess) {
      await router.push({
        name: 'auth-check-email',
        query: {
          email: email.value.trim(),
          mode: 'reset',
          ...(route.query.redirect && { redirect: route.query.redirect }),
        },
      })
    } else {
      error.value = t('auth.pages.forgotPassword.errors.unableToSend')
    }
  } catch (submitError) {
    console.error(submitError)
    error.value = t('auth.pages.forgotPassword.errors.unexpected')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.ForgotPasswordView__form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.ForgotPasswordView__fieldLabel {
  display: inline-block;
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.ForgotPasswordView__back {
  color: rgb(var(--v-theme-main-blue));
  text-decoration: none;
  font-weight: 600;
}
</style>
