//index.js

var APIs = require('../common/apis.js')

// const app = getApp()
const saveGlobalData = require('../common/utils').saveGlobalData
const getGlobalData = require('../common/utils').getGlobalData
const showError = require('../common/utils').showError

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    canIUseGetUserProfile: false,
  },

  redirect: function() {
    wx.redirectTo({
      url: '../clubs/clubList',
      // url: '../clubs/create',
      // url: '/pages/clubs/clubList?action=sharejoin&clubid=1b64dd7b5f688b9b0036ea5e65c0b470',
      // url: '/pages/clubs/clubList?action=sharejoin&clubid=2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0',
      // url: '/pages/matches/matchList?clubid=2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0',
      // url: '/pages/players/playerList?clubid=2f53b990-5a2e-42b0-bc70-3a3dfe6a73b0&action=new&type=fixpair',
      // url: '../matches/detail?action=old&clubid=' + 'cbddf0af60952f6906fa62640d859ca2' + '&matchid=' + '17453ede60961476082de5384e44dc48',
    })
    return
  },

  onLoad: function() {
    if (this.isLogin()) {
      console.log('user already logined')
      this.redirect()
      return
    }

    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }


    let that = this

    this.login(
      (data) => {
        console.log('login return')
        console.log(data)
        if (data.openid) {
          // console.log(saveGlobalData)
          saveGlobalData('openid', data.openid)
          console.log(getGlobalData('openid'))
        }

        if (data.userInfo != null) {
          console.log('login success')
          saveGlobalData('userInfo', data.userInfo)
          that.redirect()
        } else {
          console.log('login pedding, waiting authorization')
        }
      })
  },


  isLogin: function() {
    return (getGlobalData('openid') != null) && (getGlobalData('userInfo') != null)
  },

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    console.log(e)
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo
        })

        console.log(app.globalData.openid)
        // res.userInfo.openid = app.globalData.openid

        this.saveUserData(
          app.globalData.openid,
          res.userInfo,
          () => {
            this.redirect()
          }
        )
      }
    })
  },

  onGetUserInfo: function(e) {
    getUserProfile(e)
  },

  saveUserData: async function(openid, userInfo, callback) {
    await APIs.updateUserInfo(
      openid,
      userInfo,
      this, res => {
        if (callback) {
          callback(res)
        }
      })
  },

  login: async function(callback) {
    let that = this
    const login = await wx.login()
    console.log(login)

    await APIs.login(login.code, this, res => {
      console.log(res)
      // showError(res.msg)
      if (res.code != 0) {
        showError(res.msg)
      } else if (res.data != null) {
        let data = res.data
        if (callback) {
          callback(data)
        }
      }
    })
  }

})