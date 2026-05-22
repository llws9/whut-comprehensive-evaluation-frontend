import { describe, expect, it, vi } from 'vitest'

import {
  createStudentsPageState,
  resolveStatusActionLabel,
  supportsStatusToggle
} from './students-page-state'

describe('students page state', () => {
  it('loads first page from backend with default pagination', async () => {
    const listUsers = vi.fn(async () => ({
      total: 1,
      records: [
        {
          userId: '1010',
          userNo: '2024305001',
          userName: '王老师',
          status: 'ACTIVE' as const,
          orgUnits: ['计算机与人工智能学院'],
          roleCodes: ['REVIEWER'],
          createdAt: '2026-05-20T10:00:00'
        }
      ]
    }))
    const state = createStudentsPageState({ listUsers })

    await state.loadUsers('access-token')

    expect(listUsers).toHaveBeenCalledWith('access-token', {
      pageNo: 1,
      pageSize: 20,
      keyword: undefined,
      status: undefined
    })
    expect(state.students.value[0]?.userName).toBe('王老师')
    expect(state.total.value).toBe(1)
    expect(state.errorMessage.value).toBe('')
  })

  it('searches by keyword and status from the first page', async () => {
    const listUsers = vi.fn(async () => ({
      total: 2,
      records: []
    }))
    const state = createStudentsPageState({ listUsers })

    state.pageNo.value = 3
    state.searchKeyword.value = '张三'
    state.selectedStatus.value = 'DISABLED'

    await state.searchUsers('access-token')

    expect(listUsers).toHaveBeenCalledWith('access-token', {
      pageNo: 1,
      pageSize: 20,
      keyword: '张三',
      status: 'DISABLED'
    })
    expect(state.pageNo.value).toBe(1)
  })

  it('updates user status then reloads current list', async () => {
    const listUsers = vi
      .fn()
      .mockResolvedValueOnce({
        total: 1,
        records: [
          {
            userId: '1010',
            userNo: '2024305001',
            userName: '王老师',
            status: 'ACTIVE' as const,
            orgUnits: ['计算机与人工智能学院'],
            roleCodes: ['REVIEWER'],
            createdAt: '2026-05-20T10:00:00'
          }
        ]
      })
      .mockResolvedValueOnce({
        total: 1,
        records: [
          {
            userId: '1010',
            userNo: '2024305001',
            userName: '王老师',
            status: 'DISABLED' as const,
            orgUnits: ['计算机与人工智能学院'],
            roleCodes: ['REVIEWER'],
            createdAt: '2026-05-20T10:00:00'
          }
        ]
      })
    const updateUserStatus = vi.fn(async () => undefined)
    const state = createStudentsPageState({ listUsers, updateUserStatus })

    await state.loadUsers('access-token')
    await state.changeUserStatus('access-token', state.students.value[0]!)

    expect(updateUserStatus).toHaveBeenCalledWith('access-token', '1010', {
      status: 'DISABLED',
      reason: 'manage students page toggle'
    })
    expect(listUsers).toHaveBeenNthCalledWith(2, 'access-token', {
      pageNo: 1,
      pageSize: 20,
      keyword: undefined,
      status: undefined
    })
    expect(state.students.value[0]?.status).toBe('DISABLED')
    expect(state.errorMessage.value).toBe('')
  })

  it('shows error when user status update fails', async () => {
    const listUsers = vi.fn(async () => ({
      total: 1,
      records: [
        {
          userId: '1010',
          userNo: '2024305001',
          userName: '王老师',
          status: 'ACTIVE' as const,
          orgUnits: ['计算机与人工智能学院'],
          roleCodes: ['REVIEWER'],
          createdAt: '2026-05-20T10:00:00'
        }
      ]
    }))
    const updateUserStatus = vi.fn(async () => {
      throw new Error('状态更新失败')
    })
    const state = createStudentsPageState({ listUsers, updateUserStatus })

    await state.loadUsers('access-token')
    await state.changeUserStatus('access-token', state.students.value[0]!)

    expect(updateUserStatus).toHaveBeenCalledTimes(1)
    expect(listUsers).toHaveBeenCalledTimes(1)
    expect(state.students.value[0]?.status).toBe('ACTIVE')
    expect(state.errorMessage.value).toBe('状态更新失败')
  })

  it('does not update locked users from the students page', async () => {
    const lockedStudent = {
      userId: '1012',
      userNo: '2024305009',
      userName: '锁定用户',
      status: 'LOCKED' as const,
      orgUnits: ['计算机与人工智能学院'],
      roleCodes: ['STUDENT'],
      createdAt: '2026-05-22T10:00:00'
    }
    const listUsers = vi.fn(async () => ({
      total: 1,
      records: [lockedStudent]
    }))
    const updateUserStatus = vi.fn(async () => undefined)
    const state = createStudentsPageState({ listUsers, updateUserStatus })

    await state.loadUsers('access-token')
    await state.changeUserStatus('access-token', lockedStudent)

    expect(updateUserStatus).toHaveBeenCalledTimes(0)
    expect(listUsers).toHaveBeenCalledTimes(1)
    expect(state.errorMessage.value).toBe('')
  })

  it('only exposes status toggle actions for active and disabled users', () => {
    expect(supportsStatusToggle('ACTIVE')).toBe(true)
    expect(supportsStatusToggle('DISABLED')).toBe(true)
    expect(supportsStatusToggle('LOCKED')).toBe(false)
    expect(resolveStatusActionLabel('ACTIVE')).toBe('禁用')
    expect(resolveStatusActionLabel('DISABLED')).toBe('启用')
    expect(resolveStatusActionLabel('LOCKED')).toBe('')
  })

  it('creates user then closes form and reloads current list', async () => {
    const listUsers = vi
      .fn()
      .mockResolvedValueOnce({
        total: 1,
        records: [
          {
            userId: '1010',
            userNo: '2024305001',
            userName: '王老师',
            status: 'ACTIVE' as const,
            orgUnits: ['计算机与人工智能学院'],
            roleCodes: ['REVIEWER'],
            createdAt: '2026-05-20T10:00:00'
          }
        ]
      })
      .mockResolvedValueOnce({
        total: 2,
        records: [
          {
            userId: '1010',
            userNo: '2024305001',
            userName: '王老师',
            status: 'ACTIVE' as const,
            orgUnits: ['计算机与人工智能学院'],
            roleCodes: ['REVIEWER'],
            createdAt: '2026-05-20T10:00:00'
          },
          {
            userId: '1011',
            userNo: '2024305002',
            userName: '李老师',
            status: 'ACTIVE' as const,
            orgUnits: ['软件工程系'],
            roleCodes: ['COUNSELOR'],
            createdAt: '2026-05-21T10:00:00'
          }
        ]
      })
    const createUser = vi.fn(async () => ({
      userId: '1011',
      userNo: '2024305002',
      userName: '李老师',
      status: 'ACTIVE' as const
    }))
    const state = createStudentsPageState({ listUsers, createUser })

    await state.loadUsers('access-token')
    state.openCreateForm()
    state.createForm.userNo.value = ' 2024305002 '
    state.createForm.userName.value = ' 李老师 '
    state.createForm.password.value = 'ChangeMe123!'

    await state.submitCreateUser('access-token')

    expect(createUser).toHaveBeenCalledWith('access-token', {
      userNo: '2024305002',
      userName: '李老师',
      password: 'ChangeMe123!'
    })
    expect(listUsers).toHaveBeenNthCalledWith(2, 'access-token', {
      pageNo: 1,
      pageSize: 20,
      keyword: undefined,
      status: undefined
    })
    expect(state.isCreateFormVisible.value).toBe(false)
    expect(state.createForm.userNo.value).toBe('')
    expect(state.createForm.userName.value).toBe('')
    expect(state.createForm.password.value).toBe('')
    expect(state.errorMessage.value).toBe('')
  })

  it('keeps create form open when user creation fails', async () => {
    const listUsers = vi.fn(async () => ({
      total: 0,
      records: []
    }))
    const createUser = vi.fn(async () => {
      throw new Error('用户编号已存在')
    })
    const state = createStudentsPageState({ listUsers, createUser })

    state.openCreateForm()
    state.createForm.userNo.value = '2024305002'
    state.createForm.userName.value = '李老师'
    state.createForm.password.value = 'ChangeMe123!'

    await state.submitCreateUser('access-token')

    expect(createUser).toHaveBeenCalledTimes(1)
    expect(listUsers).toHaveBeenCalledTimes(0)
    expect(state.isCreateFormVisible.value).toBe(true)
    expect(state.createForm.userNo.value).toBe('2024305002')
    expect(state.errorMessage.value).toBe('用户编号已存在')
  })

  it('imports users then stores summary and reloads current list', async () => {
    const file = new File(['fake-xlsx'], 'users.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const listUsers = vi
      .fn()
      .mockResolvedValueOnce({
        total: 1,
        records: [
          {
            userId: '1010',
            userNo: '2024305001',
            userName: '王老师',
            status: 'ACTIVE' as const,
            orgUnits: ['计算机与人工智能学院'],
            roleCodes: ['REVIEWER'],
            createdAt: '2026-05-20T10:00:00'
          }
        ]
      })
      .mockResolvedValueOnce({
        total: 2,
        records: [
          {
            userId: '1010',
            userNo: '2024305001',
            userName: '王老师',
            status: 'ACTIVE' as const,
            orgUnits: ['计算机与人工智能学院'],
            roleCodes: ['REVIEWER'],
            createdAt: '2026-05-20T10:00:00'
          },
          {
            userId: '1011',
            userNo: '2024305002',
            userName: '李老师',
            status: 'ACTIVE' as const,
            orgUnits: ['软件工程系'],
            roleCodes: ['COUNSELOR'],
            createdAt: '2026-05-21T10:00:00'
          }
        ]
      })
    const importUsers = vi.fn(async () => ({
      totalCount: 3,
      successCount: 2,
      failedCount: 1,
      failedRows: [
        {
          rowNo: 4,
          userNo: '2024305003',
          reason: 'userName 不能为空'
        }
      ]
    }))
    const state = createStudentsPageState({ listUsers, importUsers })

    await state.loadUsers('access-token')
    state.openImportForm()
    state.importForm.file.value = file
    state.importForm.importMode.value = 'INSERT_ONLY'

    await state.submitImportUsers('access-token')

    expect(importUsers).toHaveBeenCalledWith('access-token', {
      file,
      importMode: 'INSERT_ONLY'
    })
    expect(listUsers).toHaveBeenNthCalledWith(2, 'access-token', {
      pageNo: 1,
      pageSize: 20,
      keyword: undefined,
      status: undefined
    })
    expect(state.importResult.value?.successCount).toBe(2)
    expect(state.importResult.value?.failedRows[0]?.rowNo).toBe(4)
    expect(state.isImportFormVisible.value).toBe(false)
    expect(state.importForm.file.value).toBeNull()
    expect(state.errorMessage.value).toBe('')
  })

  it('keeps selected file and importMode when import fails', async () => {
    const file = new File(['fake-xlsx'], 'users.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const listUsers = vi.fn(async () => ({
      total: 0,
      records: []
    }))
    const importUsers = vi.fn(async () => {
      throw new Error('模板错误')
    })
    const state = createStudentsPageState({ listUsers, importUsers })

    state.openImportForm()
    state.importForm.file.value = file
    state.importForm.importMode.value = 'INSERT_ONLY'

    await state.submitImportUsers('access-token')

    expect(importUsers).toHaveBeenCalledTimes(1)
    expect(listUsers).toHaveBeenCalledTimes(0)
    expect(state.isImportFormVisible.value).toBe(true)
    expect(state.importForm.file.value).toBe(file)
    expect(state.importForm.importMode.value).toBe('INSERT_ONLY')
    expect(state.errorMessage.value).toBe('模板错误')
  })
})
