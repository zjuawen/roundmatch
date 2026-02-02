-- 创建头像有效性缓存表（兼容版本）
-- 用于存储头像URL的有效性检查结果，避免重复检查

-- 方案1：如果数据库支持且用户有权限，创建扩展
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 方案2：如果无法创建扩展，使用应用层生成UUID（Sequelize会自动处理）
-- 创建 avatar_cache 表（如果不存在）
CREATE TABLE IF NOT EXISTS roundmatch.avatar_cache (
    _id UUID PRIMARY KEY,
    avatarurl VARCHAR(500) NOT NULL UNIQUE,
    isvalid BOOLEAN NOT NULL DEFAULT true,
    checkedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    checkcount INTEGER DEFAULT 0
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_avatar_cache_avatarurl ON roundmatch.avatar_cache(avatarurl);
CREATE INDEX IF NOT EXISTS idx_avatar_cache_isvalid ON roundmatch.avatar_cache(isvalid);
CREATE INDEX IF NOT EXISTS idx_avatar_cache_checkedat ON roundmatch.avatar_cache(checkedat);

-- 添加注释
COMMENT ON TABLE roundmatch.avatar_cache IS '头像有效性缓存表，存储头像URL的有效性检查结果';
COMMENT ON COLUMN roundmatch.avatar_cache.avatarurl IS '头像URL（唯一索引）';
COMMENT ON COLUMN roundmatch.avatar_cache.isvalid IS '头像是否有效：true=有效，false=无效';
COMMENT ON COLUMN roundmatch.avatar_cache.checkedat IS '最后检查时间';
COMMENT ON COLUMN roundmatch.avatar_cache.checkcount IS '检查次数';
