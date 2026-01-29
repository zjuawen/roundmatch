/**
 * Club Config Service
 * 俱乐部配置项管理（积分规则等）
 */

const db = require("../models")
const Op = require("sequelize").Op
const sequelizeExecute = require("../utils/util").sequelizeExecute
const successResponse = require("../utils/response").successResponse
const errorResponse = require("../utils/response").errorResponse
const ErrorCode = require("./errorcode")

// 获取俱乐部配置
exports.getByClubId = async (request, result) => {
  try {
    const clubId = request.params.clubId
    if (!clubId) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '俱乐部ID不能为空')
    }

    // 权限检查：如果是俱乐部管理员，只能查看自己关联的俱乐部
    if (request.admin && request.admin.role === 'club_admin') {
      const hasAccess = await request.hasClubAccess(clubId)
      if (!hasAccess) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权访问该俱乐部配置')
      }
    }

    let config = await sequelizeExecute(
      db.collection('clubConfig').findOne({
        where: {
          clubid: clubId
        },
        raw: true
      })
    )

    // 如果不存在，返回默认配置
    if (!config) {
      config = {
        clubid: clubId,
        useScoreRanking: false,
        scoreWinPoints: null,
        scoreRewardThreshold: null,
        scoreRewardPoints: null,
        scoreRewardMaxPerGame: null
      }
    } else {
      // 规范化字段名（PostgreSQL 返回小写字段名）
      config = {
        _id: config._id,
        clubid: config.clubid,
        useScoreRanking: config.usescoreranking === true || config.usescoreranking === 1 || config.useScoreRanking === true || config.useScoreRanking === 1,
        scoreWinPoints: config.scorewinpoints !== null && config.scorewinpoints !== undefined ? parseInt(config.scorewinpoints) : (config.scoreWinPoints !== null && config.scoreWinPoints !== undefined ? parseInt(config.scoreWinPoints) : null),
        scoreRewardThreshold: config.scorerewardthreshold !== null && config.scorerewardthreshold !== undefined ? parseInt(config.scorerewardthreshold) : (config.scoreRewardThreshold !== null && config.scoreRewardThreshold !== undefined ? parseInt(config.scoreRewardThreshold) : null),
        scoreRewardPoints: config.scorerewardpoints !== null && config.scorerewardpoints !== undefined ? parseInt(config.scorerewardpoints) : (config.scoreRewardPoints !== null && config.scoreRewardPoints !== undefined ? parseInt(config.scoreRewardPoints) : null),
        scoreRewardMaxPerGame: config.scorerewardmaxpergame !== null && config.scorerewardmaxpergame !== undefined ? parseInt(config.scorerewardmaxpergame) : (config.scoreRewardMaxPerGame !== null && config.scoreRewardMaxPerGame !== undefined ? parseInt(config.scoreRewardMaxPerGame) : null),
        createDate: config.createdate || config.createDate,
        updateTime: config.updatetime || config.updateTime
      }
    }

    successResponse(result, {
      data: config
    })
  } catch (error) {
    console.error('getClubConfig error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取俱乐部配置失败')
  }
}

// 创建或更新俱乐部配置
exports.createOrUpdate = async (request, result) => {
  try {
    const clubId = request.params.clubId
    const { useScoreRanking, scoreWinPoints, scoreRewardThreshold, scoreRewardPoints, scoreRewardMaxPerGame } = request.body

    if (!clubId) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '俱乐部ID不能为空')
    }

    // 权限检查：如果是俱乐部管理员，只能修改自己关联的俱乐部
    if (request.admin && request.admin.role === 'club_admin') {
      const hasAccess = await request.hasClubAccess(clubId)
      if (!hasAccess) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权修改该俱乐部配置')
      }
    }

    // 检查俱乐部是否存在
    const club = await sequelizeExecute(
      db.collection('clubs').findByPk(clubId, {
        attributes: ['_id'],
        raw: true
      })
    )

    if (!club) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '俱乐部不存在')
    }

    // 查找是否已存在配置
    const existingConfig = await sequelizeExecute(
      db.collection('clubConfig').findOne({
        where: {
          clubid: clubId
        },
        raw: true
      })
    )

    let config
    if (existingConfig) {
      // 更新现有配置
      const updateData = {}
      if (useScoreRanking !== undefined) updateData.useScoreRanking = useScoreRanking === true || useScoreRanking === 'true' || useScoreRanking === 1
      if (scoreWinPoints !== undefined) updateData.scoreWinPoints = scoreWinPoints !== null && scoreWinPoints !== '' ? parseInt(scoreWinPoints) : null
      if (scoreRewardThreshold !== undefined) updateData.scoreRewardThreshold = scoreRewardThreshold !== null && scoreRewardThreshold !== '' ? parseInt(scoreRewardThreshold) : null
      if (scoreRewardPoints !== undefined) updateData.scoreRewardPoints = scoreRewardPoints !== null && scoreRewardPoints !== '' ? parseInt(scoreRewardPoints) : null
      if (scoreRewardMaxPerGame !== undefined) updateData.scoreRewardMaxPerGame = scoreRewardMaxPerGame !== null && scoreRewardMaxPerGame !== '' ? parseInt(scoreRewardMaxPerGame) : null

      await sequelizeExecute(
        db.collection('clubConfig').update(updateData, {
          where: {
            clubid: clubId
          }
        })
      )

      // 获取更新后的配置
      const updatedConfig = await sequelizeExecute(
        db.collection('clubConfig').findOne({
          where: {
            clubid: clubId
          },
          raw: true
        })
      )
      
      // 规范化字段名
      config = {
        _id: updatedConfig._id,
        clubid: updatedConfig.clubid,
        useScoreRanking: updatedConfig.usescoreranking === true || updatedConfig.usescoreranking === 1,
        scoreWinPoints: updatedConfig.scorewinpoints !== null && updatedConfig.scorewinpoints !== undefined ? parseInt(updatedConfig.scorewinpoints) : null,
        scoreRewardThreshold: updatedConfig.scorerewardthreshold !== null && updatedConfig.scorerewardthreshold !== undefined ? parseInt(updatedConfig.scorerewardthreshold) : null,
        scoreRewardPoints: updatedConfig.scorerewardpoints !== null && updatedConfig.scorerewardpoints !== undefined ? parseInt(updatedConfig.scorerewardpoints) : null,
        scoreRewardMaxPerGame: updatedConfig.scorerewardmaxpergame !== null && updatedConfig.scorerewardmaxpergame !== undefined ? parseInt(updatedConfig.scorerewardmaxpergame) : null,
        createDate: updatedConfig.createdate || updatedConfig.createDate,
        updateTime: updatedConfig.updatetime || updatedConfig.updateTime
      }
    } else {
      // 创建新配置
      const createdConfig = await sequelizeExecute(
        db.collection('clubConfig').create({
          clubid: clubId,
          useScoreRanking: useScoreRanking === true || useScoreRanking === 'true' || useScoreRanking === 1 || false,
          scoreWinPoints: scoreWinPoints !== null && scoreWinPoints !== '' ? parseInt(scoreWinPoints) : null,
          scoreRewardThreshold: scoreRewardThreshold !== null && scoreRewardThreshold !== '' ? parseInt(scoreRewardThreshold) : null,
          scoreRewardPoints: scoreRewardPoints !== null && scoreRewardPoints !== '' ? parseInt(scoreRewardPoints) : null,
          scoreRewardMaxPerGame: scoreRewardMaxPerGame !== null && scoreRewardMaxPerGame !== '' ? parseInt(scoreRewardMaxPerGame) : null
        }, {
          raw: true
        })
      )
      
      // 规范化字段名
      config = {
        _id: createdConfig._id,
        clubid: createdConfig.clubid,
        useScoreRanking: createdConfig.usescoreranking === true || createdConfig.usescoreranking === 1,
        scoreWinPoints: createdConfig.scorewinpoints !== null && createdConfig.scorewinpoints !== undefined ? parseInt(createdConfig.scorewinpoints) : null,
        scoreRewardThreshold: createdConfig.scorerewardthreshold !== null && createdConfig.scorerewardthreshold !== undefined ? parseInt(createdConfig.scorerewardthreshold) : null,
        scoreRewardPoints: createdConfig.scorerewardpoints !== null && createdConfig.scorerewardpoints !== undefined ? parseInt(createdConfig.scorerewardpoints) : null,
        scoreRewardMaxPerGame: createdConfig.scorerewardmaxpergame !== null && createdConfig.scorerewardmaxpergame !== undefined ? parseInt(createdConfig.scorerewardmaxpergame) : null,
        createDate: createdConfig.createdate || createdConfig.createDate,
        updateTime: createdConfig.updatetime || createdConfig.updateTime
      }
    }

    successResponse(result, {
      data: config
    })
  } catch (error) {
    console.error('createOrUpdateClubConfig error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '保存俱乐部配置失败: ' + error.message)
  }
}

// 获取俱乐部配置（内部使用，不返回 HTTP 响应）
exports.getConfigByClubId = async (clubId) => {
  try {
    if (!clubId) {
      return {
        useScoreRanking: false,
        scoreWinPoints: null,
        scoreRewardPoints: null
      }
    }

    const config = await sequelizeExecute(
      db.collection('clubConfig').findOne({
        where: {
          clubid: clubId
        },
        raw: true
      })
    )

    if (!config) {
      return {
        useScoreRanking: false,
        scoreWinPoints: null,
        scoreRewardThreshold: null,
        scoreRewardPoints: null,
        scoreRewardMaxPerGame: null
      }
    }

    return {
      useScoreRanking: config.usescoreranking === true || config.usescoreranking === 1,
      scoreWinPoints: config.scorewinpoints !== null && config.scorewinpoints !== undefined ? parseInt(config.scorewinpoints) : null,
      scoreRewardThreshold: config.scorerewardthreshold !== null && config.scorerewardthreshold !== undefined ? parseInt(config.scorerewardthreshold) : null,
      scoreRewardPoints: config.scorerewardpoints !== null && config.scorerewardpoints !== undefined ? parseInt(config.scorerewardpoints) : null,
      scoreRewardMaxPerGame: config.scorerewardmaxpergame !== null && config.scorerewardmaxpergame !== undefined ? parseInt(config.scorerewardmaxpergame) : null
    }
  } catch (error) {
    console.error('getConfigByClubId error:', error)
    return {
      useScoreRanking: false,
      scoreWinPoints: null,
      scoreRewardPoints: null
    }
  }
}
