export type StudentApplicationFieldKey =
  | 'title'
  | 'date'
  | 'location'
  | 'extraInfo'
  | 'description'
  | 'contributionNote'

export type StudentApplicationFieldType = 'text' | 'date' | 'textarea'

export interface StudentApplicationFieldConfig {
  key: StudentApplicationFieldKey
  label: string
  type: StudentApplicationFieldType
  placeholder: string
  required: boolean
  span?: 'half' | 'full'
  rows?: number
  helperText?: string
}

export interface StudentApplicationFormSchema {
  summary: string
  fields: StudentApplicationFieldConfig[]
}

export type StudentApplicationFormData = Record<StudentApplicationFieldKey, string>

const genericSchema: StudentApplicationFormSchema = {
  summary: '当前指标使用通用申请信息表单，保留标题、时间、辅助信息与申请说明。',
  fields: [
    {
      key: 'title',
      label: '申请标题',
      type: 'text',
      placeholder: '请输入申请标题',
      required: true,
      span: 'half'
    },
    {
      key: 'date',
      label: '申请日期',
      type: 'date',
      placeholder: '',
      required: false,
      span: 'half'
    },
    {
      key: 'location',
      label: '地点 / 平台',
      type: 'text',
      placeholder: '请输入相关地点、平台或主办单位',
      required: false,
      span: 'half'
    },
    {
      key: 'extraInfo',
      label: '补充信息',
      type: 'text',
      placeholder: '请输入与该申请相关的补充信息',
      required: false,
      span: 'half'
    },
    {
      key: 'description',
      label: '申请说明',
      type: 'textarea',
      placeholder: '请详细描述申请内容，包括背景、过程和成果',
      required: true,
      span: 'full',
      rows: 4
    }
  ]
}

const formSchemaByItemCode: Record<string, StudentApplicationFormSchema> = {
  SPORTS_COMPETITION: {
    summary: '文体竞赛需突出赛事名称、比赛时间、举办信息和参赛/获奖说明。',
    fields: [
      {
        key: 'title',
        label: '赛事名称',
        type: 'text',
        placeholder: '请输入文体竞赛名称',
        required: true,
        span: 'half'
      },
      {
        key: 'date',
        label: '比赛时间',
        type: 'date',
        placeholder: '',
        required: true,
        span: 'half'
      },
      {
        key: 'location',
        label: '赛事地点',
        type: 'text',
        placeholder: '请输入比赛地点',
        required: false,
        span: 'half'
      },
      {
        key: 'extraInfo',
        label: '主办单位',
        type: 'text',
        placeholder: '请输入赛事主办单位',
        required: false,
        span: 'half'
      },
      {
        key: 'description',
        label: '参赛 / 获奖说明',
        type: 'textarea',
        placeholder: '请说明参赛项目、获奖情况、参与角色等关键信息',
        required: true,
        span: 'full',
        rows: 4
      }
    ]
  },
  SPORTS_ART_CONTRIBUTION: {
    summary: '文艺征稿需突出作品名称、投稿去向或录用平台、作品说明；多人合作时需补充贡献说明。',
    fields: [
      {
        key: 'title',
        label: '作品名称',
        type: 'text',
        placeholder: '请输入作品名称',
        required: true,
        span: 'half'
      },
      {
        key: 'date',
        label: '投稿 / 录用时间',
        type: 'date',
        placeholder: '',
        required: true,
        span: 'half'
      },
      {
        key: 'location',
        label: '推荐去向 / 录用平台',
        type: 'text',
        placeholder: '请输入学院推荐去向或媒体录用平台',
        required: true,
        span: 'half'
      },
      {
        key: 'extraInfo',
        label: '作品类型',
        type: 'text',
        placeholder: '如摄影、书法、征文、短视频等',
        required: false,
        span: 'half'
      },
      {
        key: 'description',
        label: '作品说明',
        type: 'textarea',
        placeholder: '请说明作品内容、投稿情况、录用结果等信息',
        required: true,
        span: 'full',
        rows: 4
      }
    ]
  },
  SPORTS_OTHER: {
    summary: '其他体育美育成果使用活动 / 成果导向表单，强调活动名称、时间、平台与成果说明。',
    fields: [
      {
        key: 'title',
        label: '活动 / 成果名称',
        type: 'text',
        placeholder: '请输入活动或成果名称',
        required: true,
        span: 'half'
      },
      {
        key: 'date',
        label: '活动时间',
        type: 'date',
        placeholder: '',
        required: false,
        span: 'half'
      },
      {
        key: 'location',
        label: '活动地点 / 发布平台',
        type: 'text',
        placeholder: '请输入活动地点或发布平台',
        required: false,
        span: 'half'
      },
      {
        key: 'extraInfo',
        label: '相关单位',
        type: 'text',
        placeholder: '请输入组织单位、承办单位或指导单位',
        required: false,
        span: 'half'
      },
      {
        key: 'description',
        label: '成果说明',
        type: 'textarea',
        placeholder: '请说明成果内容、参与情况及综测加分依据',
        required: true,
        span: 'full',
        rows: 4
      }
    ]
  },
  INTELLECTUAL_PAPER: {
    summary: '论文类申请需聚焦论文标题、发表渠道和论文摘要说明。',
    fields: [
      {
        key: 'title',
        label: '论文标题',
        type: 'text',
        placeholder: '请输入论文标题',
        required: true,
        span: 'half'
      },
      {
        key: 'date',
        label: '发表 / 录用时间',
        type: 'date',
        placeholder: '',
        required: false,
        span: 'half'
      },
      {
        key: 'location',
        label: '期刊 / 会议名称',
        type: 'text',
        placeholder: '请输入期刊或会议名称',
        required: true,
        span: 'half'
      },
      {
        key: 'extraInfo',
        label: '收录 / 分区信息',
        type: 'text',
        placeholder: '请输入分区、检索或类别信息',
        required: false,
        span: 'half'
      },
      {
        key: 'description',
        label: '论文说明',
        type: 'textarea',
        placeholder: '请说明论文发表情况、本人角色及成果价值',
        required: true,
        span: 'full',
        rows: 4
      }
    ]
  }
}

const multiAuthorField: StudentApplicationFieldConfig = {
  key: 'contributionNote',
  label: '合作分工与本人贡献',
  type: 'textarea',
  placeholder: '请说明多人合作的分工情况以及本人贡献占比',
  required: true,
  span: 'full',
  rows: 3,
  helperText: '多人合作完成时，需要说明分工和本人贡献，便于审核分值。'
}

export const createEmptyApplicationFormData = (): StudentApplicationFormData => ({
  title: '',
  date: '',
  location: '',
  extraInfo: '',
  description: '',
  contributionNote: ''
})

export const getApplicationFormSchema = (
  itemCode?: string | null,
  optionCode?: string | null
): StudentApplicationFormSchema => {
  const baseSchema = (itemCode && formSchemaByItemCode[itemCode]) || genericSchema
  const nextFields = [...baseSchema.fields]

  if (itemCode === 'SPORTS_ART_CONTRIBUTION' && optionCode === 'ART_MULTI_AUTHOR') {
    nextFields.push(multiAuthorField)
  }

  return {
    summary: baseSchema.summary,
    fields: nextFields
  }
}

export const isApplicationFormComplete = (
  schema: StudentApplicationFormSchema,
  formData: StudentApplicationFormData
): boolean => {
  return schema.fields.every((field) => {
    if (!field.required) {
      return true
    }
    return formData[field.key].trim().length > 0
  })
}
