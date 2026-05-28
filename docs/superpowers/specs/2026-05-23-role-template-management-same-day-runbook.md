# 角色模板管理联调当天操作版

## 0. 准备

- 打开管理端：`/admin/roles`
- 打开浏览器 DevTools：
  - `Network`
  - `Preserve log`
  - `Disable cache`
- 准备两个账号：
  - 账号 A：有 `role.manage + permission.manage`
  - 账号 B：只有 `role.manage`
- 准备两个浏览器标签页：
  - 标签页 1：正常联调
  - 标签页 2：专门做 A-11 快照冲突

---

## 1. 先跑页面准入和列表

### 1.1 页面准入

操作：

1. 用有 `role.manage` 的账号进入 `/admin/roles`
2. 再用没有 `role.manage` 的账号进入 `/admin/roles`

抓包只看：

- `GET /api/admin/roles`

通过条件：

- 有 `role.manage` 时页面可进入
- 无 `role.manage` 时被拦到 `403`，不进入角色模板页面

### 1.2 首屏列表

操作：

1. 刷新 `/admin/roles`

抓包只看：

- `GET /api/admin/roles?pageNo=1&pageSize=20`

通过条件：

- 首屏自动发 A-9
- 请求里只有 `pageNo=1&pageSize=20`
- 列表能显示 `roleName/roleCode/roleScope/status/permissionCount/createdAt`

### 1.3 列表查询

操作：

1. 输入关键字
2. 选择状态
3. 点 `查询`
4. 清空关键字和状态，再点 `查询`

抓包只看：

- `GET /api/admin/roles`

通过条件：

- 有关键字时才下发 `keyword`
- 有状态时才下发 `status`
- 清空后不再下发空字符串参数

---

## 2. 再跑创建链路 A-10

### 2.1 正常创建

操作：

1. 点击 `新建角色模板`
2. 填：
   - `roleCode = COLLEGE_OPERATOR_<当天时间戳>`
   - `roleName = 学院操作员联调`
   - `roleScope = ORG_SUBTREE`
3. 点击 `确认创建`

抓包顺序：

1. `POST /api/admin/roles`
2. `GET /api/admin/roles?...`

重点看请求体：

```json
{
  "roleCode": "COLLEGE_OPERATOR_xxx",
  "roleName": "学院操作员联调",
  "roleScope": "ORG_SUBTREE"
}
```

通过条件：

- 创建请求不带 `permissionCodes`
- 创建请求不带 `status`
- 创建成功后创建面板关闭
- 随后自动刷新列表
- 新角色出现在列表中

### 2.2 重复编码冲突

操作：

1. 用刚刚创建成功的同一个 `roleCode` 再创建一次

抓包只看：

- `POST /api/admin/roles`

通过条件：

- 后端返回 `409`
- 错误码为 `BIZ-4090` 或 message 语义等价
- 页面提示：`角色编码已存在，请更换后重试`

### 2.3 非法字段

操作：

1. 若后端联调环境允许手工改包，在请求里把 `roleScope` 改成非法值

抓包只看：

- `POST /api/admin/roles`

通过条件：

- 后端返回 `400`
- 页面提示字段非法，而不是只显示 `请求失败`

---

## 3. 再跑编辑链路 A-11

### 3.1 正常编辑

操作：

1. 在任意一行点击 `编辑基础信息`
2. 确认顶部固定头部显示当前角色
3. 修改：
   - `roleName`
   - 或 `status`
4. 点击 `保存基础信息`

抓包顺序：

1. `PATCH /api/admin/roles/{roleId}`
2. `GET /api/admin/roles?...`

重点看请求体：

```json
{
  "roleName": "新名称",
  "roleScope": "ALL",
  "status": "ACTIVE",
  "currentRoleName": "旧名称",
  "currentRoleScope": "ALL",
  "currentStatus": "ACTIVE"
}
```

通过条件：

- 前端确实发送了快照字段
- 成功后自动刷新列表
- 编辑面板关闭

### 3.2 快照字段名核对

操作：

1. 在 `Network` 里直接点开 A-11 请求

必须确认：

- 后端认不认：
  - `currentRoleName`
  - `currentRoleScope`
  - `currentStatus`

结论规则：

- 如果后端 400/500 且怀疑字段名不对，第一优先级怀疑这里
- 这类问题只需要改前端 `apps/manage/src/api/roles.ts`

### 3.3 快照冲突

操作：

1. 标签页 1、标签页 2 同时打开同一个角色的编辑面板
2. 标签页 1 先保存
3. 标签页 2 再保存

抓包只看：

- 第二次 `PATCH /api/admin/roles/{roleId}`

通过条件：

- 标签页 2 返回 `409`
- 错误码为 `BIZ-4090` 或 message 语义等价
- 页面提示：`角色模板已被他人更新，请刷新后重试`

### 3.4 角色不存在

操作：

1. 若联调环境允许改包，把 URL 里的 `roleId` 改成不存在值

抓包只看：

- `PATCH /api/admin/roles/{roleId}`

通过条件：

- 后端返回 `404`
- 页面提示：`角色模板不存在，请刷新列表后重试`

---

## 4. 再跑 A-20 权限字典

### 4.1 有权限账号

操作：

1. 用账号 A 打开任意一行的 `编辑权限`

抓包只看：

- `GET /api/admin/permissions?status=ACTIVE`

通过条件：

- 首次打开权限绑定区时请求 A-20
- 请求只发一次
- 返回字段至少有：
  - `permissionCode`
  - `permissionName`
  - `module`
  - `description`
  - `status`

### 4.2 本地过滤不发请求

操作：

1. 在权限绑定区输入关键字搜索

抓包只看：

- 不应出现新的 `GET /api/admin/permissions`

通过条件：

- 搜索只做本地过滤
- 不新增 A-20 请求

### 4.3 关闭再打开

操作：

1. 点击 `关闭绑定面板`
2. 再次点 `编辑权限`

抓包只看：

- `GET /api/admin/permissions`

通过条件：

- 不重复请求 A-20
- 前端复用已加载的权限字典缓存

---

## 5. 最后跑权限绑定链路 A-12

### 5.1 正常绑定

操作：

1. 用账号 A 打开 `编辑权限`
2. 勾选若干权限
3. 点击 `保存权限集合`

抓包顺序：

1. `POST /api/admin/roles/{roleId}/permissions`
2. `GET /api/admin/roles?...`

重点看请求体：

```json
{
  "permissionCodes": ["user.manage", "permission.manage"],
  "replaceAll": true
}
```

通过条件：

- A-12 确实发送整集合
- `replaceAll` 为 `true`
- 保存成功后自动刷新列表
- `permissionCount` 随后端变化

### 5.2 空数组清空权限

操作：

1. 打开 `编辑权限`
2. 取消全部勾选
3. 点击 `保存权限集合`

抓包只看：

- `POST /api/admin/roles/{roleId}/permissions`

通过条件：

- 请求体是：

```json
{
  "permissionCodes": [],
  "replaceAll": true
}
```

- 后端把它当合法请求
- 保存成功后列表刷新

### 5.3 非法权限码

操作：

1. 若联调环境允许改包，把一个 `permissionCode` 改成不存在值

抓包只看：

- `POST /api/admin/roles/{roleId}/permissions`

通过条件：

- 后端返回 `400` 或 `404`
- 页面不只显示裸 `请求失败`

---

## 6. 再跑受限权限账号

### 6.1 权限受限视角

操作：

1. 用账号 B 进入 `/admin/roles`
2. 找任意一行看操作按钮
3. 点击 `权限受限`

抓包顺序：

- 不应出现 `GET /api/admin/permissions`
- 不应出现 `POST /api/admin/roles/{roleId}/permissions`

通过条件：

- 按钮文案是 `权限受限`
- 可打开权限绑定区，但顶部提示“当前无权限访问”
- 文案明确提示：
  - `当前账号缺少 permission.manage`
  - `无法查看权限字典`
  - `也不能保存权限绑定结果`
- 保存按钮不可用
- 全程不请求 A-20

---

## 7. 当天最短执行顺序

当天照这个顺序跑，不要乱：

1. `/admin/roles` 首屏和查询
2. A-10 正常创建
3. A-10 重复编码冲突
4. A-11 正常编辑
5. A-11 双标签页快照冲突
6. 账号 A 打开权限绑定，验证 A-20
7. A-12 正常绑定
8. A-12 空数组清空
9. 账号 B 验证 `权限受限`

---

## 8. 当天只记录这几类结论

每跑完一项，只记录下面三种结果之一：

- 通过：前端请求体、后端响应、页面表现都符合预期
- 前端问题：页面表现不对，但抓包说明后端契约正常
- 后端问题：请求体符合预期，但后端返回与冻结契约不一致

推荐记录格式：

```md
- A-10 正常创建：通过
- A-10 重复编码：后端问题，返回 500，预期 409 BIZ-4090
- A-11 快照冲突：前端问题，后端已返回 409，但页面未提示冲突文案
```

---

## 9. 当天最高优先级观察点

联调当天别分神，重点只盯这 4 个：

1. A-11 快照字段名到底对不对
2. A-10 / A-11 的 `409 BIZ-4090` 语义是否稳定
3. A-20 是否真的要求 `permission.manage`
4. A-12 是否真的允许 `permissionCodes: []`

如果这 4 个都对，角色模板这块基本就稳了。
