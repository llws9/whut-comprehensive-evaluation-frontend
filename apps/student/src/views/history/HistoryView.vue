<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  Plus,
  Search,
  Target,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-vue-next'

import {
  categoryOptions,
  createCategoryIndexesSnapshot,
  type ScoreOption,
  type SharedIndexItem as IndexItem,
} from '@/data/student-application-shared'

interface SubmitResponse {
  applicationId: number
  status: string
  appliedPoints: number | null
  maxPoints: number | null
  exceedsMaxPoints: boolean
  warningMessage: string | null
}

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

const searchKeyword = ref('')
const activeCategory = ref('intellectual')
const showApplyModal = ref(false)
const selectedIndex = ref<IndexItem | null>(null)
const selectedFiles = ref<File[]>([])
const showPublicAttachments = ref(false)
const searchPublicAttachments = ref('')
const dynamicCategoryIndexes = ref<Record<string, IndexItem[]>>(createCategoryIndexesSnapshot())
const configLoading = ref(false)
const configLoadError = ref('')
const selectedOptionCode = ref('')
const customAppliedPoints = ref<number | null>(null)
const applicationContent = ref('')
const applyWarningMessage = ref('')
const applySuccessMessage = ref('')
const submitLoading = ref(false)

const publicAttachments = ref<PublicAttachment[]>([
  { id: 1, name: '获奖证书模板.pdf', category: 'certificate', tags: ['智育', '体育'], size: '1.5 MB', uploadTime: '2024-03-15', downloads: 89, isRecommended: true },
  { id: 2, name: '社会实践证明模板.docx', category: 'document', tags: ['劳育'], size: '512 KB', uploadTime: '2024-03-14', downloads: 123, isRecommended: true },
  { id: 3, name: '讲座签到表.pdf', category: 'document', tags: ['智育'], size: '320 KB', uploadTime: '2024-03-13', downloads: 67, isRecommended: false },
])

const selectedPublicAttachments = ref<PublicAttachment[]>([])

const filteredPublicAttachments = computed(() => {
  if (!searchPublicAttachments.value) {
    return publicAttachments.value
  }
  return publicAttachments.value.filter((attachment) => attachment.name.includes(searchPublicAttachments.value))
})

const currentCategoryIndexes = computed(() => {
  const indexes = dynamicCategoryIndexes.value[activeCategory.value] || []
  if (!searchKeyword.value.trim()) {
    return indexes
  }
  return indexes.filter((index) => index.title.includes(searchKeyword.value.trim()) || index.criteria.includes(searchKeyword.value.trim()))
})

const selectedScoreOption = computed<ScoreOption | null>(() => {
  if (!selectedIndex.value || !selectedOptionCode.value) {
    return null
  }
  return selectedIndex.value.options?.find((option) => option.optionCode === selectedOptionCode.value) || null
})

const selectedAppliedPoints = computed<number | null>(() => {
  if (!selectedScoreOption.value) {
    return customAppliedPoints.value
  }
  if (selectedScoreOption.value.allowCustomPoints && selectedScoreOption.value.points === null) {
    return customAppliedPoints.value
  }
  return selectedScoreOption.value.points
})

const parseMaxPoints = (value?: string): number | null => {
  if (!value || value === '无') {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const maxPointsValue = computed(() => selectedIndex.value?.maxPointsValue ?? parseMaxPoints(selectedIndex.value?.maxPoints))
const exceedsMaxPoints = computed(() => {
  if (selectedAppliedPoints.value === null || maxPointsValue.value === null) {
    return false
  }
  return selectedAppliedPoints.value > maxPointsValue.value
})

const submitDisabled = computed(() => submitLoading.value || Boolean(selectedIndex.value?.options?.length && !selectedOptionCode.value))

const currentCategoryInfo = computed(() => {
  return categoryOptions.find((category) => category.id === activeCategory.value) || {
    id: '',
    label: '其他',
    color: 'bg-gray-100 text-gray-700',
    gradient: 'from-gray-500 to-gray-600',
    bgGradient: 'bg-gray-500',
  }
})

const getStatusClass = (status?: string) => {
  if (!status) {
    return ''
  }
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
      return ''
  }
}

const getStatusText = (status?: string) => {
  if (!status) {
    return ''
  }
  switch (status) {
    case 'approved':
      return '辅导员已审核'
    case 'monitor_approved':
      return '班长已审批'
    case 'pending':
      return '未审核'
    case 'rejected':
      return '已拒绝'
    default:
      return ''
  }
}

const handleApply = (index: IndexItem) => {
  selectedIndex.value = index
  selectedOptionCode.value = index.options?.[0]?.optionCode || ''
  customAppliedPoints.value = selectedScoreOption.value?.points ?? null
  applicationContent.value = ''
  applyWarningMessage.value = ''
  applySuccessMessage.value = ''
  showApplyModal.value = true
}

const selectPublicAttachment = (attachment: PublicAttachment) => {
  if (!selectedPublicAttachments.value.find((item) => item.id === attachment.id)) {
    selectedPublicAttachments.value.push({ ...attachment })
  }
}

const removePublicAttachment = (index: number) => {
  selectedPublicAttachments.value.splice(index, 1)
}

const closePublicAttachmentsModal = () => {
  showPublicAttachments.value = false
  searchPublicAttachments.value = ''
}

const triggerFileUpload = () => {
  const input = document.querySelector('.application-file-input') as HTMLInputElement | null
  input?.click()
}

const handleFileUpload = (event: Event) => {
  const files = Array.from((event.target as HTMLInputElement).files || []) as File[]
  selectedFiles.value.push(...files)
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const resetApplyForm = () => {
  selectedFiles.value = []
  selectedPublicAttachments.value = []
  selectedOptionCode.value = ''
  customAppliedPoints.value = null
  applicationContent.value = ''
}

const categoryCodeMap: Record<string, string> = {
  moral: 'MORAL',
  intellectual: 'INTELLECTUAL',
  sports: 'SPORTS',
  labor: 'LABOR',
}

const mapApiItem = (item: Record<string, unknown>, id: number): IndexItem => ({
  id,
  itemCode: String(item.itemCode),
  title: String(item.itemName),
  criteria: String(item.description || '暂无评分标准说明'),
  maxPoints: item.maxPoints === null || item.maxPoints === undefined ? '无' : String(item.maxPoints),
  maxPointsValue: typeof item.maxPoints === 'number' ? item.maxPoints : null,
  scholarshipRequirement: String(item.scholarshipRequirement || ''),
  hasApplication: false,
  canApply: item.applyMode === 'STUDENT_APPLY',
  optionsKey: typeof item.optionsKey === 'string' ? item.optionsKey : null,
  applyMode: item.applyMode === 'SYSTEM_CALCULATED' || item.applyMode === 'TEACHER_IMPORT' ? item.applyMode : 'STUDENT_APPLY',
  options: [],
})

const fetchEvaluationConfig = async () => {
  configLoading.value = true
  configLoadError.value = ''
  try {
    const next: Record<string, IndexItem[]> = {}
    for (const category of categoryOptions) {
      const categoryCode = categoryCodeMap[category.id]
      const itemResponse = await fetch(`/api/config/evaluation/items/${categoryCode}`)
      if (!itemResponse.ok) {
        throw new Error('指标配置接口不可用')
      }
      const itemJson = await itemResponse.json() as { data?: Record<string, unknown>[] }
      const items = (itemJson.data || []).map((item, index) => mapApiItem(item, index + 1))
      for (const item of items) {
        if (item.optionsKey) {
          const optionResponse = await fetch(`/api/config/evaluation/options/${item.itemCode}`)
          if (optionResponse.ok) {
            const optionJson = await optionResponse.json() as { data?: ScoreOption[] }
            item.options = optionJson.data || []
          }
        }
      }
      next[category.id] = items
    }
    dynamicCategoryIndexes.value = next
  } catch {
    configLoadError.value = '当前使用本地示例配置，后端配置接口可用后将自动切换为动态指标。'
  } finally {
    configLoading.value = false
  }
}

const mockSubmitResponse = (index: IndexItem, payload: { appliedPoints: number | null }): SubmitResponse => {
  const appliedPoints = payload.appliedPoints ?? null
  const maxPoints = index.maxPointsValue ?? parseMaxPoints(index.maxPoints)
  const exceeded = appliedPoints !== null && maxPoints !== null && appliedPoints > maxPoints
  return {
    applicationId: index.applicationId || Date.now(),
    status: 'SUBMITTED',
    appliedPoints,
    maxPoints,
    exceedsMaxPoints: exceeded,
    warningMessage: exceeded
      ? `您申请的分值(${appliedPoints?.toFixed(2)}分)超过该指标的最高分值上限(${maxPoints?.toFixed(2)}分)，申请已提交，但审核时将按最高分值计算`
      : null,
  }
}

const postSubmitApplication = async (index: IndexItem, payload: { expectedVersion: number; optionCode: string | null; appliedPoints: number | null }): Promise<SubmitResponse> => {
  if (!index.applicationId) {
    return mockSubmitResponse(index, payload)
  }
  try {
    const response = await fetch(`/api/student/applications/${index.applicationId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error('提交失败')
    }
    const json = await response.json() as { data: SubmitResponse }
    return json.data
  } catch {
    return mockSubmitResponse(index, payload)
  }
}

const handleSubmit = async () => {
  if (!selectedIndex.value) {
    return
  }
  submitLoading.value = true
  applyWarningMessage.value = ''
  applySuccessMessage.value = ''
  const payload = {
    expectedVersion: selectedIndex.value.applicationId ? 1 : 0,
    optionCode: selectedOptionCode.value || null,
    appliedPoints: selectedAppliedPoints.value,
  }
  try {
    const response = await postSubmitApplication(selectedIndex.value, payload)
    selectedIndex.value.hasApplication = true
    selectedIndex.value.status = 'pending'
    selectedIndex.value.currentScore = response.appliedPoints === null ? '-' : String(response.appliedPoints)
    selectedIndex.value.applicationId = response.applicationId
    if (response.exceedsMaxPoints && response.warningMessage) {
      applyWarningMessage.value = response.warningMessage
    } else {
      applySuccessMessage.value = '申请已提交，系统已按配置自动计算申请分值。'
    }
  } finally {
    submitLoading.value = false
  }
  setTimeout(() => {
    showApplyModal.value = false
    resetApplyForm()
  }, 1600)
}

watch(selectedOptionCode, () => {
  if (!selectedScoreOption.value) {
    customAppliedPoints.value = null
    return
  }
  customAppliedPoints.value = selectedScoreOption.value.points
})

onMounted(() => {
  void fetchEvaluationConfig()
})
</script>

<template>
  <section class="space-y-8">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">申请记录</h1>
        <p class="mt-1 text-gray-500">查看和管理您的测评申请记录</p>
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
      <div v-if="configLoading || configLoadError" class="mb-4">
        <div class="flex items-center gap-2 rounded-xl px-4 py-3 text-sm" :class="configLoading ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'">
          <Clock v-if="configLoading" class="h-4 w-4" />
          <AlertTriangle v-else class="h-4 w-4" />
          <span>{{ configLoading ? '正在读取后端动态指标配置...' : configLoadError }}</span>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex flex-wrap items-center gap-2">
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
          <div class="relative max-w-xs">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索指标名称"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentCategoryIndexes.length > 0" class="space-y-6">
      <div class="card-shadow overflow-hidden rounded-2xl bg-white">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50">
                <th class="w-40 px-6 py-4 text-left text-sm font-semibold text-gray-700">指标</th>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">评分标准</th>
                <th class="w-28 px-6 py-4 text-center text-sm font-semibold text-gray-700">最高分值</th>
                <th class="min-w-[200px] px-6 py-4 text-center text-sm font-semibold text-gray-700">参评学业奖学金基本要求</th>
                <th class="w-28 px-6 py-4 text-center text-sm font-semibold text-gray-700">当前得分</th>
                <th class="w-32 px-6 py-4 text-center text-sm font-semibold text-gray-700">状态</th>
                <th class="w-32 px-6 py-4 text-center text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="index in currentCategoryIndexes" :key="index.id" class="border-b border-gray-100 transition-all hover:bg-gray-50/50">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', currentCategoryInfo.color]">
                      <Target class="h-5 w-5" />
                    </div>
                    <span class="font-medium text-gray-800">{{ index.title }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <p class="max-w-md line-clamp-3 text-sm text-gray-600">{{ index.criteria }}</p>
                  <div v-if="index.options?.length" class="mt-2 flex flex-wrap gap-1">
                    <span v-for="option in index.options.slice(0, 3)" :key="option.optionCode" class="rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                      {{ option.optionName }} · {{ option.points === null ? '自定义' : `${option.points}分` }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-sm font-medium text-gray-700">{{ index.maxPoints }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm" :class="index.scholarshipRequirement ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-400'">
                    <AlertTriangle v-if="index.scholarshipRequirement" class="h-4 w-4" />
                    <span>{{ index.scholarshipRequirement || '-' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-sm font-medium text-blue-600">{{ index.currentScore || '-' }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span v-if="index.status" :class="['rounded-full px-3 py-1 text-sm font-medium', getStatusClass(index.status)]">
                    {{ getStatusText(index.status) }}
                  </span>
                  <span v-else class="text-sm text-gray-400">-</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button v-if="index.hasApplication" class="rounded-lg p-2 text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600" title="查看">
                      <Eye class="h-4 w-4" />
                    </button>
                    <button v-if="index.hasApplication" class="rounded-lg p-2 text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-600" title="修改">
                      <Edit class="h-4 w-4" />
                    </button>
                    <button v-if="index.hasApplication" class="rounded-lg p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600" title="删除">
                      <Trash2 class="h-4 w-4" />
                    </button>
                    <button
                      v-if="index.canApply && !index.hasApplication"
                      class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-white transition-all hover:shadow-lg"
                      :class="currentCategoryInfo.bgGradient"
                      @click="handleApply(index)"
                    >
                      <Plus class="h-4 w-4" />
                      申请
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="card-shadow rounded-2xl bg-white p-12 text-center">
      <div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <Target class="h-10 w-10 text-gray-400" />
      </div>
      <h3 class="mb-2 text-lg font-medium text-gray-800">暂无指标数据</h3>
      <p class="text-gray-500">当前类别下暂无可用的测评指标</p>
    </div>

    <Teleport to="body">
      <div v-if="showApplyModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white">
          <div class="flex items-center justify-between border-b border-gray-100 p-6">
            <div class="flex items-center gap-3">
              <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', currentCategoryInfo.color]">
                <Target class="h-5 w-5" />
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-800">{{ selectedIndex?.title }}申请</h2>
                <p class="text-sm text-gray-500">填写申请信息并上传证明材料</p>
              </div>
            </div>
            <button class="rounded-xl p-2 hover:bg-gray-100" @click="showApplyModal = false">
              <XCircle class="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div class="space-y-6 p-6">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">申请学年</label>
              <select class="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="2024-2025">2024-2025学年</option>
                <option value="2023-2024">2023-2024学年</option>
                <option value="2022-2023">2022-2023学年</option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">申请内容 *</label>
              <textarea
                v-model="applicationContent"
                rows="3"
                placeholder="请简要描述您申请的内容..."
                class="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div v-if="selectedIndex?.options?.length">
              <label class="mb-2 block text-sm font-medium text-gray-700">评分标准 *</label>
              <select
                v-model="selectedOptionCode"
                class="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option disabled value="">请选择评分档位</option>
                <option v-for="option in selectedIndex.options" :key="option.optionCode" :value="option.optionCode">
                  {{ option.optionName }}（{{ option.points === null ? '自定义分值' : `${option.points}分` }}）
                </option>
              </select>
              <p v-if="selectedScoreOption?.description" class="mt-2 text-xs text-gray-500">{{ selectedScoreOption.description }}</p>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700">
                申请分数
                <span v-if="selectedScoreOption && !(selectedScoreOption.allowCustomPoints && selectedScoreOption.points === null)" class="text-xs text-gray-400">（由评分档位自动计算）</span>
              </label>
              <input
                v-model.number="customAppliedPoints"
                type="number"
                placeholder="请输入申请分数"
                :readonly="!!selectedScoreOption && !(selectedScoreOption.allowCustomPoints && selectedScoreOption.points === null)"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="selectedScoreOption && !(selectedScoreOption.allowCustomPoints && selectedScoreOption.points === null) ? 'cursor-not-allowed text-gray-500' : ''"
              />
              <div class="mt-2 flex flex-wrap gap-2 text-xs">
                <span class="rounded-md bg-gray-100 px-2 py-1 text-gray-600">最高分值：{{ selectedIndex?.maxPoints || '-' }}</span>
                <span v-if="selectedAppliedPoints !== null" class="rounded-md bg-blue-50 px-2 py-1 text-blue-600">当前申请：{{ selectedAppliedPoints }}分</span>
                <span v-if="exceedsMaxPoints" class="rounded-md bg-amber-50 px-2 py-1 text-amber-700">超过上限，仍可提交</span>
              </div>
            </div>

            <div v-if="exceedsMaxPoints" class="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <p class="text-sm text-amber-700">当前申请分值超过最高分值限制，系统允许提交；提交成功后会保留提示，审核时将按最高分值上限处理。</p>
            </div>

            <div v-if="applyWarningMessage || applySuccessMessage" class="flex gap-3 rounded-xl p-4" :class="applyWarningMessage ? 'border border-amber-200 bg-amber-50' : 'border border-green-200 bg-green-50'">
              <AlertTriangle v-if="applyWarningMessage" class="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <CheckCircle v-else class="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              <p class="text-sm" :class="applyWarningMessage ? 'text-amber-700' : 'text-green-700'">{{ applyWarningMessage || applySuccessMessage }}</p>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-gray-700">上传证明材料</label>
              <div class="mb-4 grid grid-cols-2 gap-4">
                <div class="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-all hover:border-blue-400 hover:bg-blue-50/50" @click="triggerFileUpload">
                  <Upload class="mx-auto mb-2 h-10 w-10 text-gray-400" />
                  <p class="text-sm font-medium text-gray-600">上传本地文件</p>
                  <input class="application-file-input hidden" type="file" multiple @change="handleFileUpload" />
                </div>
                <div class="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-all hover:border-green-400 hover:bg-green-50/50" @click="showPublicAttachments = true">
                  <FolderOpen class="mx-auto mb-2 h-10 w-10 text-gray-400" />
                  <p class="text-sm font-medium text-gray-600">从公共附件选择</p>
                </div>
              </div>

              <div v-if="selectedFiles.length > 0 || selectedPublicAttachments.length > 0" class="space-y-3">
                <div v-for="(file, index) in selectedFiles" :key="`local-${index}`" class="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <FileText class="h-6 w-6 text-blue-600" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium text-gray-800">{{ file.name }}</p>
                    <p class="text-sm text-gray-500">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
                  </div>
                  <button class="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" @click="removeFile(index)">
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
                  <button class="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" @click="removePublicAttachment(index)">
                    <Trash2 class="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 border-t border-gray-100 p-6">
            <button class="rounded-xl border border-gray-200 px-6 py-3 text-gray-600 transition-all hover:bg-gray-50" @click="showApplyModal = false">取消</button>
            <button
              class="rounded-xl px-6 py-3 text-white transition-all hover:shadow-lg"
              :class="submitDisabled ? 'cursor-not-allowed bg-gray-300' : currentCategoryInfo.bgGradient"
              :disabled="submitDisabled"
              @click="handleSubmit"
            >
              {{ submitLoading ? '提交中...' : '提交申请' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showPublicAttachments" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white">
          <div class="flex items-center justify-between border-b border-gray-100 p-6">
            <h2 class="text-xl font-bold text-gray-800">选择公共附件</h2>
            <button class="rounded-xl p-2 hover:bg-gray-100" @click="closePublicAttachmentsModal">
              <XCircle class="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div class="border-b border-gray-100 p-4">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                v-model="searchPublicAttachments"
                type="text"
                placeholder="搜索附件名称"
                class="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div class="max-h-[400px] overflow-y-auto p-4">
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="attachment in filteredPublicAttachments"
                :key="attachment.id"
                class="cursor-pointer rounded-xl border-2 p-4 transition-all"
                :class="selectedPublicAttachments.find((item) => item.id === attachment.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'"
                @click="selectPublicAttachment(attachment)"
              >
                <div class="flex items-start gap-3">
                  <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <FileText class="h-6 w-6 text-blue-600" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4 class="truncate font-medium text-gray-800">{{ attachment.name }}</h4>
                    <p class="mt-1 text-xs text-gray-500">{{ attachment.size }} · {{ attachment.downloads }} 下载</p>
                  </div>
                  <div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full" :class="selectedPublicAttachments.find((item) => item.id === attachment.id) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'">
                    <CheckCircle v-if="selectedPublicAttachments.find((item) => item.id === attachment.id)" class="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 border-t border-gray-100 p-4">
            <button class="rounded-xl border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-50" @click="closePublicAttachmentsModal">取消</button>
            <button
              class="rounded-xl px-4 py-2"
              :class="selectedPublicAttachments.length > 0 ? 'bg-blue-500 text-white hover:bg-blue-600' : 'cursor-not-allowed bg-gray-100 text-gray-400'"
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
