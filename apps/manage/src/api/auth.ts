type ApiResponse<T> = {
  code?: string
  message?: string
  data?: T
}

type LoginResponse = {
  accessToken: string
  refreshToken?: string
}

type CurrentUserResponse = {
  userId: number | string
  userName: string
  roles?: string[]
  authorities?: string[]
}

export type ManageLoginPayload = {
  credential: string
  password: string
}

export type ManageTokenPair = {
  accessToken: string
  refreshToken?: string
}

export type ManageCurrentUser = {
  userId: string
  userName: string
  roles: string[]
  permissionCodes: string[]
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
    (!options.allowEmptyData && payload.data === undefined)
  ) {
    throw new Error(payload?.message ?? '请求失败')
  }

  return payload.data as T
}

export const login = async (payload: ManageLoginPayload): Promise<ManageTokenPair> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  })
  const data = await unwrapApiResponse<LoginResponse>(response)

  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken
  }
}

export const getCurrentUser = async (accessToken: string): Promise<ManageCurrentUser> => {
  const response = await fetch('/api/security/me', {
    method: 'GET',
    headers: authorizationHeaders(accessToken)
  })
  const data = await unwrapApiResponse<CurrentUserResponse>(response)

  return {
    userId: String(data.userId),
    userName: data.userName,
    roles: Array.isArray(data.roles) ? data.roles : [],
    permissionCodes: Array.isArray(data.authorities) ? data.authorities : []
  }
}

export const logout = async (accessToken: string): Promise<void> => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: authorizationHeaders(accessToken)
  })

  await unwrapApiResponse(response, { allowEmptyData: true })
}
