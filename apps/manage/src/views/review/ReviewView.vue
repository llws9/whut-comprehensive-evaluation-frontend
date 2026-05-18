<script setup lang="ts">
import { computed, ref } from 'vue'

type ReviewStatus = 'pending' | 'approved' | 'rejected'

type ApplicationRecord = {
  id: number
  student: string
  className: string
  grade: string
  category: string
  type: string
  score: string
  date: string
  status: ReviewStatus
  description: string
  documents: string[]
}

const selectedYear = ref('2024-2025')
const selectedGrade = ref('')
const selectedCategory = ref('')
const searchKeyword = ref('')
const activeStatusFilter = ref<'all' | ReviewStatus>('all')
const selectedApplication = ref<ApplicationRecord | null>(null)

const years = ['2024-2025', '2023-2024', '2022-2023']
const gradeOptions = ['', '研一', '研二', '研三']
const categoryOptions = ['', '智育', '体育与美育', '劳育']

const applications = ref<ApplicationRecord[]>([
  { id: 1, student: '张三', className: '计算机2101', grade: '研一', category: '智育', type: '科技创新竞赛', score: '+5.0', date: '2024-03-18', status: 'pending', description: '参加省级科技创新竞赛，获得二等奖。', documents: ['获奖证书.pdf', '项目报告.docx'] },
  { id: 2, student: '李四', className: '软件工程2102', grade: '研二', category: '劳育', type: '社会实践', score: '+4.0', date: '2024-03-17', status: 'pending', description: '参加暑期社会实践活动，服务社区居民。', documents: ['实践证明.pdf'] },
  { id: 3, student: '王五', className: '物联网2101', grade: '研一', category: '体育与美育', type: '体育比赛', score: '+3.0', date: '2024-03-16', status: 'approved', description: '参加校运动会并获得名次。', documents: ['获奖证书.pdf'] },
  { id: 4, student: '赵六', className: '计算机2102', grade: '研三', category: '劳育', type: '志愿服务', score: '+3.0', date: '2024-03-15', status: 'pending', description: '参加校园志愿者服务活动，累计服务 20 小时。', documents: ['服务证明.pdf'] },
  { id: 5, student: '钱七', className: '软件工程2101', grade: '研二', category: '智育', type: '学术论文', score: '+6.0', date: '2024-03-14', status: 'rejected', description: '发表 SCI 论文一篇。', documents: ['论文.pdf', '录用通知.pdf'] }
])

const filteredApplications = computed(() =>
  applications.value.filter((item) => {
    if (selectedYear.value && !item.date.startsWith(selectedYear.value.split('-')[0])) {
      return false
    }
    if (selectedGrade.value && item.grade !== selectedGrade.value) {
      return false
    }
    if (selectedCategory.value && item.category !== selectedCategory.value) {
      return false
    }
    if (activeStatusFilter.value !== 'all' && item.status !== activeStatusFilter.value) {
      return false
    }
    if (searchKeyword.value && !item.student.includes(searchKeyword.value)) {
      return false
    }
    return true
  })
)

const pendingCount = computed(() => applications.value.filter((item) => item.status === 'pending').length)
const approvedCount = computed(() => applications.value.filter((item) => item.status === 'approved').length)
const rejectedCount = computed(() => applications.value.filter((item) => item.status === 'rejected').length)

const getStatusText = (status: ReviewStatus) => {
  if (status === 'approved') return '已通过'
  if (status === 'rejected') return '已拒绝'
  return '待审核'
}

const approveApplication = (id: number) => {
  const item = applications.value.find((record) => record.id === id)
  if (item) {
    item.status = 'approved'
  }
}

const rejectApplication = (id: number) => {
  const item = applications.value.find((record) => record.id === id)
  if (item) {
    item.status = 'rejected'
  }
}

const approveAll = () => {
  applications.value.forEach((item) => {
    if (item.status === 'pending') {
      item.status = 'approved'
    }
  })
}
</script>

<template>
  <section class="page-stack">
    <div class="page-hero compact-hero">
      <div>
        <p class="section-eyebrow">成绩审核</p>
        <p class="section-description">迁入旧审核页的统计区、筛选区、审核表格和详情弹层。</p>
      </div>
      <div class="hero-actions hero-actions-wrap">
        <button type="button" class="secondary-button">设置申请截止时间</button>
        <button type="button" class="secondary-button">停止成绩申请</button>
        <button v-if="pendingCount > 0" type="button" class="primary-button" @click="approveAll">一键通过</button>
      </div>
    </div>

    <div class="metrics-grid metrics-grid-4">
      <article class="metric-card" data-tone="warning">
        <p class="metric-label">待审核</p>
        <p class="metric-value">{{ pendingCount }}</p>
      </article>
      <article class="metric-card" data-tone="success">
        <p class="metric-label">已通过</p>
        <p class="metric-value">{{ approvedCount }}</p>
      </article>
      <article class="metric-card" data-tone="danger">
        <p class="metric-label">已拒绝</p>
        <p class="metric-value">{{ rejectedCount }}</p>
      </article>
      <article class="metric-card" data-tone="primary">
        <p class="metric-label">总申请</p>
        <p class="metric-value">{{ applications.length }}</p>
      </article>
    </div>

    <section class="surface-card">
      <div class="filter-grid review-filter-grid">
        <label class="form-field">
          <span class="field-label">学年</span>
          <select v-model="selectedYear" class="field-input field-select">
            <option v-for="item in years" :key="item" :value="item">{{ item }}学年</option>
          </select>
        </label>
        <label class="form-field">
          <span class="field-label">年级</span>
          <select v-model="selectedGrade" class="field-input field-select">
            <option value="">全部年级</option>
            <option v-for="item in gradeOptions.filter(Boolean)" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label class="form-field">
          <span class="field-label">申请类别</span>
          <select v-model="selectedCategory" class="field-input field-select">
            <option value="">全部类别</option>
            <option v-for="item in categoryOptions.filter(Boolean)" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label class="form-field filter-search">
          <span class="field-label">搜索</span>
          <input v-model="searchKeyword" type="text" class="field-input" placeholder="搜索学生姓名" />
        </label>
      </div>

      <div class="tab-group tab-group-spaced">
        <button type="button" class="tab-button" :class="{ 'is-active': activeStatusFilter === 'all' }" @click="activeStatusFilter = 'all'">全部</button>
        <button type="button" class="tab-button" :class="{ 'is-active': activeStatusFilter === 'pending' }" @click="activeStatusFilter = 'pending'">待审核</button>
        <button type="button" class="tab-button" :class="{ 'is-active': activeStatusFilter === 'approved' }" @click="activeStatusFilter = 'approved'">已通过</button>
        <button type="button" class="tab-button" :class="{ 'is-active': activeStatusFilter === 'rejected' }" @click="activeStatusFilter = 'rejected'">已拒绝</button>
      </div>

      <div class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>学生姓名</th>
              <th>班级</th>
              <th>年级</th>
              <th>申请类别</th>
              <th>申请类型</th>
              <th>加分</th>
              <th>申请时间</th>
              <th>状态</th>
              <th class="align-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in filteredApplications" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.student }}</td>
              <td>{{ item.className }}</td>
              <td>{{ item.grade }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.score }}</td>
              <td>{{ item.date }}</td>
              <td>
                <span class="status-chip" :data-status="item.status">{{ getStatusText(item.status) }}</span>
              </td>
              <td class="align-right action-links">
                <button type="button" class="text-button" @click="selectedApplication = { ...item }">查看</button>
                <button v-if="item.status === 'pending'" type="button" class="text-button" @click="approveApplication(item.id)">通过</button>
                <button v-if="item.status === 'pending'" type="button" class="text-button danger-text" @click="rejectApplication(item.id)">拒绝</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selectedApplication" class="modal-backdrop" @click.self="selectedApplication = null">
      <div class="modal-card">
        <div class="card-header">
          <div>
            <h3 class="card-title">申请详情</h3>
            <p class="card-subtitle">{{ selectedApplication.student }} · {{ selectedApplication.className }} · {{ selectedApplication.grade }}</p>
          </div>
          <button type="button" class="secondary-button" @click="selectedApplication = null">关闭</button>
        </div>
        <div class="detail-grid">
          <article class="detail-item">
            <span class="detail-label">申请类别</span>
            <strong>{{ selectedApplication.category }}</strong>
          </article>
          <article class="detail-item">
            <span class="detail-label">申请类型</span>
            <strong>{{ selectedApplication.type }}</strong>
          </article>
          <article class="detail-item">
            <span class="detail-label">加分分值</span>
            <strong>{{ selectedApplication.score }}</strong>
          </article>
          <article class="detail-item">
            <span class="detail-label">申请时间</span>
            <strong>{{ selectedApplication.date }}</strong>
          </article>
        </div>
        <article class="surface-subcard">
          <span class="detail-label">申请描述</span>
          <p>{{ selectedApplication.description }}</p>
        </article>
        <article class="surface-subcard">
          <span class="detail-label">附件材料</span>
          <ul class="simple-list">
            <li v-for="doc in selectedApplication.documents" :key="doc">{{ doc }}</li>
          </ul>
        </article>
        <div class="modal-actions">
          <button
            v-if="selectedApplication.status === 'pending'"
            type="button"
            class="secondary-button"
            @click="rejectApplication(selectedApplication.id); selectedApplication = null"
          >
            拒绝申请
          </button>
          <button
            v-if="selectedApplication.status === 'pending'"
            type="button"
            class="primary-button"
            @click="approveApplication(selectedApplication.id); selectedApplication = null"
          >
            审核通过
          </button>
          <button v-else type="button" class="primary-button" @click="selectedApplication = null">关闭详情</button>
        </div>
      </div>
    </div>
  </section>
</template>
