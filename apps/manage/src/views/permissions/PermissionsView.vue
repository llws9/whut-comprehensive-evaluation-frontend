<script setup lang="ts">
import { computed, ref } from 'vue'

type Permission = {
  id: string
  name: string
  description: string
}

type ScopeRule = {
  id: string
  name: string
  description: string
}

type RoleStatus = 'active' | 'inactive'

type Role = {
  id: number
  name: string
  description: string
  status: RoleStatus
  permissions: string[]
  scopeRule: string
}

const searchKeyword = ref('')
const editingRole = ref<Role | null>(null)
const showAddRoleModal = ref(false)

const allPermissions = ref<Permission[]>([
  { id: 'student_manage', name: '学生管理', description: '管理学生信息' },
  { id: 'grade_manage', name: '成绩管理', description: '管理成绩数据' },
  { id: 'review', name: '成绩审核', description: '审核成绩申请' },
  { id: 'role_manage', name: '角色管理', description: '管理系统角色' },
  { id: 'system_settings', name: '系统设置', description: '系统配置管理' },
  { id: 'data_export', name: '数据导出', description: '导出数据报表' }
])

const scopeRules = ref<ScopeRule[]>([
  { id: 'all', name: '全部数据', description: '可查看和操作所有数据' },
  { id: 'department', name: '本部门', description: '仅可查看和操作本部门数据' },
  { id: 'grade', name: '本年级', description: '仅可查看和操作本年级数据' },
  { id: 'class', name: '本班', description: '仅可查看和操作本班数据' },
  { id: 'personal', name: '个人', description: '仅可查看和操作个人数据' }
])

const roles = ref<Role[]>([
  { id: 1, name: '超级管理员', description: '拥有系统最高权限', status: 'active', permissions: ['student_manage', 'grade_manage', 'review', 'role_manage', 'system_settings', 'data_export'], scopeRule: 'all' },
  { id: 2, name: '管理员', description: '管理学生成绩和审核', status: 'active', permissions: ['grade_manage', 'review', 'data_export'], scopeRule: 'department' },
  { id: 3, name: '班长', description: '审核本班学生申请', status: 'active', permissions: ['review'], scopeRule: 'class' },
  { id: 4, name: '学生', description: '查看个人成绩和申请', status: 'active', permissions: [], scopeRule: 'personal' }
])

const newRole = ref({
  name: '',
  description: '',
  permissions: [] as string[],
  scopeRule: 'personal'
})

const filteredRoles = computed(() => {
  if (!searchKeyword.value) {
    return roles.value
  }
  return roles.value.filter((role) => role.name.includes(searchKeyword.value))
})

const getStatusText = (status: RoleStatus) => (status === 'active' ? '启用' : '禁用')

const getScopeRuleName = (scopeId: string) => {
  const match = scopeRules.value.find((rule) => rule.id === scopeId)
  return match ? match.name : scopeId
}

const toggleRoleStatus = (id: number) => {
  const role = roles.value.find((item) => item.id === id)
  if (role) {
    role.status = role.status === 'active' ? 'inactive' : 'active'
  }
}

const editRole = (role: Role) => {
  editingRole.value = { ...role, permissions: [...role.permissions] }
}

const saveRole = () => {
  if (!editingRole.value) {
    return
  }
  const index = roles.value.findIndex((role) => role.id === editingRole.value?.id)
  if (index !== -1) {
    roles.value[index] = { ...editingRole.value }
  }
  editingRole.value = null
}

const togglePermission = (permissionId: string) => {
  if (!editingRole.value) {
    return
  }
  const index = editingRole.value.permissions.indexOf(permissionId)
  if (index === -1) {
    editingRole.value.permissions.push(permissionId)
  } else {
    editingRole.value.permissions.splice(index, 1)
  }
}

const deleteRole = (id: number) => {
  roles.value = roles.value.filter((role) => role.id !== id)
}

const toggleNewRolePermission = (permissionId: string) => {
  const index = newRole.value.permissions.indexOf(permissionId)
  if (index === -1) {
    newRole.value.permissions.push(permissionId)
  } else {
    newRole.value.permissions.splice(index, 1)
  }
}

const submitAddRole = () => {
  if (!newRole.value.name.trim()) {
    return
  }
  roles.value.push({
    id: Date.now(),
    name: newRole.value.name,
    description: newRole.value.description,
    status: 'active',
    permissions: [...newRole.value.permissions],
    scopeRule: newRole.value.scopeRule
  })
  newRole.value = { name: '', description: '', permissions: [], scopeRule: 'personal' }
  showAddRoleModal.value = false
}
</script>

<template>
  <section class="page-stack">
    <div class="page-hero compact-hero">
      <div>
        <p class="section-eyebrow">权限管理</p>
        <p class="section-description">保留旧权限页的角色列表、编辑态、权限矩阵和新增角色弹层内容。</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="secondary-button">刷新数据</button>
        <button type="button" class="primary-button" @click="showAddRoleModal = true">添加角色</button>
      </div>
    </div>

    <section class="surface-card">
      <div class="card-header">
        <div>
          <h3 class="card-title">角色与权限</h3>
          <p class="card-subtitle">角色级可见范围和权限点保留在页面内容层</p>
        </div>
        <label class="form-field search-inline-field">
          <span class="field-label">搜索角色</span>
          <input v-model="searchKeyword" type="text" class="field-input" placeholder="搜索角色" />
        </label>
      </div>

      <div class="role-list">
        <article v-for="role in filteredRoles" :key="role.id" class="role-card">
          <template v-if="editingRole && editingRole.id === role.id">
            <div class="edit-grid">
              <label class="form-field">
                <span class="field-label">角色名称</span>
                <input v-model="editingRole.name" type="text" class="field-input" />
              </label>
              <label class="form-field">
                <span class="field-label">角色描述</span>
                <input v-model="editingRole.description" type="text" class="field-input" />
              </label>
            </div>

            <div class="scope-group">
              <span class="field-label">可见范围</span>
              <div class="tab-group tab-group-spaced">
                <button
                  v-for="scope in scopeRules"
                  :key="scope.id"
                  type="button"
                  class="tab-button"
                  :class="{ 'is-active': editingRole.scopeRule === scope.id }"
                  @click="editingRole.scopeRule = scope.id"
                >
                  {{ scope.name }}
                </button>
              </div>
            </div>

            <div class="permission-grid">
              <button
                v-for="permission in allPermissions"
                :key="permission.id"
                type="button"
                class="permission-card"
                :class="{ 'is-selected': editingRole.permissions.includes(permission.id) }"
                @click="togglePermission(permission.id)"
              >
                <strong>{{ permission.name }}</strong>
                <span>{{ permission.description }}</span>
              </button>
            </div>

            <div class="modal-actions">
              <button type="button" class="secondary-button" @click="editingRole = null">取消</button>
              <button type="button" class="primary-button" @click="saveRole">保存</button>
            </div>
          </template>

          <template v-else>
            <div class="role-card-header">
              <div>
                <h4 class="card-title small-title">{{ role.name }}</h4>
                <p class="card-subtitle">{{ role.description }}</p>
              </div>
              <span class="status-chip" :data-status="role.status === 'active' ? 'approved' : 'rejected'">{{ getStatusText(role.status) }}</span>
            </div>
            <div class="role-meta">
              <span>可见范围：{{ getScopeRuleName(role.scopeRule) }}</span>
              <span>{{ role.permissions.length }} 个权限</span>
            </div>
            <div class="permission-pills">
              <span v-for="permissionId in role.permissions" :key="permissionId" class="pill-chip">{{ permissionId }}</span>
            </div>
            <div class="action-links align-right spaced-actions">
              <button type="button" class="text-button" @click="toggleRoleStatus(role.id)">{{ role.status === 'active' ? '禁用' : '启用' }}</button>
              <button type="button" class="text-button" @click="editRole(role)">编辑</button>
              <button type="button" class="text-button danger-text" @click="deleteRole(role.id)">删除</button>
            </div>
          </template>
        </article>
      </div>
    </section>

    <div v-if="showAddRoleModal" class="modal-backdrop" @click.self="showAddRoleModal = false">
      <div class="modal-card">
        <div class="card-header">
          <div>
            <h3 class="card-title">添加新角色</h3>
            <p class="card-subtitle">沿用旧页面的新增角色内容区</p>
          </div>
          <button type="button" class="secondary-button" @click="showAddRoleModal = false">关闭</button>
        </div>
        <div class="edit-grid">
          <label class="form-field">
            <span class="field-label">角色名称</span>
            <input v-model="newRole.name" type="text" class="field-input" placeholder="请输入角色名称" />
          </label>
          <label class="form-field">
            <span class="field-label">角色描述</span>
            <input v-model="newRole.description" type="text" class="field-input" placeholder="请输入角色描述" />
          </label>
        </div>
        <div class="scope-group">
          <span class="field-label">可见范围</span>
          <div class="tab-group tab-group-spaced">
            <button
              v-for="scope in scopeRules"
              :key="scope.id"
              type="button"
              class="tab-button"
              :class="{ 'is-active': newRole.scopeRule === scope.id }"
              @click="newRole.scopeRule = scope.id"
            >
              {{ scope.name }}
            </button>
          </div>
        </div>
        <div class="permission-grid">
          <button
            v-for="permission in allPermissions"
            :key="permission.id"
            type="button"
            class="permission-card"
            :class="{ 'is-selected': newRole.permissions.includes(permission.id) }"
            @click="toggleNewRolePermission(permission.id)"
          >
            <strong>{{ permission.name }}</strong>
            <span>{{ permission.description }}</span>
          </button>
        </div>
        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="showAddRoleModal = false">取消</button>
          <button type="button" class="primary-button" :disabled="!newRole.name.trim()" @click="submitAddRole">添加角色</button>
        </div>
      </div>
    </div>
  </section>
</template>
