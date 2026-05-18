<script setup lang="ts">
import { computed, ref } from 'vue'

type DetailStatus = 'pass' | 'fail'

type ScholarshipStudent = {
  id: number
  name: string
  className: string
  studentId: string
  major: string
  category: 'moral' | 'intellectual' | 'sports' | 'labor'
  requirement: string
  currentValue: string
  status: DetailStatus
  details: Array<{
    category: string
    requirement: string
    current: string
    status: DetailStatus
  }>
}

const searchKeyword = ref('')
const selectedCategory = ref<'all' | 'moral' | 'intellectual' | 'sports' | 'labor'>('all')
const selectedYear = ref('2024-2025')
const showDetailModal = ref(false)
const selectedStudent = ref<ScholarshipStudent | null>(null)

const years = ['2024-2025', '2023-2024', '2022-2023']
const categoryOptions = [
  { id: 'all', label: '全部类别' },
  { id: 'moral', label: '德育' },
  { id: 'intellectual', label: '智育' },
  { id: 'sports', label: '体育与美育' },
  { id: 'labor', label: '劳育' }
] as const

const students = ref<ScholarshipStudent[]>([
  {
    id: 1,
    name: '张三',
    className: '2022级硕士1班',
    studentId: '2022001',
    major: '计算机科学与技术',
    category: 'intellectual',
    requirement: '智育：0.4 分及以上',
    currentValue: '0.35 分',
    status: 'fail',
    details: [
      { category: '德育', requirement: '9 分及以上', current: '8.7 分', status: 'fail' },
      { category: '智育', requirement: '0.4 分及以上', current: '0.35 分', status: 'fail' },
      { category: '体育与美育', requirement: '无不及格', current: '合格', status: 'pass' },
      { category: '劳育', requirement: '无特殊要求', current: '合格', status: 'pass' }
    ]
  },
  {
    id: 2,
    name: '李四',
    className: '2022级硕士2班',
    studentId: '2022002',
    major: '软件工程',
    category: 'moral',
    requirement: '德育：9 分及以上',
    currentValue: '8.5 分',
    status: 'fail',
    details: [
      { category: '德育', requirement: '9 分及以上', current: '8.5 分', status: 'fail' },
      { category: '智育', requirement: '0.4 分及以上', current: '0.8 分', status: 'pass' },
      { category: '体育与美育', requirement: '无不及格', current: '合格', status: 'pass' },
      { category: '劳育', requirement: '无特殊要求', current: '合格', status: 'pass' }
    ]
  },
  {
    id: 3,
    name: '王五',
    className: '2022级硕士1班',
    studentId: '2022003',
    major: '计算机科学与技术',
    category: 'sports',
    requirement: '无不及格课程',
    currentValue: '有 1 门不及格',
    status: 'fail',
    details: [
      { category: '德育', requirement: '9 分及以上', current: '9.2 分', status: 'pass' },
      { category: '智育', requirement: '0.4 分及以上', current: '0.7 分', status: 'pass' },
      { category: '体育与美育', requirement: '无不及格', current: '1 门不及格', status: 'fail' },
      { category: '劳育', requirement: '无特殊要求', current: '合格', status: 'pass' }
    ]
  }
])

const filteredStudents = computed(() =>
  students.value.filter((student) => {
    if (
      searchKeyword.value &&
      !student.name.includes(searchKeyword.value) &&
      !student.studentId.includes(searchKeyword.value)
    ) {
      return false
    }
    if (selectedCategory.value !== 'all' && student.category !== selectedCategory.value) {
      return false
    }
    return true
  })
)

const statistics = computed(() => ({
  total: students.value.length,
  moralFail: students.value.filter((student) => student.details.some((detail) => detail.category === '德育' && detail.status === 'fail')).length,
  intellectualFail: students.value.filter((student) => student.details.some((detail) => detail.category === '智育' && detail.status === 'fail')).length,
  sportsFail: students.value.filter((student) => student.details.some((detail) => detail.category === '体育与美育' && detail.status === 'fail')).length,
  laborFail: students.value.filter((student) => student.details.some((detail) => detail.category === '劳育' && detail.status === 'fail')).length
}))

const getCategoryLabel = (categoryId: ScholarshipStudent['category']) => {
  const match = categoryOptions.find((item) => item.id === categoryId)
  return match ? match.label : categoryId
}

const getDetailStatusText = (status: DetailStatus) => (status === 'pass' ? '已满足' : '未满足')
</script>

<template>
  <section class="page-stack">
    <div class="page-hero compact-hero">
      <div>
        <p class="section-eyebrow">奖学金资格审核</p>
        <p class="section-description">迁移旧资格审核页的统计、筛选、未达标学生表和详情弹层。</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="secondary-button">刷新数据</button>
        <button type="button" class="primary-button">导出列表</button>
      </div>
    </div>

    <div class="metrics-grid metrics-grid-5">
      <article class="metric-card" data-tone="primary"><p class="metric-label">未达标学生</p><p class="metric-value">{{ statistics.total }}</p></article>
      <article class="metric-card" data-tone="danger"><p class="metric-label">德育未达标</p><p class="metric-value">{{ statistics.moralFail }}</p></article>
      <article class="metric-card" data-tone="primary"><p class="metric-label">智育未达标</p><p class="metric-value">{{ statistics.intellectualFail }}</p></article>
      <article class="metric-card" data-tone="warning"><p class="metric-label">体育美育未达标</p><p class="metric-value">{{ statistics.sportsFail }}</p></article>
      <article class="metric-card" data-tone="success"><p class="metric-label">劳育未达标</p><p class="metric-value">{{ statistics.laborFail }}</p></article>
    </div>

    <section class="surface-card">
      <div class="filter-grid scholarship-filter-grid">
        <label class="form-field filter-search">
          <span class="field-label">搜索</span>
          <input v-model="searchKeyword" type="text" class="field-input" placeholder="搜索姓名或学号" />
        </label>
        <label class="form-field">
          <span class="field-label">筛选类别</span>
          <select v-model="selectedCategory" class="field-input field-select">
            <option v-for="item in categoryOptions" :key="item.id" :value="item.id">{{ item.label }}</option>
          </select>
        </label>
        <label class="form-field">
          <span class="field-label">学年</span>
          <select v-model="selectedYear" class="field-input field-select">
            <option v-for="item in years" :key="item" :value="item">{{ item }}学年</option>
          </select>
        </label>
      </div>

      <div class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th>学号</th>
              <th>姓名</th>
              <th>班级</th>
              <th>专业</th>
              <th>未达标类别</th>
              <th>要求</th>
              <th>当前值</th>
              <th class="align-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredStudents" :key="student.id">
              <td>{{ student.studentId }}</td>
              <td>{{ student.name }}</td>
              <td>{{ student.className }}</td>
              <td>{{ student.major }}</td>
              <td>{{ getCategoryLabel(student.category) }}</td>
              <td>{{ student.requirement }}</td>
              <td><span class="danger-text">{{ student.currentValue }}</span></td>
              <td class="align-right">
                <button
                  type="button"
                  class="text-button"
                  @click="selectedStudent = student; showDetailModal = true"
                >
                  详情
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredStudents.length === 0" class="empty-state">
        <p>所有学生均已满足奖学金申请条件。</p>
      </div>
    </section>

    <div v-if="showDetailModal && selectedStudent" class="modal-backdrop" @click.self="showDetailModal = false">
      <div class="modal-card">
        <div class="card-header">
          <div>
            <h3 class="card-title">奖学金资格详情</h3>
            <p class="card-subtitle">{{ selectedStudent.name }} · {{ selectedStudent.className }} · {{ selectedStudent.studentId }}</p>
          </div>
          <button type="button" class="secondary-button" @click="showDetailModal = false">关闭</button>
        </div>
        <div class="detail-list">
          <article
            v-for="detail in selectedStudent.details"
            :key="detail.category"
            class="detail-row"
            :data-status="detail.status"
          >
            <div>
              <strong>{{ detail.category }}</strong>
              <p class="detail-help">要求：{{ detail.requirement }}</p>
            </div>
            <div class="detail-current">
              <span>{{ detail.current }}</span>
              <span class="status-chip" :data-status="detail.status === 'pass' ? 'approved' : 'rejected'">{{ getDetailStatusText(detail.status) }}</span>
            </div>
          </article>
        </div>
        <article class="surface-subcard">
          <p class="detail-help">该学生未满足参评学业奖学金的基本要求，请督促其补充相关材料或整改。</p>
        </article>
        <div class="modal-actions">
          <button type="button" class="secondary-button" @click="showDetailModal = false">关闭</button>
          <button type="button" class="primary-button">导出详情</button>
        </div>
      </div>
    </div>
  </section>
</template>
