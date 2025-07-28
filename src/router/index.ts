import { pinia } from '@/main'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAuthenticationStore } from '@/stores/authStore'
import HomeView from '@/views/homepage/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/projectsMap',
      name: 'projectsMap',
      component: () => import('@/views/projects/ProjectsView.vue'),
      beforeEnter: () => {
        const applicationStore = useApplicationStore(pinia)
        applicationStore.isLoading = true
      }
    },
    {
      path: '/associations',
      name: 'associations',
      component: () => import('../views/associations/AssociationsListView.vue'),
      beforeEnter: () => {
        const applicationStore = useApplicationStore(pinia)
        applicationStore.isLoading = true
      }
    },
    {
      path: '/associations/:id',
      name: 'association',
      component: () => import('../views/associations/AssociationView.vue'),
      beforeEnter: () => {
        const applicationStore = useApplicationStore(pinia)
        applicationStore.isLoading = true
      }
    },
    {
      path: '/admin',
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
    }
  ],
})

export default router
