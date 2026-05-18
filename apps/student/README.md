# WHUT Student Frontend

WHUT 综合测评系统学生端前端，运行在当前 monorepo 的 `apps/student`。

## 目标

- 面向学生个人申请、记录查询、成绩查看、附件管理
- 统一使用 `/student` 路由前缀
- 申请页与申请记录页围绕“配置化指标 + 申请记录”建模，不回退到硬编码页面

## 目录位置

```text
apps/student
packages/shared
packages/ui
```

- `apps/student`: 学生端页面、布局、路由与状态
- `packages/shared`: 菜单配置、路由元信息、共享认证能力
- `packages/ui`: 预留共享 UI 包

## 本地开发

在仓库根目录执行：

```bash
corepack pnpm install
corepack pnpm dev:student
```

常用命令：

```bash
corepack pnpm --filter @whut/student typecheck
corepack pnpm --filter @whut/student build
corepack pnpm exec vitest run apps/student/src/data/student-application-form.test.ts apps/student/src/data/student-application-history.test.ts
```

## 路由约束

- 登录页：`/student/login`
- 学生壳：`/student/*`
- 错误页：`/403`、`/404`、`/500`

当前主路由：

- `/student/home`
- `/student/application`
- `/student/history`
- `/student/grades`
- `/student/attachments`

## 页面组成

- `home`: 学生首页
- `application`: 综合测评申请
- `history`: 申请记录
- `grades`: 成绩与得分
- `attachments`: 材料附件

## 本轮关键实现

- 申请页已支持按指标切换表单 schema
- `SPORTS_COMPETITION` 与 `SPORTS_ART_CONTRIBUTION` 表单字段已区分
- `ART_MULTI_AUTHOR` 会追加“合作分工与本人贡献”必填字段
- 申请记录页已从“指标表”收口为“申请记录表”

## 实现约定

- 学生端仅使用 `StudentLayout`
- 页面级组件放在 `src/views`，页面名统一使用 `View` 后缀
- 指标共享数据位于 `src/data/student-application-shared.ts`
- 表单 schema 位于 `src/data/student-application-form.ts`
- 申请记录数据模型位于 `src/data/student-application-history.ts`
- 菜单和权限编码以 `packages/shared/src/router/menu.ts` 为单一事实源

## 对应仓库

- GitHub: `https://github.com/llws9/whut-comprehensive-evaluation-frontend.git`
