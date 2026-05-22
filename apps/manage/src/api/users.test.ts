import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createUser,
  importUsers,
  listUsers,
  updateUserStatus
} from './users'

describe('manage users api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends listUsers query params to backend', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          code: 'OK',
          data: {
            total: 1,
            records: [
              {
                userId: 1010,
                userNo: '2024305001',
                userName: '王老师',
                status: 'ACTIVE',
                orgUnits: ['计算机与人工智能学院'],
                roleCodes: ['REVIEWER'],
                createdAt: '2026-05-20T10:00:00'
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

    const result = await listUsers('access-token', {
      pageNo: 2,
      pageSize: 5,
      keyword: '王',
      status: 'ACTIVE',
      orgUnitId: 2002
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/admin/users?pageNo=2&pageSize=5&keyword=%E7%8E%8B&status=ACTIVE&orgUnitId=2002',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer access-token'
        }
      }
    )
    expect(result.total).toBe(1)
    expect(result.records[0]?.userNo).toBe('2024305001')
  })

  it('sends createUser payload to backend', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          code: 'OK',
          data: {
            userId: 1010,
            userNo: '2024305001',
            userName: '王老师',
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

    await createUser('access-token', {
      userNo: '2024305001',
      userName: '王老师',
      password: 'ChangeMe123!',
      email: 'wang@example.com',
      phone: '13800000000',
      primaryOrgUnitId: 2002
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/users', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userNo: '2024305001',
        userName: '王老师',
        password: 'ChangeMe123!',
        email: 'wang@example.com',
        phone: '13800000000',
        primaryOrgUnitId: 2002
      })
    })
  })

  it('sends updateUserStatus request to user-specific status endpoint', async () => {
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
      updateUserStatus('access-token', '1010', {
        status: 'DISABLED',
        reason: 'manual'
      })
    ).resolves.toBeUndefined()

    expect(fetchMock).toHaveBeenCalledWith('/api/admin/users/1010/status', {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer access-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'DISABLED',
        reason: 'manual'
      })
    })
  })

  it('sends importUsers file and importMode via FormData', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          code: 'OK',
          data: {
            totalCount: 3,
            successCount: 2,
            failedCount: 1,
            failedRows: [
              {
                rowNo: 4,
                userNo: '2024305003',
                reason: 'userName 不能为空'
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
    const file = new File(['fake-xlsx'], 'users.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const result = await importUsers('access-token', {
      file,
      importMode: 'INSERT_ONLY'
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const firstCall = fetchMock.mock.calls[0] as unknown

    expect(firstCall).toBeDefined()
    if (!firstCall) {
      throw new Error('fetch should be called once')
    }

    const [url, init] = firstCall as [string, RequestInit]

    expect(url).toBe('/api/admin/users/import')
    expect(init?.method).toBe('POST')
    expect(init?.headers).toEqual({
      Authorization: 'Bearer access-token'
    })
    expect(init?.body).toBeInstanceOf(FormData)
    expect((init?.body as FormData).get('file')).toBe(file)
    expect((init?.body as FormData).get('importMode')).toBe('INSERT_ONLY')
    expect(result.failedRows[0]?.rowNo).toBe(4)
  })
})
