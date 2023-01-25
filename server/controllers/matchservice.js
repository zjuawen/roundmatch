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
  // const wxContext = context;// cloud.getWXContext()
  let event = request.query

  console.log('matchService')
  console.log(event)
  // console.log(cloud.DYNAMIC_CURRENT_ENV)

  let action = event.action
  // console.log("action: " + action)
  let data
  if (action == 'create') {
    data = await createMatchData(event.type, event.players)
  } else if (action == 'list') {
    let pageNum = (event.pageNum == null) ? 1 : event.pageNum
    let pageSize = (event.pageSize == null) ? 10 : event.pageSize
    data = await listMatch(event.openid, event.clubid, pageNum, pageSize)
  } else if (action == 'save') {
    data = await saveMatchData(wxContext.OPENID, event.type, event.clubid,
      event.matchdata, event.playerCount)
  } else if (action == 'read') {
    data = await readMatch(event.clubid, event.matchid)
  } else if (action == 'delete') {
    data = await deleteMatch(event.clubid, event.matchid)
  } else if (action == 'update') {
    data = await updateMatch(event.match)
  }

  console.log('matchService return:')
  console.log(data)

  successResponse(result, {
    data
  })
}


//更新比赛信息
updateMatch = async (match) => {
  let updated = await sequelizeExecute(
    db.collection('matches').update({
      name: match.name
    }, {
      where: {
        _id: match.matchid
      }
    })
  )

  console.log("update match: ")
  console.log(updated)

  return {
    updated: updated
  }
}

//保存新增的比赛数据
saveMatchData = async (owner, type, clubid, games, playerCount, remark = "") => {
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
        type: type,
        delete: false,
        owner: owner,
        remark: remark,
      }
    })
    .then(res => {
      console.log(res)
      let matchid = res._id
      console.log("added new match: " + matchid)
      return savaGames(clubid, matchid, games)
    })
}

createClubGameDataTable = async (clubid) => {
  let gameDataTableName = 'games_' + clubid

  const table = db.collection(gameDataTableName)
  var exist = true
  try {
    await table
      .count()
      .then(async res => {
        console.log(res)
      })
  } catch (e) {
    console.log(e)
    exist = false
  }
  if (exist) {
    console.log('game data table already created')
    return
  }

  return await db.createCollection(gameDataTableName)
    .then(res => {
      console.log('create game data table...')
      console.log(res)
      return {
        dataTable: gameDataTableName,
        msg: res.errMsg,
      }
    })
}


//保存对阵数据
savaGames = async (clubid, matchid, games) => {

  await createClubGameDataTable(clubid)

  let data = games

  let playerWeight = []

  let count = 0
  for (let i = 0; i < data.length; i++) {
    let gamedata = {
      clubid: clubid,
      matchid: matchid,
      order: data[i].order,
      player1: (data[i].player1._id) ? data[i].player1._id : data[i].player1.toString(),
      player2: (data[i].player2._id) ? data[i].player2._id : data[i].player2.toString(),
      player3: (data[i].player3._id) ? data[i].player3._id : data[i].player3.toString(),
      player4: (data[i].player4._id) ? data[i].player4._id : data[i].player4.toString(),
      score1: -1,
      score2: -1,
      createDate: db.serverDate(),
    }

    await db.collection('games_' + clubid)
      .add({
        // data 字段表示需新增的 JSON 数据
        data: gamedata
      })
      .then(res => {
        console.log(res)
        count += 1
        collectPlayerWeight(playerWeight, data[i])
        return count
      })
  }

  console.log(playerWeight)

  //增加参与人员权重
  playerWeight.forEach(async function(pWeight) {
    await justifyPlayerOrder(pWeight)
  })

  return {
    gamecount: count,
    matchid: matchid
  }
}

//收集权重信息
collectPlayerWeight = (playerWeight, data) => {
  let players = [data.player1, data.player2, data.player3, data.player4]

  players.forEach(function(playerid) {
    let found = false

    for (let i = 0; i < playerWeight.length; i++) {
      let weightObj = playerWeight[i]
      if (weightObj.playerid == playerid) {
        found = true
        weightObj.weight++
        break
      }
    }

    if (!found) {
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
      data: {
        order: _.inc(weightObj.weight)
      }
    })
    .then(res => {
      console.log(res)
      return res
    })
}

//创建比赛数据（排阵，未保存）
createMatchData = async (type, playerArray) => {
  // let playerArray = event.data
  if (typeof playerArray === 'string') {
    playerArray = JSON.parse(playerArray)
  }

  var orderArraies = null
  var typeValue = 'none'
  if (type == 'fixpair') {
    typeValue = 'fix'
  } else if (type == 'group') {
    typeValue = 'group'
  } else {
    typeValue = 'none'
  }

  let count = playerArray.length

  if (type == 'fixpair' || type == 'group') {
    var playerArrayFlat = flatPlayerArray(playerArray)
    count = playerArrayFlat.length
  }

  // let count = playerArray.length
  var orderArraies = await loadOrders(count, typeValue)
  // {orderArraies, nosort} = orders

  //save clone array 
  var playerArraySave = JSON.parse(JSON.stringify(playerArray))

  let allgames = []
  for (let n = 0; n < orderArraies.length; n++) {
    let games = []
    let value = orderArraies[n].value
    let orderArray = JSON.parse(value)
    let nosort = []
    if (orderArraies[n].nosort != undefined) {
      nosort = JSON.parse(orderArraies[n].nosort)
    }
    var playerArrayOnce = null
    if (type == 'group') {
      sortgroups = JSON.parse(orderArraies[n].sortgroups)
      playerArrayOnce = shuffleArrayGroup(playerArraySave, sortgroups)
    } else {
      playerArrayOnce = shuffleArray(playerArraySave, nosort)
      if (type == 'fixpair') {
        playerArrayOnce = flatPlayerArray(playerArrayOnce)
      }
    }

    console.log('after shuffle: ' + playerArrayOnce)

    for (let i = 0; i < orderArray.length; i++) {
      let game = {
        order: i + 1,
        player1: playerArrayOnce[orderArray[i][0][0]],
        player2: playerArrayOnce[orderArray[i][0][1]],
        player3: playerArrayOnce[orderArray[i][1][0]],
        player4: playerArrayOnce[orderArray[i][1][1]],
        score1: -1,
        score2: -1,
      }
      games.push(game)
    }

    allgames.push({
      name: orderArraies[n].name,
      data: games,
    })
  }

  return allgames
}

flatPlayerArray = (array) => {
  var newArray = []
  array.forEach(pair => {
    newArray.push(pair.player1)
    newArray.push(pair.player2)
  })

  return newArray
}

loadOrders = async (playerNum, typeValue) => {
  var key = 'ORDERS_' + playerNum
  if (typeValue == 'fix') {
    key = 'PAIR_ORDERS_' + playerNum
  }
  if (typeValue == 'group') {
    key = 'GROUP_ORDERS_' + playerNum
  }
  let config = await sequelizeExecute(
    db.collection('system').findAll({
      where: {
        key: key,
      },
      order: [
        ['order', 'DESC']
      ],
      raw: true
    })
  )

  console.log(config)
  return config
}

//读取比赛对阵数据
readMatch = async (clubid, matchid) => {
  console.log('readMatch')
  let games = await sequelizeExecute(
    db.collection('games').findAll({
      attributes: ['_id', 'matchid', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
      where: {
        clubid: clubid,
        matchid: matchid,
        delete: {
          [Op.not]: true
        },
      },
      order: [
        ['order', 'DESC']
      ],
      raw: true,
    })
  )

  console.log(games)

  let players = []
  await games.forEach(game => {
    // console.log(game['player_1'])
    for (let i = 1; i < 5; i++) {
      let player = game['player' + i]
      // console.log(player)
      if (players.includes(player)) {
        continue
      }
      players.push(player)
    }
  })

  console.log(players)

  players = await sequelizeExecute(
    db.collection('players').findAll({
      attributes: ['_id', 'name', 'avatarUrl'],
      where: {
        _id: {
          [Op.in]: players
        },
      },
      raw: true
    })
  )

  console.log(players)

  await games.forEach(game => {
    for (let i = 1; i < 5; i++) {
      let player = game['player' + i]
      game['player' + i] = players.find((player) => {
        return player._id === game['player' + i];
      })
    }
  })

  console.log(games)

  return games
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
      console.log("delete match...")
      console.log(res)
      let matchUpdated = res.stats.updated
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
            console.log("delete games...")
            console.log(res)
            let gameUpdated = res.stats.updated
            return {
              matchUpdated: matchUpdated,
              gameUpdated: gameUpdated,
            }
          })
      }
    })
}

//获取比赛列表
listMatch = async (owner, clubid, pageNum, pageSize) => {

  let matches = await sequelizeExecute(
    db.collection('matches').findAll({
      where: {
        clubid: clubid,
        delete: {
          [Op.not]: true
        },
      },
      order: [
        ['createDate', 'DESC']
      ],
      attributes: {
        exclude: ['delete', 'updateTime'],
        // [sequelize.fn('EQUAL', sequelize.col('owner')), 'owner']
      },
      raw: true,
      offset: (pageNum - 1) * pageSize,
      limit: 1 * pageSize,
    })
  )

  console.log(matches)

  return matches
}

shuffleArrayGroup = (arraySaved, groups) => {
  let array = flatPlayerArray(arraySaved)
  for( let n = 0; n<groups.length; n++){
    let group = groups[n]
    for (let i = group.length; i; i--) {
      let j = Math.floor(Math.random() * group.length)
      // console.log("swap: " + array[group[i-1]].name + "-" + array[group[j]].name)
      let t = array[group[i-1]]
      array[group[i-1]] = array[group[j]]
      array[group[j]] = t
    }
  }
  return array
}

shuffleArray = (arraySaved, skiparray) => {
  let array = JSON.parse(JSON.stringify(arraySaved))
  let returnArray = []
  for( let n = 0; n<skiparray.length; n++){
    let index = skiparray[n]
    returnArray[index] = array[index]
    array[index] = null
  }
  for (let i = array.length; i; i--) {
    let j = Math.floor(Math.random() * i)
    console.log('j: ' + j)
    console.log(array)
    [array[i - 1], array[j]] = [array[j], array[i - 1]]
  }
  var i=0
  for( let n = 0; n<arraySaved.length && i<arraySaved.length; n++){
    if( returnArray[n] == null){
      while(array[i] == null && i<arraySaved.length){
        i++
      }
      returnArray[n] = array[i]
      i++
    }
  }

  return returnArray
}

//保持一对
shuffleArray2 = (array) => {
  if( array.length % 2 != 0){
    console.log("shuffleArray2: array length = " + array.length + " incorrect")
    return null
  }
  for (let i = 0; i<array.length/2; i++) {
    let j = Math.floor(Math.random() * i)
    [array[2*i], array[2*j]] = [array[2*j], array[2*i]]
    [array[2*i+1], array[2*j+1]] = [array[2*j+1], array[2*i+1]]
  }
  return array
}

//清除matches和games数据
// debug = () => {
//   let collectionName = 'games'
//   db.collection(collectionName)
//   .where({
//     score1: -1
//   })
//   .remove()
//   .then(res => {
//     console.log(res)
//   })
// }