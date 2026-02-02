/**
 * 头像有效性检查工具
 * 在服务端检查头像URL的有效性，并更新 avatar_cache 表
 */

const https = require('https')
const http = require('http')
const { URL } = require('url')
const sequelizeExecute = require('./util').sequelizeExecute
const db = require('../models')

// 获取 avatarCache 模型的辅助函数
const getAvatarCacheModel = () => {
  // 尝试多种可能的名称
  let model = db.collection('avatarCache') || db.avatarCache
  if (!model) {
    // 调试：输出可用的模型名称
    const availableModels = Object.keys(db).filter(key => 
      typeof db[key] === 'object' && 
      db[key] !== null && 
      !['Sequelize', 'databaseConf', 'collection', 'serverDate', 'dropRestApiTable'].includes(key)
    )
    console.warn('avatarCache 模型未加载')
    console.warn('可用的模型:', availableModels)
    console.warn('请确保：1) 模型已在 models/index.js 中注册 2) 服务已重启')
    return null
  }
  return model
}

// URL检查结果缓存（内存缓存，避免重复检查同一个URL）
const urlCheckCache = new Map()
const CACHE_EXPIRE_TIME = 24 * 60 * 60 * 1000 // 24小时

/**
 * 检查单个头像URL的有效性
 * @param {string} avatarUrl - 头像URL
 * @returns {Promise<boolean>} - 是否有效
 */
const checkAvatarUrl = (avatarUrl) => {
  return new Promise((resolve) => {
    if (!avatarUrl || !avatarUrl.trim() || !avatarUrl.startsWith('http')) {
      resolve(false)
      return
    }

    // 检查内存缓存
    if (urlCheckCache.has(avatarUrl)) {
      const cached = urlCheckCache.get(avatarUrl)
      const now = Date.now()
      if (now - cached.timestamp < CACHE_EXPIRE_TIME) {
        resolve(cached.isValid)
        return
      } else {
        urlCheckCache.delete(avatarUrl)
      }
    }

    try {
      const urlObj = new URL(avatarUrl)
      const isHttps = urlObj.protocol === 'https:'
      const client = isHttps ? https : http

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000 // 5秒超时
      }

      const req = client.request(options, (res) => {
        res.on('data', () => {}) // 消费数据流
        res.on('end', () => {
          const errno = res.headers['x-errno'] || res.headers['X-Errno']
          const statusCode = res.statusCode
          const contentType = res.headers['content-type'] || res.headers['Content-Type']

          // 检查 X-Errno（可能是单个值或多个值）
          let hasError = false
          if (errno) {
            const errnoValues = String(errno).split(',').map(v => v.trim())
            hasError = errnoValues.some(v => v === '-6101' || parseInt(v) === -6101)
          }

          // 检查是否有效
          const isValid = !hasError &&
                          statusCode === 200 &&
                          contentType && contentType.startsWith('image/')

          // 缓存结果到内存
          const now = Date.now()
          urlCheckCache.set(avatarUrl, { isValid, timestamp: now })

          resolve(isValid)
        })
      })

      req.on('error', () => {
        // 请求失败，认为无效
        const now = Date.now()
        urlCheckCache.set(avatarUrl, { isValid: false, timestamp: now })
        resolve(false)
      })

      req.on('timeout', () => {
        req.destroy()
        const now = Date.now()
        urlCheckCache.set(avatarUrl, { isValid: false, timestamp: now })
        resolve(false)
      })

      req.end()
    } catch (error) {
      console.error('检查头像URL失败:', error)
      resolve(false)
    }
  })
}

/**
 * 从数据库获取或检查头像有效性
 * @param {string} avatarUrl - 头像URL
 * @returns {Promise<boolean>} - 是否有效
 */
const getOrCheckAvatarValidity = async (avatarUrl) => {
  if (!avatarUrl || !avatarUrl.trim() || !avatarUrl.startsWith('http')) {
    return false
  }

  try {
    const avatarCacheModel = getAvatarCacheModel()
    if (!avatarCacheModel) {
      // 如果模型未加载，直接检查URL（不缓存）
      return await checkAvatarUrl(avatarUrl)
    }
    
    // 先从数据库查询
    const cached = await sequelizeExecute(
      avatarCacheModel.findOne({
        where: {
          avatarUrl: avatarUrl
        },
        raw: true
      })
    )

    if (cached) {
      const now = Date.now()
      const checkedAt = new Date(cached.checkedAt || cached.checkedat).getTime()
      const age = now - checkedAt

      // 如果检查时间在24小时内，直接返回缓存结果
      if (age < CACHE_EXPIRE_TIME) {
        // 更新内存缓存
        urlCheckCache.set(avatarUrl, { isValid: cached.isValid, timestamp: checkedAt })
        return cached.isValid
      }
    }

    // 需要重新检查
    const isValid = await checkAvatarUrl(avatarUrl)

    // 更新或插入数据库
    if (avatarCacheModel) {
      if (cached) {
        await sequelizeExecute(
          avatarCacheModel.update({
            isValid: isValid,
            checkCount: (cached.checkCount || cached.checkcount || 0) + 1,
            checkedAt: new Date()
          }, {
            where: {
              avatarUrl: avatarUrl
            }
          })
        )
      } else {
        await sequelizeExecute(
          avatarCacheModel.create({
            avatarUrl: avatarUrl,
            isValid: isValid,
            checkCount: 1,
            checkedAt: new Date()
          })
        )
      }
    }

    return isValid
  } catch (error) {
    console.error('获取或检查头像有效性失败:', error)
    // 出错时返回 false，避免显示无效头像
    return false
  }
}

/**
 * 批量获取玩家头像有效性
 * @param {Array} players - 玩家数组，每个元素包含 _id 和 avatarUrl
 * @returns {Promise<Array>} - 返回包含 avatarValid 字段的玩家数组
 */
const batchGetAvatarValidity = async (players) => {
  if (!players || players.length === 0) {
    return players
  }

  // 收集所有需要检查的头像URL
  const avatarUrls = []
  const playerMap = new Map()

  players.forEach(player => {
    const avatarUrl = player.avatarUrl || player.avatarurl || ''
    if (avatarUrl && avatarUrl.trim() && avatarUrl.startsWith('http')) {
      if (!playerMap.has(avatarUrl)) {
        avatarUrls.push(avatarUrl)
        playerMap.set(avatarUrl, [])
      }
      playerMap.get(avatarUrl).push(player)
    }
  })

  if (avatarUrls.length === 0) {
    // 没有需要检查的头像，直接返回
    return players.map(player => ({
      ...player,
      avatarValid: false,
      avatarUrl: player.avatarUrl || player.avatarurl || ''
    }))
  }

  // 批量查询数据库
  const Sequelize = require('sequelize')
  const avatarCacheModel = getAvatarCacheModel()
  
  if (!avatarCacheModel) {
    console.warn('avatarCache 模型未加载，跳过头像有效性检查，返回默认值')
    // 如果模型未加载，返回默认值（所有头像都认为有效，避免阻塞）
    return players.map(player => {
      const avatarUrl = player.avatarUrl || player.avatarurl || ''
      return {
        ...player,
        avatarValid: avatarUrl && avatarUrl.trim() && avatarUrl.startsWith('http') ? true : false,
        avatarUrl: avatarUrl
      }
    })
  }
  
  const cachedResults = await sequelizeExecute(
    avatarCacheModel.findAll({
      where: {
        avatarUrl: {
          [Sequelize.Op.in]: avatarUrls
        }
      },
      raw: true
    })
  )

  const now = Date.now()
  const validityMap = new Map()
  const needCheckUrls = []

  // 处理已缓存的结果
  cachedResults.forEach(cached => {
    const url = cached.avatarUrl || cached.avatarurl
    if (!url) return
    const checkedAt = new Date(cached.checkedAt || cached.checkedat || cached.checked_at).getTime()
    const age = now - checkedAt

    if (age < CACHE_EXPIRE_TIME) {
      // 缓存有效
      const isValid = cached.isValid !== undefined ? cached.isValid : (cached.isvalid !== undefined ? cached.isvalid : true)
      validityMap.set(url, isValid)
      urlCheckCache.set(url, { isValid: isValid, timestamp: checkedAt })
    } else {
      // 缓存过期，需要重新检查
      needCheckUrls.push(url)
    }
  })

  // 找出需要检查的URL（不在缓存中的）
  avatarUrls.forEach(url => {
    if (!validityMap.has(url)) {
      needCheckUrls.push(url)
    }
  })

  // 批量检查需要更新的URL（限制并发数）
  const checkPromises = needCheckUrls.map(async (url) => {
    const isValid = await checkAvatarUrl(url)
    validityMap.set(url, isValid)

    // 异步更新数据库（不阻塞返回）
    const Sequelize = require('sequelize')
    const avatarCacheModel = getAvatarCacheModel()
    
    if (avatarCacheModel) {
      // 先尝试更新，如果不存在则插入
      sequelizeExecute(
        avatarCacheModel.findOne({
          where: { avatarUrl: url },
          raw: true
        })
      ).then(existing => {
        if (existing) {
          return sequelizeExecute(
            avatarCacheModel.update({
              isValid: isValid,
              checkCount: Sequelize.literal('COALESCE(checkcount, 0) + 1'),
              checkedAt: new Date()
            }, {
              where: { avatarUrl: url }
            })
          )
        } else {
          return sequelizeExecute(
            avatarCacheModel.create({
              avatarUrl: url,
              isValid: isValid,
              checkCount: 1,
              checkedAt: new Date()
            })
          )
        }
      }).catch(err => {
        console.error(`更新头像缓存失败 (${url}):`, err)
      })
    }

    return { url, isValid }
  })

  // 等待所有检查完成
  await Promise.all(checkPromises)

  // 为每个玩家添加 avatarValid 字段
  return players.map(player => {
    const avatarUrl = player.avatarUrl || player.avatarurl || ''
    let avatarValid = false

    if (avatarUrl && avatarUrl.trim() && avatarUrl.startsWith('http')) {
      avatarValid = validityMap.get(avatarUrl) || false
    }

    return {
      ...player,
      avatarValid: avatarValid,
      avatarUrl: avatarUrl
    }
  })
}

module.exports = {
  checkAvatarUrl,
  getOrCheckAvatarValidity,
  batchGetAvatarValidity
}
