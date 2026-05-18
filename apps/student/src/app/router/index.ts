import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import { studentRoutes } from './routes'

const safeStudentFallback = { name: 'StudentHome' as const }

const router = createRouter({
  history: createWebHistory(),
  routes: studentRoutes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  authStore.hydrate()

  if (typeof document !== 'undefined') {
    document.title = to.meta.title ? `WHUT Student | ${String(to.meta.title)}` : 'WHUT Student'
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'StudentLogin',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (authStore.isAuthenticated && to.meta.app && to.meta.app !== authStore.appScope) {
    if (authStore.appScope === 'manage' && typeof window !== 'undefined') {
      window.location.assign('/admin/dashboard')
      return false
    }

    return safeStudentFallback
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return safeStudentFallback
  }

  if (
    authStore.isAuthenticated &&
    typeof to.meta.permissionCode === 'string' &&
    !authStore.hasPermission(to.meta.permissionCode)
  ) {
    return { name: 'StudentForbidden' }
  }

  return true
})

export default router
