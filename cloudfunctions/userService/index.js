// 云函数入口文件
const cloud = require('wx-server-sdk')

// const env = 'test-roundmatch';
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
  // env: env
})
const db = cloud.database();
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let action = event.action;
  let data;
  if (action == 'login') {
	   data = await saveUserData(wxContext);
  } else if( action == 'list') {
     data = await listUserInClub(event.clubid);
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
listUserInClub = async (clubid) => {
  return await db.collection('players')
    .where({
      clubid: clubid
    })
    .get()
    .then(res => {
      console.log(res);
      return res.data;
    })
}




