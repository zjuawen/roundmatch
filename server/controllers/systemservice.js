const db = require("../models")
const Op = require("sequelize").Op
// utils
const paginate = require("../utils/util").paginate
const md5String = require("../utils/util").md5String
const queryLike = require("../utils/util").queryLike
const validateSession = require("../utils/util").validateSession
const sequelizeExecuteSync = require("../utils/util").sequelizeExecuteSync
const successResponse = require("../utils/util").successResponse
const errorResponse = require("../utils/util").errorResponse


// 云函数入口函数
exports.main = async (request, result) => {
  // const wxContext = context// cloud.getWXContext()
  let event = request.query

  console.log('systemService')
  console.log(event)
  // console.log(cloud.DYNAMIC_CURRENT_ENV)

  let action = event.action
  let data
  if (action == 'notices') {
    data = await getNotices(event.openid, event.page)
  } else if (action == 'msgSecCheck') {
    data = await msgSecCheck(wxContext.OPENID, event.param)
  } else if (action == 'imgSecCheck') {
    data = await imgSecCheck(event)
  } else if (action == 'auditing') {
    data = isAuditing()
  }

  // console.log(data)
  successResponse(result, {
    data
  })
  // return {
  //   data,
  //   // openid: wxContext.OPENID,
  //   // appid: wxContext.APPID,
  //   // unionid: wxContext.UNIONID,
  // }
}

isAuditing = () => {
  return {
    auditing: false
  }
}

getNotices = async (openid, page) => {
  let notices = await sequelizeExecuteSync(
    db.collection('notices').findAll({
      where: {
        page: page,
        enable: {
          [Op.not]: false
        }
      },
      attributes: {
        exclude: ['enable', 'page', 'createDate', 'updateTime']
      },
      order: [
        ['order', 'DESC']
      ],
      raw: true
    })
  )

  console.log(notices)

  let data = notices.map(a => {
    // console.log(a)
    a.title = a.content
    delete a.content
    // console.log(a)
    return a
  })
  return data

}