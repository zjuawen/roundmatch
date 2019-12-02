// miniprogram/pages/clubs/clubList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "选择俱乐部",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadClubs();

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



  loadClubs: function () {
    const db = wx.cloud.database(); //({env:'test-roundmatch'});
    const $ = db.command.aggregate;

    db.collection('clubs')
      .aggregate()
      .project({
        _id: false,
        id: true,
        shortName: true,
        wholeName: true,
        createDate: $.dateToString({
          date: '$createDate',
          format: '%Y-%m-%d'
        })
      })
      .end()
      .then(res => {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        console.log(res.list)
        this.setData({
          clubs: res.list
        })
      })
  },

})