<template>
  <HeaderMobile v-if="appStore.mobile" />
  <HeaderDesktop v-else />
  <HeaderNotice />
  <AuthDialog />
  <ForgotPasswordDialog />
  <ResetPasswordDialog />
</template>

<script setup lang="ts">
import AuthDialog from '@/components/auth/AuthDialog.vue'
import ForgotPasswordDialog from '@/components/auth/ForgotPasswordDialog.vue'
import ResetPasswordDialog from '@/components/auth/ResetPasswordDialog.vue'
import { useApplicationStore } from '@/stores/applicationStore'
import HeaderDesktop from './HeaderDesktop.vue'
import HeaderNotice from './HeaderNotice.vue'
import HeaderMobile from './HeaderMobile.vue'
const appStore = useApplicationStore()
</script>
