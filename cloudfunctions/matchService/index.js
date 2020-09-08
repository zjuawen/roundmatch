// 云函数入口文件
const cloud = require('wx-server-sdk')

var debug = true;

const env = debug ? 'test-roundmatch' : "roundmatch";
cloud.init({
  env: env
  // env: cloud.DYNAMIC_CURRENT_ENV
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
  if( action == 'create'){
    data = await createMatchData(event.players);
  } else if (action == 'list') {
    let pageNum = (event.pageNum==null)? 1: event.pageNum;
    let pageSize = (event.pageSize==null)? 10: event.pageSize;
    data = await listMatch(wxContext.OPENID, event.clubid, pageNum, pageSize);
  } else if (action == 'save') {
    data = await saveMatchData(wxContext.OPENID, event.clubid, 
      event.matchdata, event.playerCount);
  } else if (action == 'read') {
    data = await readMatch(event.clubid, event.matchid);
  } else if (action == 'delete') {
    data = await deleteMatch(event.clubid, event.matchid);
  }  else if (action == 'update') {
    data = await updateMatch(event.match);
  }
  // else if (action == 'debug') {
  //   debug();
  // }

  return {
    data: data,
    action: action,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

//更新比赛信息
updateMatch = async (match) => {
  return await db.collection('matches')
    .doc(match.matchid)
    .update({
      data: {
        name: match.name,
      }
    })
    .then(res => {
      console.log("update match: ");
      console.log(res)
      let updated = res.stats.updated;
      return {
        updated: updated
      }
    })
}

//保存新增的比赛数据
saveMatchData = async (owner, clubid, games, playerCount, remark="") => {
  return await db.collection('matches')
    .add({
      // data 字段表示需新增的 JSON 数据
      data: {
        // id: _.inc(1),
        clubid: clubid,
        createDate: db.serverDate(),
        total: games.length,
        finish: 0,
        playerCount: playerCount,
        delete: false,
        owner: owner,
        remark: remark,
      }
    })
    .then(res => {
      console.log(res)
      let matchid = res._id;
      console.log("added new match: " + matchid);
      return savaGames(clubid, matchid, games);
    })
}

createClubGameDataTable = async (clubid) => {
  let gameDataTableName = 'games_' + clubid;

  const table = db.collection(gameDataTableName);
  var exist = true;
  try{
    await table
    .count()
    .then( async res=>{
      console.log(res);
    });
  } catch (e) {
    console.log(e);
    exist = false;
  }
  if( exist){
    console.log('game data table already created');
    return;
  }

  return await db.createCollection(gameDataTableName)
  .then(res => {
      console.log('create game data table...');
      console.log(res);
      return {
        dataTable: gameDataTableName,
        msg: res.errMsg,
      }
    }
  );
}


//保存对阵数据
savaGames = async (clubid, matchid, games) => {

  await createClubGameDataTable(clubid);

  let data = games;

  let playerWeight = [];

  let count = 0;
  for (let i = 0; i < data.length; i++) {
    await db.collection('games_' + clubid )
      .add({
        // data 字段表示需新增的 JSON 数据
        data: {
          // id: db.command.inc(1).toString(),
          clubid: clubid,
          matchid: matchid,
          order: data[i].order,
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
        count += 1;
        collectPlayerWeight(playerWeight, data[i]);
        return count;
      })
  }

  console.log(playerWeight);

  //增加参与人员权重
  playerWeight.forEach(async function (pWeight){
      await justifyPlayerOrder(pWeight);
  });

  return {
    gamecount: count,
    matchid: matchid
  };
}

//收集权重信息
collectPlayerWeight = (playerWeight, data) => {
  let players = [data.player1, data.player2, data.player3, data.player4];

  players.forEach(function (playerid){
    let found = false;

    for( let i = 0; i<playerWeight.length; i++) {
      let weightObj = playerWeight[i];
      if( weightObj.playerid == playerid){
        found = true;
        weightObj.weight++;
        break;
      }
    }

    if( !found){
      playerWeight.push({
        playerid: playerid,
        weight: 1
      })
    }
  })
}

//调整用户权重
justifyPlayerOrder = async (weightObj) => {
   return await db.collection('players')
    .doc(weightObj.playerid)
    // .get()
    .update({
      data:{
        order: _.inc(weightObj.weight)
      }
    })
    .then(res => {
      console.log(res);
      return res;
    })
}

//创建比赛数据（排阵，未保存）
createMatchData = async (playerArray) => {
  // let playerArray = event.data;

  playerArray = shuffleArray(playerArray);
  console.log('after shuffle: ' + playerArray);
  let count = playerArray.length;
  let orderArraies = await loadOrders(count);

  let allgames = [];
  for( let n = 0; n < orderArraies.length; n++){
    let games = [];
    let value = orderArraies[n].value;
    let orderArray = JSON.parse(value);
    for (let i = 0; i < orderArray.length; i++) {
      let game = {
        order: i+1,
        player1: playerArray[orderArray[i][0][0]],
        player2: playerArray[orderArray[i][0][1]],
        player3: playerArray[orderArray[i][1][0]],
        player4: playerArray[orderArray[i][1][1]],
        score1: -1,
        score2: -1,
      };
      games.push(game);
    }
    
    allgames.push({
      name : orderArraies[n].name,
      data : games,
    });
  }
  return allgames;
}

loadOrders = async (playerNum) => {
  let key = 'ORDERS_' + playerNum;
  return await db.collection('systemconfig')
    .where({
      key: key,
    })
    .orderBy('order', 'desc')
    .get()
    .then(res => {
      console.log(res);
      return res.data;
    })
}

//读取比赛对阵数据
readMatch = async (clubid, matchid) => {

  return await db.collection('games_' + clubid)
    .where({
      matchid: matchid,
    })
    .orderBy('order', 'asc')
    .get()
    .then(res => {
      console.log(res.data)
      return res.data;
    })
}

//删除比赛数据
deleteMatch = async (clubid, matchid) => {
  return await db.collection('matches')
    .doc(matchid)
    .update({
      data: {
        delete: true
      },
    })
    .then(async res => {
      console.log("delete match...");
      console.log(res);
      let matchUpdated = res.stats.updated;
      if( matchUpdated > 0){
        return await db.collection('games_' + clubid)
          .where({
            matchid: matchid,
          })
          .update({
            data: {
              delete: true
            },
          })
          .then(async res => {
            console.log("delete games...");
            console.log(res);
            let gameUpdated = res.stats.updated;
            return {
              matchUpdated: matchUpdated,
              gameUpdated: gameUpdated,
            };
          })
      }
    });
}

//获取比赛列表
listMatch = async (owner, clubid, pageNum, pageSize) => {

  return await db.collection('matches')
    .aggregate()
    .match({
      clubid: clubid,
      delete: _.neq(true),
    })
    .sort({
      createDate: -1
    })
    .project({
      _id: true,
      // id: true,
      clubid: true,
      name: true,
      total: true,
      finish: true,
      playerCount: true,
      owner: $.eq(['$owner', owner]),
      remark: true,
      createDate: $.dateToString({
        date: '$createDate',
        format: '%Y-%m-%d',
        timezone: 'Asia/Shanghai'
      })
    })
    .skip(pageSize*(pageNum-1))
    .limit(pageSize)
    .end()
    .then(res => {
      // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
      console.log(res.list)
      return res.list;
    })
}

shuffleArray = (array) => {
  for (let i = array.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [array[i - 1], array[j]] = [array[j], array[i - 1]];
  }
  return array;
}

//清除matches和games数据
// debug = () => {
//   let collectionName = 'games';
//   db.collection(collectionName)
//   .where({
//     score1: -1
//   })
//   .remove()
//   .then(res => {
//     console.log(res)
//   });
// }