import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ProjectsView from '@/views/ProjectsView.vue'
import ProjectDetails from '@/views/ProjectDetails.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/projects',
  },
  {
    path: '/projects',
    name: 'projects',
    component: ProjectsView,
  },
  {
    path: '/projects/:id',
    name: 'project-details',
    component: ProjectDetails,
    props: true,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/projects',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
