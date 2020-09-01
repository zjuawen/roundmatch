// 云函数入口文件
const cloud = require('wx-server-sdk')

var config = require('../config.js');

const env = config.debug ? 'test-roundmatch' : cloud.DYNAMIC_CURRENT_ENV;
cloud.init({
  env: env
})

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
 
  console.log("current env: " + env);
  
  let action = event.action;
  let data;
  if (action == 'save') {
    data = await saveGameData( event.clubid, event.gamedata);
  } else if (action == 'read') {
    // data = await readGameData(event.gameid);
  }

  return {
    data: data,
    action: action,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

//保存比赛数据
saveGameData = async (clubid, gamedata) => {

  let old = await readGameData(gamedata);
  // console.log("new: " + gamedata.score1 + " & " + gamedata.score2);

  if( old.data == null){
    console.log('no gamedata found: ' + gamedata._id)
    return ({ 
      stats: { 
        updated: 0 
      }, 
      errMsg: 'no record found!'
    });
  }

  let needInc = false;
  if( old.data.score1<0 && old.data.score2 <0 
    && gamedata.score1>=0 && gamedata.score2>=0){
    needInc = true;
  }
  return await db.collection('games_' + clubid)
    .doc(gamedata._id)
    .update({
      // data 字段表示需新增的 JSON 数据
      data: {
        // id: _.inc(1),
        score1: gamedata.score1,
        score2: gamedata.score2,
      }
    })
    .then( async res => {
      console.log(res);
      if( needInc){
        await updateMatchData(gamedata.matchid);
      }
      return res;
    })
}

readGameData = async (clubid, gamedata) => {

  return await db.collection('games_' + clubid)
    .doc(gamedata._id)
    .get()
    .then(res => {
      console.log(res)
      return res;
    })
}

//更新比赛
updateMatchData = async (matchid) => {
  return await db.collection('matches')
    .where({
      _id: matchid
    })
    .update({
      // data 字段表示需新增的 JSON 数据
      data: {
        // id: _.inc(1),
        finish: _.inc(1),
      }
    })
    .then(res => {
      console.log(res)
      return res;
    })
}


