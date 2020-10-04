// miniprogram/pages/matchList/matchList.js
var APIs = require('../common/apis.js');
var Utils = require('../common/utils.js');

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
    slideButtonOne: [{
      type: 'warn',
      text: '删除',
      // src: '/page/weui/cell/icon_love.svg', // icon的路径
    }],

    defaultAvatar: '/images/user-unlogin.png',

    orderField: 'notSet',
    orderDesc: 'notSet',

    //tabbar
    tabIndex: 0,
    tabLabelList: [{
      "text": "比赛列表",
      "iconPath": "/images/match-list.svg",
      "selectedIconPath": "/images/match-list-selected.svg",
      // dot: true
    },
    {
      "text": "排行榜",
      "iconPath": "/images/match-statistic.svg",
      "selectedIconPath": "/images/match-statistic-selected.svg",
      // badge: 'New'
    }],

    //dialog
    clickIndex: 0,
    dialogShow: false,
    dialogBtns: [{ text: '取消' }, { text: '确定' }],
    tempName: '',

    showActionsheet: false,
    gameTypeNames: [
      { text: '轮转搭档循环', value: 1, type: 'warn', },
      { text: '固定搭档循环', value: 2 }
    ],

    filterShow: false,
    dateFrom: '2019-01-01',
    dateTo: Utils.getCurrentDate(),
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
        newData.forEach((item) => {
          if( !item.name){
            item.name = item.createDate;
          }
        });
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
          clubinfo: clubinfo,
          title: clubinfo.wholeName,
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

  onNewGame: function(gameType) {
    this.setData({
      showActionsheet: true
    })
    
  },

  onActionSheetClick: function(event){
    console.log(event);
    let value = event.detail.value;
    this.setData({
      showActionsheet: false
    })
    this.goPlayerList(value);
  },

  goPlayerList: function(value){
    if( value==2 ){
      wx.navigateTo({
        url: '../players/playerList?clubid=' + this.data.clubid + '&action=new&&type=fixpair',
      })
    } else { //if( value==1 )
      wx.navigateTo({
        url: '../players/playerList?clubid=' + this.data.clubid + '&action=new',
      })
    }
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
    
    let that = this;
    var date = null;

    if( this.data.dateFrom && this.data.dateTo) {
      date = {
        from: this.data.dateFrom,
        to: this.data.dateTo
      }
    }
    APIs.statisClub(this, clubid, date, res => {
      let data = res;
      data.forEach(function (item) {
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
    });
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

  onEditMatchTitle: function(event){
    console.log(event);
    let index = event.target.dataset.index;
    let data = this.data.matches;
    this.setData({
      tempName: data[index].name
    });
    
    this.openDialog(index);
  },

  //输入比分1
  inputNewName: function(e) {
    console.log(e);
    let value = e.detail.value;
    // let data = this.data.games;
    // data[this.data.clickIndex].score1 = parseInt(value);
    this.setData({
      tempName: value
    })
  },

  //比分输入框按钮
  tapDialogButton(e) {
    if( e.detail.index === 1){
      this.loading(true);
      let validat = this.setNewMatchName();
      if( validat ){
        this.onUpdateMatch(this.data.clickIndex);
      } else {
        this.loading(false);
      }
    } 
    this.setData({
      dialogShow: false,
      // showOneButtonDialog: false
    })
  },

  onUpdateMatch: function (index) {
    this.loading(true);

    let func = 'matchService';
    let action = 'update';
    console.log('update match ...');

    let data = this.data.matches;
    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        match: {
          matchid: data[index]._id,
          name: data[index].name,
        }
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result);
        let updated = res.result.data.updated;
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


  //修改比赛标题
  setNewMatchName: function() {
    let data = this.data.matches;
    let name = data[this.data.clickIndex].name;
    if( name == this.data.tempName){
      console.log("title not modified")
      return false;
    }
    data[this.data.clickIndex].name = this.data.tempName;
    this.setData({
      matches: data
    })
    return true;
  },

  //弹出输入框
  openDialog: function (index) {
    this.setData({
      dialogShow: true,
      clickIndex: index,
    })
  },

  onClickMatchCellButton: function(event) {
    console.log(event);
    let type = event.type;
    if( type != 'buttontap'){
      return;
    }
    let index = event.detail.index;
    if( index == 0 ){ 
      let matchid = event.currentTarget.dataset.matchid;
      this.oDeleteMatch(matchid);
    }
  },

  oDeleteMatch: function (matchid) {
    console.log('onDeleteGame');

    let clubid = this.data.clubid; 
    var that = this;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          console.log('确定删除');
          that.deleteMatch(clubid, matchid);
        } else if (sm.cancel) {
          console.log('取消删除');
        }
      }
    });
  },

  deleteMatch: function (clubid, matchid) {

    let that = this;
    
    APIs.deleteMatch(this, clubid, matchid, res => {
      that.setData({
        matches: [],
        pageNum: 1,
        noMore: false
      }); 
      that.loadMatches(that.data.clubid);
    })
  },

  onClickMatchCell: function(event) {
    console.log(event);
    let clubid = this.data.clubid;
    let matchid = event.currentTarget.dataset.matchid;
    wx.navigateTo({
      url: '../matches/detail?action=old&clubid=' + clubid + '&matchid=' + matchid,
    });
  },

  reorderPlayers: function(data, field, desc) {
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

  onSwitchFilter: function(e) {
    this.setData({
      filterShow: !this.data.filterShow,
    })
  },

  bindDateFromChange: function(e) {
    this.setData({
      dateFrom: e.detail.value
    })
  },

  bindDateToChange: function(e) {
    this.setData({
      dateTo: e.detail.value
    })
  },

  onFilter: function(e){
    console.log(e);
    this.loadPlayersStatistic(this.data.clubid);
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
    let shareUrl = '/pages/clubs/clubList?action=sharejoin&clubid=' + this.data.clubid;
    console.log(shareUrl)
    return ({
      title: player.nickName + "邀请你加入" + clubinfo.wholeName,
      imageUrl: '/images/background.jpg',
      path: shareUrl,
    })
  },
})