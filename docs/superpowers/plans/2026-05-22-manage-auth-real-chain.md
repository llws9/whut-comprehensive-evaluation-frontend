# Manage Auth Real Chain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `apps/manage` 内以最小改动接入真实认证链路，完成 login/current user/logout 闭环，并保持现有页面结构基本不变。

**Architecture:** 新增一个局部 `auth API` 文件承接三条后端接口，不引入全局 HTTP 客户端。`auth store` 继续作为状态中心，但从“本地 mock session”改成“真实 token + 当前用户上下文”，在 `hydrate()` 时从 `localStorage` 恢复并按需调用 `/api/security/me` 校验和补全用户信息。登录页和布局页只替换调用入口，不重构 UI。

**Tech Stack:** Vue 3、Pinia、Vue Router、TypeScript、Vite、`fetch`

---

### Task 1: 补全认证 API 边界

**Files:**
- Create: `apps/manage/src/api/auth.ts`
- Modify: `packages/shared/src/auth/session.ts`

- [ ] **Step 1: 定义最小类型与接口契约**

```ts
export type LoginPayload = {
  credential: string
  password: string
}

export type AuthTokenPair = {
  accessToken: string
  refreshToken?: string
}

export type CurrentUserPayload = {
  userId: string
  userName: string
  roles: string[]
  permissionCodes: string[]
}
```

- [ ] **Step 2: 在 `packages/shared/src/auth/session.ts` 扩展可持久化的 `UserSession`**

```ts
export type UserSession = {
  userId: string
  userName: string
  appScope: AppScope
  roles: string[]
  permissionCodes: string[]
  accessToken: string
  refreshToken?: string
  hydratedFromServer?: boolean
}
```

- [ ] **Step 3: 在 `apps/manage/src/api/auth.ts` 实现 3 个最小请求函数**

```ts
export const login = async (payload: LoginPayload) => { /* POST /api/auth/login */ }
export const getCurrentUser = async (accessToken: string) => { /* GET /api/security/me */ }
export const logout = async (accessToken: string) => { /* POST /api/auth/logout */ }
```

- [ ] **Step 4: 统一处理后端 `ApiResponse` 解包与错误消息**

```ts
const unwrap = async <T>(response: Response): Promise<T> => {
  const payload = (await response.json()) as { code?: string; message?: string; data?: T }
  if (!response.ok || payload.code !== 'OK') {
    throw new Error(payload.message ?? '请求失败')
  }
  return payload.data as T
}
```

- [ ] **Step 5: 类型检查受影响文件**

Run: `pnpm --filter @whut/manage typecheck`
Expected: 通过，或仅剩后续 store/view 尚未接上的类型错误

### Task 2: 将 `auth store` 从 mock 切到真实会话

**Files:**
- Modify: `apps/manage/src/stores/auth.ts`

- [ ] **Step 1: 删除 `loginWithMockSession()` 路径，保留 `localStorage` 持久化**

```ts
actions: {
  async login(credential: string, password: string) { /* 调 login + getCurrentUser */ },
  async hydrate() { /* 读取本地 token 并按需校验 */ },
  async logout() { /* 先调后端再清本地 */ }
}
```

- [ ] **Step 2: 新增“token 登录成功后补齐当前用户上下文”的组装函数**

```ts
const createManageSession = (tokenPair: AuthTokenPair, me: CurrentUserPayload): UserSession => ({
  userId: me.userId,
  userName: me.userName,
  appScope: 'manage',
  roles: me.roles,
  permissionCodes: me.permissionCodes,
  accessToken: tokenPair.accessToken,
  refreshToken: tokenPair.refreshToken,
  hydratedFromServer: true
})
```

- [ ] **Step 3: 在 `hydrate()` 中实现“恢复本地 token -> 校验 `/me` -> 失败即清本地”**

```ts
if (storedSession?.accessToken) {
  try {
    const me = await getCurrentUser(storedSession.accessToken)
    this.setSession(mergeStoredTokenWithCurrentUser(storedSession, me))
  } catch {
    this.clearInvalidSession()
  }
}
```

- [ ] **Step 4: 确保 `logout()` 失败时也会清理本地状态，避免前端假在线**

```ts
try {
  if (this.session?.accessToken) {
    await logout(this.session.accessToken)
  }
} finally {
  this.setSession(null)
}
```

- [ ] **Step 5: 跑一次类型检查**

Run: `pnpm --filter @whut/manage typecheck`
Expected: 通过

### Task 3: 替换登录页与退出入口

**Files:**
- Modify: `apps/manage/src/views/auth/AdminLoginView.vue`
- Modify: `apps/manage/src/layouts/AdminLayout.vue`

- [ ] **Step 1: 登录页改为调用 `authStore.login()`**

```ts
const handleLogin = async () => {
  if (!canSubmit.value || isLoading.value) return
  isLoading.value = true
  try {
    await authStore.login(username.value.trim(), password.value)
    await router.push(redirectPath ?? { name: 'AdminDashboard' })
  } finally {
    isLoading.value = false
  }
}
```

- [ ] **Step 2: 为登录页补一个最小错误展示**

```ts
const errorMessage = ref('')
errorMessage.value = error instanceof Error ? error.message : '登录失败'
```

- [ ] **Step 3: 布局页退出改为等待真实 `logout()` 完成**

```ts
const handleLogout = async () => {
  await authStore.logout()
  await router.push({ name: 'AdminLogin' })
}
```

- [ ] **Step 4: 保持现有页面结构和菜单逻辑不变**

```ts
const visibleMenus = computed(() =>
  manageMenus.filter((item) => authStore.hasPermission(item.permissionCode))
)
```

- [ ] **Step 5: 运行类型检查**

Run: `pnpm --filter @whut/manage typecheck`
Expected: 通过

### Task 4: 让路由在异步 `hydrate()` 下仍然可靠

**Files:**
- Modify: `apps/manage/src/app/router/index.ts`

- [ ] **Step 1: 将守卫改成等待异步 `hydrate()`**

```ts
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.hydrate()
  // existing guards...
})
```

- [ ] **Step 2: 继续使用现有 `isAuthenticated` 和权限守卫，不改变路由结构**

```ts
if (to.meta.requiresAuth && !authStore.isAuthenticated) {
  return { name: 'AdminLogin', query: { redirect: to.fullPath } }
}
```

- [ ] **Step 3: 运行最终验证**

Run: `pnpm --filter @whut/manage build`
Expected: `vue-tsc -b && vite build` 成功

- [ ] **Step 4: 检查编辑文件诊断信息**

Run: 使用编辑器诊断检查 `apps/manage/src/api/auth.ts`、`apps/manage/src/stores/auth.ts`、`apps/manage/src/views/auth/AdminLoginView.vue`、`apps/manage/src/layouts/AdminLayout.vue`、`apps/manage/src/app/router/index.ts`
Expected: 无新增诊断错误
