-- 修改 admins 表的 clubid 字段类型为 VARCHAR，以支持非UUID格式的俱乐部ID
-- 注意：执行前请备份数据库

-- 1. 先删除外键约束（如果存在）
-- ALTER TABLE roundmatch.admins DROP CONSTRAINT IF EXISTS admins_clubid_fkey;

-- 2. 修改字段类型
ALTER TABLE roundmatch.admins ALTER COLUMN clubid TYPE VARCHAR(255);

-- 3. 修改 admin_clubs 表的 clubid 字段类型（如果表已存在）
ALTER TABLE roundmatch.admin_clubs ALTER COLUMN clubid TYPE VARCHAR(255);

-- 4. 如果需要，可以重新添加外键约束（但需要确保 clubs._id 也是 VARCHAR 类型）
-- ALTER TABLE roundmatch.admins ADD CONSTRAINT admins_clubid_fkey 
--   FOREIGN KEY (clubid) REFERENCES roundmatch.clubs(_id);
