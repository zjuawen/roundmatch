const db = require("../models")
const Op = require("sequelize").Op
const sequelize = require("sequelize")
// utils
const paginate = require("../utils/util").paginate
const md5String = require("../utils/util").md5String
const queryLike = require("../utils/util").queryLike
const validateSession = require("../utils/util").validateSession
const sequelizeExecute = require("../utils/util").sequelizeExecute
const successResponse = require("../utils/response").successResponse
const errorResponse = require("../utils/response").errorResponse
const ErrorCode = require("./errorcode")

// 云函数入口函数
exports.main = async (request, result) => {
  let event = request.query

  console.log('gameService')
  console.log(event)

  let action = event.action
  
  let data = null
  if (action == 'save') {
    // 从请求参数中获取操作者信息（小程序端传递的openid）
    const operator = event.openid || request.openid || request.user?.openid || 'unknown'
    data = await saveGameData(event.clubid, event.gamedata, operator, 'wechat')
  } else if (action == 'read') {
    // data = await readGameData(event.clubid, event.gameid)
  }

  console.log('gameService return:')
  console.log(data)

  successResponse(result, {
    data
  })
}

// 管理台更新比分接口
exports.updateScore = async (request, result) => {
  try {
    const gameid = request.params.id // 从URL参数中获取
    const { score1, score2, remark } = request.body
    
    if (!gameid || score1 === undefined || score2 === undefined) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '参数不完整')
    }

    // 获取当前管理员信息
    const operator = request.admin?.username || request.admin?._id || 'unknown'
    
    // 读取当前游戏数据
    const game = await sequelizeExecute(
      db.collection('games').findByPk(gameid, {
        raw: true
      })
    )

    if (!game) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '比赛数据不存在')
    }

    // 记录操作流水
    try {
      await sequelizeExecute(
        db.collection('scorelogs').create({
          matchid: game.matchid,
          gameid: gameid,
          clubid: game.clubid,
          oldScore1: game.score1,
          oldScore2: game.score2,
          newScore1: score1,
          newScore2: score2,
          operator: operator,
          operatorType: 'admin',
          remark: remark || null
        })
      )
    } catch (error) {
      console.error('记录操作流水失败:', error)
      // 不阻断主流程，只记录错误
    }

    // 检查是否需要更新完成场次
    // 判断是否完成的逻辑：score1 > 0 && score2 > 0
    const oldCompleted = (game.score1 > 0 && game.score2 > 0)
    const newCompleted = (score1 > 0 && score2 > 0)
    
    let needInc = false
    let needDec = false
    
    // 如果从未完成变为已完成，完成场次+1
    if (!oldCompleted && newCompleted) {
      needInc = true
    }
    // 如果从已完成变为未完成，完成场次-1
    else if (oldCompleted && !newCompleted) {
      needDec = true
    }

    // 更新比分
    const updateRes = await sequelizeExecute(
      db.collection('games').update({
        score1: score1,
        score2: score2,
      }, {
        where: {
          _id: gameid
        }
      })
    )

    // 更新完成场次
    if (needInc) {
      await sequelizeExecute(
        db.collection('matches').update({
          finish: sequelize.literal('finish + 1')
        }, {
          where: {
            _id: game.matchid
          }
        })
      )
    } else if (needDec) {
      await sequelizeExecute(
        db.collection('matches').update({
          finish: sequelize.literal('GREATEST(finish - 1, 0)')
        }, {
          where: {
            _id: game.matchid
          }
        })
      )
    }

    // 返回更新后的游戏数据
    const updatedGame = await sequelizeExecute(
      db.collection('games').findByPk(gameid, {
        raw: true
      })
    )

    successResponse(result, {
      data: updatedGame
    })
  } catch (error) {
    console.error('updateScore error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '更新比分失败: ' + error.message)
  }
}

// 规范化操作流水字段名（处理 PostgreSQL 小写字段名）
const normalizeScoreLogFields = (log) => {
  if (!log) return log
  const normalized = { ...log }
  // 转换字段名
  if (log.createdate !== undefined) {
    normalized.createDate = log.createdate
    delete normalized.createdate
  }
  if (log.matchid !== undefined) {
    normalized.matchid = log.matchid
  }
  if (log.gameid !== undefined) {
    normalized.gameid = log.gameid
  }
  if (log.clubid !== undefined) {
    normalized.clubid = log.clubid
  }
  if (log.oldscore1 !== undefined) {
    normalized.oldScore1 = log.oldscore1
    delete normalized.oldscore1
  }
  if (log.oldscore2 !== undefined) {
    normalized.oldScore2 = log.oldscore2
    delete normalized.oldscore2
  }
  if (log.newscore1 !== undefined) {
    normalized.newScore1 = log.newscore1
    delete normalized.newscore1
  }
  if (log.newscore2 !== undefined) {
    normalized.newScore2 = log.newscore2
    delete normalized.newscore2
  }
  if (log.operatortype !== undefined) {
    normalized.operatorType = log.operatortype
    delete normalized.operatortype
  }
  return normalized
}

// 获取操作流水列表
exports.getScoreLogs = async (request, result) => {
  try {
    const { gameid, matchid, pageNum = 1, pageSize = 20 } = request.query
    
    const where = {}
    if (gameid) {
      where.gameid = gameid
    }
    if (matchid) {
      where.matchid = matchid
    }

    const logs = await sequelizeExecute(
      db.collection('scorelogs').findAll({
        where: where,
        order: [['createDate', 'DESC']],
        limit: parseInt(pageSize),
        offset: (parseInt(pageNum) - 1) * parseInt(pageSize),
        raw: true
      })
    )

    const total = await sequelizeExecute(
      db.collection('scorelogs').count({
        where: where
      })
    )

    // 规范化字段名
    const normalizedLogs = logs.map(log => normalizeScoreLogFields(log))

    successResponse(result, {
      data: {
        list: normalizedLogs,
        total: total
      }
    })
  } catch (error) {
    console.error('getScoreLogs error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取操作流水失败: ' + error.message)
  }
}

//保存比赛数据
saveGameData = async (clubid, gamedata, operator = null, operatorType = 'wechat') => {
  if (typeof gamedata === 'string') {
    gamedata = JSON.parse(gamedata)
  }

  console.log(gamedata)
  let old = await readGameData(clubid, gamedata)
  // console.log("new: " + gamedata.score1 + " & " + gamedata.score2)

  if (old == null || old == null) {
    console.log('no gamedata found: ' + gamedata._id)
    return ({
      stats: {
        updated: 0
      },
      errMsg: 'no record found!'
    })
  }

  // 记录操作流水
  if (operator) {
    try {
      await sequelizeExecute(
        db.collection('scorelogs').create({
          matchid: gamedata.matchid,
          gameid: gamedata._id,
          clubid: clubid,
          oldScore1: old.score1,
          oldScore2: old.score2,
          newScore1: gamedata.score1,
          newScore2: gamedata.score2,
          operator: operator,
          operatorType: operatorType,
          remark: null
        })
      )
    } catch (error) {
      console.error('记录操作流水失败:', error)
      // 不阻断主流程，只记录错误
    }
  }

  // 判断是否完成的逻辑：score1 > 0 && score2 > 0
  const oldCompleted = (old.score1 > 0 && old.score2 > 0)
  const newCompleted = (gamedata.score1 > 0 && gamedata.score2 > 0)
  
  let needInc = false
  // 如果从未完成变为已完成，完成场次+1
  if (!oldCompleted && newCompleted) {
    needInc = true
  }

  let res = await sequelizeExecute(
    db.collection('games').update({
      // id: _.inc(1),
      score1: gamedata.score1,
      score2: gamedata.score2,
    }, {
      where: {
        _id: gamedata._id
      }
    })
  )

  console.log(res)

  if (needInc) {
    await updateMatchData(gamedata.matchid)
  }
  return res

}

// 读取单场数据
readGameData = async (clubid, gamedata) => {
  let game = await sequelizeExecute(
    db.collection('games').findByPk(gamedata._id, {
      raw: true
    })
  )

  // if( game.dataValues){
  //   game = game.dataValues
  // }

  console.log(game)

  return game
}

//更新比赛
updateMatchData = async (matchid) => {
  let updated = await sequelizeExecute(
    db.collection('matches').update({
      finish: sequelize.literal('`finish` +1')
    }, {
      where: {
        _id: matchid
      }
    })
  )

  console.log(updated)

  return updated

}