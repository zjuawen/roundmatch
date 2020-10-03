// miniprogram/pages/players/playerList.js

var APIs = require('../common/apis.js');

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

    searchShow: false,
    defaultAvatar: '/images/user-unlogin.png',
  },

  loading: function (value) {
    this.setData({
      loading: value
    });
  },

  loadPlayers: function(clubid) {

    let that = this;

    APIs.pagedClubPlayers(this, clubid, this.data.pageNum, this.data.pageSize,
      res => {
        let players = res;
        let newPlayers = [];
        players.forEach(function (player) {
          let exist = that.isAlreadySelected(player);
          if( !exist){
            let index = that.getPlayerIndexFromList(player);
            if( index < 0 ){
              newPlayers.push(player);
            } else {
              console.log('SKIP player: ' + player.name + ' already in list');
            }
          } else {
            console.log('SKIP player: ' + player.name + ' already in selected');
          }
        });

        newPlayers = that.data.players.concat(newPlayers);

        that.setData({
          noMore: (res.length < that.data.pageSize),
          players: newPlayers,
        })
      });
  },

  onDeselectPlayer: function(event) {
    console.log(event);

    let index = event.target.dataset.index;
    let slot = event.target.dataset.slot;
    
    this.removePlayerFromSelectedToList(index, slot);
  },

  removePlayerFromSelectedToList: function(index, slot){

    let players = this.data.players;
    let type = this.data.type;

    if( type == 'fixpair'){
      let selectedPlayerPairs = this.data.selectedPlayerPairs;

      let player = selectedPlayerPairs[index]['player'+slot];
      if( !player){
        console.log("deselect empty slot player");
        return;
      }

      players.push(player);
      selectedPlayerPairs[index]['player'+slot] = null;
      
      if( selectedPlayerPairs[index].player1 == null 
        && selectedPlayerPairs[index].player2 == null ){
        selectedPlayerPairs.splice(index, 1);
      }

      let count = 0;
      let empty = false;
      selectedPlayerPairs.forEach(item => {
        if( item.player1 && item.player2){
          count++;
        } else {
          empty = true;
        }
      })  
      let disable = empty || (count<4) || (count>8);
      
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

    this.movePlayerFromListToSelected(index);
  },

  movePlayerFromListToSelected: function(index){
    let players = this.data.players;
    let player = players[index];

    let exist = this.isAlreadySelected(player);
    if( exist ){
      console.log('already in selected ????');
      wx.showToast({
        icon:   'none',
        title:  '已经在选中的列表中',
      })
      return;
    }

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
      let empty = false;
      selectedPlayerPairs.forEach(item => {
        if( item.player1 && item.player2){
          count++;
        } else {
          empty = true;
        }
      })      
      let disable = empty || (count<4) || (count>8);
      
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

  isAlreadySelected: function(player){
    let id = player._id;
    let type = this.data.type;
    if( type == 'fixpair'){
      let selectedPlayerPairs = this.data.selectedPlayerPairs;
      for( let i = 0; i < selectedPlayerPairs.length; i++){
        for( let slot = 1; slot <= 2; slot++){
          let iPlayer = selectedPlayerPairs[i]['player' + slot];
          if( iPlayer && iPlayer._id == id){
            return true;
          }
        }
      }
    } else {
      let selectedPlayers = this.data.selectedPlayers;
      for( let i = 0; i < selectedPlayers.length; i++){
        let iPlayer = selectedPlayers[i];
        if( iPlayer && iPlayer._id == id){
          return true;
        }
      }
    }
    return false;
  },

  getSelectedPlayers: function() {
    let type = this.data.type;
    if( type == 'fixpair'){
      return this.data.selectedPlayerPairs;
    } else {
      return this.data.selectedPlayers;
    }
  },

  onPlayerSelectedDone: function(event) {
    let playerArray = this.getSelectedPlayers();
    var data = JSON.stringify(playerArray);
    wx.navigateTo({
      url: '../matches/detail?action=new&type=' + this.data.type 
          + '&clubid=' + this.data.clubid + '&players=' + data,
    });
  },

  search: function (value) {
    console.log("search: " + value);
    if( value.length == 0){
        this.loading(false);
        return new Promise((resolve, reject) => {
            resolve([]);
        });
    }
    this.loading(true);
    return this.searchPlayer(value);
  },

  searchPlayer: function(keyword) {
    let clubid = this.data.clubid;
    return APIs.searchPlayers(this, clubid, keyword).then (res => {
      let data = res.result.data;
      let players = [];
      data.forEach((player) => {
        players.push({
          text: player.name,
          value: {
            id: player._id,
            player: player,
          },
        })
      })
      this.loading(false);
      console.log(players);
      return players;
    })
  },

  onSelectResult: function (e) {
    console.log('select result', e.detail);

    let players = this.data.players;
    let player = e.detail.item.value.player;

    let exist = this.isAlreadySelected(player);
    if( exist ){
      console.log( player.name + ' already in selected');
      wx.showToast({
        icon:   'none',
        title:  '已经在选中的列表中',
      })
      return;
    }

    let index = this.getPlayerIndexFromList(player);
    if( index < 0){
      players.push(player);
      this.setData({
        players: players
      })
      index = players.length - 1;
    } else {
      console.log( player.name + ' already in list, move to selected');
    }
    this.movePlayerFromListToSelected(index);
  },

  onSearchBlur: function(e){
    console.log(e);
    this.setData({
      searchShow: false,
    })
  },

  onSwitchSearchBar: function(e){
   this.setData({
      searchShow: !this.data.searchShow,
    })
  },

  getPlayerIndexFromList: function(player){
    let id = player._id;

    let players = this.data.players;
    for (let i = 0; i < players.length; i++){
      let iPlayer = players[i];
      if( id == iPlayer._id){
        return i;
      }
    }
    return -1;
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
    this.setData({
        search: this.search.bind(this)
    })
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

  debug: function(e){
    console.log(e);
  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },

 
})