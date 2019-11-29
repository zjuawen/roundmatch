// miniprogram/pages/matchList/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '比赛详情',
    dialogShow: false,
    buttons: [{ text: '取消' }, { text: '确定' }],
    clickIndex: 0,
  },

  onClickScore: function(event) {
    console.log(event);
    let index = event.target.dataset.index;
    this.openConfirm(index);
  },

  onClickNone: function (event) {
    console.log("onClickNone");
  },

  openConfirm: function (index) {
    this.setData({
      dialogShow: true,
      clickIndex: index,
    })
  },

  tapDialogButton(e) {
    this.setData({
      dialogShow: false,
      // showOneButtonDialog: false
    })
  },

  loadNewMatch: function (clubid, matchdata) {
    const db = wx.cloud.database();//({env:'test-roundmatch'});
    db.collection('players')
      .where({
        clubid: clubid
      })
      .get()
      .then(res => {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        console.log(res.data);
        this.setData({
          players: res.data
        });
        this.renderNewMatch(matchdata);
      })
  },

  renderNewMatch: function (matchdata) {
    let data = matchdata;
    for (let i = 0; i < data.length; i++) {
      data[i].playerName1 = this.playerToName(data[i].player1);
      data[i].playerName2 = this.playerToName(data[i].player2);
      data[i].playerName3 = this.playerToName(data[i].player3);
      data[i].playerName4 = this.playerToName(data[i].player4);
    }
    console.log(data)
    this.setData({
      games: data
    })
  },

  loadMatchData: function (clubid, matchid) {
    const db = wx.cloud.database();//({env:'test-roundmatch'});
    db.collection('players')
      .where({
        clubid: clubid
      })
      .get()
      .then(res => {
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        console.log(res.data);
        this.setData({
          players: res.data
        });
        this.loadGames(matchid);
      })
  },

  loadGames: function (matchid) {

    let func = 'matchService';
    let action = 'read';
    console.log(func + " " + action);

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        matchid: matchid
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        let data = res.result.data;
        for (let i = 0; i < data.length; i++) {
          data[i].playerName1 = this.playerToName(data[i].player1);
          data[i].playerName2 = this.playerToName(data[i].player2);
          data[i].playerName3 = this.playerToName(data[i].player3);
          data[i].playerName4 = this.playerToName(data[i].player4);
        }
        this.setData({
          games: data
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

  playerToName: function (playerid) {
    let data = this.data.players;
    for (let i = 0; i < data.length; i++) {
      if (data[i].id == playerid) {
        return data[i].name;
      }
    }
    return "ERR!";
  },

  onSaveMatch: function (event) {

    let func = 'matchService';
    console.log('saving match ...');

    wx.cloud.callFunction({
      name: func,
      data: {
        action: 'save',
        matchdata: this.data.matchdata,
        clubid: this.data.clubid,
        // remark: "test"
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result);
        this.onSaveOK();
      },
      fail: err => {
        console.error('[云函数] ' + func + ' 调用失败', err)
        wx.navigateTo({
          url: '../error/deployFunctions',
        })
      }
    })
  },

  onSaveOK: function () {
    this.setData({
      action:'old'
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let action = options.action;
    if (action == 'old') {
      this.setData({
        action: options.action,
        clubid: options.clubid,
        matchid: options.matchid
      });
      this.loadMatchData(this.data.clubid, this.data.matchid);
      // this.test(this.data.clubid, this.data.matchid);
    } else if (action == 'new') {
      var matchdata = JSON.parse(options.data);
      this.setData({
        action: options.action,
        clubid: options.clubid,
        matchdata: matchdata,
      });
      this.loadNewMatch(this.data.clubid, this.data.matchdata)
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

  },

  // test: function(clubid, matchid) {
  //   const db = wx.cloud.database();//({env:'test-roundmatch'});

  //   db.collection('games')
  //     .aggregate()
  //     .match({
  //       matchid: matchid,
  //     })
  //     .lookup({
  //       from: 'players',    //<要连接的集合名>,
  //       localField: 'player1',     //<输入记录的要进行相等匹配的字段>,
  //       foreignField: 'id',   //<被连接集合的要进行相等匹配的字段>,
  //       as: 'playerid1'              //<输出的数组字段名>
  //     })
  //     .end()
  //     .then(res => {
  //       // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
  //       console.log(res.list)
  //       this.setData({
  //         games: res.list
  //       })
  //     })
  // },
})