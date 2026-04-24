<template>
  <AuthPageLayout
    :title="$t('auth.pages.signIn.title')"
    :subtitle="$t('auth.pages.signIn.subtitle')"
  >
    <v-form class="SignInView__form" @submit.prevent="handleSubmit">
      <div class="SignInView__field">
        <label class="SignInView__fieldLabel" for="sign-in-email">{{ $t('auth.forms.labels.email') }}</label>
        <v-text-field
          id="sign-in-email"
          v-model="signInForm.form.email.value.value"
          :error-messages="signInForm.form.email.errorMessage.value"
          hide-details="auto"
          @blur="signInForm.form.email.handleBlur"
          autofocus
          type="email"
          autocomplete="email"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="$emailOutline"
          :disabled="signInForm.isSubmitting.value"
          required
        />
      </div>

      <div class="SignInView__field">
        <label class="SignInView__fieldLabel" for="sign-in-password">{{ $t('auth.forms.labels.password') }}</label>
        <v-text-field
          id="sign-in-password"
          v-model="signInForm.form.password.value.value"
          :error-messages="signInForm.form.password.errorMessage.value"
          hide-details="auto"
          @blur="signInForm.form.password.handleBlur"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="$lockOutline"
          :append-inner-icon="showPassword ? '$eyeOff' : '$eye'"
          :disabled="signInForm.isSubmitting.value"
          @click:append-inner="showPassword = !showPassword"
          required
        />
      </div>

      <div class="SignInView__utilityRow">
        <div class="SignInView__rememberGroup">
          <v-checkbox-btn
            v-model="rememberMe"
            class="SignInView__rememberCheck"
            color="main-blue"
            density="compact"
            hide-details
          />
          <span class="SignInView__rememberLabel">{{ $t('auth.pages.signIn.rememberMe') }}</span>
        </div>
        <RouterLink 
          class="SignInView__forgotLink" 
          :to="{
            name: 'auth-forgot-password',
            ...(route.query.redirect && { query: { redirect: route.query.redirect } })
          }"
        >
          {{ $t('auth.forgotPassword') }}
        </RouterLink>
      </div>

      <v-alert v-if="error" type="error" density="compact" variant="tonal">{{ error }}</v-alert>

      <v-btn
        color="main-blue"
        type="submit"
        :loading="signInForm.isSubmitting.value"
        :disabled="!canSubmit"
        size="large"
        block
      >
        {{ $t('auth.signIn') }}
      </v-btn>
    </v-form>
  <!-- 
          <div class="SignInView__divider">
            <span>{{ $t('auth.pages.signIn.continueWith') }}</span>
          </div>

          <div class="SignInView__socialGrid">
            <v-btn variant="outlined" block disabled>
              <svg class="SignInView__socialIcon SignInView__socialIcon--google" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              {{ $t('auth.pages.signIn.google') }}
            </v-btn>
            <v-btn variant="outlined" block disabled>
              <svg class="SignInView__socialIcon SignInView__socialIcon--apple" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.05 12.54c-.03-3.22 2.63-4.76 2.75-4.84-1.5-2.2-3.83-2.5-4.65-2.54-1.98-.2-3.87 1.17-4.88 1.17-1 0-2.56-1.14-4.2-1.11-2.16.03-4.16 1.26-5.27 3.2-2.26 3.91-.58 9.7 1.62 12.88 1.08 1.55 2.36 3.3 4.04 3.24 1.62-.07 2.24-1.05 4.2-1.05 1.96 0 2.52 1.05 4.23 1.02 1.75-.03 2.85-1.58 3.92-3.14 1.24-1.81 1.75-3.57 1.78-3.66-.04-.01-3.4-1.3-3.44-5.17z" fill="currentColor"/>
                <path d="M14.01 3.2c.89-1.08 1.49-2.58 1.33-4.08-1.29.05-2.86.86-3.78 1.94-.83.96-1.55 2.5-1.35 3.97 1.44.11 2.91-.73 3.8-1.83z" fill="currentColor"/>
              </svg>
              {{ $t('auth.pages.signIn.apple') }}
            </v-btn>
          </div> -->
      <template #footer>
        <p class="SignInView__bottomText">
          {{ $t('auth.pages.signIn.noAccount') }}
          <RouterLink :to="signUpLink">{{ $t('auth.signUp') }}</RouterLink>
        </p>
      </template>
  </AuthPageLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { AuthFormValidator } from '@/services/forms/AuthFormService'
import { CommonFormService } from '@/services/forms/CommonFormService'
import { useAuthenticationStore } from '@/stores/authStore'
import AuthPageLayout from './components/AuthPageLayout.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthenticationStore()
const { t } = useI18n()

const signInForm = AuthFormValidator.getSignInForm()
const showPassword = ref(false)
const rememberMe = ref(false)
const error = ref<string | null>(null)

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect !== 'string' || !redirect.startsWith('/')) {
    return '/'
  }

  return redirect
})

const canSubmit = computed(() => signInForm.isValid.value && !signInForm.isSubmitting.value)

const signUpLink = computed(() => ({
  name: 'auth-sign-up',
  query: typeof route.query.redirect === 'string' ? { redirect: route.query.redirect } : {},
}))

const handleSubmit = signInForm.handleSubmit(async (values) => {
  error.value = null

  try {
    const sanitizedData = CommonFormService.sanitizeFormData(values)
    const isSuccess = await authStore.signIn({
      email: sanitizedData.email,
      password: sanitizedData.password,
    })

    if (isSuccess) {
      await router.push(redirectTarget.value)
    } else {
      error.value = t('auth.pages.signIn.errors.invalidCredentials')
    }
  } catch (submitError) {
    console.error(submitError)
    error.value = t('auth.pages.signIn.errors.unexpected')
  }
})
</script>

<style scoped lang="scss">
.SignInView {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.SignInView__container {
  width: 100%;
  max-width: 480px;
}

.SignInView__logoArea {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1.6rem;
}

.SignInView__logoBox {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
}

.SignInView__brand {
  color: rgb(var(--v-theme-main-blue));
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.SignInView__card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 45px -28px rgba(51, 92, 142, 0.45);
  padding: 2rem;
}

.SignInView__head h1 {
  font-size: 1.5rem;
  margin-bottom: 0.35rem;
}

.SignInView__head p {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.4rem;
}

.SignInView__form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.SignInView__fieldLabel {
  display: inline-block;
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.SignInView__utilityRow {
  display: flex;
  align-items: center;
  min-height: 38px;
}

.SignInView__rememberGroup {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.SignInView__rememberCheck {
  margin: 0;
}

.SignInView__rememberCheck :deep(.v-selection-control) {
  min-height: 0;
}

.SignInView__rememberLabel {
  font-size: 0.9rem;
  color: #64748b;
}

.SignInView__forgotLink {
  margin-left: auto;
  text-decoration: none;
  color: rgb(var(--v-theme-main-blue));
  font-size: 0.9rem;
  font-weight: 600;
}

.SignInView__divider {
  margin: 1.6rem 0;
  position: relative;
  text-align: center;
}

.SignInView__divider::before {
  content: '';
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background: #e2e8f0;
}

.SignInView__divider span {
  position: relative;
  background: #fff;
  padding: 0 0.6rem;
  color: #64748b;
  text-transform: uppercase;
  font-size: 0.72rem;
}

.SignInView__socialGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.SignInView__socialIcon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  margin-right: 0.45rem;
}

.SignInView__socialIcon--google {
  width: 18px;
  height: 18px;
  margin-right: 0.25rem;
}

.SignInView__socialIcon--apple {
  width: 18px;
  height: 18px;
  margin-right: 0.25rem;
}

.SignInView__bottomText {
  margin-top: 1.3rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}

.SignInView__bottomText a {
  margin-left: 0.2rem;
  color: rgb(var(--v-theme-main-blue));
  font-weight: 700;
  text-decoration: none;
}
</style>
