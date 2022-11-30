const db = require("../models")
const Op = require("sequelize").Op

// wechat api
const wechat = require("./wechat")

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

  console.log('userService')
  console.log(event)
  // console.log(cloud.DYNAMIC_CURRENT_ENV)

  let action = event.action
  // console.log("action: " + action)
  let data
  if (action == 'login') {
    data = await login(event.code)
  } else if (action == 'detail') {
    data = await readUserDetail(wxContext)
  } else if (action == 'list') {
    let pageNum = (event.pageNum == null) ? 1 : event.pageNum
    let pageSize = (event.pageSize == null) ? 10 : event.pageSize
    data = await listUserInClub(event.clubid, pageNum, pageSize)
  } else if (action == 'listAll') {
    let pageNum = 1
    let pageSize = RECORD_MAX_COUNT
    data = await listUserInClub(event.clubid, pageNum, pageSize)
  } else if (action == 'search') {
    data = await searchUserInClub(event.clubid, event.keyword)
  } else if (action == 'update') {
    let openid = event.openid
    let userInfo = event.userInfo
    data = await upSertUserInfo(openid, userInfo)
  } else if (action == 'saveconfig') {
    let key = event.key
    let value = event.value
    data = await updateUserConfig(event.openid, key, value)
  } else if (action == 'readconfig') {
    let key = event.key
    data = await readUserConfig(event.openid, key)
    // } else if( action == 'info') {
    //   let key = event.key
    //   data = await readPlayerInfo(event.openid)
  } else if (action == 'isVip') {
    data = await isUserVip(event.openid)
  }

  console.log('userService return:')
  console.log(data)

  successResponse(result, {
    data
  })
}

// 用户登录
login = async (code) => {
  let code2Session = await wechat.getOpenid(code)
  console.log(code2Session)
  let openid = code2Session.openid

  let users = await sequelizeExecute(
    db.collection('users').findOne({
      where: {
        openid: openid
      }
    })
  )

  console.log(users)

  if (res && res.dataValues && res.dataValues.name) {
    return {
      openid,
      userInfo: res.dataValues
    }
  } else {
    if (res == null) {
      await addUserInfo(openid)
    }
    return {
      openid
    }
  }

}


upSertUserInfo = async (openid, userInfo) => {
  if (openid == null) {
    return null
  }

  // console.log(typeof(userInfo) )
  if (typeof userInfo === 'string') {
    userInfo = JSON.parse(userInfo)
  }

  let obj = await sequelizeExecute(
    db.collection('users').findOne({
      where: {
        openid: openid
      }
    })
  )


  // console.log(obj)

  if (obj != null) {
    console.log('updateUserInfo')
    return await updateUserInfo(openid, userInfo)
  } else {
    console.log('addUserInfo')
    return await addUserInfo(openid, userInfo)
  }

}

//更新用户微信信息
updateUserInfo = async (openid, userInfo) => {
  console.log(userInfo)
  // let dt = new Date()
  let users = await sequelizeExecute(
    db.collection('users').update({
      name: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      country: userInfo.country,
      province: userInfo.province,
      city: userInfo.city,
      // createDate: dt
    }, {
      where: {
        openid: openid
      },
    })
  )

  console.log(users)
  // let count = await updatePlayerInfo(openid, userInfo)

  if (users[0] === 1) {
    return {
      count: 1
    }
  } else {
    return null
  }

}

// 添加用户微信信息
addUserInfo = async (openid, userInfo) => {
  // console.log(userInfo)
  let dt = new Date()
  console.log(dt)
  if (userInfo == null) {
    userInfo = {}
  }

  let user = await sequelizeExecute(
    db.collection('users').create({
      openid: openid,
      name: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      country: userInfo.country,
      province: userInfo.province,
      city: userInfo.city,
      createDate: dt
    })
  )

  console.log(user)

  // return res.data
  let data = user.dataValues
  // let count = await updatePlayerInfo(openid, userInfo)
  return {
    msg: data,
    // count: count
  }

}

updatePlayerInfo = async (openid, userInfo) => {
  let dt = db.serverDate()
  let res = await sequelizeExecute(
    db.collection('players').update({
      name: userInfo.name,
      avatarUrl: userInfo.avatarUrl,
      gender: userInfo.gender,
      updatedDate: dt
    }, {
      where: {
        openid: openid
      }
    })
  )

  console.log(res)
  // return res.data
  let count = res.stats.updated
  return count
}

//读取用户配置
readUserConfig = async (openid, key) => {
  let doc = await sequelizeExecute(
    db.collection('userconfig').findOne({
      where: {
        openid: openid,
        key: key,
      }
    })
  )
  console.log(doc)
  if (doc != null) {
    return doc.value
  }
  return null
}


//读取指定用户信息
readPlayerInfo = async (openid) => {
  let doc = await db.collection('players')
    .where({
      openid: openid,
      key: key,
    })
    .get()
    .then(res => {
      return res.data
    })

  if (doc != null && doc.length > 0) {
    return doc[0].value
  }
  return null
}

//更新用户配置
updateUserConfig = async (openid, key, value) => {
  let doc = await db.collection('userconfig')
    .where({
      openid: openid,
      key: key,
    })
    .get()
    .then(res => {
      return res.data
    })

  if (doc != null && doc.length > 0) {
    return await db.collection('userconfig')
      .doc(doc[0]._id)
      .update({
        data: {
          value: value,
        }
      })
      .then(res => {
        console.log(res)
        // return res.data
        let data = res.errMsg
        return data
      })
  } else {
    return await db.collection('userconfig')
      .add({
        data: {
          openid: openid,
          key: key,
          value: value,
        }
      })
      .then(res => {
        console.log(res)
        // return res.data
        let data = res.errMsg
        return data
      })
  }
}

isUserVip = async (openid) => {
  console.log('user ' + openid + ' isVip?')
  let vip = await readUserConfig(openid, 'vip')
  if (vip == null) {
    vip = false
  }
  return vip
}

readUserDetail = async (context) => {
  let dt = db.serverDate()
  return await db.collection('users')
    .where({
      openid: context.OPENID
    })
    .get()
    .then(res => {
      console.log(res)
      if (res.data.length > 0) {
        return res.data[0]
      } else {
        return {}
      }
    })
}

//列出俱乐部成员
listUserInClub = async (clubid, pageNum, pageSize) => {
  let players = await sequelizeExecute(
    db.collection('players').findAll({
      where: {
        clubid: clubid,
      },
      order: [
        ['order', 'DESC']
      ],
      offset: pageSize * (pageNum - 1),
      limit: pageSize - 0,
      raw: true
    })
  )

  console.log(players)

  return players
}

//列出俱乐部成员
searchUserInClub = async (clubid, keyword) => {
  // let regex = '.*' + keyword
  let players = await sequelizeExecute(
    db.collection('players').findAll({
      where: {
        clubid: clubid,
        name: {
          [OP.substring]: keyword
        }
      },
      order: [
        ['order', 'DESC']
      ]
    })
  )

  console.log(players)

  return players
}




