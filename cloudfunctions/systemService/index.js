// 云函数入口文件
const cloud = require('wx-server-sdk')

var debug = false;//true;

const env = debug ? 'test-roundmatch' : "roundmatch";
cloud.init({
  env: env
  // env: cloud.DYNAMIC_CURRENT_ENV
})

var rp = require("request-promise")
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
 const wxContext = cloud.getWXContext()

  console.log("current env: " + env);
  // console.log(cloud.DYNAMIC_CURRENT_ENV);

  let action = event.action;
  let data;
  if (action == 'getNotice') {
    data = await getNotice( wxContext.OPENID, event.param);
  } else if (action == 'msgSecCheck') {
    data = await msgSecCheck( wxContext.OPENID, event.param);
  }

  return {
    data,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

//检查消息是否合法
msgSecCheck = async (openid, param) => {

  let access_token = await readAccessToken();

  const { content } = param;
  try {
    const res = await cloud.openapi.security.msgSecCheck({
      "access_token" : access_token, 
      "content": content
    })
    return res;
  } catch (err) {
    return err;
  }
}

//读取AccessToken
readAccessToken = async () => {
  let key = 'access_token';
  let res = await db.collection('systemconfig')
    .where({
      key: key,
    })
    .limit(1)
    .get()
    .then(async res => {
      console.log(res);
      let data = res.data;
      let valid = data && (data.length > 0);
      if( valid ){
        let dt = new Date();
        if( dt > data[0].expireTime ){
          valid = false;
        }
      }
      if( !valid ){
        res = await requestAccessToken();
        if( res ){
          res = JSON.parse(res);
          let update = await updateAccessToken(res);
          console.log(update);
        }
      }

      return res.access_token;
    })
  
}

//更新AccessToken和有效期
updateAccessToken = async ( data ) => {
  if( !data ){
    console.log("data null when updateAccessToken");
    return null;
  }

  let newExpiredTime = db.serverDate({
      offset: (data.expires_in - 5* 60) * 1000,
  });

  let key = 'access_token';
  let exist = await db.collection('systemconfig')
    .where({
      key: key,
    })
    .get()
    .then(async res => {
      console.log(res);
      return res.data && (res.data.length > 0);
    })
  if( exist ){
    return await db.collection('systemconfig')
      .where({
        key: key,
      })
      .update({
        data: {
          access_token: data.access_token,
          expireTime: newExpiredTime
        }
      })
      .then( async res => {
        return res;
      })
  } else {
    return await db.collection('systemconfig')
      .add({
        data: {
          key: key,
          access_token: data.access_token,
          expireTime: newExpiredTime
        }
      })
      .then( async res => {
        return res;
      })
  }
}

//从微信服务器申请新的msgSecCheck AccessToken
requestAccessToken = async () => {

  let url = "https://api.weixin.qq.com/cgi-bin/token?"
    + "grant_type=client_credential"
    + "&appid=wxf3f6462195815590" 
    + "&secret=7755e73cf0d3bd866eb0a15b4f2f4c09";

  return await rp(url)
    .then(res => {
      return res;
    })
    .catch( err => {
      console.log(err);
    });
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