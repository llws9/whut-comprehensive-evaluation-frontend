import { describe, expect, it, vi } from 'vitest'

import { createRoleTemplatesPageState } from './role-templates-page-state'

describe('role templates page state', () => {
  it('loads first page from backend with default pagination', async () => {
    const listRoles = vi.fn(async () => ({
      total: 1,
      records: [
        {
          roleId: '4006',
          roleCode: 'PLATFORM_ADMIN',
          roleName: '平台管理员',
          roleScope: 'ALL',
          status: 'ACTIVE',
          permissionCount: 6,
          createdAt: '2026-05-01T09:25:00'
        }
      ]
    }))
    const state = createRoleTemplatesPageState({ listRoles })

    await state.loadRoles('access-token')

    expect(listRoles).toHaveBeenCalledWith('access-token', {
      pageNo: 1,
      pageSize: 20,
      keyword: undefined,
      status: undefined
    })
    expect(state.roles.value[0]?.roleCode).toBe('PLATFORM_ADMIN')
    expect(state.total.value).toBe(1)
    expect(state.errorMessage.value).toBe('')
  })

  it('creates role then closes form and reloads current list', async () => {
    const listRoles = vi
      .fn()
      .mockResolvedValueOnce({
        total: 1,
        records: [
          {
            roleId: '4006',
            roleCode: 'PLATFORM_ADMIN',
            roleName: '平台管理员',
            roleScope: 'ALL',
            status: 'ACTIVE',
            permissionCount: 6,
            createdAt: '2026-05-01T09:25:00'
          }
        ]
      })
      .mockResolvedValueOnce({
        total: 2,
        records: [
          {
            roleId: '4006',
            roleCode: 'PLATFORM_ADMIN',
            roleName: '平台管理员',
            roleScope: 'ALL',
            status: 'ACTIVE',
            permissionCount: 6,
            createdAt: '2026-05-01T09:25:00'
          },
          {
            roleId: '4007',
            roleCode: 'COLLEGE_OPERATOR',
            roleName: '学院操作员',
            roleScope: 'ORG_SUBTREE',
            status: 'ACTIVE',
            permissionCount: 0,
            createdAt: '2026-05-23T10:00:00'
          }
        ]
      })
    const createRole = vi.fn(async () => ({
      roleId: '4007',
      roleCode: 'COLLEGE_OPERATOR',
      roleName: '学院操作员',
      roleScope: 'ORG_SUBTREE',
      status: 'ACTIVE'
    }))
    const state = createRoleTemplatesPageState({ listRoles, createRole })

    await state.loadRoles('access-token')
    state.openCreateForm()
    state.createForm.roleCode.value = ' COLLEGE_OPERATOR '
    state.createForm.roleName.value = ' 学院操作员 '
    state.createForm.roleScope.value = 'ORG_SUBTREE'

    await state.submitCreateRole('access-token')

    expect(createRole).toHaveBeenCalledWith('access-token', {
      roleCode: 'COLLEGE_OPERATOR',
      roleName: '学院操作员',
      roleScope: 'ORG_SUBTREE'
    })
    expect(listRoles).toHaveBeenNthCalledWith(2, 'access-token', {
      pageNo: 1,
      pageSize: 20,
      keyword: undefined,
      status: undefined
    })
    expect(state.isCreateFormVisible.value).toBe(false)
    expect(state.createForm.roleCode.value).toBe('')
    expect(state.createForm.roleName.value).toBe('')
    expect(state.errorMessage.value).toBe('')
  })

  it('shows conflict message and keeps edit state when role update fails with snapshot conflict', async () => {
    const role = {
      roleId: '4006',
      roleCode: 'PLATFORM_ADMIN',
      roleName: '平台管理员',
      roleScope: 'ALL',
      status: 'ACTIVE',
      permissionCount: 6,
      createdAt: '2026-05-01T09:25:00'
    }
    const listRoles = vi.fn(async () => ({
      total: 1,
      records: [role]
    }))
    const updateRole = vi.fn(async () => {
      throw new Error('角色模板已被他人更新，请刷新后重试')
    })
    const state = createRoleTemplatesPageState({ listRoles, updateRole })

    await state.loadRoles('access-token')
    state.startEditRole(role)
    state.editForm.roleName.value = '平台管理员-新'

    await state.submitEditRole('access-token')

    expect(updateRole).toHaveBeenCalledTimes(1)
    expect(listRoles).toHaveBeenCalledTimes(1)
    expect(state.editingRoleId.value).toBe('4006')
    expect(state.errorMessage.value).toBe('角色模板已被他人更新，请刷新后重试')
  })

  it('loads permission dictionary lazily only once', async () => {
    const listRoles = vi.fn(async () => ({
      total: 1,
      records: [
        {
          roleId: '4006',
          roleCode: 'PLATFORM_ADMIN',
          roleName: '平台管理员',
          roleScope: 'ALL',
          status: 'ACTIVE',
          permissionCount: 6,
          createdAt: '2026-05-01T09:25:00'
        }
      ]
    }))
    const listPermissionDictionary = vi.fn(async () => [
      {
        permissionCode: 'permission.manage',
        permissionName: '权限管理',
        module: 'iam',
        description: '权限管理',
        status: 'ACTIVE'
      }
    ])
    const state = createRoleTemplatesPageState({ listRoles, listPermissionDictionary })

    await state.loadRoles('access-token')
    await state.openPermissionEditor('access-token', state.roles.value[0]!, {
      canManagePermissions: true
    })
    await state.openPermissionEditor('access-token', state.roles.value[0]!, {
      canManagePermissions: true
    })

    expect(listPermissionDictionary).toHaveBeenCalledTimes(1)
    expect(state.permissionDictionary.value).toHaveLength(1)
  })

  it('does not request permission dictionary when current user lacks permission.manage', async () => {
    const role = {
      roleId: '4006',
      roleCode: 'PLATFORM_ADMIN',
      roleName: '平台管理员',
      roleScope: 'ALL',
      status: 'ACTIVE',
      permissionCount: 6,
      createdAt: '2026-05-01T09:25:00'
    }
    const listPermissionDictionary = vi.fn(async () => [
      {
        permissionCode: 'user.manage',
        permissionName: '用户管理',
        module: 'manage',
        description: '用户管理',
        status: 'ACTIVE'
      }
    ])
    const state = createRoleTemplatesPageState({ listPermissionDictionary })

    await state.openPermissionEditor('access-token', role, {
      canManagePermissions: false
    })

    expect(listPermissionDictionary).toHaveBeenCalledTimes(0)
    expect(state.permissionBindingReadOnly.value).toBe(true)
    expect(state.permissionBindingReadOnlyMessage.value).toBe(
      '当前账号缺少 `permission.manage`，无法查看权限字典，也不能保存权限绑定结果。'
    )
    expect(state.permissionDictionaryEmptyMessage.value).toBe(
      '当前账号缺少 `permission.manage`，无法查看权限字典，也不能保存权限绑定结果。'
    )
  })

  it('exposes stable current role headers for edit panel and permission binding panel', async () => {
    const role = {
      roleId: '4006',
      roleCode: 'PLATFORM_ADMIN',
      roleName: '平台管理员',
      roleScope: 'ALL',
      status: 'ACTIVE',
      permissionCount: 6,
      createdAt: '2026-05-01T09:25:00'
    }
    const listPermissionDictionary = vi.fn(async () => [])
    const state = createRoleTemplatesPageState({ listPermissionDictionary })

    state.startEditRole(role)
    expect(state.editingRoleHeaderLabel.value).toBe('当前编辑角色')
    expect(state.editingRoleHeaderText.value).toBe('平台管理员（PLATFORM_ADMIN）')

    await state.openPermissionEditor('access-token', role, {
      canManagePermissions: true
    })
    expect(state.permissionBindingHeaderLabel.value).toBe('当前绑定角色')
    expect(state.permissionBindingHeaderText.value).toBe('平台管理员（PLATFORM_ADMIN）')
  })

  it('switches from edit mode to permission binding mode to avoid dual editing context', async () => {
    const role = {
      roleId: '4006',
      roleCode: 'PLATFORM_ADMIN',
      roleName: '平台管理员',
      roleScope: 'ALL',
      status: 'ACTIVE',
      permissionCount: 6,
      createdAt: '2026-05-01T09:25:00'
    }
    const listRoles = vi.fn(async () => ({
      total: 1,
      records: [role]
    }))
    const listPermissionDictionary = vi.fn(async () => [])
    const state = createRoleTemplatesPageState({ listRoles, listPermissionDictionary })

    await state.loadRoles('access-token')
    state.startEditRole(role)

    await state.openPermissionEditor('access-token', role, {
      canManagePermissions: true
    })

    expect(state.editingRoleId.value).toBe('')
    expect(state.editForm.roleId.value).toBe('')
    expect(state.bindingPermissionRoleId.value).toBe('4006')
    expect(state.modeSwitchMessage.value).toBe(
      '已退出基础信息编辑，切换到角色「平台管理员（PLATFORM_ADMIN）」的权限绑定。'
    )
  })

  it('switches from permission binding mode to edit mode to avoid dual editing context', async () => {
    const role = {
      roleId: '4006',
      roleCode: 'PLATFORM_ADMIN',
      roleName: '平台管理员',
      roleScope: 'ALL',
      status: 'ACTIVE',
      permissionCount: 6,
      createdAt: '2026-05-01T09:25:00'
    }
    const state = createRoleTemplatesPageState()

    state.bindingPermissionRoleId.value = '4006'
    state.bindingPermissionRoleName.value = '平台管理员'
    state.bindingPermissionRoleCode.value = 'PLATFORM_ADMIN'
    state.selectedPermissionCodes.value = ['user.manage']
    state.permissionKeyword.value = 'user'

    state.startEditRole(role)

    expect(state.bindingPermissionRoleId.value).toBe('')
    expect(state.bindingPermissionRoleName.value).toBe('')
    expect(state.bindingPermissionRoleCode.value).toBe('')
    expect(state.selectedPermissionCodes.value).toEqual([])
    expect(state.permissionKeyword.value).toBe('')
    expect(state.editingRoleId.value).toBe('4006')
    expect(state.modeSwitchMessage.value).toBe(
      '已退出权限绑定，切换到角色「平台管理员（PLATFORM_ADMIN）」的基础信息编辑。'
    )
  })

  it('closes edit panel and clears transient edit state only', () => {
    const state = createRoleTemplatesPageState()

    state.editingRoleId.value = '4006'
    state.editForm.roleId.value = '4006'
    state.editForm.roleCode.value = 'PLATFORM_ADMIN'
    state.editForm.roleName.value = '平台管理员'
    state.editForm.roleScope.value = 'ALL'
    state.editForm.status.value = 'ACTIVE'
    state.editForm.snapshot.value = {
      roleName: '平台管理员',
      roleScope: 'ALL',
      status: 'ACTIVE'
    }
    state.modeSwitchMessage.value = '待清理提示'

    state.closeEditPanel()

    expect(state.editingRoleId.value).toBe('')
    expect(state.editForm.roleId.value).toBe('')
    expect(state.editForm.roleCode.value).toBe('')
    expect(state.editForm.roleName.value).toBe('')
    expect(state.editForm.roleScope.value).toBe('')
    expect(state.editForm.status.value).toBe('')
    expect(state.editForm.snapshot.value).toBeNull()
    expect(state.modeSwitchMessage.value).toBe('')
  })

  it('does not submit permission replacement when current user cannot manage permissions', async () => {
    const replaceRolePermissions = vi.fn(async () => undefined)
    const state = createRoleTemplatesPageState({ replaceRolePermissions })

    state.bindingPermissionRoleId.value = '4006'
    state.bindingPermissionRoleName.value = '平台管理员'
    state.bindingPermissionRoleCode.value = 'PLATFORM_ADMIN'
    state.selectedPermissionCodes.value = ['user.manage']
    state.permissionBindingReadOnly.value = true

    await state.submitReplacePermissions('access-token')

    expect(replaceRolePermissions).toHaveBeenCalledTimes(0)
    expect(state.errorMessage.value).toBe('当前账号无权限执行该操作')
    expect(state.permissionBindingReadOnlyMessage.value).toBe(
      '当前账号缺少 `permission.manage`，无法查看权限字典，也不能保存权限绑定结果。'
    )
  })

  it('closes permission binding panel and clears transient binding state only', () => {
    const state = createRoleTemplatesPageState()

    state.bindingPermissionRoleId.value = '4006'
    state.bindingPermissionRoleName.value = '平台管理员'
    state.bindingPermissionRoleCode.value = 'PLATFORM_ADMIN'
    state.permissionBindingReadOnly.value = true
    state.permissionKeyword.value = 'user'
    state.selectedPermissionCodes.value = ['user.manage']
    state.permissionDictionaryLoaded.value = true
    state.permissionDictionary.value = [
      {
        permissionCode: 'user.manage',
        permissionName: '用户管理',
        module: 'manage',
        description: '用户管理',
        status: 'ACTIVE'
      }
    ]

    state.closePermissionEditor()

    expect(state.bindingPermissionRoleId.value).toBe('')
    expect(state.bindingPermissionRoleName.value).toBe('')
    expect(state.bindingPermissionRoleCode.value).toBe('')
    expect(state.permissionBindingReadOnly.value).toBe(false)
    expect(state.permissionKeyword.value).toBe('')
    expect(state.selectedPermissionCodes.value).toEqual([])
    expect(state.permissionDictionaryLoaded.value).toBe(true)
    expect(state.permissionDictionary.value).toHaveLength(1)
  })

  it('submits empty permission array and reloads list after successful replacement', async () => {
    const listRoles = vi
      .fn()
      .mockResolvedValueOnce({
        total: 1,
        records: [
          {
            roleId: '4006',
            roleCode: 'PLATFORM_ADMIN',
            roleName: '平台管理员',
            roleScope: 'ALL',
            status: 'ACTIVE',
            permissionCount: 6,
            createdAt: '2026-05-01T09:25:00'
          }
        ]
      })
      .mockResolvedValueOnce({
        total: 1,
        records: [
          {
            roleId: '4006',
            roleCode: 'PLATFORM_ADMIN',
            roleName: '平台管理员',
            roleScope: 'ALL',
            status: 'ACTIVE',
            permissionCount: 0,
            createdAt: '2026-05-01T09:25:00'
          }
        ]
      })
    const replaceRolePermissions = vi.fn(async () => undefined)
    const state = createRoleTemplatesPageState({ listRoles, replaceRolePermissions })

    await state.loadRoles('access-token')
    state.bindingPermissionRoleId.value = '4006'
    state.permissionBindingReadOnly.value = false
    state.selectedPermissionCodes.value = []

    await state.submitReplacePermissions('access-token')

    expect(replaceRolePermissions).toHaveBeenCalledWith('access-token', '4006', {
      permissionCodes: []
    })
    expect(listRoles).toHaveBeenNthCalledWith(2, 'access-token', {
      pageNo: 1,
      pageSize: 20,
      keyword: undefined,
      status: undefined
    })
    expect(state.errorMessage.value).toBe('')
  })

  it('blocks edit submission when role scope is unknown', async () => {
    const state = createRoleTemplatesPageState()

    state.editingRoleId.value = '4008'
    state.editForm.roleId.value = '4008'
    state.editForm.roleCode.value = 'UNKNOWN_ROLE'
    state.editForm.roleName.value = '未知角色'
    state.editForm.roleScope.value = 'CUSTOM_SCOPE'
    state.editForm.status.value = 'ACTIVE'
    state.editForm.snapshot.value = {
      roleName: '未知角色',
      roleScope: 'CUSTOM_SCOPE',
      status: 'ACTIVE'
    }

    expect(state.hasKnownEditRoleScope.value).toBe(false)

    await state.submitEditRole('access-token')

    expect(state.errorMessage.value).toBe('当前角色范围不在前端已知枚举中，禁止保存')
  })

  it('uses different empty-state copy for initial empty list and filtered empty list', async () => {
    const state = createRoleTemplatesPageState()

    expect(state.roleListEmptyMessage.value).toBe('暂无角色模板，请先创建角色模板。')

    state.searchKeyword.value = '平台'
    expect(state.roleListEmptyMessage.value).toBe('当前筛选条件下暂无角色模板，请调整关键字或状态后重试。')

    state.searchKeyword.value = ''
    state.selectedStatus.value = 'ACTIVE'
    expect(state.roleListEmptyMessage.value).toBe('当前筛选条件下暂无角色模板，请调整关键字或状态后重试。')
  })

  it('uses different permission empty-state copy for empty dictionary and unmatched search keyword', async () => {
    const state = createRoleTemplatesPageState()

    expect(state.permissionDictionaryEmptyMessage.value).toBe('权限字典当前为空，暂时无法绑定角色权限。')

    state.permissionDictionary.value = [
      {
        permissionCode: 'user.manage',
        permissionName: '用户管理',
        module: 'manage',
        description: '用户管理',
        status: 'ACTIVE'
      }
    ]
    state.permissionKeyword.value = 'missing'

    expect(state.filteredPermissionDictionary.value).toHaveLength(0)
    expect(state.permissionDictionaryEmptyMessage.value).toBe('没有匹配当前搜索条件的权限项，请调整关键字后重试。')
  })

  it('exposes a dedicated full replace warning for permission binding area', () => {
    const state = createRoleTemplatesPageState()

    expect(state.permissionReplaceModeTitle.value).toBe('当前为全量覆盖模式')
    expect(state.permissionReplaceModeDescription.value).toBe(
      '本次保存会用当前勾选结果整体替换角色权限；由于接口未提供已绑权限明细，未勾选项也会被一并移除。'
    )
  })
})
