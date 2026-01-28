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
const ErrorCode = require("./errorcode")

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
  
  // 先查询不包含 delete 条件的数据，判断 delete 字段类型
  let gamesWithoutDelete = await sequelizeExecute(
    db.collection('games').findAll({
      attributes: ['_id', 'matchid', 'clubid', 'order', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4', 'delete'],
      where: {
        clubid: clubid,
        matchid: matchid,
      },
      raw: true,
    })
  )
  
  console.log('查询到的对阵数据数量（不含delete条件）:', gamesWithoutDelete ? gamesWithoutDelete.length : 0)
  
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
      games = await sequelizeExecute(
        db.collection('games').findAll({
          attributes: ['_id', 'matchid', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
          where: {
            clubid: clubid,
            matchid: matchid,
            [Op.or]: [
              { delete: false },
              { delete: null }
            ]
          },
          order: [
            ['order', 'DESC']
          ],
          raw: true,
        })
      )
      console.log('使用BOOLEAN条件（包含NULL）查询的结果数量:', games ? games.length : 0)
    } else {
      // INTEGER 类型（包括所有值为 null 的情况），查询条件：delete != 1 或 delete IS NULL
      games = await sequelizeExecute(
        db.collection('games').findAll({
          attributes: ['_id', 'matchid', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
          where: {
            clubid: clubid,
            matchid: matchid,
            [Op.or]: [
              { delete: { [Op.ne]: 1 } },
              { delete: null }
            ]
          },
          order: [
            ['order', 'DESC']
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
        attributes: ['_id', 'matchid', 'score1', 'score2', 'player1', 'player2', 'player3', 'player4'],
        where: {
          clubid: clubid,
          matchid: matchid,
          [Op.or]: [
            { delete: { [Op.ne]: 1 } },
            { delete: null }
          ]
        },
        order: [
          ['order', 'DESC']
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

    let { count, rows } = await sequelizeExecute(
      db.collection('matches').findAndCountAll({
        where: whereCondition,
        order: [['createdate', 'DESC']],
        limit: pageSize,
        offset: (pageNum - 1) * pageSize,
        raw: true
      })
    )

    // 收集所有俱乐部ID
    const clubIds = [...new Set(rows.map(match => match.clubid).filter(Boolean))]
    
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
    rows = rows.map(match => {
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
      console.log('处理后的玩家数据:', players)
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
      // 转换类型：管理台传入的是 'fix'，需要转换为 'fixpair' 用于生成对阵数据
      let matchDataType = matchType
      if (matchType === 'fix') {
        matchDataType = 'fixpair'
      }

      // 根据类型处理选手数组
      let playerArray = players
      if (matchType === 'fix' || matchType === 'group') {
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
      } else {
        // 无固定类型，转换为对象数组
        if (players[0] && typeof players[0] === 'string') {
          playerArray = players.map(id => ({ _id: id }))
        }
      }

      // 生成对阵数据
      const allgames = await createMatchData(matchDataType, playerArray)
      
      if (allgames && allgames.length > 0) {
        // 使用第一个赛制的对阵数据
        const games = allgames[0].data || []
        totalGames = games.length

        // 计算实际玩家数
        if (matchType === 'fix' || matchType === 'group') {
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