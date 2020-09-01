// miniprogram/pages/matchList/matchList.js
// var app = getApp();

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

    orderField: 'notSet',
    orderDesc: 'notSet',

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
    console.log(func + " " + action);

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

  getClubInfo: function (clubid) {
    this.loading(true);

    let func = 'clubService';
    let action = 'info';
    console.log(func + " " + action);

    return wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        clubid: clubid
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        let clubinfo = res.result.data;
        this.setData({
          clubinfo: clubinfo
        });
        getApp().globalData.clubinfo = clubinfo;
        wx.showShareMenu({});
        this.loading(false);
        return clubinfo;
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
          let rateStr = '0%';
          if( isNaN(winrate)){
             winrate = 0;
             rateStr = '0%';
          } else {
            rateStr = (winrate*100).toFixed(2) + '%';
          }
          item.winrate = winrate;
          item.rateStr = rateStr;
        });

        this.setData({
          players: data,
          orderField: 'notSet',
          orderDesc: 'notSet',
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

  onTapOrder: function(e){
    console.log('onTapOrder', e);
    let field = e.currentTarget.dataset.id;
    let players = this.data.players;
    let desc = this.data.orderDesc;
    if( desc == 'notSet'){
      desc = true;
    }
    this.reorderPlayers(players, field, desc);
    this.setData({
      orderField: field,
      players: players,
      orderDesc: !desc,
    });
  },

  oDeleteGame: function (e) {
    console.log('onDeleteGame');

    let clubid = this.data.clubid;
    let matchid = e.target.dataset.id;  
    var that = this;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          console.log('确定删除');
          that.deleteGame(clubid, matchid);
        } else if (sm.cancel) {
          console.log('取消删除');
        }
      }
    });
  },

  deleteGame: function (clubid, matchid) {
    let func = 'matchService';
    let action = 'delete';

    console.log(func + " " + action);

    return wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        clubid: clubid,
        matchid: matchid
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result);
        this.setData({
          matches: [],
          pageNum: 1,
          noMore: false
        }); 
        this.loadMatches(this.data.clubid);
      },
      fail: err => {
        console.error('[云函数] ' + func + ' 调用失败', err)
        wx.navigateTo({
          url: '../error/deployFunctions',
        })
      }
    })
  },

  reorderPlayers: function(data, field, desc){
    data.sort(function (player1, player2){
      let value1 = player1[field];
      let value2 = player2[field];
      if( desc){
        return value2 - value1;
      } else {
        return value1 - value2;
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
    getApp().globalData.clubid = this.data.clubid;
    this.getClubInfo(this.data.clubid);
    wx.hideShareMenu({});
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
    let player = getApp().globalData.userInfo;
    let clubinfo = getApp().globalData.clubinfo;
   
    return ({
      title: player.nickName + "邀请你加入" + clubinfo.wholeName,
      imageUrl: '../../images/background.jpg',
      path: '/pages/clubs/clubList?action=sharejoin&clubid=' + this.data.clubid,
    })
  },
})