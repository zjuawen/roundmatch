// miniprogram/pages/clubs/clubList.js
// var app = getApp();

var APIs = require('../common/apis.js');

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
        APIs.updateUserInfo(userInfo, this);
    },

    getOpenid: async function() {
        let that = this; 
        APIs.getOpenid(this, res => {
            that.setData({
                openid: res.openid
            });
            that.loadClubs();
        })
    },
    loadClubs: function() {
        let that = this;
        APIs.loadClubs( this, res => {
            that.setData({
                clubs: res.private,
                publicClubs: [], //data.public
            })
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
    onClickClubCell: function(event){
        console.log(event)
        let area = event.detail;
        if( area == 'cell'){
            let clubid = event.target.dataset.clubid;
            if(clubid){
                wx.navigateTo({ url: '../matches/matchList?clubid='+ clubid });
            }
        } else if( area == 'right'){
            if (this.data.login) {
                let clubid = event.target.dataset.clubid;
                let userInfo = encodeURIComponent(JSON.stringify(this.data.userInfo));
                wx.navigateTo({
                    url: './create?action=edit&clubid=' + clubid + '&userInfo=' + userInfo,
                });
            } else{
                wx.showToast({
                  title: '获取用户信息失败，无法修改',
                  icon: 'none',
                });
            }
        } else if( area == 'left'){
           let clubid = event.target.dataset.clubid;
            if(clubid){
                wx.navigateTo({ url: './detail?action=view&clubid='+ clubid });
            } 
        }
    },
    joinClub: function(clubid) {
        let that = this;
        APIs.joinClub( clubid, this.data.userInfo, this.data.password,
            this, res => {
                if (data.status == 'fail') {
                    wx.showToast({
                        title: data.errMsg,
                        icon: 'none',
                    });
                } else if (data._id.length > 0) {
                    wx.showToast({
                        icon: 'success'
                    });
                    that.data.clubs.push(that.data.selected);
                    that.setData({
                        clubs: that.data.clubs
                    });
                }
                that.setData({
                    joinDialogShow: false
                });
            }
        );
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
        APIs.getClubInfo( clubid, this, res => {
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
        })
    },
    onCreateClub: function(e) {
        console.log("onCreateClub");
        if (this.data.login) {
            var userInfo = encodeURIComponent(JSON.stringify(this.data.userInfo));
            wx.navigateTo({
                url: '../clubs/create?action=create&userInfo=' + userInfo,
            })
        } else {
            this.showAuthDialog(true, "创建俱乐部需要用户昵称，头像等信息");
        }
    },
    checkCreateClubEnable: function() {
        let that = this;
        APIs.checkCreateClubEnable( this, res => {
            let data = res;
            that.setData({
                createClubEnable: (data == null) || (data.length <= 0),
                // createClubEnable: true,
            })
        })
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
            this.loading(false);
            return new Promise((resolve, reject) => {
                resolve([]);
            });
        }
        this.loading(true);
        return this.searchClubs(value);
    },
    searchClubs: function(keyword) {
        return APIs.searchClubs( keyword, this).then (res => {
            let data = res.result.data;
            let clubs = [];
            data.forEach((club) => {
                clubs.push({
                    text: club.wholeName + '(' + club.shortName + ')',
                    value: club._id,
                })
            })
            this.loading(false);
            console.log(clubs);
            return clubs;
        })
    },
    selectResult: function (e) {
        console.log('select result', e.detail);
        let clubid = e.detail.item.value;
        var param = 'clubid=' + clubid;
        if (this.data.login) {
            var userInfo = encodeURIComponent(JSON.stringify(this.data.userInfo));
            param = param + '&userInfo=' + userInfo;
        }
        wx.navigateTo({
            url: './detail?action=join&' + param
        })
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
        // this.doUpload();
    },
})