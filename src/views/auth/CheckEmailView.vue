<template>
  <AuthPageLayout :title="title" :subtitle="description" icon="$emailCheckOutline">
      <v-alert v-if="statusMessage" :type="statusType" density="compact" variant="tonal" class="mb-4">
        {{ statusMessage }}
      </v-alert>

      <!-- Show code input for password reset mode -->
      <div v-if="mode === 'reset'" class="CheckEmailView__codeSection">
        <div class="CheckEmailView__field">
          <label class="CheckEmailView__fieldLabel" for="reset-code">
            {{ $t('auth.forms.labels.resetCode') }}
          </label>
          <v-text-field
            id="reset-code"
            v-model="resetCode"
            hide-details="auto"
            type="text"
            autocomplete="one-time-code"
            variant="outlined"
            prepend-inner-icon="$lockOutline"
            :disabled="isSubmitting"
            :placeholder="$t('auth.forms.placeholders.enterResetCode')"
            required
          />
        </div>

        <v-btn 
          color="main-blue" 
          block 
          size="large" 
          :loading="isSubmitting" 
          :disabled="!resetCode"
          @click="verifyCodeAndReset"
        >
          {{ $t('auth.pages.checkEmail.verifyAndReset') }}
        </v-btn>
      </div>

      <!-- Show resend button for signup mode or as fallback -->
      <div v-else class="CheckEmailView__actions">
        <v-btn color="main-blue" block size="large" :loading="isSubmitting" @click="resendEmail">
          {{ $t('auth.pages.checkEmail.resend') }}
        </v-btn>
      </div>

      <!-- Show resend option for reset mode too -->
      <div v-if="mode === 'reset'" class="CheckEmailView__resendSection">
        <v-btn 
          variant="text" 
          size="small" 
          :disabled="isSubmitting"
          @click="resendEmail"
        >
          {{ $t('auth.pages.checkEmail.resend') }}
        </v-btn>
      </div>

      <!-- Instructions for reset mode -->
      <div v-if="mode === 'reset'" class="CheckEmailView__instructions">
        <div class="CheckEmailView__instructionBox">
          <v-icon icon="$emailCheckOutline" size="24" color="main-blue" />
          <div class="CheckEmailView__instructionText">
            <h4>{{ $t('auth.pages.checkEmail.instructions.title') }}</h4>
            <p>{{ $t('auth.pages.checkEmail.instructions.description') }}</p>
            <ol>
              <li>{{ $t('auth.pages.checkEmail.instructions.step1') }}</li>
              <li>{{ $t('auth.pages.checkEmail.instructions.step2') }}</li>
              <li>{{ $t('auth.pages.checkEmail.instructions.step3') }}</li>
            </ol>
          </div>
        </div>
      </div>

      <div class="CheckEmailView__support">
        {{ $t('auth.pages.checkEmail.needHelp') }}
        <a href="#">{{ $t('auth.pages.checkEmail.contactSupport') }}</a>
      </div>

    <template #footer>
      <RouterLink 
      class="CheckEmailView__back" 
      :to="{
        name: 'auth-sign-in',
        ...(route.query.redirect && { query: { redirect: route.query.redirect } })
      }"
    >
      {{ $t('auth.pages.checkEmail.backToSignIn') }}
    </RouterLink>
    </template>
  </AuthPageLayout>
</template>

<script setup lang="ts">
import { supabase } from '@/plugins/supabase'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AuthPageLayout from '@/views/auth/components/AuthPageLayout.vue'
import { useAuthenticationStore } from '@/stores/authStore'

type StatusType = 'success' | 'error'

const route = useRoute()
const router = useRouter()
const authStore = useAuthenticationStore()
const { t } = useI18n()

const isSubmitting = ref(false)
const statusMessage = ref('')
const statusType = ref<StatusType>('success')
const resetCode = ref('')

const email = computed(() => {
  const emailQuery = route.query.email
  return typeof emailQuery === 'string' ? emailQuery : ''
})

const redirectTarget = computed(() => {
  const redirect = route.query.redirect
  if (typeof redirect !== 'string' || !redirect.startsWith('/')) {
    return '/'
  }
  return redirect
})

const mode = computed(() => {
  const modeQuery = route.query.mode
  return modeQuery === 'signup' ? 'signup' : 'reset'
})

const title = computed(() => {
  return mode.value === 'signup' ? t('auth.pages.checkEmail.confirmTitle') : t('auth.pages.checkEmail.inboxTitle')
})

const description = computed(() => {
  if (mode.value === 'signup') {
    return t('auth.pages.checkEmail.confirmDescription', { email: email.value || t('auth.pages.common.yourEmail') })
  }

  return t('auth.pages.checkEmail.resetDescription', { email: email.value || t('auth.pages.common.yourEmail') })
})

async function verifyCodeAndReset() {
  if (!resetCode.value || !email.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  statusMessage.value = ''

  try {
    // Save the redirect parameter before verifyOtp in case it gets lost
    const savedRedirect = route.query.redirect
    
    // For Supabase, the 6-digit code needs to be used with verifyOtp
    // The code acts as a one-time password (OTP) for recovery
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token: resetCode.value,
      type: 'recovery',
      email: email.value
    })
    
    if (verifyError) {
      console.error('Code verification error:', verifyError)
      statusType.value = 'error'
      statusMessage.value = t('auth.pages.checkEmail.errors.invalidCode')
      return
    }

    // If verification succeeds, redirect to reset password page
    // The session is now established, so we can update the password
    const redirectQuery = savedRedirect && { redirect: savedRedirect }
    
    await router.push({
      name: 'auth-reset-password',
      query: { 
        token: resetCode.value,
        email: email.value,
        verified: 'true',
        ...redirectQuery
      }
    })
  } catch (error) {
    console.error('Code verification error:', error)
    statusType.value = 'error'
    statusMessage.value = t('auth.pages.checkEmail.errors.invalidCode')
  } finally {
    isSubmitting.value = false
  }
}

async function resendEmail() {
  if (!email.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  statusMessage.value = ''

  try {
    if (mode.value === 'signup') {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.value,
        options: {
          emailRedirectTo: window.location.origin + import.meta.env.VITE_BASE_URL + '?signup-success',
        },
      })

      if (error) {
        throw error
      }
    } else {
      const isSuccess = await authStore.recoverPassword(
        email.value,
        route.query.redirect as string
      )
      if (!isSuccess) {
        throw new Error(t('auth.pages.checkEmail.errors.couldNotResend'))
      }
    }

    statusType.value = 'success'
    statusMessage.value = t('auth.pages.checkEmail.status.sent')
  } catch (resendError) {
    console.error(resendError)
    statusType.value = 'error'
    statusMessage.value = t('auth.pages.checkEmail.status.failed')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.CheckEmailView__mailIcon {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  margin: 0 auto 1.4rem;
  display: grid;
  place-items: center;
  background: rgba(51, 92, 142, 0.1);
}

.CheckEmailView__codeSection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.CheckEmailView__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.CheckEmailView__fieldLabel {
  display: inline-block;
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.CheckEmailView__instructions {
  margin-bottom: 1.5rem;
}

.CheckEmailView__instructionBox {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(51, 92, 142, 0.05);
  border: 1px solid rgba(51, 92, 142, 0.1);
  border-radius: 8px;
  align-items: flex-start;
}

.CheckEmailView__instructionText {
  flex: 1;
}

.CheckEmailView__instructionText h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
}

.CheckEmailView__instructionText p {
  margin: 0 0 1rem 0;
  color: #64748b;
  font-size: 0.9rem;
}

.CheckEmailView__instructionText ol {
  margin: 0;
  padding-left: 1.2rem;
  color: #64748b;
  font-size: 0.85rem;
}

.CheckEmailView__instructionText li {
  margin-bottom: 0.5rem;
}

.CheckEmailView__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.CheckEmailView__resendSection {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.CheckEmailView__back {
  text-align: center;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
}

.CheckEmailView__support {
  margin-top: 1.3rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  color: #64748b;
  font-size: 0.8rem;
}

.CheckEmailView__support a {
  margin-left: 0.2rem;
  color: rgb(var(--v-theme-main-blue));
  text-decoration: none;
  font-weight: 600;
}
</style>
