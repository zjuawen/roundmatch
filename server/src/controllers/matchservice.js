const db = require("../models")
const Op = require("sequelize").Op
// utils
const paginate = require("../utils/util").paginate
const md5String = require("../utils/util").md5String
const queryLike = require("../utils/util").queryLike
const validateSession = require("../utils/util").validateSession
const sequelizeExecute = require("../utils/util").sequelizeExecute
const successResponse = require("../utils/response").successResponse
const errorResponse = require("../utils/response").errorResponse
const userAvatarFix = require("../utils/util").userAvatarFix
const { batchGetAvatarValidity } = require("../utils/avatarCheck")
const ErrorCode = require("./errorcode")
const wechat = require("./wechat")

// 云函数入口函数
exports.main = async (request, result) => {
  let event = request.query

  console.log('matchService')
  console.log(event)

  let action = event.action

  let data = null
  if (action == 'create') {
    data = await createMatchData(event.type, event.players)
  } else if (action == 'list') {
    let pageNum = (event.pageNum == null) ? 1 : event.pageNum
    let pageSize = (event.pageSize == null) ? 10 : event.pageSize
    data = await listMatch(event.openid, event.clubid, pageNum, pageSize)
  } else if (action == 'save') {
    data = await saveMatchData(event.openid, event.type, event.clubid,
      event.matchdata, event.playerCount)
  } else if (action == 'read') {
    data = await readMatch(event.clubid, event.matchid)
  } else if (action == 'delete') {
    data = await deleteMatch(event.clubid, event.matchid)
  } else if (action == 'update') {
    data = await updateMatch(event.matchid, event.value)
  } else if (action == 'ranking') {
    // 小程序获取排名统计
    data = await getRankingForMiniProgram(event.matchid)
  }

  console.log('matchService return:')
  console.log(data)

  successResponse(result, {
    data
  })
}


//更新比赛信息
updateMatch = async (matchid, value) => {
  if (typeof value === 'string') {
    value = JSON.parse(value)
  }

  let updated = await sequelizeExecute(
    db.collection('matches').update({
      name: value.name
    }, {
      where: {
        _id: matchid
      }
    })
  )

  console.log("update match record: " + updated)

  return {
    updated: updated
  }
}

//保存新增的比赛数据
saveMatchData = async (owner, type, clubid, games, playerCount, remark = "") => {
  if (typeof games === 'string') {
    games = JSON.parse(games)
  }

  let saved = await sequelizeExecute(
    db.collection('matches').create({
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
    })
  )

  console.log("added new match")
  console.log(saved)

  let matchid = saved._id
  console.log("added new match: " + matchid)
  return await savaGames(clubid, matchid, games)
}

//保存对阵数据
savaGames = async (clubid, matchid, games) => {

  let data = games
  console.log("saving games' data")
  console.log(data)


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

    let res = await sequelizeExecute(
      db.collection('games')
      .create(gamedata)
    )

    if (res) {
      count += 1
      collectPlayerWeight(playerWeight, data[i])
    }
  }

  console.log("playerWeight:")
  console.log(playerWeight)

  //增加参与人员权重
  await playerWeight.forEach(async function(pWeight) {
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
  console.log("justifyPlayerOrder")
  console.log(weightObj)
  let res = await sequelizeExecute(
    db.collection('players')
    .update({
      order: weightObj.weight + 1
    }, {
      where: {
        _id: weightObj.playerid._id
      }
    })
  )

  console.log(res)
  return res
}

//创建比赛数据（排阵，未保存）
createMatchData = async (type, playerArray) => {
  // let playerArray = event.data
  if (typeof playerArray === 'string') {
    playerArray = JSON.parse(playerArray)
  }

  var orderArraies = null
  var typeValue = 'none'
  if (type == 'fixpair' || type == 'fix') {
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
      if (type == 'fixpair' || type == 'fix') {
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
    if (pair.player1) {
      newArray.push(pair.player1)
    }
    if (pair.player2) {
      newArray.push(pair.player2)
    }
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
  console.log('查询参数 - clubid:', clubid, 'matchid:', matchid)
  
  // 如果没有 clubid 或者 matchid 可能被截断，先通过 matchid 查询 match 表
  let targetClubid = clubid
  let fullMatchid = matchid
  
  if (matchid) {
    try {
      // 先尝试精确匹配
      let match = await sequelizeExecute(
        db.collection('matches').findByPk(matchid, {
          attributes: ['_id', 'clubid'],
          raw: true
        })
      )
      
      // 如果精确匹配失败，且 matchid 长度小于 36（UUID 标准长度），尝试模糊匹配
      if (!match && matchid.length < 36) {
        console.log('matchid 可能被截断，尝试模糊匹配:', matchid)
        const matches = await sequelizeExecute(
          db.collection('matches').findAll({
            where: {
              _id: {
                [Op.like]: `${matchid}%`
              }
            },
            attributes: ['_id', 'clubid'],
            raw: true,
            limit: 1
          })
        )
        if (matches && matches.length > 0) {
          match = matches[0]
          fullMatchid = match._id
          console.log('通过模糊匹配找到完整 matchid:', fullMatchid)
        }
      }
      
      if (match) {
        console.log('查询到的 match 信息:', { _id: match._id, clubid: match.clubid })
        if (!targetClubid && match.clubid) {
          targetClubid = match.clubid
          console.log('通过 matchid 查询到 clubid:', targetClubid)
        } else if (targetClubid && match.clubid && targetClubid !== match.clubid) {
          console.warn('clubid 不匹配！查询参数中的 clubid:', targetClubid, 'match 表中的 clubid:', match.clubid)
          // 使用 match 表中的 clubid（更准确）
          targetClubid = match.clubid
          console.log('使用 match 表中的 clubid:', targetClubid)
        }
        if (match._id && match._id !== matchid) {
          fullMatchid = match._id
          console.log('使用完整的 matchid:', fullMatchid)
        }
      }
    } catch (error) {
      console.error('查询 match 信息失败:', error)
    }
  }
  
  if (!targetClubid) {
    console.error('无法获取 clubid')
    return []
  }
  
  // 使用完整的 matchid（如果找到了）
  const finalMatchid = fullMatchid || matchid
  console.log('最终使用的 matchid:', finalMatchid)
  
  // 先查询不包含 delete 条件的数据，判断 delete 字段类型
  // 先尝试只使用 matchid 查询（不限制 clubid），因为 matchid 是唯一的
  let gamesWithoutDelete = await sequelizeExecute(
    db.collection('games').findAll({
      attributes: ['_id', 'matchid', 'clubid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4', 'delete'],
      where: {
        matchid: finalMatchid,
      },
      raw: true,
    })
  )
  
  console.log('查询到的对阵数据数量（不含delete条件，仅使用matchid）:', gamesWithoutDelete ? gamesWithoutDelete.length : 0)
  
  // 如果使用 matchid 查询没有结果，尝试同时使用 clubid 和 matchid
  if (!gamesWithoutDelete || gamesWithoutDelete.length === 0) {
    console.log('尝试使用 clubid 和 matchid 联合查询')
    gamesWithoutDelete = await sequelizeExecute(
      db.collection('games').findAll({
        attributes: ['_id', 'matchid', 'clubid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4', 'delete'],
        where: {
          clubid: targetClubid,
          matchid: finalMatchid,
        },
        raw: true,
      })
    )
    console.log('查询到的对阵数据数量（使用clubid和matchid）:', gamesWithoutDelete ? gamesWithoutDelete.length : 0)
  }
  
  // 如果还是没有结果，检查是否有其他 matchid 格式的数据
  if (!gamesWithoutDelete || gamesWithoutDelete.length === 0) {
    console.log('检查是否有其他格式的 matchid 数据')
    
    // 先检查 matches 表中的 clubid
    const matchInfo = await sequelizeExecute(
      db.collection('matches').findByPk(finalMatchid, {
        attributes: ['_id', 'clubid'],
        raw: true
      })
    )
    console.log('matches 表中的信息:', matchInfo)
    
    // 检查 games 表中是否有这个 matchid 的数据（不限制 clubid）
    const gamesByMatchid = await sequelizeExecute(
      db.collection('games').findAll({
        attributes: ['_id', 'matchid', 'clubid'],
        where: {
          matchid: finalMatchid,
        },
        raw: true,
        limit: 5
      })
    )
    console.log('games 表中该 matchid 的数据（前5条）:', gamesByMatchid)
    
    // 检查该 clubid 下的 games
    const gamesByClubid = await sequelizeExecute(
      db.collection('games').findAll({
        attributes: ['_id', 'matchid', 'clubid'],
        where: {
          clubid: targetClubid,
        },
        raw: true,
        limit: 10
      })
    )
    console.log('该 clubid 下的 games 示例（前10条）:', gamesByClubid)
  }
  
  // 根据实际字段类型选择查询条件，处理 NULL 值
  let games
  if (gamesWithoutDelete && gamesWithoutDelete.length > 0) {
    const firstDeleteValue = gamesWithoutDelete[0].delete
    console.log('第一条数据的delete字段值:', firstDeleteValue, '类型:', typeof firstDeleteValue, '是否为NULL:', firstDeleteValue === null)
    
    // 检查所有非 null 的值来判断字段类型
    const nonNullValues = gamesWithoutDelete.filter(g => g.delete !== null).map(g => g.delete)
    let isBooleanType = false
    
    if (nonNullValues.length > 0) {
      // 如果有非 null 值，检查是否为 boolean
      isBooleanType = typeof nonNullValues[0] === 'boolean'
    }
    
    if (isBooleanType) {
      // BOOLEAN 类型，查询条件：delete = false 或 delete IS NULL
      // 优先使用 matchid 查询（不限制 clubid）
      games = await sequelizeExecute(
        db.collection('games').findAll({
          attributes: ['_id', 'matchid', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
          where: {
            matchid: finalMatchid,
            [Op.or]: [
              { delete: false },
              { delete: null }
            ]
          },
          order: [
            ['order', 'ASC']
          ],
          raw: true,
        })
      )
      console.log('使用BOOLEAN条件（包含NULL）查询的结果数量:', games ? games.length : 0)
    } else {
      // INTEGER 类型（包括所有值为 null 的情况），查询条件：delete != 1 或 delete IS NULL
      // 优先使用 matchid 查询（不限制 clubid）
      games = await sequelizeExecute(
        db.collection('games').findAll({
          attributes: ['_id', 'matchid', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
          where: {
            matchid: finalMatchid,
            [Op.or]: [
              { delete: { [Op.ne]: 1 } },
              { delete: null }
            ]
          },
          order: [
            ['order', 'ASC']
          ],
          raw: true,
        })
      )
      console.log('使用INTEGER条件（包含NULL）查询的结果数量:', games ? games.length : 0)
    }
  } else {
    // 如果没有数据，使用 INTEGER 类型的查询条件（因为数据库字段是 INTEGER）
    // 优先使用 matchid 查询（不限制 clubid）
    games = await sequelizeExecute(
      db.collection('games').findAll({
        attributes: ['_id', 'matchid', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
        where: {
          matchid: finalMatchid,
          [Op.or]: [
            { delete: { [Op.ne]: 1 } },
            { delete: null }
          ]
        },
        order: [
          ['order', 'ASC']
        ],
        raw: true,
      })
    )
    console.log('使用INTEGER条件（包含NULL）查询的结果数量:', games ? games.length : 0)
  }

  console.log('最终查询结果:', games)

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

  players = userAvatarFix(players)
  
  // 批量检查头像有效性并添加 avatarValid 字段
  players = await batchGetAvatarValidity(players)
  
  console.log(players)

  await games.forEach(game => {
    for (let i = 1; i < 5; i++) {
      let player = game['player' + i]
      const foundPlayer = players.find((p) => {
        return p._id === game['player' + i];
      })
      if (foundPlayer) {
        game['player' + i] = {
          ...foundPlayer,
          avatarValid: foundPlayer.avatarValid !== undefined ? foundPlayer.avatarValid : true
        }
      }
    }
  })

  console.log(games)

  // 查询 match 信息（包括 type）
  let matchInfo = null
  if (finalMatchid) {
    try {
      matchInfo = await sequelizeExecute(
        db.collection('matches').findByPk(finalMatchid, {
          attributes: ['_id', 'clubid', 'type', 'name'],
          raw: true
        })
      )
    } catch (error) {
      console.error('查询 match 信息失败:', error)
    }
  }

  // 返回 games 数组和 match 信息
  return {
    games: games,
    match: matchInfo
  }
}

//删除比赛数据
deleteMatch = async (clubid, matchid) => {
  console.log("deleting match: " + matchid)

  let matchUpdated = await sequelizeExecute(
    db.collection('matches')
    .update({
      delete: true
    }, {
      where: {
        _id: matchid
      }
    })
  )

  console.log(matchUpdated)

  let gameUpdated = 0

  if (matchUpdated > 0) {
    console.log("deleting games...")

    gameUpdated = await sequelizeExecute(
      db.collection('games').update({
        delete: true
      }, {
        where: {
          matchid: matchid,
          clubid: clubid
        }
      })
    )

    console.log(gameUpdated)
  }

  return {
    matchUpdated: matchUpdated,
    gameUpdated: gameUpdated,
  }

}

//获取比赛列表
listMatch = async (owner, clubid, pageNum, pageSize) => {

  let matches = await sequelizeExecute(
    db.collection('matches').findAll({
      where: {
        clubid: clubid,
        delete: {
          [Op.ne]: 1  // PostgreSQL 中 delete 字段是 INTEGER 类型，0=未删除，1=已删除
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
  for (let n = 0; n < groups.length; n++) {
    let group = groups[n]
    for (let i = group.length; i; i--) {
      let j = Math.floor(Math.random() * group.length)
      // console.log("swap: " + array[group[i-1]].name + "-" + array[group[j]].name)
      let t = array[group[i - 1]]
      array[group[i - 1]] = array[group[j]]
      array[group[j]] = t
    }
  }
  return array
}

shuffleArray = (arraySaved, skiparray) => {
  let array = JSON.parse(JSON.stringify(arraySaved))
  console.log('debug')
  console.log(array)
  let returnArray = []
  for (let n = 0; n < skiparray.length; n++) {
    let index = skiparray[n]
    returnArray[index] = array[index]
    array[index] = null
  }
  for (let i = array.length; i; i--) {
    let j = Math.floor(Math.random() * i)
    console.log('j: ' + j)
    console.log(array)
    var temp = array[i - 1]
    array[i - 1] = array[j]
    array[j] = temp
    // [array[i - 1], array[j]] = [array[j], array[i - 1]]
  }
  var i = 0
  for (let n = 0; n < arraySaved.length && i < arraySaved.length; n++) {
    if (returnArray[n] == null) {
      while (array[i] == null && i < arraySaved.length) {
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
  if (array.length % 2 != 0) {
    console.log("shuffleArray2: array length = " + array.length + " incorrect")
    return null
  }
  for (let i = 0; i < array.length / 2; i++) {
    let j = Math.floor(Math.random() * i)[array[2 * i], array[2 * j]] = [array[2 * j], array[2 * i]]
      [array[2 * i + 1], array[2 * j + 1]] = [array[2 * j + 1], array[2 * i + 1]]
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

// ========== 管理台专用 API ==========

// 规范化赛事字段名（处理 PostgreSQL 小写字段名）
const normalizeMatchFields = (match) => {
  if (!match) return match
  const normalized = { ...match }
  // 转换字段名
  if (match.createdate !== undefined) {
    normalized.createDate = match.createdate
    delete normalized.createdate
  }
  if (match.updatetime !== undefined) {
    normalized.updateTime = match.updatetime
    delete normalized.updatetime
  }
  if (match.playercount !== undefined) {
    normalized.playerCount = match.playercount
    delete normalized.playercount
  }
  if (match.clubid !== undefined) {
    normalized.clubid = match.clubid
  }
  if (match.qrcodeurl !== undefined) {
    normalized.qrcodeUrl = match.qrcodeurl
    delete normalized.qrcodeurl
  }
  return normalized
}

// 获取所有赛事列表（管理台）
exports.listAll = async (request, result) => {
  try {
    let pageNum = parseInt(request.query.pageNum) || 1
    let pageSize = parseInt(request.query.pageSize) || 10
    let clubid = request.query.clubid || ''
    let keyword = request.query.keyword || ''

    let whereCondition = {
      delete: {
        [Op.ne]: 1
      }
    }

    // 权限过滤：如果是俱乐部管理员，只能看到自己关联俱乐部的赛事
    if (request.admin && request.admin.role === 'club_admin' && request.admin.clubIds && request.admin.clubIds.length > 0) {
      whereCondition.clubid = {
        [Op.in]: request.admin.clubIds
      }
    } else if (clubid) {
      // 超级管理员可以筛选特定俱乐部
      whereCondition.clubid = clubid
    }

    // 搜索条件（按备注搜索）
    if (keyword) {
      whereCondition.remark = {
        [Op.like]: `%${keyword}%`
      }
    }

    // 先尝试查询，如果失败（可能是qrcodeUrl字段不存在），则明确指定attributes
    let queryResult
    try {
      queryResult = await sequelizeExecute(
        db.collection('matches').findAndCountAll({
          where: whereCondition,
          order: [['createdate', 'DESC']],
          limit: pageSize,
          offset: (pageNum - 1) * pageSize,
          raw: true
        })
      )
    } catch (error) {
      // 如果查询失败（可能是qrcodeUrl字段不存在），明确指定attributes排除qrcodeUrl
      if (error.message && error.message.includes('qrcodeurl')) {
        queryResult = await sequelizeExecute(
          db.collection('matches').findAndCountAll({
            where: whereCondition,
            attributes: ['_id', 'name', 'playerCount', 'clubid', 'owner', 'finish', 'total', 'type', 'delete', 'remark', 'createdate', 'updatetime'],
            order: [['createdate', 'DESC']],
            limit: pageSize,
            offset: (pageNum - 1) * pageSize,
            raw: true
          })
        )
      } else {
        throw error
      }
    }
    
    const { count, rows: rawRows } = queryResult || { count: 0, rows: [] }

    // 收集所有俱乐部ID
    const clubIds = [...new Set(rawRows.map(match => match.clubid).filter(Boolean))]
    
    // 批量查询俱乐部信息
    let clubsMap = {}
    if (clubIds.length > 0) {
      const clubs = await sequelizeExecute(
        db.collection('clubs').findAll({
          where: {
            _id: {
              [Op.in]: clubIds
            }
          },
          attributes: ['_id', 'shortname', 'wholename'],
          raw: true
        })
      )

      clubs.forEach(club => {
        clubsMap[club._id] = {
          _id: club._id,
          shortName: club.shortname || '',
          wholeName: club.wholename || ''
        }
      })
    }

    // 规范化字段名并添加俱乐部信息
    const rows = rawRows.map(match => {
      const normalized = normalizeMatchFields(match)
      
      // 添加俱乐部信息
      if (normalized.clubid && clubsMap[normalized.clubid]) {
        normalized.club = clubsMap[normalized.clubid]
      }
      
      return normalized
    })

    successResponse(result, {
      data: {
        list: rows,
        total: count,
        pageNum: pageNum,
        pageSize: pageSize
      }
    })
  } catch (error) {
    console.error('listAll matches error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取赛事列表失败')
  }
}

// 根据ID获取赛事详情（管理台）
exports.getById = async (request, result) => {
  try {
    const matchId = request.params.id
    if (!matchId) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '赛事ID不能为空')
    }

    let match = await sequelizeExecute(
      db.collection('matches').findByPk(matchId, {
        raw: true
      })
    )

    if (!match) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '赛事不存在')
    }

    // 规范化字段名
    match = normalizeMatchFields(match)

    // 权限检查：如果是俱乐部管理员，只能查看自己关联俱乐部的赛事
    if (request.admin && request.admin.role === 'club_admin') {
      const hasAccess = await request.hasClubAccess(match.clubid)
      if (!hasAccess) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权访问该赛事')
      }
    }

    // 查询俱乐部信息
    if (match.clubid) {
      const club = await sequelizeExecute(
        db.collection('clubs').findByPk(match.clubid, {
          attributes: ['_id', 'shortname', 'wholename'],
          raw: true
        })
      )

      if (club) {
        match.club = {
          _id: club._id,
          shortName: club.shortname || '',
          wholeName: club.wholename || ''
        }
      }
    }

    // 重新计算完成场次：统计 score1 > 0 && score2 > 0 的比赛数量
    try {
      const allGames = await sequelizeExecute(
        db.collection('games').findAll({
          attributes: ['score1', 'score2'],
          where: {
            matchid: matchId
          },
          raw: true
        })
      )
      
      const finishedCount = allGames.filter(game => 
        game.score1 > 0 && game.score2 > 0
      ).length
      
      // 更新 match 对象的 finish 字段
      match.finish = finishedCount
    } catch (error) {
      console.error('重新计算完成场次失败:', error)
      // 如果计算失败，使用数据库中的值
    }

    successResponse(result, {
      data: match
    })
  } catch (error) {
    console.error('getMatchById error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取赛事详情失败')
  }
}

// 获取赛事对阵数据（管理台）
exports.getGames = async (request, result) => {
  try {
    const matchId = request.params.id
    if (!matchId) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '赛事ID不能为空')
    }

    // 先获取赛事信息用于权限检查
    let match = await sequelizeExecute(
      db.collection('matches').findByPk(matchId, {
        attributes: ['_id', 'clubid'],
        raw: true
      })
    )

    if (!match) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '赛事不存在')
    }

    // 权限检查：如果是俱乐部管理员，只能查看自己关联俱乐部的赛事
    if (request.admin && request.admin.role === 'club_admin') {
      const hasAccess = await request.hasClubAccess(match.clubid)
      if (!hasAccess) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权访问该赛事')
      }
    }

    // 查询对阵数据，只使用 matchid，不限制 clubid
    console.log('查询对阵数据 - matchId:', matchId)
    
    // 先查询不包含 delete 条件的数据，判断 delete 字段类型
    let gamesWithoutDelete = await sequelizeExecute(
      db.collection('games').findAll({
        attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4', 'delete'],
        where: {
          matchid: matchId,
        },
        raw: true,
      })
    )
    
    console.log('查询到的对阵数据数量（不含delete条件）:', gamesWithoutDelete ? gamesWithoutDelete.length : 0)
    
    // 根据实际字段类型选择查询条件，处理 NULL 值
    // 注意：数据库中的 delete 字段是 INTEGER 类型，即使值为 null，也应该使用 INTEGER 查询条件
    let games
    if (gamesWithoutDelete && gamesWithoutDelete.length > 0) {
      const firstDeleteValue = gamesWithoutDelete[0].delete
      console.log('第一条数据的delete字段值:', firstDeleteValue, '类型:', typeof firstDeleteValue, '是否为NULL:', firstDeleteValue === null)
      
      // 检查所有非 null 的值来判断字段类型
      const nonNullValues = gamesWithoutDelete.filter(g => g.delete !== null).map(g => g.delete)
      let isBooleanType = false
      
      if (nonNullValues.length > 0) {
        // 如果有非 null 值，检查是否为 boolean
        isBooleanType = typeof nonNullValues[0] === 'boolean'
      }
      
      if (isBooleanType) {
        // BOOLEAN 类型，查询条件：delete = false 或 delete IS NULL
        games = await sequelizeExecute(
          db.collection('games').findAll({
            attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
            where: {
              matchid: matchId,
              [Op.or]: [
                { delete: false },
                { delete: null }
              ]
            },
            order: [
              ['order', 'ASC']
            ],
            raw: true,
          })
        )
        console.log('使用BOOLEAN条件（包含NULL）查询的结果数量:', games ? games.length : 0)
      } else {
        // INTEGER 类型（包括所有值为 null 的情况），查询条件：delete != 1 或 delete IS NULL
        games = await sequelizeExecute(
          db.collection('games').findAll({
            attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
            where: {
              matchid: matchId,
              [Op.or]: [
                { delete: { [Op.ne]: 1 } },
                { delete: null }
              ]
            },
            order: [
              ['order', 'ASC']
            ],
            raw: true,
          })
        )
        console.log('使用INTEGER条件（包含NULL）查询的结果数量:', games ? games.length : 0)
      }
    } else {
      // 如果没有数据，使用 INTEGER 类型的查询条件（因为数据库字段是 INTEGER）
      games = await sequelizeExecute(
        db.collection('games').findAll({
          attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
          where: {
            matchid: matchId,
            [Op.or]: [
              { delete: { [Op.ne]: 1 } },
              { delete: null }
            ]
          },
          order: [
            ['order', 'ASC']
          ],
          raw: true,
        })
      )
      console.log('使用INTEGER条件（包含NULL）查询的结果数量:', games ? games.length : 0)
    }

    if (!games || games.length === 0) {
      console.log('没有找到对阵数据')
      return successResponse(result, {
        data: []
      })
    }

    // 收集所有玩家ID
    let playerIds = []
    games.forEach(game => {
      for (let i = 1; i < 5; i++) {
        const playerId = game['player' + i]
        if (playerId && !playerIds.includes(playerId)) {
          playerIds.push(playerId)
        }
      }
    })

    console.log('收集到的玩家ID:', playerIds)

    // 批量查询玩家信息
    let players = []
    if (playerIds.length > 0) {
      players = await sequelizeExecute(
        db.collection('players').findAll({
          attributes: ['_id', 'name', 'avatarurl'],
          where: {
            _id: {
              [Op.in]: playerIds
            },
          },
          raw: true
        })
      )

      console.log('查询到的玩家数量:', players ? players.length : 0)
      console.log('原始玩家数据:', players)
      
      // 规范化字段名（PostgreSQL 返回小写字段名）
      players = players.map(player => {
        return {
          _id: player._id,
          name: player.name,
          avatarUrl: player.avatarurl || player.avatarUrl || ''
        }
      })
      
      players = userAvatarFix(players)
      
      // 批量检查头像有效性并添加 avatarValid 字段
      players = await batchGetAvatarValidity(players)
      
      console.log('处理后的玩家数据:', players)
    }

    // 创建玩家映射
    const playersMap = {}
    players.forEach(player => {
      playersMap[player._id] = {
        _id: player._id,
        name: player.name || '未知',
        avatarUrl: player.avatarUrl || '',
        avatarValid: player.avatarValid !== undefined ? player.avatarValid : true
      }
    })

    // 将玩家信息填充到对阵数据中
    const normalizedGames = games.map(game => {
      const normalized = {
        _id: game._id,
        matchId: game.matchid,
        order: game.order,
        score1: game.score1 !== null && game.score1 !== undefined ? game.score1 : -1,
        score2: game.score2 !== null && game.score2 !== undefined ? game.score2 : -1,
        player1: playersMap[game.player1] || null,
        player2: playersMap[game.player2] || null,
        player3: playersMap[game.player3] || null,
        player4: playersMap[game.player4] || null
      }
      return normalized
    })

    console.log('规范化后的对阵数据:', normalizedGames)

    successResponse(result, {
      data: normalizedGames
    })
  } catch (error) {
    console.error('getMatchGames error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取对阵数据失败')
  }
}

// 获取比赛配置限制
getMatchConfig = async () => {
  try {
    // 获取最大配对数量配置
    const maxPairConfig = await sequelizeExecute(
      db.collection('system').findOne({
        where: {
          key: 'MATCH_MAX_PAIRS'
        },
        raw: true
      })
    )

    // 获取最大选手数量配置
    const maxPlayerConfig = await sequelizeExecute(
      db.collection('system').findOne({
        where: {
          key: 'MATCH_MAX_PLAYERS'
        },
        raw: true
      })
    )

    // 获取最小配对数量配置
    const minPairConfig = await sequelizeExecute(
      db.collection('system').findOne({
        where: {
          key: 'MATCH_MIN_PAIRS'
        },
        raw: true
      })
    )

    // 获取最小选手数量配置
    const minPlayerConfig = await sequelizeExecute(
      db.collection('system').findOne({
        where: {
          key: 'MATCH_MIN_PLAYERS'
        },
        raw: true
      })
    )

    return {
      maxPairs: maxPairConfig && maxPairConfig.value ? parseInt(maxPairConfig.value) : 8, // 默认8组配对（16名选手）
      maxPlayers: maxPlayerConfig && maxPlayerConfig.value ? parseInt(maxPlayerConfig.value) : 16, // 默认16名选手
      minPairs: minPairConfig && minPairConfig.value ? parseInt(minPairConfig.value) : 2, // 默认2组配对（4名选手）
      minPlayers: minPlayerConfig && minPlayerConfig.value ? parseInt(minPlayerConfig.value) : 4 // 默认4名选手
    }
  } catch (error) {
    console.error('获取比赛配置失败:', error)
    // 返回默认值
    return {
      maxPairs: 8,
      maxPlayers: 16,
      minPairs: 2,
      minPlayers: 4
    }
  }
}

// 创建赛事（管理台）
exports.create = async (request, result) => {
  try {
    const { clubid, name, type, playerCount, owner, remark, players } = request.body

    if (!clubid) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '俱乐部ID不能为空')
    }

    // 权限检查：如果是俱乐部管理员，只能为自己关联的俱乐部创建赛事
    if (request.admin && request.admin.role === 'club_admin') {
      const hasAccess = await request.hasClubAccess(clubid)
      if (!hasAccess) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权为该俱乐部创建赛事')
      }
    }

    // 检查俱乐部是否存在
    const club = await sequelizeExecute(
      db.collection('clubs').findByPk(clubid, {
        raw: true
      })
    )

    if (!club) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '俱乐部不存在')
    }

    let finalPlayerCount = playerCount || 0
    let totalGames = 0
    let matchType = type || 'none'

    // 如果传入了选手列表，生成对阵数据
    if (players && Array.isArray(players) && players.length > 0) {
      // 获取比赛配置限制
      const matchConfig = await getMatchConfig()

      // 统一类型：将 'fix' 转换为 'fixpair'（向后兼容）
      let matchDataType = matchType
      if (matchType === 'fix') {
        matchDataType = 'fixpair'
      }

      // 根据类型处理选手数组
      let playerArray = players
      if (matchType === 'fixpair' || matchType === 'fix' || matchType === 'group') {
        // 固定搭档和分组类型，需要配对格式
        // 如果传入的是单个选手ID数组，需要转换为配对格式
        if (players[0] && typeof players[0] === 'string') {
          // 单个ID数组，需要配对
          playerArray = []
          for (let i = 0; i < players.length; i += 2) {
            if (i + 1 < players.length) {
              playerArray.push({
                player1: { _id: players[i] },
                player2: { _id: players[i + 1] }
              })
            } else {
              playerArray.push({
                player1: { _id: players[i] },
                player2: null
              })
            }
          }
        }

        // 验证配对数量
        const completePairs = playerArray.filter(pair => pair.player1 && pair.player2)
        const pairCount = completePairs.length
        const actualPlayerCount = pairCount * 2

        // 检查是否有未完成的配对
        const incompletePairs = playerArray.filter(pair => !pair.player1 || !pair.player2)
        if (incompletePairs.length > 0) {
          return errorResponse(result, ErrorCode.VALIDATION_ERROR, '请完成所有配对，每个配对需要2名选手')
        }

        // 验证配对数量限制
        if (pairCount < matchConfig.minPairs) {
          return errorResponse(result, ErrorCode.VALIDATION_ERROR, `至少需要${matchConfig.minPairs}组配对（${matchConfig.minPairs * 2}名选手）`)
        }
        if (pairCount > matchConfig.maxPairs) {
          return errorResponse(result, ErrorCode.VALIDATION_ERROR, `最多支持${matchConfig.maxPairs}组配对（${matchConfig.maxPairs * 2}名选手）`)
        }
        if (actualPlayerCount > matchConfig.maxPlayers) {
          return errorResponse(result, ErrorCode.VALIDATION_ERROR, `最多支持${matchConfig.maxPlayers}名选手`)
        }
      } else {
        // 无固定类型，转换为对象数组
        if (players[0] && typeof players[0] === 'string') {
          playerArray = players.map(id => ({ _id: id }))
        }

        // 验证选手数量限制
        const playerCount = playerArray.length
        if (playerCount < matchConfig.minPlayers) {
          return errorResponse(result, ErrorCode.VALIDATION_ERROR, `至少需要${matchConfig.minPlayers}个选手`)
        }
        if (playerCount > matchConfig.maxPlayers) {
          return errorResponse(result, ErrorCode.VALIDATION_ERROR, `最多支持${matchConfig.maxPlayers}个选手`)
        }
      }

      // 生成对阵数据
      const allgames = await createMatchData(matchDataType, playerArray)
      
      if (allgames && allgames.length > 0) {
        // 使用第一个赛制的对阵数据
        const games = allgames[0].data || []
        totalGames = games.length

        // 计算实际玩家数
        if (matchType === 'fixpair' || matchType === 'fix' || matchType === 'group') {
          const playerArrayFlat = flatPlayerArray(playerArray)
          finalPlayerCount = playerArrayFlat.length
        } else {
          finalPlayerCount = playerArray.length
        }

        // 创建赛事并保存对阵数据
        const saved = await saveMatchData(
          owner || 'admin',
          matchType,
          clubid,
          games,
          finalPlayerCount,
          remark || ''
        )

        if (saved && saved.matchid) {
          const match = await sequelizeExecute(
            db.collection('matches').findByPk(saved.matchid, {
              raw: true
            })
          )

          if (match) {
            const normalizedMatch = normalizeMatchFields(match)
            
            // 生成小程序码
            try {
              // scene参数最大32个字符，只传递 matchid，因为可以通过 matchid 查询到 clubid
              // 如果 matchid 超过32字符，截断（但通常不会）
              const scene = saved.matchid.substring(0, 32)
              const page = 'pages/matches/detail'
              const qrcodeUrl = await wechat.getUnlimitedQRCode(scene, page, {
                width: 280,
                autoColor: true,
                isHyaline: false
              })
              
              // 保存小程序码URL到数据库
              await sequelizeExecute(
                db.collection('matches').update({
                  qrcodeUrl: qrcodeUrl
                }, {
                  where: {
                    _id: saved.matchid
                  }
                })
              )
              
              normalizedMatch.qrcodeUrl = qrcodeUrl
            } catch (error) {
              console.error('生成小程序码失败:', error)
              // 不阻止创建赛事，只是记录错误
            }
            
            successResponse(result, {
              data: normalizedMatch
            })
            return
          }
        }
      }
    }

    // 如果没有传入选手列表，只创建赛事记录（不生成对阵数据）
    const match = await sequelizeExecute(
      db.collection('matches').create({
        clubid: clubid,
        name: name || '',
        createDate: db.serverDate(),
        total: totalGames,
        finish: 0,
        playerCount: finalPlayerCount,
        type: matchType,
        delete: 0,
        owner: owner || 'admin',
        remark: remark || ''
      }, {
        raw: true
      })
    )

    if (match) {
      const normalizedMatch = normalizeMatchFields(match)
      
      // 生成小程序码
      try {
        // scene参数最大32个字符，只传递 matchid，因为可以通过 matchid 查询到 clubid
        const scene = match._id.substring(0, 32)
        const page = 'pages/matches/detail'
        const qrcodeUrl = await wechat.getUnlimitedQRCode(scene, page, {
          width: 280,
          autoColor: true,
          isHyaline: false
        })
        
        // 保存小程序码URL到数据库
        await sequelizeExecute(
          db.collection('matches').update({
            qrcodeUrl: qrcodeUrl
          }, {
            where: {
              _id: match._id
            }
          })
        )
        
        normalizedMatch.qrcodeUrl = qrcodeUrl
      } catch (error) {
        console.error('生成小程序码失败:', error)
        // 不阻止创建赛事，只是记录错误
      }
      
      successResponse(result, {
        data: normalizedMatch
      })
    } else {
      errorResponse(result, ErrorCode.DATABASE_ERROR, '创建赛事失败')
    }
  } catch (error) {
    console.error('createMatch error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '创建赛事失败: ' + error.message)
  }
}

// 更新赛事（管理台）
exports.update = async (request, result) => {
  try {
    const matchId = request.params.id
    const { name, type, playerCount, remark, finish } = request.body

    if (!matchId) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '赛事ID不能为空')
    }

    // 检查赛事是否存在
    const existingMatch = await sequelizeExecute(
      db.collection('matches').findByPk(matchId, {
        raw: true
      })
    )

    if (!existingMatch) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '赛事不存在')
    }

    // 权限检查：如果是俱乐部管理员，只能更新自己关联俱乐部的赛事
    if (request.admin && request.admin.role === 'club_admin') {
      const hasAccess = await request.hasClubAccess(existingMatch.clubid)
      if (!hasAccess) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权修改该赛事')
      }
    }

    let updateData = {}
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (playerCount !== undefined) updateData.playerCount = playerCount
    if (remark !== undefined) updateData.remark = remark
    if (finish !== undefined) updateData.finish = finish

    const updated = await sequelizeExecute(
      db.collection('matches').update(updateData, {
        where: {
          _id: matchId
        }
      })
    )

    if (updated > 0) {
      // 获取更新后的数据
      const updatedMatch = await sequelizeExecute(
        db.collection('matches').findByPk(matchId, {
          raw: true
        })
      )
      const normalizedMatch = normalizeMatchFields(updatedMatch)
      successResponse(result, {
        data: normalizedMatch
      })
    } else {
      errorResponse(result, ErrorCode.DATABASE_ERROR, '更新赛事失败')
    }
  } catch (error) {
    console.error('updateMatch error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '更新赛事失败: ' + error.message)
  }
}

// 删除赛事（管理台）
exports.delete = async (request, result) => {
  try {
    const matchId = request.params.id

    if (!matchId) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '赛事ID不能为空')
    }

    // 检查赛事是否存在并获取俱乐部ID
    const match = await sequelizeExecute(
      db.collection('matches').findByPk(matchId, {
        raw: true
      })
    )

    if (!match) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '赛事不存在')
    }

    // 权限检查：如果是俱乐部管理员，只能删除自己关联俱乐部的赛事
    if (request.admin && request.admin.role === 'club_admin') {
      const hasAccess = await request.hasClubAccess(match.clubid)
      if (!hasAccess) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权删除该赛事')
      }
    }

    const updated = await sequelizeExecute(
      db.collection('matches').update({
        delete: 1
      }, {
        where: {
          _id: matchId
        }
      })
    )

    if (updated > 0) {
      // 同时删除关联的 games
      await sequelizeExecute(
        db.collection('games').update({
          delete: 1
        }, {
          where: {
            matchid: matchId
          }
        })
      )

      successResponse(result, {
        data: { deleted: true }
      })
    } else {
      errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '赛事不存在或已被删除')
    }
  } catch (error) {
    console.error('deleteMatch error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '删除赛事失败: ' + error.message)
  }
}

// 生成或获取赛事小程序码（管理台）
exports.getQRCode = async (request, result) => {
  try {
    const matchId = request.params.id
    
    if (!matchId) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '赛事ID不能为空')
    }

    // 检查赛事是否存在
    const match = await sequelizeExecute(
      db.collection('matches').findByPk(matchId, {
        attributes: ['_id', 'clubid', 'qrcodeUrl'],
        raw: true
      })
    )

    if (!match) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '赛事不存在')
    }

    // 权限检查：如果是俱乐部管理员，只能查看自己关联俱乐部的赛事
    if (request.admin && request.admin.role === 'club_admin') {
      const hasAccess = await request.hasClubAccess(match.clubid)
      if (!hasAccess) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权访问该赛事')
      }
    }

    // 如果已有小程序码，直接返回
    if (match.qrcodeUrl) {
      return successResponse(result, {
        data: {
          qrcodeUrl: match.qrcodeUrl
        }
      })
    }

    // 生成新的小程序码
    try {
      // scene参数最大32个字符，只传递 matchid，因为可以通过 matchid 查询到 clubid
      const scene = matchId.substring(0, 32)
      const page = 'pages/matches/detail'
      const qrcodeUrl = await wechat.getUnlimitedQRCode(scene, page, {
        width: 280,
        autoColor: true,
        isHyaline: false
      })
      
      // 保存小程序码URL到数据库
      await sequelizeExecute(
        db.collection('matches').update({
          qrcodeUrl: qrcodeUrl
        }, {
          where: {
            _id: matchId
          }
        })
      )
      
      successResponse(result, {
        data: {
          qrcodeUrl: qrcodeUrl
        }
      })
    } catch (error) {
      console.error('生成小程序码失败:', error)
      errorResponse(result, ErrorCode.INTERNAL_ERROR, '生成小程序码失败: ' + error.message)
    }
  } catch (error) {
    console.error('getQRCode error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取小程序码失败: ' + error.message)
  }
}

// 从对阵数据中推断固定搭档的配对关系
// 返回一个 Map，key 是 playerId，value 是配对中的另一个 playerId
inferPairRelations = (games) => {
  const pairMap = new Map() // playerId -> partnerId
  const processedPairs = new Set() // 已处理的配对（用排序后的ID对表示）
  
  games.forEach(game => {
    if (game.player1 && game.player2 && game.player3 && game.player4) {
      // 在固定搭档模式下，player1和player2是一对，player3和player4是一对
      // 提取玩家ID（支持对象和字符串ID两种格式）
      const getPlayerId = (player) => {
        if (typeof player === 'string') {
          return player
        }
        return player._id || player.id || player
      }
      
      const player1Id = getPlayerId(game.player1)
      const player2Id = getPlayerId(game.player2)
      const player3Id = getPlayerId(game.player3)
      const player4Id = getPlayerId(game.player4)
      
      // 对配对ID进行排序以确保一致性
      const pair1 = [player1Id, player2Id].sort()
      const pair2 = [player3Id, player4Id].sort()
      
      const pair1Key = `${pair1[0]}_${pair1[1]}`
      const pair2Key = `${pair2[0]}_${pair2[1]}`
      
      if (!processedPairs.has(pair1Key)) {
        pairMap.set(pair1[0], pair1[1])
        pairMap.set(pair1[1], pair1[0])
        processedPairs.add(pair1Key)
      }
      
      if (!processedPairs.has(pair2Key)) {
        pairMap.set(pair2[0], pair2[1])
        pairMap.set(pair2[1], pair2[0])
        processedPairs.add(pair2Key)
      }
    }
  })
  
  return pairMap
}

// 获取赛事排名统计（管理台）
exports.getRanking = async (request, result) => {
  try {
    const matchId = request.params.id
    if (!matchId) {
      return errorResponse(result, ErrorCode.VALIDATION_ERROR, '赛事ID不能为空')
    }

    // 先获取赛事信息用于权限检查
    let match = await sequelizeExecute(
      db.collection('matches').findByPk(matchId, {
        attributes: ['_id', 'clubid', 'type'],
        raw: true
      })
    )

    if (!match) {
      return errorResponse(result, ErrorCode.ERROR_DATA_NOT_EXIST, '赛事不存在')
    }

    // 权限检查：如果是俱乐部管理员，只能查看自己关联俱乐部的赛事
    if (request.admin && request.admin.role === 'club_admin') {
      const hasAccess = await request.hasClubAccess(match.clubid)
      if (!hasAccess) {
        return errorResponse(result, ErrorCode.ERROR_NEED_LOGIN, '无权访问该赛事')
      }
    }

    // 获取俱乐部的积分规则配置（从配置表读取）
    const clubConfigService = require("./clubconfigservice")
    let scoreConfig = {
      useScoreRanking: false,
      scoreWinPoints: null,
      scoreRewardThreshold: null,
      scoreRewardPoints: null,
      scoreRewardMaxPerGame: null
    }
    if (match && match.clubid) {
      scoreConfig = await clubConfigService.getConfigByClubId(match.clubid)
      console.log('积分规则配置:', scoreConfig)
    }

    // 先查询所有比赛（不限制已完成），用于收集所有参赛选手
    let gamesWithoutDelete = await sequelizeExecute(
      db.collection('games').findAll({
        attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4', 'delete'],
        where: {
          matchid: matchId,
        },
        raw: true,
      })
    )

    // 根据实际字段类型选择查询条件，查询所有比赛（用于收集所有参赛选手）
    let allGames
    if (gamesWithoutDelete && gamesWithoutDelete.length > 0) {
      const nonNullValues = gamesWithoutDelete.filter(g => g.delete !== null).map(g => g.delete)
      let isBooleanType = false
      
      if (nonNullValues.length > 0) {
        isBooleanType = typeof nonNullValues[0] === 'boolean'
      }
      
      if (isBooleanType) {
        allGames = await sequelizeExecute(
          db.collection('games').findAll({
            attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
            where: {
              matchid: matchId,
              [Op.or]: [
                { delete: false },
                { delete: null }
              ]
            },
            order: [['order', 'ASC']],
            raw: true,
          })
        )
      } else {
        allGames = await sequelizeExecute(
          db.collection('games').findAll({
            attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
            where: {
              matchid: matchId,
              [Op.or]: [
                { delete: { [Op.ne]: 1 } },
                { delete: null }
              ]
            },
            order: [['order', 'ASC']],
            raw: true,
          })
        )
      }
    } else {
      allGames = await sequelizeExecute(
        db.collection('games').findAll({
          attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
          where: {
            matchid: matchId,
            [Op.or]: [
              { delete: { [Op.ne]: 1 } },
              { delete: null }
            ]
          },
          order: [['order', 'ASC']],
          raw: true,
        })
      )
    }

    if (!allGames || allGames.length === 0) {
      return successResponse(result, {
        data: []
      })
    }

    // 辅助函数：提取玩家ID（支持对象和字符串ID两种格式）
    const getPlayerId = (player) => {
      if (!player) return null
      if (typeof player === 'string') {
        return player
      }
      return player._id || player.id || player
    }
    
    // 先收集所有参赛选手（从所有比赛中）
    const allPlayerIds = new Set()
    allGames.forEach(game => {
      const player1Id = getPlayerId(game.player1)
      const player2Id = getPlayerId(game.player2)
      const player3Id = getPlayerId(game.player3)
      const player4Id = getPlayerId(game.player4)
      
      if (player1Id) allPlayerIds.add(player1Id)
      if (player2Id) allPlayerIds.add(player2Id)
      if (player3Id) allPlayerIds.add(player3Id)
      if (player4Id) allPlayerIds.add(player4Id)
    })

    // 初始化所有选手的统计（包括未完成比赛的选手）
    const playerStats = {}
    allPlayerIds.forEach(playerId => {
      playerStats[playerId] = {
        playerId: playerId,
        wins: 0,
        losses: 0,
        total: 0,
        score: 0, // 总积分
        baseScore: 0, // 局胜分总和
        rewardScore: 0 // 奖励分总和
      }
    })

    // 只统计已完成的比赛（score1 > 0 && score2 > 0）的胜负关系
    const completedGames = allGames.filter(game => 
      game.score1 > 0 && game.score2 > 0
    )
    
    completedGames.forEach(game => {
      const player1 = getPlayerId(game.player1)
      const player2 = getPlayerId(game.player2)
      const player3 = getPlayerId(game.player3)
      const player4 = getPlayerId(game.player4)
      const score1 = game.score1
      const score2 = game.score2

      // 判断胜负并计算积分
      // 计算奖励积分（基于净胜分）
      let rewardPoints = 0
      if (scoreConfig.useScoreRanking && 
          scoreConfig.scoreRewardThreshold !== null && 
          scoreConfig.scoreRewardThreshold > 0 &&
          scoreConfig.scoreRewardPoints !== null) {
        const margin = Math.abs(score1 - score2) // 净胜分
        // 每达到阈值n分，就加m个积分（不需要超过阈值）
        // 例如：阈值=5，奖励分=2
        // 净胜分5分：5/5=1次，奖励分=1*2=2分
        // 净胜分10分：10/5=2次，奖励分=2*2=4分
        rewardPoints = Math.floor(margin / scoreConfig.scoreRewardThreshold) * scoreConfig.scoreRewardPoints
        // 每局封顶k个积分
        if (scoreConfig.scoreRewardMaxPerGame !== null && rewardPoints > scoreConfig.scoreRewardMaxPerGame) {
          rewardPoints = scoreConfig.scoreRewardMaxPerGame
        }
      }

      if (score1 > score2) {
        // 队伍1获胜
        if (player1 && playerStats[player1]) {
          playerStats[player1].wins++
          playerStats[player1].total++
          // 如果启用积分排名，累加积分
          if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
            playerStats[player1].baseScore += scoreConfig.scoreWinPoints
            playerStats[player1].rewardScore += rewardPoints
            playerStats[player1].score += scoreConfig.scoreWinPoints + rewardPoints
          }
        }
        if (player2 && playerStats[player2]) {
          playerStats[player2].wins++
          playerStats[player2].total++
          if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
            playerStats[player2].baseScore += scoreConfig.scoreWinPoints
            playerStats[player2].rewardScore += rewardPoints
            playerStats[player2].score += scoreConfig.scoreWinPoints + rewardPoints
          }
        }
        if (player3 && playerStats[player3]) {
          playerStats[player3].losses++
          playerStats[player3].total++
        }
        if (player4 && playerStats[player4]) {
          playerStats[player4].losses++
          playerStats[player4].total++
        }
      } else if (score2 > score1) {
        // 队伍2获胜
        if (player1 && playerStats[player1]) {
          playerStats[player1].losses++
          playerStats[player1].total++
        }
        if (player2 && playerStats[player2]) {
          playerStats[player2].losses++
          playerStats[player2].total++
        }
        if (player3 && playerStats[player3]) {
          playerStats[player3].wins++
          playerStats[player3].total++
          if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
            playerStats[player3].baseScore += scoreConfig.scoreWinPoints
            playerStats[player3].rewardScore += rewardPoints
            playerStats[player3].score += scoreConfig.scoreWinPoints + rewardPoints
          }
        }
        if (player4 && playerStats[player4]) {
          playerStats[player4].wins++
          playerStats[player4].total++
          if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
            playerStats[player4].baseScore += scoreConfig.scoreWinPoints
            playerStats[player4].rewardScore += rewardPoints
            playerStats[player4].score += scoreConfig.scoreWinPoints + rewardPoints
          }
        }
      }
    })

    // 收集所有玩家ID
    const playerIds = Array.from(allPlayerIds)

    // 批量查询玩家信息
    let players = []
    if (playerIds.length > 0) {
      players = await sequelizeExecute(
        db.collection('players').findAll({
          attributes: ['_id', 'name', 'avatarurl'],
          where: {
            _id: {
              [Op.in]: playerIds
            },
          },
          raw: true
        })
      )

      // 规范化字段名
      players = players.map(player => {
        return {
          _id: player._id,
          name: player.name,
          avatarUrl: player.avatarurl || player.avatarUrl || ''
        }
      })
      
      players = userAvatarFix(players)
    }

    // 创建玩家映射
    const playersMap = {}
    players.forEach(player => {
      playersMap[player._id] = {
        _id: player._id,
        name: player.name || '未知',
        avatarUrl: player.avatarUrl || ''
      }
    })

    // 判断是否为固定搭档模式
    const isFixPairMode = match && (match.type === 'fixpair' || match.type === 'fix')
    let pairMap = null
    let pairStats = null
    
    if (isFixPairMode) {
      // 从对阵数据中推断配对关系
      pairMap = inferPairRelations(allGames)
      
      // 按对合并统计数据
      pairStats = {}
      const processedPairs = new Set()
      
      Object.keys(playerStats).forEach(playerId => {
        const partnerId = pairMap.get(playerId)
        if (partnerId && playerStats[partnerId]) {
          // 找到配对，合并统计数据
          const pairKey = [playerId, partnerId].sort().join('_')
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey)
            const stat1 = playerStats[playerId]
            const stat2 = playerStats[partnerId]
            
            // 合并统计数据：同一对的选手共享相同的统计数据
            pairStats[pairKey] = {
              playerIds: [playerId, partnerId],
              wins: stat1.wins, // 使用第一个选手的胜场数（因为同一对的胜场数应该相同）
              losses: stat1.losses, // 使用第一个选手的负场数
              total: stat1.total, // 使用第一个选手的总场次
              score: stat1.score || 0,
              baseScore: stat1.baseScore || 0,
              rewardScore: stat1.rewardScore || 0
            }
          }
        } else {
          // 没有找到配对，单独显示（这种情况不应该发生，但为了健壮性保留）
          pairStats[playerId] = {
            playerIds: [playerId],
            wins: playerStats[playerId].wins,
            losses: playerStats[playerId].losses,
            total: playerStats[playerId].total,
            score: playerStats[playerId].score || 0,
            baseScore: playerStats[playerId].baseScore || 0,
            rewardScore: playerStats[playerId].rewardScore || 0
          }
        }
      })
    }

    // 构建排名数据 - 确保所有队员都显示，即使没有完成任何比赛
    let ranking = isFixPairMode && pairStats 
      ? Object.values(pairStats).map(pairStat => {
          // 固定搭档模式：返回配对信息
          const player1 = playersMap[pairStat.playerIds[0]]
          const player2 = pairStat.playerIds[1] ? playersMap[pairStat.playerIds[1]] : null
          
          // 确保 player1 包含 avatarValid 字段
          const player1Data = player1 || { _id: pairStat.playerIds[0], name: '未知', avatarUrl: '', avatarValid: false }
          if (player1Data.avatarValid === undefined) {
            player1Data.avatarValid = false
          }
          
          // 确保 player2 包含 avatarValid 字段
          let player2Data = null
          if (player2) {
            player2Data = { ...player2 }
            if (player2Data.avatarValid === undefined) {
              player2Data.avatarValid = false
            }
          }
          
          return {
            playerId: pairStat.playerIds[0], // 使用第一个选手ID作为主ID
            playerIds: pairStat.playerIds, // 配对的所有选手ID
            player: player1Data,
            player2: player2Data, // 第二个选手信息（已包含 avatarValid）
            wins: pairStat.wins,
            losses: pairStat.losses,
            total: pairStat.total,
            score: scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null ? pairStat.score : undefined,
            baseScore: scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null ? pairStat.baseScore : undefined,
            rewardScore: scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null ? pairStat.rewardScore : undefined,
            winRate: scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null ? undefined : (pairStat.total > 0 ? ((pairStat.wins / pairStat.total) * 100).toFixed(1) : '0.0')
          }
        })
        .sort((a, b) => {
          if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
            // 按积分排名：1. 总积分降序 2. 胜场数降序 3. 负场数升序 4. 总场次降序
            if (b.score !== a.score) {
              return b.score - a.score
            }
            if (b.wins !== a.wins) {
              return b.wins - a.wins
            }
            if (a.losses !== b.losses) {
              return a.losses - b.losses
            }
            if (b.total !== a.total) {
              return b.total - a.total
            }
          } else {
            // 按胜场数排名：1. 胜场数降序 2. 负场数升序 3. 总场次降序
            if (b.wins !== a.wins) {
              return b.wins - a.wins
            }
            if (a.losses !== b.losses) {
              return a.losses - b.losses
            }
            if (b.total !== a.total) {
              return b.total - a.total
            }
          }
          // 如果所有统计都一样，按 playerId 排序（保持稳定）
          return a.playerId.localeCompare(b.playerId)
        })
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))
      : Object.values(playerStats)
      .map(stat => {
        const player = playersMap[stat.playerId]
        // 如果找不到玩家信息，仍然显示（使用默认值）
        if (!player) {
          console.warn('找不到玩家信息，playerId:', stat.playerId)
        }
        // 确保 player 对象包含 avatarValid 字段
        const playerData = player || { _id: stat.playerId, name: '未知', avatarUrl: '', avatarValid: false }
        if (playerData.avatarValid === undefined) {
          playerData.avatarValid = false
        }
        const result = {
          playerId: stat.playerId,
          player: playerData,
          wins: stat.wins,
          losses: stat.losses,
          total: stat.total
        }
        
        // 如果启用积分排名，返回积分相关字段；否则返回胜率
        if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
          result.score = stat.score || 0 // 总积分
          result.baseScore = stat.baseScore || 0 // 局胜分总和
          result.rewardScore = stat.rewardScore || 0 // 奖励分总和
        } else {
          result.winRate = stat.total > 0 ? ((stat.wins / stat.total) * 100).toFixed(1) : '0.0'
        }
        
        return result
      })
      // 不过滤任何记录，确保所有队员都显示
      .sort((a, b) => {
        if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
          // 按积分排名：1. 总积分降序 2. 胜场数降序 3. 负场数升序 4. 总场次降序
          if (b.score !== a.score) {
            return b.score - a.score
          }
          if (b.wins !== a.wins) {
            return b.wins - a.wins
          }
          if (a.losses !== b.losses) {
            return a.losses - b.losses
          }
          if (b.total !== a.total) {
            return b.total - a.total
          }
        } else {
          // 按胜场数排名：1. 胜场数降序 2. 负场数升序 3. 总场次降序
          if (b.wins !== a.wins) {
            return b.wins - a.wins
          }
          if (a.losses !== b.losses) {
            return a.losses - b.losses
          }
          if (b.total !== a.total) {
            return b.total - a.total
          }
        }
        // 如果所有统计都一样，按 playerId 排序（保持稳定）
        return a.playerId.localeCompare(b.playerId)
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }))

    successResponse(result, {
      data: ranking
    })
  } catch (error) {
    console.error('getRanking error:', error)
    errorResponse(result, ErrorCode.DATABASE_ERROR, '获取排名统计失败: ' + error.message)
  }
}

// 获取赛事排名统计（小程序使用，不需要权限检查）
getRankingForMiniProgram = async (matchId) => {
  try {
    if (!matchId) {
      console.log('getRankingForMiniProgram: matchId 为空')
      return []
    }

    console.log('getRankingForMiniProgram: 开始查询排名，matchId:', matchId)
    
    // 如果 matchid 可能被截断，先尝试通过 matchid 查询 matches 表获取完整的 matchid
    let fullMatchid = matchId
    if (matchId.length < 36) {
      console.log('matchid 可能被截断，尝试模糊匹配:', matchId)
      try {
        const matches = await sequelizeExecute(
          db.collection('matches').findAll({
            where: {
              _id: {
                [Op.like]: `${matchId}%`
              }
            },
            attributes: ['_id'],
            raw: true,
            limit: 1
          })
        )
        if (matches && matches.length > 0) {
          fullMatchid = matches[0]._id
          console.log('通过模糊匹配找到完整 matchid:', fullMatchid)
        }
      } catch (error) {
        console.error('模糊匹配 matchid 失败:', error)
      }
    }

    // 先查询所有比赛（不限制已完成），用于收集所有参赛选手
    let gamesWithoutDelete = await sequelizeExecute(
      db.collection('games').findAll({
        attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4', 'delete'],
        where: {
          matchid: fullMatchid,
        },
        raw: true,
      })
    )
    
    console.log('查询到的 gamesWithoutDelete 数量:', gamesWithoutDelete ? gamesWithoutDelete.length : 0)

    // 根据实际字段类型选择查询条件，查询所有比赛（用于收集所有参赛选手）
    let allGames
    if (gamesWithoutDelete && gamesWithoutDelete.length > 0) {
      const nonNullValues = gamesWithoutDelete.filter(g => g.delete !== null).map(g => g.delete)
      let isBooleanType = false
      
      if (nonNullValues.length > 0) {
        isBooleanType = typeof nonNullValues[0] === 'boolean'
      }
      
      if (isBooleanType) {
        allGames = await sequelizeExecute(
          db.collection('games').findAll({
            attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
            where: {
              matchid: fullMatchid,
              [Op.or]: [
                { delete: false },
                { delete: null }
              ]
            },
            order: [['order', 'ASC']],
            raw: true,
          })
        )
      } else {
        allGames = await sequelizeExecute(
          db.collection('games').findAll({
            attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
            where: {
              matchid: fullMatchid,
              [Op.or]: [
                { delete: { [Op.ne]: 1 } },
                { delete: null }
              ]
            },
            order: [['order', 'ASC']],
            raw: true,
          })
        )
      }
    } else {
      allGames = await sequelizeExecute(
        db.collection('games').findAll({
          attributes: ['_id', 'matchid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
          where: {
            matchid: fullMatchid,
            [Op.or]: [
              { delete: { [Op.ne]: 1 } },
              { delete: null }
            ]
          },
          order: [['order', 'ASC']],
          raw: true,
        })
      )
    }
    
    console.log('查询到的 allGames 数量:', allGames ? allGames.length : 0)

    // 先获取赛事信息以获取 clubid
    let match = null
    if (allGames && allGames.length > 0) {
      // 从第一个 game 获取 matchid，然后查询 match
      const firstGame = allGames[0]
      if (firstGame.matchid) {
        match = await sequelizeExecute(
          db.collection('matches').findByPk(firstGame.matchid, {
            attributes: ['_id', 'clubid', 'type'],
            raw: true
          })
        )
      }
    } else {
      // 如果没有 games，直接通过 matchId 查询
      match = await sequelizeExecute(
        db.collection('matches').findByPk(fullMatchid, {
          attributes: ['_id', 'clubid', 'type'],
          raw: true
        })
      )
    }
    
    // 获取俱乐部的积分规则配置（从配置表读取）
    const clubConfigService = require("./clubconfigservice")
    let scoreConfig = {
      useScoreRanking: false,
      scoreWinPoints: null,
      scoreRewardPoints: null
    }
    if (match && match.clubid) {
      scoreConfig = await clubConfigService.getConfigByClubId(match.clubid)
      console.log('积分规则配置:', scoreConfig)
    }

    // 辅助函数：提取玩家ID（支持对象和字符串ID两种格式）
    const getPlayerId = (player) => {
      if (!player) return null
      if (typeof player === 'string') {
        return player
      }
      return player._id || player.id || player
    }
    
    // 先收集所有参赛选手（从所有比赛中）
    const allPlayerIds = new Set()
    if (allGames && allGames.length > 0) {
      allGames.forEach(game => {
        const player1Id = getPlayerId(game.player1)
        const player2Id = getPlayerId(game.player2)
        const player3Id = getPlayerId(game.player3)
        const player4Id = getPlayerId(game.player4)
        
        if (player1Id) allPlayerIds.add(player1Id)
        if (player2Id) allPlayerIds.add(player2Id)
        if (player3Id) allPlayerIds.add(player3Id)
        if (player4Id) allPlayerIds.add(player4Id)
      })
      console.log('收集到的参赛选手数量:', allPlayerIds.size)
      console.log('参赛选手ID列表:', Array.from(allPlayerIds))
    } else {
      console.log('没有找到比赛数据，allGames:', allGames)
    }
    
    // 如果没有比赛数据，返回空数组
    if (allPlayerIds.size === 0) {
      console.log('没有参赛选手，返回空排名')
      return []
    }

    // 初始化所有选手的统计（包括未完成比赛的选手）
    const playerStats = {}
    allPlayerIds.forEach(playerId => {
      playerStats[playerId] = {
        playerId: playerId,
        wins: 0,
        losses: 0,
        total: 0,
        score: 0, // 总积分
        baseScore: 0, // 局胜分总和
        rewardScore: 0 // 奖励分总和
      }
    })

    // 只统计已完成的比赛（score1 > 0 && score2 > 0）的胜负关系
    const completedGames = allGames.filter(game => 
      game.score1 > 0 && game.score2 > 0
    )
    
    completedGames.forEach(game => {
      const player1 = getPlayerId(game.player1)
      const player2 = getPlayerId(game.player2)
      const player3 = getPlayerId(game.player3)
      const player4 = getPlayerId(game.player4)
      const score1 = game.score1
      const score2 = game.score2

      // 判断胜负并计算积分
      // 计算奖励积分（基于净胜分）
      let rewardPoints = 0
      if (scoreConfig.useScoreRanking && 
          scoreConfig.scoreRewardThreshold !== null && 
          scoreConfig.scoreRewardThreshold > 0 &&
          scoreConfig.scoreRewardPoints !== null) {
        const margin = Math.abs(score1 - score2) // 净胜分
        // 每达到阈值n分，就加m个积分（不需要超过阈值）
        // 例如：阈值=5，奖励分=2
        // 净胜分5分：5/5=1次，奖励分=1*2=2分
        // 净胜分10分：10/5=2次，奖励分=2*2=4分
        rewardPoints = Math.floor(margin / scoreConfig.scoreRewardThreshold) * scoreConfig.scoreRewardPoints
        // 每局封顶k个积分
        if (scoreConfig.scoreRewardMaxPerGame !== null && rewardPoints > scoreConfig.scoreRewardMaxPerGame) {
          rewardPoints = scoreConfig.scoreRewardMaxPerGame
        }
      }
      
      if (score1 > score2) {
        // 队伍1获胜
        if (player1 && playerStats[player1]) {
          playerStats[player1].wins++
          playerStats[player1].total++
          // 如果启用积分排名，累加积分
          if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
            playerStats[player1].baseScore += scoreConfig.scoreWinPoints
            playerStats[player1].rewardScore += rewardPoints
            playerStats[player1].score += scoreConfig.scoreWinPoints + rewardPoints
          }
        }
        if (player2 && playerStats[player2]) {
          playerStats[player2].wins++
          playerStats[player2].total++
          if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
            playerStats[player2].baseScore += scoreConfig.scoreWinPoints
            playerStats[player2].rewardScore += rewardPoints
            playerStats[player2].score += scoreConfig.scoreWinPoints + rewardPoints
          }
        }
        if (player3 && playerStats[player3]) {
          playerStats[player3].losses++
          playerStats[player3].total++
        }
        if (player4 && playerStats[player4]) {
          playerStats[player4].losses++
          playerStats[player4].total++
        }
      } else if (score2 > score1) {
        // 队伍2获胜
        if (player1 && playerStats[player1]) {
          playerStats[player1].losses++
          playerStats[player1].total++
        }
        if (player2 && playerStats[player2]) {
          playerStats[player2].losses++
          playerStats[player2].total++
        }
        if (player3 && playerStats[player3]) {
          playerStats[player3].wins++
          playerStats[player3].total++
          if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
            playerStats[player3].baseScore += scoreConfig.scoreWinPoints
            playerStats[player3].rewardScore += rewardPoints
            playerStats[player3].score += scoreConfig.scoreWinPoints + rewardPoints
          }
        }
        if (player4 && playerStats[player4]) {
          playerStats[player4].wins++
          playerStats[player4].total++
          if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
            playerStats[player4].baseScore += scoreConfig.scoreWinPoints
            playerStats[player4].rewardScore += rewardPoints
            playerStats[player4].score += scoreConfig.scoreWinPoints + rewardPoints
          }
        }
      }
    })

    // 收集所有玩家ID
    const playerIds = Array.from(allPlayerIds)

    // 批量查询玩家信息
    let players = []
    if (playerIds.length > 0) {
      players = await sequelizeExecute(
        db.collection('players').findAll({
          attributes: ['_id', 'name', 'avatarurl'],
          where: {
            _id: {
              [Op.in]: playerIds
            },
          },
          raw: true
        })
      )

      // 规范化字段名
      players = players.map(player => {
        return {
          _id: player._id,
          name: player.name,
          avatarUrl: player.avatarurl || player.avatarUrl || ''
        }
      })
      
      players = userAvatarFix(players)
      
      // 批量检查头像有效性并添加 avatarValid 字段
      players = await batchGetAvatarValidity(players)
    }

    // 创建玩家映射
    const playersMap = {}
    players.forEach(player => {
      playersMap[player._id] = {
        _id: player._id,
        name: player.name || '未知',
        avatarUrl: player.avatarUrl || '',
        avatarValid: player.avatarValid !== undefined ? player.avatarValid : true
      }
    })

    // 判断是否为固定搭档模式
    const isFixPairMode = match && (match.type === 'fixpair' || match.type === 'fix')
    let pairMap = null
    let pairStats = null
    
    if (isFixPairMode) {
      // 从对阵数据中推断配对关系
      pairMap = inferPairRelations(allGames)
      
      // 按对合并统计数据
      pairStats = {}
      const processedPairs = new Set()
      
      Object.keys(playerStats).forEach(playerId => {
        const partnerId = pairMap.get(playerId)
        if (partnerId && playerStats[partnerId]) {
          // 找到配对，合并统计数据
          const pairKey = [playerId, partnerId].sort().join('_')
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey)
            const stat1 = playerStats[playerId]
            const stat2 = playerStats[partnerId]
            
            // 合并统计数据：同一对的选手共享相同的统计数据
            pairStats[pairKey] = {
              playerIds: [playerId, partnerId],
              wins: stat1.wins, // 使用第一个选手的胜场数（因为同一对的胜场数应该相同）
              losses: stat1.losses, // 使用第一个选手的负场数
              total: stat1.total, // 使用第一个选手的总场次
              score: stat1.score || 0,
              baseScore: stat1.baseScore || 0,
              rewardScore: stat1.rewardScore || 0
            }
          }
        } else {
          // 没有找到配对，单独显示（这种情况不应该发生，但为了健壮性保留）
          pairStats[playerId] = {
            playerIds: [playerId],
            wins: playerStats[playerId].wins,
            losses: playerStats[playerId].losses,
            total: playerStats[playerId].total,
            score: playerStats[playerId].score || 0,
            baseScore: playerStats[playerId].baseScore || 0,
            rewardScore: playerStats[playerId].rewardScore || 0
          }
        }
      })
    }

    // 构建排名数据 - 确保所有队员都显示，即使没有完成任何比赛
    console.log('开始构建排名数据，playerStats数量:', Object.keys(playerStats).length)
    let ranking = isFixPairMode && pairStats 
      ? Object.values(pairStats).map(pairStat => {
          // 固定搭档模式：返回配对信息
          const player1 = playersMap[pairStat.playerIds[0]]
          const player2 = pairStat.playerIds[1] ? playersMap[pairStat.playerIds[1]] : null
          
          return {
            playerId: pairStat.playerIds[0], // 使用第一个选手ID作为主ID
            playerIds: pairStat.playerIds, // 配对的所有选手ID
            player: player1 || { _id: pairStat.playerIds[0], name: '未知', avatarUrl: '', avatarValid: false },
            player2: player2 || null, // 第二个选手信息（已包含 avatarValid）
            wins: pairStat.wins,
            losses: pairStat.losses,
            total: pairStat.total,
            score: scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null ? pairStat.score : undefined,
            baseScore: scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null ? pairStat.baseScore : undefined,
            rewardScore: scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null ? pairStat.rewardScore : undefined,
            winRate: scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null ? undefined : (pairStat.total > 0 ? ((pairStat.wins / pairStat.total) * 100).toFixed(1) : '0.0')
          }
        })
        .sort((a, b) => {
          if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
            // 按积分排名：1. 总积分降序 2. 胜场数降序 3. 负场数升序 4. 总场次降序
            if (b.score !== a.score) {
              return b.score - a.score
            }
            if (b.wins !== a.wins) {
              return b.wins - a.wins
            }
            if (a.losses !== b.losses) {
              return a.losses - b.losses
            }
            if (b.total !== a.total) {
              return b.total - a.total
            }
          } else {
            // 按胜场数排名：1. 胜场数降序 2. 负场数升序 3. 总场次降序
            if (b.wins !== a.wins) {
              return b.wins - a.wins
            }
            if (a.losses !== b.losses) {
              return a.losses - b.losses
            }
            if (b.total !== a.total) {
              return b.total - a.total
            }
          }
          // 如果所有统计都一样，按 playerId 排序（保持稳定）
          return a.playerId.localeCompare(b.playerId)
        })
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))
      : Object.values(playerStats)
      .map(stat => {
        const player = playersMap[stat.playerId]
        // 如果找不到玩家信息，仍然显示（使用默认值）
        if (!player) {
          console.warn('找不到玩家信息，playerId:', stat.playerId)
        }
        const result = {
          playerId: stat.playerId,
          player: player || { _id: stat.playerId, name: '未知', avatarUrl: '', avatarValid: false },
          wins: stat.wins,
          losses: stat.losses,
          total: stat.total
        }
        
        // 如果启用积分排名，返回积分相关字段；否则返回胜率
        if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
          result.score = stat.score || 0 // 总积分
          result.baseScore = stat.baseScore || 0 // 局胜分总和
          result.rewardScore = stat.rewardScore || 0 // 奖励分总和
        } else {
          result.winRate = stat.total > 0 ? ((stat.wins / stat.total) * 100).toFixed(1) : '0.0'
        }
        
        return result
      })
      // 不过滤任何记录，确保所有队员都显示
      .sort((a, b) => {
        if (scoreConfig.useScoreRanking && scoreConfig.scoreWinPoints !== null) {
          // 按积分排名：1. 总积分降序 2. 胜场数降序 3. 负场数升序 4. 总场次降序
          if (b.score !== a.score) {
            return b.score - a.score
          }
          if (b.wins !== a.wins) {
            return b.wins - a.wins
          }
          if (a.losses !== b.losses) {
            return a.losses - b.losses
          }
          if (b.total !== a.total) {
            return b.total - a.total
          }
        } else {
          // 按胜场数排名：1. 胜场数降序 2. 负场数升序 3. 总场次降序
          if (b.wins !== a.wins) {
            return b.wins - a.wins
          }
          if (a.losses !== b.losses) {
            return a.losses - b.losses
          }
          if (b.total !== a.total) {
            return b.total - a.total
          }
        }
        // 如果所有统计都一样，按 playerId 排序（保持稳定）
        return a.playerId.localeCompare(b.playerId)
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }))
    
    // 奖励分已在每局计算时根据净胜分添加，这里不需要额外处理

    console.log('构建完成的排名数据数量:', ranking.length)
    console.log('排名数据示例（前3条）:', ranking.slice(0, 3))
    
    // 确保返回的是数组
    if (!Array.isArray(ranking)) {
      console.error('排名数据不是数组:', typeof ranking, ranking)
      return []
    }
    
    return ranking
  } catch (error) {
    console.error('getRankingForMiniProgram error:', error)
    console.error('错误堆栈:', error.stack)
    return []
  }
}