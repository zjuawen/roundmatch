// miniprogram/pages/matchList/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '比赛详情',
    loading: false,
    
    games: [],
    matchPlayers: [],  //该次比赛参与人员
    matchDone: false,
    
    //dialog
    clickIndex: 0,
    dialogShow: false,
    dialogBtns: [{ text: '取消' }, { text: '确定' }],
    tempScore1: 0,
    tempScore2: 0,

    //tabbar
    tabIndex: 0,
    list: [{
      "text": "比分",
      "iconPath": "../../images/score.svg",
      "selectedIconPath": "../../images/score.svg",
      dot: true
    },
    {
      "text": "统计",
      "iconPath": "../../images/stats.svg",
      "selectedIconPath": "../../images/stats.svg",
      // badge: 'New'
    }],

  },

  loading: function (value) {
    this.setData({
      loading: value
    });
  },

  tabChange(e) {
    console.log('tab change', e);
    let index = e.detail.index;
    this.setData({tabIndex:index});
  },

  onClickScore: function(event) {
    console.log(event);
    let index = event.target.dataset.index;
    let data = this.data.games;
    this.setData({
      tempScore1: data[index].score1,
      tempScore2: data[index].score2
    });
    
    this.openConfirm(index);
  },

  onLongPressScore: function(event) {
    console.log(event);
    let index = event.target.dataset.index;
    let data = this.data.games;
    this.setData({
      tempScore1: data[index].score1,
      tempScore2: data[index].score2
    });
    
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
    if( e.detail.index === 1){
      this.loading(true);
      this.setScoreToGameData();
      this.onSaveGame(this.data.clickIndex);
    } 
    this.setData({
      dialogShow: false,
      // showOneButtonDialog: false
    })
  },

  setScoreToGameData: function() {
    let data = this.data.games;
    data[this.data.clickIndex].score1 = this.data.tempScore1;
    data[this.data.clickIndex].score2 = this.data.tempScore2;
    this.setData({
      games: data
    })
  },

  // getScore1: function(index) {
  //   console.log("getScore1: " + index);
  //   return this.data.tempScore1;
  // },
  
  inputScore1: function(e) {
    console.log(e);
    let value = e.detail.value;
    // let data = this.data.games;
    // data[this.data.clickIndex].score1 = parseInt(value);
    this.setData({
      tempScore1: parseInt(value)
    })
  },

  inputScore2: function(e) {
    console.log(e);
    let value = e.detail.value;
    // let data = this.data.games;
    // data[this.data.clickIndex].score2 = parseInt(value);
    this.setData({
      tempScore2: parseInt(value)
    })
  },

  onSaveGame: function(gameIndex) {
    let func = 'gameService';
    let action = 'save';
    console.log(func + " " + action);

    let gamedata = this.data.games[gameIndex];

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        gamedata: gamedata,
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        this.statistic();
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
          players: res.data,
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
    console.log(data);
    this.setData({
      games: data
    });
    this.loading(false);
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
        this.setData({
          matchPlayers:[]
        });
        for (let i = 0; i < data.length; i++) {
          data[i].playerName1 = this.playerToName(data[i].player1);
          data[i].playerName2 = this.playerToName(data[i].player2);
          data[i].playerName3 = this.playerToName(data[i].player3);
          data[i].playerName4 = this.playerToName(data[i].player4);
        }
        this.setData({
          games: data
        })
        this.statistic();
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

  addToMatchPlayers: function (player) {
    let data = this.data.matchPlayers;
    
    let found = false;
    for (let i = 0; i < data.length; i++) {
      if( data[i]._id == player._id){
        found = true;
        break;
      }
    }

    if( !found){
      player.win = 0;
      player.lost = 0;
      player.delta = 0;
      player.total = 0;
      
      data.push(player);
      console.log('addToMatchPlayers: ' + player.name);
    }

    this.setData({
      matchPlayers: data
    });
  },

  statistic: function () {
    
    let players = this.data.matchPlayers;
    let done = true;

    //clear
    for( let player of players) {
      player.win = 0;
      player.lost = 0;
      player.delta = 0;
      player.total = 0;
    }

    //start statis
    for( let game of this.data.games) {
      let score1 = game.score1;
      let score2 = game.score2;
      if( score1 < 0 || score2 < 0){
        done = false;
        continue;
      }
      let delta = score1 - score2;

      let index1 = this.findMatchPlayerIndex(players, game.player1);
      let index2 = this.findMatchPlayerIndex(players, game.player2);
      let index3 = this.findMatchPlayerIndex(players, game.player3);
      let index4 = this.findMatchPlayerIndex(players, game.player4);
      players[index1].delta += delta;
      players[index2].delta += delta;
      players[index3].delta -= delta;
      players[index4].delta -= delta;

      players[index1].total += score1;
      players[index2].total += score1;
      players[index3].total += score2;
      players[index4].total += score2;
     
      if( delta > 0){
        players[index1].win++;
        players[index2].win++;
        players[index3].lost++;
        players[index4].lost++;
      } else {
        players[index1].lost++;
        players[index2].lost++;
        players[index3].win++;
        players[index4].win++;
      }
    }

    //sort
    players.sort( this.comparePlayer);

    this.setData({
      matchDone: done,
      matchPlayers: players
    })

  },

  comparePlayer: function(player1, player2) {
    //比较胜率
    let rate1 = Math.round((player1.win/(player1.win+player1.lost))*100)*100;
    let rate2 = Math.round((player2.win/(player2.win+player2.lost))*100)*100;
    if( rate1 != rate2){
      return rate2 - rate1;
    }

    //比较净胜分
    let delta1 = player1.delta;
    let delta2 = player2.delta;
    if( delta1 != delta2){
      return delta2 - delta1;
    }

    //比较总得分
    let total1 = player1.total;
    let total2 = player2.total;
    if( total1 != total2){
      return total2 - total1;
    }
  },

  findMatchPlayerIndex: function( players, id ) { 
    return players.findIndex(
      function(player, index, array){
        return player.id == id;
      }
    ); 
  },

  playerToName: function (playerid) {
    let data = this.data.players;
    for (let i = 0; i < data.length; i++) {
      if (data[i].id == playerid) {
        this.addToMatchPlayers(data[i]);
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
    this.loading(true);
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