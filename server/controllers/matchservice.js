const db = require("../models");
const Op = require("sequelize").Op;
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

  console.log('clubservice');
  console.log(event);
  // console.log(cloud.DYNAMIC_CURRENT_ENV);

  let action = event.action;
  // console.log("action: " + action);
  let data;
  if (action == 'join') {
    data = await joinClub(wxContext, event);
  } else if (action == 'list') {
    let private = await listPrivateClub(event.openid);
    // let public = await listPublicClub( wxContext );
    data = {
      private, //public
    }
  } else if (action == 'create') {
    data = await createClub(wxContext, event.info, event.userInfo);
  } else if (action == 'update') {
    data = await updateClub(wxContext, event.info, event.userInfo);
  } else if (action == 'statis') {
    data = await statisUserInClub(event.clubid, event.date, event.minMatchCount);
  } else if (action == 'info') {
    data = await getClubInfo(event.clubid);
  } else if (action == 'listByOwner') {
    data = await listOwnClub(event.openid);
  } else if (action == 'search') {
    data = await searchClub(event.keyword);
  } else if (action == 'checkMatchCount') {
    data = await checkMatchCount(event.clubid);
  } else if (action == 'incMatchCountAllow') {
    data = await incMatchCountAllow(event.clubid);
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