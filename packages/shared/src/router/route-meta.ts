export type AppRouteMeta = {
  app: 'manage' | 'student'
  layout: 'auth' | 'admin' | 'student' | 'blank'
  title: string
  requiresAuth: boolean
  guestOnly?: boolean
  permissionCode?: string
  menuKey?: string
  breadcrumb?: string[]
  keepAlive?: boolean
}
