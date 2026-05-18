<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Trophy,
  User,
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const activeDistributionTab = ref('智育')
const displayName = computed(() => authStore.session?.userName ?? '张三')

const stats = [
  { label: '智育成绩', value: '92.5', icon: BookOpen, color: 'bg-blue-100 text-blue-600', trend: '+3.2', trendClass: 'text-green-500' },
  { label: '体育美育', value: '88.0', icon: Activity, color: 'bg-orange-100 text-orange-600', trend: '+1.5', trendClass: 'text-green-500' },
  { label: '劳育成绩', value: '90.0', icon: Trophy, color: 'bg-green-100 text-green-600', trend: '+2.0', trendClass: 'text-green-500' },
  { label: '德育成绩', value: '95.0', icon: Award, color: 'bg-purple-100 text-purple-600', trend: '+1.0', trendClass: 'text-green-500' }
]

const recentApplications = [
  { id: 1, type: '科技创新竞赛', status: 'approved', date: '2024-03-15', score: '+5.0' },
  { id: 2, type: '志愿者服务', status: 'pending', date: '2024-03-18', score: '+3.0' },
  { id: 3, type: '社会实践', status: 'approved', date: '2024-03-10', score: '+4.0' },
  { id: 4, type: '体育比赛', status: 'rejected', date: '2024-03-08', score: '+2.0' }
]

const upcomingActivities = [
  { id: 1, name: '校园运动会', date: '2024-04-01', type: '体育' },
  { id: 2, name: '科技创新大赛', date: '2024-04-15', type: '智育' },
  { id: 3, name: '志愿者招募', date: '2024-04-20', type: '德育' }
]

const getStatusClass = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-700'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved':
      return '已通过'
    case 'pending':
      return '待审核'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知'
  }
}
</script>

<template>
  <section class="space-y-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">欢迎回来，{{ displayName }}</h1>
        <p class="mt-1 text-gray-500">今天是 2024年3月18日 星期一</p>
      </div>
      <div class="flex items-center gap-4">
        <button class="rounded-xl p-2 transition-colors hover:bg-gray-100">
          <Clock class="h-5 w-5 text-gray-600" />
        </button>
        <div class="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-cyan-100">
            <User class="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm font-medium text-gray-800">{{ displayName }}</p>
            <p class="text-xs text-gray-500">计算机2101班</p>
          </div>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="card-shadow group cursor-pointer rounded-2xl bg-white p-6 transition-all duration-300 hover:card-shadow-hover"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="mb-1 text-sm text-gray-500">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-gray-800 transition-colors group-hover:text-blue-600">
              {{ stat.value }}
            </p>
          </div>
          <div :class="['rounded-xl p-3', stat.color]">
            <component :is="stat.icon" class="h-6 w-6" />
          </div>
        </div>
        <div :class="['mt-3 flex items-center gap-1 text-sm', stat.trendClass]">
          <TrendingUp class="h-4 w-4" />
          <span>{{ stat.trend }} 较上学期</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div class="card-shadow col-span-2 rounded-2xl bg-white p-6">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">申请记录</h2>
          <button class="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700" @click="router.push({ name: 'StudentHistory' })">
            查看全部
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
        <div class="space-y-4">
          <div
            v-for="app in recentApplications"
            :key="app.id"
            class="flex items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
          >
            <div class="flex items-center gap-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Target class="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ app.type }}</p>
                <p class="text-sm text-gray-500">{{ app.date }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium text-green-600">{{ app.score }}</span>
              <span :class="['rounded-full px-3 py-1 text-sm font-medium', getStatusClass(app.status)]">
                {{ getStatusText(app.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-shadow rounded-2xl bg-white p-6">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-800">近期活动</h2>
          <button class="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700" @click="router.push({ name: 'StudentApplication' })">
            报名
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
        <div class="space-y-4">
          <div
            v-for="activity in upcomingActivities"
            :key="activity.id"
            class="flex cursor-pointer items-center gap-4 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
          >
            <div class="bg-gradient-primary flex h-12 w-12 items-center justify-center rounded-xl">
              <Calendar class="h-6 w-6 text-white" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ activity.name }}</p>
              <p class="text-sm text-gray-500">{{ activity.date }}</p>
            </div>
            <span class="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
              {{ activity.type }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="card-shadow rounded-2xl bg-white p-6">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">成绩分布</h2>
        <div class="flex items-center gap-2">
          <button
            v-for="tab in ['智育', '体育美育', '劳育', '德育']"
            :key="tab"
            class="rounded-lg px-4 py-2 text-sm font-medium transition-all"
            :class="activeDistributionTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="activeDistributionTab = tab"
          >
            {{ tab }}
          </button>
        </div>
      </div>
      <div class="flex h-64 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
        <div class="text-center">
          <BookOpen class="mx-auto mb-3 h-16 w-16 text-blue-300" />
          <p class="text-gray-400">成绩图表展示区域</p>
          <p class="text-sm text-gray-400">{{ activeDistributionTab }}成绩分布可视化</p>
        </div>
      </div>
    </div>
  </section>
</template>
