import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createRole,
  listRoles,
  replaceRolePermissions,
  updateRole
} from './roles'

describe('manage roles api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends listRoles query params to backend and maps response fields', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          code: 'OK',
          data: {
            total: 1,
            records: [
              {
                roleId: 4006,
                roleCode: 'PLATFORM_ADMIN',
                roleName: '平台管理员',
                roleScope: 'ALL',
                status: 'ACTIVE',
                permissionCount: 6,
                createdAt: '2026-05-01T09:25:00'
              }
            ]
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await listRoles('access-token', {
      pageNo: 2,
      pageSize: 5,
      keyword: '平台',
      status: 'ACTIVE'
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/roles?pageNo=2&pageSize=5&keyword=%E5%B9%B3%E5%8F%B0&status=ACTIVE',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer access-token'
        }
      }
    )
    expect(result).toEqual({
      total: 1,
      records: [
        {
          roleId: '4006',
          roleCode: 'PLATFORM_ADMIN',
          roleName: '平台管理员',
          roleScope: 'ALL',
          status: 'ACTIVE',
          permissionCount: 6,
          createdAt: '2026-05-01T09:25:00'
        }
      ]
    })
  })

  it('sends createRole payload to backend', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          code: 'OK',
          data: {
            roleId: 4007,
            roleCode: 'COLLEGE_OPERATOR',
            roleName: '学院操作员',
            roleScope: 'ORG_SUBTREE',
            status: 'ACTIVE'
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    )
    vi.stubGlobal('fetch', fetchMock)

    await createRole('access-token', {
      roleCode: 'COLLEGE_OPERATOR',
      roleName: '学院操作员',
      roleScope: 'ORG_SUBTREE'
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/roles', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roleCode: 'COLLEGE_OPERATOR',
        roleName: '学院操作员',
        roleScope: 'ORG_SUBTREE'
      })
    })
  })

  it('sends updateRole payload with flattened snapshot fields', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ code: 'OK', message: 'success' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      updateRole('access-token', '4006', {
        next: {
          roleName: '平台管理员',
          roleScope: 'ALL',
          status: 'ACTIVE'
        },
        snapshot: {
          roleName: '旧平台管理员',
          roleScope: 'ORG_SUBTREE',
          status: 'DISABLED'
        }
      })
    ).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/roles/4006', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roleName: '平台管理员',
        roleScope: 'ALL',
        status: 'ACTIVE',
        currentRoleName: '旧平台管理员',
        currentRoleScope: 'ORG_SUBTREE',
        currentStatus: 'DISABLED'
      })
    })
  })

  it('sends replaceRolePermissions request with replaceAll and empty permissions', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ code: 'OK', message: 'success' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      replaceRolePermissions('access-token', '4006', {
        permissionCodes: []
      })
    ).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/roles/4006/permissions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permissionCodes: [],
        replaceAll: true
      })
    })
  })

  it('maps duplicate roleCode conflict to a stable createRole message', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ code: 'BIZ-4090' }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      createRole('access-token', {
        roleCode: 'COLLEGE_OPERATOR',
        roleName: '学院操作员',
        roleScope: 'ORG_SUBTREE'
      })
    ).rejects.toThrow('角色编码已存在，请更换后重试')
  })

  it('maps snapshot conflict to a stable updateRole message when backend omits message', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ code: 'BIZ-4090' }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      updateRole('access-token', '4006', {
        next: {
          roleName: '平台管理员',
          roleScope: 'ALL',
          status: 'ACTIVE'
        },
        snapshot: {
          roleName: '旧平台管理员',
          roleScope: 'ORG_SUBTREE',
          status: 'DISABLED'
        }
      })
    ).rejects.toThrow('角色模板已被他人更新，请刷新后重试')
  })

  it('maps permission binding forbidden response to a stable message', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ code: 'AUTH-4030' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      replaceRolePermissions('access-token', '4006', {
        permissionCodes: ['user.manage']
      })
    ).rejects.toThrow('当前账号无权限绑定角色权限')
  })
})
