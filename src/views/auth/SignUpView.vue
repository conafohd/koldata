<template>
  <div class="SignUpView">
    <div class="SignUpView__shell">
      <aside class="SignUpView__hero">
        <div class="SignUpView__heroGlow" />
        <div class="SignUpView__heroContent">
          <div class="SignUpView__heroIcon">
            <v-icon icon="$database" size="34" />
          </div>
          <h1>{{ $t('auth.pages.signUp.heroTitle') }}</h1>
          <p>
            {{ $t('auth.pages.signUp.heroSubtitle') }}
          </p>
          <p class="SignUpView__heroDescription">
            {{ $t('auth.pages.signUp.heroDescription') }}
          </p>
          <div class="SignUpView__heroStats">
            <p>{{ $t('auth.pages.signUp.heroStats') }}</p>
          </div>
          <div class="SignUpView__heroTrust" v-if="false">
            <div class="SignUpView__avatars">
              <span />
              <span />
              <span />
            </div>
            <small>{{ $t('auth.pages.signUp.heroTrust') }}</small>
          </div>
        </div>
      </aside>

      <section class="SignUpView__formPanel">
        <div class="SignUpView__brand">
          <RouterLink class="AuthPageLayout__logoBox" :to="{ name: 'home' }">
            <!-- <v-icon icon="$database" size="30" color="main-blue" /> -->
            <v-img :src="faviconPath" :width="30" alt="Kongo Local Data" />
          </RouterLink>
          <span>{{ $t('auth.brand') }}</span>
        </div>

        <div class="SignUpView__head">
          <h2>{{ $t('auth.pages.signUp.title') }}</h2>
          <p>{{ $t('auth.pages.signUp.subtitle') }}</p>
        </div>

        <v-form class="SignUpView__form" @submit.prevent="handleSubmit">
          <div class="SignUpView__field">
            <label class="SignUpView__fieldLabel" for="sign-up-full-name">{{ $t('auth.pages.signUp.fullName') }}</label>
            <v-text-field
              id="sign-up-full-name"
              v-model="fullName"
              hide-details="auto"
              autofocus
              autocomplete="name"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="$accountOutline"
              :disabled="isSubmitting"
              required
            />
          </div>

          <div class="SignUpView__field">
            <label class="SignUpView__fieldLabel" for="sign-up-email">{{ $t('auth.pages.signUp.workEmail') }}</label>
            <v-text-field
              id="sign-up-email"
              v-model="email"
              hide-details="auto"
              type="email"
              autocomplete="email"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="$emailOutline"
              :disabled="isSubmitting"
              required
            />
          </div>

          <div class="SignUpView__field">
            <label class="SignUpView__fieldLabel" for="sign-up-password">{{ $t('auth.forms.labels.password') }}</label>
            <v-text-field
              id="sign-up-password"
              v-model="password"
              hide-details="auto"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="$lockOutline"
              :append-inner-icon="showPassword ? '$eyeOff' : '$eye'"
              :disabled="isSubmitting"
              @click:append-inner="showPassword = !showPassword"
              required
            />
          </div>

          <p class="SignUpView__passwordHint">{{ $t('auth.pages.signUp.passwordHint') }}</p>

          <div class="SignUpView__termsRow" v-if="false">
            <v-checkbox-btn v-model="acceptTerms" color="main-blue" density="comfortable" :disabled="isSubmitting" />
            <span>
              {{ $t('auth.pages.signUp.acceptTermsPrefix') }}
              <a href="#">{{ $t('auth.pages.signUp.terms') }}</a>
              {{ $t('auth.pages.signUp.acceptTermsMiddle') }}
              <a href="#">{{ $t('auth.pages.signUp.privacy') }}</a>.
            </span>
          </div>

          <v-alert v-if="error" type="error" density="compact" variant="tonal">{{ error }}</v-alert>

          <v-btn color="main-blue" type="submit" size="large" :loading="isSubmitting" :disabled="!canSubmit" block>
            {{ $t('auth.pages.signUp.createAccount') }}
          </v-btn>
        </v-form>

        <p class="SignUpView__switchAuth">
          {{ $t('auth.pages.signUp.hasAccount') }}
          <RouterLink :to="signInLink">{{ $t('auth.signIn') }}</RouterLink>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthenticationStore } from '@/stores/authStore'
import { getPublicPath } from '@/services/utils/ImageService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthenticationStore()
const { t } = useI18n()

const fullName = ref('')
const email = ref('')
const password = ref('')
const acceptTerms = ref(false)
const showPassword = ref(false)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

const faviconPath = computed(() => getPublicPath('favicon.ico'))

const canSubmit = computed(() => {
  return Boolean(
    fullName.value.trim() &&
      email.value.trim() &&
      password.value &&
      acceptTerms.value,
  )
})

const splitName = computed(() => {
  const trimmed = fullName.value.trim()
  if (!trimmed) {
    return { firstName: '', lastName: '' }
  }

  const chunks = trimmed.split(/\s+/)
  const firstName = chunks.shift() ?? ''
  const lastName = chunks.join(' ') || '-'
  return { firstName, lastName }
})

const signInLink = computed(() => ({
  name: 'auth-sign-in',
  query: typeof route.query.redirect === 'string' ? { redirect: route.query.redirect } : {},
}))

async function handleSubmit() {
  if (!canSubmit.value || isSubmitting.value) {
    return
  }

  error.value = null
  isSubmitting.value = true

  try {
    const isSuccess = await authStore.signUp({
      email: email.value.trim(),
      first_name: splitName.value.firstName,
      last_name: splitName.value.lastName,
      password: password.value,
    })

    if (isSuccess) {
      await router.push({
        name: 'auth-confirm-account',
        query: { email: email.value.trim() },
      })
    } else {
      error.value = t('auth.pages.signUp.errors.unableToCreate')
    }
  } catch (submitError) {
    console.error(submitError)
    error.value = t('auth.pages.signUp.errors.unexpected')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.SignUpView {
  min-height: 100vh;
  background: linear-gradient(160deg, #f6f7f8 0%, #ecf1f6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.SignUpView__shell {
  width: 100%;
  max-width: 1024px;
  min-height: 620px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 45px -28px rgba(51, 92, 142, 0.45);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.SignUpView__hero {
  display: none;
  width: 50%;
  background: rgb(var(--v-theme-main-blue));
  padding: 3rem;
  position: relative;
  overflow: hidden;
}

.SignUpView__heroGlow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0));
  opacity: 0.7;
}

.SignUpView__heroContent {
  position: relative;
  color: #fff;
}

.SignUpView__heroIcon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.15);
  display: grid;
  place-items: center;
}

.SignUpView__heroContent h1 {
  margin-top: 1.25rem;
  font-size: 2rem;
  line-height: 1.2;
}

.SignUpView__heroContent p {
  margin-top: 1rem;
  color: rgba(241, 245, 249, 0.92);
}

.SignUpView__heroTrust {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

.SignUpView__avatars {
  display: flex;
}

.SignUpView__avatars span {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 2px solid rgb(var(--v-theme-main-blue));
  margin-left: -0.35rem;
}

.SignUpView__avatars span:nth-child(1) { background: #d1d5db; margin-left: 0; }
.SignUpView__avatars span:nth-child(2) { background: #9ca3af; }
.SignUpView__avatars span:nth-child(3) { background: #6b7280; }

.SignUpView__heroTrust small { color: #e2e8f0; }

.SignUpView__formPanel {
  width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.SignUpView__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.SignUpView__head h2 {
  font-size: 1.85rem;
}

.SignUpView__head p {
  margin-top: 0.4rem;
  color: #64748b;
}

.SignUpView__form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.SignUpView__fieldLabel {
  display: inline-block;
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.SignUpView__passwordHint {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.SignUpView__termsRow {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  font-size: 0.86rem;
  color: #64748b;
  margin-bottom: 0.8rem;
}

.SignUpView__termsRow a {
  color: rgb(var(--v-theme-main-blue));
  text-decoration: none;
  font-weight: 600;
}

.SignUpView__switchAuth {
  margin-top: 1.5rem;
  text-align: center;
  color: #64748b;
}

.SignUpView__switchAuth a {
  margin-left: 0.2rem;
  color: rgb(var(--v-theme-main-blue));
  text-decoration: none;
  font-weight: 700;
}

.SignUpView__heroDescription {
  margin: 1rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #e2e8f0;
}

.SignUpView__heroStats {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.SignUpView__heroStats p {
  margin: 0;
  font-size: 0.8rem;
  line-height: 1.4;
  color: #cbd5e1;
}

@media (min-width: 860px) {
  .SignUpView__shell {
    flex-direction: row;
  }

  .SignUpView__hero {
    display: block;
  }

  .SignUpView__formPanel {
    width: 50%;
    padding: 2.8rem;
  }
}
</style>
