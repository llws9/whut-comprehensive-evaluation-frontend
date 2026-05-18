<script setup lang="ts">
import { computed, ref } from 'vue'
import { Clock, Download, FileText, Filter, FolderOpen, Search, Star, User } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'

interface PublicAttachment {
  id: number
  name: string
  category: string
  tags: string[]
  size: string
  uploadTime: string
  downloads: number
  isRecommended: boolean
  year: string
}

const authStore = useAuthStore()
const searchKeyword = ref('')
const selectedCategory = ref('all')
const selectedYear = ref('all')
const selectedTags = ref<string[]>([])
const displayName = computed(() => authStore.session?.userName ?? '学生用户')

const categories = [
  { id: 'all', name: '全部类别' },
  { id: 'certificate', name: '证书类' },
  { id: 'report', name: '报告类' },
  { id: 'document', name: '文档类' },
  { id: 'image', name: '图片类' },
]

const tags = ['科技创新', '社会实践', '体育比赛', '志愿者服务', '学术论文', '荣誉证书']

const years = [
  { id: 'all', name: '全部学年' },
  { id: '2024-2025', name: '2024-2025学年' },
  { id: '2023-2024', name: '2023-2024学年' },
  { id: '2022-2023', name: '2022-2023学年' },
]

const publicAttachments = ref<PublicAttachment[]>([
  { id: 1, name: '全国大学生数学建模竞赛证书模板.pdf', category: 'certificate', tags: ['科技创新'], size: '2.3 MB', uploadTime: '2024-03-15', downloads: 156, isRecommended: true, year: '2024-2025' },
  { id: 2, name: '社会实践报告模板.docx', category: 'report', tags: ['社会实践'], size: '1.2 MB', uploadTime: '2024-03-14', downloads: 89, isRecommended: true, year: '2024-2025' },
  { id: 3, name: '体育比赛获奖证明模板.pdf', category: 'certificate', tags: ['体育比赛'], size: '856 KB', uploadTime: '2024-03-13', downloads: 234, isRecommended: false, year: '2024-2025' },
  { id: 4, name: '志愿者服务时长证明.docx', category: 'document', tags: ['志愿者服务'], size: '456 KB', uploadTime: '2024-03-12', downloads: 567, isRecommended: true, year: '2024-2025' },
  { id: 5, name: '学术论文模板.docx', category: 'document', tags: ['学术论文'], size: '3.1 MB', uploadTime: '2023-11-15', downloads: 432, isRecommended: true, year: '2023-2024' },
  { id: 6, name: '荣誉证书模板.pdf', category: 'certificate', tags: ['荣誉证书'], size: '1.8 MB', uploadTime: '2023-10-20', downloads: 178, isRecommended: false, year: '2023-2024' },
  { id: 7, name: '科技创新竞赛报名表.docx', category: 'document', tags: ['科技创新'], size: '512 KB', uploadTime: '2022-09-01', downloads: 321, isRecommended: false, year: '2022-2023' },
  { id: 8, name: '校园活动照片示例.jpg', category: 'image', tags: ['社会实践'], size: '2.5 MB', uploadTime: '2022-11-10', downloads: 67, isRecommended: false, year: '2022-2023' },
])

const filteredAttachments = computed(() => {
  return publicAttachments.value.filter((attachment) => {
    if (searchKeyword.value && !attachment.name.includes(searchKeyword.value)) return false
    if (selectedCategory.value !== 'all' && attachment.category !== selectedCategory.value) return false
    if (selectedYear.value !== 'all' && attachment.year !== selectedYear.value) return false
    if (selectedTags.value.length > 0 && !selectedTags.value.some((tag) => attachment.tags.includes(tag))) return false
    return true
  })
})

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

const downloadAttachment = (_attachment: PublicAttachment) => {
  // 预览环境保留交互入口，真实下载后续接入接口。
}
</script>

<template>
  <section class="space-y-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">公共附件池</h1>
        <p class="mt-1 text-gray-500">查看和下载公共附件模板</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm">
          <User class="h-5 w-5 text-gray-500" />
          <span class="text-sm font-medium text-gray-700">{{ displayName }}</span>
        </div>
      </div>
    </header>

    <div class="card-shadow rounded-2xl bg-white p-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="relative max-w-md min-w-[250px] flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索附件名称"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex items-center gap-2">
          <Filter class="h-4 w-4 text-gray-400" />
          <select v-model="selectedCategory" class="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <select v-model="selectedYear" class="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option v-for="year in years" :key="year.id" :value="year.id">{{ year.name }}</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          v-for="tag in tags"
          :key="tag"
          class="rounded-full px-3 py-1.5 text-sm font-medium transition-all"
          :class="selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <div
        v-for="attachment in filteredAttachments"
        :key="attachment.id"
        class="card-shadow group cursor-pointer rounded-2xl bg-white p-5 transition-all duration-300 hover:shadow-lg"
      >
        <div class="mb-4 flex items-start justify-between">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <FileText class="h-6 w-6 text-blue-600" />
          </div>
          <div class="flex items-center gap-1">
            <Star v-if="attachment.isRecommended" class="h-5 w-5 fill-yellow-500 text-yellow-500" />
          </div>
        </div>

        <h3 class="mb-2 line-clamp-2 font-semibold text-gray-800 transition-colors group-hover:text-blue-600">{{ attachment.name }}</h3>

        <div class="mb-3 flex flex-wrap gap-1.5">
          <span v-for="tag in attachment.tags" :key="tag" class="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {{ tag }}
          </span>
        </div>

        <div class="flex items-center justify-between text-sm text-gray-500">
          <div class="flex items-center gap-4">
            <span>{{ attachment.size }}</span>
            <span>{{ attachment.downloads }} 下载</span>
          </div>
          <button class="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600" @click="downloadAttachment(attachment)">
            <Download class="h-5 w-5" />
          </button>
        </div>

        <div class="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
          <Clock class="h-4 w-4 text-gray-400" />
          <span class="text-xs text-gray-400">{{ attachment.uploadTime }} 上传</span>
        </div>
      </div>
    </div>

    <div v-if="filteredAttachments.length === 0" class="py-16 text-center">
      <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <FolderOpen class="h-10 w-10 text-gray-400" />
      </div>
      <p class="text-gray-500">暂无符合条件的附件</p>
    </div>
  </section>
</template>
