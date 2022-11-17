//error.js

// const app = getApp()
const showError = require('../common/utils').showError;


Page({
  data: {
    errorMsg: '',
  },

  redirect: function() {
    wx.redirectTo({
      url: '../index/login',
    })
    return;
  },

  onLoad: function() {

  },


})