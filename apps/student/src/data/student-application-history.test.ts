import { describe, expect, it } from 'vitest'

import {
  applicationHistoryRecords,
  filterApplicationHistoryRecords,
} from './student-application-history'

describe('student-application-history', () => {
  it('filters records by category and keyword', () => {
    const records = filterApplicationHistoryRecords(applicationHistoryRecords, {
      categoryId: 'sports',
      keyword: '征稿',
    })

    expect(records).toHaveLength(1)
    expect(records[0]?.itemCode).toBe('SPORTS_ART_CONTRIBUTION')
    expect(records[0]?.title).toContain('征稿')
  })

  it('keeps record-oriented fields for list rendering', () => {
    const record = applicationHistoryRecords[0]

    expect(record).toMatchObject({
      applicationId: expect.any(Number),
      title: expect.any(String),
      categoryId: expect.any(String),
      itemTitle: expect.any(String),
      academicYear: expect.any(String),
      term: expect.any(String),
      status: expect.any(String),
      updatedAt: expect.any(String),
    })
  })
})
