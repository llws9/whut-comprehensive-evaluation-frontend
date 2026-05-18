export type CategoryId = 'moral' | 'intellectual' | 'sports' | 'labor'

export interface CategoryOption {
  id: CategoryId
  label: string
  description: string
  color: string
  gradient: string
  bgGradient: string
}

export interface ScoreOption {
  optionCode: string
  optionName: string
  points: number | null
  description?: string
  allowCustomPoints: boolean
}

export interface SharedIndexItem {
  id: number
  itemCode: string
  title: string
  criteria: string
  maxPoints: string
  maxPointsValue?: number | null
  scholarshipRequirement: string
  hasApplication: boolean
  canApply: boolean
  status?: 'pending' | 'monitor_approved' | 'approved' | 'rejected'
  currentScore?: string
  applicationId?: number
  optionsKey?: string | null
  applyMode?: 'STUDENT_APPLY' | 'SYSTEM_CALCULATED' | 'TEACHER_IMPORT'
  options?: ScoreOption[]
}

export const categoryOptions: CategoryOption[] = [
  {
    id: 'moral',
    label: '德育',
    description: '思想品德、社会实践、校园活动等德育相关指标',
    color: 'bg-pink-100 text-pink-700',
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'bg-gradient-to-r from-pink-500 to-rose-500'
  },
  {
    id: 'intellectual',
    label: '智育',
    description: '学习成绩、论文、专利、竞赛、学术活动等智育指标',
    color: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  },
  {
    id: 'sports',
    label: '体育与美育',
    description: '文体竞赛、文艺征稿及其他体育美育相关成果',
    color: 'bg-orange-100 text-orange-700',
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'bg-gradient-to-r from-orange-500 to-red-500'
  },
  {
    id: 'labor',
    label: '劳育',
    description: '社会工作、社会实践、两室文化建设等劳育指标',
    color: 'bg-green-100 text-green-700',
    gradient: 'from-green-500 to-teal-500',
    bgGradient: 'bg-gradient-to-r from-green-500 to-teal-500'
  }
]

export const localOptionCatalog: Record<string, ScoreOption[]> = {
  MORAL_REWARD_PUNISHMENT: [
    { optionCode: 'REWARD_PROVINCIAL', optionName: '省级及以上荣誉称号', points: 3, allowCustomPoints: false },
    { optionCode: 'REWARD_UNIVERSITY', optionName: '校级荣誉称号', points: 1.5, allowCustomPoints: false },
    { optionCode: 'PRAISE_COLLEGE', optionName: '院级通报表扬', points: 0.5, allowCustomPoints: false }
  ],
  INTELLECTUAL_PAPER: [
    { optionCode: 'PAPER_GRADE1_1', optionName: 'Ⅰ类第一档', points: 36, allowCustomPoints: false },
    { optionCode: 'PAPER_GRADE2_3', optionName: 'Ⅱ类第三档', points: 12, allowCustomPoints: false },
    { optionCode: 'PAPER_GRADE4_7', optionName: 'Ⅳ类第七档', points: 2, allowCustomPoints: false }
  ],
  SPORTS_COMPETITION: [
    { optionCode: 'COMPETITION_PERSONAL_PROVINCIAL_FIRST', optionName: '个人-省部级及以上-第一名', points: 8, allowCustomPoints: false },
    { optionCode: 'COMPETITION_PERSONAL_PROVINCIAL_SECOND', optionName: '个人-省部级及以上-第二名', points: 6, allowCustomPoints: false },
    { optionCode: 'COMPETITION_PERSONAL_PROVINCIAL_THIRD', optionName: '个人-省部级及以上-第三名', points: 4, allowCustomPoints: false },
    { optionCode: 'COMPETITION_PERSONAL_PROVINCIAL_FOURTH', optionName: '个人-省部级及以上-第四名', points: 2, allowCustomPoints: false },
    { optionCode: 'COMPETITION_PERSONAL_UNIVERSITY_FIRST', optionName: '个人-校级-第一名', points: 3, allowCustomPoints: false },
    { optionCode: 'COMPETITION_PERSONAL_UNIVERSITY_SECOND', optionName: '个人-校级-第二名', points: 2, allowCustomPoints: false },
    { optionCode: 'COMPETITION_PERSONAL_UNIVERSITY_THIRD', optionName: '个人-校级-第三名', points: 1, allowCustomPoints: false },
    { optionCode: 'COMPETITION_PERSONAL_COLLEGE_FIRST', optionName: '个人-院级-第一名', points: 1, allowCustomPoints: false },
    { optionCode: 'COMPETITION_PERSONAL_COLLEGE_SECOND', optionName: '个人-院级-第二名', points: 0.6, allowCustomPoints: false },
    { optionCode: 'COMPETITION_PERSONAL_COLLEGE_THIRD', optionName: '个人-院级-第三名', points: 0.4, allowCustomPoints: false },
    { optionCode: 'COMPETITION_TEAM_PROVINCIAL_FIRST', optionName: '团体-省部级及以上-第一名', points: 4, allowCustomPoints: false },
    { optionCode: 'COMPETITION_TEAM_PROVINCIAL_SECOND', optionName: '团体-省部级及以上-第二名', points: 3, allowCustomPoints: false },
    { optionCode: 'COMPETITION_TEAM_PROVINCIAL_THIRD', optionName: '团体-省部级及以上-第三名', points: 2, allowCustomPoints: false },
    { optionCode: 'COMPETITION_TEAM_PROVINCIAL_FOURTH', optionName: '团体-省部级及以上-第四名', points: 1, allowCustomPoints: false },
    { optionCode: 'COMPETITION_TEAM_UNIVERSITY_FIRST', optionName: '团体-校级-第一名', points: 1.5, allowCustomPoints: false },
    { optionCode: 'COMPETITION_TEAM_UNIVERSITY_SECOND', optionName: '团体-校级-第二名', points: 1, allowCustomPoints: false },
    { optionCode: 'COMPETITION_TEAM_UNIVERSITY_THIRD', optionName: '团体-校级-第三名', points: 0.5, allowCustomPoints: false },
    { optionCode: 'COMPETITION_TEAM_COLLEGE_FIRST', optionName: '团体-院级-第一名', points: 0.5, allowCustomPoints: false },
    { optionCode: 'COMPETITION_TEAM_COLLEGE_SECOND', optionName: '团体-院级-第二名', points: 0.3, allowCustomPoints: false },
    { optionCode: 'COMPETITION_TEAM_COLLEGE_THIRD', optionName: '团体-院级-第三名', points: 0.2, allowCustomPoints: false },
    { optionCode: 'COMPETITION_NO_AWARD_WITH_MENTOR', optionName: '参赛未获奖-有导师参与', points: 0.4, allowCustomPoints: false },
    { optionCode: 'COMPETITION_NO_AWARD_NO_MENTOR', optionName: '参赛未获奖-无导师参与', points: 0.2, allowCustomPoints: false }
  ],
  SPORTS_ART_CONTRIBUTION: [
    { optionCode: 'ART_RECOMMENDED_TO_SCHOOL', optionName: '经学院审核推荐至学校', points: 0.2, allowCustomPoints: false },
    { optionCode: 'ART_MEDIA_ACCEPTED', optionName: '被校级及以上媒体录用', points: 0.5, allowCustomPoints: false },
    { optionCode: 'ART_MULTI_AUTHOR', optionName: '多人合作完成', points: null, description: '多人合作完成时，根据贡献量填写实际分值', allowCustomPoints: true }
  ],
  SPORTS_OTHER: [
    { optionCode: 'OTHER_CUSTOM', optionName: '其他活动', points: null, description: '无固定评分标准，由学生填写申请分值并提交审核', allowCustomPoints: true }
  ],
  LABOR_SOCIAL_WORK: [
    { optionCode: 'WORK_COUNSELOR', optionName: '带班兼职辅导员', points: 5, allowCustomPoints: false },
    { optionCode: 'WORK_COLLEGE_HEAD', optionName: '院级部门负责人', points: 2, allowCustomPoints: false },
    { optionCode: 'WORK_COLLEGE_STAFF', optionName: '院级干事/其他学生干部', points: 1.5, allowCustomPoints: false }
  ]
}

const baseCategoryIndexes: Record<CategoryId, SharedIndexItem[]> = {
  moral: [
    {
      id: 1,
      itemCode: 'MORAL_IDEOLOGY',
      title: '思想教育',
      criteria: '拥护中国共产党领导，不断加强思想政治理论学习，树立中国特色社会主义共同理想；热爱祖国、维护团结统一、爱好和平；遵守公民道德规范，积极培育和践行社会主义核心价值观，记3分。按要求参加学校组织的各项思想政治教育活动，记2分，无故不参加，一次扣0.2分。',
      maxPoints: '5',
      scholarshipRequirement: '9分及以上',
      hasApplication: true,
      canApply: true,
      status: 'approved',
      currentScore: '4.8'
    },
    {
      id: 2,
      itemCode: 'MORAL_DAILY_BEHAVIOR',
      title: '日常表现',
      criteria: '遵纪守法，遵守研究生手册规定，服从管理，按时完成新学期学籍注册报到、严格遵守请销假制度，不按要求完成，一次扣0.2分；按时完成学校学院布置的各项任务，未在规定时间内完成，一次扣0.05分。',
      maxPoints: '5',
      scholarshipRequirement: '9分及以上',
      hasApplication: true,
      canApply: false,
      status: 'approved',
      currentScore: '4.9'
    },
    {
      id: 3,
      itemCode: 'MORAL_REWARD_PUNISHMENT',
      title: '奖惩',
      criteria: '获省级及以上荣誉称号，记3分；获校级荣誉称号，记1.5分；获学校通报表扬，一人次记1分；经学院审核，获学院通报表扬，一人次记0.5分；通报表扬累计不超过2次，必须有文件形式的证明（同一事由不同级别不能累加）；获学院通报批评，一人次减0.5分，获年级通报批评一人次减0.3分。',
      maxPoints: '6',
      scholarshipRequirement: '参评学年未受纪律处分、无违法违纪记录才有参评资格',
      hasApplication: false,
      canApply: true
    }
  ],
  intellectual: [
    {
      id: 1,
      itemCode: 'INTELLECTUAL_GRADE',
      title: '学习成绩',
      criteria: 'A＝∑（所修所有课程考核成绩×课程学分）/∑课程总学分；B＝∑（本学年度所修课程考核成绩×课程学分）/∑课程总学分（在研究生学业奖学金评定中，硕士二年级A×60%，硕士三年级A×30%，博士生A×10%；在硕士研究生国家奖学金评定中，B×50%）',
      maxPoints: '无',
      scholarshipRequirement: '参评学年无不及格课程且满足培养计划要求',
      hasApplication: false,
      canApply: false,
      currentScore: '92.5'
    },
    {
      id: 2,
      itemCode: 'INTELLECTUAL_PAPER',
      title: '论文',
      criteria: 'Ⅰ类第一档，记36分；Ⅰ类第二档，记24分；Ⅱ类第三档，记12分；Ⅲ类第四档，记6分；Ⅲ类第五档，记5分；Ⅳ类第六档，记3分；Ⅳ类第七档，记2分。被EI、SCI期刊收录，但尚未检索的按80%计算（限毕业班学生）。非核心期刊和增刊不加分；论文级别以发表当年为准；论文详细目录见其他说明。',
      maxPoints: '无',
      scholarshipRequirement: '研究生第一、第二学年参评：0.4分及以上',
      hasApplication: true,
      canApply: true,
      status: 'pending',
      currentScore: '6.0'
    },
    {
      id: 3,
      itemCode: 'INTELLECTUAL_PATENT',
      title: '专利',
      criteria: '获得国家发明专利授权，记6分；获得国家发明专利受理，记2分；获得国家实用新型专利授权，记2分；获得国家实用新型专利受理，记1分。',
      maxPoints: '无',
      scholarshipRequirement: '',
      hasApplication: false,
      canApply: true
    },
    {
      id: 4,
      itemCode: 'INTELLECTUAL_COMPETITION',
      title: '学术科技竞赛',
      criteria: '获奖加分明细见其他说明。',
      maxPoints: '无',
      scholarshipRequirement: '研究生第一、第二学年参评：0.4分及以上',
      hasApplication: true,
      canApply: true,
      status: 'monitor_approved',
      currentScore: '5.0'
    },
    {
      id: 5,
      itemCode: 'INTELLECTUAL_ACADEMIC_ACTIVITY',
      title: '学术活动',
      criteria: '在有较大影响的、系列性的国际学术会议（线下举办）全英文宣读论文，记0.5分；参加国际性、全国性学术活动，0.2分/人次。（最多累计两次，以加分最高分记）。',
      maxPoints: '1',
      scholarshipRequirement: '',
      hasApplication: false,
      canApply: true
    },
    {
      id: 6,
      itemCode: 'INTELLECTUAL_LECTURE',
      title: '学术讲座',
      criteria: '参加学院组织的学术讲座，每次记0.2分，最多记2分。',
      maxPoints: '2',
      scholarshipRequirement: '',
      hasApplication: false,
      canApply: false,
      currentScore: '1.2'
    },
    {
      id: 7,
      itemCode: 'INTELLECTUAL_MENTOR_EVALUATION',
      title: '导师评价',
      criteria: '研究生导师依据研究生该学年日常表现给予相应分数，满分5分。导师按照近两年科学研究工作量和学生对科学研究工作量的贡献程度为学生赋予相应的科研加分，满分5分。',
      maxPoints: '10',
      scholarshipRequirement: '',
      hasApplication: false,
      canApply: false,
      currentScore: '8.5'
    }
  ],
  sports: [
    {
      id: 1,
      itemCode: 'SPORTS_COMPETITION',
      title: '文体竞赛',
      criteria: '积极参加各级各类文体竞赛。获奖加分无上限；参赛但未获奖时，有导师参与记0.4分，无导师参与记0.2分，最多记4次；同一比赛项目的参与分和获奖分不同时加分。',
      maxPoints: '获奖加分无上限；参与未获奖加分最多4次',
      scholarshipRequirement: '研究生第一、第二学年参评：文体竞赛与文艺征稿合计0.2分及以上',
      hasApplication: true,
      canApply: true,
      status: 'approved',
      currentScore: '4.0'
    },
    {
      id: 2,
      itemCode: 'SPORTS_ART_CONTRIBUTION',
      title: '文艺征稿',
      criteria: '积极参加各类文化艺术作品征稿，作品经学院审核推荐至学校，记0.2分；作品被校级及以上媒体录用记0.5分，同一作品取最高分记。若作品为多人合作完成，根据贡献量自行分配加分。',
      maxPoints: '同一作品取最高分',
      scholarshipRequirement: '研究生第一、第二学年参评：文体竞赛与文艺征稿合计0.2分及以上',
      hasApplication: false,
      canApply: true
    },
    {
      id: 3,
      itemCode: 'SPORTS_OTHER',
      title: '其他',
      criteria: '其他体育美育相关活动，根据活动级别和参与情况酌情加分。',
      maxPoints: '无',
      scholarshipRequirement: '无',
      hasApplication: false,
      canApply: true
    }
  ],
  labor: [
    {
      id: 1,
      itemCode: 'LABOR_SOCIAL_WORK',
      title: '社会工作',
      criteria: '担任班级干部记1-2分，院系学生干部记2-3分，校级学生干部记3-4分，根据工作表现酌情加分。',
      maxPoints: '4',
      scholarshipRequirement: '',
      hasApplication: true,
      canApply: true,
      status: 'pending',
      currentScore: '2.0'
    },
    {
      id: 2,
      itemCode: 'LABOR_SOCIAL_PRACTICE',
      title: '社会实践',
      criteria: '暑期社会实践记3分，勤工助学记2分，专业实习记4分，志愿服务记1分/次。',
      maxPoints: '无',
      scholarshipRequirement: '',
      hasApplication: false,
      canApply: true
    },
    {
      id: 3,
      itemCode: 'LABOR_CULTURE_CONSTRUCTION',
      title: '两室文化建设',
      criteria: '宿舍文化建设记2分，教室文化建设记2分，文化活动组织记1.5分。',
      maxPoints: '无',
      scholarshipRequirement: '',
      hasApplication: false,
      canApply: true
    }
  ]
}

function buildItem(item: SharedIndexItem): SharedIndexItem {
  const parsedMaxPoints = Number(item.maxPoints)
  return {
    ...item,
    options: (localOptionCatalog[item.itemCode] || []).map((option) => ({ ...option })),
    maxPointsValue: Number.isFinite(parsedMaxPoints) ? parsedMaxPoints : null
  }
}

export const categoryIndexes: Record<CategoryId, SharedIndexItem[]> = {
  moral: baseCategoryIndexes.moral.map(buildItem),
  intellectual: baseCategoryIndexes.intellectual.map(buildItem),
  sports: baseCategoryIndexes.sports.map(buildItem),
  labor: baseCategoryIndexes.labor.map(buildItem)
}

export function createCategoryIndexesSnapshot(): Record<CategoryId, SharedIndexItem[]> {
  return {
    moral: categoryIndexes.moral.map((item) => ({ ...item, options: item.options?.map((option) => ({ ...option })) || [] })),
    intellectual: categoryIndexes.intellectual.map((item) => ({ ...item, options: item.options?.map((option) => ({ ...option })) || [] })),
    sports: categoryIndexes.sports.map((item) => ({ ...item, options: item.options?.map((option) => ({ ...option })) || [] })),
    labor: categoryIndexes.labor.map((item) => ({ ...item, options: item.options?.map((option) => ({ ...option })) || [] }))
  }
}
