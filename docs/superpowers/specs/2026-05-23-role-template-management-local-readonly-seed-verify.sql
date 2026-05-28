-- 复验 2026-05-23 只读态联调数据是否存在/是否已回滚。
-- 适用库：whut_eval_local
--
-- 关注点：
-- 1. T20260001 是否仍带 ROLE_TEMPLATE_READONLY_LOCAL；
-- 2. T20260001 的最终权限集合是否仍包含 role.manage；
-- 3. ROLE_TEMPLATE_READONLY_LOCAL / 其 role_permission / assignment 是否还存在；
-- 4. T20260001 的 password_hash 是否已恢复为 hash_teacher_001。

USE whut_eval_local;

-- A. 查看目标账号基础信息
SELECT id, user_no, user_name, password_hash, status, updated_at
FROM iam_user
WHERE user_no = 'T20260001';

-- B. 查看目标账号当前有效角色
SELECT u.user_no, r.id AS role_id, r.role_code, r.role_name, a.id AS assignment_id, a.status
FROM iam_user u
LEFT JOIN iam_user_role_assignment a ON a.user_id = u.id AND a.status = 'ACTIVE'
LEFT JOIN iam_role r ON r.id = a.role_id
WHERE u.user_no = 'T20260001'
ORDER BY r.role_code;

-- C. 查看目标账号当前有效权限集合
SELECT
  u.user_no,
  GROUP_CONCAT(DISTINCT p.permission_code ORDER BY p.permission_code SEPARATOR ',') AS permissions
FROM iam_user u
LEFT JOIN iam_user_role_assignment a ON a.user_id = u.id AND a.status = 'ACTIVE'
LEFT JOIN iam_role_permission rp ON rp.role_id = a.role_id
LEFT JOIN iam_permission p ON p.id = rp.permission_id AND p.status = 'ACTIVE'
WHERE u.user_no = 'T20260001'
GROUP BY u.user_no;

-- D. 查看本地联调角色是否仍存在
SELECT id, role_code, role_name, role_scope, status, created_at
FROM iam_role
WHERE id = 4007
   OR role_code = 'ROLE_TEMPLATE_READONLY_LOCAL';

-- E. 查看本地联调角色的权限绑定是否仍存在
SELECT id, role_id, permission_id, created_at
FROM iam_role_permission
WHERE id = 6017
   OR role_id = 4007;

-- F. 查看本地联调 assignment 是否仍存在
SELECT id, user_id, role_id, org_unit_id, source_type, effective_from, effective_to, status, assigned_by, created_at
FROM iam_user_role_assignment
WHERE id = 7013
   OR (user_id = 1010 AND role_id = 4007);
