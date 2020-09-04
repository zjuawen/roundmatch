// miniprogram/pages/clubs/create.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "创建俱乐部",
    wholeName: '',
    shortName: '',
    password: '',
    password2: '',
    public: false,
    loading: false,
  },

  loading: function (value) {
    this.setData({
      loading: value
    });
  },

  onCreateClub: function() {
    this.loading(true);

    let errMsg = null;
    if( this.data.wholeName.length == 0){
      errMsg = '请填写俱乐部名称';
    } else if( this.data.shortName.length == 0){
      errMsg = '请填写俱乐部缩写';
    } else if( this.data.password != this.data.password2){
      errMsg = '两次密码不一致';
    }

    if( errMsg){
      wx.showToast({
        icon: "none",
        title: errMsg,
        duration: 1000
      })
      this.loading(false);
    } else {
      this.createClub();
    }
    
  },

  onInputWholdName: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      wholeName: value
    })
  },

  onInputShortName: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      shortName: value
    })
  },

  onInputPassword: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      password: value
    })
  },

  onReinputPassword: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      password2: value
    })
  },

  onSwitchPublic: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      public: value
    })
  },

  //创建俱乐部
  createClub: function(){
    let func = 'clubService';
    let action = 'create';
    console.log(func + " " + action);

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        info: {
          wholeName: this.data.wholeName,
          shortName: this.data.shortName,
          public: this.data.public,
          password: this.data.password,
        },
        userInfo: this.data.userInfo,
      },
      success: res => {
        this.loading(false);
        let data = res.result.data;
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        if( data.errCode == 1){
          wx.showToast({
            icon: "none",
            title: data.errMsg,
            duration: 1000
          })
          
          this.loading(false);
        } else {
          
          wx.navigateTo({
            url: '../clubs/clubList',
          })
          // wx.showToast({
          //   icon: "success",
          //   title: '创建成功',
          //   duration: 1000
          // })
        }
      }
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if( options.userInfo ){
      var userInfoObject = JSON.parse(decodeURIComponent(options.userInfo));
      this.setData({
        userInfo: userInfoObject
      })
    }
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