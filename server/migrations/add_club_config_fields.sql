-- 为 club_config 表添加积分规则配置字段
-- PostgreSQL 会将未加引号的标识符转换为小写，所以字段名都是小写

-- 如果表不存在，先创建表
CREATE TABLE IF NOT EXISTS roundmatch.club_config (
    _id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clubid VARCHAR(255) NOT NULL UNIQUE,
    usescoreranking BOOLEAN DEFAULT FALSE,
    scorewinpoints INTEGER,
    scorerewardthreshold INTEGER,
    scorerewardpoints INTEGER,
    scorerewardmaxpergame INTEGER,
    createdate TIMESTAMP DEFAULT NOW(),
    updatetime TIMESTAMP DEFAULT NOW()
);

-- 如果表已存在，添加缺失的字段
DO $$ 
BEGIN
    -- 添加 scorerewardthreshold 字段（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'roundmatch' 
        AND table_name = 'club_config' 
        AND column_name = 'scorerewardthreshold'
    ) THEN
        ALTER TABLE roundmatch.club_config ADD COLUMN scorerewardthreshold INTEGER;
    END IF;

    -- 添加 scorerewardmaxpergame 字段（如果不存在）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'roundmatch' 
        AND table_name = 'club_config' 
        AND column_name = 'scorerewardmaxpergame'
    ) THEN
        ALTER TABLE roundmatch.club_config ADD COLUMN scorerewardmaxpergame INTEGER;
    END IF;

    -- 如果 scorewinpoints 是 DECIMAL/NUMERIC 类型，改为 INTEGER
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'roundmatch' 
        AND table_name = 'club_config' 
        AND column_name = 'scorewinpoints'
        AND data_type = 'numeric'
    ) THEN
        ALTER TABLE roundmatch.club_config ALTER COLUMN scorewinpoints TYPE INTEGER USING scorewinpoints::INTEGER;
    END IF;

    -- 如果 scorerewardpoints 是 DECIMAL/NUMERIC 类型，改为 INTEGER
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'roundmatch' 
        AND table_name = 'club_config' 
        AND column_name = 'scorerewardpoints'
        AND data_type = 'numeric'
    ) THEN
        ALTER TABLE roundmatch.club_config ALTER COLUMN scorerewardpoints TYPE INTEGER USING scorerewardpoints::INTEGER;
    END IF;
END $$;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_club_config_clubid ON roundmatch.club_config(clubid);
