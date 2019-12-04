// miniprogram/pages/clubs/create.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "创建俱乐部",
    loading: false,
  },

  loading: function (value) {
    this.setData({
      loading: value
    });
  },

  onCreateClub: function() {
    this.loading(true);
    
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
          public: false,
          password: ""
        }
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        let data = res.result.data;

      },
      fail: err => {
        console.error('[云函数] ' + func + ' 调用失败', err)
        wx.navigateTo({
          url: '../error/deployFunctions',
        })
      }
    })
  },

  onWholdNameInput: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      wholeName: value
    })
  },

   onShortNameInput: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      shortName: value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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