// 云函数入口文件
const cloud = require('wx-server-sdk')

// const env = 'test-roundmatch';
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
  // env: env
})
const db = cloud.database();
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let action = event.action;
  let data;
  if( action == 'create'){
    data = createMatchData(event.players);
  } else if (action == 'list') {
    data = await getMatchList(event.clubid);
  } else if (action == 'save') {
    data = await saveMatchData(event.clubid, 
      event.matchdata, event.playerCount);
  } else if (action == 'read') {
    data = await readMatch(event.matchid);
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

//保存新增的比赛数据
saveMatchData = async (clubid, matchdata, playerCount, remark="") => {
  return await db.collection('matches')
    .add({
      // data 字段表示需新增的 JSON 数据
      data: {
        // id: _.inc(1),
        clubid: clubid,
        createDate: db.serverDate(),
        total: matchdata.length,
        finish: 0,
        playerCount: playerCount,
        remark: remark,
      }
    })
    .then(res => {
      console.log(res)
      let matchid = res._id;
      console.log("added new match: " + matchid);
      return savaGames(clubid, matchid, matchdata);
    })
}

//保存对阵数据
savaGames = async (clubid, matchid, matchdata) => {
  let data = matchdata;

  let count = 0;
  for (let i = 0; i < data.length; i++) {
    await db.collection('games')
      .add({
        // data 字段表示需新增的 JSON 数据
        data: {
          // id: db.command.inc(1).toString(),
          clubid: clubid,
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
        count += 1;
        return count;
      })
  }
  return {
    gamecount: count,
    matchid: matchid
  };
}

//创建比赛数据（排阵，未保存）
createMatchData = (playerArray) => {
  // let playerArray = event.data;

  playerArray = shuffleArray(playerArray);
  console.log('after shuffle: ' + playerArray);
  let orderArray = ORDERS[playerArray.length];

  let games = [];
  for (let i = 0; i < orderArray.length; i++) {
    let game = {
      player1: playerArray[orderArray[i][0][0]],
      player2: playerArray[orderArray[i][0][1]],
      player3: playerArray[orderArray[i][1][0]],
      player4: playerArray[orderArray[i][1][1]],
      score1: -1,
      score2: -1,
    };
    games.push(game);
  }
  return games;
}

//读取比赛对阵数据
readMatch = async (matchid) => {

  return await db.collection('games')
    .aggregate()
    .match({
      matchid: matchid,
    })
    // .project({
    //   _id: false,
    //   matchid: true,
    //   player1: true,
    //   player2: true,
    //   player3: true,
    //   player4: true,
    //   score1: true,
    //   score2: true,
    //   createDate: true,
    // })
    .end()
    .then(res => {
      console.log(res.list)
      return res.list;
    })
}

//获取比赛列表
getMatchList = async (clubid) => {

  return await db.collection('matches')
    .aggregate()
    .match({
      clubid: clubid,
    })
    .sort({
      createDate: -1
    })
    .project({
      _id: true,
      // id: true,
      clubid: true,
      total: true,
      finish: true,
      playerCount: true,
      createDate: $.dateToString({
        date: '$createDate',
        format: '%Y-%m-%d'
      })
    })
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

const ORDERS_4 = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]]
];

const ORDERS_5 = [
  [[0, 1], [2, 3]],
  [[1, 2], [3, 4]],
  [[2, 4], [0, 3]],
  [[1, 3], [0, 4]],
  [[1, 4], [0, 2]]
];

const ORDERS_6 = [
  [[1, 5], [2, 4]], [[0, 1], [2, 3]],
  [[0, 2], [4, 5]], [[0, 4], [1, 3]],
  [[1, 2], [3, 5]], [[0, 3], [2, 5]],
  [[0, 5], [1, 4]], [[3, 4], [1, 2]]
];

const ORDERS_7 = [
  [[2, 5], [0, 6]], [[0, 1], [3, 4]],
  [[2, 3], [4, 6]], [[0, 5], [1, 3]],
  [[1, 4], [5, 6]], [[0, 3], [2, 6]],
  [[0, 2], [4, 5]], [[3, 6], [1, 5]],
  [[1, 6], [0, 4]], [[3, 5], [2, 4]],
  [[1, 2], [0, 5]], [[3, 4], [2, 5]],
  [[1, 4], [2, 6]], [[1, 3], [0, 6]]
];

const ORDERS_8 = [
  [[0, 1], [2, 3]], [[4, 5], [6, 7]],
  [[0, 2], [4, 6]], [[1, 3], [5, 7]],
  [[2, 4], [3, 5]], [[1, 7], [0, 6]],
  [[0, 4], [3, 7]], [[2, 6], [1, 5]],
  [[0, 7], [2, 5]], [[3, 4], [1, 6]],
  [[1, 2], [4, 7]], [[5, 6], [0, 3]],
  [[0, 5], [1, 4]], [[3, 6], [2, 7]]
];

//     private final static int[][][] ORDERS_9 = new int[][][]{
//   //            { {0,1},{2,3} },
//   //            { {0,2},{1,3} },
//   //            { {0,3},{1,2} }
// };

const ORDERS = [
  [], [], [], [],
  ORDERS_4, 
  ORDERS_5,
  ORDERS_6,
  ORDERS_7,
  ORDERS_8,
  []
];

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