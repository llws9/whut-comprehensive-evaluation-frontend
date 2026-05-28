import { computed, ref } from 'vue'

import {
  createRole as createRoleApi,
  listRoles as listRolesApi,
  replaceRolePermissions as replaceRolePermissionsApi,
  updateRole as updateRoleApi,
  type CreateRolePayload,
  type ManageRoleListItem,
  type ManageRoleScope
} from '../../api/roles'
import {
  listPermissionDictionary as listPermissionDictionaryApi,
  type PermissionDictionaryItem
} from '../../api/permissions'

type RoleTemplatesPageDependencies = {
  listRoles: typeof listRolesApi
  createRole: typeof createRoleApi
  updateRole: typeof updateRoleApi
  replaceRolePermissions: typeof replaceRolePermissionsApi
  listPermissionDictionary: typeof listPermissionDictionaryApi
}

type OpenPermissionEditorOptions = {
  canManagePermissions: boolean
}

const defaultDependencies: RoleTemplatesPageDependencies = {
  listRoles: listRolesApi,
  createRole: createRoleApi,
  updateRole: updateRoleApi,
  replaceRolePermissions: replaceRolePermissionsApi,
  listPermissionDictionary: listPermissionDictionaryApi
}

export const knownRoleScopes = ['SELF', 'ORG_UNIT', 'ORG_SUBTREE', 'ALL'] as const

export const roleScopeOptions: Array<{ label: string; value: ManageRoleScope }> = [
  { label: '本人', value: 'SELF' },
  { label: '本部门', value: 'ORG_UNIT' },
  { label: '本部门及下级', value: 'ORG_SUBTREE' },
  { label: '全部', value: 'ALL' }
]

export const roleStatusOptions: Array<{ label: string; value: string }> = [
  { label: '全部状态', value: '' },
  { label: '启用', value: 'ACTIVE' },
  { label: '禁用', value: 'DISABLED' }
]

const isKnownRoleScope = (value: string): value is ManageRoleScope =>
  knownRoleScopes.includes(value as ManageRoleScope)

const buildStatusQuery = (status: string): string | undefined => {
  const trimmedStatus = status.trim()

  return trimmedStatus ? trimmedStatus : undefined
}

const buildKeywordQuery = (keyword: string): string | undefined => {
  const trimmedKeyword = keyword.trim()

  return trimmedKeyword ? trimmedKeyword : undefined
}

const filterPermissionDictionary = (
  dictionary: PermissionDictionaryItem[],
  keyword: string
): PermissionDictionaryItem[] => {
  const normalizedKeyword = keyword.trim().toLowerCase()

  if (!normalizedKeyword) {
    return dictionary
  }

  return dictionary.filter((item) =>
    [item.permissionCode, item.permissionName, item.module]
      .join(' ')
      .toLowerCase()
      .includes(normalizedKeyword)
  )
}

export const createRoleTemplatesPageState = (
  dependencies: Partial<RoleTemplatesPageDependencies> = {}
) => {
  const resolvedDependencies: RoleTemplatesPageDependencies = {
    ...defaultDependencies,
    ...dependencies
  }

  const roles = ref<ManageRoleListItem[]>([])
  const searchKeyword = ref('')
  const selectedStatus = ref('')
  const pageNo = ref(1)
  const pageSize = 20
  const total = ref(0)
  const loading = ref(false)
  const errorMessage = ref('')
  const modeSwitchMessage = ref('')

  const isCreateFormVisible = ref(false)
  const creatingRole = ref(false)

  const editingRoleId = ref('')
  const savingRoleId = ref('')

  const bindingPermissionRoleId = ref('')
  const bindingPermissionRoleName = ref('')
  const bindingPermissionRoleCode = ref('')
  const savingPermissionBinding = ref(false)
  const permissionBindingReadOnly = ref(false)
  const permissionDictionaryAccessDenied = ref(false)
  const permissionDictionary = ref<PermissionDictionaryItem[]>([])
  const permissionDictionaryLoaded = ref(false)
  const permissionKeyword = ref('')
  const selectedPermissionCodes = ref<string[]>([])

  const createForm = {
    roleCode: ref(''),
    roleName: ref(''),
    roleScope: ref<ManageRoleScope>('SELF')
  }

  const editForm = {
    roleId: ref(''),
    roleCode: ref(''),
    roleName: ref(''),
    roleScope: ref(''),
    status: ref(''),
    snapshot: ref<{ roleName: string; roleScope: string; status: string } | null>(null)
  }

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
  const hasPreviousPage = computed(() => pageNo.value > 1)
  const hasNextPage = computed(() => pageNo.value < totalPages.value)
  const hasActiveFilters = computed(
    () => buildKeywordQuery(searchKeyword.value) !== undefined || buildStatusQuery(selectedStatus.value) !== undefined
  )
  const canSubmitCreateForm = computed(
    () =>
      createForm.roleCode.value.trim().length > 0 &&
      createForm.roleName.value.trim().length > 0 &&
      isKnownRoleScope(createForm.roleScope.value)
  )
  const hasKnownEditRoleScope = computed(() => isKnownRoleScope(editForm.roleScope.value))
  const filteredPermissionDictionary = computed(() =>
    permissionDictionaryAccessDenied.value
      ? []
      : filterPermissionDictionary(permissionDictionary.value, permissionKeyword.value)
  )
  const roleListEmptyMessage = computed(() =>
    hasActiveFilters.value ? '当前筛选条件下暂无角色模板，请调整关键字或状态后重试。' : '暂无角色模板，请先创建角色模板。'
  )
  const permissionBindingReadOnlyMessage = computed(() => {
    if (!permissionBindingReadOnly.value) {
      return ''
    }

    if (
      permissionDictionaryAccessDenied.value ||
      (!permissionDictionaryLoaded.value && permissionDictionary.value.length === 0)
    ) {
      return '当前账号缺少 `permission.manage`，无法查看权限字典，也不能保存权限绑定结果。'
    }

    if (bindingPermissionRoleName.value && bindingPermissionRoleCode.value) {
      return `当前账号缺少 \`permission.manage\`，你可以查看角色「${bindingPermissionRoleName.value}（${bindingPermissionRoleCode.value}）」的权限字典，但不能保存权限绑定结果。`
    }

    return '当前账号缺少 `permission.manage`，你可以查看权限字典，但不能保存权限绑定结果。'
  })
  const permissionDictionaryEmptyMessage = computed(() => {
    if (permissionDictionaryAccessDenied.value) {
      return '当前账号缺少 `permission.manage`，无法查看权限字典，也不能保存权限绑定结果。'
    }

    if (permissionDictionary.value.length === 0) {
      return '权限字典当前为空，暂时无法绑定角色权限。'
    }

    if (filteredPermissionDictionary.value.length === 0) {
      return '没有匹配当前搜索条件的权限项，请调整关键字后重试。'
    }

    return ''
  })
  const editingRoleHeaderLabel = computed(() => '当前编辑角色')
  const editingRoleHeaderText = computed(() =>
    editForm.roleName.value && editForm.roleCode.value
      ? `${editForm.roleName.value}（${editForm.roleCode.value}）`
      : ''
  )
  const permissionBindingHeaderLabel = computed(() => '当前绑定角色')
  const permissionBindingHeaderText = computed(() =>
    bindingPermissionRoleName.value && bindingPermissionRoleCode.value
      ? `${bindingPermissionRoleName.value}（${bindingPermissionRoleCode.value}）`
      : ''
  )
  const permissionReplaceModeTitle = computed(() => '当前为全量覆盖模式')
  const permissionReplaceModeDescription = computed(
    () => '本次保存会用当前勾选结果整体替换角色权限；由于接口未提供已绑权限明细，未勾选项也会被一并移除。'
  )

  const resetCreateForm = () => {
    createForm.roleCode.value = ''
    createForm.roleName.value = ''
    createForm.roleScope.value = 'SELF'
  }

  const resetEditForm = () => {
    editForm.roleId.value = ''
    editForm.roleCode.value = ''
    editForm.roleName.value = ''
    editForm.roleScope.value = ''
    editForm.status.value = ''
    editForm.snapshot.value = null
  }

  const resetPermissionBinding = () => {
    bindingPermissionRoleId.value = ''
    bindingPermissionRoleName.value = ''
    bindingPermissionRoleCode.value = ''
    savingPermissionBinding.value = false
    permissionBindingReadOnly.value = false
    permissionDictionaryAccessDenied.value = false
    permissionKeyword.value = ''
    selectedPermissionCodes.value = []
  }

  const openCreateForm = () => {
    errorMessage.value = ''
    modeSwitchMessage.value = ''
    isCreateFormVisible.value = true
  }

  const closeCreateForm = () => {
    isCreateFormVisible.value = false
    resetCreateForm()
  }

  const cancelEditRole = () => {
    editingRoleId.value = ''
    savingRoleId.value = ''
    resetEditForm()
  }

  const closeEditPanel = () => {
    errorMessage.value = ''
    modeSwitchMessage.value = ''
    cancelEditRole()
  }

  const loadRoles = async (accessToken: string) => {
    if (!accessToken) {
      roles.value = []
      total.value = 0
      errorMessage.value = '缺少登录凭证，请重新登录'
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      const page = await resolvedDependencies.listRoles(accessToken, {
        pageNo: pageNo.value,
        pageSize,
        keyword: buildKeywordQuery(searchKeyword.value),
        status: buildStatusQuery(selectedStatus.value)
      })

      roles.value = page.records
      total.value = page.total
    } catch (error) {
      roles.value = []
      total.value = 0
      errorMessage.value = error instanceof Error ? error.message : '角色模板列表加载失败'
    } finally {
      loading.value = false
    }
  }

  const searchRoles = async (accessToken: string) => {
    pageNo.value = 1
    await loadRoles(accessToken)
  }

  const goToPreviousPage = async (accessToken: string) => {
    if (!hasPreviousPage.value || loading.value) {
      return
    }

    pageNo.value -= 1
    await loadRoles(accessToken)
  }

  const goToNextPage = async (accessToken: string) => {
    if (!hasNextPage.value || loading.value) {
      return
    }

    pageNo.value += 1
    await loadRoles(accessToken)
  }

  const submitCreateRole = async (accessToken: string) => {
    if (!accessToken || creatingRole.value || loading.value) {
      return
    }

    if (!canSubmitCreateForm.value) {
      errorMessage.value = '请填写角色编码、角色名称和角色范围'
      return
    }

    creatingRole.value = true
    errorMessage.value = ''

    try {
      const payload: CreateRolePayload = {
        roleCode: createForm.roleCode.value.trim(),
        roleName: createForm.roleName.value.trim(),
        roleScope: createForm.roleScope.value
      }
      await resolvedDependencies.createRole(accessToken, payload)
      closeCreateForm()
      await loadRoles(accessToken)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '创建角色模板失败'
    } finally {
      creatingRole.value = false
    }
  }

  const startEditRole = (role: ManageRoleListItem) => {
    errorMessage.value = ''
    modeSwitchMessage.value = ''

    if (bindingPermissionRoleId.value) {
      resetPermissionBinding()
      modeSwitchMessage.value = `已退出权限绑定，切换到角色「${role.roleName}（${role.roleCode}）」的基础信息编辑。`
    }

    editingRoleId.value = role.roleId
    editForm.roleId.value = role.roleId
    editForm.roleCode.value = role.roleCode
    editForm.roleName.value = role.roleName
    editForm.roleScope.value = role.roleScope
    editForm.status.value = role.status
    editForm.snapshot.value = {
      roleName: role.roleName,
      roleScope: role.roleScope,
      status: role.status
    }
  }

  const submitEditRole = async (accessToken: string) => {
    if (!accessToken || !editingRoleId.value || savingRoleId.value || loading.value) {
      return
    }

    if (!editForm.snapshot.value) {
      errorMessage.value = '缺少角色模板快照，请重新打开编辑'
      return
    }

    if (!editForm.roleName.value.trim()) {
      errorMessage.value = '请填写角色名称'
      return
    }

    if (!hasKnownEditRoleScope.value) {
      errorMessage.value = '当前角色范围不在前端已知枚举中，禁止保存'
      return
    }

    savingRoleId.value = editingRoleId.value
    errorMessage.value = ''

    try {
      const nextRoleScope = editForm.roleScope.value as ManageRoleScope

      await resolvedDependencies.updateRole(accessToken, editingRoleId.value, {
        next: {
          roleName: editForm.roleName.value.trim(),
          roleScope: nextRoleScope,
          status: editForm.status.value
        },
        snapshot: editForm.snapshot.value
      })
      cancelEditRole()
      await loadRoles(accessToken)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '角色模板更新失败'
    } finally {
      savingRoleId.value = ''
    }
  }

  const ensurePermissionDictionary = async (accessToken: string) => {
    if (permissionDictionaryLoaded.value) {
      return
    }

    if (!accessToken) {
      errorMessage.value = '缺少登录凭证，请重新登录'
      return
    }

    try {
      permissionDictionary.value = await resolvedDependencies.listPermissionDictionary(accessToken)
      permissionDictionaryAccessDenied.value = false
      permissionDictionaryLoaded.value = true
    } catch (error) {
      if (error instanceof Error && error.message === '当前账号无权限查看权限字典') {
        permissionDictionaryAccessDenied.value = true
        permissionBindingReadOnly.value = true
      }
      errorMessage.value = error instanceof Error ? error.message : '权限字典加载失败'
    }
  }

  const openPermissionEditor = async (
    accessToken: string,
    role: ManageRoleListItem,
    options: OpenPermissionEditorOptions
  ) => {
    errorMessage.value = ''
    modeSwitchMessage.value = ''

    if (editingRoleId.value) {
      cancelEditRole()
      modeSwitchMessage.value = `已退出基础信息编辑，切换到角色「${role.roleName}（${role.roleCode}）」的权限绑定。`
    }

    bindingPermissionRoleId.value = role.roleId
    bindingPermissionRoleName.value = role.roleName
    bindingPermissionRoleCode.value = role.roleCode
    permissionBindingReadOnly.value = !options.canManagePermissions
    permissionDictionaryAccessDenied.value = !options.canManagePermissions
    selectedPermissionCodes.value = []
    permissionKeyword.value = ''

    if (!options.canManagePermissions) {
      return
    }

    await ensurePermissionDictionary(accessToken)
  }

  const closePermissionEditor = () => {
    errorMessage.value = ''
    modeSwitchMessage.value = ''
    resetPermissionBinding()
  }

  const togglePermission = (permissionCode: string) => {
    if (permissionBindingReadOnly.value) {
      return
    }

    const index = selectedPermissionCodes.value.indexOf(permissionCode)

    if (index === -1) {
      selectedPermissionCodes.value.push(permissionCode)
      return
    }

    selectedPermissionCodes.value.splice(index, 1)
  }

  const submitReplacePermissions = async (accessToken: string) => {
    if (
      !accessToken ||
      !bindingPermissionRoleId.value ||
      savingPermissionBinding.value ||
      loading.value
    ) {
      return
    }

    if (permissionBindingReadOnly.value) {
      errorMessage.value = '当前账号无权限执行该操作'
      return
    }

    savingPermissionBinding.value = true
    errorMessage.value = ''

    try {
      await resolvedDependencies.replaceRolePermissions(accessToken, bindingPermissionRoleId.value, {
        permissionCodes: [...selectedPermissionCodes.value]
      })
      await loadRoles(accessToken)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '角色权限保存失败'
    } finally {
      savingPermissionBinding.value = false
    }
  }

  return {
    roles,
    searchKeyword,
    selectedStatus,
    pageNo,
    pageSize,
    total,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    loading,
    errorMessage,
    modeSwitchMessage,
    isCreateFormVisible,
    creatingRole,
    editingRoleId,
    savingRoleId,
    bindingPermissionRoleId,
    bindingPermissionRoleName,
    bindingPermissionRoleCode,
    editingRoleHeaderLabel,
    editingRoleHeaderText,
    savingPermissionBinding,
    permissionBindingReadOnly,
    permissionDictionaryAccessDenied,
    permissionBindingReadOnlyMessage,
    permissionBindingHeaderLabel,
    permissionBindingHeaderText,
    permissionDictionary,
    permissionDictionaryLoaded,
    permissionDictionaryEmptyMessage,
    permissionReplaceModeTitle,
    permissionReplaceModeDescription,
    permissionKeyword,
    selectedPermissionCodes,
    filteredPermissionDictionary,
    roleListEmptyMessage,
    createForm,
    editForm,
    canSubmitCreateForm,
    hasKnownEditRoleScope,
    openCreateForm,
    closeCreateForm,
    loadRoles,
    searchRoles,
    goToPreviousPage,
    goToNextPage,
    submitCreateRole,
    startEditRole,
    cancelEditRole,
    closeEditPanel,
    submitEditRole,
    ensurePermissionDictionary,
    openPermissionEditor,
    closePermissionEditor,
    togglePermission,
    submitReplacePermissions
  }
}
