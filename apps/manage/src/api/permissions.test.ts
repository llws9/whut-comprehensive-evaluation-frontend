import { afterEach, describe, expect, it, vi } from 'vitest'

import { listPermissionDictionary } from './permissions'

describe('manage permissions api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('queries active permission dictionary by default and returns stable sorted items', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          code: 'OK',
          data: [
            {
              permissionCode: 'user.manage',
              permissionName: '用户管理',
              module: 'manage',
              description: '用户管理',
              status: 'ACTIVE'
            },
            {
              permissionCode: 'permission.manage',
              permissionName: '权限管理',
              module: 'iam',
              description: '权限管理',
              status: 'ACTIVE'
            }
          ]
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

    const result = await listPermissionDictionary('access-token')

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/permissions?status=ACTIVE', {
      method: 'GET',
      headers: {
        Authorization: 'Bearer access-token'
      }
    })
    expect(result).toEqual([
      {
        permissionCode: 'permission.manage',
        permissionName: '权限管理',
        module: 'iam',
        description: '权限管理',
        status: 'ACTIVE'
      },
      {
        permissionCode: 'user.manage',
        permissionName: '用户管理',
        module: 'manage',
        description: '用户管理',
        status: 'ACTIVE'
      }
    ])
  })

  it('maps forbidden permission dictionary request to a stable message', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ code: 'AUTH-4030' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(listPermissionDictionary('access-token')).rejects.toThrow(
      '当前账号无权限查看权限字典'
    )
  })
})
