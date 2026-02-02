-- 修改 scorelogs 表的 clubid、gameid、matchid 字段类型从 UUID 改为 STRING
-- 以兼容非 UUID 格式的 ID（与 admin_clubs 和 club_config 表保持一致）
-- 执行日期: 2026-02-02

-- 注意：PostgreSQL 中直接修改 UUID 类型到 VARCHAR 需要使用 USING 子句进行类型转换
-- 如果字段有 NOT NULL 约束，需要先删除约束

-- 步骤1：修改 clubid 字段
-- 如果字段有 NOT NULL 约束，先删除约束
ALTER TABLE roundmatch.scorelogs 
ALTER COLUMN clubid DROP NOT NULL;

-- 修改 clubid 字段类型为 VARCHAR
ALTER TABLE roundmatch.scorelogs 
ALTER COLUMN clubid TYPE VARCHAR(255) USING clubid::VARCHAR(255);

-- 步骤2：修改 gameid 字段
-- 如果字段有 NOT NULL 约束，先删除约束（gameid 通常不允许为 null，但为了安全起见先删除）
ALTER TABLE roundmatch.scorelogs 
ALTER COLUMN gameid DROP NOT NULL;

-- 修改 gameid 字段类型为 VARCHAR
ALTER TABLE roundmatch.scorelogs 
ALTER COLUMN gameid TYPE VARCHAR(255) USING gameid::VARCHAR(255);

-- 重新添加 NOT NULL 约束（如果需要 gameid 不能为空）
ALTER TABLE roundmatch.scorelogs 
ALTER COLUMN gameid SET NOT NULL;

-- 步骤3：修改 matchid 字段
-- 如果字段有 NOT NULL 约束，先删除约束（matchid 通常不允许为 null，但为了安全起见先删除）
ALTER TABLE roundmatch.scorelogs 
ALTER COLUMN matchid DROP NOT NULL;

-- 修改 matchid 字段类型为 VARCHAR
ALTER TABLE roundmatch.scorelogs 
ALTER COLUMN matchid TYPE VARCHAR(255) USING matchid::VARCHAR(255);

-- 重新添加 NOT NULL 约束（如果需要 matchid 不能为空）
ALTER TABLE roundmatch.scorelogs 
ALTER COLUMN matchid SET NOT NULL;
