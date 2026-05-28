type ApiResponse<T> = {
  code?: string
  message?: string
  data?: T
}

type PageResult<T> = {
  total: number
  records: T[]
}

type RoleListItemResponse = {
  roleId: number | string
  roleCode: string
  roleName: string
  roleScope: string
  status: string
  permissionCount?: number
  createdAt: string
}

type CreateRoleResponse = {
  roleId: number | string
  roleCode: string
  roleName: string
  roleScope: string
  status: string
}

export type ManageRoleScope = 'SELF' | 'ORG_UNIT' | 'ORG_SUBTREE' | 'ALL'

export type ManageRoleListQuery = {
  pageNo?: number
  pageSize?: number
  keyword?: string
  status?: string
}

export type ManageRoleListItem = {
  roleId: string
  roleCode: string
  roleName: string
  roleScope: string
  status: string
  permissionCount: number
  createdAt: string
}

export type ManageRolePage = {
  total: number
  records: ManageRoleListItem[]
}

export type CreateRolePayload = {
  roleCode: string
  roleName: string
  roleScope: ManageRoleScope
}

export type CreatedRole = {
  roleId: string
  roleCode: string
  roleName: string
  roleScope: string
  status: string
}

export type UpdateRolePayload = {
  next: {
    roleName: string
    roleScope: ManageRoleScope
    status: string
  }
  snapshot: {
    roleName: string
    roleScope: string
    status: string
  }
}

export type ReplaceRolePermissionsPayload = {
  permissionCodes: string[]
}

const jsonHeaders = {
  'Content-Type': 'application/json'
} as const

const authorizationHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`
})

const parseApiResponse = async <T>(response: Response): Promise<ApiResponse<T> | null> =>
  (await response.json().catch(() => null)) as ApiResponse<T> | null

const resolveRoleApiErrorMessage = (
  operation: 'list' | 'create' | 'update' | 'replacePermissions',
  response: Response,
  payload: ApiResponse<unknown> | null
): string => {
  if (payload?.message) {
    return payload.message
  }

  if (operation === 'create') {
    if (response.status === 409 && payload?.code === 'BIZ-4090') {
      return '角色编码已存在，请更换后重试'
    }
    if (response.status === 403 && payload?.code === 'AUTH-4030') {
      return '当前账号无权限创建角色模板'
    }
    if (response.status === 400 && payload?.code === 'VAL-4001') {
      return '角色编码、名称或角色范围不合法，请检查后重试'
    }
  }

  if (operation === 'update') {
    if (response.status === 409 && payload?.code === 'BIZ-4090') {
      return '角色模板已被他人更新，请刷新后重试'
    }
    if (response.status === 404 && payload?.code === 'RES-4040') {
      return '角色模板不存在，请刷新列表后重试'
    }
    if (response.status === 403 && payload?.code === 'AUTH-4030') {
      return '当前账号无权限修改角色模板'
    }
    if (response.status === 400 && payload?.code === 'VAL-4001') {
      return '角色名称、角色范围或状态不合法，请检查后重试'
    }
  }

  if (operation === 'replacePermissions') {
    if (response.status === 403 && payload?.code === 'AUTH-4030') {
      return '当前账号无权限绑定角色权限'
    }
    if (response.status === 404 && payload?.code === 'RES-4040') {
      return '角色模板或权限码不存在，请刷新后重试'
    }
    if (response.status === 400 && payload?.code === 'VAL-4001') {
      return '权限集合不合法，请检查后重试'
    }
  }

  if (operation === 'list') {
    if (response.status === 403 && payload?.code === 'AUTH-4030') {
      return '当前账号无权限查看角色模板列表'
    }
    if (response.status === 400 && payload?.code === 'VAL-4001') {
      return '角色模板查询条件不合法，请调整后重试'
    }
  }

  return '请求失败'
}

const unwrapApiResponse = async <T>(
  response: Response,
  operation: 'list' | 'create' | 'update' | 'replacePermissions',
  options: { allowEmptyData?: boolean } = {}
): Promise<T> => {
  const payload = await parseApiResponse<T>(response)

  if (
    !response.ok ||
    payload?.code !== 'OK' ||
    (!options.allowEmptyData && payload?.data === undefined)
  ) {
    throw new Error(resolveRoleApiErrorMessage(operation, response, payload))
  }

  return payload.data as T
}

const toQueryString = (query: ManageRoleListQuery): string => {
  const params = new URLSearchParams()
  params.set('pageNo', String(query.pageNo ?? 1))
  params.set('pageSize', String(query.pageSize ?? 20))

  if (query.keyword) {
    params.set('keyword', query.keyword)
  }
  if (query.status) {
    params.set('status', query.status)
  }

  return params.toString()
}

export const listRoles = async (
  accessToken: string,
  query: ManageRoleListQuery = {}
): Promise<ManageRolePage> => {
  const response = await fetch(`/api/admin/roles?${toQueryString(query)}`, {
    method: 'GET',
    headers: authorizationHeaders(accessToken)
  })
  const data = await unwrapApiResponse<PageResult<RoleListItemResponse>>(response, 'list')

  return {
    total: data.total,
    records: data.records.map((item) => ({
      roleId: String(item.roleId),
      roleCode: item.roleCode,
      roleName: item.roleName,
      roleScope: item.roleScope,
      status: item.status,
      permissionCount:
        typeof item.permissionCount === 'number' && Number.isFinite(item.permissionCount)
          ? item.permissionCount
          : 0,
      createdAt: item.createdAt
    }))
  }
}

export const createRole = async (
  accessToken: string,
  payload: CreateRolePayload
): Promise<CreatedRole> => {
  const response = await fetch('/api/admin/roles', {
    method: 'POST',
    headers: {
      ...authorizationHeaders(accessToken),
      ...jsonHeaders
    },
    body: JSON.stringify(payload)
  })
  const data = await unwrapApiResponse<CreateRoleResponse>(response, 'create')

  return {
    roleId: String(data.roleId),
    roleCode: data.roleCode,
    roleName: data.roleName,
    roleScope: data.roleScope,
    status: data.status
  }
}

export const updateRole = async (
  accessToken: string,
  roleId: string,
  payload: UpdateRolePayload
): Promise<void> => {
  const response = await fetch(`/api/admin/roles/${roleId}`, {
    method: 'PATCH',
    headers: {
      ...authorizationHeaders(accessToken),
      ...jsonHeaders
    },
    body: JSON.stringify({
      roleName: payload.next.roleName,
      roleScope: payload.next.roleScope,
      status: payload.next.status,
      currentRoleName: payload.snapshot.roleName,
      currentRoleScope: payload.snapshot.roleScope,
      currentStatus: payload.snapshot.status
    })
  })

  await unwrapApiResponse(response, 'update', { allowEmptyData: true })
}

export const replaceRolePermissions = async (
  accessToken: string,
  roleId: string,
  payload: ReplaceRolePermissionsPayload
): Promise<void> => {
  const response = await fetch(`/api/admin/roles/${roleId}/permissions`, {
    method: 'POST',
    headers: {
      ...authorizationHeaders(accessToken),
      ...jsonHeaders
    },
    body: JSON.stringify({
      permissionCodes: payload.permissionCodes,
      replaceAll: true
    })
  })

  await unwrapApiResponse(response, 'replacePermissions', { allowEmptyData: true })
}
