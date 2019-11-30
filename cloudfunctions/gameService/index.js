// 云函数入口文件
const cloud = require('wx-server-sdk')

const env = 'test-roundmatch';
cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: env
})
const db = cloud.database();
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
      console.log(res)
      return res;
    })
}