const db = require("../models")
const Op = require("sequelize").Op

// wechat api
const wechat = require("./wechat")

// utils
const paginate = require("../utils/util").paginate
const md5String = require("../utils/util").md5String
const queryLike = require("../utils/util").queryLike
const validateSession = require("../utils/util").validateSession
const sequelizeExecute = require("../utils/util").sequelizeExecute
const successResponse = require("../utils/response").successResponse
const errorResponse = require("../utils/response").errorResponse
const userAvatarFix = require("../utils/util").userAvatarFix
const ErrorCode = require("./errorcode")

// RustFS 文件基础 URL（替代原来的 SERVER_URL_UPLOADS）
const { getFileBaseUrl } = require("../config/storage.config")
const SERVER_URL_UPLOADS = getFileBaseUrl()

// 云函数入口函数
exports.main = async (request, result) => {
  let event = request.query

  console.log('userService')
  console.log(event)

  let action = event.action

  let data
  if (action == 'login') {
    data = await login(event.code)
  } else if (action == 'detail') {
    data = await readUserDetail(event.openid)
  } else if (action == 'list') {
    let pageNum = (event.pageNum == null) ? 1 : event.pageNum
    let pageSize = (event.pageSize == null) ? 10 : event.pageSize
    data = await listUserInClub(event.clubid, pageNum, pageSize)
  } else if (action == 'listAll') {
    let pageNum = 1
    let pageSize = RECORD_MAX_COUNT
    data = await listUserInClub(event.clubid, pageNum, pageSize)
  } else if (action == 'search') {
    data = await searchUserInClub(event.clubid, event.keyword)
  } else if (action == 'update') {
    let openid = event.openid
    let userInfo = event.userInfo
    data = await upSertUserInfo(openid, userInfo)
  } else if (action == 'saveconfig') {
    let key = event.key
    let value = event.value
    data = await updateUserConfig(event.openid, key, value)
  } else if (action == 'readconfig') {
    let key = event.key
    data = await readUserConfig(event.openid, key)
  } else if (action == 'isVip') {
    data = await isUserVip(event.openid)
  }

  console.log('userService return:')
  console.log(data)

  successResponse(result, {
    data
  })
}

// 用户登录
login = async (code) => {
  let code2Session = await wechat.getOpenid(code)
  console.log(code2Session)
  let openid = code2Session.openid

  let {
    userInfo
  } = await readUserDetail(openid)

  console.log(userInfo)

  if (userInfo && userInfo.name) {
    return {
      openid,
      userInfo
    }
  } else {
    if (userInfo == null) {
      await addUserInfo(openid)
    }
    return {
      openid
    }
  }

}

upSertUserInfo = async (openid, userInfo) => {
  if (openid == null || userInfo == null) {
    console.log('upSertUserInfo: all NULL')
    return null
  }

  // console.log(typeof(userInfo) )
  if (typeof userInfo === 'string') {
    userInfo = JSON.parse(userInfo)
  }

  let obj = await sequelizeExecute(
    db.collection('users').findOne({
      where: {
        openid: openid
      }
    })
  )

  let avatarUrl = userInfo.avatarUrl
  if (avatarUrl != null && avatarUrl.startsWith(SERVER_URL_UPLOADS)) {
    avatarUrl = avatarUrl.substring(SERVER_URL_UPLOADS.length)
    console.log('trim avatarUrl to: ' + avatarUrl)
    userInfo.avatarUrl = avatarUrl
  }

  // console.log(obj)

  if (obj != null) {
    console.log('updateUserInfo')

    let playerCount = await sequelizeExecute(
      db.collection('players').update({
        name: userInfo.name,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
      },{
        where: {
          openid: openid
        }
      })
    )
    console.log('update player count: ' + playerCount)

    return await updateUserInfo(openid, userInfo)
  } else {
    console.log('addUserInfo')
    return await addUserInfo(openid, userInfo)
  }



}

//更新用户微信信息
updateUserInfo = async (openid, userInfo) => {
  console.log(userInfo)
  // let dt = new Date()
  let users = await sequelizeExecute(
    db.collection('users').update({
      name: userInfo.name,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      country: userInfo.country,
      province: userInfo.province,
      city: userInfo.city,
      // createDate: dt
    }, {
      where: {
        openid: openid
      },
    })
  )

  console.log(users)
  // let count = await updatePlayerInfo(openid, userInfo)

  if (users[0] === 1) {
    return {
      count: 1
    }
  } else {
    return null
  }

}

// 添加用户微信信息
addUserInfo = async (openid, userInfo) => {
  // console.log(userInfo)
  let dt = new Date()
  console.log(dt)
  if (userInfo == null) {
    userInfo = {}
  }

  console.log('create user with openid: ' + openid)

  let user = await sequelizeExecute(
    db.collection('users').create({
      openid: openid,
      name: userInfo.name,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      country: userInfo.country,
      province: userInfo.province,
      city: userInfo.city,
      createDate: dt
    })
  )

  console.log(user)

  return {
    msg: user
  }

}

updatePlayerInfo = async (openid, userInfo) => {
  let dt = db.serverDate()
  let res = await sequelizeExecute(
    db.collection('players').update({
      name: userInfo.name,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      updatedDate: dt
    }, {
      where: {
        openid: openid
      }
    })
  )

  console.log(res)
  // return res.data
  let count = res.stats.updated
  return count
}

//读取用户配置
readUserConfig = async (openid, key) => {
  let doc = await sequelizeExecute(
    db.collection('userconfig').findOne({
      where: {
        openid: openid,
        key: key,
      },
      raw: true
    })
  )
  console.log(doc)
  if (doc != null) {
    return doc.value
  }
  return null
}

//更新用户配置
updateUserConfig = async (openid, key, value) => {
  console.log('updateUserConfig: ' + openid + ', ' + key + ', ' + value)

  let exist = await sequelizeExecute(
    db.collection('userconfig').findOne({
      where: {
        openid: openid,
        key: key,
      },
      raw: true
    })
  )

  let doc = await sequelizeExecute(
    db.collection('userconfig').upsert({
      _id: exist ? exist._id : null,
      openid: openid,
      key: key,
      value: value,
    })
  )
  console.log(doc)
  return {
    data: doc
  }
}

isUserVip = async (openid) => {
  console.log('user ' + openid + ' isVip?')
  let vip = await readUserConfig(openid, 'vip')
  if (vip == null) {
    vip = false
  }
  return vip
}

readUserDetail = async (openid) => {
  // let dt = db.serverDate()
  let userInfo = await sequelizeExecute(
    db.collection('users').findOne({
      where: {
        openid: openid
      },
      raw: true
    }))

  console.log(userInfo)
  if (userInfo != null) {
    let avatarUrl = userInfo.avatarUrl
    // console.log(avatarUrl)
    if ((avatarUrl != null) && (avatarUrl.length > 0) &&
      !avatarUrl.startsWith('http') &&
      !avatarUrl.startsWith('cloud://')) {
      userInfo.avatarUrl = SERVER_URL_UPLOADS + avatarUrl
    }
    // console.log(userInfo)
  }

  return {
    userInfo
  }
}

//列出俱乐部成员
listUserInClub = async (clubid, pageNum, pageSize) => {
  let players = await sequelizeExecute(
    db.collection('players').findAll({
      where: {
        clubid: clubid,
      },
      order: [
        ['order', 'DESC']
      ],
      offset: pageSize * (pageNum - 1),
      limit: pageSize - 0,
      raw: true
    })
  )

  players = userAvatarFix(players)
   
  console.log(players)

  return players
}

//列出俱乐部成员
searchUserInClub = async (clubid, keyword) => {
  // let regex = '.*' + keyword
  let players = await sequelizeExecute(
    db.collection('players').findAll({
      where: {
        clubid: clubid,
        name: {
          [Op.substring]: keyword
        }
      },
      order: [
        ['order', 'DESC']
      ],
      raw: true
    })
  )

  console.log(players)

  return players
}

// ========== 管理台专用 API ==========

// 规范化用户字段名（处理 PostgreSQL 小写字段名）
const normalizeUserFields = (user) => {
  if (!user) return user
  const normalized = { ...user }
  // 转换字段名
  if (user.createdate !== undefined) {
    normalized.createDate = user.createdate
    delete normalized.createdate
  }
  if (user.updatetime !== undefined) {
    normalized.updateTime = user.updatetime
    delete normalized.updatetime
  }
  if (user.avatarurl !== undefined) {
    normalized.avatarUrl = user.avatarurl
    delete normalized.avatarurl
  }
  return normalized
}

// 获取所有用户列表（管理台）
exports.listAll = async (request, result) => {
  try {
    let pageNum = parseInt(request.query.pageNum) || 1
    let pageSize = parseInt(request.query.pageSize) || 10
    let keyword = request.query.keyword || ''

    // 权限过滤：如果是俱乐部管理员，先获取该俱乐部的所有用户 openid
    let allowedOpenids = null
    if (request.admin && request.admin.role === 'club_admin' && request.admin.clubIds && request.admin.clubIds.length > 0) {
      const clubPlayers = await sequelizeExecute(
        db.collection('players').findAll({
          where: {
            clubid: {
              [Op.in]: request.admin.clubIds
            },
            enable: {
              [Op.ne]: 0
            }
          },
          attributes: ['openid'],
          raw: true
        })
      )
      allowedOpenids = clubPlayers.map(p => p.openid).filter(Boolean)
      
      // 如果没有用户，直接返回空列表
      if (allowedOpenids.length === 0) {
        return successResponse(result, {
          data: {
            list: [],
            total: 0,
            pageNum: pageNum,
            pageSize: pageSize
          }
        })
      }
    }

    let whereCondition = {}

    // 权限过滤：如果是俱乐部管理员，只查询允许的用户
    if (allowedOpenids) {
      whereCondition.openid = {
        [Op.in]: allowedOpenids
      }
    }

    // 搜索条件 - PostgreSQL 字段名是小写的（只搜索姓名）
    if (keyword) {
      if (allowedOpenids) {
        whereCondition = {
          ...whereCondition,
          ...queryLike(keyword, ['name'])
        }
      } else {
        whereCondition = {
          ...queryLike(keyword, ['name'])
        }
      }
    }

    let { count, rows } = await sequelizeExecute(
      db.collection('users').findAndCountAll({
        where: whereCondition,
        order: [['createdate', 'DESC']],
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
        raw: true
      })
    )

    // 收集所有用户的 openid
    const userOpenids = rows.map(user => user.openid).filter(Boolean)
    
    // 批量查询用户所属的俱乐部
    let clubsMap = {}
    if (userOpenids.length > 0) {
      let playersWhere = {
        openid: {
          [Op.in]: userOpenids
        },
        enable: {
          [Op.ne]: 0  // PostgreSQL 中 enable 是 INTEGER，0=禁用，非0=启用
        }
      }
      
      // 如果有限制俱乐部，只查询该俱乐部的关联
      if (request.admin && request.admin.role === 'club_admin' && request.admin.clubid) {
        playersWhere.clubid = request.admin.clubid
      }
      
      const players = await sequelizeExecute(
        db.collection('players').findAll({
          where: playersWhere,
          attributes: ['openid', 'clubid', 'createdate'],
          raw: true
        })
      )

      // 收集所有俱乐部ID（添加空值检查）
      const clubIds = players && players.length > 0 
        ? [...new Set(players.map(p => p.clubid).filter(Boolean))]
        : []
      
      // 查询俱乐部信息
      if (clubIds.length > 0) {
        const clubs = await sequelizeExecute(
          db.collection('clubs').findAll({
            where: {
              _id: {
                [Op.in]: clubIds
              },
              delete: {
                [Op.ne]: 1
              }
            },
            attributes: ['_id', 'shortname', 'wholename'],
            raw: true
          })
        )

        // 构建 clubid -> club info 的映射
        const clubsInfoMap = {}
        clubs.forEach(club => {
          clubsInfoMap[club._id] = {
            _id: club._id,
            shortName: club.shortname || '',
            wholeName: club.wholename || ''
          }
        })

        // 构建 openid -> clubs 的映射（添加空值检查和加入时间）
        if (players && players.length > 0) {
          players.forEach(player => {
            if (!clubsMap[player.openid]) {
              clubsMap[player.openid] = []
            }
            if (clubsInfoMap[player.clubid]) {
              const clubInfo = {
                ...clubsInfoMap[player.clubid],
                joinDate: player.createdate || player.createDate || null  // 加入时间（处理字段名大小写）
              }
              clubsMap[player.openid].push(clubInfo)
            }
          })
        }
      }
    }

    // 处理 avatar URL 并规范化字段名，添加所属俱乐部信息
    rows = rows.map(user => {
      let normalized = normalizeUserFields(user)
      
      // 处理 avatar URL
      const avatarUrl = normalized.avatarUrl
      if (avatarUrl != null && avatarUrl.length > 0 && 
          !avatarUrl.startsWith('http') && 
          !avatarUrl.startsWith('cloud://')) {
        normalized.avatarUrl = SERVER_URL_UPLOADS + avatarUrl
      }
      
      // 添加所属俱乐部信息
      normalized.clubs = clubsMap[normalized.openid] || []
      
      // 计算最早加入时间（如果有多个俱乐部，取最早的加入时间）
      if (normalized.clubs.length > 0) {
        const joinDates = normalized.clubs
          .map(club => club.joinDate)
          .filter(date => date != null)
          .map(date => new Date(date))
          .sort((a, b) => a - b)
        
        if (joinDates.length > 0) {
          normalized.earliestJoinDate = joinDates[0]
        }
      }
      
      return normalized
    })

    successResponse(result, {
      data: {
        list: rows,
        total: count,
        pageNum: pageNum,
        pageSize: pageSize
      }
    })
  } catch (error) {
    console.error('listAll users error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取用户列表失败')
  }
}

// 根据ID获取用户详情（管理台）
exports.getById = async (request, result) => {
  try {
    const openid = request.params.id
    if (!openid) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '用户OpenID不能为空')
    }

    let user = await sequelizeExecute(
      db.collection('users').findOne({
        where: {
          openid: openid
        },
        raw: true
      })
    )

    if (!user) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '用户不存在')
    }

    // 规范化字段名
    user = normalizeUserFields(user)

    // 处理 avatar URL
    const avatarUrl = user.avatarUrl
    if (avatarUrl != null && avatarUrl.length > 0 && 
        !avatarUrl.startsWith('http') && 
        !avatarUrl.startsWith('cloud://')) {
      user.avatarUrl = SERVER_URL_UPLOADS + avatarUrl
    }

    // 权限过滤：如果是俱乐部管理员，只能查看关联俱乐部的用户
    let playersWhere = {
      openid: openid,
      enable: {
        [Op.ne]: 0  // PostgreSQL 中 enable 是 INTEGER，0=禁用，非0=启用
      }
    }
    
    if (request.admin && request.admin.role === 'club_admin' && request.admin.clubIds && request.admin.clubIds.length > 0) {
      playersWhere.clubid = {
        [Op.in]: request.admin.clubIds
      }
    }
    
    // 查询用户所属的俱乐部（包含加入时间）
    const players = await sequelizeExecute(
      db.collection('players').findAll({
        where: playersWhere,
        attributes: ['clubid', 'createdate'],
        raw: true
      })
    )

    const clubIds = players && players.length > 0 
      ? players.map(p => p.clubid).filter(Boolean)
      : []
    
    // 权限检查：如果是俱乐部管理员，确保用户属于该俱乐部
    if (request.admin && request.admin.role === 'club_admin' && request.admin.clubid) {
      if (clubIds.length === 0 || !clubIds.includes(request.admin.clubid)) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权访问该用户信息')
      }
    }
    
    // 构建 clubid -> joinDate 的映射
    const clubJoinDateMap = {}
    if (players && players.length > 0) {
      players.forEach(player => {
        if (player.clubid) {
          clubJoinDateMap[player.clubid] = player.createdate || player.createDate || null
        }
      })
    }
    
    if (clubIds.length > 0) {
      const clubs = await sequelizeExecute(
        db.collection('clubs').findAll({
          where: {
            _id: {
              [Op.in]: clubIds
            },
            delete: {
              [Op.ne]: 1
            }
          },
          attributes: ['_id', 'shortname', 'wholename'],
          raw: true
        })
      )

      user.clubs = clubs.map(club => ({
        _id: club._id,
        shortName: club.shortname || '',
        wholeName: club.wholename || '',
        joinDate: clubJoinDateMap[club._id] || null
      }))
      
      // 计算最早加入时间
      const joinDates = user.clubs
        .map(club => club.joinDate)
        .filter(date => date != null)
        .map(date => new Date(date))
        .sort((a, b) => a - b)
      
      if (joinDates.length > 0) {
        user.earliestJoinDate = joinDates[0]
      }
    } else {
      user.clubs = []
    }

    successResponse(result, {
      data: user
    })
  } catch (error) {
    console.error('getUserById error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取用户详情失败')
  }
}

// 获取俱乐部成员列表（管理台）
exports.listPlayers = async (request, result) => {
  try {
    const clubid = request.query.clubid
    const keyword = request.query.keyword || ''
    const pageNum = parseInt(request.query.pageNum) || 1
    const pageSize = parseInt(request.query.pageSize) || 100

    if (!clubid) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '俱乐部ID不能为空')
    }

    // 权限检查：如果是俱乐部管理员，只能查看自己关联俱乐部的成员
    if (request.admin && request.admin.role === 'club_admin') {
      const hasAccess = await request.hasClubAccess(clubid)
      if (!hasAccess) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权查看该俱乐部的成员')
      }
    }

    let whereCondition = {
      clubid: clubid,
      enable: {
        [Op.ne]: 0  // PostgreSQL 中 enable 是 INTEGER，0=禁用，非0=启用
      }
    }

    // 搜索条件
    if (keyword) {
      whereCondition.name = {
        [Op.iLike]: `%${keyword}%`
      }
    }

    const { count, rows } = await sequelizeExecute(
      db.collection('players').findAndCountAll({
        where: whereCondition,
        order: [['order', 'DESC'], ['createdate', 'DESC']],
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
        raw: true
      })
    )

    // 处理头像URL
    const players = userAvatarFix(rows || [])

    successResponse(result, {
      data: {
        list: players,
        total: count,
        pageNum: pageNum,
        pageSize: pageSize
      }
    })
  } catch (error) {
    console.error('listPlayers error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取成员列表失败: ' + error.message)
  }
}

// 创建新成员（管理台）
exports.createPlayer = async (request, result) => {
  try {
    const { clubid, name, avatarUrl, gender } = request.body

    if (!clubid) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '俱乐部ID不能为空')
    }

    if (!name) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '成员姓名不能为空')
    }

    // 权限检查：如果是俱乐部管理员，只能为自己关联的俱乐部创建成员
    if (request.admin && request.admin.role === 'club_admin' && request.admin.clubid !== clubid) {
      return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权为该俱乐部创建成员')
    }

    // 检查俱乐部是否存在
    const club = await sequelizeExecute(
      db.collection('clubs').findByPk(clubid, {
        raw: true
      })
    )

    if (!club) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '俱乐部不存在')
    }

    // 获取该俱乐部的最大 order 值
    const maxOrderPlayer = await sequelizeExecute(
      db.collection('players').findOne({
        where: { clubid: clubid },
        order: [['order', 'DESC']],
        attributes: ['order'],
        raw: true
      })
    )

    const newOrder = maxOrderPlayer && maxOrderPlayer.order ? maxOrderPlayer.order + 1 : 1

    // 处理头像URL
    let finalAvatarUrl = avatarUrl || ''
    if (finalAvatarUrl && finalAvatarUrl.startsWith(SERVER_URL_UPLOADS)) {
      finalAvatarUrl = finalAvatarUrl.substring(SERVER_URL_UPLOADS.length)
    }

    const player = await sequelizeExecute(
      db.collection('players').create({
        clubid: clubid,
        name: name,
        avatarUrl: finalAvatarUrl,
        gender: gender || 0,
        openid: null,  // 管理台创建的成员没有 openid
        enable: true,
        order: newOrder,
        createDate: db.serverDate()
      }, {
        raw: true
      })
    )

    if (player) {
      // 处理头像URL用于返回
      const playerData = userAvatarFix([player])[0]
      successResponse(result, {
        data: playerData
      })
    } else {
      errorResponse(result, ErrorCode.DATABASE_ERROR, '创建成员失败')
    }
  } catch (error) {
    console.error('createPlayer error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '创建成员失败: ' + error.message)
  }
}