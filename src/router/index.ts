import { pinia } from '@/main'
import { authRoutes } from '@/router/auth'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAuthenticationStore } from '@/stores/authStore'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
    component: () => import('@/views/_layout/AppBaseLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/homepage/HomeView.vue'),

          beforeEnter: () => {
            const applicationStore = useApplicationStore(pinia)
            applicationStore.isLoading = true
          }
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
          beforeEnter: () => {
            const applicationStore = useApplicationStore(pinia)
            applicationStore.isLoading = true
          }
        },
        {
          path: 'projectsMap',
          name: 'projectsMap',
          component: () => import('@/views/projects/ProjectsView.vue'),
          beforeEnter: () => {
            const applicationStore = useApplicationStore(pinia)
            applicationStore.isLoading = true
          }
        },
        {
          path: 'associations',
          name: 'associations',
          component: () => import('../views/associations/AssociationsListView.vue'),
          beforeEnter: () => {
            const applicationStore = useApplicationStore(pinia)
            applicationStore.isLoading = true
          }
        },
        {
          path: 'associations/:id',
          name: 'association',
          component: () => import('../views/associations/AssociationView.vue'),
          beforeEnter: () => {
            const applicationStore = useApplicationStore(pinia)
            applicationStore.isLoading = true
          }
        },
        {
          path: 'associations/:id/assessments',
          component: () => import('../views/assessments/AssessmentsLayout.vue'),
          meta: { requiresAuth: true },
          beforeEnter: async () => {
            const authStore = useAuthenticationStore(pinia)
            if (!authStore.authSession) {
              await authStore.initAuth()
            }
            if (!authStore.authSession) {
              router.push({ name: 'home' })
            }
          },
          children: [
            {
              path: '',
              name: 'assessments',
              component: () => import('../views/assessments/AssessmentsView.vue'),
              beforeEnter: () => {
                const applicationStore = useApplicationStore(pinia)
                applicationStore.isLoading = true
              },
            },
            {
              path: ':assessmentId/edit',
              name: 'assessments-edit',
              component: () => import('../views/assessments/AssessmentsFormView.vue'),
              beforeEnter: () => {
                const applicationStore = useApplicationStore(pinia)
                applicationStore.isLoading = true
              },
            },
            {
              path: ':assessmentId/report',
              name: 'assessments-report',
              component: () => import('../views/assessments/AssessmentsReportView.vue'),
              beforeEnter: () => {
                const applicationStore = useApplicationStore(pinia)
                applicationStore.isLoading = true
              },
            },
          ],
        },
        {
          path: 'admin',
          name: 'admin',
          component: () => import('../views/admin/AdminView.vue'),
          beforeEnter: async () => {
            const applicationStore = useApplicationStore(pinia)
            applicationStore.isLoading = true
            const authStore = useAuthenticationStore(pinia)
            if (!authStore.authSession) {
              await authStore.initAuth()
            }
            if (!authStore.isAdmin) {
              router.push({ name: 'home' })
            }
          },
          meta: { requiresAuth: true },
        },
      ],
    },
    ...authRoutes,
  ],
})

export default router
