type ApiResponse<T> = {
  code?: string
  message?: string
  data?: T
}

type PermissionDictionaryResponse = {
  permissionCode: string
  permissionName: string
  module: string
  description: string
  status: string
}

export type PermissionDictionaryItem = {
  permissionCode: string
  permissionName: string
  module: string
  description: string
  status: string
}

export type PermissionDictionaryQuery = {
  keyword?: string
  module?: string
  status?: string
}

const authorizationHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`
})

const parseApiResponse = async <T>(response: Response): Promise<ApiResponse<T> | null> =>
  (await response.json().catch(() => null)) as ApiResponse<T> | null

const unwrapApiResponse = async <T>(response: Response): Promise<T> => {
  const payload = await parseApiResponse<T>(response)

  if (!response.ok || payload?.code !== 'OK' || payload?.data === undefined) {
    if (payload?.message) {
      throw new Error(payload.message)
    }
    if (response.status === 403 && payload?.code === 'AUTH-4030') {
      throw new Error('当前账号无权限查看权限字典')
    }

    throw new Error('请求失败')
  }

  return payload.data as T
}

const toQueryString = (query: PermissionDictionaryQuery): string => {
  const params = new URLSearchParams()

  if (query.keyword) {
    params.set('keyword', query.keyword)
  }
  if (query.module) {
    params.set('module', query.module)
  }
  if (query.status) {
    params.set('status', query.status)
  }

  return params.toString()
}

export const listPermissionDictionary = async (
  accessToken: string,
  query: PermissionDictionaryQuery = {}
): Promise<PermissionDictionaryItem[]> => {
  const mergedQuery: PermissionDictionaryQuery = {
    status: query.status ?? 'ACTIVE',
    keyword: query.keyword,
    module: query.module
  }
  const response = await fetch(`/api/admin/permissions?${toQueryString(mergedQuery)}`, {
    method: 'GET',
    headers: authorizationHeaders(accessToken)
  })
  const data = await unwrapApiResponse<PermissionDictionaryResponse[]>(response)

  return [...data]
    .map((item) => ({
      permissionCode: item.permissionCode,
      permissionName: item.permissionName,
      module: item.module,
      description: item.description,
      status: item.status
    }))
    .sort((left, right) => {
      const moduleComparison = left.module.localeCompare(right.module)
      if (moduleComparison !== 0) {
        return moduleComparison
      }

      return left.permissionCode.localeCompare(right.permissionCode)
    })
}
