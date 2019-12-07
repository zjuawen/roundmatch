// 云函数入口文件
const cloud = require('wx-server-sdk')

// const env = 'test-roundmatch';
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
  // env: env
})
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let action = event.action;
  let data;
  if (action == 'save') {
    data = await saveGameData( event.gamedata);
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
saveGameData = async (gamedata) => {

  let old = await readGameData(gamedata);
  let needInc = false;
  if( old.data.score1<0 && old.data.score2 <0 
    && gamedata.score1>=0 && gamedata.score2>=0){
    needInc = true;
  }
  return await db.collection('games')
    .doc(gamedata._id)
    .update({
      // data 字段表示需新增的 JSON 数据
      data: {
        // id: _.inc(1),
        score1: gamedata.score1,
        score2: gamedata.score2,
      }
    })
    .then(res => {
      console.log(res);
      if( needInc){
        updateMatchData(gamedata.matchid);
      }
      return res;
    })
}

readGameData = async (gamedata) => {

  return await db.collection('games')
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


