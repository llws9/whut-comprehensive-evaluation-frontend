import { isUserSession, type UserSession } from '@whut/shared'
import { defineStore } from 'pinia'

import { getCurrentUser, login as loginApi, logout as logoutApi, type ManageCurrentUser, type ManageTokenPair } from '@/api/auth'

const STORAGE_KEY = 'whut.manage.session'
let hydratePromise: Promise<void> | null = null

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

const createSessionFromServerState = (
  tokenPair: ManageTokenPair,
  currentUser: ManageCurrentUser
): UserSession => ({
  userId: currentUser.userId,
  userName: currentUser.userName,
  appScope: 'manage',
  roles: currentUser.roles,
  permissionCodes: currentUser.permissionCodes,
  accessToken: tokenPair.accessToken,
  refreshToken: tokenPair.refreshToken,
  hydratedFromServer: true
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
    async hydrate() {
      if (this.hydrated) {
        return
      }

      if (hydratePromise) {
        await hydratePromise
        return
      }

      hydratePromise = (async () => {
        const storedSession = readStoredSession()

        if (!storedSession?.accessToken) {
          this.setSession(null)
          return
        }

        try {
          const currentUser = await getCurrentUser(storedSession.accessToken)
          this.setSession(
            createSessionFromServerState(
              {
                accessToken: storedSession.accessToken,
                refreshToken: storedSession.refreshToken
              },
              currentUser
            )
          )
        } catch {
          this.clearInvalidSession()
        }
      })()

      try {
        await hydratePromise
      } finally {
        hydratePromise = null
      }
    },
    setSession(session: UserSession | null) {
      this.session = session
      this.hydrated = true
      persistSession(session)
    },
    async login(credential: string, password: string) {
      const tokenPair = await loginApi({
        credential,
        password
      })
      const currentUser = await getCurrentUser(tokenPair.accessToken)
      const session = createSessionFromServerState(tokenPair, currentUser)

      this.setSession(session)
      return session
    },
    async logout() {
      try {
        if (this.session?.accessToken) {
          await logoutApi(this.session.accessToken)
        }
      } catch {
      } finally {
        this.setSession(null)
      }
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
