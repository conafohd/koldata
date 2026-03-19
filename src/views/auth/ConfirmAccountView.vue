<template>
  <AuthPageLayout
    :title="$t('auth.pages.confirmAccount.title')"
    :subtitle="subtitle"
    icon="$emailCheckOutline"
  >
    <div class="ConfirmAccountView__iconWrap">
      <v-icon icon="$emailCheckOutline" size="46" color="main-blue" />
    </div>

    <v-alert v-if="statusMessage" :type="statusType" density="compact" variant="tonal" class="mb-4">
      {{ statusMessage }}
    </v-alert>

    <v-btn color="main-blue" block :loading="isSubmitting" @click="resendConfirmation" size="large">
      {{ $t('auth.pages.confirmAccount.resend') }}
    </v-btn>

    <p class="ConfirmAccountView__support">
      {{ $t('auth.pages.checkEmail.needHelp') }}
      <a href="#">{{ $t('auth.pages.checkEmail.contactSupport') }}</a>
    </p>

    <template #footer>
      <RouterLink class="ConfirmAccountView__back" :to="{ name: 'auth-sign-in' }">{{ $t('auth.pages.confirmAccount.backToSignIn') }}</RouterLink>
    </template>
  </AuthPageLayout>
</template>

<script setup lang="ts">
import AuthPageLayout from '@/views/auth/components/AuthPageLayout.vue'
import { supabase } from '@/plugins/supabase'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

type StatusType = 'success' | 'error'

const route = useRoute()
const { t } = useI18n()
const isSubmitting = ref(false)
const statusMessage = ref('')
const statusType = ref<StatusType>('success')

const email = computed(() => {
  const emailQuery = route.query.email
  return typeof emailQuery === 'string' ? emailQuery : ''
})

const subtitle = computed(() => {
  return t('auth.pages.confirmAccount.subtitle', { email: email.value || t('auth.pages.common.yourEmail') })
})

async function resendConfirmation() {
  if (!email.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  statusMessage.value = ''

  try {
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

    statusType.value = 'success'
    statusMessage.value = t('auth.pages.confirmAccount.status.sent')
  } catch (resendError) {
    console.error(resendError)
    statusType.value = 'error'
    statusMessage.value = t('auth.pages.confirmAccount.status.failed')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.ConfirmAccountView__iconWrap {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  margin: 0 auto 1.4rem;
  display: grid;
  place-items: center;
  background: rgba(51, 92, 142, 0.1);
}

.ConfirmAccountView__back {
  color: rgb(var(--v-theme-main-blue));
  text-decoration: none;
  font-weight: 600;
}

.ConfirmAccountView__support {
  margin-top: 1.2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  color: #64748b;
  font-size: 0.82rem;
}

.ConfirmAccountView__support a {
  margin-left: 0.2rem;
  color: rgb(var(--v-theme-main-blue));
  text-decoration: none;
  font-weight: 600;
}
</style>
