type ApiResponse<T> = {
  code?: string
  message?: string
  data?: T
}

type PageResult<T> = {
  total: number
  records: T[]
}

type UserListItemResponse = {
  userId: number | string
  userNo: string
  userName: string
  status: ManageUserStatus
  orgUnits?: string[]
  roleCodes?: string[]
  createdAt: string
}

type CreateUserResponse = {
  userId: number | string
  userNo: string
  userName: string
  status: ManageUserStatus
}

type ImportUsersResponse = {
  totalCount: number
  successCount: number
  failedCount: number
  failedRows?: Array<{
    rowNo: number
    userNo?: string
    reason: string
  }>
}

export type ManageUserStatus = 'ACTIVE' | 'DISABLED' | 'LOCKED'

export type ManageUserListQuery = {
  pageNo?: number
  pageSize?: number
  keyword?: string
  status?: ManageUserStatus
  orgUnitId?: number
}

export type ManageUserListItem = {
  userId: string
  userNo: string
  userName: string
  status: ManageUserStatus
  orgUnits: string[]
  roleCodes: string[]
  createdAt: string
}

export type ManageUserPage = {
  total: number
  records: ManageUserListItem[]
}

export type CreateUserPayload = {
  userNo: string
  userName: string
  password: string
  email?: string
  phone?: string
  primaryOrgUnitId?: number
}

export type CreatedUser = {
  userId: string
  userNo: string
  userName: string
  status: ManageUserStatus
}

export type UpdateUserStatusPayload = {
  status: ManageUserStatus
  reason?: string
}

export type ImportUsersPayload = {
  file: File
  importMode?: 'UPSERT' | 'INSERT_ONLY'
}

export type ImportUsersResult = {
  totalCount: number
  successCount: number
  failedCount: number
  failedRows: Array<{
    rowNo: number
    userNo?: string
    reason: string
  }>
}

const jsonHeaders = {
  'Content-Type': 'application/json'
} as const

const authorizationHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`
})

const unwrapApiResponse = async <T>(
  response: Response,
  options: { allowEmptyData?: boolean } = {}
): Promise<T> => {
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null

  if (
    !response.ok ||
    payload?.code !== 'OK' ||
    (!options.allowEmptyData && payload?.data === undefined)
  ) {
    throw new Error(payload?.message ?? '请求失败')
  }

  return payload.data as T
}

const toQueryString = (query: ManageUserListQuery): string => {
  const params = new URLSearchParams()
  params.set('pageNo', String(query.pageNo ?? 1))
  params.set('pageSize', String(query.pageSize ?? 20))

  if (query.keyword) {
    params.set('keyword', query.keyword)
  }
  if (query.status) {
    params.set('status', query.status)
  }
  if (query.orgUnitId !== undefined) {
    params.set('orgUnitId', String(query.orgUnitId))
  }

  return params.toString()
}

export const listUsers = async (
  accessToken: string,
  query: ManageUserListQuery = {}
): Promise<ManageUserPage> => {
  const response = await fetch(`/api/admin/users?${toQueryString(query)}`, {
    method: 'GET',
    headers: authorizationHeaders(accessToken)
  })
  const data = await unwrapApiResponse<PageResult<UserListItemResponse>>(response)

  return {
    total: data.total,
    records: data.records.map((item) => ({
      userId: String(item.userId),
      userNo: item.userNo,
      userName: item.userName,
      status: item.status,
      orgUnits: Array.isArray(item.orgUnits) ? item.orgUnits : [],
      roleCodes: Array.isArray(item.roleCodes) ? item.roleCodes : [],
      createdAt: item.createdAt
    }))
  }
}

export const createUser = async (
  accessToken: string,
  payload: CreateUserPayload
): Promise<CreatedUser> => {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      ...authorizationHeaders(accessToken),
      ...jsonHeaders
    },
    body: JSON.stringify(payload)
  })
  const data = await unwrapApiResponse<CreateUserResponse>(response)

  return {
    userId: String(data.userId),
    userNo: data.userNo,
    userName: data.userName,
    status: data.status
  }
}

export const updateUserStatus = async (
  accessToken: string,
  userId: string,
  payload: UpdateUserStatusPayload
): Promise<void> => {
  const response = await fetch(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      ...authorizationHeaders(accessToken),
      ...jsonHeaders
    },
    body: JSON.stringify(payload)
  })

  await unwrapApiResponse(response, { allowEmptyData: true })
}

export const importUsers = async (
  accessToken: string,
  payload: ImportUsersPayload
): Promise<ImportUsersResult> => {
  const formData = new FormData()
  formData.set('file', payload.file)
  formData.set('importMode', payload.importMode ?? 'UPSERT')

  const response = await fetch('/api/admin/users/import', {
    method: 'POST',
    headers: authorizationHeaders(accessToken),
    body: formData
  })
  const data = await unwrapApiResponse<ImportUsersResponse>(response)

  return {
    totalCount: data.totalCount,
    successCount: data.successCount,
    failedCount: data.failedCount,
    failedRows: Array.isArray(data.failedRows) ? data.failedRows : []
  }
}
