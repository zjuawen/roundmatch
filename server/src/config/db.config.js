/**
 * Database configuration for PostgreSQL
 * Project : roundmatch
 * Filename : db.config.js
 * Updated: Migrated to PostgreSQL
 * 
 * 配置说明：
 * - DB: 数据库名称，默认使用 postgres 数据库
 * - SCHEMA: Schema 名称，默认使用 roundmatch schema
 * - 所有配置项都可以通过环境变量覆盖
 **/
module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  PORT: process.env.DB_PORT || 5432, 
  USER: process.env.DB_USER || "roundmatch",
  PASSWORD: process.env.DB_PASSWORD || "roundmatch",
  DB: process.env.DB_NAME || "postgres",
  SCHEMA: process.env.DB_SCHEMA || "roundmatch",
  dialect: "postgres",
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    timezone: 'Etc/GMT-8'
  },
  timezone: '+08:00'
};

