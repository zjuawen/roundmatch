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
  if( action == 'create'){
    data = createMatchData(event.players);
  } else if (action == 'list') {
    data = await getMatchList(event.clubid);
  }

  return {
    data: data,
    action: action,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
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
      _id: false,
      // id: true,
      clubid: true,
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

// private final static int[][][] ORDERS_4 = new int[][][]{
//   { { 0, 1 }, { 2, 3 } },
//   { { 0, 2 }, { 1, 3 } },
//   { { 0, 3 }, { 1, 2 } }
// };

//     private final static int[][][] ORDERS_5 = new int[][][]{
//   { { 0, 1 }, { 2, 3 } },
//   { { 1, 2 }, { 3, 4 } },
//   { { 2, 4 }, { 0, 3 } },
//   { { 1, 3 }, { 0, 4 } },
//   { { 1, 4 }, { 0, 2 } }
// };

//     private final static int[][][] ORDERS_6 = new int[][][]{
//   { { 1, 5 }, { 2, 4 } }, { { 0, 1 }, { 2, 3 } },
//   { { 0, 2 }, { 4, 5 } }, { { 0, 4 }, { 1, 3 } },
//   { { 1, 2 }, { 3, 5 } }, { { 0, 3 }, { 2, 5 } },
//   { { 0, 5 }, { 1, 4 } }, { { 3, 4 }, { 1, 2 } }
// };

//     private final static int[][][] ORDERS_7 = new int[][][]{
//   { { 2, 5 }, { 0, 6 } }, { { 0, 1 }, { 3, 4 } },
//   { { 2, 3 }, { 4, 6 } }, { { 0, 5 }, { 1, 3 } },
//   { { 1, 4 }, { 5, 6 } }, { { 0, 3 }, { 2, 6 } },
//   { { 0, 2 }, { 4, 5 } }, { { 3, 6 }, { 1, 5 } },
//   { { 1, 6 }, { 0, 4 } }, { { 3, 5 }, { 2, 4 } },
//   { { 1, 2 }, { 0, 5 } }, { { 3, 4 }, { 2, 5 } },
//   { { 1, 4 }, { 2, 6 } }, { { 1, 3 }, { 0, 6 } }
// };

let ORDERS_8 = [
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

let ORDERS = [
  [], [], [], [],
  [], [], [], [],
  ORDERS_8,
  []
];

