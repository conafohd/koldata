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
  const isPending = computed(() => {
    return userInfos.value?.role === UserRole.PENDING
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

    supabase.auth.onAuthStateChange(async (event, session) => {
      authSession.value = session
      const urlParams = new URLSearchParams(window.location.search)
      
      // Handle password recovery from Supabase email link
      if (event === 'PASSWORD_RECOVERY') {
        await router.push({
          name: 'auth-reset-password',
          query: { token: 'recovery' },
        })
        return
      }
      
      if (urlParams.has('reset-password')) {
        const token = urlParams.get('reset-password')
        const redirect = urlParams.get('redirect')
        
        const query: Record<string, string> = { token: token || '' }
        if (redirect) {
          query.redirect = redirect
        }
        
        await router.push({
          name: 'auth-reset-password',
          query,
        })
      }
      if (urlParams.has('signup-success')) {
        addNotification(i18n.t('auth.accountConfirmed'), NotificationType.SUCCESS)
      }
      if (urlParams.has('confirm-email')) {
        addNotification(i18n.t('auth.confirmEmailSuccess'), NotificationType.SUCCESS)
      }
    })
  }

  async function signIn(loginData: { email: string; password: string }) {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password
    })

    if (error) {
      console.error('Login error:', error)
      addNotification(i18n.t('auth.authError'), NotificationType.ERROR)
      return false
    }

    showAuthModal.value = false
    await getSession()
    return true
  }

 async function signUp(signupData: { email: string; first_name: string; last_name: string; password: string; associationId: string }) {
    await supabase.auth.signUp({
      email: signupData.email,
      password: signupData.password,
      options: {
        data: {
          first_name: signupData.first_name,
          last_name: signupData.last_name,
          edit_association_id: signupData.associationId,
          role: UserRole.PENDING
        },
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL + '?signup-success'
      }
      }).then(async ({ error }) => {
      if (error) {
        console.error('Signup error:', error)
        addNotification(i18n.t('auth.accountFailed'), NotificationType.ERROR)
      } else {
        showAuthModal.value = false
        addNotification(i18n.t('auth.accountCreated'), NotificationType.SUCCESS)
        getSession()

        await supabase.functions.invoke('send-editor-email', {
          body: {
            associationId: signupData.associationId,
          },
        }).then(async({error}) =>{
          console.error('Signup error:', error)
          addNotification(i18n.t('auth.accountFailed'), NotificationType.ERROR)
        })
      }
    })

    if (error) {
      console.error('Signup error:', error)
      addNotification(i18n.t('auth.accountFailed'), NotificationType.ERROR)
      return false
    }

    showAuthModal.value = false
    addNotification(i18n.t('auth.accountCreated'), NotificationType.SUCCESS)
    await getSession()
    return true
  }
  
  async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error fetching session:', error)
      addNotification(i18n.t('auth.errorFetchingSession'), NotificationType.ERROR)
    } else {
      if (session) {
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

  async function recoverPassword(email: string, redirectUrl?: string) {
    const baseUrl = window.location.origin + import.meta.env.VITE_BASE_URL + '?reset-password'
    
    let redirectTo = baseUrl
    if (redirectUrl) {
      // Simple approach: just append the redirect as encoded parameter
      console.log('Original redirect URL:', redirectUrl)
      redirectTo = `${baseUrl}&redirect=${encodeURIComponent(redirectUrl)}`
      console.log('Final redirectTo URL:', redirectTo)
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo }
    )
    if (error) {
      console.error('Password recovery error:', error)
      addNotification(i18n.t('auth.passwordRecoveryError'), NotificationType.ERROR)
      return false
    } else {
      showForgotPasswordModal.value = false
      addNotification(i18n.t('auth.passwordRecoverySuccess'), NotificationType.SUCCESS)
      return true
    }
  }
  
  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) {
      console.error('Password update error:', error)
      addNotification(i18n.t('auth.passwordRecoveryError'), NotificationType.ERROR)
      return false
    } else {
      window.history.replaceState({}, document.title, window.location.origin)
      showResetPasswordModal.value = false
      addNotification(i18n.t('auth.passwordUpdateSuccess'), NotificationType.SUCCESS)
      return true
    }
  }

  async function resetPasswordWithToken(newPassword: string, token: string, email?: string) {
    // For Supabase, we need to use verifyOtp with the recovery token to establish a session
    // Then update the password with the established session
    try {
      if (!email) {
        console.error('Email is required for password reset')
        return false
      }

      // First, verify the recovery token to establish a session
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token,
        type: 'recovery',
        email: email
      })
      
      if (verifyError) {
        console.error('Token verification error:', verifyError)
        return false
      }

      // Now update the password with the established session
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (updateError) {
        console.error('Password update error:', updateError)
        return false
      }

      addNotification(i18n.t('auth.passwordUpdateSuccess'), NotificationType.SUCCESS)
      return true
    } catch (error) {
      console.error('Password reset error:', error)
      return false
    }
  }

  return { showAuthModal, showForgotPasswordModal, showResetPasswordModal, authSession, userInfos, isAdmin, initAuth, signIn, signUp, signOut, recoverPassword, updatePassword, resetPasswordWithToken }
})
