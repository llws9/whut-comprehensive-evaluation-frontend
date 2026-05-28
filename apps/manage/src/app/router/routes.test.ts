import { describe, expect, it } from 'vitest'

import { manageRoutes } from './routes'

describe('manage routes', () => {
  it('uses admin roles route as the canonical role template entry', () => {
    const adminShellRoute = manageRoutes.find((route) => route.path === '/admin')
    const roleTemplatesRoute = adminShellRoute?.children?.find((child) => child.name === 'AdminRoleTemplates')

    expect(adminShellRoute?.children?.some((child) => child.name === 'AdminPermissions')).toBe(false)
    expect(roleTemplatesRoute).toMatchObject({
      path: 'roles',
      name: 'AdminRoleTemplates',
      meta: {
        title: '角色模板',
        permissionCode: 'role.manage',
        menuKey: 'roles'
      }
    })
    expect(String(roleTemplatesRoute?.component)).toContain('views/roles/RoleTemplatesView.vue')
    expect(String(roleTemplatesRoute?.component)).not.toContain('PermissionsView.vue')
  })

  it('redirects legacy permissions path to admin roles route', () => {
    const adminShellRoute = manageRoutes.find((route) => route.path === '/admin')

    expect(adminShellRoute?.children?.find((child) => child.path === 'permissions')).toMatchObject({
      redirect: { name: 'AdminRoleTemplates' }
    })
  })
})
