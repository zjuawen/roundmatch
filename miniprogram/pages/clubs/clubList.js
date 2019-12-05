// miniprogram/pages/clubs/clubList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "俱乐部",
    login: false,
    openid: '',
    avatarUrl: '../../images/user-unlogin.png',
    loading: false,
    buttons: [{text: '取消'}, {text: '确定'}],
    joinDialogShow: false,
    // inputShowed: false,
    // inputVal: "",
  },
  
  loading: function (value) {
    this.setData({
      loading: value
    });
  },

  loadUserinfo: function() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res.userInfo);
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo,
                login: true
              })
            }
          })
        }
      }
    })
  },

  getOpenid: async function ()  {
    this.loading(true);
    
    let func = 'userService';
    let action = 'login';
    console.log(func + " " + action);

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        let data = res.result.data;
        this.setData({
          openid: data.openid
        });
        this.loadClubs();
      },
      fail: err => {
        console.error('[云函数] ' + func + ' 调用失败', err)
        wx.navigateTo({
          url: '../error/deployFunctions',
        })
      }
    })
  },

  loadClubs: function () {
    this.loading(true);

    let func = 'clubService';
    let action = 'list';
    console.log(func + " " + action);

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        let data = res.result.data;
        this.setData({
          clubs: data.private,
          publicClubs: data.public
        })
        this.reducePublicClubs();
        this.loading(false);
      },
      fail: err => {
        console.error('[云函数] ' + func + ' 调用失败', err)
        wx.navigateTo({
          url: '../error/deployFunctions',
        })
      }
    })
    // const db = wx.cloud.database(); //({env:'test-roundmatch'});
    // const $ = db.command.aggregate;

    // db.collection('clubs')
    //   .aggregate()
    //   .match({
    //     openid: this.data.openid
    //   })
    //   .project({
    //     _id: true,
    //     shortName: true,
    //     wholeName: true,
    //     owner: true,
    //     createDate: $.dateToString({
    //       date: '$createDate',
    //       format: '%Y-%m-%d'
    //     })
    //   })
    //   .end()
    //   .then(res => {
    //     // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
    //     console.log(res.list)
    //     this.setData({
    //       clubs: res.list
    //     })
    //   })
  },

  search: function(value) {
    console.log("searching: " + value);
    if( value != "demo"){
      return;
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([{ text: 'DEMO俱乐部', value: 1 }])
      }, 200)
    })
  },

  selectResult: function(e) {
    console.log('select result', e.detail);
    // this.loading(true);

    // let func = 'clubService';
    // let action = 'join';
    // console.log(func + " " + action);

    // wx.cloud.callFunction({
    //   name: func,
    //   data: {
    //     action: action
    //   },
    //   success: res => {
    //     console.log('[云函数] ' + func + ' return: ', res.result.data);
    //     let data = res.result.data;
    //     this.setData({
    //       clubs: data
    //     })
    //     this.loading(false);
    //   },
    //   fail: err => {
    //     console.error('[云函数] ' + func + ' 调用失败', err)
    //     wx.navigateTo({
    //       url: '../error/deployFunctions',
    //     })
    //   }
  },

  onNewClub: function() {
    // this.onGetOpenid();
    wx.navigateTo({
      url: './create',
    })
  },

  onClickPublicClub: function(e) {
    console.log(e);
    this.setData({
      selected: e.currentTarget.dataset.item,
      joinDialogShow: true,
    })
  },

  tapDialogButton(e) {
    let btnIndex = e.detail.index;
    if( btnIndex === 1){
      this.loading(true);
      this.joinClub(this.data.selected._id);
    } 
    this.setData({
        joinDialogShow: false
    })
  },

  joinClub: function(clubid) {
    let func = 'clubService';
    let action = 'join';
    console.log(func + " " + action);

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        clubid: clubid
      },
      success: res => {
        this.loading(false);
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        let data = res.result.data;
        if( data._id.length > 0){
          this.data.clubs.push(this.data.selected);
          this.reducePublicClubs();
          this.setData({
            clubs: this.data.clubs,
            joinDialogShow: false
          });
        }
      },
      fail: err => {
        console.error('[云函数] ' + func + ' 调用失败', err)
        wx.navigateTo({
          url: '../error/deployFunctions',
        })
      }
    })
  },

  reducePublicClubs: function() {
    let publicClubs = this.data.publicClubs;
    let privateClubs = this.data.clubs;

    publicClubs = publicClubs.filter(function(publicClub) {
      let keep = true;
      privateClubs.forEach(function(privateClub) {
        if( publicClub._id == privateClub._id){
          keep = false;
        }
      });
      return keep;
    });

    this.setData({
      publicClubs: publicClubs
    })
 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOpenid();
    this.loadUserinfo();

    this.setData({
      search: this.search.bind(this)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },


})