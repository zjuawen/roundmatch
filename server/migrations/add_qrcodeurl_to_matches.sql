-- 为 matches 表添加 qrcodeUrl 字段
-- 注意：执行前请备份数据库

ALTER TABLE roundmatch.matches ADD COLUMN IF NOT EXISTS qrcodeUrl VARCHAR(500);

-- 添加注释
COMMENT ON COLUMN roundmatch.matches.qrcodeUrl IS '小程序码URL';
