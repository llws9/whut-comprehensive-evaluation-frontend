<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  FileText,
  FolderOpen,
  Heart,
  Search,
  Star,
  Target,
  Trash2,
  TreePine,
  Upload,
  User,
  XCircle,
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth'
import {
  categoryOptions,
  createCategoryIndexesSnapshot,
  type CategoryId,
  type ScoreOption,
  type SharedIndexItem,
} from '@/data/student-application-shared'

const authStore = useAuthStore()
const displayName = computed(() => authStore.session?.userName ?? '张三')

const selectedCategoryId = ref<CategoryId>('intellectual')
const categoryIndexes = createCategoryIndexesSnapshot()
const selectedIndexCode = ref('')
const selectedOptionCode = ref('')
const selectedFiles = ref<File[]>([])
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const showPublicAttachments = ref(false)
const searchPublicAttachments = ref('')

interface PublicAttachment {
  id: number
  name: string
  category: string
  tags: string[]
  size: string
  uploadTime: string
  downloads: number
  isRecommended: boolean
}

const publicAttachments = ref<PublicAttachment[]>([
  { id: 1, name: '全国大学生数学建模竞赛证书模板.pdf', category: 'certificate', tags: ['科技创新'], size: '2.3 MB', uploadTime: '2024-03-15', downloads: 156, isRecommended: true },
  { id: 2, name: '社会实践报告模板.docx', category: 'report', tags: ['社会实践'], size: '1.2 MB', uploadTime: '2024-03-14', downloads: 89, isRecommended: true },
  { id: 3, name: '体育比赛获奖证明模板.pdf', category: 'certificate', tags: ['体育比赛'], size: '856 KB', uploadTime: '2024-03-13', downloads: 234, isRecommended: false },
  { id: 4, name: '志愿者服务时长证明.docx', category: 'document', tags: ['志愿者服务'], size: '456 KB', uploadTime: '2024-03-12', downloads: 567, isRecommended: true },
  { id: 5, name: '学术论文模板.docx', category: 'document', tags: ['学术论文'], size: '3.1 MB', uploadTime: '2024-03-11', downloads: 432, isRecommended: true },
  { id: 6, name: '荣誉证书模板.pdf', category: 'certificate', tags: ['荣誉证书'], size: '1.8 MB', uploadTime: '2024-03-10', downloads: 178, isRecommended: false },
  { id: 7, name: '科技创新竞赛报名表.docx', category: 'document', tags: ['科技创新'], size: '512 KB', uploadTime: '2024-03-09', downloads: 321, isRecommended: false },
  { id: 8, name: '校园活动照片示例.jpg', category: 'image', tags: ['社会实践'], size: '2.5 MB', uploadTime: '2024-03-08', downloads: 67, isRecommended: false }
])

const selectedPublicAttachments = ref<PublicAttachment[]>([])

const filteredPublicAttachments = computed(() => {
  if (!searchPublicAttachments.value) {
    return publicAttachments.value
  }
  return publicAttachments.value.filter((attachment) => attachment.name.includes(searchPublicAttachments.value))
})

const formData = ref({
  title: '',
  description: '',
  score: '',
  date: '',
  location: '',
})

const recentApplications = [
  { id: 1, type: '科技创新竞赛', category: 'intellectual', status: 'approved', date: '2024-03-15', score: '+5.0' },
  { id: 2, type: '志愿者服务', category: 'labor', status: 'pending', date: '2024-03-18', score: '+3.0' },
  { id: 3, type: '校园运动会', category: 'sports', status: 'approved', date: '2024-03-10', score: '+4.0' },
  { id: 4, type: '文艺晚会演出', category: 'sports', status: 'rejected', date: '2024-03-08', score: '+2.0' },
]

const currentCategory = computed(() => categoryOptions.find((item) => item.id === selectedCategoryId.value) || categoryOptions[0])
const currentIndexes = computed(() => categoryIndexes[selectedCategoryId.value] || [])
const selectedIndexItem = computed<SharedIndexItem | null>(() => {
  return currentIndexes.value.find((item) => item.itemCode === selectedIndexCode.value) || null
})
const selectedOptions = computed<ScoreOption[]>(() => selectedIndexItem.value?.options || [])
const selectedScoreOption = computed<ScoreOption | null>(() => {
  return selectedOptions.value.find((option) => option.optionCode === selectedOptionCode.value) || null
})

const autoCalculatedScore = computed<number | null>(() => {
  if (!selectedScoreOption.value) {
    return null
  }
  if (selectedScoreOption.value.allowCustomPoints && selectedScoreOption.value.points === null) {
    return null
  }
  return selectedScoreOption.value.points
})

const isCustomScoreMode = computed(() => {
  return Boolean(selectedScoreOption.value?.allowCustomPoints && selectedScoreOption.value?.points === null)
})

const numericScoreValue = computed<number | null>(() => {
  if (!formData.value.score) {
    return null
  }
  const parsed = Number(formData.value.score)
  return Number.isFinite(parsed) ? parsed : null
})

const numericMaxPoints = computed<number | null>(() => selectedIndexItem.value?.maxPointsValue ?? null)
const exceedsMaxPoints = computed(() => {
  if (numericScoreValue.value === null || numericMaxPoints.value === null) {
    return false
  }
  return numericScoreValue.value > numericMaxPoints.value
})

const maxPointsWarningMessage = computed(() => {
  if (!exceedsMaxPoints.value || numericScoreValue.value === null || numericMaxPoints.value === null) {
    return ''
  }
  return `当前申请分数 ${numericScoreValue.value.toFixed(2)} 分，已超过该指标最高分值 ${numericMaxPoints.value.toFixed(2)} 分。预览页保持允许填写，真实提交时应以后端返回提示为准。`
})

const isScoreReadOnly = computed(() => Boolean(selectedScoreOption.value && !isCustomScoreMode.value))

watch(currentIndexes, (indexes) => {
  if (!indexes.length) {
    selectedIndexCode.value = ''
    return
  }
  if (!indexes.some((item) => item.itemCode === selectedIndexCode.value)) {
    selectedIndexCode.value = indexes[0].itemCode
  }
}, { immediate: true })

watch(selectedIndexItem, (item) => {
  const options = item?.options || []
  if (!options.length) {
    selectedOptionCode.value = ''
    return
  }
  if (!options.some((option) => option.optionCode === selectedOptionCode.value)) {
    selectedOptionCode.value = options[0].optionCode
  }
}, { immediate: true })

watch([selectedScoreOption, autoCalculatedScore], ([option, autoScore]) => {
  if (!option) {
    return
  }
  if (option.allowCustomPoints && option.points === null) {
    formData.value.score = ''
    return
  }
  formData.value.score = autoScore === null ? '' : String(autoScore)
}, { immediate: true })

const getCategoryIcon = (category: string) => {
  if (category === 'moral') return Heart
  if (category === 'intellectual') return BookOpen
  if (category === 'sports') return Activity
  if (category === 'labor') return TreePine
  return Target
}

const getCategoryColor = (category: string) => {
  if (category === 'moral') return 'bg-pink-500'
  if (category === 'intellectual') return 'bg-blue-500'
  if (category === 'sports') return 'bg-orange-500'
  if (category === 'labor') return 'bg-green-500'
  return 'bg-gray-500'
}

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
      return '草稿'
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(files)]
  }
}

const triggerFileUpload = () => {
  const fileInput = document.querySelector('.file-input-hidden') as HTMLInputElement | null
  fileInput?.click()
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const removePublicAttachment = (index: number) => {
  selectedPublicAttachments.value.splice(index, 1)
}

const selectPublicAttachment = (attachment: PublicAttachment) => {
  if (!selectedPublicAttachments.value.find((item) => item.id === attachment.id)) {
    selectedPublicAttachments.value.push({ ...attachment })
  }
}

const closePublicAttachmentsModal = () => {
  showPublicAttachments.value = false
  searchPublicAttachments.value = ''
}

const handleSubmit = async () => {
  if (!formData.value.title || !formData.value.description) {
    return
  }

  isSubmitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 1200))
  isSubmitting.value = false
  submitSuccess.value = true

  setTimeout(() => {
    submitSuccess.value = false
    formData.value = {
      title: '',
      description: '',
      score: '',
      date: '',
      location: '',
    }
    selectedFiles.value = []
    selectedPublicAttachments.value = []
  }, 2200)
}
</script>

<template>
  <section class="space-y-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">申请综测加分</h1>
        <p class="mt-1 text-gray-500">填写申请信息，提交相关证明材料</p>
      </div>
      <div class="flex items-center gap-3 pl-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-cyan-100">
          <User class="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p class="text-sm font-medium text-gray-800">{{ displayName }}</p>
          <p class="text-xs text-gray-500">计算机2101班</p>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-3 gap-8">
      <div class="col-span-2 space-y-6">
        <div class="card-shadow rounded-2xl bg-white p-6">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">申请流程</h2>
            <span class="text-sm text-gray-500">先选四大类，再选择对应指标</span>
          </div>

          <div class="space-y-6">
            <div>
              <div class="mb-4 flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</div>
                <div>
                  <h3 class="text-base font-semibold text-gray-800">请选择申请大类</h3>
                  <p class="text-sm text-gray-500">申请类型固定为德育、智育、体育与美育、劳育四大类</p>
                </div>
              </div>
              <div class="grid grid-cols-4 gap-4">
                <button
                  v-for="category in categoryOptions"
                  :key="category.id"
                  class="relative rounded-xl border-2 p-4 text-left transition-all duration-300"
                  :class="selectedCategoryId === category.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
                  @click="selectedCategoryId = category.id"
                >
                  <div :class="['mb-3 flex h-12 w-12 items-center justify-center rounded-xl', getCategoryColor(category.id)]">
                    <component :is="getCategoryIcon(category.id)" class="h-6 w-6 text-white" />
                  </div>
                  <p class="mb-1 text-sm font-medium" :class="selectedCategoryId === category.id ? 'text-blue-600' : 'text-gray-700'">
                    {{ category.label }}
                  </p>
                  <p class="text-xs leading-5 text-gray-500">{{ category.description }}</p>
                  <div v-if="selectedCategoryId === category.id" class="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                    <Star class="h-4 w-4 text-white" />
                  </div>
                </button>
              </div>
            </div>

            <div>
              <div class="mb-4 flex items-center gap-3">
                <div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">2</div>
                <div>
                  <h3 class="text-base font-semibold text-gray-800">请选择对应指标</h3>
                  <p class="text-sm text-gray-500">{{ currentCategory?.label }} 下共 {{ currentIndexes.length }} 个可查看指标</p>
                </div>
              </div>
              <div class="space-y-3">
                <button
                  v-for="index in currentIndexes"
                  :key="index.itemCode"
                  class="w-full rounded-xl border p-4 text-left transition-all"
                  :class="selectedIndexCode === index.itemCode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
                  @click="selectedIndexCode = index.itemCode"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <p class="font-medium" :class="selectedIndexCode === index.itemCode ? 'text-blue-600' : 'text-gray-800'">
                        {{ index.title }}
                      </p>
                      <p class="mt-1 line-clamp-2 text-sm text-gray-500">{{ index.criteria }}</p>
                    </div>
                    <div class="flex-shrink-0 text-right">
                      <p class="text-sm font-medium text-gray-700">最高分值</p>
                      <p class="text-sm text-blue-600">{{ index.maxPoints }}</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card-shadow rounded-2xl bg-white p-6">
          <h2 class="mb-6 text-lg font-semibold text-gray-800">填写申请信息</h2>
          <div class="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-medium text-blue-600">当前申请指标</p>
                <p class="text-lg font-semibold text-gray-800">{{ selectedIndexItem?.title || '请先选择指标' }}</p>
              </div>
              <span class="rounded-full px-3 py-1 text-sm font-medium" :class="currentCategory.color">
                {{ currentCategory?.label }}
              </span>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div class="rounded-xl bg-white p-4">
                <p class="mb-2 text-gray-500">评分标准</p>
                <p class="leading-6 text-gray-700">{{ selectedIndexItem?.criteria || '请先选择指标后查看评分标准' }}</p>
              </div>
              <div class="space-y-3 rounded-xl bg-white p-4">
                <div>
                  <p class="mb-1 text-gray-500">最高分值</p>
                  <p class="font-medium text-gray-800">{{ selectedIndexItem?.maxPoints || '-' }}</p>
                </div>
                <div>
                  <p class="mb-1 text-gray-500">奖学金基本要求</p>
                  <p class="text-gray-700">{{ selectedIndexItem?.scholarshipRequirement || '无特殊要求' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">申请标题 <span class="text-red-500">*</span></label>
              <input
                v-model="formData.title"
                type="text"
                :placeholder="selectedIndexItem ? `请输入${selectedIndexItem.title}申请标题` : '请输入申请标题'"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">申请日期</label>
              <input
                v-model="formData.date"
                type="date"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">申请地点</label>
              <input
                v-model="formData.location"
                type="text"
                placeholder="请输入活动地点"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">评分标准选项</label>
              <select
                v-if="selectedOptions.length"
                v-model="selectedOptionCode"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="option in selectedOptions" :key="option.optionCode" :value="option.optionCode">
                  {{ option.optionName }}
                </option>
              </select>
              <div v-else class="w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                当前指标暂无结构化评分档位，请按说明填写申请分数
              </div>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">申请分数</label>
              <input
                v-model="formData.score"
                type="number"
                :readonly="isScoreReadOnly"
                :placeholder="selectedIndexItem ? `请填写${selectedIndexItem.title}申请分数` : '请输入申请分数'"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="isScoreReadOnly ? 'cursor-not-allowed text-gray-500' : ''"
              />
              <p v-if="selectedScoreOption && !isCustomScoreMode" class="mt-2 text-xs text-blue-600">已根据评分档位自动带出申请分数。</p>
              <p v-else-if="isCustomScoreMode" class="mt-2 text-xs text-amber-600">当前档位需按实际贡献填写申请分数，最终以后端审核结果为准。</p>
            </div>
          </div>

          <div v-if="selectedScoreOption?.description" class="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <span class="font-medium">当前评分说明：</span>{{ selectedScoreOption.description }}
          </div>
          <div v-if="maxPointsWarningMessage" class="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div class="flex items-start gap-3">
              <AlertTriangle class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <div>
                <p class="text-sm font-medium text-amber-800">超出最高分值提示</p>
                <p class="mt-1 text-sm text-amber-700">{{ maxPointsWarningMessage }}</p>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <label class="mb-2 block text-sm font-medium text-gray-700">申请描述 <span class="text-red-500">*</span></label>
            <textarea
              v-model="formData.description"
              rows="4"
              placeholder="请详细描述申请内容，包括活动时间、参与情况、取得成果等"
              class="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
        </div>

        <div class="card-shadow rounded-2xl bg-white p-6">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">上传证明材料</h2>
            <p class="text-sm text-gray-500">支持 PDF、图片、Word 等格式</p>
          </div>

          <div class="mb-6 grid grid-cols-2 gap-4">
            <div class="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-all hover:border-blue-400 hover:bg-blue-50/50" @click="triggerFileUpload">
              <Upload class="mx-auto mb-2 h-10 w-10 text-gray-400" />
              <p class="text-sm font-medium text-gray-600">上传本地文件</p>
              <input class="file-input-hidden hidden" type="file" multiple @change="handleFileUpload" />
            </div>
            <div class="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition-all hover:border-green-400 hover:bg-green-50/50" @click="showPublicAttachments = true">
              <FolderOpen class="mx-auto mb-2 h-10 w-10 text-gray-400" />
              <p class="text-sm font-medium text-gray-600">从公共附件选择</p>
            </div>
          </div>

          <div v-if="selectedFiles.length > 0 || selectedPublicAttachments.length > 0" class="mt-4 space-y-3">
            <div v-for="(file, index) in selectedFiles" :key="`local-${index}`" class="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FileText class="h-6 w-6 text-blue-600" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-gray-800">{{ file.name }}</p>
                <p class="text-sm text-gray-500">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
              </div>
              <button class="rounded-xl p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500" @click="removeFile(index)">
                <Trash2 class="h-5 w-5" />
              </button>
            </div>

            <div v-for="(attachment, index) in selectedPublicAttachments" :key="`public-${attachment.id}`" class="flex items-center gap-4 rounded-xl border border-green-100 bg-green-50 p-4">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <FileText class="h-6 w-6 text-green-600" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-gray-800">{{ attachment.name }}</p>
                <p class="text-sm text-green-600">来自公共附件池 · {{ attachment.size }}</p>
              </div>
              <button class="rounded-xl p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500" @click="removePublicAttachment(index)">
                <Trash2 class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-4">
          <button class="rounded-xl px-6 py-3 font-medium text-gray-600 transition-all hover:bg-gray-100">保存草稿</button>
          <button
            class="bg-gradient-primary flex items-center gap-2 rounded-xl px-6 py-3 font-medium text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isSubmitting || !formData.title || !formData.description"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting" class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            <span>{{ isSubmitting ? '提交中...' : '提交申请' }}</span>
            <ArrowRight v-if="!isSubmitting" class="h-5 w-5" />
          </button>
        </div>

        <div v-if="submitSuccess" class="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle class="h-6 w-6 text-green-600" />
          <div>
            <p class="font-medium text-green-800">申请提交成功</p>
            <p class="text-sm text-green-600">您的申请已提交，等待审核结果</p>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card-shadow rounded-2xl bg-white p-6">
          <h2 class="mb-6 text-lg font-semibold text-gray-800">申请须知</h2>
          <ul class="space-y-4">
            <li class="flex items-start gap-3">
              <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span class="text-xs font-bold">1</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">选择正确的申请类型</p>
                <p class="text-sm text-gray-500">根据活动类型选择对应的分类，选错将影响审核</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span class="text-xs font-bold">2</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">填写真实信息</p>
                <p class="text-sm text-gray-500">虚假信息将影响您的综测成绩</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span class="text-xs font-bold">3</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">上传相关证明</p>
                <p class="text-sm text-gray-500">请上传能够证明您参与活动的相关材料</p>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span class="text-xs font-bold">4</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">等待审核结果</p>
                <p class="text-sm text-gray-500">提交后请耐心等待审核，可在申请记录中查看进度</p>
              </div>
            </li>
          </ul>
        </div>

        <div class="card-shadow rounded-2xl bg-white p-6">
          <h2 class="mb-6 text-lg font-semibold text-gray-800">近期申请记录</h2>
          <div class="space-y-4">
            <div v-for="app in recentApplications.slice(0, 3)" :key="app.id" class="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <div :class="['flex h-12 w-12 items-center justify-center rounded-xl', getCategoryColor(app.category)]">
                <component :is="getCategoryIcon(app.category)" class="h-6 w-6 text-white" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">{{ app.type }}</p>
                <p class="text-xs text-gray-500">{{ app.date }}</p>
              </div>
              <div class="text-right">
                <span class="text-sm font-medium text-green-600">{{ app.score }}</span>
                <span :class="['mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium', getStatusClass(app.status)]">
                  {{ getStatusText(app.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showPublicAttachments" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white">
          <div class="flex items-center justify-between border-b border-gray-100 p-6">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                <FolderOpen class="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-800">选择公共附件</h2>
                <p class="text-sm text-gray-500">已选择 {{ selectedPublicAttachments.length }} 个附件</p>
              </div>
            </div>
            <button class="rounded-xl p-2 hover:bg-gray-100" @click="closePublicAttachmentsModal">
              <XCircle class="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div class="border-b border-gray-100 p-6">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchPublicAttachments"
                type="text"
                placeholder="搜索附件名称"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div class="max-h-[500px] overflow-y-auto p-6">
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="attachment in filteredPublicAttachments"
                :key="attachment.id"
                class="cursor-pointer rounded-xl border-2 p-4 transition-all"
                :class="selectedPublicAttachments.find((item) => item.id === attachment.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'"
                @click="selectPublicAttachment(attachment)"
              >
                <div class="flex items-start gap-3">
                  <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <FileText class="h-6 w-6 text-blue-600" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <h4 class="truncate font-medium text-gray-800">{{ attachment.name }}</h4>
                      <Star v-if="attachment.isRecommended" class="h-4 w-4 flex-shrink-0 fill-yellow-500 text-yellow-500" />
                    </div>
                    <div class="mt-1 flex flex-wrap gap-1">
                      <span v-for="tag in attachment.tags" :key="tag" class="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {{ tag }}
                      </span>
                    </div>
                    <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      <span>{{ attachment.size }}</span>
                      <span>{{ attachment.downloads }} 下载</span>
                    </div>
                  </div>
                  <div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" :class="selectedPublicAttachments.find((item) => item.id === attachment.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'">
                    <CheckCircle v-if="selectedPublicAttachments.find((item) => item.id === attachment.id)" class="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="filteredPublicAttachments.length === 0" class="py-16 text-center">
              <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <FolderOpen class="h-8 w-8 text-gray-400" />
              </div>
              <p class="text-gray-500">暂无符合条件的附件</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 border-t border-gray-100 p-6">
            <button class="rounded-xl border border-gray-200 px-6 py-3 font-medium text-gray-600 transition-all hover:bg-gray-50" @click="closePublicAttachmentsModal">取消</button>
            <button
              class="rounded-xl px-6 py-3 font-medium transition-all"
              :class="selectedPublicAttachments.length > 0 ? 'bg-green-500 text-white hover:bg-green-600' : 'cursor-not-allowed bg-gray-100 text-gray-400'"
              :disabled="selectedPublicAttachments.length === 0"
              @click="closePublicAttachmentsModal"
            >
              确认选择 ({{ selectedPublicAttachments.length }})
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
