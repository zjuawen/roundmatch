const db = require("../models")
const Op = require("sequelize").Op
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

// utils
const sequelizeExecute = require("../utils/util").sequelizeExecute
const queryLike = require("../utils/util").queryLike
const successResponse = require("../utils/response").successResponse
const errorResponse = require("../utils/response").errorResponse
const ErrorCode = require("./errorcode")

// JWT 密钥（应该从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'roundmatch-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// ========== 管理台专用 API ==========

// 规范化管理员字段名（处理 PostgreSQL 小写字段名）
const normalizeAdminFields = (admin) => {
  if (!admin) return admin
  const normalized = { ...admin }
  // 转换字段名
  if (admin.createdate !== undefined) {
    normalized.createDate = admin.createdate
    delete normalized.createdate
  }
  if (admin.updatetime !== undefined) {
    normalized.updateTime = admin.updatetime
    delete normalized.updatetime
  }
  if (admin.clubid !== undefined) {
    normalized.clubid = admin.clubid
  }
  return normalized
}

// 生成 JWT Token
const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      username: admin.username,
      role: admin.role,
      clubid: admin.clubid
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// 获取管理员关联的俱乐部ID列表
const getAdminClubIds = async (adminId) => {
  const adminClubs = await sequelizeExecute(
    db.collection('adminClubs').findAll({
      where: {
        adminid: adminId
      },
      attributes: ['clubid'],
      raw: true
    })
  )
  return adminClubs.map(ac => ac.clubid).filter(Boolean)
}

// 检查管理员是否有权限访问某个俱乐部
const hasClubAccess = async (admin, clubId) => {
  if (!admin || !clubId) return false
  
  // 超级管理员有所有权限
  if (admin.role === 'super_admin') {
    return true
  }
  
  // 俱乐部管理员需要检查关联的俱乐部
  if (admin.role === 'club_admin') {
    // 先检查旧的 clubid 字段（向后兼容）
    if (admin.clubid === clubId) {
      return true
    }
    
    // 检查关联表中的俱乐部
    const clubIds = await getAdminClubIds(admin._id)
    return clubIds.includes(clubId)
  }
  
  return false
}

// 验证 JWT Token（中间件）
exports.verifyToken = async (request, result, next) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '') || 
                  request.query.token ||
                  request.body.token

    if (!token) {
      return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '需要登录')
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    
    // 查询管理员信息
    const admin = await sequelizeExecute(
      db.collection('admins').findOne({
        where: {
          _id: decoded.id,
          status: {
            [Op.ne]: 0  // 状态不为禁用
          }
        },
        raw: true
      })
    )

    if (!admin) {
      return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '管理员不存在或已被禁用')
    }

    const normalizedAdmin = normalizeAdminFields(admin)
    
    // 如果是俱乐部管理员，加载关联的俱乐部列表
    if (normalizedAdmin.role === 'club_admin') {
      normalizedAdmin.clubIds = await getAdminClubIds(admin._id)
      // 向后兼容：如果旧的 clubid 存在且不在列表中，添加进去
      if (normalizedAdmin.clubid && !normalizedAdmin.clubIds.includes(normalizedAdmin.clubid)) {
        normalizedAdmin.clubIds.push(normalizedAdmin.clubid)
      }
    }
    
    request.admin = normalizedAdmin
    // 将 hasClubAccess 函数附加到 request 上，方便其他中间件使用
    request.hasClubAccess = (clubId) => hasClubAccess(normalizedAdmin, clubId)
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, 'Token无效')
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, 'Token已过期')
    }
    return errorResponse(result, ErrorCode.INTERNAL_ERROR, '认证失败')
  }
}

// 验证超级管理员权限（中间件）
exports.verifySuperAdmin = async (request, result, next) => {
  if (request.admin && request.admin.role === 'super_admin') {
    next()
  } else {
    return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '需要超级管理员权限')
  }
}

// 管理员登录（账号密码）
exports.login = async (request, result) => {
  try {
    const { username, password } = request.body

    if (!username || !password) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '用户名和密码不能为空')
    }

    const admin = await sequelizeExecute(
      db.collection('admins').findOne({
        where: {
          username: username,
          status: {
            [Op.ne]: 0
          }
        },
        raw: true
      })
    )

    if (!admin) {
      return errorResponse(result, ErrorCode.ERROR_USER_NOT_EXIST, '用户名或密码错误')
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      return errorResponse(result, ErrorCode.ERROR_PASSWORD_ERROR, '用户名或密码错误')
    }

    // 生成 Token
    const normalizedAdmin = normalizeAdminFields(admin)
    const token = generateToken(normalizedAdmin)

    // 返回管理员信息（不包含密码）
    delete normalizedAdmin.password

    successResponse(result, {
      data: {
        token,
        admin: normalizedAdmin
      }
    })
  } catch (error) {
    console.error('admin login error:', error)
    errorResponse(result, ErrorCode.INTERNAL_ERROR, '登录失败: ' + error.message)
  }
}

// 管理员登录（微信扫码）
exports.loginByWechat = async (request, result) => {
  try {
    const { code } = request.body

    if (!code) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '微信授权码不能为空')
    }

    // TODO: 通过 code 获取 openid（需要实现微信登录逻辑）
    // const wechat = require("./wechat")
    // const { openid } = await wechat.getOpenid(code)

    // 临时实现：从请求中获取 openid（实际应该从微信API获取）
    const { openid } = request.body

    if (!openid) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '无法获取微信用户信息')
    }

    const admin = await sequelizeExecute(
      db.collection('admins').findOne({
        where: {
          openid: openid,
          status: {
            [Op.ne]: 0
          }
        },
        raw: true
      })
    )

    if (!admin) {
      return errorResponse(result, ErrorCode.ERROR_USER_NOT_EXIST, '该微信账号未绑定管理员')
    }

    // 生成 Token
    const normalizedAdmin = normalizeAdminFields(admin)
    const token = generateToken(normalizedAdmin)

    // 返回管理员信息（不包含密码）
    delete normalizedAdmin.password

    successResponse(result, {
      data: {
        token,
        admin: normalizedAdmin
      }
    })
  } catch (error) {
    console.error('admin loginByWechat error:', error)
    errorResponse(result, ErrorCode.INTERNAL_ERROR, '微信登录失败: ' + error.message)
  }
}

// 获取当前登录管理员信息
exports.getCurrentAdmin = async (request, result) => {
  try {
    if (!request.admin) {
      return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '未登录')
    }

    const admin = { ...request.admin }
    delete admin.password

    successResponse(result, {
      data: admin
    })
  } catch (error) {
    console.error('getCurrentAdmin error:', error)
    errorResponse(result, ErrorCode.INTERNAL_ERROR, '获取管理员信息失败')
  }
}

// 获取所有管理员列表（仅超级管理员）
exports.listAll = async (request, result) => {
  try {
    let pageNum = parseInt(request.query.pageNum) || 1
    let pageSize = parseInt(request.query.pageSize) || 10
    let keyword = request.query.keyword || ''
    let role = request.query.role || ''

    let whereCondition = {}

    // 搜索条件
    if (keyword) {
      whereCondition = {
        ...whereCondition,
        ...queryLike(keyword, ['username'])
      }
    }

    // 角色筛选
    if (role) {
      whereCondition.role = role
    }

    let { count, rows } = await sequelizeExecute(
      db.collection('admins').findAndCountAll({
        where: whereCondition,
        order: [['createdate', 'DESC']],
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
        raw: true
      })
    )

    // 规范化字段名并查询关联的俱乐部信息
    const clubIds = [...new Set(rows.map(admin => admin.clubid).filter(Boolean))]
    let clubsMap = {}

    if (clubIds.length > 0) {
      const clubs = await sequelizeExecute(
        db.collection('clubs').findAll({
          where: {
            _id: {
              [Op.in]: clubIds
            }
          },
          attributes: ['_id', 'shortname', 'wholename'],
          raw: true
        })
      )

      clubs.forEach(club => {
        clubsMap[club._id] = {
          _id: club._id,
          shortName: club.shortname || '',
          wholeName: club.wholename || ''
        }
      })
    }

    rows = rows.map(admin => {
      let normalized = normalizeAdminFields(admin)
      delete normalized.password
      
      // 添加俱乐部信息
      if (normalized.clubid && clubsMap[normalized.clubid]) {
        normalized.club = clubsMap[normalized.clubid]
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
    console.error('listAll admins error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取管理员列表失败')
  }
}

// 创建管理员（仅超级管理员）
exports.create = async (request, result) => {
  try {
    const { username, password, openid, clubid, clubIds, role } = request.body

    if (!username || !password) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '用户名和密码不能为空')
    }

    // 检查用户名是否已存在
    const existingAdmin = await sequelizeExecute(
      db.collection('admins').findOne({
        where: {
          username: username
        },
        raw: true
      })
    )

    if (existingAdmin) {
      return errorResponse(result, ErrorCode.ERROR_USER_ALREADY_EXIST, '用户名已存在')
    }

    // UUID格式验证正则表达式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    
    // 处理俱乐部ID列表（支持 clubid 和 clubIds）
    const finalClubIds = []
    if (role === 'club_admin') {
      // 支持新的 clubIds 数组
      if (clubIds && Array.isArray(clubIds)) {
        finalClubIds.push(...clubIds.filter(Boolean))
      }
      // 向后兼容：支持旧的 clubid 字段
      if (clubid && !finalClubIds.includes(clubid)) {
        finalClubIds.push(clubid)
      }
      
      // 验证所有俱乐部是否存在
      if (finalClubIds.length > 0) {
        // 检查是否有非UUID格式的ID
        const nonUuidIds = finalClubIds.filter(id => !uuidRegex.test(id))
        
        // 尝试查询俱乐部（先尝试UUID格式，如果失败再尝试字符串格式）
        let clubs = []
        const uuidIds = finalClubIds.filter(id => uuidRegex.test(id))
        
        if (uuidIds.length > 0) {
          const uuidClubs = await sequelizeExecute(
            db.collection('clubs').findAll({
              where: {
                _id: {
                  [Op.in]: uuidIds
                }
              },
              attributes: ['_id'],
              raw: true
            })
          )
          clubs.push(...uuidClubs)
        }
        
        // 对于非UUID格式的ID，尝试使用CAST转换为字符串查询
        if (nonUuidIds.length > 0) {
          try {
            // 使用原生SQL查询，将_id转换为字符串进行比较
            const sequelize = db.databaseConf
            const query = `
              SELECT _id::text as _id 
              FROM roundmatch.clubs 
              WHERE _id::text IN (:ids)
            `
            const nonUuidClubs = await sequelize.query(query, {
              replacements: { ids: nonUuidIds },
              type: sequelize.QueryTypes.SELECT
            })
            // 将查询结果转换为UUID格式
            nonUuidClubs.forEach(club => {
              if (!clubs.find(c => c._id === club._id)) {
                clubs.push({ _id: club._id })
              }
            })
          } catch (error) {
            console.warn('查询非UUID格式的俱乐部ID失败:', error)
            // 如果查询失败，返回错误
            return errorResponse(result, ErrorCode.VALIDATION_ERROR, 
              `俱乐部ID格式不正确或不存在。无效的ID: ${nonUuidIds.join(', ')}`)
          }
        }
        
        const existingClubIds = clubs.map(c => String(c._id))
        const invalidClubIds = finalClubIds.filter(id => {
          const idStr = String(id)
          return !existingClubIds.includes(idStr) && 
                 !existingClubIds.some(existing => existing.toLowerCase() === idStr.toLowerCase())
        })
        
        if (invalidClubIds.length > 0) {
          return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, `俱乐部不存在: ${invalidClubIds.join(', ')}`)
        }
        
        // 使用查询到的UUID格式ID替换原始ID（确保使用数据库中的实际UUID）
        const clubIdMapping = {}
        clubs.forEach(club => {
          finalClubIds.forEach(originalId => {
            const idStr = String(originalId)
            const clubIdStr = String(club._id)
            if (idStr === clubIdStr || idStr.toLowerCase() === clubIdStr.toLowerCase()) {
              clubIdMapping[originalId] = club._id
            }
          })
        })
        
        // 更新finalClubIds为数据库中的实际UUID格式
        const updatedClubIds = finalClubIds.map(id => {
          return clubIdMapping[id] || id
        })
        finalClubIds.length = 0
        finalClubIds.push(...updatedClubIds)
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建管理员（保留旧的 clubid 字段用于向后兼容，使用第一个俱乐部ID）
    const admin = await sequelizeExecute(
      db.collection('admins').create({
        username: username,
        password: hashedPassword,
        openid: openid || null,
        clubid: role === 'super_admin' ? null : (finalClubIds[0] || null),
        role: role || 'club_admin',
        status: 1,
        createDate: db.serverDate()
      }, {
        raw: true
      })
    )

    if (admin) {
      // 创建管理员-俱乐部关联
      if (finalClubIds.length > 0) {
        const adminClubRecords = finalClubIds.map(clubId => ({
          adminid: admin._id,
          clubid: clubId,
          createDate: db.serverDate()
        }))
        await sequelizeExecute(
          db.collection('adminClubs').bulkCreate(adminClubRecords)
        )
      }
      
      const normalizedAdmin = normalizeAdminFields(admin)
      // 加载关联的俱乐部列表
      if (normalizedAdmin.role === 'club_admin') {
        normalizedAdmin.clubIds = await getAdminClubIds(admin._id)
        if (normalizedAdmin.clubid && !normalizedAdmin.clubIds.includes(normalizedAdmin.clubid)) {
          normalizedAdmin.clubIds.push(normalizedAdmin.clubid)
        }
      }
      delete normalizedAdmin.password
      successResponse(result, {
        data: normalizedAdmin
      })
    } else {
      errorResponse(result, ErrorCode.DATABASE_ERROR, '创建管理员失败')
    }
  } catch (error) {
    console.error('createAdmin error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '创建管理员失败: ' + error.message)
  }
}

// 更新管理员（仅超级管理员）
exports.update = async (request, result) => {
  try {
    const adminId = request.params.id
    const { password, openid, clubid, clubIds, role, status } = request.body

    if (!adminId) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '管理员ID不能为空')
    }

    const existingAdmin = await sequelizeExecute(
      db.collection('admins').findByPk(adminId, {
        raw: true
      })
    )

    if (!existingAdmin) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '管理员不存在')
    }

    let updateData = {}
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10)
    }
    if (openid !== undefined) updateData.openid = openid
    if (role !== undefined) updateData.role = role
    if (status !== undefined) updateData.status = status
    
    // 处理俱乐部ID列表
    let finalClubIds = null
    if (clubIds !== undefined || clubid !== undefined) {
      finalClubIds = []
      // 支持新的 clubIds 数组
      if (clubIds !== undefined && Array.isArray(clubIds)) {
        finalClubIds.push(...clubIds.filter(Boolean))
      }
      // 向后兼容：支持旧的 clubid 字段
      if (clubid !== undefined && clubid && !finalClubIds.includes(clubid)) {
        finalClubIds.push(clubid)
      }
      
      // 如果是俱乐部管理员，验证俱乐部是否存在（不验证UUID格式，直接查询数据库）
      if (finalClubIds.length > 0) {
        const clubs = await sequelizeExecute(
          db.collection('clubs').findAll({
            where: {
              _id: {
                [Op.in]: finalClubIds
              }
            },
            attributes: ['_id'],
            raw: true
          })
        )
        const existingClubIds = clubs.map(c => c._id)
        const invalidClubIds = finalClubIds.filter(id => !existingClubIds.includes(id))
        if (invalidClubIds.length > 0) {
          return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, `俱乐部不存在: ${invalidClubIds.join(', ')}`)
        }
      }
      
      // 更新旧的 clubid 字段（向后兼容，使用第一个俱乐部ID）
      // 注意：如果数据库中的clubid字段是UUID类型，但传入的不是UUID格式，可能会出错
      // 这里先尝试设置，如果数据库报错，会在catch中处理
      if (finalClubIds.length > 0) {
        updateData.clubid = finalClubIds[0]
      } else {
        updateData.clubid = null
      }
    }

    // 更新管理员信息
    if (Object.keys(updateData).length > 0) {
      await sequelizeExecute(
        db.collection('admins').update(updateData, {
          where: {
            _id: adminId
          }
        })
      )
    }
    
    // 更新管理员-俱乐部关联
    if (finalClubIds !== null) {
      // 删除旧的关联
      await sequelizeExecute(
        db.collection('adminClubs').destroy({
          where: {
            adminid: adminId
          }
        })
      )
      
      // 创建新的关联
      if (finalClubIds.length > 0) {
        const adminClubRecords = finalClubIds.map(clubId => ({
          adminid: adminId,
          clubid: clubId,
          createDate: db.serverDate()
        }))
        await sequelizeExecute(
          db.collection('adminClubs').bulkCreate(adminClubRecords)
        )
      }
    }
    
    // 获取更新后的管理员信息
    const updatedAdmin = await sequelizeExecute(
      db.collection('admins').findByPk(adminId, {
        raw: true
      })
    )
    
    if (updatedAdmin) {
      const normalizedAdmin = normalizeAdminFields(updatedAdmin)
      // 加载关联的俱乐部列表
      if (normalizedAdmin.role === 'club_admin') {
        normalizedAdmin.clubIds = await getAdminClubIds(adminId)
        if (normalizedAdmin.clubid && !normalizedAdmin.clubIds.includes(normalizedAdmin.clubid)) {
          normalizedAdmin.clubIds.push(normalizedAdmin.clubid)
        }
      }
      delete normalizedAdmin.password
      successResponse(result, {
        data: normalizedAdmin
      })
    } else {
      errorResponse(result, ErrorCode.DATABASE_ERROR, '更新管理员失败')
    }
    if (status !== undefined) updateData.status = status

    const updated = await sequelizeExecute(
      db.collection('admins').update(updateData, {
        where: {
          _id: adminId
        }
      })
    )

    if (updated > 0) {
      const updatedAdmin = await sequelizeExecute(
        db.collection('admins').findByPk(adminId, {
          raw: true
        })
      )
      const normalizedAdmin = normalizeAdminFields(updatedAdmin)
      delete normalizedAdmin.password
      successResponse(result, {
        data: normalizedAdmin
      })
    } else {
      errorResponse(result, ErrorCode.DATABASE_ERROR, '更新管理员失败')
    }
  } catch (error) {
    console.error('updateAdmin error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '更新管理员失败: ' + error.message)
  }
}

// 删除管理员（仅超级管理员）
exports.delete = async (request, result) => {
  try {
    const adminId = request.params.id

    if (!adminId) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '管理员ID不能为空')
    }

    const admin = await sequelizeExecute(
      db.collection('admins').findByPk(adminId, {
        raw: true
      })
    )

    if (!admin) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '管理员不存在')
    }

    if (admin.role === 'super_admin') {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '不能删除超级管理员')
    }

    const deleted = await sequelizeExecute(
      db.collection('admins').destroy({
        where: {
          _id: adminId
        }
      })
    )

    if (deleted > 0) {
      successResponse(result, {
        data: { deleted: true }
      })
    } else {
      errorResponse(result, ErrorCode.DATABASE_ERROR, '删除管理员失败')
    }
  } catch (error) {
    console.error('deleteAdmin error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '删除管理员失败: ' + error.message)
  }
}
