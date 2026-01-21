/**
 * RustFS 对象存储配置
 * Project : roundmatch
 * Filename : storage.config.js
 **/

// 确保先加载环境变量（必须在读取 process.env 之前）
const path = require('path')
try {
  // 明确指定 .env 文件路径
  const envPath = path.resolve(__dirname, '../../.env')
  require('dotenv').config({ path: envPath })
} catch (e) {
  // dotenv 可能未安装，忽略
}

const { S3Client } = require('@aws-sdk/client-s3')
const { NodeHttpHandler } = require('@smithy/node-http-handler')

// RustFS 配置 - 使用函数延迟创建，确保环境变量已加载
function getRustfsConfig() {
  return {
    endpoint: process.env.RUSTFS_ENDPOINT || 'http://localhost:9000',
    // 区域代码：cn-north-1(北京), cn-northwest-1(宁夏), us-east-1(美国东部) 等
    // 对于自部署的 RustFS，region 可以是任意值，但建议使用标准 AWS region 代码
    region: process.env.RUSTFS_REGION || 'us-east-1',
    accessKeyId: process.env.RUSTFS_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.RUSTFS_SECRET_KEY || 'minioadmin',
    bucket: process.env.RUSTFS_BUCKET || 'roundmatch-uploads',
    useSSL: process.env.RUSTFS_USE_SSL === 'true' || false,
    // RustFS 需要 path-style 访问
    forcePathStyle: true
  }
}

// 延迟创建配置对象
const RUSTFS_CONFIG = getRustfsConfig()

// 创建 S3 客户端的工厂函数
function createS3Client() {
  return new S3Client({
    endpoint: RUSTFS_CONFIG.endpoint,
    region: RUSTFS_CONFIG.region,
    credentials: {
      accessKeyId: RUSTFS_CONFIG.accessKeyId,
      secretAccessKey: RUSTFS_CONFIG.secretAccessKey
    },
    forcePathStyle: RUSTFS_CONFIG.forcePathStyle,
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 5000,
      socketTimeout: 30000
    })
  })
}

// 创建 S3 客户端
const s3Client = createS3Client()

// 重新创建 S3 客户端的函数（用于刷新配置）
function recreateS3Client() {
  // 重新加载环境变量
  try {
    const envPath = path.resolve(__dirname, '../../.env')
    require('dotenv').config({ path: envPath, override: true })
  } catch (e) {
    // 忽略错误
  }
  
  // 重新读取配置
  const newConfig = getRustfsConfig()
  Object.assign(RUSTFS_CONFIG, newConfig)
  
  // 创建新的客户端
  return createS3Client()
}

// 获取文件访问的基础 URL
const getFileBaseUrl = () => {
  const endpoint = RUSTFS_CONFIG.endpoint.replace(/^https?:\/\//, '')
  const protocol = RUSTFS_CONFIG.useSSL ? 'https' : 'http'
  return `${protocol}://${endpoint}/${RUSTFS_CONFIG.bucket}/`
}

module.exports = {
  s3Client,
  RUSTFS_CONFIG,
  getFileBaseUrl,
  recreateS3Client,
  getRustfsConfig
}
