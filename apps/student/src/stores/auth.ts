import { isUserSession, studentMenus, type UserSession } from '@whut/shared'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'whut.student.session'

const studentPermissionCodes = studentMenus
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

    if (!isUserSession(parsedSession) || parsedSession.appScope !== 'student') {
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

const createMockStudentSession = (): UserSession => ({
  userId: 'mock-student-001',
  userName: '张三',
  appScope: 'student',
  roles: ['student'],
  permissionCodes: [...studentPermissionCodes],
  accessToken: 'mock-student-access-token',
  refreshToken: 'mock-student-refresh-token'
})

type AuthState = {
  session: UserSession | null
  hydrated: boolean
}

export const useAuthStore = defineStore('student-auth', {
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
      const session = createMockStudentSession()
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
