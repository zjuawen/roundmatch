// miniprogram/pages/clubs/clubList.js
// var app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        title: "俱乐部",
        login: false,
        openid: '',
        avatarUrl: '../../images/user-unlogin.png',
        loading: false,
        buttons: [{
            text: '取消'
        }, {
            text: '确定'
        }],
        joinDialogShow: false,
        sharejoin: false,
        authDialogShow: false,
        authDialogMessage: '',
        createClubEnable: false,
        // inputShowed: false,
        // inputVal: "",
        notice: "新版本上线！增加了搜索俱乐部的功能，用户可以通过搜索找到并加入标记为公开的俱乐部了！",
        debug: false,
    },
    loading: function(value) {
        this.setData({
            loading: value
        });
    },
    loadUserinfo: function() {
        // 获取用户信息
        wx.getSetting({
            success: res => {
                console.log(res);
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            console.log(res.userInfo);
                            getApp().globalData.userInfo = res.userInfo;
                            this.setData({
                                avatarUrl: res.userInfo.avatarUrl,
                                userInfo: res.userInfo,
                                login: true
                            })
                            this.updateUserInfo(res.userInfo);
                            if (this.data.sharejoin) {
                                wx.hideLoading();
                                this.onSharedJoin(this.data.sharedclubid);
                            }
                        }
                    })
                } else {
                    console.log("Unauthrorized: authSetting['scope.userInfo'] null");
                    // console.log("wx.authorize scope.userInfo");
                    // wx.authorize({
                    //   scope: 'scope.userInfo',
                    //   success () {
                    //     console.log("wx.authorize scope.userInfo");
                    //   }
                    // })
                    // this.showAuthDialog(true);
                    this.setData({
                        login: false
                    })
                    if (this.data.sharejoin) {
                        wx.hideLoading();
                        this.showAuthDialog(true, "加入俱乐部需要用户昵称，头像等信息");
                    }
                }
            }
        })
    },
    //更新用户信息
    updateUserInfo: function(userInfo) {
        this.loading(true);
        let func = 'userService';
        let action = 'update';
        console.log(func + " " + action);
        wx.cloud.callFunction({
            name: func,
            data: {
                action: action,
                userInfo: userInfo,
            },
            success: res => {
                console.log('[云函数] ' + func + ' return: ', res.result.data);
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
    getOpenid: async function() {
        this.loading(true);
        let func = 'userService';
        let action = 'login';
        console.log(func + " " + action);
        wx.cloud.callFunction({
            name: func,
            data: {
                action: action
            },
            success: res => {
                console.log('[云函数] ' + func + ' return: ', res.result.data);
                let data = res.result.data;
                this.setData({
                    openid: data.openid
                });
                this.loadClubs();
            },
            fail: err => {
                console.error('[云函数] ' + func + ' 调用失败', err)
                wx.navigateTo({
                    url: '../error/deployFunctions',
                })
            }
        })
    },
    loadClubs: function() {
        this.loading(true);
        let func = 'clubService';
        let action = 'list';
        console.log(func + " " + action);
        wx.cloud.callFunction({
            name: func,
            data: {
                action: action
            },
            success: res => {
                console.log('[云函数] ' + func + ' return: ', res.result.data);
                let data = res.result.data;
                this.setData({
                    clubs: data.private,
                    publicClubs: [], //data.public
                })
                this.reducePublicClubs();
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
    search: function(value) {
        console.log("searching: " + value);
        if (value != "demo") {
            return;
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve([{
                    text: 'DEMO俱乐部',
                    value: 1
                }])
            }, 200)
        })
    },
    selectResult: function(e) {
        console.log('select result', e.detail);
        // this.loading(true);
        // let func = 'clubService';
        // let action = 'join';
        // console.log(func + " " + action);
        // wx.cloud.callFunction({
        //   name: func,
        //   data: {
        //     action: action
        //   },
        //   success: res => {
        //     console.log('[云函数] ' + func + ' return: ', res.result.data);
        //     let data = res.result.data;
        //     this.setData({
        //       clubs: data
        //     })
        //     this.loading(false);
        //   },
        //   fail: err => {
        //     console.error('[云函数] ' + func + ' 调用失败', err)
        //     wx.navigateTo({
        //       url: '../error/deployFunctions',
        //     })
        //   }
    },
    onNewClub: function() {
        // this.onGetOpenid();
        wx.navigateTo({
            url: './create',
        })
    },
    onClickPublicClub: function(e) {
        console.log(e);
        let data = e.currentTarget.dataset.item;
        this.setData({
            selected: data,
            joinDialogShow: true,
        })
    },
    onInputPassword: function(e) {
        console.log(e);
        let data = e.detail.value;
        this.setData({
            password: data
        });
    },
    tapDialogButton(e) {
        let btnIndex = e.detail.index;
        if (btnIndex === 1) {
            this.loading(true);
            this.joinClub(this.data.selected._id);
        }
        this.setData({
            joinDialogShow: false
        })
    },
    onCancelAuthDialog: function(e) {
        // console.log(e);
        this.setData({
            authDialogShow: false
        })
    },
    joinClub: function(clubid) {
        let func = 'clubService';
        let action = 'join';
        console.log(func + " " + action);
        wx.cloud.callFunction({
            name: func,
            data: {
                action: action,
                clubid: clubid,
                userInfo: this.data.userInfo,
                password: this.data.password
            },
            success: res => {
                this.loading(false);
                console.log('[云函数] ' + func + ' return: ', res.result.data);
                let data = res.result.data;
                if (data.status == 'fail') {
                    wx.showToast({
                        title: data.errMsg,
                        icon: 'none',
                    });
                } else if (data._id.length > 0) {
                    wx.showToast({
                        icon: 'success'
                    });
                    this.data.clubs.push(this.data.selected);
                    this.reducePublicClubs();
                    this.setData({
                        clubs: this.data.clubs
                    });
                }
                this.setData({
                    joinDialogShow: false
                });
            },
            fail: err => {
                console.error('[云函数] ' + func + ' 调用失败', err)
                wx.navigateTo({
                    url: '../error/deployFunctions',
                })
            }
        })
    },
    reducePublicClubs: function() {
        let publicClubs = this.data.publicClubs;
        let privateClubs = this.data.clubs;
        publicClubs = publicClubs.filter(function(publicClub) {
            let keep = true;
            privateClubs.forEach(function(privateClub) {
                if (publicClub._id == privateClub._id) {
                    keep = false;
                }
            });
            return keep;
        });
        this.setData({
            publicClubs: publicClubs
        })
    },
    onGetUserInfo: function(e) {
        console.log(e);
        if (e.detail.userInfo != null) {
            this.setData({
                login: true,
                avatarUrl: e.detail.userInfo.avatarUrl,
                userInfo: e.detail.userInfo
            })
        }
        if (this.data.sharejoin) {
            this.showAuthDialog(false);
            this.onSharedJoin(this.data.sharedclubid);
        } else {
            this.onClickPublicClub(e);
        }
    },
    showAuthDialog: function(show, msg) {
        if (show) {
            this.setData({
                authDialogShow: show,
                authDialogMessage: msg,
            })
            console.log(this.data.authDialogMessage)
        } else {
            this.setData({
                authDialogShow: show,
            })
        }
    },
    onJoinClub: function(clubid) {
        wx.showLoading({
            title: '获取俱乐部信息',
            mask: true
        })
        this.loading(true);
        let func = 'clubService';
        let action = 'info';
        console.log(func + " " + action);
        wx.cloud.callFunction({
            name: func,
            data: {
                action: action,
                clubid: clubid,
            },
            success: res => {
                console.log('[云函数] ' + func + ' return: ', res.result.data);
                this.loading(false);
                wx.hideLoading();
                let data = res.result.data;
                let e = {
                    currentTarget: {
                        dataset: {
                            item: data
                        }
                    }
                };
                if (data != null) {
                    this.onClickPublicClub(e);
                } else {
                    wx.showToast({
                        title: '错误：俱乐部信息不存在'
                    })
                }
            },
            fail: err => {
                console.error('[云函数] ' + func + ' 调用失败', err)
                wx.hideLoading();
                wx.navigateTo({
                    url: '../error/deployFunctions',
                })
            }
        });
    },
    onCreateClub: function(e) {
        console.log("onCreateClub");
        if (this.data.login) {
            var userInfo = encodeURIComponent(JSON.stringify(this.data.userInfo));
            wx.navigateTo({
                url: '../clubs/create?userInfo=' + userInfo,
            })
        } else {
            this.showAuthDialog(true, "创建俱乐部需要用户昵称，头像等信息");
        }
    },
    checkCreateClubEnable: function() {
        let func = 'clubService';
        let action = 'listByOwner';
        console.log(func + " " + action);
        let that = this;
        wx.cloud.callFunction({
            name: func,
            data: {
                action: action,
            },
            success: res => {
                this.loading(false);
                let data = res.result.data;
                console.log('[云函数] ' + func + ' return: ', res.result.data);
                // if( data.list.size){
                //    wx.showToast({
                //     icon: "none",
                //     title: data.errMsg,
                //     duration: 1000
                //   })
                // }
                that.setData({
                    createClubEnable: (data == null) || (data.length <= 0),
                })
            }
        });
    },
    searchClubs: function(keyword) {
        let func = 'clubService';
        let action = 'search';
        console.log(func + " " + action);
        let that = this;
        return  wx.cloud.callFunction({
            name: func,
            data: {
                action: action,
                keyword: keyword,
            },
        }).then( res =>  {
            // success: res  =>  {
                this.loading(false);
                let data = res.result.data;
                console.log('[云函数] ' + func + ' return: ', res.result.data);
                let clubs = [];
                data.forEach((club) => {
                    clubs.push({
                        text: club.wholeName + '(' + club.shortName + ')',
                        value: club._id,
                    })
                })
                console.log(clubs);
                return clubs;
                // resolve(clubs);
            // }
        });
    },
    onClickDownloadManual: function(e) {
        // let url = 'cloud://roundmatch.726f-roundmatch-1300750420/documents/羽毛球双打轮转小程序使用手册.pdf';
        let url = 'cloud://test-roundmatch.7465-test-roundmatch-1300750420/documents/羽毛球双打轮转小程序使用手册.pdf';
        wx.cloud.downloadFile({
            fileID: url
        }).then(res => {
            // get temp file path
            console.log(res.tempFilePath)
            let filePath = res.tempFilePath;
            wx.openDocument({
                filePath: filePath,
                success: function(res) {
                    console.log('打开文档成功');
                }
            })
        }).catch(error => {
            // handle error
        })
    },
    search: function (value) {
        console.log("search: " + value);
        if( value.length == 0){
            return new Promise((resolve, reject) => {
                resolve([]);
            });
        }
        this.loading(true);
        return this.searchClubs(value);
        // return this.searchClubs(value);
        // return new Promise((resolve, reject) => {
        //     // setTimeout(() => {
        //     //     resolve([{text: '搜索结果', value: 1}, {text: '搜索结果2', value: 2}])
        //     // }, 200)
        // })
    },
    selectResult: function (e) {
        console.log('select result', e.detail);
        let clubid = e.detail.item.value;
        this.onJoinClub(clubid);
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log("clublist onload");
        this.getOpenid();
        this.loadUserinfo();
        let action = options.action;
        if (action == 'sharejoin') {
            let clubid = options.clubid;
            console.log("share invited to clubid: " + clubid);
            this.setData({
                sharejoin: true,
                sharedclubid: clubid
            })
            if (!this.data.login) {
                wx.showLoading({
                    title: '检查授权信息',
                    mask: true
                })
            } else {
                this.onJoinClub(clubid);
            }
        }
        this.checkCreateClubEnable();
        this.setData({
            search: this.search.bind(this)
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        console.log("onShow");
        this.loadClubs();
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {},
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        console.log("onPullDownRefresh");
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},
    /**
     * 用户点击右上角分享
     */
    // onShareAppMessage: function () {
    // },
    onClickDebug: function(e) {
        console.log("onClickDebug");
        this.searchClubs("羽");
        // wx.navigateTo({
        //   url: './create',
        // })
    },

})