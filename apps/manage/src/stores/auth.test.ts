import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { logoutApiMock } = vi.hoisted(() => ({
  logoutApiMock: vi.fn()
}))

vi.mock('@/api/auth', () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: logoutApiMock
}))

import { useAuthStore } from './auth'

const createLocalStorageMock = () => {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    }
  }
}

describe('manage auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    logoutApiMock.mockReset()
    Object.defineProperty(globalThis, 'window', {
      value: {
        localStorage: createLocalStorageMock()
      },
      configurable: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('clears local session even when backend logout fails', async () => {
    const authStore = useAuthStore()
    logoutApiMock.mockRejectedValueOnce(new Error('network error'))

    authStore.setSession({
      userId: '1',
      userName: '管理员',
      appScope: 'manage',
      roles: ['admin'],
      permissionCodes: ['user.manage'],
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      hydratedFromServer: true
    })

    await expect(authStore.logout()).resolves.toBeUndefined()
    expect(authStore.session).toBeNull()
    expect(window.localStorage.getItem('whut.manage.session')).toBeNull()
  })
})
