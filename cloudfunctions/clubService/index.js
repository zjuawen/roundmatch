// 云函数入口文件
const cloud = require('wx-server-sdk')

// const env = 'test-roundmatch';
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
  // env: env
})
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let action = event.action;
  let data;
  if (action == 'join') {
    data = await joinClub( wxContext, event.clubid);
  } else if (action == 'list') {
    let private = await listPrivateClub( wxContext );
    let public = await listPublicClub( wxContext );
    data = {
      private, public
    }
  }  else if (action == 'create') {
    data = await createClub(wxContext, event.info);
  }

  return {
    data,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}


//公开的俱乐部列表
listPublicClub = async (wxContext) => {
  return await db.collection('clubs')
    .where({
      public: true
    })
    .get()
    .then(res => {
      console.log(res);
      return res.data;
    });
}

//参与的俱乐部列表
listPrivateClub = async (wxContext) => {
	return await db.collection('users_and_clubs')
    .where({
  		openid: wxContext.OPENID
  	})
  	.get()
  	.then(res => {
  		console.log(res);
  		return loadClubData(res.data);
  	})
}

loadClubData = async (uacs) => {
	let clubids = uacs.map(a=> a.clubid);
	return await db.collection('clubs')
		.where({
			_id: _.in(clubids)
		})
		.get()
  	.then(res => {
      console.log(res);
      return res.data;
  	});
}


//加入俱乐部
joinClub = async (wxContext, clubid) => {
  return await db.collection('users_and_clubs')
    .where({
  		openid: wxContext.OPENID,
  		clubid: clubid
  	})
  	.get()
  	.then(res => {
  		console.log(res);
  		if( res.data.length > 0){
  			return res.data[0];
  		} 
  		//add user info
  		return addUserToClubs(wxContext.OPENID, clubid);
  	})
}

addUserToClubs = async (openid, clubid) => {
	let dt = db.serverDate();
  return await db.collection('users_and_clubs')
  	.add({
  		data: {
  			openid: openid,
  			clubid: clubid,
  			createDate: dt
  		}
  	})
  	.then(res => {
  		console.log(res);
  		if( res.errMsg == "collection.add:ok"){
  			return {
  				_id: res._id,
  				openid: openid,
	  			clubid: clubid,
	  			createDate: dt
	  		};
  		}
  	})
}

//创建俱乐部
createClub = async (wxContext, info) => {
  let dt = db.serverDate();
  return await db.collection('clubs')
    .add({
      data: {
        creator: wxContext.OPENID,
        password: info.password,
        shortName: info.shortName,
        wholeName: info.wholeName,
        public: info.public,
        createDate: dt
      }
    })
    .then(res => {
      console.log(res);
      if (res.errMsg == "collection.add:ok") {
        return {
          _id: res._id,
          creator: wxContext.OPENID,
          password: info.password,
          shortName: info.shortName,
          wholeName: info.wholeName,
          public: info.public,
          createDate: dt
        };
      }
    })
}




