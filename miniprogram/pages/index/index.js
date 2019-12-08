//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },
  
  onLoad: function() {
    //debug
    wx.redirectTo({
      // url: '../players/playerList?clubid=1',
      // url: '../matches/matchList?clubid=lxRi1uqXpsdGrYSCQXkhteL2l70UPfj3F3lXV1xrLkTCSfyv',
      // url: '../matches/detail?action=old&clubid=lxRi1uqXpsdGrYSCQXkhteL2l70UPfj3F3lXV1xrLkTCSfyv&matchid=e8f863ba5de7cb4b006299e71e9f7d25',
      // url: '../players/playerList?clubid=lxRi1uqXpsdGrYSCQXkhteL2l70UPfj3F3lXV1xrLkTCSfyv&action=new',
      url: '../clubs/clubList',
      
    })
    return;
    //end of debug

    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })


    // this.onTest();
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },


  onTest: function() {
    
    let inputs = [
      // '{\"seq\":\"897091abfb0c4e65bc79847191622fda\",\"players\":[{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":2,\"name\":\"秋裤\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,3]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,4]},{\"players\":[5,6]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,3]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[0,5]}],\"extra\":true,\"score\":[\"13\",\"15\"],\"done\":true}],\"total_person\":7,\"round_per_person\":6,\"time\":\"Dec 4, 2019 12:03:52 PM\"}',
      // '{\"games\":[{\"done\":true,\"extra\":false,\"score\":[\"0\",\"0\"],\"pairs\":[{\"players\":[2,3]},{\"players\":[0,4]}],\"id\":1},{\"done\":true,\"extra\":false,\"score\":[\"21\",\"18\"],\"pairs\":[{\"players\":[1,0]},{\"players\":[6,3]}],\"id\":2},{\"done\":true,\"extra\":false,\"score\":[\"21\",\"16\"],\"pairs\":[{\"players\":[1,4]},{\"players\":[2,0]}],\"id\":3},{\"done\":true,\"extra\":false,\"score\":[\"17\",\"21\"],\"pairs\":[{\"players\":[3,5]},{\"players\":[1,2]}],\"id\":4},{\"done\":true,\"extra\":false,\"score\":[\"21\",\"18\"],\"pairs\":[{\"players\":[2,4]},{\"players\":[6,0]}],\"id\":5},{\"done\":true,\"extra\":false,\"score\":[\"14\",\"21\"],\"pairs\":[{\"players\":[5,4]},{\"players\":[3,0]}],\"id\":6},{\"done\":true,\"extra\":false,\"score\":[\"21\",\"14\"],\"pairs\":[{\"players\":[6,1]},{\"players\":[5,0]}],\"id\":7},{\"done\":true,\"extra\":false,\"score\":[\"21\",\"22\"],\"pairs\":[{\"players\":[3,1]},{\"players\":[2,6]}],\"id\":8},{\"done\":true,\"extra\":false,\"score\":[\"0\",\"0\"],\"pairs\":[{\"players\":[5,1]},{\"players\":[6,4]}],\"id\":9},{\"done\":true,\"extra\":false,\"score\":[\"18\",\"21\"],\"pairs\":[{\"players\":[5,2]},{\"players\":[3,4]}],\"id\":10},{\"done\":true,\"extra\":true,\"score\":[\"0\",\"0\"],\"pairs\":[{\"players\":[2,4]},{\"players\":[6,1]}],\"id\":11}],\"id\":null,\"names\":null,\"time\":\"Apr 3, 2019 8:08:29 PM\",\"round_per_person\":6,\"total_person\":7,\"players\":[{\"id\":2,\"name\":\"秋裤\",\"enable\":true,\"win\":2,\"loss\":3,\"value\":-5},{\"id\":3,\"name\":\"松飞\",\"enable\":true,\"win\":4,\"loss\":1,\"value\":18},{\"id\":5,\"name\":\"蚊子\",\"enable\":true,\"win\":3,\"loss\":2,\"value\":0},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":true,\"win\":2,\"loss\":3,\"value\":2},{\"id\":7,\"name\":\"鸽子\",\"enable\":true,\"win\":3,\"loss\":1,\"value\":4},{\"id\":8,\"name\":\"胖卢\",\"enable\":true,\"win\":0,\"loss\":4,\"value\":-21},{\"id\":1,\"name\":\"老严\",\"enable\":true,\"win\":2,\"loss\":2,\"value\":2}],\"seq\":\"270757760b9542a492fdf0dee8d482e3\"}',
      // '{\"time\":\"Apr 10, 2019 20:09:45\",\"games\":[{\"done\":true,\"extra\":false,\"score\":[\"15\",\"10\"],\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"id\":1},{\"done\":true,\"extra\":false,\"score\":[\"9\",\"15\"],\"pairs\":[{\"players\":[5,6]},{\"players\":[1,4]}],\"id\":2},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"8\"],\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"id\":3},{\"done\":true,\"extra\":false,\"score\":[\"12\",\"15\"],\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"id\":4},{\"done\":true,\"extra\":false,\"score\":[\"12\",\"15\"],\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"id\":5},{\"done\":true,\"extra\":false,\"score\":[\"7\",\"15\"],\"pairs\":[{\"players\":[1,3]},{\"players\":[0,5]}],\"id\":6},{\"done\":true,\"extra\":false,\"score\":[\"14\",\"15\"],\"pairs\":[{\"players\":[2,6]},{\"players\":[0,3]}],\"id\":7},{\"done\":true,\"extra\":false,\"score\":[\"8\",\"15\"],\"pairs\":[{\"players\":[1,5]},{\"players\":[3,6]}],\"id\":8},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"5\"],\"pairs\":[{\"players\":[2,4]},{\"players\":[3,5]}],\"id\":9},{\"done\":true,\"extra\":false,\"score\":[\"9\",\"15\"],\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"id\":10},{\"done\":true,\"extra\":true,\"score\":[\"15\",\"14\"],\"pairs\":[{\"players\":[1,2]},{\"players\":[0,4]}],\"id\":11}],\"id\":null,\"names\":null,\"round_per_person\":6,\"total_person\":7,\"players\":[{\"id\":3,\"name\":\"松飞\",\"enable\":true},{\"id\":4,\"name\":\"周彬\",\"enable\":true},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":true},{\"id\":1,\"name\":\"老严\",\"enable\":true},{\"id\":2,\"name\":\"秋裤\",\"enable\":true},{\"id\":8,\"name\":\"胖卢\",\"enable\":true},{\"id\":5,\"name\":\"蚊子\",\"enable\":true}],\"seq\":\"ae3a21781a834c29b7b74c6516f14a1f\"}',
      // '{\"time\":\"May 8, 2019 20:09:25\",\"games\":[{\"done\":true,\"extra\":false,\"score\":[\"15\",\"5\"],\"pairs\":[{\"players\":[5,6]},{\"players\":[1,4]}],\"id\":1},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"14\"],\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"id\":2},{\"done\":true,\"extra\":false,\"score\":[\"12\",\"15\"],\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"id\":3},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"11\"],\"pairs\":[{\"players\":[1,3]},{\"players\":[0,5]}],\"id\":4},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"12\"],\"pairs\":[{\"players\":[5,2]},{\"players\":[4,3]}],\"id\":5},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"9\"],\"pairs\":[{\"players\":[6,1]},{\"players\":[0,7]}],\"id\":6},{\"done\":true,\"extra\":false,\"score\":[\"12\",\"15\"],\"pairs\":[{\"players\":[3,7]},{\"players\":[5,6]}],\"id\":7},{\"done\":true,\"extra\":false,\"score\":[\"14\",\"15\"],\"pairs\":[{\"players\":[2,3]},{\"players\":[1,7]}],\"id\":8},{\"done\":true,\"extra\":false,\"score\":[\"7\",\"15\"],\"pairs\":[{\"players\":[4,5]},{\"players\":[6,0]}],\"id\":9},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"11\"],\"pairs\":[{\"players\":[3,7]},{\"players\":[0,4]}],\"id\":10}],\"id\":null,\"names\":null,\"round_per_person\":7,\"total_person\":8,\"players\":[{\"id\":2,\"name\":\"秋裤\",\"enable\":true},{\"id\":5,\"name\":\"蚊子\",\"enable\":true},{\"id\":1,\"name\":\"老严\",\"enable\":true},{\"id\":7,\"name\":\"鸽子\",\"enable\":true},{\"id\":8,\"name\":\"胖卢\",\"enable\":true},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":true},{\"id\":3,\"name\":\"松飞\",\"enable\":true},{\"id\":4,\"name\":\"周彬\",\"enable\":true}],\"seq\":\"727875d074c84429b981393b5a480be0\"}',
      // '{\"time\":\"May 15, 2019 14:16:56\",\"games\":[{\"done\":true,\"extra\":false,\"score\":[\"10\",\"15\"],\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"id\":1},{\"done\":true,\"extra\":false,\"score\":[\"12\",\"15\"],\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"id\":2},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"8\"],\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"id\":3},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"11\"],\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"id\":4},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"3\"],\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"id\":5},{\"done\":true,\"extra\":false,\"score\":[\"14\",\"15\"],\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"id\":6},{\"done\":true,\"extra\":false,\"score\":[\"12\",\"15\"],\"pairs\":[{\"players\":[3,7]},{\"players\":[0,4]}],\"id\":7},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"12\"],\"pairs\":[{\"players\":[1,5]},{\"players\":[2,6]}],\"id\":8},{\"done\":true,\"extra\":false,\"score\":[\"14\",\"15\"],\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"id\":9},{\"done\":true,\"extra\":false,\"score\":[\"13\",\"15\"],\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"id\":10},{\"done\":true,\"extra\":false,\"score\":[\"10\",\"15\"],\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"id\":11},{\"done\":true,\"extra\":false,\"score\":[\"8\",\"15\"],\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"id\":12},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"2\"],\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"id\":13},{\"done\":true,\"extra\":false,\"score\":[\"12\",\"15\"],\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"id\":14}],\"id\":null,\"names\":null,\"round_per_person\":7,\"total_person\":8,\"players\":[{\"id\":7,\"name\":\"鸽子\",\"enable\":true},{\"id\":4,\"name\":\"周彬\",\"enable\":true},{\"id\":1,\"name\":\"老严\",\"enable\":true},{\"id\":3,\"name\":\"松飞\",\"enable\":true},{\"id\":8,\"name\":\"胖卢\",\"enable\":true},{\"id\":9,\"name\":\"群主\",\"enable\":false},{\"id\":10,\"name\":\"大江\",\"enable\":false},{\"id\":5,\"name\":\"蚊子\",\"enable\":true}],\"seq\":\"09b69b215b664801a945079414167917\"}',
      // '{\"time\":\"May 22, 2019 19:34:05\",\"games\":[{\"done\":true,\"extra\":false,\"score\":[\"21\",\"17\"],\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"id\":1},{\"done\":true,\"extra\":false,\"score\":[\"14\",\"21\"],\"pairs\":[{\"players\":[4,5]},{\"players\":[0,2]}],\"id\":2},{\"done\":true,\"extra\":false,\"score\":[\"21\",\"17\"],\"pairs\":[{\"players\":[1,3]},{\"players\":[0,4]}],\"id\":3},{\"done\":true,\"extra\":false,\"score\":[\"21\",\"16\"],\"pairs\":[{\"players\":[1,5]},{\"players\":[2,4]}],\"id\":4},{\"done\":true,\"extra\":false,\"score\":[\"12\",\"21\"],\"pairs\":[{\"players\":[3,5]},{\"players\":[1,2]}],\"id\":5},{\"done\":true,\"extra\":false,\"score\":[\"21\",\"13\"],\"pairs\":[{\"players\":[0,3]},{\"players\":[2,5]}],\"id\":6},{\"done\":true,\"extra\":false,\"score\":[\"21\",\"17\"],\"pairs\":[{\"players\":[1,4]},{\"players\":[0,5]}],\"id\":7},{\"done\":true,\"extra\":true,\"score\":[\"21\",\"15\"],\"pairs\":[{\"players\":[3,4]},{\"players\":[5,0]}],\"id\":8}],\"id\":null,\"names\":null,\"round_per_person\":5,\"total_person\":6,\"players\":[{\"id\":5,\"name\":\"蚊子\",\"enable\":true},{\"id\":7,\"name\":\"鸽子\",\"enable\":true},{\"id\":8,\"name\":\"胖卢\",\"enable\":true},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":true},{\"id\":3,\"name\":\"松飞\",\"enable\":true},{\"id\":1,\"name\":\"老严\",\"enable\":true}],\"seq\":\"39ef334abc6e4058badb51ad4c5ef8f7\"}',
      // '{\"time\":\"May 29, 2019 20:02:21\",\"games\":[{\"done\":true,\"extra\":false,\"score\":[\"15\",\"12\"],\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"id\":1},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"13\"],\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"id\":2},{\"done\":true,\"extra\":false,\"score\":[\"8\",\"15\"],\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"id\":3},{\"done\":true,\"extra\":false,\"score\":[\"11\",\"15\"],\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"id\":4},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"9\"],\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"id\":5},{\"done\":true,\"extra\":false,\"score\":[\"5\",\"15\"],\"pairs\":[{\"players\":[3,7]},{\"players\":[0,4]}],\"id\":6},{\"done\":true,\"extra\":false,\"score\":[\"14\",\"15\"],\"pairs\":[{\"players\":[1,5]},{\"players\":[2,6]}],\"id\":7},{\"done\":true,\"extra\":false,\"score\":[\"13\",\"15\"],\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"id\":8},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"13\"],\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"id\":9},{\"done\":true,\"extra\":false,\"score\":[\"10\",\"15\"],\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"id\":10},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"10\"],\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"id\":11},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"5\"],\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"id\":12},{\"done\":true,\"extra\":false,\"score\":[\"7\",\"15\"],\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"id\":13},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"13\"],\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"id\":14}],\"id\":null,\"names\":null,\"round_per_person\":7,\"total_person\":8,\"players\":[{\"id\":2,\"name\":\"秋裤\",\"enable\":true},{\"id\":3,\"name\":\"松飞\",\"enable\":true},{\"id\":5,\"name\":\"蚊子\",\"enable\":true},{\"id\":8,\"name\":\"胖卢\",\"enable\":true},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":true},{\"id\":7,\"name\":\"鸽子\",\"enable\":true},{\"id\":4,\"name\":\"周彬\",\"enable\":true},{\"id\":1,\"name\":\"老严\",\"enable\":true}],\"seq\":\"ad8ec0b3b7c5463fafff9bceb9cd9895\"}',
      // '{\"time\":\"Jun 5, 2019 20:30:54\",\"games\":[{\"done\":true,\"extra\":false,\"score\":[\"15\",\"10\"],\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"id\":1},{\"done\":true,\"extra\":false,\"score\":[\"14\",\"15\"],\"pairs\":[{\"players\":[4,5]},{\"players\":[0,2]}],\"id\":2},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"10\"],\"pairs\":[{\"players\":[1,3]},{\"players\":[0,4]}],\"id\":3},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"10\"],\"pairs\":[{\"players\":[1,5]},{\"players\":[2,4]}],\"id\":4},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"7\"],\"pairs\":[{\"players\":[3,5]},{\"players\":[1,2]}],\"id\":5},{\"done\":true,\"extra\":false,\"score\":[\"15\",\"14\"],\"pairs\":[{\"players\":[0,3]},{\"players\":[2,5]}],\"id\":6},{\"done\":true,\"extra\":false,\"score\":[\"9\",\"15\"],\"pairs\":[{\"players\":[1,4]},{\"players\":[0,5]}],\"id\":7},{\"done\":true,\"extra\":true,\"score\":[\"15\",\"7\"],\"pairs\":[{\"players\":[3,4]},{\"players\":[5,2]}],\"id\":8}],\"id\":null,\"names\":null,\"round_per_person\":5,\"total_person\":6,\"players\":[{\"id\":5,\"name\":\"蚊子\",\"enable\":true},{\"id\":4,\"name\":\"周彬\",\"enable\":true},{\"id\":9,\"name\":\"群主\",\"enable\":false},{\"id\":3,\"name\":\"松飞\",\"enable\":true},{\"id\":1,\"name\":\"老严\",\"enable\":true},{\"id\":7,\"name\":\"鸽子\",\"enable\":true}],\"seq\":\"1278b55e10ff4e86ac327f2683151fcb\"}',
      // '{\"seq\":\"b88ace42800b4aed97c2e2a7b2e1cbbd\",\"players\":[{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":9,\"name\":\"群主\",\"enable\":1},{\"id\":12,\"name\":\"黄鸭\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"8\",\"15\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[1,5]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,7]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"extra\":false,\"score\":[\"4\",\"15\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"extra\":false,\"score\":[\"15\",\"5\"],\"done\":true},{\"id\":12,\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":13,\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":14,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"15\",\"7\"],\"done\":true}],\"total_person\":8,\"round_per_person\":7,\"time\":\"Jun 12, 2019 9:01:47 AM\"}',
      // '{\"seq\":\"e68a6fc5e650463faf189c8e1142b50f\",\"players\":[{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":2,\"name\":\"秋裤\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[5,6]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[1,3]},{\"players\":[0,5]}],\"extra\":false,\"score\":[\"7\",\"15\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[2,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[1,5]},{\"players\":[3,6]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[2,4]},{\"players\":[3,5]}],\"extra\":false,\"score\":[\"7\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"15\",\"7\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,5]}],\"extra\":true,\"score\":[\"15\",\"14\"],\"done\":true}],\"total_person\":7,\"round_per_person\":6,\"time\":\"Jun 19, 2019 11:10:24 AM\"}',
      // '{\"seq\":\"cd0bec143b704ed38ecd874cf2f71613\",\"players\":[{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":4,\"name\":\"周彬\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":9,\"name\":\"群主\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"7\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[3,7]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[1,5]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":12,\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":13,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":14,\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"extra\":false,\"score\":[\"15\",\"5\"],\"done\":true}],\"total_person\":8,\"round_per_person\":7,\"time\":\"Jun 26, 2019 12:17:01 PM\"}',
      // '{\"seq\":\"69a442d3996e48b9b58049b12c266428\",\"players\":[{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":9,\"name\":\"群主\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"15\",\"5\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"8\",\"15\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"8\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[3,7]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[1,5]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"5\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"extra\":false,\"score\":[\"9\",\"15\"],\"done\":true},{\"id\":12,\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":13,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true},{\"id\":14,\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true}],\"total_person\":8,\"round_per_person\":7,\"time\":\"Jul 3, 2019 9:00:27 AM\"}',
      // '{\"seq\":\"2e67d4328e484e5f9f18eb2aa6e4a5bd\",\"players\":[{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":2,\"name\":\"秋裤\",\"enable\":1},{\"id\":9,\"name\":\"群主\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":4,\"name\":\"周彬\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1}],\"games\":[{\"id\":0,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":1,\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[2,4]},{\"players\":[3,5]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,4]},{\"players\":[3,7]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[2,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"9\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"15\",\"7\"],\"done\":true},{\"id\":12,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":13,\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"extra\":false,\"score\":[\"7\",\"15\"],\"done\":true}],\"total_person\":8,\"round_per_person\":7,\"time\":\"Jul 10, 2019 12:04:12 PM\"}',
      // '{\"seq\":\"dbf6c1dc1a8d452ca5735eb58e5aa384\",\"players\":[{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":2,\"name\":\"秋裤\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":4,\"name\":\"周彬\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"3\",\"15\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"extra\":false,\"score\":[\"8\",\"15\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[2,4]},{\"players\":[3,5]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[2,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[0,4]},{\"players\":[3,7]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":12,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"extra\":false,\"score\":[\"8\",\"15\"],\"done\":true},{\"id\":13,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":14,\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true}],\"total_person\":8,\"round_per_person\":7,\"time\":\"Aug 7, 2019 12:36:19 PM\"}',
      // '{\"seq\":\"239ce907b2d64ad991c7bd66aa232e65\",\"players\":[{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,3]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,4]},{\"players\":[5,6]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,3]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"3\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"9\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[0,5]}],\"extra\":true,\"score\":[\"8\",\"15\"],\"done\":true}],\"total_person\":7,\"round_per_person\":6,\"time\":\"Aug 14, 2019 12:47:40 PM\"}',
      // '{\"seq\":\"fed35ef52da944269da9562dce25197d\",\"players\":[{\"id\":9,\"name\":\"群主\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"5\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,3]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,4]},{\"players\":[5,6]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,3]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"6\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"8\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"9\",\"15\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[0,5]}],\"extra\":true,\"score\":[\"8\",\"15\"],\"done\":true}],\"total_person\":7,\"round_per_person\":6,\"time\":\"Aug 28, 2019 12:39:18 PM\"}',
      // '{\"seq\":\"e90da2e1d1404dc194c150b8aa461d0d\",\"players\":[{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":9,\"name\":\"群主\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,3]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,4]},{\"players\":[5,6]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,3]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[0,5]}],\"extra\":true,\"score\":[\"15\",\"10\"],\"done\":true}],\"total_person\":7,\"round_per_person\":6,\"time\":\"Sep 4, 2019 12:42:30 PM\"}',
      // '{\"seq\":\"69ad39e52aa34010b585d3fdf4169399\",\"players\":[{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":9,\"name\":\"群主\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"5\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,3]}],\"extra\":false,\"score\":[\"8\",\"15\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,4]},{\"players\":[5,6]}],\"extra\":false,\"score\":[\"4\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,3]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[0,5]}],\"extra\":true,\"score\":[\"12\",\"15\"],\"done\":true}],\"total_person\":7,\"round_per_person\":6,\"time\":\"Sep 11, 2019 12:40:17 PM\"}',
      // '{\"seq\":\"2f4543c05c354cc3a1fc1fd59f67578c\",\"players\":[{\"id\":14,\"name\":\"奶瓶\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":15,\"name\":\"小徐\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[2,4]},{\"players\":[3,5]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,4]},{\"players\":[3,7]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[2,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":12,\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":13,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":14,\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true}],\"total_person\":8,\"round_per_person\":7,\"time\":\"Sep 18, 2019 12:40:26 PM\"}',
      // '{\"seq\":\"46e19126ae18453bb00679ce82c0704d\",\"players\":[{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,3]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,4]},{\"players\":[5,6]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,3]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[0,5]}],\"extra\":true,\"score\":[\"5\",\"15\"],\"done\":true}],\"total_person\":7,\"round_per_person\":6,\"time\":\"Sep 25, 2019 12:32:00 PM\"}',
      // '{\"seq\":\"cc637a28d047478fa85f68afb75b55bc\",\"players\":[{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":2,\"name\":\"秋裤\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[2,4]},{\"players\":[3,5]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"9\",\"15\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,4]},{\"players\":[3,7]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[2,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"extra\":false,\"score\":[\"13\",\"15\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":12,\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":13,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":14,\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true}],\"total_person\":8,\"round_per_person\":7,\"time\":\"Oct 9, 2019 12:05:15 PM\"}',
      // '{\"seq\":\"0b3e609b5639475187e94acfabae7fdc\",\"players\":[{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":16,\"name\":\"光哥\",\"enable\":1},{\"id\":14,\"name\":\"奶瓶\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,3]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,4]},{\"players\":[5,6]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,3]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[0,5]}],\"extra\":true,\"score\":[\"15\",\"12\"],\"done\":true}],\"total_person\":7,\"round_per_person\":6,\"time\":\"Oct 23, 2019 12:03:18 PM\"}',
      // '{\"seq\":\"c34388c48b124ba6ba11811423c3476e\",\"players\":[{\"id\":2,\"name\":\"秋裤\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"7\",\"15\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"extra\":false,\"score\":[\"9\",\"15\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"7\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,3]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,4]},{\"players\":[5,6]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,3]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[0,5]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":12,\"pairs\":[{\"players\":[3,4]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":13,\"pairs\":[{\"players\":[1,4]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true}],\"total_person\":7,\"round_per_person\":6,\"time\":\"Oct 30, 2019 12:04:41 PM\"}',
      // '{\"seq\":\"cb3962cbf06b42df97bea7ea28fd1e37\",\"players\":[{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":9,\"name\":\"群主\",\"enable\":1},{\"id\":17,\"name\":\"火皇\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"extra\":false,\"score\":[\"15\",\"7\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"15\",\"5\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[2,4]},{\"players\":[3,5]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,4]},{\"players\":[3,7]}],\"extra\":false,\"score\":[\"15\",\"10\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[2,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"9\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"extra\":false,\"score\":[\"15\",\"12\"],\"done\":true},{\"id\":12,\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"7\",\"15\"],\"done\":true},{\"id\":13,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":14,\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true}],\"total_person\":8,\"round_per_person\":7,\"time\":\"Nov 6, 2019 11:57:59 AM\"}',
      // '{\"seq\":\"a76735a8de804c3bbce99f5ace4fb973\",\"players\":[{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[1,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"21\",\"17\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"21\",\"13\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"21\",\"10\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[0,4]},{\"players\":[1,3]}],\"extra\":false,\"score\":[\"16\",\"21\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,2]},{\"players\":[3,5]}],\"extra\":false,\"score\":[\"21\",\"18\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,3]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"15\",\"21\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"21\",\"13\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,2]}],\"extra\":true,\"score\":[\"16\",\"21\"],\"done\":true}],\"total_person\":6,\"round_per_person\":5,\"time\":\"Nov 13, 2019 12:10:20 PM\"}',
      // // '{\"seq\":\"20386303f9b34774a86a2d8344fc9170\",\"players\":[{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":2,\"name\":\"秋裤\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":2,\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":3,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":4,\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":5,\"pairs\":[{\"players\":[2,4]},{\"players\":[3,5]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":6,\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":7,\"pairs\":[{\"players\":[0,4]},{\"players\":[3,7]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":8,\"pairs\":[{\"players\":[2,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":9,\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":10,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":12,\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":13,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false},{\"id\":14,\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"extra\":false,\"score\":[\"0\",\"0\"],\"done\":false}],\"total_person\":8,\"round_per_person\":7,\"time\":\"Nov 19, 2019 2:26:40 AM\"}',1,'nlbc'),
      // '{\"seq\":\"9a0420c55af541439b97bc22ec03c485\",\"players\":[{\"id\":13,\"name\":\"星星\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":1,\"name\":\"老严\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[0,1]},{\"players\":[2,3]}],\"extra\":false,\"score\":[\"15\",\"4\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[4,5]},{\"players\":[6,7]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"9\",\"15\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[1,3]},{\"players\":[5,7]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[2,4]},{\"players\":[3,5]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[1,7]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,4]},{\"players\":[3,7]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[2,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[0,7]},{\"players\":[2,5]}],\"extra\":false,\"score\":[\"10\",\"15\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,4]},{\"players\":[1,6]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[4,7]}],\"extra\":false,\"score\":[\"15\",\"13\"],\"done\":true},{\"id\":12,\"pairs\":[{\"players\":[5,6]},{\"players\":[0,3]}],\"extra\":false,\"score\":[\"15\",\"6\"],\"done\":true},{\"id\":13,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,4]}],\"extra\":false,\"score\":[\"9\",\"15\"],\"done\":true},{\"id\":14,\"pairs\":[{\"players\":[3,6]},{\"players\":[2,7]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true}],\"total_person\":8,\"round_per_person\":7,\"time\":\"Nov 20, 2019 12:07:19 PM\"}',
      // '{\"seq\":\"aa16809af85f4111a9f38fb6ac9f979c\",\"players\":[{\"id\":7,\"name\":\"鸽子\",\"enable\":1},{\"id\":2,\"name\":\"秋裤\",\"enable\":1},{\"id\":5,\"name\":\"蚊子\",\"enable\":1},{\"id\":8,\"name\":\"胖卢\",\"enable\":1},{\"id\":10,\"name\":\"大江\",\"enable\":1},{\"id\":3,\"name\":\"松飞\",\"enable\":1},{\"id\":6,\"name\":\"蛤蟆\",\"enable\":1}],\"games\":[{\"id\":1,\"pairs\":[{\"players\":[2,5]},{\"players\":[0,6]}],\"extra\":false,\"score\":[\"14\",\"15\"],\"done\":true},{\"id\":2,\"pairs\":[{\"players\":[0,1]},{\"players\":[3,4]}],\"extra\":false,\"score\":[\"15\",\"14\"],\"done\":true},{\"id\":3,\"pairs\":[{\"players\":[2,3]},{\"players\":[4,6]}],\"extra\":false,\"score\":[\"7\",\"15\"],\"done\":true},{\"id\":4,\"pairs\":[{\"players\":[0,5]},{\"players\":[1,3]}],\"extra\":false,\"score\":[\"15\",\"11\"],\"done\":true},{\"id\":5,\"pairs\":[{\"players\":[1,4]},{\"players\":[5,6]}],\"extra\":false,\"score\":[\"11\",\"15\"],\"done\":true},{\"id\":6,\"pairs\":[{\"players\":[0,3]},{\"players\":[2,6]}],\"extra\":false,\"score\":[\"12\",\"15\"],\"done\":true},{\"id\":7,\"pairs\":[{\"players\":[0,2]},{\"players\":[4,5]}],\"extra\":false,\"score\":[\"15\",\"4\"],\"done\":true},{\"id\":8,\"pairs\":[{\"players\":[3,6]},{\"players\":[1,5]}],\"extra\":false,\"score\":[\"4\",\"15\"],\"done\":true},{\"id\":9,\"pairs\":[{\"players\":[1,6]},{\"players\":[0,4]}],\"extra\":false,\"score\":[\"15\",\"8\"],\"done\":true},{\"id\":10,\"pairs\":[{\"players\":[3,5]},{\"players\":[2,4]}],\"extra\":false,\"score\":[\"15\",\"9\"],\"done\":true},{\"id\":11,\"pairs\":[{\"players\":[1,2]},{\"players\":[0,5]}],\"extra\":true,\"score\":[\"15\",\"4\"],\"done\":true}],\"total_person\":7,\"round_per_person\":6,\"time\":\"Nov 27, 2019 12:07:04 PM\"}'    
      ];

    let matchArray = [];
    inputs.forEach(async function (inStr){
      // this.getPlayerId('name');

      let obj = JSON.parse(inStr);
      console.log(obj);
      let time = obj.time;
      let match = {
        createDate: time,
        total: obj.games.length,
        finish: obj.games.length,
        playerCount: 0,
        remark: "",
        "clubid": "2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0"
      }
      let matchString = JSON.stringify(match);
      console.log(matchString);
      matchArray.push(matchString);
      let matchRes = await this.addMatch(match);

      let gameArray = [];
      let games = obj.games;
      // let fn = ?
      games.forEach(function (game) {
        // let name1 = this.getPlayerId('haha');
        // console.log(game);

        const db = wx.cloud.database()

        let gameObj = {
          "player1": this.getPlayerId(obj.players[game.pairs[0].players[0]].name),
          "player2": this.getPlayerId(obj.players[game.pairs[0].players[1]].name),
          "player3": this.getPlayerId(obj.players[game.pairs[1].players[0]].name),
          "player4": this.getPlayerId(obj.players[game.pairs[1].players[1]].name),
          "score1": parseInt(game.score[0]),
          "score2": parseInt(game.score[1]),
          
          "createDate": db.serverDate(),
          "clubid": "2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0",
          "matchid": matchRes._id
        }
        this.addGame(gameObj);
        let gameString = JSON.stringify(gameObj);
        console.log(gameString);
      }, this);
    }, this);

  },

  addGame: async function(game) {

   const db = wx.cloud.database()
   return await  db.collection('testgame').add({
      data: game
    }).then(res => {
      console.log(res)
      return res;
    })
    .catch(console.error)
  },

  addMatch: async function(match) {

   const db = wx.cloud.database()
   return await  db.collection('testmatch').add({
      data: match
    }).then(res => {
      console.log(res)
      return res;
    })
    .catch(console.error)
  },

  getPlayerId: function(name) {
    let players = [
      {
        name:"老严",
        id:"7799745c5decb7c501623d321680d908",
      },{
        name:"秋裤",
        id:"01ace4015decdc82016e4ec272c89402",
      },{
        name:"松飞",
        id:"72527ac65decb83201640aab62ac4d6a",
      },{
        name:"周彬",
        id:"dbff9fc75decb7bb0163799f3484f403",
      },{
        name:"蚊子",
        id:"72527ac65de8aa7e0085372e267667fd",
      },{
        name:"蛤蟆",
        id:"72527ac65decc1b90166cae42b245abd",
      },{
        name:"鸽子",
        id:"dbff9fc75decb8a00163b6ad75694e4d",
      },{
        name:"胖卢",
        id:"dbff9fc75decb7d101637f131a33c869",
      },{
        name:"群主",
        id:"72527ac65decbf3c01660efe122cac01",
      },{
        name:"大江",
        id:"b040a67a5decb7ae0162bcee0bb89f89",
      },{
        name:"黄鸭",
        id:"EnWZ2m0am0UAZAq7Xm7cII15w5nan1WWd9PZZ6U7idcuIs7z",
      },{
        name:"星星",
        id:"1PmtAhIsvhTOqrRCnnJUkmQcmLWA2ud3qactiFWxtmbB8iRV",
      },{
        name:"奶瓶",
        id:"IUXHf0HW7LJplsAYkHP3xwToGAWGO6o9Poan6F3G0eC2ZZci",
      },{
        name:"小徐",
        id:"iTl2tNkiz4siBXYoNlAugYvOAEULvzPtGX5Yp28SvmHy1CqS",
      },{
        name:"光哥",
        id:"EE4kkhqfehBnzRdk2saVvszHVAMm80QwVIqlh0at8CNhELKK",
      },{
        name:"火皇",
        id:"RTfyAuueh1ReVqt4Sx1MMDxIkoFNzlPwDJm5UFgsJvRyxOJW",
      }
    ];

    let id = null;
    players.forEach(function (player){
      if( player.name == name){
        id = player.id;
        // return@forEach;
      }
    });

    return id;
  },



  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          // url: '../matchList/matchList',
          // url: '../players/playerList',
          url: '../clubs/clubList',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
