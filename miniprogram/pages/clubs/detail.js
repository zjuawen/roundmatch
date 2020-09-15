// miniprogram/pages/clubs/detail.js
var APIs = require('../common/apis.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "俱乐部详情",
    mode: 'join',
    btnText: '加入',
    creatorName: '匿名',
    wholeName: '',
    shortName: '',
    logo: '',
    public: false,
    locked: false,
    password: '',
    userInfo: null,
    description: "这里填写很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的俱乐部介绍h",
    loading: false,
    editable: false,
    buttons: [{
        text: '取消'
    }, {
        text: '确定'
    }],
    joinDialogShow: false,
  },

  loading: function (value) {
    this.setData({
      loading: value
    });
  },

  btnActionFunc : function(){
    let action = this.data.action;
    if( action == 'join'){
      this.onJoinClub();
    } else {
      wx.navigateBack();
    }
  },

  onJoinClub: function() {
      // let data = e.currentTarget.dataset.item;
      this.setData({
          joinDialogShow: true,
      })
  },

  onInputPassword: function(e) {
      console.log(e);
      let data = e.detail.value;
      this.setData({
          password: data
      });
  },

  tapDialogButton(e) {
    let btnIndex = e.detail.index;
    if (btnIndex === 1) {
        this.loading(true);
        APIs.joinClub(
          this.data.clubid, 
          this.data.userInfo,
          this.data.password,
          this, res => {
            console.log(res);
            let status = res.status;
            if( status == 'fail'){
              wx.showToast({
                  title: res.errMsg,
                  icon: 'none',
              });
            } else {
              wx.redirectTo({
                url: '../clubs/clubList',
              });
            }
          });
    }
    this.setData({
        joinDialogShow: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loading(true);
    console.log(options);
    if( options.action == 'view'){
      this.setData({
        action: options.action,
        btnText: '返回',
        clubid: options.clubid
      })
    } else if( options.action == 'join'){
      this.setData({
        action: options.action,
        btnText: '加入',
        clubid: options.clubid
      })
      if( options.userInfo){
        var userInfoObject = JSON.parse(decodeURIComponent(options.userInfo));
        this.setData({
          userInfo: userInfoObject
        })
      }
    }
    APIs.getClubInfo( options.clubid, this, res => {
      console.log(res);
      var logoList = [{path: '../../../images/default-club-logo.svg'}];
      if( res.logo && res.logo.length > 0){
        logoList = [{ path: res.logo }];
      }
      console.log(logoList)
      this.setData({
        wholeName: res.wholeName,
        shortName: res.shortName,
        // logo: res.logo,
        fileList: logoList,
        public: res.public,
        locked: res.locked,
      })
      if( res.creatorInfo){
        this.setData({
          creatorName: res.creatorInfo.name,
        })
      } 
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

  }
})