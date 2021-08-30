//获取当前日期时间
function getCurrentDateTime() {
    var date = new Date();
    var fmt = "yyyyMMdd-HHmmss";
    var o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'H+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds() // 毫秒
    }

    if (/(y+)/.test(fmt));
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '')
                .substr(4 - RegExp.$1.length));
    for (var k in o) { 
        if (new RegExp('(' + k + ')').test(fmt)){
            fmt = fmt.replace( RegExp.$1, (RegExp.$1.length === 1) ? 
                (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))); 
        }
    }
    return fmt;
}

//获取当前日期
function getCurrentDate() {
    var date = new Date();
    var fmt = "yyyy-MM-dd";
    var o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'H+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      S: date.getMilliseconds() // 毫秒
    }

    if (/(y+)/.test(fmt));
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '')
                .substr(4 - RegExp.$1.length));
    for (var k in o) { 
        if (new RegExp('(' + k + ')').test(fmt)){
            fmt = fmt.replace( RegExp.$1, (RegExp.$1.length === 1) ? 
                (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))); 
        }
    }
    return fmt;
}

async function getUserDetail({success, error}) {
  if (wx.getUserProfile) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log("getUserDetail->getUserProfile return ==>")
        console.log(res);
        if( res.userInfo.nickName)
          res.userInfo.name = res.userInfo.nickName
        if( success != null)
          success(res)
      },
      fail: (res) => {
        console.log("getUserDetail->getUserProfile return ==>")
        console.log(res);
      }
    })
  } else {
    wx.getSetting({
      success: async res => {
        if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            await wx.getUserInfo({
                success: async res => {
                  console.log("getUserDetail->getUserInfo return ==>")
                  console.log(res);
                  // console.log(res.userInfo);
                  if( res.userInfo.nickName)
                    res.userInfo.name = res.userInfo.nickName
                  if( success != null)
                    success(res)
                }
            })
        } else {
            console.log("Unauthrorized: authSetting['scope.userInfo'] null");
            if( error != null)
              error()
        }
      }
    })
  }
}

//exports
module.exports = {
  getCurrentDateTime:       getCurrentDateTime,
  getCurrentDate:           getCurrentDate,
  getUserDetail:            getUserDetail,
}