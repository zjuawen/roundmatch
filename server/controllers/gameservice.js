const db = require("../models")
const Op = require("sequelize").Op
const sequelize = require("sequelize")
// utils
const paginate = require("../utils/util").paginate
const md5String = require("../utils/util").md5String
const queryLike = require("../utils/util").queryLike
const validateSession = require("../utils/util").validateSession
const sequelizeExecute = require("../utils/util").sequelizeExecute
const successResponse = require("../utils/util").successResponse
const errorResponse = require("../utils/util").errorResponse

// 云函数入口函数
exports.main = async (request, result) => {
  // const wxContext = context// cloud.getWXContext()
  let event = request.query

  console.log('gameService')
  console.log(event)
  // console.log(cloud.DYNAMIC_CURRENT_ENV)

  let action = event.action
  // console.log("action: " + action)
  let data = null
  if (action == 'save') {
    data = await saveGameData(event.clubid, event.gamedata)
  } else if (action == 'read') {
    // data = await readGameData(event.clubid, event.gameid)
  }

  console.log('gameService return:')
  console.log(data)

  successResponse(result, {
    data
  })
}

//保存比赛数据
saveGameData = async (clubid, gamedata) => {
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

  let needInc = false
  if (old.score1 < 0 && old.score2 < 0 &&
    gamedata.score1 >= 0 && gamedata.score2 >= 0) {
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
    db.collection('games').findByPk(gamedata._id)
  )

  if( game.dataValues){
    game = game.dataValues
  }

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