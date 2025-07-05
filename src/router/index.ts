import { pinia } from '@/main'
import { useApplicationStore } from '@/stores/applicationStore'
import HomeView from '@/views/homepage/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/projectsMap',
      name: 'projectsMap',
      component: () => import('@/views/projectsMap/ProjectsMapView.vue'),
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
      beforeEnter: () => {
        const applicationStore = useApplicationStore(pinia)
        applicationStore.isLoading = true
      },
      meta: { requiresAuth: true },
    }
  ],
})

export default router
