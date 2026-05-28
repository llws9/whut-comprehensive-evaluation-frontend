import { describe, expect, it } from 'vitest'

import { manageMenus } from './menu'

describe('manage menus', () => {
  it('uses user.manage for students page permission gating', () => {
    const studentsMenu = manageMenus.find((item) => item.key === 'students')

    expect(studentsMenu?.permissionCode).toBe('user.manage')
  })

  it('uses roles menu as the canonical role template entry', () => {
    const rolesMenu = manageMenus.find((item) => item.key === 'roles')
    const legacyPermissionsMenu = manageMenus.find((item) => item.key === 'permissions')

    expect(rolesMenu).toEqual({
      key: 'roles',
      label: '角色模板',
      path: '/admin/roles',
      permissionCode: 'role.manage',
      breadcrumb: ['管理端', '角色模板']
    })
    expect(legacyPermissionsMenu).toBeUndefined()
  })
})
