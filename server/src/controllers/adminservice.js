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

    request.admin = normalizeAdminFields(admin)
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
    const { username, password, openid, clubid, role } = request.body

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

    // 如果是俱乐部管理员，验证俱乐部是否存在
    if (role === 'club_admin' && clubid) {
      const club = await sequelizeExecute(
        db.collection('clubs').findByPk(clubid, {
          raw: true
        })
      )

      if (!club) {
        return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '俱乐部不存在')
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await sequelizeExecute(
      db.collection('admins').create({
        username: username,
        password: hashedPassword,
        openid: openid || null,
        clubid: role === 'super_admin' ? null : clubid,
        role: role || 'club_admin',
        status: 1,
        createDate: db.serverDate()
      }, {
        raw: true
      })
    )

    if (admin) {
      const normalizedAdmin = normalizeAdminFields(admin)
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
    const { password, openid, clubid, role, status } = request.body

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
    if (clubid !== undefined) updateData.clubid = clubid
    if (role !== undefined) updateData.role = role
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
