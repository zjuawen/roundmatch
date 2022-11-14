//index.js

var APIs = require('../common/apis.js');

const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  redirect: function() {
    // return;
    wx.redirectTo({
      url: '../clubs/clubList',
      // url: '../clubs/create',
      // url: '/pages/clubs/clubList?action=sharejoin&clubid=1b64dd7b5f688b9b0036ea5e65c0b470',
      // url: '/pages/clubs/clubList?action=sharejoin&clubid=2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0',
      // url: '/pages/matches/matchList?clubid=2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0',
      // url: '/pages/players/playerList?clubid=2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0&action=new&type=fixpair',
      // url: '../matches/detail?action=old&clubid=' + 'cbddf0af60952f6906fa62640d859ca2' + '&matchid=' + '17453ede60961476082de5384e44dc48',
    })
    return;
  },

  onLoad: function() {
    // this.redirect()
    // return

    // if (!wx.cloud) {
    //   wx.redirectTo({
    //     url: '../chooseLib/chooseLib',
    //   })
    //   return
    // }


    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           this.setData({
    //             avatarUrl: res.userInfo.avatarUrl,
    //             userInfo: res.userInfo
    //           });
    //           this.redirect();
    //         },
    //         fail: err => {
    //           this.redirect();
    //         }
    //       })
    //     }
    //   }
    // })


    this.login( 
      (res) => {
        console.log(res);
        //debug
        // this.redirect();
        //end of debug

      });
    // this.onTest();
  },

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  onGetUserInfo: function(e) {
    getUserProfile(e);
    // if (!this.data.logged && e.detail.userInfo) {
    //   this.setData({
    //     logged: true,
    //     avatarUrl: e.detail.userInfo.avatarUrl,
    //     userInfo: e.detail.userInfo
    //   })
    // }
  },

  login: async function(callback) {
    let that = this;
    const login = await wx.login();
    console.log(login);

    await APIs.login(login.code, this, res => {
      console.log(res)
      if ( callback){
        callback(res);
      }
      
      app.globalData.openid = res.openid;
      that.setData({
        openid: res.openid
      });
      // that.redirect();
      return res;
    })
  },

})