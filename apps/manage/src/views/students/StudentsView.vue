<script setup lang="ts">
import { computed, ref } from 'vue'

type StudentRecord = {
  id: number
  name: string
  className: string
  studentId: string
  grade: string
  role: '学生' | '班长' | '管理员'
  enabled: boolean
}

const selectedGrade = ref('')
const selectedRole = ref('')
const searchKeyword = ref('')

const gradeOptions = ['', '研一', '研二', '研三']
const roleOptions = ['', '学生', '班长', '管理员']

const students = ref<StudentRecord[]>([
  { id: 1, name: '张三', className: '计算机2101', studentId: '2021001', grade: '研一', role: '学生', enabled: true },
  { id: 2, name: '李四', className: '软件工程2102', studentId: '2021002', grade: '研二', role: '班长', enabled: true },
  { id: 3, name: '王五', className: '物联网2101', studentId: '2021003', grade: '研一', role: '学生', enabled: true },
  { id: 4, name: '赵六', className: '计算机2102', studentId: '2021004', grade: '研三', role: '学生', enabled: false },
  { id: 5, name: '钱七', className: '软件工程2101', studentId: '2021005', grade: '研二', role: '学生', enabled: true },
  { id: 6, name: '孙八', className: '物联网2102', studentId: '2021006', grade: '研一', role: '学生', enabled: true }
])

const filteredStudents = computed(() =>
  students.value.filter((student) => {
    if (selectedGrade.value && student.grade !== selectedGrade.value) {
      return false
    }
    if (selectedRole.value && student.role !== selectedRole.value) {
      return false
    }
    if (
      searchKeyword.value &&
      !student.name.includes(searchKeyword.value) &&
      !student.studentId.includes(searchKeyword.value)
    ) {
      return false
    }
    return true
  })
)

const toggleStatus = (student: StudentRecord) => {
  student.enabled = !student.enabled
}

const setMonitor = (student: StudentRecord) => {
  student.role = '班长'
}

const setAdmin = (student: StudentRecord) => {
  student.role = '管理员'
}
</script>

<template>
  <section class="page-stack">
    <div class="page-hero compact-hero">
      <div>
        <p class="section-eyebrow">学生管理</p>
        <p class="section-description">保留旧页面的筛选、列表和角色调整内容区，不再复制原侧边栏与顶部操作条。</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="secondary-button">导入学生</button>
        <button type="button" class="primary-button">添加学生</button>
      </div>
    </div>

    <section class="surface-card">
      <div class="filter-grid">
        <label class="form-field">
          <span class="field-label">年级</span>
          <select v-model="selectedGrade" class="field-input field-select">
            <option value="">全部年级</option>
            <option v-for="item in gradeOptions.filter(Boolean)" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>

        <label class="form-field">
          <span class="field-label">权限</span>
          <select v-model="selectedRole" class="field-input field-select">
            <option value="">全部权限</option>
            <option v-for="item in roleOptions.filter(Boolean)" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>

        <label class="form-field filter-search">
          <span class="field-label">搜索</span>
          <input v-model="searchKeyword" type="text" class="field-input" placeholder="搜索姓名或学号" />
        </label>
      </div>

      <div class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>班级</th>
              <th>姓名</th>
              <th>学号</th>
              <th>年级</th>
              <th>用户状态</th>
              <th>用户权限</th>
              <th class="align-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(student, index) in filteredStudents" :key="student.id">
              <td>{{ index + 1 }}</td>
              <td>{{ student.className }}</td>
              <td>{{ student.name }}</td>
              <td>{{ student.studentId }}</td>
              <td>{{ student.grade }}</td>
              <td>
                <button type="button" class="toggle-chip" :data-enabled="student.enabled" @click="toggleStatus(student)">
                  {{ student.enabled ? '正常' : '禁用' }}
                </button>
              </td>
              <td>
                <span class="status-chip" :data-status="student.role === '班长' ? 'pending' : student.role === '管理员' ? 'approved' : 'neutral'">
                  {{ student.role }}
                </span>
              </td>
              <td class="align-right action-links">
                <button type="button" class="text-button" @click="setMonitor(student)">设为班长</button>
                <button type="button" class="text-button" @click="setAdmin(student)">设为管理员</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <p>显示 1-{{ filteredStudents.length }} 条，共 {{ students.length }} 条</p>
        <div class="pagination-group">
          <button type="button" class="secondary-button">上一页</button>
          <button type="button" class="primary-button">1</button>
          <button type="button" class="secondary-button">2</button>
          <button type="button" class="secondary-button">下一页</button>
        </div>
      </div>
    </section>
  </section>
</template>
