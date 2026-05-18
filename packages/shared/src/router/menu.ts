import type { AppRouteMeta } from './route-meta'

export type MenuItem = {
  key: string
  label: string
  path: string
  permissionCode?: string
  breadcrumb?: string[]
}

export const manageMenus: MenuItem[] = [
  {
    key: 'dashboard',
    label: '工作台',
    path: '/admin/dashboard',
    permissionCode: 'manage.dashboard.view',
    breadcrumb: ['管理端', '工作台']
  },
  {
    key: 'students',
    label: '学生管理',
    path: '/admin/students',
    permissionCode: 'manage.students.view',
    breadcrumb: ['管理端', '学生管理']
  },
  {
    key: 'grades',
    label: '成绩管理',
    path: '/admin/grades',
    permissionCode: 'manage.grades.view',
    breadcrumb: ['管理端', '成绩管理']
  },
  {
    key: 'review',
    label: '成绩审核',
    path: '/admin/review',
    permissionCode: 'manage.review.view',
    breadcrumb: ['管理端', '成绩审核']
  },
  {
    key: 'scholarship',
    label: '奖学金资格',
    path: '/admin/scholarship',
    permissionCode: 'manage.scholarship.view',
    breadcrumb: ['管理端', '奖学金资格']
  },
  {
    key: 'permissions',
    label: '权限管理',
    path: '/admin/permissions',
    permissionCode: 'manage.permissions.view',
    breadcrumb: ['管理端', '权限管理']
  },
  {
    key: 'settings',
    label: '系统设置',
    path: '/admin/settings',
    permissionCode: 'manage.settings.view',
    breadcrumb: ['管理端', '系统设置']
  }
]

export const studentMenus: MenuItem[] = [
  {
    key: 'home',
    label: '首页',
    path: '/student/home',
    permissionCode: 'student.home.view',
    breadcrumb: ['学生端', '首页']
  },
  {
    key: 'application',
    label: '综合测评申请',
    path: '/student/application',
    permissionCode: 'student.application.view',
    breadcrumb: ['学生端', '综合测评申请']
  },
  {
    key: 'history',
    label: '申请记录',
    path: '/student/history',
    permissionCode: 'student.history.view',
    breadcrumb: ['学生端', '申请记录']
  },
  {
    key: 'grades',
    label: '成绩与得分',
    path: '/student/grades',
    permissionCode: 'student.grades.view',
    breadcrumb: ['学生端', '成绩与得分']
  },
  {
    key: 'attachments',
    label: '材料附件',
    path: '/student/attachments',
    permissionCode: 'student.attachments.view',
    breadcrumb: ['学生端', '材料附件']
  }
]

export const buildMenuRouteMeta = (
  app: AppRouteMeta['app'],
  layout: AppRouteMeta['layout'],
  menu: MenuItem
): AppRouteMeta => ({
  app,
  layout,
  title: menu.label,
  requiresAuth: true,
  permissionCode: menu.permissionCode,
  menuKey: menu.key,
  breadcrumb: menu.breadcrumb
})

export const getRelativeRoutePath = (absolutePath: string, prefix: string): string => {
  if (!absolutePath.startsWith(prefix)) {
    throw new Error(`Path "${absolutePath}" does not start with prefix "${prefix}"`)
  }

  const relativePath = absolutePath.slice(prefix.length)
  return relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
}
