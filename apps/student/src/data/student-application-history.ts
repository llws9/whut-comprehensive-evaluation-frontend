import type { CategoryId } from './student-application-shared'

export type StudentApplicationRecordStatus =
  | 'draft'
  | 'pending'
  | 'monitor_approved'
  | 'approved'
  | 'rejected'

export interface StudentApplicationRecord {
  applicationId: number
  title: string
  categoryId: CategoryId
  categoryLabel: string
  itemCode: string
  itemTitle: string
  academicYear: string
  term: string
  status: StudentApplicationRecordStatus
  appliedPoints: string
  updatedAt: string
}

export const applicationHistoryRecords: StudentApplicationRecord[] = [
  {
    applicationId: 20260518001,
    title: '全国大学生数学建模竞赛校赛一等奖',
    categoryId: 'intellectual',
    categoryLabel: '智育',
    itemCode: 'INTELLECTUAL_COMPETITION',
    itemTitle: '学科竞赛',
    academicYear: '2025-2026',
    term: '上学期',
    status: 'approved',
    appliedPoints: '5.00',
    updatedAt: '2026-05-16 14:32',
  },
  {
    applicationId: 20260518002,
    title: '院级志愿服务优秀志愿者',
    categoryId: 'moral',
    categoryLabel: '德育',
    itemCode: 'MORAL_VOLUNTEER',
    itemTitle: '志愿服务',
    academicYear: '2025-2026',
    term: '上学期',
    status: 'pending',
    appliedPoints: '1.50',
    updatedAt: '2026-05-17 09:18',
  },
  {
    applicationId: 20260518003,
    title: '校园文化作品征稿录用',
    categoryId: 'sports',
    categoryLabel: '体育与美育',
    itemCode: 'SPORTS_ART_CONTRIBUTION',
    itemTitle: '文艺征稿',
    academicYear: '2025-2026',
    term: '上学期',
    status: 'monitor_approved',
    appliedPoints: '0.50',
    updatedAt: '2026-05-18 11:06',
  },
  {
    applicationId: 20260518004,
    title: '校运会男子 100 米二等奖',
    categoryId: 'sports',
    categoryLabel: '体育与美育',
    itemCode: 'SPORTS_COMPETITION',
    itemTitle: '文体竞赛',
    academicYear: '2025-2026',
    term: '上学期',
    status: 'rejected',
    appliedPoints: '0.20',
    updatedAt: '2026-05-15 18:40',
  },
  {
    applicationId: 20260518005,
    title: '暑期社会实践先进个人',
    categoryId: 'labor',
    categoryLabel: '劳育',
    itemCode: 'LABOR_PRACTICE',
    itemTitle: '社会实践',
    academicYear: '2025-2026',
    term: '上学期',
    status: 'draft',
    appliedPoints: '2.00',
    updatedAt: '2026-05-14 20:10',
  },
]

export interface FilterApplicationHistoryInput {
  categoryId: CategoryId | 'all'
  keyword: string
}

export const filterApplicationHistoryRecords = (
  records: StudentApplicationRecord[],
  input: FilterApplicationHistoryInput
): StudentApplicationRecord[] => {
  const keyword = input.keyword.trim()

  return records.filter((record) => {
    const matchesCategory = input.categoryId === 'all' || record.categoryId === input.categoryId
    if (!matchesCategory) {
      return false
    }

    if (!keyword) {
      return true
    }

    return [
      record.title,
      record.itemTitle,
      record.categoryLabel,
      record.academicYear,
      record.term,
    ].some((field) => field.includes(keyword))
  })
}
