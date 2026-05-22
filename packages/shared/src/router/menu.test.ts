import { describe, expect, it } from 'vitest'

import { manageMenus } from './menu'

describe('manage menus', () => {
  it('uses user.manage for students page permission gating', () => {
    const studentsMenu = manageMenus.find((item) => item.key === 'students')

    expect(studentsMenu?.permissionCode).toBe('user.manage')
  })
})
