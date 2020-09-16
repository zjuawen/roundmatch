// 云函数入口文件
const cloud = require('wx-server-sdk')

var debug = true;

const env = debug ? 'test-roundmatch' : "roundmatch";
cloud.init({
  env: env
  // env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
 const wxContext = cloud.getWXContext()

  console.log("current env: " + env);
  // console.log(cloud.DYNAMIC_CURRENT_ENV);

  let action = event.action;
  let data;
  if (action == 'getNotice') {
    data = await getNotice( wxContext.OPENID, event.param);
  } 

  return {
    data,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

//读取公告信息
getNotice = async (openid, param) => {
  return await db.collection('notices')
    .get()
    .then( async res => {
      console.log(res);
      let data = res.data;
      return data;
    });
}