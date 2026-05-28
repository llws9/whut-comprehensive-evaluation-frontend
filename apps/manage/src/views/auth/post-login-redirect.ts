import { manageMenus } from '@whut/shared'

type ResolveManagePostLoginTargetOptions = {
  redirectPath?: string
  permissionCodes: string[]
}

const FORBIDDEN_FALLBACK_PATH = '/403'

export const resolveManagePostLoginTarget = ({
  redirectPath,
  permissionCodes
}: ResolveManagePostLoginTargetOptions): string => {
  const normalizedRedirectPath = redirectPath?.trim()

  if (normalizedRedirectPath) {
    return normalizedRedirectPath
  }

  const grantedPermissions = new Set(permissionCodes)
  const firstAccessibleMenu = manageMenus.find((item) =>
    item.permissionCode ? grantedPermissions.has(item.permissionCode) : true
  )

  return firstAccessibleMenu?.path ?? FORBIDDEN_FALLBACK_PATH
}
