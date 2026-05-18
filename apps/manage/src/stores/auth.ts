import { isUserSession, manageMenus, type UserSession } from '@whut/shared'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'whut.manage.session'

const managePermissionCodes = manageMenus
  .map((item) => item.permissionCode)
  .filter((permissionCode): permissionCode is string => Boolean(permissionCode))

const readStoredSession = (): UserSession | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.localStorage.getItem(STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const parsedSession: unknown = JSON.parse(rawSession)

    if (!isUserSession(parsedSession) || parsedSession.appScope !== 'manage') {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return parsedSession
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

const persistSession = (session: UserSession | null) => {
  if (typeof window === 'undefined') {
    return
  }

  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}

const createMockManageSession = (): UserSession => ({
  userId: 'mock-admin-001',
  userName: '综合测评管理员',
  appScope: 'manage',
  roles: ['admin'],
  permissionCodes: [...managePermissionCodes],
  accessToken: 'mock-manage-access-token',
  refreshToken: 'mock-manage-refresh-token'
})

type AuthState = {
  session: UserSession | null
  hydrated: boolean
}

export const useAuthStore = defineStore('manage-auth', {
  state: (): AuthState => ({
    session: null,
    hydrated: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.session?.accessToken),
    appScope: (state) => state.session?.appScope ?? null
  },
  actions: {
    hydrate() {
      if (this.hydrated) {
        return
      }

      this.session = readStoredSession()
      this.hydrated = true
    },
    setSession(session: UserSession | null) {
      this.session = session
      this.hydrated = true
      persistSession(session)
    },
    loginWithMockSession() {
      const session = createMockManageSession()
      this.setSession(session)
      return session
    },
    logout() {
      this.setSession(null)
    },
    clearInvalidSession() {
      this.setSession(null)
    },
    hasPermission(permissionCode?: string) {
      if (!permissionCode) {
        return true
      }

      return this.session?.permissionCodes.includes(permissionCode) ?? false
    }
  }
})
