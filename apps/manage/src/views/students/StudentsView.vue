<script setup lang="ts">
import { onMounted } from 'vue'

import type { ManageUserStatus } from '@/api/users'
import { useAuthStore } from '@/stores/auth'

import {
  createStudentsPageState,
  resolveStatusActionLabel,
  supportsStatusToggle,
  statusLabelMap,
  studentStatusOptions
} from './students-page-state'

const authStore = useAuthStore()
const {
  students,
  searchKeyword,
  selectedStatus,
  pageNo,
  total,
  loading,
  errorMessage,
  changingUserId,
  isCreateFormVisible,
  creatingUser,
  isImportFormVisible,
  importingUsers,
  importResult,
  createForm,
  importForm,
  canSubmitCreateForm,
  canSubmitImportForm,
  displayStart,
  displayEnd,
  hasPreviousPage,
  hasNextPage,
  openCreateForm,
  closeCreateForm,
  openImportForm,
  closeImportForm,
  loadUsers,
  searchUsers,
  goToPreviousPage,
  goToNextPage,
  changeUserStatus,
  submitCreateUser,
  submitImportUsers
} = createStudentsPageState()

const statusToneMap: Record<ManageUserStatus, 'approved' | 'pending' | 'neutral'> = {
  ACTIVE: 'approved',
  DISABLED: 'neutral',
  LOCKED: 'pending'
}

const currentAccessToken = () => authStore.session?.accessToken ?? ''

const handleSearch = async () => {
  await searchUsers(currentAccessToken())
}

const handlePreviousPage = async () => {
  await goToPreviousPage(currentAccessToken())
}

const handleNextPage = async () => {
  await goToNextPage(currentAccessToken())
}

const handleChangeUserStatus = async (userId: string) => {
  const student = students.value.find((item) => item.userId === userId)

  if (!student) {
    return
  }

  await changeUserStatus(currentAccessToken(), student)
}

const handleSubmitCreateUser = async () => {
  await submitCreateUser(currentAccessToken())
}

const handleImportFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const selectedFile = target?.files?.[0] ?? null

  importForm.file.value = selectedFile
}

const handleSubmitImportUsers = async () => {
  await submitImportUsers(currentAccessToken())
}

const formatListCell = (items: string[]) => (items.length > 0 ? items.join(' / ') : '-')
const currentImportFileName = () => importForm.file.value?.name ?? '未选择文件'

onMounted(async () => {
  await loadUsers(currentAccessToken())
})
</script>

<template>
  <section class="page-stack">
    <div class="page-hero compact-hero">
      <div>
        <p class="section-eyebrow">用户管理</p>
        <p class="section-description">用户列表、状态切换、最小创建表单与导入闭环已接入真实后端接口。</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="secondary-button" :disabled="loading || importingUsers" @click="openImportForm">
          导入用户
        </button>
        <button type="button" class="primary-button" :disabled="loading || creatingUser" @click="openCreateForm">
          添加用户
        </button>
      </div>
    </div>

    <section class="surface-card">
      <div v-if="isCreateFormVisible" class="surface-card">
        <div class="page-hero compact-hero">
          <div>
            <p class="section-eyebrow">最小创建闭环</p>
            <p class="section-description">当前仅提交后端最小必填字段：`userNo`、`userName`、`password`。</p>
          </div>
          <div class="hero-actions">
            <button type="button" class="secondary-button" :disabled="creatingUser" @click="closeCreateForm">取消</button>
            <button
              type="button"
              class="primary-button"
              :disabled="!canSubmitCreateForm || creatingUser"
              @click="handleSubmitCreateUser"
            >
              {{ creatingUser ? '创建中...' : '确认创建' }}
            </button>
          </div>
        </div>

        <div class="filter-grid">
          <label class="form-field">
            <span class="field-label">用户编号</span>
            <input v-model="createForm.userNo" type="text" class="field-input" placeholder="请输入 userNo" />
          </label>

          <label class="form-field">
            <span class="field-label">用户姓名</span>
            <input v-model="createForm.userName" type="text" class="field-input" placeholder="请输入 userName" />
          </label>

          <label class="form-field">
            <span class="field-label">初始密码</span>
            <input
              v-model="createForm.password"
              type="password"
              class="field-input"
              placeholder="请输入初始密码"
              autocomplete="new-password"
            />
          </label>
        </div>
      </div>

      <div v-if="isImportFormVisible" class="surface-card">
        <div class="page-hero compact-hero">
          <div>
            <p class="section-eyebrow">最小导入闭环</p>
            <p class="section-description">当前支持上传单个 Excel 文件，并选择 `UPSERT` 或 `INSERT_ONLY` 导入模式。</p>
          </div>
          <div class="hero-actions">
            <button type="button" class="secondary-button" :disabled="importingUsers" @click="closeImportForm">取消</button>
            <button
              type="button"
              class="primary-button"
              :disabled="!canSubmitImportForm || importingUsers"
              @click="handleSubmitImportUsers"
            >
              {{ importingUsers ? '导入中...' : '确认导入' }}
            </button>
          </div>
        </div>

        <div class="filter-grid">
          <label class="form-field">
            <span class="field-label">导入模式</span>
            <select v-model="importForm.importMode" class="field-input field-select">
              <option value="UPSERT">UPSERT</option>
              <option value="INSERT_ONLY">INSERT_ONLY</option>
            </select>
          </label>

          <label class="form-field filter-search">
            <span class="field-label">导入文件</span>
            <input
              type="file"
              class="field-input"
              accept=".xlsx,.xls"
              @change="handleImportFileChange"
            />
          </label>
        </div>

        <p class="section-description">
          当前文件：{{ currentImportFileName() }}
        </p>
      </div>

      <div v-if="importResult" class="surface-card">
        <div class="page-hero compact-hero">
          <div>
            <p class="section-eyebrow">导入结果</p>
            <p class="section-description">
              共 {{ importResult.totalCount }} 条，成功 {{ importResult.successCount }} 条，失败 {{ importResult.failedCount }} 条。
            </p>
          </div>
        </div>

        <div v-if="importResult.failedRows.length > 0" class="table-shell">
          <table class="data-table">
            <thead>
              <tr>
                <th>失败行</th>
                <th>用户编号</th>
                <th>失败原因</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="failedRow in importResult.failedRows" :key="`${failedRow.rowNo}-${failedRow.userNo ?? 'unknown'}`">
                <td>{{ failedRow.rowNo }}</td>
                <td>{{ failedRow.userNo ?? '-' }}</td>
                <td>{{ failedRow.reason }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="filter-grid">
        <label class="form-field">
          <span class="field-label">状态</span>
          <select v-model="selectedStatus" class="field-input field-select">
            <option v-for="item in studentStatusOptions" :key="item.value || 'all'" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </label>

        <label class="form-field filter-search">
          <span class="field-label">搜索</span>
          <input v-model="searchKeyword" type="text" class="field-input" placeholder="搜索姓名、学号或工号" />
        </label>

        <div class="hero-actions">
          <button type="button" class="primary-button" :disabled="loading" @click="handleSearch">查询</button>
        </div>
      </div>

      <p v-if="errorMessage" class="section-description">{{ errorMessage }}</p>

      <div class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>姓名</th>
              <th>编号</th>
              <th>用户状态</th>
              <th>组织归属</th>
              <th>角色编码</th>
              <th>创建时间</th>
              <th class="align-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8">正在加载用户列表...</td>
            </tr>
            <tr v-else-if="students.length === 0">
              <td colspan="8">暂无符合条件的用户数据</td>
            </tr>
            <tr v-for="(student, index) in students" v-else :key="student.userId">
              <td>{{ displayStart + index }}</td>
              <td>{{ student.userName }}</td>
              <td>{{ student.userNo }}</td>
              <td>
                <span class="status-chip" :data-status="statusToneMap[student.status]">
                  {{ statusLabelMap[student.status] }}
                </span>
              </td>
              <td>{{ formatListCell(student.orgUnits) }}</td>
              <td>{{ formatListCell(student.roleCodes) }}</td>
              <td>{{ student.createdAt }}</td>
              <td class="align-right action-links">
                <button
                  v-if="supportsStatusToggle(student.status)"
                  type="button"
                  class="text-button"
                  :disabled="Boolean(changingUserId) || loading"
                  @click="handleChangeUserStatus(student.userId)"
                >
                  {{ changingUserId === student.userId ? '提交中...' : resolveStatusActionLabel(student.status) }}
                </button>
                <span v-else class="muted-text">-</span>
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
