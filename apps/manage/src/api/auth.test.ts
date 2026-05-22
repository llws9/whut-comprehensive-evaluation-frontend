import { afterEach, describe, expect, it, vi } from 'vitest'

import { logout } from './auth'

describe('manage auth api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('accepts logout responses that succeed without data payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ code: 'OK', message: 'success' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }))
    )

    await expect(logout('access-token')).resolves.toBeUndefined()
  })
})
