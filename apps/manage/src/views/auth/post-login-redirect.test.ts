import { describe, expect, it } from 'vitest'

import { resolveManagePostLoginTarget } from './post-login-redirect'

describe('resolveManagePostLoginTarget', () => {
  it('prefers explicit redirect query when present', () => {
    expect(
      resolveManagePostLoginTarget({
        redirectPath: '/admin/roles',
        permissionCodes: []
      })
    ).toBe('/admin/roles')
  })

  it('falls back to the first accessible manage menu when redirect is absent', () => {
    expect(
      resolveManagePostLoginTarget({
        permissionCodes: ['manage.scholarship.view', 'role.manage']
      })
    ).toBe('/admin/scholarship')
  })

  it('returns canonical role template route when it is the only accessible menu', () => {
    expect(
      resolveManagePostLoginTarget({
        permissionCodes: ['role.manage']
      })
    ).toBe('/admin/roles')
  })
})
