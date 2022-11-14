const db = require("../models");
const Op = require("sequelize").Op;

// wechat api
const wechat = require("./wechat");

// utils
const paginate = require("../utils/util").paginate;
const md5String = require("../utils/util").md5String;
const queryLike = require("../utils/util").queryLike;
const validateSession = require("../utils/util").validateSession;
const sequelizeExecute = require("../utils/util").sequelizeExecute;
const successResponse = require("../utils/util").successResponse;
const errorResponse = require("../utils/util").errorResponse;


// 云函数入口函数
exports.main = async (request, result) => {
  // const wxContext = context;// cloud.getWXContext()
  let event = request.query;

  console.log(event);
  // console.log(cloud.DYNAMIC_CURRENT_ENV);

  let action = event.action;
  // console.log("action: " + action);
  let data;
  if (action == 'login') {
    data = await login(event.code);
  } else if (action == 'save') {
    data = await saveUserData(event.code);
  } else if (action == 'detail') {
    data = await readUserDetail(wxContext);
  } else if (action == 'list') {
    let pageNum = (event.pageNum == null) ? 1 : event.pageNum;
    let pageSize = (event.pageSize == null) ? 10 : event.pageSize;
    data = await listUserInClub(event.clubid, pageNum, pageSize);
  } else if (action == 'listAll') {
    let pageNum = 1;
    let pageSize = RECORD_MAX_COUNT;
    data = await listUserInClub(event.clubid, pageNum, pageSize);
  } else if (action == 'search') {
    data = await searchUserInClub(event.clubid, event.keyword);
  } else if (action == 'update') {
    let userInfo = event.userInfo;
    data = await updateUserInfo(wxContext.OPENID, userInfo);
  } else if (action == 'saveconfig') {
    let key = event.key;
    let value = event.value;
    data = await updateUserConfig(wxContext.OPENID, key, value);
  } else if (action == 'readconfig') {
    let key = event.key;
    data = await readUserConfig(wxContext.OPENID, key);
    // } else if( action == 'info') {
    //   let key = event.key;
    //   data = await readPlayerInfo(event.openid);
  } else if (action == 'isVip') {
    data = await isUserVip(wxContext.OPENID);
  }

  // console.log(data);
  successResponse(result, {
    data
  });
  // return {
  //   data,
  //   // openid: wxContext.OPENID,
  //   // appid: wxContext.APPID,
  //   // unionid: wxContext.UNIONID,
  // }
}

// 用户登录
login = async (code) => {
  let userInfo = await wechat.getOpenid(code);
  console.log(userInfo);
  let openid = userInfo.openid;

  return await sequelizeExecute(
    db.collection('users').findOne({
      where: {
        openid: openid
      }
    }),
    (res) => {
      console.log(res);
      if (res && res.data.length > 0) {
        return res.data[0];
      } else {
        return null;
      }
      //add user info
      // return addUserData(context);
    });
}

//添加用户信息
addUserData = async (context) => {
  let dt = db.serverDate();
  return await db.collection('users')
    .add({
      data: {
        appid: context.APPID,
        openid: context.OPENID,
        unionid: context.UNIONID,
        createDate: dt
      }
    })
    .then(res => {
      console.log(res);
      if (res.errMsg == "collection.add:ok") {
        return {
          _id: res._id,
          appid: context.APPID,
          openid: context.OPENID,
          unionid: context.UNIONID,
          createDate: dt
        };
      }
    })
}