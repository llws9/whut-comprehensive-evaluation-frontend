import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

import { manageRoutes } from './routes'

const safeManageFallback = { name: 'AdminDashboard' as const }

const router = createRouter({
  history: createWebHistory(),
  routes: manageRoutes
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  authStore.hydrate()

  if (typeof document !== 'undefined') {
    document.title = to.meta.title ? `WHUT Manage | ${String(to.meta.title)}` : 'WHUT Manage'
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'AdminLogin',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (authStore.isAuthenticated && to.meta.app && to.meta.app !== authStore.appScope) {
    if (authStore.appScope === 'student' && typeof window !== 'undefined') {
      window.location.assign('/student/home')
      return false
    }

    return safeManageFallback
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return safeManageFallback
  }

  if (
    authStore.isAuthenticated &&
    typeof to.meta.permissionCode === 'string' &&
    !authStore.hasPermission(to.meta.permissionCode)
  ) {
    return { name: 'Forbidden' }
  }

  return true
})

export default router
