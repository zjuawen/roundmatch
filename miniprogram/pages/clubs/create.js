// miniprogram/pages/clubs/create.js
var APIs = require('../common/apis.js');
var Utils = require('../common/utils.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "创建俱乐部",
    mode: 'view', //'create', 'join'
    btnText: '确定',  // '创建', '加入'
    creator: '',
    wholeName: '',
    shortName: '',
    logo: '',
    password: '',
    password2: '',
    public: false,
    publicInfo: '不允许被其他人搜索到',
    fileList: [],
    loading: false,
  },

  loading: function (value) {
    this.setData({
      loading: value
    });
  },

  onCreateClub: function() {
    this.loading(true);

    let errMsg = null;
    if( this.data.wholeName.length == 0){
      errMsg = '请填写俱乐部名称';
    } else if( this.data.shortName.length == 0){
      errMsg = '请填写俱乐部缩写';
    } else if( this.data.password != this.data.password2){
      errMsg = '两次密码不一致';
    }

    if( errMsg){
      wx.showToast({
        icon: "none",
        title: errMsg,
        duration: 1000
      })
      this.loading(false);
    } else {
      this.createClub();
    }
    
  },

  onInputWholdName: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      wholeName: value
    })
  },

  onInputShortName: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      shortName: value
    })
  },

  onInputPassword: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      password: value
    })
  },

  onReinputPassword: function(e) {
    console.log(e);
    let value = e.detail.value;
    this.setData({
      password2: value
    })
  },

  onSwitchPublic: function(e) {
    console.log(e);
    let value = e.detail.value;
    let publicInfo = value? '允许被其他人搜索到':'不允许被其他人搜索到';
    this.setData({
      public: value,
      publicInfo: publicInfo,
    })
  },

  //创建俱乐部
  createClub: function(){
    let clubInfo = {
      wholeName: this.data.wholeName,
      shortName: this.data.shortName,
      logo: this.data.logo,
      public: this.data.public,
      password: this.data.password,
    }
    let userInfo = this.data.userInfo;

    APIs.createClub(clubInfo, userInfo, this, res => {
      let data = res;
        if( data.errCode == 1){
          wx.showToast({
            icon: "none",
            title: data.errMsg,
            duration: 1000
          })
        } else {
          wx.redirectTo({
            url: '../clubs/clubList',
          })
        }
    });
  },

  beforeRead: function(event) {
    console.log(event)
  },

  oversize: function(event){
    wx.showToast({ title: '请选择200K以下的图片', icon: 'none' });
  },

  afterRead: function(event) {
    console.log(event)
    const { file, callback } = event.detail;
    let fileObject = { path: file.path, status: 'uploading', message: '上传中' };
    this.setData({ fileList: [ fileObject ] });
    this.uploadToCloud();
  },

  deleteLogo: function(){
    this.setData({ 
      fileList:[],
      logo: ''
    });
  },

  uploadToCloud: function(){
    // 上传图片
    let filePath = this.data.fileList[0].path;

    let fileName = 'icon-' + Utils.getCurrentDateTime() + filePath.match(/\.[^.]+?$/)[0];
    const cloudPath = 'clubicons/' + fileName;
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        console.log('[上传文件] 成功：', res)
        if( res.errMsg == "cloud.uploadFile:ok"){
          var fileObject = {
            path: res.fileID,
            status: 'done',
            message: '',
          };
          this.setData({
            fileList: [ fileObject ],
            logo: res.fileID,
          })
        }
      }
    });
  },

  // 上传图片
  // uploadToCloud: function(){
  //   wx.cloud.init();
  //   // const fileList = this.data.logo;
  //   const { fileList } = this.data;
  //   if (!fileList.length) {
  //     wx.showToast({ title: '请选择图片', icon: 'none' });
  //   } else {
  //     const uploadTasks = fileList.map((file, index) => this.uploadFilePromise(`my-photo${index}.png`, file));
  //     Promise.all(uploadTasks)
  //       .then(data => {
  //         wx.showToast({ title: '上传成功', icon: 'none' });
  //         const newFileList = data.map(item => { url: item.fileID });
  //         this.setData({ cloudPath: data, fileList: newFileList });
  //       })
  //       .catch(e => {
  //         wx.showToast({ title: '上传失败', icon: 'none' });
  //         console.log(e);
  //       });
  //   }
  // },

  // uploadFilePromise: function(fileName, chooseResult) {
  //   return wx.cloud.uploadFile({
  //     cloudPath: fileName,
  //     filePath: chooseResult.path
  //   });
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if( options.action == 'create'){
      var userInfoObject = JSON.parse(decodeURIComponent(options.userInfo));
      console.log(userInfoObject);
      this.setData({
        userInfo: userInfoObject,
        creator: userInfoObject.nickName,
        btnText: '创建',
      })
    } else if( options.action == 'view'){
      this.setData({
        btnText: '确定',
      })
    } else if( options.action == 'join'){
      this.setData({
        btnText: '加入',
        clubid: options.clubid,
      })
      APIs.getClubInfo( options.clubid, this, res => {
        console.log(res);
      })
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

  }
})