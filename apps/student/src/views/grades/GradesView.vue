<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Download,
  Filter,
  PieChart,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-vue-next'

const activeTab = ref('all')
const submitEnabled = ref(false)
const isSubmitting = ref(false)
const submitSuccess = ref(false)

const gradeCategories = [
  { id: 'all', label: '全部成绩', icon: BarChart3 },
  { id: 'intellectual', label: '智育成绩', icon: BookOpen },
  { id: 'sports', label: '体育美育', icon: Activity },
  { id: 'labor', label: '劳育成绩', icon: Trophy },
  { id: 'moral', label: '德育成绩', icon: Award },
]

const grades = ref([
  { id: 1, category: 'intellectual', course: '高等数学', score: 95, credit: 4, semester: '2023-2024-1' },
  { id: 2, category: 'intellectual', course: '数据结构', score: 88, credit: 4, semester: '2023-2024-1' },
  { id: 3, category: 'intellectual', course: '计算机网络', score: 92, credit: 3, semester: '2023-2024-2' },
  { id: 4, category: 'sports', course: '体育（篮球）', score: 85, credit: 1, semester: '2023-2024-1' },
  { id: 5, category: 'sports', course: '体育（游泳）', score: 90, credit: 1, semester: '2023-2024-2' },
  { id: 6, category: 'labor', course: '劳动实践', score: 95, credit: 2, semester: '2023-2024-1' },
  { id: 7, category: 'labor', course: '志愿服务', score: 92, credit: 1, semester: '2023-2024-2' },
  { id: 8, category: 'moral', course: '思想道德修养', score: 90, credit: 2, semester: '2023-2024-1' },
])

const filteredGrades = computed(() => {
  if (activeTab.value === 'all') {
    return grades.value
  }
  return grades.value.filter((grade) => grade.category === activeTab.value)
})

const totalCredits = computed(() => filteredGrades.value.reduce((sum, grade) => sum + grade.credit, 0))
const avgScore = computed(() => {
  if (filteredGrades.value.length === 0) {
    return '0.0'
  }
  const weightedSum = filteredGrades.value.reduce((sum, grade) => sum + grade.score * grade.credit, 0)
  return (weightedSum / totalCredits.value).toFixed(1)
})

const gradeDistribution = computed(() => {
  const distribution: Record<string, number> = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '<60': 0 }
  filteredGrades.value.forEach((grade) => {
    if (grade.score >= 90) distribution['90-100'] += 1
    else if (grade.score >= 80) distribution['80-89'] += 1
    else if (grade.score >= 70) distribution['70-79'] += 1
    else if (grade.score >= 60) distribution['60-69'] += 1
    else distribution['<60'] += 1
  })
  return distribution
})

const handleSubmitTotal = async () => {
  isSubmitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))
  isSubmitting.value = false
  submitSuccess.value = true
  setTimeout(() => {
    submitSuccess.value = false
  }, 3000)
}
</script>

<template>
  <section class="space-y-8">
    <header>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">已审核成绩</h1>
          <p class="mt-1 text-gray-500">查看辅导员审核通过的成绩详情</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="flex items-center gap-2 rounded-xl px-4 py-2 text-gray-600 transition-all hover:bg-gray-100">
            <Filter class="h-4 w-4" />
            <span class="text-sm">筛选</span>
          </button>
          <button class="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600">
            <Download class="h-4 w-4" />
            <span class="text-sm">导出成绩</span>
          </button>
          <button
            class="flex items-center gap-2 rounded-xl px-6 py-2 font-medium transition-all"
            :class="submitEnabled && !isSubmitting ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg' : 'cursor-not-allowed bg-gray-200 text-gray-400'"
            :disabled="!submitEnabled || isSubmitting"
            @click="handleSubmitTotal"
          >
            <span v-if="isSubmitting" class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            <span>{{ isSubmitting ? '提交中...' : submitEnabled ? '提交学年总成绩' : '成绩提交未开放' }}</span>
          </button>
        </div>
      </div>

      <div v-if="submitSuccess" class="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div>
          <p class="font-medium text-green-800">学年总成绩提交成功</p>
          <p class="text-sm text-green-600">您的成绩已提交，请等待最终审核</p>
        </div>
      </div>

      <div v-if="!submitEnabled" class="mt-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <svg class="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <p class="font-medium text-gray-700">成绩提交尚未开放</p>
          <p class="text-sm text-gray-500">请等待管理员开放成绩提交权限</p>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-4 gap-6">
      <div class="card-shadow rounded-2xl bg-white p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="mb-1 text-sm text-gray-500">平均成绩</p>
            <p class="text-3xl font-bold text-blue-600">{{ avgScore }}</p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <TrendingUp class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div class="card-shadow rounded-2xl bg-white p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="mb-1 text-sm text-gray-500">已修学分</p>
            <p class="text-3xl font-bold text-green-600">{{ totalCredits }}</p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
            <Award class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
      <div class="card-shadow rounded-2xl bg-white p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="mb-1 text-sm text-gray-500">课程数量</p>
            <p class="text-3xl font-bold text-purple-600">{{ filteredGrades.length }}</p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
            <BookOpen class="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
      <div class="card-shadow rounded-2xl bg-white p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="mb-1 text-sm text-gray-500">优秀率</p>
            <p class="text-3xl font-bold text-orange-600">75%</p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
            <PieChart class="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button
        v-for="tab in gradeCategories"
        :key="tab.id"
        class="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all"
        :class="activeTab === tab.id ? 'bg-blue-500 text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'"
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" class="h-4 w-4" />
        {{ tab.label }}
      </button>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="card-shadow col-span-2 overflow-hidden rounded-2xl bg-white">
        <div class="border-b border-gray-100 p-6">
          <h2 class="font-semibold text-gray-800">成绩列表</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">课程名称</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">类别</th>
                <th class="px-6 py-4 text-center text-sm font-medium text-gray-500">学分</th>
                <th class="px-6 py-4 text-center text-sm font-medium text-gray-500">成绩</th>
                <th class="px-6 py-4 text-left text-sm font-medium text-gray-500">学期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="grade in filteredGrades" :key="grade.id" class="border-b border-gray-50 hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-800">{{ grade.course }}</td>
                <td class="px-6 py-4">
                  <span class="rounded-full px-2 py-1 text-xs font-medium" :class="grade.category === 'intellectual' ? 'bg-blue-100 text-blue-700' : grade.category === 'sports' ? 'bg-orange-100 text-orange-700' : grade.category === 'labor' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'">
                    {{ grade.category === 'intellectual' ? '智育' : grade.category === 'sports' ? '体育美育' : grade.category === 'labor' ? '劳育' : '德育' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center text-gray-600">{{ grade.credit }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="font-semibold" :class="grade.score >= 90 ? 'text-green-600' : grade.score >= 80 ? 'text-blue-600' : grade.score >= 60 ? 'text-orange-600' : 'text-red-600'">
                    {{ grade.score }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ grade.semester }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-shadow rounded-2xl bg-white p-6">
        <h2 class="mb-6 font-semibold text-gray-800">成绩分布</h2>
        <div class="space-y-4">
          <div v-for="(count, range) in gradeDistribution" :key="range" class="flex items-center gap-3">
            <div class="flex-1">
              <div class="mb-1 flex items-center justify-between">
                <span class="text-sm text-gray-600">{{ range }}</span>
                <span class="text-sm font-medium text-gray-800">{{ count }}</span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-gray-100">
                <div class="bg-gradient-primary h-full rounded-full transition-all duration-500" :style="{ width: `${(count / filteredGrades.length * 100) || 0}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 rounded-xl bg-blue-50 p-4">
          <div class="mb-2 flex items-center gap-2">
            <Target class="h-5 w-5 text-blue-600" />
            <span class="font-medium text-blue-800">综测排名</span>
          </div>
          <p class="text-2xl font-bold text-blue-600">专业第 15 名</p>
          <p class="mt-1 text-sm text-blue-600">共 256 人</p>
        </div>
      </div>
    </div>
  </section>
</template>
