// miniprogram/pages/matchList/matchList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "比赛列表",
    loading: false,

    players: [],
    matches: [],
    pageNum: 1, //初始页默认值为1
    pageSize: 10,
    noMore: false,
    // showActionsheet: false,
    // actions: [
    //   { text: '示例菜单', value: 1 },
    //   { text: '示例菜单', value: 2 },
    //   { text: '负向菜单', type: 'warn', value: 3 }
    // ]

    //tabbar
    tabIndex: 0,
    tabLabelList: [{
      "text": "比赛列表",
      "iconPath": "../../images/match-list.svg",
      "selectedIconPath": "../../images/match-list-selected.svg",
      // dot: true
    },
    {
      "text": "排行榜",
      "iconPath": "../../images/match-statistic.svg",
      "selectedIconPath": "../../images/match-statistic-selected.svg",
      // badge: 'New'
    }],

  },

  loading: function (value) {
    this.setData({
      loading: value
    });
  },

  loadMatches: function (clubid) {
    this.loading(true);

    let func = 'matchService';
    let action = 'list';
    console.log('list matches');

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        clubid: clubid,
        pageNum: this.data.pageNum, 
        pageSize: this.data.pageSize,
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        let newData = res.result.data;
        this.setData({
          noMore: (newData.length < this.data.pageSize)
        });
        newData = this.data.matches.concat(newData);
        this.setData({
          matches: newData
        })
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

  onNewGame: function() {
    wx.navigateTo({
      url: '../players/playerList?clubid=' + this.data.clubid + '&action=new',
    })
  },

  tabChange(e) {
    console.log('tab change', e);
    let index = e.detail.index;
    let title = (index == 0) ? '比赛列表' : '排行榜';
    if( index == 0 ){
      let tabLabelList = this.data.tabLabelList;
      if( tabLabelList[0].badge != null){
        tabLabelList[0].badge = null;
        this.setData({
          tabLabelList: tabLabelList
        })
      }
    } else {
      this.loadPlayersStatistic(this.data.clubid);
    }
    this.setData({
      title: title,
      tabIndex:index
    });
  },

  loadPlayersStatistic: function(clubid) {
    this.loading(true);

    let func = 'clubService';
    let action = 'statis';
    console.log(func + " " + action);

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        clubid: clubid
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result);
        let data = res.result.data;
        data.forEach(function (item) {
          if( item.avatarUrl == null){
            item.avatarUrl = '../../images/user-unlogin.png';
          }
          // item.pigCount = 0;
          // item.crownCount = 0;
          // item.winCount = 1;
          // item.lostCount = 2;
          let winrate = item.winCount/(item.lostCount+item.winCount);
          if( isNaN(winrate)){
            winrate = '0%';
          } else {
            winrate = (winrate*100).toFixed(2) + '%';
          }
          item.winrate = winrate;
        });

        this.setData({
          players: data
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

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    this.setData({ 
      clubid: options.clubid 
    });
    // this.loadMatches(this.data.clubid);
    // this.loadPlayers(this.data.clubid);
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
    this.setData({
      matches: [],
      pageNum: 1,
      noMore: false
    });
    this.loadMatches(this.data.clubid);
    if( this.data.tabIndex == 1){
      this.loadPlayersStatistic(this.data.clubid);
    }
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
    console.log("load more");
    if( this.data.noMore){
      console.log("No more data");
      return;
    } else {
      this.setData({
        pageNum: this.data.pageNum+1
      });
      console.log("Load more, page: " + this.data.pageNum);
    }
    this.loadMatches(this.data.clubid);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
})