const db = require("../models")
const Op = require("sequelize").Op
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
  let data
  if (action == 'save') {
    data = await saveGameData(event.clubid, event.gamedata)
  } else if (action == 'read') {
    // data = await readGameData(event.clubid, event.gameid)
  }

  successResponse(result, {
    data
  })
}

// //保存比赛数据
// saveGameData = async (clubid, gamedata) => {

//   let old = await readGameData(clubid, gamedata)
//   // console.log("new: " + gamedata.score1 + " & " + gamedata.score2)

//   if( old.data == null){
//     console.log('no gamedata found: ' + gamedata._id)
//     return ({ 
//       stats: { 
//         updated: 0 
//       }, 
//       errMsg: 'no record found!'
//     })
//   }

//   let needInc = false
//   if( old.data.score1<0 && old.data.score2 <0 
//     && gamedata.score1>=0 && gamedata.score2>=0){
//     needInc = true
//   }
//   return await db.collection('games_' + clubid)
//     .doc(gamedata._id)
//     .update({
//       // data 字段表示需新增的 JSON 数据
//       data: {
//         // id: _.inc(1),
//         score1: gamedata.score1,
//         score2: gamedata.score2,
//       }
//     })
//     .then( async res => {
//       console.log(res)
//       if( needInc){
//         await updateMatchData(gamedata.matchid)
//       }
//       return res
//     })
// }

// readGameData = async (clubid, gamedata) => {

//   return await db.collection('games_' + clubid)
//     .doc(gamedata._id)
//     .get()
//     .then(res => {
//       console.log(res)
//       return res
//     })
// }

// //更新比赛
// updateMatchData = async (matchid) => {
//   return await db.collection('matches')
//     .where({
//       _id: matchid
//     })
//     .update({
//       // data 字段表示需新增的 JSON 数据
//       data: {
//         // id: _.inc(1),
//         finish: _.inc(1),
//       }
//     })
//     .then(res => {
//       console.log(res)
//       return res
//     })
// }