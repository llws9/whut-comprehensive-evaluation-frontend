-- 仅回滚 2026-05-23 为只读态验收临时注入的本地联调数据。
-- 目标：
-- 1. 删除 T20260001 上新增的 ROLE_TEMPLATE_READONLY_LOCAL assignment；
-- 2. 删除该本地联调角色及其唯一权限绑定；
-- 3. 将 T20260001 的 password_hash 恢复为原始占位值 hash_teacher_001。
--
-- 适用库：whut_eval_local
-- 执行前建议先运行同目录 verify.sql 查看当前状态。

START TRANSACTION;

USE whut_eval_local;

-- 1) 删除只读态联调 assignment
DELETE FROM iam_user_role_assignment
WHERE id = 7013
   OR (user_id = 1010 AND role_id = 4007);

-- 2) 删除该联调角色的唯一权限绑定
DELETE FROM iam_role_permission
WHERE id = 6017
   OR (role_id = 4007 AND permission_id = 5012);

-- 3) 删除联调角色本身
DELETE FROM iam_role
WHERE id = 4007
   OR role_code = 'ROLE_TEMPLATE_READONLY_LOCAL';

-- 4) 恢复 T20260001 原始密码摘要
UPDATE iam_user
SET password_hash = 'hash_teacher_001',
    updated_at = NOW()
WHERE id = 1010
  AND user_no = 'T20260001';

COMMIT;
