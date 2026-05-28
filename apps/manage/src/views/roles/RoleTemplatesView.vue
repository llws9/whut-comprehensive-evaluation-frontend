<script setup lang="ts">
import { computed, onMounted } from 'vue'

import type { ManageRoleListItem } from '@/api/roles'
import { useAuthStore } from '@/stores/auth'

import {
  createRoleTemplatesPageState,
  roleScopeOptions,
  roleStatusOptions
} from './role-templates-page-state'

const authStore = useAuthStore()
const {
  roles,
  searchKeyword,
  selectedStatus,
  pageNo,
  pageSize,
  total,
  hasPreviousPage,
  hasNextPage,
  loading,
  errorMessage,
  modeSwitchMessage,
  isCreateFormVisible,
  creatingRole,
  editingRoleId,
  editingRoleHeaderLabel,
  editingRoleHeaderText,
  savingRoleId,
  bindingPermissionRoleId,
  permissionBindingHeaderLabel,
  permissionBindingHeaderText,
  savingPermissionBinding,
  permissionBindingReadOnly,
  permissionDictionaryAccessDenied,
  permissionBindingReadOnlyMessage,
  permissionDictionaryEmptyMessage,
  permissionReplaceModeTitle,
  permissionReplaceModeDescription,
  permissionKeyword,
  selectedPermissionCodes,
  filteredPermissionDictionary,
  roleListEmptyMessage,
  createForm,
  editForm,
  canSubmitCreateForm,
  hasKnownEditRoleScope,
  openCreateForm,
  closeCreateForm,
  loadRoles,
  searchRoles,
  goToPreviousPage,
  goToNextPage,
  submitCreateRole,
  startEditRole,
  closeEditPanel,
  submitEditRole,
  openPermissionEditor,
  closePermissionEditor,
  togglePermission,
  submitReplacePermissions
} = createRoleTemplatesPageState()

const currentAccessToken = () => authStore.session?.accessToken ?? ''
const canManagePermissions = computed(() => authStore.hasPermission('permission.manage'))
const displayStart = computed(() => (total.value === 0 ? 0 : (pageNo.value - 1) * pageSize + 1))
const displayEnd = computed(() => Math.min(pageNo.value * pageSize, total.value))

const roleScopeLabelMap = Object.fromEntries(
  roleScopeOptions.map((item) => [item.value, item.label])
) as Record<string, string>

const selectedBindingRole = computed(() =>
  roles.value.find((role) => role.roleId === bindingPermissionRoleId.value) ?? null
)
const unknownEditRoleScopeLabel = computed(() => resolveRoleScopeLabel(editForm.roleScope.value))

const editStatusOptions = computed(() => {
  const baseOptions = [
    { label: '启用', value: 'ACTIVE' },
    { label: '禁用', value: 'DISABLED' }
  ]

  if (!editForm.status.value || baseOptions.some((item) => item.value === editForm.status.value)) {
    return baseOptions
  }

  return [
    ...baseOptions,
    {
      label: editForm.status.value,
      value: editForm.status.value
    }
  ]
})

const resolveRoleScopeLabel = (scope: string) => roleScopeLabelMap[scope] ?? scope
const resolveStatusLabel = (status: string) =>
  status === 'ACTIVE' ? '启用' : status === 'DISABLED' ? '禁用' : status
const resolveStatusTone = (status: string) =>
  status === 'ACTIVE' ? 'approved' : status === 'DISABLED' ? 'neutral' : 'pending'

const handleSearch = async () => {
  await searchRoles(currentAccessToken())
}

const handleRefresh = async () => {
  await loadRoles(currentAccessToken())
}

const handlePreviousPage = async () => {
  await goToPreviousPage(currentAccessToken())
}

const handleNextPage = async () => {
  await goToNextPage(currentAccessToken())
}

const handleSubmitCreateRole = async () => {
  await submitCreateRole(currentAccessToken())
}

const handleStartEditRole = (role: ManageRoleListItem) => {
  startEditRole(role)
}

const handleSubmitEditRole = async () => {
  await submitEditRole(currentAccessToken())
}

const handleCloseEditPanel = () => {
  closeEditPanel()
}

const handleOpenPermissionEditor = async (role: ManageRoleListItem) => {
  await openPermissionEditor(currentAccessToken(), role, {
    canManagePermissions: canManagePermissions.value
  })
}

const handleClosePermissionEditor = () => {
  closePermissionEditor()
}

const handleSubmitReplacePermissions = async () => {
  await submitReplacePermissions(currentAccessToken())
}

onMounted(async () => {
  await loadRoles(currentAccessToken())
})
</script>

<template>
  <section class="page-stack">
    <div class="page-hero compact-hero">
      <div>
        <p class="section-eyebrow">角色模板</p>
        <p class="section-description">维护角色模板基础信息，并为角色绑定权限集合。</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="secondary-button" :disabled="loading" @click="handleRefresh">
          刷新列表
        </button>
        <button type="button" class="primary-button" :disabled="loading || creatingRole" @click="openCreateForm">
          新建角色模板
        </button>
      </div>
    </div>

    <div v-if="modeSwitchMessage" class="surface-subcard">
      <p class="field-label">已自动切换工作区</p>
      <p class="card-subtitle">{{ modeSwitchMessage }}</p>
    </div>

    <section v-if="isCreateFormVisible" class="surface-card">
      <div class="page-hero compact-hero">
        <div>
          <p class="section-eyebrow">创建角色模板</p>
          <p class="section-description">当前只提交最小必填字段：`roleCode`、`roleName`、`roleScope`。</p>
        </div>
        <div class="hero-actions">
          <button type="button" class="secondary-button" :disabled="creatingRole" @click="closeCreateForm">取消</button>
          <button
            type="button"
            class="primary-button"
            :disabled="!canSubmitCreateForm || creatingRole"
            @click="handleSubmitCreateRole"
          >
            {{ creatingRole ? '创建中...' : '确认创建' }}
          </button>
        </div>
      </div>

      <div class="edit-grid">
        <label class="form-field">
          <span class="field-label">角色编码</span>
          <input v-model="createForm.roleCode" type="text" class="field-input" placeholder="请输入 roleCode" />
        </label>

        <label class="form-field">
          <span class="field-label">角色名称</span>
          <input v-model="createForm.roleName" type="text" class="field-input" placeholder="请输入 roleName" />
        </label>

        <label class="form-field">
          <span class="field-label">角色范围</span>
          <select v-model="createForm.roleScope" class="field-input field-select">
            <option v-for="item in roleScopeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>
      </div>
    </section>

    <section v-if="editingRoleId" class="surface-card">
      <div class="surface-subcard">
        <p class="field-label">{{ editingRoleHeaderLabel }}</p>
        <p class="card-subtitle">{{ editingRoleHeaderText }}</p>
      </div>
      <div class="page-hero compact-hero">
        <div>
          <p class="section-eyebrow">编辑基础信息</p>
          <p class="section-description">基础信息与权限绑定分开保存，避免半成功半失败的混合状态。</p>
        </div>
        <div class="hero-actions">
          <button type="button" class="secondary-button" :disabled="Boolean(savingRoleId)" @click="handleCloseEditPanel">
            关闭编辑面板
          </button>
          <button type="button" class="primary-button" :disabled="Boolean(savingRoleId)" @click="handleSubmitEditRole">
            {{ savingRoleId ? '保存中...' : '保存基础信息' }}
          </button>
        </div>
      </div>

      <div class="edit-grid">
        <label class="form-field">
          <span class="field-label">角色编码</span>
          <input v-model="editForm.roleCode" type="text" class="field-input" disabled />
        </label>

        <label class="form-field">
          <span class="field-label">角色名称</span>
          <input v-model="editForm.roleName" type="text" class="field-input" placeholder="请输入 roleName" />
        </label>

        <label class="form-field">
          <span class="field-label">角色范围</span>
          <select v-model="editForm.roleScope" class="field-input field-select">
            <option v-if="!hasKnownEditRoleScope" :value="editForm.roleScope">
              {{ unknownEditRoleScopeLabel }}
            </option>
            <option v-for="item in roleScopeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>

        <label class="form-field">
          <span class="field-label">角色状态</span>
          <select v-model="editForm.status" class="field-input field-select">
            <option v-for="item in editStatusOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>
      </div>

      <p v-if="!hasKnownEditRoleScope" class="section-description danger-text">
        当前角色范围不在前端已知枚举中，禁止保存以避免覆盖未知值。
      </p>
    </section>

    <section v-if="bindingPermissionRoleId" class="surface-card">
      <div class="surface-subcard">
        <p class="field-label">{{ permissionBindingHeaderLabel }}</p>
        <p class="card-subtitle">{{ permissionBindingHeaderText }}</p>
      </div>
      <div class="page-hero compact-hero">
        <div>
          <p class="section-eyebrow">权限绑定</p>
          <p class="section-description">
            {{
              selectedBindingRole
                ? `当前角色：${selectedBindingRole.roleName}（${selectedBindingRole.roleCode}）`
                : '当前正在编辑角色权限'
            }}
          </p>
        </div>
        <div class="hero-actions">
          <button
            type="button"
            class="secondary-button"
            :disabled="savingPermissionBinding"
            @click="handleClosePermissionEditor"
          >
            关闭绑定面板
          </button>
          <button
            type="button"
            class="primary-button"
            :disabled="permissionBindingReadOnly || savingPermissionBinding"
            @click="handleSubmitReplacePermissions"
          >
            {{ savingPermissionBinding ? '保存中...' : permissionBindingReadOnly ? '当前无保存权限' : '保存权限集合' }}
          </button>
        </div>
      </div>

      <div class="surface-subcard">
        <p class="field-label">{{ permissionReplaceModeTitle }}</p>
        <p class="card-subtitle">{{ permissionReplaceModeDescription }}</p>
      </div>
      <div v-if="permissionBindingReadOnly" class="surface-subcard">
        <p class="field-label">{{ permissionDictionaryAccessDenied ? '当前无权限访问' : '当前为只读模式' }}</p>
        <p class="card-subtitle">{{ permissionBindingReadOnlyMessage }}</p>
      </div>

      <div class="filter-grid filter-grid-tight">
        <label class="form-field">
          <span class="field-label">权限搜索</span>
          <input
            v-model="permissionKeyword"
            type="text"
            class="field-input"
            placeholder="搜索 permissionCode、permissionName 或 module"
          />
        </label>
        <div class="surface-subcard">
          <p class="field-label">已选权限</p>
          <p class="card-subtitle">{{ selectedPermissionCodes.length }} 项</p>
        </div>
      </div>

      <div class="permission-grid">
        <button
          v-for="permission in filteredPermissionDictionary"
          :key="permission.permissionCode"
          type="button"
          class="permission-card"
          :class="{ 'is-selected': selectedPermissionCodes.includes(permission.permissionCode) }"
          :disabled="permissionBindingReadOnly"
          @click="togglePermission(permission.permissionCode)"
        >
          <strong>{{ permission.permissionName }}</strong>
          <span>{{ permission.permissionCode }}</span>
          <span>{{ permission.module }}</span>
        </button>
      </div>

      <div v-if="filteredPermissionDictionary.length === 0" class="surface-subcard">
        <p class="field-label">权限列表为空</p>
        <p class="card-subtitle">{{ permissionDictionaryEmptyMessage }}</p>
      </div>
    </section>

    <section class="surface-card">
      <div class="card-header">
        <div>
          <h3 class="card-title">角色模板列表</h3>
          <p class="card-subtitle">列表字段与 `A-9` 返回字段对齐，编辑依赖当前列表快照，不额外请求详情。</p>
        </div>
      </div>

      <p v-if="errorMessage" class="section-description danger-text">{{ errorMessage }}</p>

      <div class="filter-grid">
        <label class="form-field">
          <span class="field-label">状态</span>
          <select v-model="selectedStatus" class="field-input field-select">
            <option v-for="item in roleStatusOptions" :key="item.value || 'all'" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>

        <label class="form-field filter-search">
          <span class="field-label">搜索</span>
          <input v-model="searchKeyword" type="text" class="field-input" placeholder="搜索角色编码或角色名称" />
        </label>

        <div class="hero-actions">
          <button type="button" class="primary-button" :disabled="loading" @click="handleSearch">查询</button>
        </div>
      </div>

      <div class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>角色名称</th>
              <th>角色编码</th>
              <th>角色范围</th>
              <th>状态</th>
              <th>权限数</th>
              <th>创建时间</th>
              <th class="align-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8">正在加载角色模板列表...</td>
            </tr>
            <tr v-else-if="roles.length === 0">
              <td colspan="8">{{ roleListEmptyMessage }}</td>
            </tr>
            <tr v-for="(role, index) in roles" v-else :key="role.roleId">
              <td>{{ displayStart + index }}</td>
              <td>{{ role.roleName }}</td>
              <td>{{ role.roleCode }}</td>
              <td>{{ resolveRoleScopeLabel(role.roleScope) }}</td>
              <td>
                <span class="status-chip" :data-status="resolveStatusTone(role.status)">
                  {{ resolveStatusLabel(role.status) }}
                </span>
              </td>
              <td>{{ role.permissionCount }}</td>
              <td>{{ role.createdAt }}</td>
              <td class="align-right action-links">
                <button type="button" class="text-button" :disabled="loading" @click="handleStartEditRole(role)">
                  编辑基础信息
                </button>
                <button type="button" class="text-button" :disabled="loading" @click="handleOpenPermissionEditor(role)">
                  {{ canManagePermissions ? '编辑权限' : '权限受限' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p>显示 {{ displayStart }}-{{ displayEnd }} 条，共 {{ total }} 条</p>
        <div class="pagination-group">
          <button type="button" class="secondary-button" :disabled="!hasPreviousPage || loading" @click="handlePreviousPage">
            上一页
          </button>
          <button type="button" class="primary-button">{{ pageNo }}</button>
          <button type="button" class="secondary-button" :disabled="!hasNextPage || loading" @click="handleNextPage">
            下一页
          </button>
        </div>
      </div>
    </section>
  </section>
</template>
