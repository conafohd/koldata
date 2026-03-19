import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: () => import('@/views/auth/components/AuthRoutesLayout.vue'),
    children: [
      {
        path: '',
        redirect: { name: 'auth-sign-in' },
      },
      {
        path: 'sign-in',
        name: 'auth-sign-in',
        component: () => import('@/views/auth/SignInView.vue'),
      },
      {
        path: 'sign-up',
        name: 'auth-sign-up',
        component: () => import('@/views/auth/SignUpView.vue'),
      },
      {
        path: 'forgot-password',
        name: 'auth-forgot-password',
        component: () => import('@/views/auth/ForgotPasswordView.vue'),
      },
      {
        path: 'check-email',
        name: 'auth-check-email',
        component: () => import('@/views/auth/CheckEmailView.vue'),
      },
      {
        path: 'confirm-account',
        name: 'auth-confirm-account',
        component: () => import('@/views/auth/ConfirmAccountView.vue'),
      },
      {
        path: 'reset-password',
        name: 'auth-reset-password',
        component: () => import('@/views/auth/ResetPasswordView.vue'),
      },
    ],
  },
  {
    path: '/oauth',
    component: () => import('@/views/auth/components/AuthRoutesLayout.vue'),
    children: [
      {
        path: 'consent',
        name: 'oauth-consent',
        component: () => import('@/views/auth/OAuthConsentView.vue'),
      },
    ],
  },
  {
    path: '/login',
    redirect: { name: 'auth-sign-in' },
  },
]
