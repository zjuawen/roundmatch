const validateSession = require("../utils/util").validateSession
const sequelizeExecute = require("../utils/util").sequelizeExecute
const successResponse = require("../utils/response").successResponse
const errorResponse = require("../utils/response").errorResponse
const ErrorCode = require("./errorcode")

const fs = require('fs');
const { uploadFile } = require("../utils/storage")
const https = require('https');
const http = require('http');
const { URL } = require('url');


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
    
    if (!avatarUrl) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '头像URL不能为空')
    }

    console.log('检查头像URL:', avatarUrl)

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

      const req = client.request(options, (res) => {
        // 读取响应数据（HEAD 请求可能没有 body，但需要消费响应）
        res.on('data', () => {}) // 消费数据流
        res.on('end', () => {
          const errno = res.headers['x-errno'] || res.headers['X-Errno']
          const statusCode = res.statusCode
          const contentType = res.headers['content-type'] || res.headers['Content-Type']

          console.log('头像响应头检查结果:', {
            url: avatarUrl,
            statusCode,
            errno,
            contentType
          })

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

          sendResponse({
            isValid,
            errno: errno || null,
            statusCode,
            contentType
          })
          resolve()
        })
      })

      req.on('error', (error) => {
        console.error('检查头像URL失败:', error)
        // 如果请求失败，返回无效
        sendResponse({
          isValid: false,
          errno: null,
          statusCode: null,
          contentType: null,
          error: error.message
        })
        resolve()
      })

      req.setTimeout(5000, () => {
        req.destroy()
        console.error('检查头像URL超时')
        sendResponse({
          isValid: false,
          errno: null,
          statusCode: null,
          contentType: null,
          error: '请求超时'
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
