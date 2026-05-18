import { describe, expect, it } from 'vitest'

import {
  createEmptyApplicationFormData,
  getApplicationFormSchema,
  isApplicationFormComplete,
} from './student-application-form'

describe('student-application-form', () => {
  it('requires contribution note for multi-author art submissions', () => {
    const formData = createEmptyApplicationFormData()
    formData.title = '作品名称'
    formData.date = '2026-05-18'
    formData.location = '校报'
    formData.description = '作品说明'

    const schema = getApplicationFormSchema('SPORTS_ART_CONTRIBUTION', 'ART_MULTI_AUTHOR')

    expect(schema.fields.some((field) => field.key === 'contributionNote')).toBe(true)
    expect(isApplicationFormComplete(schema, formData)).toBe(false)

    formData.contributionNote = '本人负责主要文字撰写'

    expect(isApplicationFormComplete(schema, formData)).toBe(true)
  })

  it('allows optional competition fields to stay empty', () => {
    const formData = createEmptyApplicationFormData()
    formData.title = '校运会'
    formData.date = '2026-05-18'
    formData.description = '参加男子 100 米并获奖'

    const schema = getApplicationFormSchema('SPORTS_COMPETITION')

    expect(isApplicationFormComplete(schema, formData)).toBe(true)
  })
})
