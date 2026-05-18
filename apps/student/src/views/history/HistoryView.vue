<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download, Edit, Eye, FileText, Filter, Search, Trash2 } from 'lucide-vue-next'

import {
  applicationHistoryRecords,
  filterApplicationHistoryRecords,
  type StudentApplicationRecordStatus,
} from '@/data/student-application-history'
import { categoryOptions, type CategoryId } from '@/data/student-application-shared'

const searchKeyword = ref('')
const activeCategory = ref<CategoryId | 'all'>('all')

const visibleRecords = computed(() => {
  return filterApplicationHistoryRecords(applicationHistoryRecords, {
    categoryId: activeCategory.value,
    keyword: searchKeyword.value,
  })
})

const getStatusClass = (status: StudentApplicationRecordStatus) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-700'
    case 'monitor_approved':
      return 'bg-blue-100 text-blue-700'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const getStatusText = (status: StudentApplicationRecordStatus) => {
  switch (status) {
    case 'approved':
      return '辅导员已审核'
    case 'monitor_approved':
      return '班长已审批'
    case 'pending':
      return '待审核'
    case 'rejected':
      return '已拒绝'
    default:
      return '草稿'
  }
}

const canEditRecord = (status: StudentApplicationRecordStatus) => status === 'draft' || status === 'rejected'
</script>

<template>
  <section class="space-y-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">申请记录</h1>
        <p class="mt-1 text-gray-500">按申请记录维度查看标题、指标、学年学期、分值与审核状态</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 rounded-xl px-4 py-2 text-gray-600 transition-all hover:bg-gray-100">
          <Filter class="h-4 w-4" />
          <span class="text-sm">筛选</span>
        </button>
        <button class="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-white transition-all hover:bg-blue-600">
          <Download class="h-4 w-4" />
          <span class="text-sm">导出记录</span>
        </button>
      </div>
    </header>

    <div class="card-shadow rounded-2xl bg-white p-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex flex-wrap items-center gap-2">
          <button
            class="relative overflow-hidden rounded-xl px-6 py-3 font-medium transition-all"
            :class="activeCategory === 'all' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="activeCategory = 'all'"
          >
            全部
          </button>
          <button
            v-for="category in categoryOptions"
            :key="category.id"
            class="relative overflow-hidden rounded-xl px-6 py-3 font-medium transition-all"
            :class="activeCategory === category.id ? `${category.bgGradient} text-white shadow-lg shadow-opacity-30` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="activeCategory = category.id"
          >
            <span class="relative z-10">{{ category.label }}</span>
          </button>
        </div>

        <div class="flex flex-1 justify-end">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索申请标题、指标或学年学期"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="visibleRecords.length > 0" class="card-shadow overflow-hidden rounded-2xl bg-white">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="min-w-[220px] px-6 py-4 text-left text-sm font-semibold text-gray-700">申请标题</th>
              <th class="min-w-[180px] px-6 py-4 text-left text-sm font-semibold text-gray-700">申请大类 / 指标</th>
              <th class="w-36 px-6 py-4 text-center text-sm font-semibold text-gray-700">学年 / 学期</th>
              <th class="w-28 px-6 py-4 text-center text-sm font-semibold text-gray-700">申请分值</th>
              <th class="w-32 px-6 py-4 text-center text-sm font-semibold text-gray-700">状态</th>
              <th class="w-44 px-6 py-4 text-center text-sm font-semibold text-gray-700">最近更新时间</th>
              <th class="w-32 px-6 py-4 text-center text-sm font-semibold text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="record in visibleRecords"
              :key="record.applicationId"
              class="border-b border-gray-100 transition-all hover:bg-gray-50/50"
            >
              <td class="px-6 py-4">
                <div class="flex items-start gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText class="h-5 w-5" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-medium text-gray-800">{{ record.title }}</p>
                    <p class="mt-1 text-xs text-gray-500">申请单号：{{ record.applicationId }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="font-medium text-gray-800">{{ record.itemTitle }}</p>
                <p class="mt-1 text-sm text-gray-500">{{ record.categoryLabel }}</p>
              </td>
              <td class="px-6 py-4 text-center text-sm text-gray-700">
                {{ record.academicYear }}<br />
                <span class="text-gray-500">{{ record.term }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">{{ record.appliedPoints }} 分</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span :class="['rounded-full px-3 py-1 text-sm font-medium', getStatusClass(record.status)]">
                  {{ getStatusText(record.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-center text-sm text-gray-600">{{ record.updatedAt }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button class="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600" title="查看">
                    <Eye class="h-4 w-4" />
                  </button>
                  <button
                    v-if="canEditRecord(record.status)"
                    class="rounded-lg p-2 text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-600"
                    title="修改"
                  >
                    <Edit class="h-4 w-4" />
                  </button>
                  <button
                    v-if="canEditRecord(record.status)"
                    class="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                    title="删除"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="card-shadow rounded-2xl bg-white p-12 text-center">
      <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <FileText class="h-10 w-10 text-gray-400" />
      </div>
      <h3 class="mb-2 text-lg font-medium text-gray-800">暂无申请记录</h3>
      <p class="text-gray-500">当前筛选条件下未找到匹配的申请记录</p>
    </div>
  </section>
</template>
