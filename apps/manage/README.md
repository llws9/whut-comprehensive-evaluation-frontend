# WHUT Manage Frontend

WHUT 综合测评系统管理端前端，运行在当前 monorepo 的 `apps/manage`。

## 目标

- 面向辅导员、班长、管理员等管理角色
- 统一使用 `/admin` 路由前缀
- 基于 `vue-router + Pinia + shared route meta` 驱动菜单、高亮和权限信息

## 目录位置

```text
apps/manage
packages/shared
packages/ui
```

- `apps/manage`: 管理端页面、布局、路由与状态
- `packages/shared`: 菜单配置、路由元信息、共享认证能力
- `packages/ui`: 预留共享 UI 包

## 本地开发

在仓库根目录执行：

```bash
corepack pnpm install
corepack pnpm dev:manage
```

常用命令：

```bash
corepack pnpm --filter @whut/manage typecheck
corepack pnpm --filter @whut/manage build
corepack pnpm lint:types
```

## 路由约束

- 登录页：`/admin/login`
- 管理壳：`/admin/*`
- 错误页：`/403`、`/404`、`/500`

当前主路由：

- `/admin/dashboard`
- `/admin/students`
- `/admin/grades`
- `/admin/review`
- `/admin/scholarship`
- `/admin/permissions`
- `/admin/settings`

## 页面组成

- `dashboard`: 工作台首页，包含概览指标、申请趋势、热门申请、成绩报告
- `students`: 学生管理
- `grades`: 成绩管理
- `review`: 审核工作流
- `scholarship`: 奖学金资格检查
- `permissions`: 权限管理
- `settings`: 系统设置

## 实现约定

- 仅管理端使用 `AdminLayout`
- 页面级组件放在 `src/views`，页面名统一使用 `View` 后缀
- 菜单和权限编码以 `packages/shared/src/router/menu.ts` 为单一事实源
- 路由元信息使用 `AppRouteMeta`，不要在页面里重复硬编码菜单高亮逻辑

## 当前状态

- 已完成 monorepo 迁移
- 已接入管理端独立路由与布局壳
- 首页布局已调整为“申请趋势 + 热门申请”上移，“成绩报告”下移

## 对应仓库

- GitHub: `https://github.com/llws9/whut-comprehensive-evaluation-frontend.git`
