-- 为 matches 表添加 startDate 字段（比赛开始时间）
-- 注意：执行前请备份数据库

ALTER TABLE roundmatch.matches ADD COLUMN IF NOT EXISTS startDate TIMESTAMP;

-- 添加注释
COMMENT ON COLUMN roundmatch.matches.startDate IS '比赛开始时间（可选，如果未设置则使用 createDate 判断比赛是否已结束）';
