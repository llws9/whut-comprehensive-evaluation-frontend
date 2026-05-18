export type AppScope = 'manage' | 'student'

export type UserSession = {
  userId: string
  userName: string
  appScope: AppScope
  roles: string[]
  permissionCodes: string[]
  accessToken: string
  refreshToken?: string
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const isAppScope = (value: unknown): value is AppScope => value === 'manage' || value === 'student'

export const isUserSession = (value: unknown): value is UserSession => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Record<string, unknown>

  return (
    typeof session.userId === 'string' &&
    session.userId.length > 0 &&
    typeof session.userName === 'string' &&
    session.userName.length > 0 &&
    isAppScope(session.appScope) &&
    isStringArray(session.roles) &&
    isStringArray(session.permissionCodes) &&
    typeof session.accessToken === 'string' &&
    session.accessToken.length > 0 &&
    (session.refreshToken === undefined || typeof session.refreshToken === 'string')
  )
}
