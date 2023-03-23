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


// const RECORD_MAX_COUNT = 100

const SERVER_URL_UPLOADS = process.env.SERVER_URL_UPLOADS

// 云函数入口函数
exports.main = async (request, result) => {
  // const wxContext = context;// cloud.getWXContext()
  let event = request.query

  console.log('clubService')
  console.log(event)
  // console.log(cloud.DYNAMIC_CURRENT_ENV)

  let action = event.action
  // console.log("action: " + action)
  let data = null
  if (action == 'join') {
    data = await joinClub(event.clubid, event.userInfo, event.password)
  } else if (action == 'list') {
    let private = await listPrivateClub(event.openid)
    // let public = await listPublicClub( wxContext )
    data = {
      private, //public
    }
  } else if (action == 'create') {
    data = await createClub(event.info, event.userInfo)
  } else if (action == 'update') {
    data = await updateClub(event.info, event.userInfo)
  } else if (action == 'statis') {
    data = await statisUserInClub(event.clubid, event.date, event.minMatchCount)
  } else if (action == 'info') {
    data = await getClubInfo(event.clubid)
  } else if (action == 'listByOwner') {
    data = await listOwnClub(event.openid)
  } else if (action == 'search') {
    data = await searchClub(event.keyword)
  } else if (action == 'checkMatchCount') {
    data = await checkMatchCount(event.clubid)
  } else if (action == 'incMatchCountAllow') {
    data = await incMatchCountAllow(event.clubid)
  }

  console.log('clubService return:')
  console.log(data)

  successResponse(result, {
    data
  })
}

trimClubField = (data) => {
  let item = data
  if (item.dataValues) {
    delete item.dataValues.password
    delete item.dataValues.createdAt
    delete item.dataValues.updatedAt
    delete item.dataValues.delete
  } else {
    delete item.password
    delete item.createdAt
    delete item.updatedAt
    delete item.delete
  }
  return item
}

//加入俱乐部
joinClub = async (clubid, userInfo, password = null) => {
  if( typeof userInfo === 'string') {
    userInfo = JSON.parse(userInfo)
  }
  
  let openid = userInfo.openid
  
  let count = await sequelizeExecute(
    db.collection('players').count({
      where: {
        openid: openid,
        clubid: clubid
      }
    })
  )
  if (count > 0) {
    return ({
      status: "fail",
      errMsg: '已经加入俱乐部!'
    })
  }

  let passwordCheck = await checkPassword(clubid, password)
  if (passwordCheck == false) {
    return ({
      status: "fail",
      errMsg: '密码错误！'
    })
  }

  //add user info
  return addUserToClub(openid, clubid, userInfo)

}

//密码校验
checkPassword = async (clubid, password) => {

  let club = await sequelizeExecute(
    db.collection('clubs').findByPk(clubid, {
      raw: true
    }))

  console.log(club)

  let result = false
  if (club != null) {
    if (club.password == null || club.password.length == 0) {
      result = true
    } else if (club.password == password) {
      result = true
    }
  }
  return result

}

//查找包含关键字的俱乐部
searchClub = async (keyword) => {
  let clubs = await sequelizeExecute(
    db.collection('clubs').findAll({ // findAndCountAll
      where: {
        ...queryLike(keyword, ['shortName', 'wholeName']),
        public: true,
        delete: false
      },
      raw: true
    })
  )

  console.log(clubs)
  clubs = await clubs.map((item, index, array) => {
    // console.log(item.dataValues)
    trimClubField(item)
    return item
  })

  return clubs

}

//读取俱乐部信息
getClubInfo = async (clubid) => {
  let club = await sequelizeExecute(
    db.collection('clubs').findByPk(clubid, {
      raw: true
    })
  )

  console.log(club)

  if (club != null) {
    const logo = club.logo
    // console.log(logo.startWith('http://'))
    if (logo != null && logo.startsWith('cloud://')) {
      console.log('warning: cloud image exist!')
    }

    if (logo != null && logo.length > 0 && !logo.startsWith('http') && !logo.startsWith('cloud://')) {
      club.logo = SERVER_URL_UPLOADS + logo
    }

    let password = club.password
    if (password != null && password.length > 0) {
      club.locked = true
    } else {
      club.locked = false
    }
  }

  trimClubField(club)

  return club
}

// checkMessageSec = async (content) => {
//   let result = await cloud.callFunction({
//     "name": "systemService",
//     "data": {
//       "action": "msgSecCheck",
//       "param": {
//         "content": content,
//       }
//     }
//   })
//   console.log(result)

//   return result
// }

isVipUser = async (openid) => {
  console.log('checking ' + openid + ' isVipUser?')
  let user = await sequelizeExecute(
    db.collection('userconfig').findOne({
      where: {
        openid: openid,
        key: "vip",
      },
      raw: true
    })
  )

  console.log(user)

  return (user && user.value) ? user.value == 'true' : false
}

//查找所有已创建的俱乐部
listOwnClub = async (openid) => {
  let vip = await isVipUser(openid)
  let clubs = await sequelizeExecute(
    db.collection('clubs').findAll({
      where: {
        creator: openid,
        delete: {
          [Op.not]: true
        },
      },
      raw: true
    })
  )

  clubs.forEach(club => {
    trimClubField(club)
  })
  //temp disable create club
  // return {
  //   vip: false
  // }
  return {
    vip: vip,
    clubs: clubs,
  }
}

//公开的俱乐部列表
// listPublicClub = async () => {
//   return await db.collection('clubs')
//     .where({
//       public: true,
//       delete: _.neq(true),
//     })
//     .get()
//     .then(res => {
//       console.log(res)
//       res.data.forEach(function(club) {
//         let password = club.password
//         if (password != null && password.length > 0) {
//           club.locked = true
//         } else {
//           club.locked = false
//         }
//         club.password = null
//       })
//       console.log(res)
//       return res.data
//     })
// }

//参与的俱乐部列表
listPrivateClub = async (openid) => {
  let players = await sequelizeExecute(
    db.collection('players').findAll({
      where: {
        openid: openid
      }
    })
  )

  // console.log(players)
  return loadClubData(openid, players)

}

loadClubData = async (openid, uacs) => {
  let clubids = uacs.map(a => a.clubid)
  console.log(clubids)
  let clubs = await sequelizeExecute(
    db.collection('clubs').findAll({
      where: {
        '_id': clubids,
        delete: {
          [Op.not]: true
        },
      },
      raw: true
    })
  )

  // console.log(clubs)
  let data = clubs.map(a => {
    console.log(a)
    let value = a
    value.owner = (value.creator == openid)

    const logo = value.logo
    // console.log(logo.startWith('http://'))
    if (logo != null && logo.startsWith('cloud://')) {
      console.log('warning: cloud image exist!')
    }

    if (logo != null && logo.length > 0 && !logo.startsWith('http') && !logo.startsWith('cloud://')) {
      value.logo = SERVER_URL_UPLOADS + logo
    }
    // console.log(value.logo)
    return value
  })
  // console.log(data)
  // .addFields({
  //   owner: $.eq(['$creator', openid]),
  // })
  return data

}

checkOwnedClub = async (openid) => {
  let vip = await isVipUser(openid)
  if (vip) {
    return false
  }

  let clubs = await sequelizeExecute(
    db.collection('clubs').findAll({
      where: {
        creator: openid,
        delete: {
          [Op.not]: true
        },
      },
      raw: true
    })
  )

  console.log(clubs)
  return (clubs.length > 0)
}

//创建俱乐部
createClub = async (info, userInfo) => {
  if (typeof userInfo === 'string') {
    userInfo = JSON.parse(userInfo)
  }
  if (typeof info === 'string') {
    info = JSON.parse(info)
  }
  // console.log(info)
  let openid = userInfo.openid
  let exist = await checkOwnedClub(openid)
  if (exist) {
    return {
      errCode: 1,
      errMsg: "普通用户仅可以创建一个俱乐部"
    }
  }

  // let secCheckContent = info.wholeName + info.shortName
  // let secCheck = await checkMessageSec(secCheckContent)
  // let result = secCheck.result.data
  // if (result.errCode != 0) {
  //   return {
  //     errCode: result.errCode,
  //     errMsg: result.errMsg,
  //   }
  // }

  let dt = db.serverDate()

  let logo = info.logo
  if (logo != null && logo.startsWith(SERVER_URL_UPLOADS)) {
    logo = logo.substring(SERVER_URL_UPLOADS.length)
    console.log('trim logo to: ' + logo)
  }

  let club = await sequelizeExecute(
    db.collection('clubs').create({
      creator: openid,
      password: info.password,
      shortName: info.shortName,
      wholeName: info.wholeName,
      logo: logo,
      vip: false,
      public: info.public,
      delete: false,
      createDate: dt
    }, {
      raw: true
    })
  )

  console.log(club)

  if (club instanceof db.clubs) {
    let clubid = club._id
    // let dataTableRes = await createClubGameDataTable(clubid, info)
    await addUserToClub(openid, clubid, userInfo)

    return club
  } else {
    return null
  }

}

addUserToClub = async (openid, clubid, userInfo) => {
  let dt = db.serverDate()
  let player = await sequelizeExecute(
    db.collection('players').create({
      openid: openid,
      clubid: clubid,
      enable: true,
      order: 1,
      name: userInfo.name,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      createDate: dt
    },{
      raw: true
    })
  )

  console.log(player)

  if (player instanceof db.players) {
    return {
      _id: player._id,
      openid: openid,
      clubid: clubid,
      createDate: dt
    }
  }

  // todo
  return {
    errMsg: res.errMsg
  }
}

//更新俱乐部信息
updateClub = async (info, userInfo) => {
  let dt = db.serverDate()
  if (typeof info == 'string') {
    info = JSON.parse(info)
  }
  if (typeof userInfo == 'string') {
    userInfo = JSON.parse(userInfo)
  }
  let openid = userInfo.openid

  let clubs = await sequelizeExecute(
    db.collection('clubs').findAll({
      where: {
        creator: openid,
        delete: {
          [Op.not]: true
        }
      },
      raw: true
    })
  )

  console.log(clubs)

  let exist = (clubs.length > 0)

  if (!exist) {
    return {
      errCode: 1,
      errMsg: "错误：未找到俱乐部"
    }
  }

  // let secCheckContent = info.wholeName + info.shortName
  // let secCheck = await checkMessageSec(secCheckContent)
  // let result = secCheck.result.data
  // if (result.errCode != 0) {
  //   return {
  //     errCode: result.errCode,
  //     errMsg: result.errMsg,
  //   }
  // }

  let logo = info.logo
  if (logo != null && logo.startsWith(SERVER_URL_UPLOADS)) {
    logo = logo.substring(SERVER_URL_UPLOADS.length)
    console.log('trim logo to: ' + logo)
  }

  let updated = await sequelizeExecute(
    db.collection('clubs').update({
      password: info.password,
      shortName: info.shortName,
      wholeName: info.wholeName,
      logo: logo,
      public: info.public
    }, {
      where: {
        _id: info.clubid
      }
    })
  )

  console.log(updated)

  return {
    updated
  }
}


//统计俱乐部成员胜率
statisUserInClub = async (clubid, date, minMatchCount) => {
  if (typeof date === 'string') {
    date = JSON.parse(date)
  }

  if (minMatchCount == null) {
    minMatchCount = 0
  }

  let players = await sequelizeExecute(
    db.collection('players').findAll({
      where: {
        clubid: clubid
      },
      order: [
        ['order', 'DESC']
      ],
      raw: true
    })
  )

  console.log(players)
  // let players = res.data
  let matches = await listClubMatches(clubid, date)
  let games = await listClubAllGames(clubid, date)
  let result = startStatisticPlayers(players, matches, games)
  let playerFiltered = filterPlayerMatchCount(players, matches, games, minMatchCount)
  playerFiltered.sort(billboardOrder)
  let data = playerFiltered
  return data

}

//获取该俱乐部某时间段内所有比赛
listClubMatches = async (clubid, date) => {
  let condition = {
    clubid: clubid,
    delete: {
      [Op.not]: true
    },
  }

  if (date) {
    let from = new Date(date.from + ' 00:00:00')
    let to = new Date(date.to + ' 23:59:59')

    condition.createDate = {
      [Op.gte]: from,
      [Op.lte]: to
    }
  }

  let clubMatches = await sequelizeExecute(
    db.collection('matches').findAll({
      where: condition,
      raw: true
    })
  )

  return clubMatches
}

//获取该俱乐部所有场次
listClubAllGames = async (clubid, date) => {
  let condition = {
    clubid: clubid,
    delete: {
      [Op.not]: true
    },
  }

  if (date) {
    let from = new Date(date.from + ' 00:00:00')
    let to = new Date(date.to + ' 23:59:59')

    condition.createDate = {
      [Op.gte]: from,
      [Op.lte]: to
    }
  }

  let games = await sequelizeExecute(
    db.collection('games').findAll({
      where: condition,
      raw: true
    })
  )

  console.log("listClubAllGames: " + clubid)
  console.log(games)

  return games
}

//开始统计
startStatisticPlayers = (players, matches, games) => {
  //start for each game
  statisticWinAndLost(players, games)
  statisticPigAndCrown(players, matches, games)
}

//统计胜场数和负场数
statisticWinAndLost = (players, games) => {
  //clear
  players.forEach(function(player) {
    player.winCount = 0
    player.lostCount = 0
    player.pigCount = 0
    player.crownCount = 0
    player.total = 0
    player.delta = 0
    console.log(player)

  })

  games.forEach(function(game) {

    let score1 = game.score1
    let score2 = game.score2
    if (score1 < 0 || score2 < 0) {
      return
    }

    let delta = score1 - score2

    let player1 = findPlayerById(players, game.player1)
    let player2 = findPlayerById(players, game.player2)
    let player3 = findPlayerById(players, game.player3)
    let player4 = findPlayerById(players, game.player4)

    player1.delta += delta
    player2.delta += delta
    player3.delta -= delta
    player4.delta -= delta

    player1.total += score1
    player2.total += score1
    player3.total += score2
    player4.total += score2

    if (delta > 0) {
      player1.winCount++
      player2.winCount++
      player3.lostCount++
      player4.lostCount++
    } else if (delta < 0) {
      player1.lostCount++
      player2.lostCount++
      player3.winCount++
      player4.winCount++
    } else {
      //draw game
    }
  })
}

//统计猪头和皇冠
statisticPigAndCrown = (players, matches, games) => {
  matches.forEach(function(match) {

    let gameArray = getGamesInMatch(match, games)
    if (gameArray.length == 0) {
      return
    }
    //debug
    // if( gameArray.length != match.total){
    //   console.log("match: " + match.createDate)
    //   console.log("match.total: " + match.total)
    //   console.log("game array: " + gameArray.length)
    // }

    if (!isAllGamesDone(gameArray)) {
      return
    }
    let playersClone = JSON.parse(JSON.stringify(players))
    let playerArray = getPlayersInMatch(gameArray, playersClone)
    statisticWinAndLost(playerArray, gameArray)

    //sort
    playerArray.sort(comparePlayer)
    let first = playerArray[0]
    let last = playerArray[playerArray.length - 1]
    let realFirst = findPlayerById(players, first._id)
    let realLast = findPlayerById(players, last._id)
    realFirst.crownCount++
    realLast.pigCount++
    if (match.type && match.type == 'fixpair') {
      let second = playerArray[1]
      let lastSecond = playerArray[playerArray.length - 2]
      let realSecond = findPlayerById(players, second._id)
      let realLastSecond = findPlayerById(players, lastSecond._id)
      realSecond.crownCount++
      realLastSecond.pigCount++
    }
  })
}

isAllGamesDone = (games) => {
  let done = true
  games.forEach(function(game) {
    if (done == false)
      return false
    if ((game.score1 < 0) || (games.score2 < 0)) {
      done = false
    }
  })
  return done
}

//过滤最少比赛次数
filterPlayerMatchCount = (players, matches, games, minMatchCount) => {
  if (minMatchCount < 1) {
    return players
  }

  players.forEach(function(player) {
    player.matchCount = 0
  })

  matches.forEach(function(match) {

    let gameArray = getGamesInMatch(match, games)
    if (gameArray.length == 0) {
      return
    }

    if (!isAllGamesDone(gameArray)) {
      return
    }

    let playersClone = JSON.parse(JSON.stringify(players))
    let playerArray = getPlayersInMatch(gameArray, playersClone)
    playerArray.forEach(function(playerA) {
      let player = findPlayerById(players, playerA._id)
      if (player != null)
        player.matchCount++
    })

  })

  let playersReturn = []
  players.forEach(function(player, index) {
    if (player.matchCount >= minMatchCount) {
      playersReturn.push(player)
    } else {
      console.log("remove: " + player.name)
    }
  })

  return playersReturn

}

//获取该比赛所有场次
getGamesInMatch = (match, games) => {
  let gameArray = []
  try {
    games.forEach(function(game) {
      if (game.matchid == match._id) {
        gameArray.push(game)
      }
    })
  } catch (e) {
    console.log(e)
  }
  return gameArray

}

//获取该比赛所有人员
getPlayersInMatch = (games, players) => {
  let playerArray = []
  games.forEach(function(game) {
    let fourPlayersId = [game.player1, game.player2, game.player3, game.player4]
    fourPlayersId.forEach(function(id) {
      let already = findPlayerById(playerArray, id)
      if (already == null) {
        let player = findPlayerById(players, id)
        playerArray.push(player)
      }
    })
  })
  return playerArray
}

//根据玩家id查找
findPlayerById = (players, id) => {
  return players.find(
    function(player, index) {
      return player._id == id
    }
  )
}

//按比分排序
comparePlayer = (player1, player2) => {
  //比较胜率
  let rate1 = Math.round((player1.winCount / (player1.winCount + player1.lostCount)) * 100) * 100
  let rate2 = Math.round((player2.winCount / (player2.winCount + player2.lostCount)) * 100) * 100
  if (isNaN(rate1)) {
    rate1 = 0
  }
  if (isNaN(rate2)) {
    rate2 = 0
  }
  if (rate1 != rate2) {
    return rate2 - rate1
  }

  //比较净胜分
  let delta1 = player1.delta
  let delta2 = player2.delta
  if (delta1 != delta2) {
    return delta2 - delta1
  }

  //比较总得分
  let total1 = player1.total
  let total2 = player2.total
  if (total1 != total2) {
    return total2 - total1
  }

  return 0
}

//按参加次数排序
billboardOrder = (player1, player2) => {
  //比较总参与局数
  let count1 = (player1.winCount + player1.lostCount)
  let count2 = (player2.winCount + player2.lostCount)
  if (count1 != count2) {
    return count2 - count1
  }

  return comparePlayer(player1, player2)
}

checkMatchCount = async (clubid) => {
  let data = await sequelizeExecute(
    db.collection('clubs').findByPk(clubid)
  )

  console.log(data)

  // if (data && data.vip) {
  //   return false
  // }

  let maxMatchCountAllow = 10
  if (data && data.maxMatchAllow) {
    maxMatchCountAllow = data.maxMatchAllow
  }

  let currentMatchCount = await sequelizeExecute(
    db.collection('matches').count({
      where: {
        clubid: clubid,
        delete: {
          [Op.not]: true
        },
      }
    })
  )

  console.log(currentMatchCount)

  return (currentMatchCount > maxMatchCountAllow)
}

// TODO: not tested
incMatchCountAllow = async (clubid) => {
  let currentMatchCount = await sequelizeExecute(
    db.collection('matches').count({
      where: {
        clubid: clubid,
        delete: {
          [Op.not]: true
        },
      }
    })
  )

  // .then(res => {
  //   if (res.total) {
  //     return res.total
  //   } else {
  //     return 0
  //   }
  // })

  let updated = await sequelizeExecute(
    db.collection('clubs')
    .doc(clubid)
    .update({
      // id: _.inc(1),
      maxMatchAllow: currentMatchCount + 10,
    }, {
      where: {
        _id: clubid
      }
    })
  )
  return {
    updated
  }

  // .then(res => {
  //   console.log(res)
  //   if (res.stats && res.stats.updated == 1) {
  //     return {
  //       success: true
  //     }
  //   }
  //   return {
  //     success: false,
  //     errMsg: res.errMsg
  //   }
  // })
}

