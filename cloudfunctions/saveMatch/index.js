// 云函数入口文件
const cloud = require('wx-server-sdk')
const env = 'test-roundmatch';
cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: env
})
const db = cloud.database();

addMatch = async (clubid, matchdata, remark) => {
  
  return await db.collection('matches')
    .add({
      // data 字段表示需新增的 JSON 数据
      data: {
        // id: _.inc(1),
        clubid: clubid,
        createDate: db.serverDate(),
        remark: remark,
      }
    })
    .then(res => {
      console.log(res)
      let matchid = res._id;
      console.log("added new match: " + matchid);
      return savaGames(matchid, matchdata);
    })
}

savaGames = async (matchid, matchdata) => {
  let data = matchdata;

  for (let i = 0; i < data.length; i++) {
    db.collection('games')
      .add({
        // data 字段表示需新增的 JSON 数据
        data: {
          // id: db.command.inc(1).toString(),
          matchid: matchid,
          player1: data[i].player1.toString(),
          player2: data[i].player2.toString(),
          player3: data[i].player3.toString(),
          player4: data[i].player4.toString(),
          score1: -1,
          score2: -1,
          createDate: db.serverDate(),
        }
      })
      .then(res => {
        console.log(res)
      })
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let count = await addMatch(event.clubid, event.data, event.remark);

  return {
    // event,
    count,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}