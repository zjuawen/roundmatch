// 云函数入口文件
const cloud = require('wx-server-sdk')

const env = 'test-roundmatch';
// cloud.updateConfig({ env: cloud.DYNAMIC_CURRENT_ENV});
cloud.init({
  // env: cloud.DYNAMIC_CURRENT_ENV
  env: env
})

const db = cloud.database();

getSeq = async (name) => {
  // const colloction = db.collection('SEQ').where({
  //   name: name
  // });
  // console.log(colloction);
  const _ = db.command;
  let retid = 0;

  return await db.collection('SEQ')
    .where({
      _name: name
    })
    .get()
    .then(res => {
    //   console.log(res.data);
    // });

      let id = res.data[0]._id;
      retid = res.data[0].seq;
      console.log("get seq: " + retid);
      
      return db.collection('SEQ')
        .doc(id)
        .update({
          data: {
            seq: _.inc(1)
          }
        })
        .then(res => {
          console.log(res);
          return retid;
        })
    });
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const name = event.name;
  console.log('getting seq for: ' + name);

  let seq = await getSeq(name);

  console.log('return seq: ' + seq);

  return {
    seq: seq,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}