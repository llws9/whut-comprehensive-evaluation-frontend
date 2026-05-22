import { computed, ref } from 'vue'

import {
  createUser as createUserApi,
  importUsers as importUsersApi,
  listUsers as listUsersApi,
  updateUserStatus as updateUserStatusApi,
  type ImportUsersResult,
  type ManageUserListItem,
  type ManageUserStatus
} from '../../api/users'

type StudentsPageStateDependencies = {
  listUsers: typeof listUsersApi
  updateUserStatus: typeof updateUserStatusApi
  createUser: typeof createUserApi
  importUsers: typeof importUsersApi
}

const defaultDependencies: StudentsPageStateDependencies = {
  createUser: createUserApi,
  importUsers: importUsersApi,
  listUsers: listUsersApi,
  updateUserStatus: updateUserStatusApi
}

export const studentStatusOptions: Array<{ label: string; value: ManageUserStatus | '' }> = [
  { label: '全部状态', value: '' },
  { label: '正常', value: 'ACTIVE' },
  { label: '禁用', value: 'DISABLED' },
  { label: '锁定', value: 'LOCKED' }
]

export const statusLabelMap: Record<ManageUserStatus, string> = {
  ACTIVE: '正常',
  DISABLED: '禁用',
  LOCKED: '锁定'
}

export const supportsStatusToggle = (status: ManageUserStatus): boolean => status !== 'LOCKED'

const buildStatusQuery = (status: ManageUserStatus | ''): ManageUserStatus | undefined =>
  status || undefined

const buildKeywordQuery = (keyword: string): string | undefined => {
  const trimmedKeyword = keyword.trim()

  return trimmedKeyword ? trimmedKeyword : undefined
}

export const resolveNextUserStatus = (status: ManageUserStatus): ManageUserStatus =>
  status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'

export const resolveStatusActionLabel = (status: ManageUserStatus): string =>
  supportsStatusToggle(status) ? (status === 'ACTIVE' ? '禁用' : '启用') : ''

export const createStudentsPageState = (
  dependencies: Partial<StudentsPageStateDependencies> = {}
) => {
  const resolvedDependencies: StudentsPageStateDependencies = {
    ...defaultDependencies,
    ...dependencies
  }
  const students = ref<ManageUserListItem[]>([])
  const searchKeyword = ref('')
  const selectedStatus = ref<ManageUserStatus | ''>('')
  const pageNo = ref(1)
  const pageSize = 20
  const total = ref(0)
  const loading = ref(false)
  const errorMessage = ref('')
  const changingUserId = ref('')
  const isCreateFormVisible = ref(false)
  const creatingUser = ref(false)
  const isImportFormVisible = ref(false)
  const importingUsers = ref(false)
  const importResult = ref<ImportUsersResult | null>(null)
  const createForm = {
    userNo: ref(''),
    userName: ref(''),
    password: ref('')
  }
  const importForm = {
    file: ref<File | null>(null),
    importMode: ref<'UPSERT' | 'INSERT_ONLY'>('UPSERT')
  }

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
  const displayStart = computed(() => (total.value === 0 ? 0 : (pageNo.value - 1) * pageSize + 1))
  const displayEnd = computed(() => Math.min(pageNo.value * pageSize, total.value))
  const hasPreviousPage = computed(() => pageNo.value > 1)
  const hasNextPage = computed(() => pageNo.value < totalPages.value)
  const canSubmitCreateForm = computed(
    () =>
      createForm.userNo.value.trim().length > 0 &&
      createForm.userName.value.trim().length > 0 &&
      createForm.password.value.length > 0
  )
  const canSubmitImportForm = computed(() => importForm.file.value !== null)

  const resetCreateForm = () => {
    createForm.userNo.value = ''
    createForm.userName.value = ''
    createForm.password.value = ''
  }

  const openCreateForm = () => {
    errorMessage.value = ''
    isCreateFormVisible.value = true
  }

  const closeCreateForm = () => {
    isCreateFormVisible.value = false
    resetCreateForm()
  }

  const resetImportForm = () => {
    importForm.file.value = null
    importForm.importMode.value = 'UPSERT'
  }

  const openImportForm = () => {
    errorMessage.value = ''
    isImportFormVisible.value = true
  }

  const closeImportForm = () => {
    isImportFormVisible.value = false
    resetImportForm()
  }

  const loadUsers = async (accessToken: string) => {
    if (!accessToken) {
      students.value = []
      total.value = 0
      errorMessage.value = '缺少登录凭证，请重新登录'
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      const page = await resolvedDependencies.listUsers(accessToken, {
        pageNo: pageNo.value,
        pageSize,
        keyword: buildKeywordQuery(searchKeyword.value),
        status: buildStatusQuery(selectedStatus.value)
      })

      students.value = page.records
      total.value = page.total
    } catch (error) {
      students.value = []
      total.value = 0
      errorMessage.value = error instanceof Error ? error.message : '用户列表加载失败'
    } finally {
      loading.value = false
    }
  }

  const searchUsers = async (accessToken: string) => {
    pageNo.value = 1
    await loadUsers(accessToken)
  }

  const goToPreviousPage = async (accessToken: string) => {
    if (!hasPreviousPage.value || loading.value) {
      return
    }

    pageNo.value -= 1
    await loadUsers(accessToken)
  }

  const goToNextPage = async (accessToken: string) => {
    if (!hasNextPage.value || loading.value) {
      return
    }

    pageNo.value += 1
    await loadUsers(accessToken)
  }

  const changeUserStatus = async (accessToken: string, student: ManageUserListItem) => {
    if (!accessToken || changingUserId.value || loading.value || !supportsStatusToggle(student.status)) {
      return
    }

    changingUserId.value = student.userId
    errorMessage.value = ''

    try {
      await resolvedDependencies.updateUserStatus(accessToken, student.userId, {
        status: resolveNextUserStatus(student.status),
        reason: 'manage students page toggle'
      })
      await loadUsers(accessToken)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '状态更新失败'
    } finally {
      changingUserId.value = ''
    }
  }

  const submitCreateUser = async (accessToken: string) => {
    if (!accessToken || creatingUser.value || loading.value) {
      return
    }

    if (!canSubmitCreateForm.value) {
      errorMessage.value = '请填写用户编号、用户姓名和初始密码'
      return
    }

    creatingUser.value = true
    errorMessage.value = ''

    try {
      await resolvedDependencies.createUser(accessToken, {
        userNo: createForm.userNo.value.trim(),
        userName: createForm.userName.value.trim(),
        password: createForm.password.value
      })
      closeCreateForm()
      await loadUsers(accessToken)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '创建用户失败'
    } finally {
      creatingUser.value = false
    }
  }

  const submitImportUsers = async (accessToken: string) => {
    if (!accessToken || importingUsers.value || loading.value) {
      return
    }

    if (!canSubmitImportForm.value || !importForm.file.value) {
      errorMessage.value = '请选择待导入文件'
      return
    }

    importingUsers.value = true
    errorMessage.value = ''

    try {
      importResult.value = await resolvedDependencies.importUsers(accessToken, {
        file: importForm.file.value,
        importMode: importForm.importMode.value
      })
      closeImportForm()
      await loadUsers(accessToken)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '导入用户失败'
    } finally {
      importingUsers.value = false
    }
  }

  return {
    students,
    searchKeyword,
    selectedStatus,
    pageNo,
    pageSize,
    total,
    totalPages,
    loading,
    errorMessage,
    changingUserId,
    isCreateFormVisible,
    creatingUser,
    isImportFormVisible,
    importingUsers,
    importResult,
    createForm,
    importForm,
    canSubmitCreateForm,
    canSubmitImportForm,
    displayStart,
    displayEnd,
    hasPreviousPage,
    hasNextPage,
    openCreateForm,
    closeCreateForm,
    openImportForm,
    closeImportForm,
    loadUsers,
    searchUsers,
    goToPreviousPage,
    goToNextPage,
    changeUserStatus,
    submitCreateUser,
    submitImportUsers
  }
}
