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


// 云函数入口函数
exports.main = async (request, result) => {
  let event = request.query

  console.log('systemService')
  console.log(event)

  let action = event.action

  let data = null
  if (action == 'notices') {
    data = await getNotices(event.openid, event.page)
  } else if (action == 'auditing') {
    data = await isAuditing()
  } else if (action == 'msgSecCheck') {
    data = await msgSecCheck(event.openid, event.param);
  } else if (action == 'imgSecCheck') {
    data = await imgSecCheck(event);
  }

  console.log('systemService return:')
  console.log(data)

  successResponse(result, {
    data
  })
}

isAuditing = async () => {
  let audit = await sequelizeExecute(
    db.collection('system').findOne({
      where: {
        key: 'audit',
      },
      raw: true
    })
  )

  console.log(audit)

  if (audit != null && audit.value == 'true') {
    return {
      auditing: true
    }
  }

  return {
    auditing: false
  }
}

getNotices = async (openid, page) => {
  let notices = await sequelizeExecute(
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


imgSecCheck = async (event) => {
  return {
    errCode: 0
  }

  // try {
  //   let res = false;

  //   //  检查图像内容是否违规
  //   if (event.img) {
  //     res = await cloud.openapi.security.imgSecCheck({
  //       media: {
  //         header: {
  //           'Content-Type': 'application/octet-stream'
  //         },
  //         contentType: 'image',
  //         value: Buffer.from(event.img) // 官方文档这里是个坑
  //       }
  //     });
  //   };
  //   return res;
  // } catch (e) {
  //   return e;
  // }
}

//检查消息是否合法
msgSecCheck = async (openid, param) => {
  return {
    errCode: 0
  }
  // let access_token = await readAccessToken();

  // const { content } = param;
  // try {
  //   const res = await cloud.openapi.security.msgSecCheck({
  //     "access_token" : access_token, 
  //     "content": content
  //   })
  //   return res;
  // } catch (err) {
  //   return err;
  // }
}

// //读取AccessToken
// readAccessToken = async () => {
//   let key = 'access_token';
//   let res = await db.collection('system')
//     .where({
//       key: key,
//     })
//     .limit(1)
//     .get()
//     .then(async res => {
//       console.log(res);
//       let data = res.data;
//       let valid = data && (data.length > 0);
//       if( valid ){
//         let dt = new Date();
//         if( dt > data[0].expireTime ){
//           valid = false;
//         }
//       }
//       if( !valid ){
//         res = await requestAccessToken();
//         if( res ){
//           res = JSON.parse(res);
//           let update = await updateAccessToken(res);
//           console.log(update);
//         }
//       }

//       return res.access_token;
//     })

// }

// //更新AccessToken和有效期
// updateAccessToken = async ( data ) => {
//   if( !data ){
//     console.log("data null when updateAccessToken");
//     return null;
//   }

//   let newExpiredTime = db.serverDate({
//       offset: (data.expires_in - 5* 60) * 1000,
//   });

//   let key = 'access_token';
//   let exist = await db.collection('system')
//     .where({
//       key: key,
//     })
//     .get()
//     .then(async res => {
//       console.log(res);
//       return res.data && (res.data.length > 0);
//     })
//   if( exist ){
//     return await db.collection('system')
//       .where({
//         key: key,
//       })
//       .update({
//         data: {
//           access_token: data.access_token,
//           expireTime: newExpiredTime
//         }
//       })
//       .then( async res => {
//         return res;
//       })
//   } else {
//     return await db.collection('system')
//       .add({
//         data: {
//           key: key,
//           access_token: data.access_token,
//           expireTime: newExpiredTime
//         }
//       })
//       .then( async res => {
//         return res;
//       })
//   }
// }

// //从微信服务器申请新的msgSecCheck AccessToken
// requestAccessToken = async () => {

//   let url = "https://api.weixin.qq.com/cgi-bin/token?"
//     + "grant_type=client_credential"
//     + "&appid=wxf3f6462195815590" 
//     + "&secret=7755e73cf0d3bd866eb0a15b4f2f4c09";

//   return await rp(url)
//     .then(res => {
//       return res;
//     })
//     .catch( err => {
//       console.log(err);
//     });
// }