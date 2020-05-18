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
      // url: '../clubs/clubList',
      // url: '../players/playerList?clubid=2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0',
      url: '../matches/matchList?clubid=lxRi1uqXpsdGrYSCQXkhteL2l70UPfj3F3lXV1xrLkTCSfyv',
      // url: '../matches/detail?action=old&clubid=lxRi1uqXpsdGrYSCQXkhteL2l70UPfj3F3lXV1xrLkTCSfyv&matchid=72527ac65dec9753015b68886ea75a49',
      // url: '../players/playerList?clubid=lxRi1uqXpsdGrYSCQXkhteL2l70UPfj3F3lXV1xrLkTCSfyv&action=new',
      // url: '../clubs/clubList?action=sharejoin&clubid=lxRi1uqXpsdGrYSCQXkhteL2l70UPfj3F3lXV1xrLkTCSfyv',

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
