/**
 * 将本地 uploads 目录中的文件迁移到 RustFS 对象存储
 * 使用方法: node scripts/migrate-to-rustfs.js
 */

console.log('[初始化] 开始加载配置...')

// 加载环境变量（必须在加载其他模块之前）
console.log('[初始化] 加载环境变量...')
const path = require('path')
const dotenvResult = require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
if (dotenvResult.error) {
  console.warn('[警告] .env 文件加载失败:', dotenvResult.error.message)
  console.warn(`   尝试的路径: ${path.resolve(__dirname, '../.env')}`)
} else {
  console.log('[初始化] ✅ 环境变量加载成功')
  console.log(`   .env 文件路径: ${path.resolve(__dirname, '../.env')}`)
}

// 显示实际读取到的环境变量（用于调试）
console.log('[初始化] 环境变量检查:')
console.log(`   RUSTFS_ENDPOINT: ${process.env.RUSTFS_ENDPOINT || '未设置(使用默认值)'}`)
console.log(`   RUSTFS_ACCESS_KEY: ${process.env.RUSTFS_ACCESS_KEY ? process.env.RUSTFS_ACCESS_KEY.substring(0, 4) + '***' : '未设置(使用默认值 minioadmin)'}`)
console.log(`   RUSTFS_SECRET_KEY: ${process.env.RUSTFS_SECRET_KEY ? '***已设置***' : '未设置(使用默认值)'}`)
console.log(`   RUSTFS_BUCKET: ${process.env.RUSTFS_BUCKET || '未设置(使用默认值)'}`)
console.log(`   RUSTFS_REGION: ${process.env.RUSTFS_REGION || '未设置(使用默认值)'}`)
console.log('')

const fs = require('fs')

// 清除模块缓存，确保重新加载配置（解决模块缓存问题）
console.log('[初始化] 清除配置模块缓存...')
const configModulePath = require.resolve('../src/config/storage.config')
const storageModulePath = require.resolve('../src/utils/storage')
delete require.cache[configModulePath]
delete require.cache[storageModulePath]
console.log('[初始化] ✅ 模块缓存已清除')

// 重新创建 S3 客户端，确保使用最新的环境变量
console.log('[初始化] 重新创建 S3 客户端...')
let storageConfigModule = require('../src/config/storage.config')
const newS3Client = storageConfigModule.recreateS3Client()

// 替换模块导出的 s3Client
storageConfigModule.s3Client = newS3Client

// 重新获取配置（确保是最新的）
const RUSTFS_CONFIG = storageConfigModule.RUSTFS_CONFIG

// 加载存储工具模块
console.log('[初始化] 加载存储工具模块...')
let uploadFile, fileExists, testConnection
try {
  const storageModule = require('../src/utils/storage')
  uploadFile = storageModule.uploadFile
  fileExists = storageModule.fileExists
  testConnection = storageModule.testConnection
  
  // 显示实际使用的配置
  console.log('[初始化] ✅ 存储工具模块加载成功')
  console.log('[初始化] 实际使用的配置:')
  console.log(`   端点: ${RUSTFS_CONFIG.endpoint}`)
  console.log(`   区域: ${RUSTFS_CONFIG.region}`)
  console.log(`   Access Key: ${RUSTFS_CONFIG.accessKeyId.substring(0, 4)}*** (完整值: ${RUSTFS_CONFIG.accessKeyId})`)
  console.log(`   Secret Key: ${RUSTFS_CONFIG.secretAccessKey.substring(0, 4)}***`)
  console.log(`   存储桶: ${RUSTFS_CONFIG.bucket}`)
  console.log('')
} catch (error) {
  console.error('[错误] 无法加载存储工具模块:', error.message)
  console.error('[错误] 错误堆栈:', error.stack)
  process.exit(1)
}

// 配置
const UPLOADS_DIR = path.resolve(__dirname, '../uploads')
console.log('[配置] uploads 目录路径:', UPLOADS_DIR)
const EXCLUDE_DIRS = ['tmp', '.git']
const EXCLUDE_FILES = ['.DS_Store']

// 统计信息
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
  errors: []
}

/**
 * 获取所有需要上传的文件
 */
function getAllFiles(dir, baseDir = dir, depth = 0) {
  const files = []
  const indent = '  '.repeat(depth)
  
  try {
    console.log(`${indent}[扫描] 扫描目录: ${dir}`)
    const items = fs.readdirSync(dir)
    console.log(`${indent}[扫描] 找到 ${items.length} 个项目`)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      
      try {
        const stat = fs.statSync(fullPath)
        
        // 跳过排除的目录和文件
        if (stat.isDirectory()) {
          if (EXCLUDE_DIRS.includes(item)) {
            console.log(`${indent}[跳过] 排除目录: ${item}`)
          } else {
            console.log(`${indent}[目录] 进入: ${item}`)
            files.push(...getAllFiles(fullPath, baseDir, depth + 1))
          }
        } else {
          if (EXCLUDE_FILES.includes(item)) {
            console.log(`${indent}[跳过] 排除文件: ${item}`)
          } else {
            console.log(`${indent}[文件] 找到: ${item} (${(stat.size / 1024).toFixed(2)} KB)`)
            files.push(fullPath)
          }
        }
      } catch (error) {
        console.error(`${indent}[错误] 无法读取项目 ${item}:`, error.message)
      }
    }
  } catch (error) {
    console.error(`${indent}[错误] 读取目录失败: ${dir}`, error.message)
    console.error(`${indent}[错误] 错误堆栈:`, error.stack)
  }
  
  return files
}

/**
 * 将本地路径转换为对象存储的 key
 */
function getObjectKey(localPath, baseDir) {
  // 获取相对于 baseDir 的路径
  const relativePath = path.relative(baseDir, localPath)
  // 统一使用正斜杠作为路径分隔符
  return relativePath.replace(/\\/g, '/')
}

/**
 * 上传单个文件
 */
async function uploadSingleFile(filePath, objectKey) {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`本地文件不存在: ${filePath}`)
    }
    
    const fileSize = fs.statSync(filePath).size
    console.log(`    📄 文件大小: ${(fileSize / 1024).toFixed(2)} KB`)
    
    // 检查文件是否已存在
    console.log(`    🔍 检查文件是否已存在: ${objectKey}`)
    const exists = await fileExists(objectKey)
    if (exists) {
      console.log(`    ⏭️  跳过（已存在）: ${objectKey}`)
      stats.skipped++
      return { success: true, skipped: true }
    }
    
    // 上传文件
    console.log(`    ⬆️  开始上传: ${objectKey}`)
    const url = await uploadFile(filePath, objectKey)
    console.log(`    ✅ 上传成功: ${objectKey}`)
    console.log(`    🔗 URL: ${url}`)
    stats.success++
    return { success: true, url }
  } catch (error) {
    console.error(`    ❌ 上传失败: ${objectKey}`)
    console.error(`    📝 错误信息: ${error.message}`)
    
    // 显示详细的错误信息
    if (error.details) {
      console.error(`    🔍 错误详情:`)
      console.error(`       - 错误名称: ${error.details.name || '未知'}`)
      console.error(`       - HTTP 状态码: ${error.details.httpStatusCode || '未知'}`)
      console.error(`       - 错误代码: ${error.details.code || '未知'}`)
      console.error(`       - 端点: ${error.details.endpoint || '未知'}`)
      console.error(`       - 存储桶: ${error.details.bucket || '未知'}`)
    }
    
    // 显示原始错误的堆栈（如果有）
    if (error.originalError?.stack) {
      console.error(`    📚 原始错误堆栈:`)
      const stackLines = error.originalError.stack.split('\n').slice(0, 5)
      stackLines.forEach(line => console.error(`       ${line}`))
    } else if (error.stack) {
      console.error(`    📚 错误堆栈:`)
      const stackLines = error.stack.split('\n').slice(0, 5)
      stackLines.forEach(line => console.error(`       ${line}`))
    }
    
    stats.failed++
    stats.errors.push({
      file: objectKey,
      error: error.message,
      details: error.details,
      stack: error.stack || error.originalError?.stack
    })
    return { success: false, error: error.message }
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('\n' + '='.repeat(60))
  console.log('🚀 开始迁移文件到 RustFS...')
  console.log('='.repeat(60) + '\n')
  
  // 显示配置信息
  console.log('[配置] 当前配置:')
  console.log(`  📁 源目录: ${UPLOADS_DIR}`)
  console.log(`  🪣 目标存储桶: ${process.env.RUSTFS_BUCKET || 'roundmatch-uploads'}`)
  console.log(`  🌐 RustFS 端点: ${process.env.RUSTFS_ENDPOINT || 'http://localhost:9000'}`)
  console.log(`  🔑 Access Key: ${process.env.RUSTFS_ACCESS_KEY ? '***已配置***' : '未配置'}`)
  console.log(`  🔐 Secret Key: ${process.env.RUSTFS_SECRET_KEY ? '***已配置***' : '未配置'}`)
  console.log(`  🌍 Region: ${process.env.RUSTFS_REGION || 'cn-north-1'}`)
  console.log('')
  
  // 检查源目录是否存在
  console.log('[检查] 检查源目录...')
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error(`❌ 错误: 源目录不存在: ${UPLOADS_DIR}`)
    console.error(`💡 提示: 请确保 uploads 目录存在于正确的位置`)
    process.exit(1)
  }
  console.log(`✅ 源目录存在: ${UPLOADS_DIR}`)
  
  // 检查目录权限
  try {
    fs.accessSync(UPLOADS_DIR, fs.constants.R_OK)
    console.log(`✅ 源目录可读`)
  } catch (error) {
    console.error(`❌ 错误: 无法读取源目录: ${error.message}`)
    process.exit(1)
  }
  
  // 测试 RustFS 连接
  console.log('\n[测试] 测试 RustFS 连接...')
  try {
    const connectionTest = await testConnection()
    if (connectionTest.success) {
      console.log(`✅ RustFS 连接成功`)
      
      if (connectionTest.details?.warning) {
        console.warn(`   ⚠️  ${connectionTest.details.warning}`)
      }
      
      if (connectionTest.details?.buckets) {
        console.log(`   可用存储桶: ${connectionTest.details.buckets.join(', ')}`)
      }
      
      if (connectionTest.details?.bucket) {
        console.log(`   目标存储桶: ${connectionTest.details.bucket}`)
      }
      
      // 检查目标存储桶是否存在
      const targetBucket = process.env.RUSTFS_BUCKET || 'roundmatch-uploads'
      if (connectionTest.details?.buckets?.includes(targetBucket)) {
        console.log(`✅ 目标存储桶 "${targetBucket}" 存在`)
      } else if (connectionTest.details?.bucket === targetBucket) {
        console.log(`✅ 目标存储桶 "${targetBucket}" 可访问`)
      } else {
        console.warn(`⚠️  警告: 无法确认目标存储桶 "${targetBucket}" 的状态`)
        console.warn(`   如果存储桶不存在，请先在 RustFS 控制台创建`)
        console.warn(`   如果存储桶存在但无法访问，请检查权限设置`)
      }
    } else {
      console.error(`❌ RustFS 连接失败: ${connectionTest.message}`)
      if (connectionTest.details) {
        console.error(`   HTTP 状态码: ${connectionTest.details.httpStatusCode || '未知'}`)
        console.error(`   错误代码: ${connectionTest.details.code || '未知'}`)
        console.error(`   端点: ${connectionTest.details.endpoint}`)
        if (connectionTest.details.bucket) {
          console.error(`   存储桶: ${connectionTest.details.bucket}`)
        }
      }
      if (connectionTest.suggestion) {
        console.error(`\n💡 故障排查建议:`)
        console.error(connectionTest.suggestion.split('\n').map(line => `   ${line}`).join('\n'))
      } else {
        console.error(`\n💡 故障排查建议:`)
        console.error(`   1. 检查 RustFS 服务是否运行`)
        console.error(`   2. 检查 RUSTFS_ENDPOINT 配置是否正确`)
        console.error(`   3. 检查 RUSTFS_ACCESS_KEY 和 RUSTFS_SECRET_KEY 是否正确`)
        console.error(`   4. 检查网络连接和防火墙设置`)
      }
      if (connectionTest.error?.stack) {
        console.error(`\n   错误堆栈:`)
        const stackLines = connectionTest.error.stack.split('\n').slice(0, 5)
        stackLines.forEach(line => console.error(`   ${line}`))
      }
      process.exit(1)
    }
  } catch (error) {
    console.error(`❌ 连接测试异常:`, error.message)
    console.error(`   错误堆栈:`, error.stack)
    process.exit(1)
  }
  
  // 获取所有文件
  console.log('\n[扫描] 开始扫描文件...')
  const files = getAllFiles(UPLOADS_DIR)
  stats.total = files.length
  
  if (files.length === 0) {
    console.log('ℹ️  没有找到需要上传的文件')
    console.log(`💡 提示: 请检查 ${UPLOADS_DIR} 目录下是否有文件`)
    return
  }
  
  console.log(`\n✅ 扫描完成，找到 ${files.length} 个文件\n`)
  
  // 显示文件列表（前10个）
  if (files.length > 0) {
    console.log('[预览] 文件列表（前10个）:')
    files.slice(0, 10).forEach((file, index) => {
      const objectKey = getObjectKey(file, UPLOADS_DIR)
      console.log(`  ${index + 1}. ${objectKey}`)
    })
    if (files.length > 10) {
      console.log(`  ... 还有 ${files.length - 10} 个文件`)
    }
    console.log('')
  }
  
  console.log('[上传] 开始上传文件...\n')
  
  // 逐个上传文件（遇到错误立即停止）
  const startTime = Date.now()
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]
    const objectKey = getObjectKey(filePath, UPLOADS_DIR)
    const progress = `[${i + 1}/${files.length}]`
    
    console.log(`${progress} 处理文件: ${objectKey}`)
    const result = await uploadSingleFile(filePath, objectKey)
    console.log('') // 空行分隔
    
    // 如果上传失败，立即停止
    if (!result.success) {
      console.error('\n' + '='.repeat(60))
      console.error('❌ 上传失败，停止迁移')
      console.error('='.repeat(60))
      console.error(`\n失败的文件: ${objectKey}`)
      console.error(`错误信息: ${result.error}`)
      console.error(`\n已处理: ${i + 1}/${files.length} 个文件`)
      console.error(`成功: ${stats.success}`)
      console.error(`跳过: ${stats.skipped}`)
      console.error(`失败: ${stats.failed}`)
      process.exit(1)
    }
  }
  
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)
  
  // 输出统计信息
  console.log('\n' + '='.repeat(60))
  console.log('📊 迁移统计:')
  console.log(`   总计: ${stats.total}`)
  console.log(`   ✅ 成功: ${stats.success}`)
  console.log(`   ⏭️  跳过: ${stats.skipped}`)
  console.log(`   ❌ 失败: ${stats.failed}`)
  console.log(`   ⏱️  耗时: ${duration} 秒`)
  
  if (stats.errors.length > 0) {
    console.log('\n❌ 失败的文件详情:')
    stats.errors.forEach(({ file, error, stack }, index) => {
      console.log(`\n   ${index + 1}. ${file}`)
      console.log(`      错误: ${error}`)
      if (stack) {
        console.log(`      堆栈: ${stack.split('\n')[0]}`)
      }
    })
  }
  
  console.log('='.repeat(60))
  
  // 正常情况下不应该有失败（因为遇到错误会立即停止）
  if (stats.failed > 0) {
    console.log('\n⚠️  有文件上传失败，请检查上面的错误信息')
    process.exit(1)
  } else {
    console.log('\n✅ 所有文件迁移完成！')
  }
}

// 运行主函数
console.log('[启动] 脚本开始执行...\n')
main().catch(error => {
  console.error('\n❌ 迁移过程中发生未捕获的错误:')
  console.error('   错误信息:', error.message)
  console.error('   错误堆栈:', error.stack)
  process.exit(1)
})
