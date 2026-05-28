# 角色模板管理后端落地前最后一份联调清单

## 1. 目的

这份清单不是新的 Spec，而是“后端一旦落地 `/api/admin/roles*` 后，前后端联调必须逐项核对的最终清单”。

目标只有 3 个：

- 防止前端按文档实现，但后端真实 DTO / 错误语义偏移
- 防止联调时只看页面表象，不看请求体、错误码、权限边界
- 把角色模板这 3 条真实链路一次收口：创建、编辑、权限绑定

适用范围：

- `A-9 GET /api/admin/roles`
- `A-10 POST /api/admin/roles`
- `A-11 PATCH /api/admin/roles/{roleId}`
- `A-12 POST /api/admin/roles/{roleId}/permissions`
- `A-20 GET /api/admin/permissions`

不包含：

- `A-13 ~ A-18` 角色分配
- 组织树 / 范围规则
- 登录态、token 刷新、403 页面壳

---

## 2. 联调前提

### 2.1 后端前提

- [ ] 已真实提供 `GET /api/admin/roles`
- [ ] 已真实提供 `POST /api/admin/roles`
- [ ] 已真实提供 `PATCH /api/admin/roles/{roleId}`
- [ ] 已真实提供 `POST /api/admin/roles/{roleId}/permissions`
- [ ] 已真实提供 `GET /api/admin/permissions`
- [ ] 错误响应遵守统一包裹：`{ code, message, data }`

### 2.2 前端前提

- [ ] 管理端入口页面为 `/admin/roles`
- [ ] 菜单权限码为 `role.manage`
- [ ] 权限绑定动作权限为 `permission.manage`
- [ ] 页面不再依赖任何本地 mock 角色、mock 权限、mock 范围枚举以外的伪数据

### 2.3 当前前端真实文件

- API：
  - `apps/manage/src/api/roles.ts`
  - `apps/manage/src/api/permissions.ts`
- 页面状态：
  - `apps/manage/src/views/roles/role-templates-page-state.ts`
- 页面：
  - `apps/manage/src/views/roles/RoleTemplatesView.vue`

---

## 3. 当前前端已冻结行为

### 3.1 页面权限

- 页面准入：`role.manage`
- 权限绑定动作：`permission.manage`
- 若缺少 `role.manage`：预期直接被路由守卫拦到 `403`
- 若缺少 `permission.manage`：页面可进，但不能请求 A-20，也不能保存 A-12

### 3.2 页面交互

- 创建角色模板和编辑基础信息是两条独立保存链路
- 权限绑定是第三条独立保存链路
- 编辑区与权限绑定区互斥，只允许一个工作区处于激活状态
- 权限绑定当前是“全量覆盖模式”，不是增量 patch
- 当前不会回填角色已有权限明细，因为合同未提供“查询单角色权限明细”接口

### 3.3 当前前端错误处理

前端已内建以下稳定错误映射，即使后端不返回友好 `message` 也会给出固定提示：

| 场景 | HTTP / code | 前端提示 |
|---|---|---|
| 角色编码重复 | `409 / BIZ-4090` | `角色编码已存在，请更换后重试` |
| 角色模板快照冲突 | `409 / BIZ-4090` | `角色模板已被他人更新，请刷新后重试` |
| 无权限绑定角色权限 | `403 / AUTH-4030` | `当前账号无权限绑定角色权限` |
| 无权限查看权限字典 | `403 / AUTH-4030` | `当前账号无权限查看权限字典` |
| 角色模板不存在 | `404 / RES-4040` | `角色模板不存在，请刷新列表后重试` |
| 权限集合非法 | `400 / VAL-4001` | `权限集合不合法，请检查后重试` |

联调时要确认后端的真实 `message` 是否与这些提示一致；若一致，前端会优先显示后端 `message`。

---

## 4. 接口逐项联调清单

## 4.1 A-9 `GET /api/admin/roles`

### 当前前端请求行为

- 请求头：
  - `Authorization: Bearer <accessToken>`
- 查询参数：
  - 默认 `pageNo=1`
  - 默认 `pageSize=20`
  - `keyword` 空字符串不下发
  - `status` 空字符串不下发

### 当前前端期望响应

```json
{
  "code": "OK",
  "data": {
    "total": 1,
    "records": [
      {
        "roleId": 4006,
        "roleCode": "PLATFORM_ADMIN",
        "roleName": "平台管理员",
        "roleScope": "ALL",
        "status": "ACTIVE",
        "permissionCount": 6,
        "createdAt": "2026-05-01T09:25:00"
      }
    ]
  }
}
```

### 必验项

- [ ] `roleId` 可为 number 或 string，前端都能接
- [ ] `permissionCount` 缺失时前端是否按 `0` 兜底
- [ ] `roleScope` 返回未知值时页面是否只展示、不允许保存
- [ ] `status` 若不是 `ACTIVE/DISABLED`，页面是否仍能保守展示原值
- [ ] `403 AUTH-4030` 是否稳定出现于无 `role.manage` 场景
- [ ] `400 VAL-4001` 是否稳定出现于非法查询条件场景

### 浏览器联调动作

- [ ] 打开 `/admin/roles`
- [ ] 看首屏请求是否为 `GET /api/admin/roles?pageNo=1&pageSize=20`
- [ ] 输入关键字再查询，确认 `keyword` 被下发
- [ ] 切换状态再查询，确认 `status` 被下发
- [ ] 清空关键字/状态后重查，确认空值不再下发

---

## 4.2 A-10 `POST /api/admin/roles`

### 当前前端发送体

```json
{
  "roleCode": "COLLEGE_OPERATOR",
  "roleName": "学院操作员",
  "roleScope": "ORG_SUBTREE"
}
```

### 强约束

- [ ] 前端不会发送 `permissionCodes`
- [ ] 前端不会发送 `status`
- [ ] 前端不会发送任何快照字段

### 当前前端期望成功响应

```json
{
  "code": "OK",
  "data": {
    "roleId": 4007,
    "roleCode": "COLLEGE_OPERATOR",
    "roleName": "学院操作员",
    "roleScope": "ORG_SUBTREE",
    "status": "ACTIVE"
  }
}
```

### 必验项

- [ ] 创建成功后前端是否关闭创建面板
- [ ] 创建成功后前端是否重新拉一次 A-9
- [ ] `409 BIZ-4090` 是否稳定表示 `roleCode` 重复
- [ ] `400 VAL-4001` 是否覆盖非法 `roleScope`
- [ ] `403 AUTH-4030` 是否覆盖无权限创建

### 浏览器联调动作

- [ ] 创建一个新 `roleCode`，确认成功后列表出现新角色
- [ ] 重复提交同一 `roleCode`，确认页面提示“角色编码已存在，请更换后重试”
- [ ] 提交非法 `roleScope`，确认页面提示字段非法

---

## 4.3 A-11 `PATCH /api/admin/roles/{roleId}`

### 当前前端发送体

当前页面状态层只维护：

```ts
{
  next: {
    roleName,
    roleScope,
    status
  },
  snapshot: {
    roleName,
    roleScope,
    status
  }
}
```

当前真正发给后端的请求体由 `roles.ts` 组装为：

```json
{
  "roleName": "平台管理员",
  "roleScope": "ALL",
  "status": "ACTIVE",
  "currentRoleName": "旧平台管理员",
  "currentRoleScope": "ORG_SUBTREE",
  "currentStatus": "DISABLED"
}
```

### 本接口是本轮联调最高优先级风险点

原因：

- 合同冻结了“必须携带快照”
- 但没有冻结最终 HTTP body 字段名
- 当前前端假设字段名是：
  - `currentRoleName`
  - `currentRoleScope`
  - `currentStatus`

### 必须逐项确认

- [ ] 后端是否接受 `currentRoleName/currentRoleScope/currentStatus`
- [ ] 若字段名不同，是否只需改 `apps/manage/src/api/roles.ts`
- [ ] 成功响应是否确实为 `data = null`
- [ ] `409 BIZ-4090` 是否确实用于快照冲突
- [ ] `404 RES-4040` 是否确实用于 `roleId` 无效
- [ ] `400 VAL-4001` 是否覆盖 `roleName/roleScope/status` 非法

### 浏览器联调动作

- [ ] 修改 `roleName` 成功一次，确认页面刷新列表
- [ ] 修改 `status` 成功一次，确认页面刷新列表
- [ ] 用两个浏览器标签页同时编辑同一角色：
  - 标签页 A 先保存
  - 标签页 B 再保存
  - [ ] 确认标签页 B 得到 `409 BIZ-4090`
  - [ ] 确认页面提示“角色模板已被他人更新，请刷新后重试”

---

## 4.4 A-12 `POST /api/admin/roles/{roleId}/permissions`

### 当前前端发送体

```json
{
  "permissionCodes": ["user.manage", "permission.manage"],
  "replaceAll": true
}
```

### 当前前端固定行为

- 永远按整集合替换，不做增量 patch
- 允许发送空数组，语义是清空该角色权限
- 没有 `permission.manage` 时：
  - 不发送 A-12
  - 不发送 A-20
  - 页面进入“权限受限”状态

### 必须逐项确认

- [ ] 后端是否接受 `replaceAll=true`
- [ ] 后端是否允许 `permissionCodes=[]`
- [ ] `404 RES-4040` 是否同时覆盖“角色不存在 / 权限码不存在”
- [ ] `400 VAL-4001` 是否覆盖空值、非法权限码、缺字段
- [ ] `403 AUTH-4030` 是否稳定用于无权限绑定

### 浏览器联调动作

- [ ] 用具备 `permission.manage` 的账号打开权限绑定区，确认会请求 A-20
- [ ] 选中若干权限后保存，确认 A-12 发送的就是完整勾选集合
- [ ] 全部取消勾选后保存，确认发送 `permissionCodes: []`
- [ ] 保存成功后确认列表刷新，`permissionCount` 跟随后端变化

### 只读权限联调动作

- [ ] 用仅有 `role.manage`、没有 `permission.manage` 的账号访问页面
- [ ] 确认列表按钮显示 `权限受限`
- [ ] 打开权限绑定区后确认：
  - 不请求 A-20
  - 保存按钮不可用
  - 文案明确提示“无法查看权限字典，也不能保存权限绑定结果”

---

## 4.5 A-20 `GET /api/admin/permissions`

### 当前前端请求行为

- 默认请求：`GET /api/admin/permissions?status=ACTIVE`
- 请求头：`Authorization: Bearer <accessToken>`
- 前端按 `module + permissionCode` 做稳定排序

### 当前前端期望字段

```json
{
  "permissionCode": "permission.manage",
  "permissionName": "权限管理",
  "module": "iam",
  "description": "权限管理",
  "status": "ACTIVE"
}
```

### 必须逐项确认

- [ ] A-20 的鉴权是否确实是 `permission.manage`
- [ ] 无 `permission.manage` 时是否返回 `403 AUTH-4030`
- [ ] `description` 是否稳定返回；若后端不再返回，前端是否需要兜底
- [ ] 排序是否可不依赖后端

### 浏览器联调动作

- [ ] 打开权限绑定区，确认首次只拉一次 A-20
- [ ] 关闭后再次打开，确认前端复用缓存，不重复请求
- [ ] 输入关键字过滤，确认只做本地过滤，不发新请求

---

## 5. 三条主链路最终验收

## 5.1 创建链路

- [ ] 进入 `/admin/roles`
- [ ] 点击 `新建角色模板`
- [ ] 填写 `roleCode/roleName/roleScope`
- [ ] 成功调用 A-10
- [ ] 创建面板关闭
- [ ] 列表刷新
- [ ] 新角色可见

## 5.2 编辑链路

- [ ] 点击 `编辑基础信息`
- [ ] 固定头部显示当前角色
- [ ] `roleCode` 只读
- [ ] 修改 `roleName/roleScope/status`
- [ ] 成功调用 A-11
- [ ] 列表刷新
- [ ] 快照冲突时给出明确提示

## 5.3 权限绑定链路

- [ ] 点击 `编辑权限`
- [ ] 固定头部显示当前角色
- [ ] 显示“当前为全量覆盖模式”
- [ ] A-20 首次按需加载
- [ ] 保存调用 A-12
- [ ] 成功后刷新列表
- [ ] 空数组清空权限合法

---

## 6. 后端落地后必须优先回答的 5 个问题

这 5 个问题若不先确认，联调会反复卡在表象层。

### Q1. `PATCH /api/admin/roles/{roleId}` 的快照字段名到底是什么？

前端当前假设：

- `currentRoleName`
- `currentRoleScope`
- `currentStatus`

若后端不是这组字段名，优先只改 `apps/manage/src/api/roles.ts`，不要把字段差异扩散到 Vue 页面和状态模块。

### Q2. `409 BIZ-4090` 在 A-10 和 A-11 中是否都使用？

前端当前假设：

- A-10：表示 `roleCode` 重复
- A-11：表示快照冲突

若后端把两个语义拆成不同 code，前端要补更细映射。

### Q3. A-20 是否严格要求 `permission.manage`？

当前前端已按“严格要求”实现：

- 无 `permission.manage` 时不再请求 A-20

若后端未来放宽为“可查看但不可修改”，前端需要重新设计只读模式，但那是新合同，不属于本轮联调。

### Q4. A-12 对空数组是否真的按“清空权限集合”处理？

当前前端已固定允许空数组。

若后端把空数组视为非法，前后合同冲突，必须以交付文档为准推动后端修，而不是让前端偷偷屏蔽空数组。

### Q5. `description` 是否稳定保留在 A-20 响应里？

当前前端只展示它，不依赖它做业务逻辑。

若后端删除该字段，前端可快速降级，但需要确认这是否属于合同变更。

---

## 7. 真联调时建议的最短执行顺序

1. 先验证 A-9 和页面准入：
   - 页面能不能进
   - 列表能不能拉
2. 再验证 A-10：
   - 创建成功
   - 重复编码 `409`
3. 再验证 A-11：
   - 成功更新
   - 双标签页冲突 `409`
4. 再验证 A-20：
   - 有 `permission.manage` 时可拉
   - 无 `permission.manage` 时 `403`
5. 最后验证 A-12：
   - 正常绑定
   - 空数组清空
   - 非法权限码 / 无权限 / 角色不存在

不要反过来从 A-12 开始。因为 A-12 依赖 A-20、按钮权限、页面状态三层前提，最容易把问题看花。

---

## 8. 联调结论模板

后端落地后，建议按下面模板直接记录结果：

```md
## 角色模板联调结论

- A-9：通过 / 不通过
- A-10：通过 / 不通过
- A-11：通过 / 不通过
- A-12：通过 / 不通过
- A-20：通过 / 不通过

### 阻塞项
- [阻塞项 1]
- [阻塞项 2]

### 需改前端
- [前端改动点]

### 需改后端
- [后端改动点]
```

---

## 9. 当前结论

在后端真实 `/api/admin/roles*` 尚未落地前，当前前端已经完成以下“联调前收口”：

- 路由、菜单、页面语义已从“权限管理”纠正为“角色模板管理”
- 角色创建、编辑、权限绑定 3 条链路已拆开
- 无 `permission.manage` 时不再误拉权限字典
- 核心错误码已补稳定映射
- 角色上下文、退出语义、全量覆盖提示已收口

剩余最大不确定性只剩：

- A-11 的真实快照字段名
- 后端真实错误响应是否与冻结文档完全一致

这两项，就是后端上线后的第一优先级联调检查点。
