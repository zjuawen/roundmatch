// 云函数入口文件
const cloud = require('wx-server-sdk')

var debug = true; // false;

const env = debug ? 'test-roundmatch' : "roundmatch";
cloud.init({
  env: env
  // env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();
const $ = db.command.aggregate;

const RECORD_MAX_COUNT = 100;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  console.log("current env: " + env);

  let action = event.action;
  let data;
  if (action == 'login') {
    data = await saveUserData(wxContext);
  } else if (action == 'detail') {
    data = await readUserDetail(wxContext);
  } else if( action == 'list') {
    let pageNum = (event.pageNum==null)? 1: event.pageNum;
    let pageSize = (event.pageSize==null)? 10: event.pageSize;
    data = await listUserInClub(event.clubid, pageNum, pageSize);
  } else if( action == 'listAll') {
    let pageNum = 1;
    let pageSize = RECORD_MAX_COUNT;
    data = await listUserInClub(event.clubid, pageNum, pageSize);
  } else if( action == 'search') {
    data = await searchUserInClub(event.clubid, event.keyword);
  } else if( action == 'update') {
    let userInfo = event.userInfo;
    data = await updateUserInfo(wxContext.OPENID, userInfo);
  } else if( action == 'saveconfig') {
    let key = event.key;
    let value = event.value;
    data = await updateUserConfig(wxContext.OPENID, key, value);
  } else if( action == 'readconfig') {
    let key = event.key;
    data = await readUserConfig(wxContext.OPENID, key);
  // } else if( action == 'info') {
  //   let key = event.key;
  //   data = await readPlayerInfo(event.openid);
  } else if( action == 'isVip'){
    data = await isUserVip(wxContext.OPENID);
  }


  return {
    data,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

//保存用户数据
saveUserData = async (context) => {
  return await db.collection('users')
  	.where({
  		openid: context.OPENID
  	})
  	.get()
  	.then(res => {
  		console.log(res);
  		if( res.data.length > 0){
  			return res.data[0];
  		} 
  		//add user info
  		return addUserData(context);
  	})
}

readUserDetail = async (context) => {
  let dt = db.serverDate();
  return await db.collection('users')
    .where({
      openid: context.OPENID
    })
    .get()
    .then(res => {
      console.log(res);
      if( res.data.length > 0){
        return res.data[0];
      } 
      else {
        return {};
      }
    })
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
  		if( res.errMsg == "collection.add:ok"){
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

//列出俱乐部成员
listUserInClub = async (clubid, pageNum, pageSize) => {
   return await db.collection('players')
    .where({
      clubid: clubid,
    })
    .orderBy('order', 'desc')
    .skip(pageSize*(pageNum-1))
    .limit(pageSize)
    .get()
    .then(res => {
      console.log(res);
      // return res.data;
      let data = res.data;
      return data;
    })
}

//列出俱乐部成员
searchUserInClub = async (clubid, keyword) => {
  let regex = '.*' + keyword;
  return await db.collection('players')
    .aggregate()
    .match({
      clubid: clubid,
      name: {
        $regex: regex
      },
    })
    .sort({
      'order': -1
    })
    .end()
    .then(res => {
      console.log(res);
      // return res.data;
      let data = res.list;
      return data;
    })
}

//更新用户微信信息
updateUserInfo = async (openid, userInfo) => {
  let dt = db.serverDate();
  return await db.collection('users')
    .where({
      openid: openid
    })
    .update({
      data: {
        name: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
        country: userInfo.country,
        province: userInfo.province,
        city: userInfo.city,
        createDate: dt
      }
      // data:{
      //   avatarUrl: userInfo.avatarUrl,
      // }
    })
    .then(res => {
      console.log(res);
      // return res.data;
      let data = res.errMsg;
      return data;
    })
}

//读取用户配置
readUserConfig = async (openid, key) => {
  let doc = await db.collection('userconfig')
    .where({
      openid: openid,
      key: key,
    })
    .get()
    .then(res => {
      return res.data
    })

  if( doc != null && doc.length > 0) {
    return doc[0].value;
  } 
  return null;
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

  if( doc != null && doc.length > 0) {
    return doc[0].value;
  } 
  return null;
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

  if( doc != null && doc.length > 0) {
    return await db.collection('userconfig')
      .doc(doc[0]._id)
      .update({
        data:{
          value: value,
        }
      })
      .then(res => {
        console.log(res);
        // return res.data;
        let data = res.errMsg;
        return data;
      })
  } else {
    return await db.collection('userconfig')
      .add({
        data:{
          openid: openid,
          key: key,
          value: value,
        }
      })
      .then(res => {
        console.log(res);
        // return res.data;
        let data = res.errMsg;
        return data;
      })
  }
}

isUserVip = async (openid) => {
  let vip = await readUserConfig(openid, 'vip');
  if( vip == null){
    vip = false;
  }
  return vip;
}




