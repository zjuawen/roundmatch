// miniprogram/pages/players/playerList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "选择人员",
    loading: false,
    type: 'nonefix',
    selectedPlayers: [],
    selectedPlayerPairs: [],
    selectCount: 0,
    players: [],

    nextDisable: true,

    pageNum: 1, //初始页默认值为1
    pageSize: 10,
    noMore: false,
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
        clubid: clubid,
        pageNum: this.data.pageNum, 
        pageSize: this.data.pageSize,
      },
      success: res => {
        console.log('[云函数] ' + func + ' return: ', res.result);
        let data = res.result.data;
        data.forEach(function (item) {
          item.checked = false;
          if( item.avatarUrl == null){
            item.avatarUrl = '/images/user-unlogin.png';
          }
        });

        let newData = res.result.data;
        this.setData({
          noMore: (newData.length < this.data.pageSize)
        });
        newData = this.data.players.concat(newData);

        this.setData({
          players: newData
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

  onDeselectPlayer: function(event) {
    console.log(event);

    let players = this.data.players;
    let index = event.target.dataset.index;
    
    let type = this.data.type;

    if( type == 'fixpair'){
      let selectedPlayerPairs = this.data.selectedPlayerPairs;
      let slot = event.target.dataset.slot;

      if( slot == 0){
        let player = selectedPlayerPairs[index].player1;
        players.push(player);
        selectedPlayerPairs[index].player1 = null;
      } else {
        let player = selectedPlayerPairs[index].player2;
        players.push(player);
        selectedPlayerPairs[index].player2 = null;
      }
      
      if( selectedPlayerPairs[index].player1 == null 
        && selectedPlayerPairs[index].player2 == null ){
        selectedPlayerPairs.splice(index, 1);
      }

      let count = 0;
      selectedPlayerPairs.forEach(item => {
        if( item.player1 && item.player2){
          count++;
        }
      })  
      let disable = (count<4)||(count>8);
      
      this.setData({
        selectedPlayerPairs: selectedPlayerPairs,
        players: players,
        selectCount: count,
        nextDisable: disable
      })
    } else {
      let selectedPlayers = this.data.selectedPlayers;
      let player = selectedPlayers[index];

      players.push(player);
      selectedPlayers.splice(index, 1);
  
      let count = selectedPlayers.length;
      let disable = (count<4)||(count>8);
      
      this.setData({
        selectedPlayers: selectedPlayers,
        players: players,
        selectCount: count,
        nextDisable: disable
      })
    }
  },

  onSelectPlayer: function(event) {
    console.log(event);

    let index = event.target.dataset.index;
    let players = this.data.players;
    let player = players[index];

    let type = this.data.type;
    if( type == 'fixpair'){
      let selectedPlayerPairs = this.data.selectedPlayerPairs;

      let done = false;
      for( let i = 0; i < selectedPlayerPairs.length; i++){
        if( selectedPlayerPairs[i].player1 == null){
          selectedPlayerPairs[i].player1 = player;
          done = true;
          break;
        } else if( selectedPlayerPairs[i].player2 == null){
          selectedPlayerPairs[i].player2 = player;
          done = true;
          break;
        }
      }

      if( !done){
        selectedPlayerPairs.push({
          player1: player,
          player2: null
        });
      }

      players.splice(index, 1);

      let count = 0;
      selectedPlayerPairs.forEach(item => {
        if( item.player1 && item.player2){
          count++;
        }
      })      
      let disable = (count<4)||(count>8);

      this.setData({
        selectedPlayerPairs: selectedPlayerPairs,
        players: players,
        selectCount: count,
        nextDisable: disable
      })

    } else {
      let selectedPlayers = this.data.selectedPlayers;

      selectedPlayers.push(player);
      players.splice(index, 1);

      let count = selectedPlayers.length;
      let disable = (count<4)||(count>8);
   
      this.setData({
        selectedPlayers: selectedPlayers,
        players: players,
        selectCount: count,
        nextDisable: disable
      })
     }
  },

  // onSelectPlayer: function(event) {
  //   console.log(event);
  //   let data = this.data.players;
  //   let playerid = event.target.dataset.id;
  //   for( let i = 0; i<data.length; i++){
  //     if( data[i]._id == playerid){
  //       data[i].checked = !data[i].checked;
  //       let count = this.data.selectedCount;
  //       if( data[i].checked){
  //         count++;
  //       } else {
  //         count--;
  //       }
  //       let disable = (count<4)||(count>8);
  //       this.setData({ 
  //         players:data,
  //         selectedCount: count,
  //         nextDisable: disable
  //       });
  //       return;
  //     }
  //   }
  // },

  getSelectedPlayers: function() {
    // let data = this.data.players;
    // let playerArray = [];
    // for( let i = 0; i<data.length; i++){
    //   if( data[i].checked){
    //      playerArray.push(data[i]._id)
    //   }
    // }
    // console.log("getSelectedPlayers return: " + playerArray);
    // 
    // return playerArray;
    return this.data.selectedPlayers;
  },

  onPlayerSelectedDone: function(event) {
    let playerArray = this.getSelectedPlayers();
    var data = JSON.stringify(playerArray);
    wx.navigateTo({
      url: '../matches/detail?action=new&clubid=' + this.data.clubid + '&players=' + data,
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      clubid: options.clubid,
      action: options.action,
      type: options.type,
      players: [],
      selectedPlayers: [],
      selectedPlayerPairs: [],
      selectCount: 0,
      pageNum: 1,
      noMore: false
    });
    this.loadPlayers(this.data.clubid);
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
    this.loadPlayers(this.data.clubid);
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },

 
})