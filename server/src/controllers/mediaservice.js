const validateSession = require("../utils/util").validateSession
const sequelizeExecute = require("../utils/util").sequelizeExecute
const successResponse = require("../utils/response").successResponse
const errorResponse = require("../utils/response").errorResponse

const fs = require('fs');

const SERVER_URL_UPLOADS = process.env.SERVER_URL_UPLOADS


// 云函数入口函数
exports.main = async (request, result) => {
  // console.log(request)
  // const wxContext = context// cloud.getWXContext()
  let event = request.query

  console.log('mediaService')
  console.log(event)
  // console.log(cloud.DYNAMIC_CURRENT_ENV)

  let action = event.action

  if (action == 'upload') {
    let file = request.file
    console.log('receiving ')
    console.log(file)
    data = await upload(file, event.type)
  }

  console.log('mediaService return:')
  console.log(data)

  successResponse(result, {
    data
  })
}

upload = async (file, type) => {
  let inputFile = file.path //获取path:
  let fileName = 'icon-' + Date.now() + file.originalname.match(/\.[^.]+?$/)[0]
  if (type == 'icon') {
    fileName = 'clubicons/' + fileName
  } else if (type == 'head') {
    fileName = 'heads/' + fileName
  } else {
    fileName = 'images/' + fileName
  }
  console.log(fileName)
  fs.renameSync(inputFile, process.env.UPLOAD_LOCAL_DIRECTORY + fileName)
  if (fileName != null && fileName.length > 0 && !fileName.startsWith('http') && !fileName.startsWith('cloud://')) {
    fileName = SERVER_URL_UPLOADS + fileName
  }
  return {
    url: fileName
  }
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