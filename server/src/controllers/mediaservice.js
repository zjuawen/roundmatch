const validateSession = require("../utils/util").validateSession
const sequelizeExecute = require("../utils/util").sequelizeExecute
const successResponse = require("../utils/response").successResponse
const errorResponse = require("../utils/response").errorResponse
const ErrorCode = require("./errorcode")
const Op = require("sequelize").Op

const fs = require('fs');
const path = require('path');
const { uploadFile } = require("../utils/storage")
const https = require('https');
const http = require('http');
const { URL } = require('url');
const db = require("../models")
const { getFileBaseUrl } = require("../config/storage.config")
const SERVER_URL_UPLOADS = getFileBaseUrl()


// 云函数入口函数
exports.main = async (request, result) => {
  // console.log(request)
  // const wxContext = context// cloud.getWXContext()
  let event = request.query

  console.log('mediaService')
  console.log(event)
  // console.log(cloud.DYNAMIC_CURRENT_ENV)

  let action = event.action
  let data = null

  if (action == 'upload') {
    let file = request.file
    console.log('receiving ')
    console.log(file)
    data = await upload(file, event.type)
  }

  console.log('mediaService return:')
  console.log(data)

  successResponse(result, {
    data
  })
}

upload = async (file, type) => {
  try {
    let inputFile = file.path // 获取临时文件路径
    let fileName = 'icon-' + Date.now() + file.originalname.match(/\.[^.]+?$/)[0]
    
    // 根据类型确定存储路径
    let objectKey = ''
    if (type == 'icon') {
      objectKey = 'clubicons/' + fileName
    } else if (type == 'head') {
      objectKey = 'heads/' + fileName
    } else {
      objectKey = 'images/' + fileName
    }
    
    console.log('上传文件到 RustFS:', objectKey)
    
    // 上传到 RustFS 对象存储
    const fileUrl = await uploadFile(inputFile, objectKey)
    
    // 删除临时文件
    try {
      fs.unlinkSync(inputFile)
    } catch (err) {
      console.warn('删除临时文件失败:', err)
    }
    
    console.log('文件上传成功，URL:', fileUrl)
    
    return {
      url: fileUrl
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    // 确保临时文件被清理
    try {
      if (file && file.path) {
        fs.unlinkSync(file.path)
      }
    } catch (err) {
      console.warn('清理临时文件失败:', err)
    }
    throw error
  }
}

// 生成昵称首字头像SVG
const generateAvatarSVG = (name, size = 200) => {
  const firstChar = name && name.length > 0 ? name.charAt(0).toUpperCase() : '?'
  const colors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', 
    '#909399', '#9C27B0', '#00BCD4', '#FF9800',
    '#4CAF50', '#2196F3', '#FF5722', '#795548'
  ]
  const colorIndex = name && name.length > 0 ? name.charCodeAt(0) % colors.length : 0
  const backgroundColor = colors[colorIndex]
  const fontSize = Math.floor(size * 0.5)
  
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" fill="#ffffff" text-anchor="middle" dominant-baseline="central" font-weight="bold">${firstChar}</text>
</svg>`
}

// 上传SVG头像并更新用户资料
const uploadAndUpdateAvatar = async (openid, name) => {
  try {
    // 生成SVG内容
    const svgContent = generateAvatarSVG(name, 200)
    
    // 创建临时文件
    const tempDir = path.join(__dirname, '../../temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    const tempFilePath = path.join(tempDir, `avatar-${openid}-${Date.now()}.svg`)
    fs.writeFileSync(tempFilePath, svgContent, 'utf8')
    
    // 上传到存储
    const objectKey = `avatars/${openid}-${Date.now()}.svg`
    const avatarUrl = await uploadFile(tempFilePath, objectKey, 'image/svg+xml')
    
    // 删除临时文件
    try {
      fs.unlinkSync(tempFilePath)
    } catch (err) {
      console.warn('删除临时文件失败:', err)
    }
    
    // 更新用户头像URL（只保存相对路径）
    const relativePath = avatarUrl.startsWith(SERVER_URL_UPLOADS) 
      ? avatarUrl.substring(SERVER_URL_UPLOADS.length)
      : objectKey
    
    await sequelizeExecute(
      db.collection('users').update({
        avatarUrl: relativePath
      }, {
        where: {
          openid: openid
        }
      })
    )
    
    // 同时更新players表
    await sequelizeExecute(
      db.collection('players').update({
        avatarUrl: relativePath
      }, {
        where: {
          openid: openid
        }
      })
    )
    
    return avatarUrl
  } catch (error) {
    console.error('上传并更新头像失败:', error)
    throw error
  }
}

// 标记头像已检查
const markAvatarChecked = async (openid) => {
  try {
    const existConfig = await sequelizeExecute(
      db.collection('userconfig').findOne({
        where: {
          openid: openid,
          key: 'avatarChecked'
        },
        raw: true
      })
    )
    
    if (existConfig) {
      await sequelizeExecute(
        db.collection('userconfig').update({
          value: 'true'
        }, {
          where: {
            openid: openid,
            key: 'avatarChecked'
          }
        })
      )
    } else {
      await sequelizeExecute(
        db.collection('userconfig').create({
          openid: openid,
          key: 'avatarChecked',
          value: 'true'
        })
      )
    }
  } catch (error) {
    console.error('标记已检查失败:', error)
  }
}

// URL检查结果缓存（内存缓存，避免重复检查同一个URL）
const urlCheckCache = new Map()

// 从数据库加载URL检查结果到内存缓存
const loadUrlCheckCache = async () => {
  try {
    const checks = await sequelizeExecute(
      db.collection('userconfig').findAll({
        where: {
          key: {
            [Op.like]: 'avatarUrlCheck_%'
          }
        },
        raw: true
      })
    )
    
    const now = Date.now()
    const expireTime = 24 * 60 * 60 * 1000 // 24小时
    
    checks.forEach(check => {
      try {
        const data = JSON.parse(check.value)
        const url = check.key.replace('avatarUrlCheck_', '')
        // 只加载未过期的缓存
        if (now - data.timestamp < expireTime) {
          urlCheckCache.set(url, { isValid: data.isValid, timestamp: data.timestamp })
        }
      } catch (e) {
        console.warn('加载URL检查缓存失败:', e)
      }
    })
    
    console.log(`已加载 ${urlCheckCache.size} 个URL检查缓存`)
  } catch (error) {
    console.error('加载URL检查缓存失败:', error)
  }
}

// 保存URL检查结果到数据库
const saveUrlCheckCache = async (url, isValid) => {
  try {
    const key = `avatarUrlCheck_${url}`
    const value = JSON.stringify({ isValid, timestamp: Date.now() })
    
    const exist = await sequelizeExecute(
      db.collection('userconfig').findOne({
        where: {
          openid: null,
          key: key
        },
        raw: true
      })
    )
    
    if (exist) {
      await sequelizeExecute(
        db.collection('userconfig').update({
          value: value
        }, {
          where: {
            _id: exist._id
          }
        })
      )
    } else {
      await sequelizeExecute(
        db.collection('userconfig').create({
          openid: null, // URL检查是全局的，不依赖用户
          key: key,
          value: value
        })
      )
    }
  } catch (error) {
    console.error('保存URL检查缓存失败:', error)
  }
}

// 启动时加载缓存
loadUrlCheckCache()

// 检查头像 URL 的响应头（检查 X-Errno）
exports.checkAvatar = async (request, result) => {
  let responseSent = false
  
  const sendResponse = (data) => {
    if (responseSent) {
      console.warn('响应已发送，跳过重复响应')
      return
    }
    responseSent = true
    successResponse(result, { data })
  }

  try {
    const avatarUrl = request.query.url || request.body.url
    const openid = request.query.openid || request.body.openid
    const name = request.query.name || request.body.name
    
    if (!avatarUrl) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '头像URL不能为空')
    }

    // 检查URL缓存（24小时有效期）
    // 先检查内存缓存
    if (urlCheckCache.has(avatarUrl)) {
      const cached = urlCheckCache.get(avatarUrl)
      const now = Date.now()
      const expireTime = 24 * 60 * 60 * 1000 // 24小时
      
      if (now - cached.timestamp < expireTime) {
        // 缓存有效，直接返回
        return sendResponse({
          isValid: cached.isValid,
          checked: true,
          cached: true,
          message: '使用缓存结果'
        })
      } else {
        // 缓存过期，删除
        urlCheckCache.delete(avatarUrl)
      }
    } else {
      // 内存缓存未命中，尝试从数据库加载
      const key = `avatarUrlCheck_${avatarUrl}`
      const dbCache = await sequelizeExecute(
        db.collection('userconfig').findOne({
          where: {
            openid: null,
            key: key
          },
          raw: true
        })
      )
      
      if (dbCache) {
        try {
          const data = JSON.parse(dbCache.value)
          const now = Date.now()
          const expireTime = 24 * 60 * 60 * 1000 // 24小时
          
          if (now - data.timestamp < expireTime) {
            // 数据库缓存有效，加载到内存并返回
            urlCheckCache.set(avatarUrl, { isValid: data.isValid, timestamp: data.timestamp })
            return sendResponse({
              isValid: data.isValid,
              checked: true,
              cached: true,
              message: '使用数据库缓存结果'
            })
          }
        } catch (e) {
          console.warn('解析数据库缓存失败:', e)
        }
      }
    }

    // 如果提供了openid，检查是否已经检查过
    if (openid) {
      const checked = await sequelizeExecute(
        db.collection('userconfig').findOne({
          where: {
            openid: openid,
            key: 'avatarChecked'
          },
          raw: true
        })
      )
      
      if (checked && checked.value === 'true') {
        // 已经检查过，直接返回用户当前的头像URL
        const user = await sequelizeExecute(
          db.collection('users').findOne({
            where: { openid: openid },
            raw: true
          })
        )
        
        // 缓存结果（内存和数据库）
        const now = Date.now()
        urlCheckCache.set(avatarUrl, { isValid: true, timestamp: now })
        saveUrlCheckCache(avatarUrl, true).catch(err => {
          console.error('保存URL检查缓存失败:', err)
        })
        
        return sendResponse({
          isValid: true,
          checked: true,
          avatarUrl: user?.avatarUrl || avatarUrl,
          message: '已检查过，使用当前头像'
        })
      }
    }

    // console.log('检查头像URL:', avatarUrl)

    // 使用 Node.js 的 http/https 模块检查响应头
    const urlObj = new URL(avatarUrl)
    const isHttps = urlObj.protocol === 'https:'
    const client = isHttps ? https : http

    return new Promise((resolve) => {
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }

      const req = client.request(options, async (res) => {
        // 读取响应数据（HEAD 请求可能没有 body，但需要消费响应）
        res.on('data', () => {}) // 消费数据流
        res.on('end', async () => {
          const errno = res.headers['x-errno'] || res.headers['X-Errno']
          const statusCode = res.statusCode
          const contentType = res.headers['content-type'] || res.headers['Content-Type']

          // console.log('头像响应头检查结果:', {
          //   url: avatarUrl,
          //   statusCode,
          //   errno,
          //   contentType
          // })

          // 检查 X-Errno（可能是单个值或多个值，如 '-6101, -6101'）
          let hasError = false
          if (errno) {
            // 处理可能是逗号分隔的多个值
            const errnoValues = String(errno).split(',').map(v => v.trim())
            hasError = errnoValues.some(v => v === '-6101' || parseInt(v) === -6101)
          }

          // 检查是否有效
          const isValid = !hasError &&
                          statusCode === 200 &&
                          contentType && contentType.startsWith('image/')

          // 如果无效且提供了openid和name，生成并更新头像
          if (!isValid && openid && name) {
            uploadAndUpdateAvatar(openid, name)
              .then(async (newAvatarUrl) => {
                // 标记已检查
                await markAvatarChecked(openid)
                
                sendResponse({
                  isValid: false,
                  errno: errno || null,
                  statusCode,
                  contentType,
                  replaced: true,
                  newAvatarUrl: newAvatarUrl,
                  message: '头像无效，已自动替换为昵称首字头像'
                })
                resolve()
              })
              .catch(async (error) => {
                console.error('替换头像失败:', error)
                // 即使替换失败，也标记为已检查，避免重复尝试
                await markAvatarChecked(openid)
                
                // 缓存结果（即使替换失败也缓存，避免重复尝试）
                const now = Date.now()
                urlCheckCache.set(avatarUrl, { isValid: false, timestamp: now })
                saveUrlCheckCache(avatarUrl, false).catch(err => console.error('保存URL检查缓存失败:', err))
                
                sendResponse({
                  isValid: false,
                  errno: errno || null,
                  statusCode,
                  contentType,
                  replaced: false,
                  error: error.message
                })
                resolve()
              })
            return
          }
          
          // 如果有效，标记已检查
          if (isValid && openid) {
            markAvatarChecked(openid).catch(err => {
              console.error('标记已检查失败:', err)
            })
          }

          // 缓存检查结果（内存和数据库）
          const now = Date.now()
          urlCheckCache.set(avatarUrl, { isValid, timestamp: now })
          saveUrlCheckCache(avatarUrl, isValid).catch(err => {
            console.error('保存URL检查缓存失败:', err)
          })
          
          sendResponse({
            isValid,
            errno: errno || null,
            statusCode,
            contentType,
            replaced: false
          })
          resolve()
        })
      })

      req.on('error', (error) => {
        // console.error('检查头像URL失败:', error)
        // 如果请求失败且提供了openid和name，生成并更新头像
        if (openid && name) {
          uploadAndUpdateAvatar(openid, name)
            .then(async (newAvatarUrl) => {
              // 标记已检查
              await markAvatarChecked(openid)
              
                // 缓存结果（内存和数据库）
                const now = Date.now()
                urlCheckCache.set(avatarUrl, { isValid: false, timestamp: now })
                saveUrlCheckCache(avatarUrl, false).catch(err => console.error('保存URL检查缓存失败:', err))
              const now2 = Date.now()
              urlCheckCache.set(newAvatarUrl, { isValid: true, timestamp: now2 })
              saveUrlCheckCache(newAvatarUrl, true).catch(err => console.error('保存URL检查缓存失败:', err))
              
              sendResponse({
                isValid: false,
                errno: null,
                statusCode: null,
                contentType: null,
                error: error.message,
                replaced: true,
                newAvatarUrl: newAvatarUrl,
                message: '头像检查失败，已自动替换为昵称首字头像'
              })
              resolve()
            })
            .catch(async (e) => {
              console.error('替换头像失败:', e)
              // 即使替换失败，也标记为已检查
              await markAvatarChecked(openid)
              
                // 缓存结果（内存和数据库）
                const now = Date.now()
                urlCheckCache.set(avatarUrl, { isValid: false, timestamp: now })
                saveUrlCheckCache(avatarUrl, false).catch(err => console.error('保存URL检查缓存失败:', err))
              
              sendResponse({
                isValid: false,
                errno: null,
                statusCode: null,
                contentType: null,
                error: error.message,
                replaced: false
              })
              resolve()
            })
          return
        }
        
        // 如果请求失败，返回无效
        // 缓存结果（避免重复检查无效URL）
        const now = Date.now()
        urlCheckCache.set(avatarUrl, { isValid: false, timestamp: now })
        saveUrlCheckCache(avatarUrl, false).catch(err => console.error('保存URL检查缓存失败:', err))
        
        sendResponse({
          isValid: false,
          errno: null,
          statusCode: null,
          contentType: null,
          error: error.message,
          replaced: false
        })
        resolve()
      })

      req.setTimeout(5000, () => {
        req.destroy()
        console.error('检查头像URL超时')
        
        // 如果超时且提供了openid和name，生成并更新头像
        if (openid && name) {
          uploadAndUpdateAvatar(openid, name)
            .then(async (newAvatarUrl) => {
              // 标记已检查
              await markAvatarChecked(openid)
              
                // 缓存结果（内存和数据库）
                const now = Date.now()
                urlCheckCache.set(avatarUrl, { isValid: false, timestamp: now })
                saveUrlCheckCache(avatarUrl, false).catch(err => console.error('保存URL检查缓存失败:', err))
              const now2 = Date.now()
              urlCheckCache.set(newAvatarUrl, { isValid: true, timestamp: now2 })
              saveUrlCheckCache(newAvatarUrl, true).catch(err => console.error('保存URL检查缓存失败:', err))
              
              sendResponse({
                isValid: false,
                errno: null,
                statusCode: null,
                contentType: null,
                error: '请求超时',
                replaced: true,
                newAvatarUrl: newAvatarUrl,
                message: '头像检查超时，已自动替换为昵称首字头像'
              })
              resolve()
            })
            .catch(async (e) => {
              console.error('替换头像失败:', e)
              // 即使替换失败，也标记为已检查
              await markAvatarChecked(openid)
              
                // 缓存结果（内存和数据库）
                const now = Date.now()
                urlCheckCache.set(avatarUrl, { isValid: false, timestamp: now })
                saveUrlCheckCache(avatarUrl, false).catch(err => console.error('保存URL检查缓存失败:', err))
              
              sendResponse({
                isValid: false,
                errno: null,
                statusCode: null,
                contentType: null,
                error: '请求超时',
                replaced: false
              })
              resolve()
            })
          return
        }
        
        // 缓存结果（内存和数据库）
        const now = Date.now()
        urlCheckCache.set(avatarUrl, { isValid: false, timestamp: now })
        saveUrlCheckCache(avatarUrl, false).catch(err => console.error('保存URL检查缓存失败:', err))
        
        sendResponse({
          isValid: false,
          errno: null,
          statusCode: null,
          contentType: null,
          error: '请求超时',
          replaced: false
        })
        resolve()
      })

      req.end()
    })
  } catch (error) {
    console.error('checkAvatar error:', error)
    if (!responseSent) {
      errorResponse(result, ErrorCode.DATABASE_ERROR, '检查头像失败: ' + error.message)
    }
  }
}

imgSecCheck = async (event) => {
  return {
    errCode: 0
  }

  // try {
  //   let res = false;

  //   //  检查图像内容是否违规
  //   if (event.img) {
  //     res = await cloud.openapi.security.imgSecCheck({
  //       media: {
  //         header: {
  //           'Content-Type': 'application/octet-stream'
  //         },
  //         contentType: 'image',
  //         value: Buffer.from(event.img) // 官方文档这里是个坑
  //       }
  //     });
  //   };
  //   return res;
  // } catch (e) {
  //   return e;
  // }
}

//检查消息是否合法
msgSecCheck = async (openid, param) => {
  return {
    errCode: 0
  }
  // let access_token = await readAccessToken();

  // const { content } = param;
  // try {
  //   const res = await cloud.openapi.security.msgSecCheck({
  //     "access_token" : access_token, 
  //     "content": content
  //   })
  //   return res;
  // } catch (err) {
  //   return err;
  // }
}
