<script setup lang="ts">
type StatCard = {
  label: string
  value: string
  trend: string
  tone: 'primary' | 'success' | 'warning' | 'danger'
}

type ApplicationRecord = {
  id: number
  student: string
  className: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  date: string
}

const stats: StatCard[] = [
  { label: '学生总数', value: '2,456', trend: '+12%', tone: 'primary' },
  { label: '待审核申请', value: '45', trend: '+3', tone: 'warning' },
  { label: '已审核通过', value: '1,832', trend: '+8%', tone: 'success' },
  { label: '异常记录', value: '8', trend: '-2', tone: 'danger' }
]

const recentApplications: ApplicationRecord[] = [
  { id: 1, student: '张三', className: '计算机2101', type: '科技创新', status: 'pending', date: '10分钟前' },
  { id: 2, student: '李四', className: '软件工程2102', type: '社会实践', status: 'pending', date: '25分钟前' },
  { id: 3, student: '王五', className: '物联网2101', type: '体育比赛', status: 'approved', date: '1小时前' },
  { id: 4, student: '赵六', className: '计算机2102', type: '志愿服务', status: 'rejected', date: '2小时前' }
]

const reportStatus = [
  { label: '智育', ready: true },
  { label: '体育美育', ready: false },
  { label: '劳育', ready: false }
]

const hotTopics = [
  { name: '科技创新竞赛', value: 128 },
  { name: '社会实践', value: 96 },
  { name: '体育比赛', value: 85 },
  { name: '志愿者服务', value: 72 },
  { name: '学术论文', value: 64 }
]

const getStatusText = (status: ApplicationRecord['status']) => {
  if (status === 'approved') return '已通过'
  if (status === 'rejected') return '已拒绝'
  return '待审核'
}
</script>

<template>
  <section class="page-stack">
    <div class="page-hero">
      <div>
        <p class="section-eyebrow">工作台概览</p>
        <h2 class="section-title">欢迎回来，管理员</h2>
        <p class="section-description">这里保留了旧工作台的核心内容区：概览指标、报告入口、申请趋势和待审核列表。</p>
      </div>
      <div class="hero-actions">
        <button type="button" class="secondary-button">刷新数据</button>
        <button type="button" class="primary-button">导出数据</button>
      </div>
    </div>

    <div class="metrics-grid metrics-grid-4">
      <article v-for="item in stats" :key="item.label" class="metric-card" :data-tone="item.tone">
        <p class="metric-label">{{ item.label }}</p>
        <p class="metric-value">{{ item.value }}</p>
        <p class="metric-trend">{{ item.trend }}</p>
      </article>
    </div>

    <div class="dashboard-grid">
      <section class="surface-card">
        <div class="card-header">
          <div>
            <h3 class="card-title">成绩报告</h3>
            <p class="card-subtitle">保留旧页面的报告生成区入口</p>
          </div>
          <button type="button" class="secondary-button">生成所有</button>
        </div>
        <div class="report-grid">
          <article v-for="report in reportStatus" :key="report.label" class="report-card">
            <p class="report-title">{{ report.label }}</p>
            <p class="report-state" :data-ready="report.ready">{{ report.ready ? '已生成，可下载' : '待生成' }}</p>
            <button type="button" class="text-button">{{ report.ready ? '下载报告' : '立即生成' }}</button>
          </article>
        </div>
      </section>

      <section class="surface-card">
        <div class="card-header">
          <div>
            <h3 class="card-title">热门申请 TOP5</h3>
            <p class="card-subtitle">按旧 dashboard 的内容口径保留排行区</p>
          </div>
        </div>
        <ol class="rank-list">
          <li v-for="topic in hotTopics" :key="topic.name" class="rank-item">
            <span>{{ topic.name }}</span>
            <strong>{{ topic.value }}</strong>
          </li>
        </ol>
      </section>
    </div>

    <section class="surface-card">
      <div class="card-header">
        <div>
          <h3 class="card-title">近一周学生申请数据变化</h3>
          <p class="card-subtitle">原图表区域先保留为内容占位，后续接真实图表组件</p>
        </div>
        <div class="tab-group">
          <button type="button" class="tab-button is-active">全部</button>
          <button type="button" class="tab-button">智育</button>
          <button type="button" class="tab-button">体育美育</button>
          <button type="button" class="tab-button">劳育</button>
        </div>
      </div>
      <div class="chart-placeholder">
        <p>申请数据趋势可视化区域</p>
        <span>保留旧页面的信息层级，不复制旧顶部壳代码</span>
      </div>
    </section>

    <section class="surface-card">
      <div class="card-header">
        <div>
          <h3 class="card-title">待审核申请</h3>
          <p class="card-subtitle">抽取旧 dashboard 的列表内容区</p>
        </div>
        <div class="toolbar-actions">
          <button type="button" class="secondary-button">筛选</button>
          <button type="button" class="secondary-button">搜索</button>
        </div>
      </div>
      <div class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th>学生姓名</th>
              <th>班级</th>
              <th>申请类型</th>
              <th>状态</th>
              <th>提交时间</th>
              <th class="align-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in recentApplications" :key="item.id">
              <td>{{ item.student }}</td>
              <td>{{ item.className }}</td>
              <td>{{ item.type }}</td>
              <td>
                <span class="status-chip" :data-status="item.status">{{ getStatusText(item.status) }}</span>
              </td>
              <td>{{ item.date }}</td>
              <td class="align-right action-links">
                <button type="button" class="text-button">通过</button>
                <button type="button" class="text-button danger-text">拒绝</button>
                <button type="button" class="text-button">详情</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="quick-actions-grid">
      <button type="button" class="quick-action-card" data-tone="primary">
        <span class="quick-action-title">导入成绩</span>
        <span class="quick-action-desc">批量导入学生成绩数据</span>
      </button>
      <button type="button" class="quick-action-card" data-tone="success">
        <span class="quick-action-title">导出数据</span>
        <span class="quick-action-desc">导出综测成绩报表</span>
      </button>
    </div>
  </section>
</template>
