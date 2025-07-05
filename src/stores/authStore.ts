import { NotificationType } from '@/models/enums/NotificationType';
import { i18n } from '@/plugins/i18n';
import { supabase } from '@/plugins/supabase';
import { addNotification } from '@/services/NotificationsService';
import type { Session } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';

export const useAuthenticationStore = defineStore('authentication', () => {
  const showAuthModal = ref(false)
  const showForgotPasswordModal = ref(false)
  const authSession: Ref<Session | null> = ref(null)
  const showResetPasswordModal = ref(false)

  async function initAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error)
        addNotification(i18n.t('auth.authError'), NotificationType.ERROR)
      } else {
        authSession.value = session
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      addNotification(i18n.t('auth.authError'), NotificationType.ERROR)
    }

    supabase.auth.onAuthStateChange((event, session) => {
      authSession.value = session
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('reset-password')) {
        showResetPasswordModal.value = true
      }
    })
  }

  async function signIn(loginData: { email: string; password: string }) {
    await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password
    }).then(async ({ error }) => {
      if (error) {
        console.error('Login error:', error)
        addNotification(i18n.t('auth.authError'), NotificationType.ERROR)
      } else {
        showAuthModal.value = false
        getSession()
      }
    })
  }

  async function signUp(signupData: { email: string; first_name: string; last_name: string; password: string }) {
    console.log('Signup data:', signupData)
    await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          first_name: signupData.first_name,
          last_name: signupData.last_name
        }
      }
    }).then(async ({ error }) => {
      if (error) {
        console.error('Signup error:', error)
        addNotification(i18n.t('auth.accountFailed'), NotificationType.ERROR)
      } else {
        showAuthModal.value = false
        addNotification(i18n.t('auth.accountCreated'), NotificationType.SUCCESS)
        getSession()
      }
    })
  }
  
  async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error fetching session:', error)
      addNotification(i18n.t('auth.errorFetchingSession'), NotificationType.ERROR)
    } else {
      authSession.value = session
    }
  }

  async function signOut() {
    await supabase.auth.signOut().then(({ error }) => {
      if (error) {
        console.error('Sign out error:', error)
      } else {
        authSession.value = null
      }
    })
  }

  async function recoverPassword(email: string) {
    console.log('Recovering password for:', email)
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: window.location.origin + '?reset-password'
      }
    )
    if (error) {
      console.error('Password recovery error:', error)
      addNotification(i18n.t('auth.passwordRecoveryError'), NotificationType.ERROR)
    } else {
      showForgotPasswordModal.value = false
      addNotification(i18n.t('auth.passwordRecoverySuccess'), NotificationType.SUCCESS)
    }
  }
  
  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) {
      console.error('Password update error:', error)
      addNotification(i18n.t('auth.passwordRecoveryError'), NotificationType.ERROR)
    } else {
      window.history.replaceState({}, document.title, window.location.origin)
      showResetPasswordModal.value = false
      addNotification(i18n.t('auth.passwordUpdateSuccess'), NotificationType.SUCCESS)
    }
  }

  return { showAuthModal, showForgotPasswordModal, showResetPasswordModal, authSession, initAuth, signIn, signUp, signOut, recoverPassword, updatePassword }
})
