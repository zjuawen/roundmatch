/**
 * RustFS 对象存储工具函数
 * Project : roundmatch
 * Filename : storage.js
 **/
const { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { GetObjectCommand } = require('@aws-sdk/client-s3')
const fs = require('fs')

// 动态获取 s3Client，确保使用最新的配置
function getS3Client() {
  const { s3Client } = require('../config/storage.config')
  return s3Client
}

const { RUSTFS_CONFIG, getFileBaseUrl } = require('../config/storage.config')

/**
 * 上传文件到 RustFS
 * @param {string} localFilePath - 本地文件路径
 * @param {string} objectKey - 对象存储中的键（路径）
 * @param {string} contentType - 文件 MIME 类型（可选）
 * @returns {Promise<string>} 文件访问 URL
 */
const uploadFile = async (localFilePath, objectKey, contentType = null) => {
  try {
    // 读取文件内容
    const fileContent = fs.readFileSync(localFilePath)
    
    // 如果没有指定 content type，尝试从文件扩展名推断
    if (!contentType) {
      const ext = objectKey.split('.').pop().toLowerCase()
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml'
      }
      contentType = mimeTypes[ext] || 'application/octet-stream'
    }

    // 上传文件
    const command = new PutObjectCommand({
      Bucket: RUSTFS_CONFIG.bucket,
      Key: objectKey,
      Body: fileContent,
      ContentType: contentType
    })

    await getS3Client().send(command)

    // 返回文件访问 URL
    const baseUrl = getFileBaseUrl()
    return `${baseUrl}${objectKey}`
  } catch (error) {
    // 提取详细的错误信息
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.Code || error.code,
      httpStatusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      endpoint: RUSTFS_CONFIG.endpoint,
      bucket: RUSTFS_CONFIG.bucket,
      objectKey: objectKey,
      localFilePath: localFilePath
    }
    
    // 创建增强的错误对象
    const enhancedError = new Error(`上传文件失败: ${error.message}`)
    enhancedError.originalError = error
    enhancedError.details = errorDetails
    throw enhancedError
  }
}

/**
 * 删除文件
 * @param {string} objectKey - 对象存储中的键（路径）
 * @returns {Promise<boolean>} 是否删除成功
 */
const deleteFile = async (objectKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: RUSTFS_CONFIG.bucket,
      Key: objectKey
    })

    await getS3Client().send(command)
    return true
  } catch (error) {
    console.error('删除文件失败:', error)
    throw error
  }
}

/**
 * 检查文件是否存在
 * @param {string} objectKey - 对象存储中的键（路径）
 * @returns {Promise<boolean>} 文件是否存在
 */
const fileExists = async (objectKey) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: RUSTFS_CONFIG.bucket,
      Key: objectKey
    })

    await getS3Client().send(command)
    return true
  } catch (error) {
    // 文件不存在的情况
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false
    }
    
    // 提取详细的错误信息
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.Code || error.code,
      httpStatusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      endpoint: RUSTFS_CONFIG.endpoint,
      bucket: RUSTFS_CONFIG.bucket,
      objectKey: objectKey
    }
    
    // 创建增强的错误对象
    const enhancedError = new Error(`检查文件存在性失败: ${error.message}`)
    enhancedError.originalError = error
    enhancedError.details = errorDetails
    throw enhancedError
  }
}

/**
 * 获取预签名 URL（临时访问链接）
 * @param {string} objectKey - 对象存储中的键（路径）
 * @param {number} expiresIn - 过期时间（秒），默认 1 小时
 * @returns {Promise<string>} 预签名 URL
 */
const getPresignedUrl = async (objectKey, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: RUSTFS_CONFIG.bucket,
      Key: objectKey
    })

    const url = await getSignedUrl(getS3Client(), command, { expiresIn })
    return url
  } catch (error) {
    console.error('获取预签名 URL 失败:', error)
    throw error
  }
}

/**
 * 从完整 URL 中提取 objectKey
 * @param {string} url - 完整 URL
 * @returns {string} objectKey
 */
const extractObjectKeyFromUrl = (url) => {
  if (!url) return null
  
  // 如果是完整 URL，提取路径部分
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const baseUrl = getFileBaseUrl()
    if (url.startsWith(baseUrl)) {
      return url.substring(baseUrl.length)
    }
    // 尝试从 URL 中提取 bucket 后的路径
    const match = url.match(/\/[^\/]+\/(.+)$/)
    if (match) {
      return match[1]
    }
  }
  
  // 如果已经是相对路径，直接返回
  return url
}

/**
 * 测试 RustFS 连接
 * @returns {Promise<{success: boolean, message: string, details?: any}>}
 */
const testConnection = async () => {
  try {
    // 先尝试检查存储桶是否存在（不需要 ListBuckets 权限）
    const { HeadBucketCommand } = require('@aws-sdk/client-s3')
    const headCommand = new HeadBucketCommand({
      Bucket: RUSTFS_CONFIG.bucket
    })
    
    try {
      await getS3Client().send(headCommand)
      return {
        success: true,
        message: '连接成功，存储桶可访问',
        details: {
          bucket: RUSTFS_CONFIG.bucket,
          endpoint: RUSTFS_CONFIG.endpoint
        }
      }
    } catch (headError) {
      // 如果 HeadBucket 失败，尝试 ListBuckets（需要更高权限）
      if (headError.$metadata?.httpStatusCode === 403 || headError.$metadata?.httpStatusCode === 404) {
        const { ListBucketsCommand } = require('@aws-sdk/client-s3')
        const listCommand = new ListBucketsCommand({})
        const response = await getS3Client().send(listCommand)
        
        return {
          success: true,
          message: '连接成功（但无法访问指定存储桶）',
          details: {
            buckets: response.Buckets?.map(b => b.Name) || [],
            targetBucket: RUSTFS_CONFIG.bucket,
            endpoint: RUSTFS_CONFIG.endpoint,
            warning: '指定的存储桶可能不存在或无权访问'
          }
        }
      }
      throw headError
    }
  } catch (error) {
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.Code || error.code,
      httpStatusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      endpoint: RUSTFS_CONFIG.endpoint,
      bucket: RUSTFS_CONFIG.bucket
    }
    
    // 根据错误类型提供不同的建议
    let suggestion = ''
    if (error.$metadata?.httpStatusCode === 403) {
      suggestion = '权限不足。请检查：\n' +
        '  1. 用户是否有访问存储桶的权限\n' +
        '  2. 存储桶策略是否正确配置\n' +
        '  3. 用户策略是否包含 s3:ListBucket 和 s3:GetObject 权限'
    } else if (error.$metadata?.httpStatusCode === 404) {
      suggestion = '存储桶不存在。请在 RustFS/MinIO 控制台创建存储桶：' + RUSTFS_CONFIG.bucket
    }
    
    return {
      success: false,
      message: `连接失败: ${error.message}`,
      details: errorDetails,
      suggestion: suggestion,
      error: error
    }
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  fileExists,
  getPresignedUrl,
  extractObjectKeyFromUrl,
  testConnection
}
