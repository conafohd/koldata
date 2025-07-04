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
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/projectsMap/ProjectsMapView.vue'),
    },
    {
      path: '/associations',
      name: 'associations',
      component: () => import('../views/associations/AssociationsListView.vue'),
    },
    {
      path: '/associations/:id',
      name: 'association',
      component: () => import('../views/associations/AssociationView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminView.vue'),
      meta: { requiresAuth: true },
    }
  ],
})

export default router
