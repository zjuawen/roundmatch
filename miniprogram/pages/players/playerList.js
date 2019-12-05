// miniprogram/pages/players/playerList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "选择人员",
    loading: false,
  },

  loading: function (value) {
    this.setData({
      loading: value
    });
  },

  loadPlayers: function(clubid) {
    this.loading(true);

    let func = 'userService';
    let action = 'list';
    console.log(func + " " + action);

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        clubid: clubid
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result);
        this.setData({
          players: res.result.data
        });

        this.loading(false);
      },
      fail: err => {
        console.error('[云函数] ' + func + ' 调用失败', err)
        wx.navigateTo({
          url: '../error/deployFunctions',
        })
      }
    })
  },

  onSelectPlayer: function(event) {
    let data = this.data.players;
    let playerid = event.target.dataset.id;
    for( let i = 0; i<data.length; i++){
      if( data[i]._id == playerid){
         data[i].enable = !data[i].enable;
         this.setData({players:data});
         return;
      }
    }
  },

  getSelectedPlayers: function() {
    let data = this.data.players;
    let playerArray = [];
    for( let i = 0; i<data.length; i++){
      if( data[i].enable){
         playerArray.push(data[i]._id)
      }
    }
    console.log("getSelectedPlayers return: " + playerArray);
    
    return playerArray;
  },

  onPlayerSelected: function(event) {

    let func = 'matchService';
    let playerArray = this.getSelectedPlayers();
    console.log('selected: '+ playerArray);

    wx.cloud.callFunction({
      name: func,
      data: {
        action: 'create',
        players:playerArray
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result);
        var data = JSON.stringify(res.result.data);
        wx.navigateTo({
          // url: '../matchList/matchList',
          // url: '../players/playerList',
          url: '../matches/detail?action=new&clubid=' + this.data.clubid + '&data=' + data,
        })
      },
      fail: err => {
        console.error('[云函数] ' + func + ' 调用失败', err)
        wx.navigateTo({
          url: '../error/deployFunctions',
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      clubid: options.clubid,
      action: options.action,
    });
    this.loadPlayers(this.data.clubid);
    
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