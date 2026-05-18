<script setup lang="ts">
import { computed, ref } from 'vue'

type GradeRecord = {
  id: number
  student: string
  className: string
  grade: string
  intellectual: number
  sports: number
  labor: number
  moral: number
  total: number
  status: 'confirmed' | 'pending'
}

const selectedYear = ref('2024-2025')
const selectedGrade = ref('')
const selectedStatus = ref<'all' | 'confirmed' | 'pending'>('all')
const searchKeyword = ref('')

const years = ['2024-2025', '2023-2024', '2022-2023']
const gradeOptions = ['', '研一', '研二', '研三']

const grades = ref<GradeRecord[]>([
  { id: 1, student: '张三', className: '计算机2101', grade: '研一', intellectual: 92.5, sports: 88, labor: 90, moral: 95, total: 91.4, status: 'confirmed' },
  { id: 2, student: '李四', className: '软件工程2102', grade: '研二', intellectual: 88, sports: 90, labor: 85, moral: 92, total: 88.8, status: 'confirmed' },
  { id: 3, student: '王五', className: '物联网2101', grade: '研一', intellectual: 95, sports: 85, labor: 92, moral: 88, total: 90, status: 'pending' },
  { id: 4, student: '赵六', className: '计算机2102', grade: '研三', intellectual: 85, sports: 92, labor: 88, moral: 90, total: 88.8, status: 'confirmed' },
  { id: 5, student: '钱七', className: '软件工程2101', grade: '研二', intellectual: 90, sports: 88, labor: 95, moral: 92, total: 91.2, status: 'pending' },
  { id: 6, student: '孙八', className: '物联网2102', grade: '研一', intellectual: 82, sports: 95, labor: 90, moral: 88, total: 88.8, status: 'confirmed' }
])

const filteredGrades = computed(() =>
  grades.value.filter((item) => {
    if (selectedStatus.value !== 'all' && item.status !== selectedStatus.value) {
      return false
    }
    if (selectedGrade.value && item.grade !== selectedGrade.value) {
      return false
    }
    if (
      searchKeyword.value &&
      !item.student.includes(searchKeyword.value) &&
      !item.className.includes(searchKeyword.value)
    ) {
      return false
    }
    return true
  })
)

const getScoreTone = (score: number) => {
  if (score >= 90) return 'high'
  if (score >= 80) return 'medium'
  if (score >= 60) return 'low'
  return 'danger'
}
</script>

<template>
  <section class="page-stack">
    <div class="page-hero compact-hero">
      <div>
        <p class="section-eyebrow">成绩管理</p>
        <p class="section-description">迁入旧页面的学年切换、统计卡片、筛选区和成绩列表内容。</p>
      </div>
      <div class="hero-actions hero-actions-wrap">
        <label class="inline-select-field">
          <span>学年</span>
          <select v-model="selectedYear" class="field-input field-select small-select">
            <option v-for="item in years" :key="item" :value="item">{{ item }}学年</option>
          </select>
        </label>
        <button type="button" class="secondary-button">获取导入模板</button>
        <button type="button" class="secondary-button">导入讲座数据</button>
        <button type="button" class="secondary-button">导入德育成绩</button>
        <button type="button" class="primary-button">导出成绩</button>
      </div>
    </div>

    <div class="metrics-grid metrics-grid-4">
      <article class="metric-card" data-tone="primary">
        <p class="metric-label">学生总数</p>
        <p class="metric-value">2,456</p>
      </article>
      <article class="metric-card" data-tone="success">
        <p class="metric-label">已确认成绩</p>
        <p class="metric-value">1,832</p>
      </article>
      <article class="metric-card" data-tone="warning">
        <p class="metric-label">待确认成绩</p>
        <p class="metric-value">624</p>
      </article>
      <article class="metric-card" data-tone="neutral">
        <p class="metric-label">平均成绩</p>
        <p class="metric-value">89.5</p>
      </article>
    </div>

    <section class="surface-card">
      <div class="card-header">
        <div>
          <h3 class="card-title">成绩列表</h3>
          <p class="card-subtitle">仅迁移内容区，不复用旧页面顶部导航逻辑</p>
        </div>
        <div class="toolbar-actions">
          <button type="button" class="tab-button" :class="{ 'is-active': selectedStatus === 'all' }" @click="selectedStatus = 'all'">全部</button>
          <button type="button" class="tab-button" :class="{ 'is-active': selectedStatus === 'confirmed' }" @click="selectedStatus = 'confirmed'">已确认</button>
          <button type="button" class="tab-button" :class="{ 'is-active': selectedStatus === 'pending' }" @click="selectedStatus = 'pending'">待确认</button>
        </div>
      </div>

      <div class="filter-grid filter-grid-tight">
        <label class="form-field">
          <span class="field-label">年级</span>
          <select v-model="selectedGrade" class="field-input field-select">
            <option value="">全部年级</option>
            <option v-for="item in gradeOptions.filter(Boolean)" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label class="form-field filter-search">
          <span class="field-label">搜索</span>
          <input v-model="searchKeyword" type="text" class="field-input" placeholder="搜索学生姓名或班级" />
        </label>
      </div>

      <div class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th>学生姓名</th>
              <th>班级</th>
              <th>智育</th>
              <th>体育美育</th>
              <th>劳育</th>
              <th>德育</th>
              <th>总分</th>
              <th>状态</th>
              <th class="align-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredGrades" :key="item.id">
              <td>{{ item.student }}</td>
              <td>{{ item.className }}</td>
              <td><span class="score-text" :data-tone="getScoreTone(item.intellectual)">{{ item.intellectual }}</span></td>
              <td><span class="score-text" :data-tone="getScoreTone(item.sports)">{{ item.sports }}</span></td>
              <td><span class="score-text" :data-tone="getScoreTone(item.labor)">{{ item.labor }}</span></td>
              <td><span class="score-text" :data-tone="getScoreTone(item.moral)">{{ item.moral }}</span></td>
              <td><strong class="score-total">{{ item.total }}</strong></td>
              <td>
                <span class="status-chip" :data-status="item.status === 'confirmed' ? 'approved' : 'pending'">
                  {{ item.status === 'confirmed' ? '已确认' : '待确认' }}
                </span>
              </td>
              <td class="align-right action-links">
                <button type="button" class="text-button">查看</button>
                <button type="button" class="text-button">编辑</button>
                <button type="button" class="text-button danger-text">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </section>
</template>
