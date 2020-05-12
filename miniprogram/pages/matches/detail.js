// miniprogram/pages/matchList/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '比赛详情',
    loading: false,
    
    saved: false,
    matches: [],
    games: [],
    matchPlayers: [],  //该次比赛参与人员
    matchDone: false,
    
    //高亮
    highlight: "",
    
    //dialog
    clickIndex: 0,
    dialogShow: false,
    dialogBtns: [{ text: '取消' }, { text: '确定' }],
    tempScore1: 0,
    tempScore2: 0,

    //select match
    matchIndex: 0,
    matchNameList: [
    ],
    showActionsheet: false,

    //tabbar
    tabIndex: 0,
    tabLabelList: [{
      "text": "比分",
      "iconPath": "../../images/score.svg",
      "selectedIconPath": "../../images/score_selected.svg",
      // dot: true
    },
    {
      "text": "统计",
      "iconPath": "../../images/stats.svg",
      "selectedIconPath": "../../images/stats_selected.svg",
      // badge: 'New'
    }],


    expand: true,

  },

  loading: function (value) {
    this.setData({
      loading: value
    });
  },

  //切换比分详情和统计tab
  tabChange(e) {
    console.log('tab change', e);
    let index = e.detail.index;
    let title = (index == 0) ? '比赛详情' : '统计';
    if( index == 0 ){
      let tabLabelList = this.data.tabLabelList;
      if( tabLabelList[0].badge != null){
        tabLabelList[0].badge = null;
        this.setData({
          tabLabelList: tabLabelList
        })
      }
    }
    this.setData({
      title: title,
      tabIndex:index
    });
  },

  //点击vs输入比分
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

  //长按比分修改
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

  //点击队员高亮显示
  onTapPlayer: function(e) {
    console.log(e);
    let id = e.target.dataset.id;
    if( id == this.data.highlight){
      id = "";
    }
    this.setData({
      highlight: id
    });
  },


  onClickNone: function (event) {
    console.log("onClickNone");
  },

  //弹出比分输入框
  openConfirm: function (index) {
    this.setData({
      dialogShow: true,
      clickIndex: index,
    })
  },

  //比分输入框按钮
  tapDialogButton(e) {
    if( e.detail.index === 1){
      this.loading(true);
      let validat = this.setScoreToGameData();
      if( validat){
        this.onSaveGame(this.data.clickIndex);
      }else {
        this.loading(false);
      }
    } 
    this.setData({
      dialogShow: false,
      // showOneButtonDialog: false
    })
  },

  //修改比分
  setScoreToGameData: function() {
    let data = this.data.games;
    let oldscore1 = data[this.data.clickIndex].score1;
    let oldscore2 = data[this.data.clickIndex].score2;
    if( (oldscore1 == this.data.tempScore1)
      && (oldscore2 == this.data.tempScore2) ){
      console.log("score not modified")
      return false;
    }
    if( (this.data.tempScore1 < 0)
      || (this.data.tempScore2 < 0) ){
      console.log("invalid scores: " + this.data.tempScore1 + "," + this.data.tempScore2);
      return false;
    }
    data[this.data.clickIndex].score1 = this.data.tempScore1;
    data[this.data.clickIndex].score2 = this.data.tempScore2;
    this.setData({
      games: data
    })
    return true;
  },

  // getScore1: function(index) {
  //   console.log("getScore1: " + index);
  //   return this.data.tempScore1;
  // },
  
  //输入比分1
  inputScore1: function(e) {
    console.log(e);
    let value = e.detail.value;
    // let data = this.data.games;
    // data[this.data.clickIndex].score1 = parseInt(value);
    this.setData({
      tempScore1: parseInt(value)
    })
  },

  //输入比分2
  inputScore2: function(e) {
    console.log(e);
    let value = e.detail.value;
    // let data = this.data.games;
    // data[this.data.clickIndex].score2 = parseInt(value);
    this.setData({
      tempScore2: parseInt(value)
    })
  },

  //保存单局比分
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

  //开始读取新建的比赛
  loadNewMatch: function (clubid, matchArray) {
    this.loading(true);

    let func = 'userService';
    let action = 'listAll';
    console.log(func + " " + action);

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        clubid: clubid,
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        let data = res.result.data;
         data.forEach(function (item){
          if( item.avatarUrl == null){
            item.avatarUrl = '../../images/user-unlogin.png';
          }
        });
        this.setData({
          players: data
        });
        this.renderNewMatch(matchArray);
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

  //显示新建的比赛数据
  renderNewMatch: function (matchArray) {
    let gameTitles = [];
    for( let n = 0; n<matchArray.length; n++){
      let data = matchArray[n].data;
      for (let i = 0; i < data.length; i++) {
        data[i].playerInfo1 = this.getPlayerById(data[i].player1);
        data[i].playerInfo2 = this.getPlayerById(data[i].player2);
        data[i].playerInfo3 = this.getPlayerById(data[i].player3);
        data[i].playerInfo4 = this.getPlayerById(data[i].player4);
      }
      let type = 'default';
      if( n == 0){
        type = 'warn';
      }
      gameTitles.push({
        text: matchArray[n].name,
        type: type,
        value: n
      });
      console.log(data);
    }
    this.setData({
      matches: matchArray,
      games: matchArray[0].data,
      gamename: matchArray[0].name,
      matchIndex: 0,
      matchNameList: gameTitles,
    });
  },

  //加载比赛数据
  loadMatchData: function (clubid, matchid) {
    this.loading(true);

    let func = 'userService';
    let action = 'listAll';
    console.log(func + " " + action);

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        clubid: clubid,
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result.data);
        let data = res.result.data;
        data.forEach(function (item){
          if( item.avatarUrl == null){
            item.avatarUrl = '../../images/user-unlogin.png';
          }
        });
        this.setData({
          players: data
        });
        this.loadGames(matchid);
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

  //读取单局比赛数据
  loadGames: function (matchid) {
    this.loading(true);

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
          data[i].playerInfo1 = this.getPlayerById(data[i].player1);
          data[i].playerInfo2 = this.getPlayerById(data[i].player2);
          data[i].playerInfo3 = this.getPlayerById(data[i].player3);
          data[i].playerInfo4 = this.getPlayerById(data[i].player4);
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

  //
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

  //统计
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
      } else if( delta < 0){
        players[index1].lost++;
        players[index2].lost++;
        players[index3].win++;
        players[index4].win++;
      } else {
        //draw game
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
    if (isNaN(rate1) ){ 
      rate1 = 0;
    }
    if (isNaN(rate2) ){ 
      rate2 = 0;
    }
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
        return player._id == id;
      }
    ); 
  },

  getPlayerById: function (playerid) {
    let data = this.data.players;
    for (let i = 0; i < data.length; i++) {
      if (data[i]._id == playerid) {
        this.addToMatchPlayers(data[i]);
        return data[i];
      }
    }
    return "ERR!";
  },

  onSaveMatch: function (event) {
    this.loading(true);

    let func = 'matchService';
    let action = 'save';
    console.log('saving match ...');

    let playerCount = this.data.matchPlayers.length;
    console.log('total ' + playerCount + " players");

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        matchdata: this.data.games,
        playerCount: playerCount,
        clubid: this.data.clubid,
        // remark: "test"
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result);
        let matchid = res.result.data.matchid;
        this.setData({
          matchid: matchid
        })
        this.loadMatchData(this.data.clubid, matchid);
        this.onSaveOK();
        
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

  onSaveOK: function () {
    this.setData({
      action: 'old',
      saved: true,
      vsBtnDisable: false
    });
    this.initWatch();
  },

  onSelectMatch: function(e) {
    if( this.data.matchNameList.length<2){
      console.log('无其他可选赛制');
      return;
    }
    this.setData({
      showActionsheet: true
    });
  },

  onAsClick: function(e) {
    console.log(e);
    let value = e.detail.value;
    let matchArray = this.data.matches;
    let gameTitles = [];
    for( let n = 0; n<matchArray.length; n++){
      let type = 'default';
      if( n == value){
        type = 'warn';
      }
      gameTitles.push({
        text: matchArray[n].name,
        type: type,
        value: n
      });
    }
    this.setData({
      matchIndex: value,
      games: matchArray[value].data,
      gamename: matchArray[value].name,
      matchNameList: gameTitles,
      showActionsheet: false
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
        matchid: options.matchid,
        saved: true,
        vsBtnDisable: false
      });
      this.loadMatchData(this.data.clubid, this.data.matchid);
      // this.test(this.data.clubid, this.data.matchid);
    } else if (action == 'new') {
      var matchArray = JSON.parse(options.data);
      // var matchdata = JSON.parse(options.data);
      this.setData({
        action: options.action,
        clubid: options.clubid,
        matchArray: matchArray,
        saved: false,
        vsBtnDisable: true
      });
      this.loadNewMatch(this.data.clubid, this.data.matchArray)
    }
    this.readUserConfig()
  },

  onGamesDataChange: function() {
    if( this.data.tabIndex == 0){
      this.setData({
        dialogShow: false
      });
    } else {
      let tabLabelList = this.data.tabLabelList;
      tabLabelList[0].badge = "New";
      this.setData({
        tabLabelList: tabLabelList
      })
    }
    this.loadMatchData(this.data.clubid, this.data.matchid);
  },

  //开始监听比分更新
  initWatch: async function() {
    this.stopWatch();
    this.try(() => {
      const db = wx.cloud.database();
      const _ = db.command

      console.log(`initWatch`);

      const messageListener = 
        db.collection('games')
          .where({
            matchid: this.data.matchid,
          })
          .watch({
            onChange: this.onGamesDataChange.bind(this),
            onError: e => {
              console.log("监听错误：" + e);
              this.initWatch();
            }
          });

      this.setData({
        messageListener: messageListener
      })
    }, '初始化监听失败')
  },

  //停止监听更新
  stopWatch: function() {
    console.log("stopWatch");
    if( this.data.messageListener != null){
      this.data.messageListener.close();
    }
  },

  try: async function(fn, title) {
    try {
      await fn()
    } catch (e) {
      this.showError(title, e)
    }
  },  

  showError: function(title, content, confirmText, confirmCallback) {
    console.error(title, content)
    wx.showModal({
      title,
      content: content.toString(),
      showCancel: confirmText ? true : false,
      confirmText,
      success: res => {
        res.confirm && confirmCallback()
      },
    })
  },

  readUserConfig: function(){
    this.loading(true);

    let func = 'userService';
    let action = 'readconfig';
    console.log('reading user config ...');

    let key = 'expand';

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        key: key,
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result);
        let value = res.result.data;
        if( value != null){
          this.setData({
            expand: value
          })
        }
        this.loading(false);
      },
      fail: err => {
        console.error('[云函数] ' + func + ' 调用失败', err)
        this.loading(false);
      }
    })
  },

  onTapShrink: function (){
    this.setData({
      expand: !this.data.expand,
    })

    this.loading(true);

    let func = 'userService';
    let action = 'saveconfig';
    console.log('saving user config ...');

    let key = 'expand';
    let value = this.data.expand;

    wx.cloud.callFunction({
      name: func,
      data: {
        action: action,
        key: key,
        value: value,
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result);
        this.loading(false);
      },
      fail: err => {
        console.error('[云函数] ' + func + ' 调用失败', err)
        this.loading(false);
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
    if( this.data.saved){
      this.initWatch();
    }
    this.setData({
      highlight: ''
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopWatch();
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