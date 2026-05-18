import { buildMenuRouteMeta, getRelativeRoutePath, studentMenus, type AppRouteMeta, type MenuItem } from '@whut/shared'
import type { RouteRecordRaw } from 'vue-router'

import AuthLayout from '@/layouts/AuthLayout.vue'
import BlankLayout from '@/layouts/BlankLayout.vue'
import StudentLayout from '@/layouts/StudentLayout.vue'

const withMeta = (meta: AppRouteMeta): AppRouteMeta => meta

const studentMenuMap = Object.fromEntries(studentMenus.map((item) => [item.key, item])) as Record<string, MenuItem>

const getStudentMenu = (key: string): MenuItem => {
  const item = studentMenuMap[key]

  if (!item) {
    throw new Error(`Missing student menu config for key: ${key}`)
  }

  return item
}

export const studentRoutes: RouteRecordRaw[] = [
  {
    path: '/student/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'StudentLogin',
        component: () => import('@/views/auth/StudentLoginView.vue'),
        meta: withMeta({
          app: 'student',
          layout: 'auth',
          title: '学生端登录',
          requiresAuth: false,
          guestOnly: true
        })
      }
    ]
  },
  {
    path: '/student',
    component: StudentLayout,
    children: [
      {
        path: '',
        redirect: { name: 'StudentHome' }
      },
      {
        path: getRelativeRoutePath(getStudentMenu('home').path, '/student/'),
        name: 'StudentHome',
        component: () => import('@/views/home/HomeView.vue'),
        meta: withMeta(buildMenuRouteMeta('student', 'student', getStudentMenu('home')))
      },
      {
        path: getRelativeRoutePath(getStudentMenu('application').path, '/student/'),
        name: 'StudentApplication',
        component: () => import('@/views/application/ApplicationView.vue'),
        meta: withMeta(buildMenuRouteMeta('student', 'student', getStudentMenu('application')))
      },
      {
        path: getRelativeRoutePath(getStudentMenu('history').path, '/student/'),
        name: 'StudentHistory',
        component: () => import('@/views/history/HistoryView.vue'),
        meta: withMeta(buildMenuRouteMeta('student', 'student', getStudentMenu('history')))
      },
      {
        path: getRelativeRoutePath(getStudentMenu('grades').path, '/student/'),
        name: 'StudentGrades',
        component: () => import('@/views/grades/GradesView.vue'),
        meta: withMeta(buildMenuRouteMeta('student', 'student', getStudentMenu('grades')))
      },
      {
        path: getRelativeRoutePath(getStudentMenu('attachments').path, '/student/'),
        name: 'StudentAttachments',
        component: () => import('@/views/attachments/AttachmentsView.vue'),
        meta: withMeta(buildMenuRouteMeta('student', 'student', getStudentMenu('attachments')))
      }
    ]
  },
  {
    path: '/',
    redirect: '/student/login'
  },
  {
    path: '/403',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'StudentForbidden',
        component: () => import('@/views/error/ForbiddenView.vue'),
        meta: withMeta({
          app: 'student',
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
        name: 'StudentNotFound',
        component: () => import('@/views/error/NotFoundView.vue'),
        meta: withMeta({
          app: 'student',
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
        name: 'StudentServerError',
        component: () => import('@/views/error/ServerErrorView.vue'),
        meta: withMeta({
          app: 'student',
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
