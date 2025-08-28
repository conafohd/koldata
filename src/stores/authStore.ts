import { NotificationType } from '@/models/enums/NotificationType';
import { TablesList } from '@/models/enums/TablesList';
import { UserRole } from '@/models/enums/UserRole';
import type { UserInfos } from '@/models/interfaces/UserInfos';
import { i18n } from '@/plugins/i18n';
import { supabase } from '@/plugins/supabase';
import { addNotification } from '@/services/NotificationsService';
import type { Session } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApplicationStore } from './applicationStore';

export const useAuthenticationStore = defineStore('authentication', () => {
  const showAuthModal = ref(false)
  const showForgotPasswordModal = ref(false)
  const showResetPasswordModal = ref(false)
  const authSession: Ref<Session | null> = ref(null)
  const userInfos: Ref<UserInfos | null> = ref(null)
  const applicationStore = useApplicationStore()
  const router = useRouter()
  const isAdmin = computed(() => {
    return userInfos.value?.role === UserRole.ADMIN
  })

  async function initAuth() {
    if (authSession.value) {
      return
    }
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error)
        addNotification(i18n.t('auth.authError'), NotificationType.ERROR)
      } else {
        if (session) {
          authSession.value = session
          await getUserInfos()
        }
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
      if (urlParams.has('signup-success')) {
        addNotification(i18n.t('auth.accountConfirmed'), NotificationType.SUCCESS)
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
    await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          first_name: signupData.first_name,
          last_name: signupData.last_name
        },
        emailRedirectTo: window.location.origin + import.meta.env.VITE_BASE_URL + '?signup-success'
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
      if (session) {
        console.log(session)
        authSession.value = session
        getUserInfos()
      }
    }
  }

  async function getUserInfos() {
    const { data: profile, error } = await supabase.from(TablesList.USER_PROFILES).select('*').eq('id', authSession.value?.user.id).single()
      if (error) {
        console.error('Error fetching user profile:', error)
        addNotification(i18n.t('auth.errorFetchingProfile'), NotificationType.ERROR)
      } else {
        userInfos.value = profile as UserInfos
      }
  }

  async function signOut() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) {
            if (error.message.includes('session_not_found') || 
                error.message.includes('Session from session_id claim')) {
                console.log('Session already expired, cleaning up locally')
            } else {
                console.error('Sign out error:', error)
            }
        }        
    } catch (error) {
        console.error('Unexpected sign out error:', error)
    } finally {
        authSession.value = null
        userInfos.value = null
        clearAuthStorage()
        if (applicationStore.activeTab === 4) {
          router.push({ name: 'home' })
        }
    }
}

  function clearAuthStorage() {
    const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('supabase') || key.startsWith('auth')
    )
    keysToRemove.forEach(key => localStorage.removeItem(key))
    sessionStorage.clear()
}

  async function recoverPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: window.location.origin + import.meta.env.VITE_BASE_URL + '?reset-password'
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

  return { showAuthModal, showForgotPasswordModal, showResetPasswordModal, authSession, userInfos, isAdmin, initAuth, signIn, signUp, signOut, recoverPassword, updatePassword }
})
