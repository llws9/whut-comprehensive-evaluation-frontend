import { buildMenuRouteMeta, getRelativeRoutePath, manageMenus, type AppRouteMeta, type MenuItem } from '@whut/shared'
import type { RouteRecordRaw } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'

const withMeta = (meta: AppRouteMeta): AppRouteMeta => meta

const manageMenuMap = Object.fromEntries(manageMenus.map((item) => [item.key, item])) as Record<string, MenuItem>

const getManageMenu = (key: string): MenuItem => {
  const item = manageMenuMap[key]

  if (!item) {
    throw new Error(`Missing manage menu config for key: ${key}`)
  }

  return item
}

export const manageRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'AdminLogin',
        component: () => import('@/views/auth/AdminLoginView.vue'),
        meta: withMeta({
          app: 'manage',
          layout: 'auth',
          title: '管理端登录',
          requiresAuth: false,
          guestOnly: true
        })
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: { name: 'AdminDashboard' }
      },
      {
        path: getRelativeRoutePath(getManageMenu('dashboard').path, '/admin/'),
        name: 'AdminDashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: withMeta(buildMenuRouteMeta('manage', 'admin', getManageMenu('dashboard')))
      },
      {
        path: getRelativeRoutePath(getManageMenu('students').path, '/admin/'),
        name: 'AdminStudents',
        component: () => import('@/views/students/StudentsView.vue'),
        meta: withMeta(buildMenuRouteMeta('manage', 'admin', getManageMenu('students')))
      },
      {
        path: getRelativeRoutePath(getManageMenu('grades').path, '/admin/'),
        name: 'AdminGrades',
        component: () => import('@/views/grades/GradesView.vue'),
        meta: withMeta(buildMenuRouteMeta('manage', 'admin', getManageMenu('grades')))
      },
      {
        path: getRelativeRoutePath(getManageMenu('review').path, '/admin/'),
        name: 'AdminReview',
        component: () => import('@/views/review/ReviewView.vue'),
        meta: withMeta(buildMenuRouteMeta('manage', 'admin', getManageMenu('review')))
      },
      {
        path: getRelativeRoutePath(getManageMenu('scholarship').path, '/admin/'),
        name: 'AdminScholarship',
        component: () => import('@/views/scholarship/ScholarshipView.vue'),
        meta: withMeta(buildMenuRouteMeta('manage', 'admin', getManageMenu('scholarship')))
      },
      {
        path: getRelativeRoutePath(getManageMenu('permissions').path, '/admin/'),
        name: 'AdminPermissions',
        component: () => import('@/views/permissions/PermissionsView.vue'),
        meta: withMeta(buildMenuRouteMeta('manage', 'admin', getManageMenu('permissions')))
      },
      {
        path: getRelativeRoutePath(getManageMenu('settings').path, '/admin/'),
        name: 'AdminSettings',
        component: () => import('@/views/settings/SettingsView.vue'),
        meta: withMeta(buildMenuRouteMeta('manage', 'admin', getManageMenu('settings')))
      }
    ]
  },
  {
    path: '/',
    redirect: '/admin/login'
  },
  {
    path: '/403',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'Forbidden',
        component: () => import('@/views/error/ForbiddenView.vue'),
        meta: withMeta({
          app: 'manage',
          layout: 'blank',
          title: '无权限访问',
          requiresAuth: false
        })
      }
    ]
  },
  {
    path: '/404',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'NotFound',
        component: () => import('@/views/error/NotFoundView.vue'),
        meta: withMeta({
          app: 'manage',
          layout: 'blank',
          title: '页面不存在',
          requiresAuth: false
        })
      }
    ]
  },
  {
    path: '/500',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'ServerError',
        component: () => import('@/views/error/ServerErrorView.vue'),
        meta: withMeta({
          app: 'manage',
          layout: 'blank',
          title: '服务异常',
          requiresAuth: false
        })
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]
