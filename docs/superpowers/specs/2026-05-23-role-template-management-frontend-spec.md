# 角色模板管理前端接入 Spec

## 1. 目标

本 Spec 定义 `whut-comprehensive-evaluation-frontend` 管理端“角色模板管理”页面的真实前端接入方案，目标是在现有 `apps/manage` 架构下，以最小但正确的方式完成以下闭环：

- 角色模板列表查询，对接 `A-9 GET /api/admin/roles`
- 角色模板创建，对接 `A-10 POST /api/admin/roles`
- 角色模板基础信息修改，对接 `A-11 PATCH /api/admin/roles/{roleId}`
- 角色权限整集合绑定，对接 `A-12 POST /api/admin/roles/{roleId}/permissions`
- 权限字典加载，对接 `A-20 GET /api/admin/permissions`
- 页面准入和按钮动作按 `role.manage` / `permission.manage` 拆分

本轮只做角色模板管理前端接入，不把角色分配、范围规则编辑器、组织树挂载一起塞进同一页面。

## 2. 问题本质

当前 `apps/manage/src/views/permissions/PermissionsView.vue` 的问题不是“页面缺几个 API 调用”，而是页面语义和真实业务边界都错了：

- 当前页面把“角色模板基础信息”与“权限绑定”混成一个本地 mock 表单。
- 当前页面仍使用旧字段 `description`、本地假权限数组、本地假范围枚举，与 `A-9 ~ A-12` 已冻结契约不一致。
- 当前菜单与路由元信息仍以“权限管理”命名，页面准入权限仍是错误的 `manage.permissions.view`。
- 后端契约已经明确：角色模板页面准入依赖 `role.manage`，权限绑定动作依赖 `permission.manage`，且权限字典唯一数据源是 `A-20`。

所以，本次前端接入的根因修复不是“把 mock 改成 fetch”，而是把页面还原成两个明确子能力：

1. 角色模板管理：列表、创建、修改状态/名称/范围
2. 角色权限绑定：基于权限字典做整集合替换

## 3. 事实来源

本 Spec 只认以下事实源：

- 后端交付文档：`whutXX/rewrite/whut-comprehensive-evaluation/docs/team-delivery/group-a-identity-user-admin.md`
- 契约收敛 Spec：`whutXX/rewrite/whut-comprehensive-evaluation/.trae/specs/stabilize-a9-a12-role-template-contract/spec.md`
- 管理端现有接入范式：
  - `apps/manage/src/api/users.ts`
  - `apps/manage/src/views/students/students-page-state.ts`
  - `apps/manage/src/stores/auth.ts`
  - `packages/shared/src/router/menu.ts`

若后端 HTTP 入口的最终 DTO 字段名与交付文档有细微差异，前端只允许在 API 封装层吸收差异，不允许把未冻结字段名扩散到页面状态模块和 Vue 组件。

## 4. 非目标

本轮明确不做：

- 角色分配页面 `A-13 ~ A-18`
- 数据范围规则编辑器
- 组织树、组织挂载、assignment 维度可见范围配置
- 全局 HTTP Client 重构
- 通用 UI 组件抽象
- 后端未冻结接口的前置猜测式适配

## 5. MVP 决策

### 5.1 页面语义修正

页面真实语义是“角色模板管理”，不是“权限字典管理”。

因此本轮应同步修正：

- 菜单文案：`权限管理` -> `角色模板`
- 路由主路径：`/admin/permissions` -> `/admin/roles`
- 菜单权限码：`manage.permissions.view` -> `role.manage`
- 路由名：`AdminPermissions` -> `AdminRoleTemplates`

为避免旧链接直接失效，可保留 1 个兼容跳转：

- 旧路径 `/admin/permissions` 301/前端 redirect 到 `/admin/roles`

### 5.2 页面结构拆分

页面按业务边界拆成两个独立保存单元，不允许继续使用“一个弹窗同时提交角色和权限”的旧交互。

- 基础信息区：`roleCode`、`roleName`、`roleScope`、`status`
- 权限绑定区：`permissionCodes`

对应接口边界：

- `A-10/A-11` 只处理基础信息
- `A-12` 只处理权限集合

### 5.3 状态来源原则

- 列表行即编辑快照来源，不新增详情接口依赖
- 更新成功后一律重新拉取列表，不在前端本地推演最终状态
- 权限绑定成功后同步刷新该角色的列表行摘要，保证 `permissionCount` 与服务端一致

### 5.4 权限字典来源原则

权限选择器数据只来自 `A-20`，禁止继续硬编码：

- 权限码
- 权限名称
- 权限分组
- 权限状态

### 5.5 `roleScope` 处理原则

当前后端没有独立的角色范围字典接口，因此前端允许内建一份最小冻结常量作为 UI 选项，但要满足两个约束：

- 常量值只使用当前冻结文档和 seed SQL 已出现值：`SELF`、`ORG_UNIT`、`ORG_SUBTREE`、`ALL`
- 若列表返回未知 `roleScope`，页面必须可展示原值，但禁止进入编辑保存，避免错误覆盖未知枚举

## 6. 目标文件结构

### 6.1 新增文件

- `apps/manage/src/api/roles.ts`
- `apps/manage/src/api/roles.test.ts`
- `apps/manage/src/api/permissions.ts`
- `apps/manage/src/api/permissions.test.ts`
- `apps/manage/src/views/roles/RoleTemplatesView.vue`
- `apps/manage/src/views/roles/role-templates-page-state.ts`
- `apps/manage/src/views/roles/role-templates-page-state.test.ts`

### 6.2 修改文件

- `apps/manage/src/app/router/routes.ts`
- `packages/shared/src/router/menu.ts`
- `apps/manage/README.md`

### 6.3 迁移文件

以下旧页面不应继续演化：

- `apps/manage/src/views/permissions/PermissionsView.vue`

推荐做法：

- 新建 `views/roles` 目录承接真实业务页
- 删除或保留旧文件为简单 redirect/占位说明，但不再往旧文件继续堆逻辑

## 7. 路由与菜单规范

### 7.1 菜单单一事实源

继续沿用 `packages/shared/src/router/menu.ts` 作为菜单与页面权限的唯一事实源。

目标配置：

```ts
{
  key: 'roles',
  label: '角色模板',
  path: '/admin/roles',
  permissionCode: 'role.manage',
  breadcrumb: ['管理端', '角色模板']
}
```

### 7.2 路由记录

在 `apps/manage/src/app/router/routes.ts` 中新增或替换为：

```ts
{
  path: getRelativeRoutePath(getManageMenu('roles').path, '/admin/'),
  name: 'AdminRoleTemplates',
  component: () => import('@/views/roles/RoleTemplatesView.vue'),
  meta: withMeta(buildMenuRouteMeta('manage', 'admin', getManageMenu('roles')))
}
```

兼容跳转：

```ts
{
  path: 'permissions',
  redirect: { name: 'AdminRoleTemplates' }
}
```

### 7.3 权限拆分

- 页面准入：`role.manage`
- 权限绑定动作：`permission.manage`

页面行为要求：

- 没有 `role.manage`：路由直接拦截到 `403`
- 有 `role.manage` 但没有 `permission.manage`：页面可访问，但“编辑权限/保存权限”区域只读或禁用

## 8. API 设计

## 8.1 `roles.ts`

`apps/manage/src/api/roles.ts` 负责 `A-9 ~ A-12` 中与角色模板本身相关的 API。

推荐类型：

```ts
type ApiResponse<T> = {
  code?: string
  message?: string
  data?: T
}

type PageResult<T> = {
  total: number
  records: T[]
}

export type ManageRoleScope = 'SELF' | 'ORG_UNIT' | 'ORG_SUBTREE' | 'ALL'

export type ManageRoleListItem = {
  roleId: string
  roleCode: string
  roleName: string
  roleScope: string
  status: string
  permissionCount: number
  createdAt: string
}
```

这里 `status` 先用 `string` 接收，而不是过早收窄到前端自定义枚举，原因是交付文档没有完全公开角色状态全集。页面层只对 `ACTIVE` 做显式“启用”识别，其余值做保守展示。

### 8.2 `A-9` 列表查询

前端查询参数收敛为：

```ts
export type ManageRoleListQuery = {
  pageNo?: number
  pageSize?: number
  keyword?: string
  status?: string
}
```

查询函数：

```ts
export const listRoles = async (
  accessToken: string,
  query: ManageRoleListQuery = {}
): Promise<{ total: number; records: ManageRoleListItem[] }>
```

要求：

- 默认 `pageNo=1`、`pageSize=20`
- 空字符串参数不下发
- 响应字段统一映射为前端 camelCase
- `permissionCount` 非法时降级为 `0`

### 8.3 `A-10` 创建角色模板

```ts
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
```

要求：

- 创建表单只提交 `roleCode`、`roleName`、`roleScope`
- 不允许在创建请求里偷偷夹带 `permissionCodes`
- 创建成功后关闭创建表单并刷新列表
- 若 `409 BIZ-4090`，页面展示“角色编码重复”

### 8.4 `A-11` 修改角色模板

文档已冻结“基于字段快照做并发保护”，但未冻结最终 request body 字段名。

因此 API 层要做两件事：

1. 页面状态模块只传递“目标值 + 原始快照对象”
2. 由 `roles.ts` 统一组装真实请求体

页面层输入模型：

```ts
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
```

API 层函数：

```ts
export const updateRole = async (
  accessToken: string,
  roleId: string,
  payload: UpdateRolePayload
): Promise<void>
```

强约束：

- 快照字段名只允许在 `roles.ts` 内知道
- Vue 页面和 `page-state` 不能直接写后端请求体字段名
- 收到 `409 BIZ-4090` 时，错误文案明确提示“角色模板已被他人更新，请刷新后重试”

### 8.5 `A-12` 权限整集合替换

```ts
export type ReplaceRolePermissionsPayload = {
  permissionCodes: string[]
}

export const replaceRolePermissions = async (
  accessToken: string,
  roleId: string,
  payload: ReplaceRolePermissionsPayload
): Promise<void>
```

请求体中固定发送：

```json
{
  "permissionCodes": [],
  "replaceAll": true
}
```

要求：

- 空数组是合法值，语义是清空角色模板权限
- 页面不做增量 patch，不比较“新增/删除哪些权限”
- 保存成功后刷新列表，并保留当前编辑角色的选中态

## 8.6 `permissions.ts`

`apps/manage/src/api/permissions.ts` 只负责权限字典 `A-20`。

```ts
export type PermissionDictionaryItem = {
  permissionCode: string
  permissionName: string
  module: string
  description: string
  status: string
}

export type PermissionDictionaryQuery = {
  keyword?: string
  module?: string
  status?: string
}
```

函数：

```ts
export const listPermissionDictionary = async (
  accessToken: string,
  query: PermissionDictionaryQuery = { status: 'ACTIVE' }
): Promise<PermissionDictionaryItem[]>
```

要求：

- 默认只查 `ACTIVE`
- 结果按接口原样接收，不在前端伪造分组
- 若后端未排序，前端按 `module + permissionCode` 做稳定排序展示

## 9. 页面状态设计

页面局部复杂状态继续沿用 `students-page-state.ts` 的模式：把业务流收口到独立 state 模块，而不是塞进 Vue SFC。

目标文件：

- `apps/manage/src/views/roles/role-templates-page-state.ts`

### 9.1 依赖注入

```ts
type RoleTemplatesPageDependencies = {
  listRoles: typeof listRolesApi
  createRole: typeof createRoleApi
  updateRole: typeof updateRoleApi
  replaceRolePermissions: typeof replaceRolePermissionsApi
  listPermissionDictionary: typeof listPermissionDictionaryApi
}
```

目的：

- 让状态模块可单测
- 让 API 契约变化局限在依赖层

### 9.2 核心状态

```ts
const roles = ref<ManageRoleListItem[]>([])
const searchKeyword = ref('')
const selectedStatus = ref('')
const pageNo = ref(1)
const pageSize = 20
const total = ref(0)
const loading = ref(false)
const errorMessage = ref('')

const isCreateFormVisible = ref(false)
const creatingRole = ref(false)

const editingRoleId = ref('')
const savingRoleId = ref('')
const bindingPermissionRoleId = ref('')

const permissionDictionary = ref<PermissionDictionaryItem[]>([])
const permissionDictionaryLoaded = ref(false)
const permissionKeyword = ref('')
const selectedPermissionCodes = ref<string[]>([])
```

### 9.3 表单模型

创建表单：

```ts
const createForm = {
  roleCode: ref(''),
  roleName: ref(''),
  roleScope: ref<ManageRoleScope>('SELF')
}
```

编辑表单：

```ts
const editForm = {
  roleId: ref(''),
  roleCode: ref(''),
  roleName: ref(''),
  roleScope: ref<string>(''),
  status: ref<string>(''),
  snapshot: ref<{ roleName: string; roleScope: string; status: string } | null>(null)
}
```

说明：

- `roleCode` 创建后不允许在编辑态修改，因为 `A-11` 没有开放该能力
- 编辑态必须保存原始快照，用于并发保护

### 9.4 页面动作

必须具备以下方法：

- `loadRoles(accessToken)`
- `searchRoles(accessToken)`
- `goToPreviousPage(accessToken)`
- `goToNextPage(accessToken)`
- `openCreateForm()`
- `closeCreateForm()`
- `submitCreateRole(accessToken)`
- `startEditRole(role)`
- `cancelEditRole()`
- `submitEditRole(accessToken)`
- `ensurePermissionDictionary(accessToken)`
- `openPermissionEditor(accessToken, role)`
- `togglePermission(permissionCode)`
- `submitReplacePermissions(accessToken)`

### 9.5 关键行为规则

- 查询前重置到第一页
- 缺少 token 时清空列表并报错
- 创建/更新/绑定成功后统一重新拉取列表
- 同时只允许一个角色处于编辑态
- 打开权限编辑器时，若未加载权限字典则懒加载一次
- 权限搜索只在本地字典中筛选，不额外请求后端
- 未知 `roleScope` 的角色允许查看，不允许提交编辑

## 10. 页面交互设计

目标文件：

- `apps/manage/src/views/roles/RoleTemplatesView.vue`

本轮不做复杂组件拆分，先用一个真实页面完成闭环，避免过早抽象。

### 10.1 页面布局

页面分为 4 块：

1. 页头与主操作区
2. 查询区
3. 角色模板列表区
4. 创建表单 / 编辑表单 / 权限绑定区

### 10.2 页头

建议文案：

- 标题：`角色模板`
- 副标题：`维护角色模板基础信息，并为角色绑定权限集合。`

主操作：

- `新建角色模板`
- `刷新列表`

### 10.3 查询区

收敛到两个筛选条件：

- `keyword`
- `status`

占位文案：

- `搜索角色编码或角色名称`

不新增：

- 组织树筛选
- 权限数量筛选
- 角色范围筛选

原因：当前合同只需要支撑 `A-9` 最小真实联调，不引入无合同字段。

### 10.4 列表卡片/表格字段

最少展示：

- `roleName`
- `roleCode`
- `roleScope`
- `status`
- `permissionCount`
- `createdAt`

行级动作：

- `编辑基础信息`
- `编辑权限`

可选动作：

- `启用/禁用`

但前提是后端 `A-11` 已验证允许通过 `status` 切换；若联调阶段发现角色状态枚举未完全明确，本动作先隐藏，不阻塞主闭环。

### 10.5 创建区

创建区只展示：

- `roleCode`
- `roleName`
- `roleScope`

创建成功后：

- 关闭创建区
- 清空创建表单
- 刷新列表

创建失败后：

- 保留输入
- 展示接口错误

### 10.6 编辑基础信息区

编辑态只允许修改：

- `roleName`
- `roleScope`
- `status`

只读展示：

- `roleCode`

若 `editForm.roleScope` 不在冻结选项中：

- 显示“当前角色范围不在前端已知枚举中，禁止提交以避免覆盖未知值”
- `保存` 按钮禁用

### 10.7 权限绑定区

权限绑定区行为：

- 首次打开时加载 `A-20`
- 支持按关键字本地过滤
- 每个权限项展示 `permissionName / permissionCode / module`
- 默认勾选当前角色已有权限

权限绑定区权限控制：

- 有 `permission.manage`：可勾选、可保存
- 无 `permission.manage`：只读展示，不允许勾选与保存

### 10.8 权限回填策略

由于 `A-9` 只返回 `permissionCount`，不返回当前角色的 `permissionCodes`，页面要面对一个事实：

- 仅靠 `A-9` 无法精准回填某个角色当前已绑定哪些权限

因此本轮必须做一个显式产品决策。

推荐最短路径：

- 本轮只交付“权限全量重设”交互，不承诺自动回填现有权限
- 打开权限编辑器时默认不预选，并显式提示“当前接口未提供角色已有权限明细，保存将以当前勾选结果整集合覆盖”

如果后端后续补充“角色权限明细查询”接口，再升级为可回填模式。

原因：

- `A-12` 是整集合替换
- 没有已有权限明细就做“伪回填”会直接产生误覆盖风险

这是本 Spec 的关键约束，优先级高于 UI 完整性。

## 11. 错误处理

### 11.1 统一原则

继续复用 `auth.ts` / `users.ts` 的 `unwrapApiResponse()` 模式，错误只上浮为面向用户的 message。

### 11.2 文案规范

- 默认：`请求失败`
- 列表失败：`角色模板列表加载失败`
- 创建失败：`创建角色模板失败`
- 更新失败：`角色模板更新失败`
- 权限绑定失败：`角色权限保存失败`
- 快照冲突：`角色模板已被他人更新，请刷新后重试`
- 编码重复：`角色编码重复，请更换后重试`
- 权限不足：`当前账号无权限执行该操作`

### 11.3 403 处理

- 路由级 `role.manage` 不足：交给 router guard 跳 `403`
- 动作级 `permission.manage` 不足：不发请求，前端直接禁用按钮

## 12. 测试策略

### 12.1 API 层测试

新增：

- `apps/manage/src/api/roles.test.ts`
- `apps/manage/src/api/permissions.test.ts`

至少覆盖：

- `listRoles()` 正确拼接 `pageNo/pageSize/keyword/status`
- `createRole()` 正确映射返回体
- `updateRole()` 在 `allowEmptyData: true` 下处理成功空响应
- `replaceRolePermissions()` 能发送空数组和 `replaceAll=true`
- `listPermissionDictionary()` 默认查询 `status=ACTIVE`

### 12.2 状态模块测试

新增：

- `apps/manage/src/views/roles/role-templates-page-state.test.ts`

至少覆盖：

- 默认分页加载
- 查询时重置第一页
- 创建成功后关闭表单并刷新
- 更新成功后刷新列表
- `409` 快照冲突时展示错误且不覆盖本地快照
- 首次打开权限编辑器时懒加载权限字典
- 没有 `permission.manage` 时禁止提交权限保存
- 空权限数组提交合法
- 未知 `roleScope` 禁止保存

### 12.3 验证命令

在仓库根目录执行：

```bash
corepack pnpm --filter @whut/manage test -- --run
corepack pnpm --filter @whut/manage typecheck
corepack pnpm --filter @whut/manage build
```

## 13. 实施顺序

推荐顺序：

1. 修正菜单与路由语义
2. 新增 `roles.ts` / `permissions.ts`
3. 写 `role-templates-page-state.test.ts`
4. 实现 `role-templates-page-state.ts`
5. 落 `RoleTemplatesView.vue`
6. 删除或淘汰旧 `PermissionsView.vue`
7. 跑 `test + typecheck + build`

## 14. 验收标准

满足以下条件才算接入完成：

- 访问 `/admin/roles` 需要 `role.manage`
- 页面不再依赖任何本地 mock 角色、mock 权限、mock 范围规则
- 创建角色模板只调用 `A-10`
- 修改基础信息只调用 `A-11`
- 权限绑定只调用 `A-12`
- 权限字典只来自 `A-20`
- 页面能正确处理 `409 BIZ-4090` 快照冲突
- 没有 `permission.manage` 的用户可进入页面，但无法保存权限绑定
- 单测、类型检查、生产构建通过

## 15. 风险与决策记录

### 15.1 当前最大风险

当前合同没有提供“查询单个角色已绑定权限明细”的接口，因此 `A-12` 的前端体验只能在两者间二选一：

- 要么做一个安全但不回填的“全量重设”
- 要么伪造回填，承担误清空权限的风险

本 Spec 明确选择前者。

### 15.2 为什么不继续沿用旧页面

因为旧页面同时违反了 4 个核心事实：

- 错字段
- 错权限
- 错数据源
- 错业务边界

继续在旧页面上修修补补，只会把错误模型保留下来。

### 15.3 为什么不把权限绑定并进创建接口

因为后端接口本身就是拆开的：

- `A-10` 创建角色模板
- `A-12` 绑定权限

前端若强行合并，只会制造半成功半失败的组合异常状态。

## 16. 结论

“角色模板管理前端接入”的正确最小实现，不是把 `PermissionsView.vue` 从 mock 改成真接口，而是：

- 把页面语义修正为“角色模板”
- 把路由准入权限修正为 `role.manage`
- 把权限绑定动作权限单独收口到 `permission.manage`
- 把基础信息编辑和权限绑定拆成两个保存单元
- 把所有真实交互收口到 `roles.ts + permissions.ts + role-templates-page-state.ts`

只有这样，后续角色分配和 scope rule 页面才能建立在稳定的角色模板前端模型之上。
