// miniprogram/pages/clubs/clubList.js
// var app = getApp()

var APIs = require('../common/apis.js')
var Utils = require('../common/utils.js')

const saveGlobalData = Utils.saveGlobalData
const getGlobalData = Utils.getGlobalData
const showError = require('../common/utils').showError

// 在页面中定义激励视频广告
let videoAd = null

Page({
    /**
     * 页面的初始数据
     */
    data: {
        title: "俱乐部",
        login: false,
        detailPedding: false,
        openid: null,
        avatarUrl: '/images/user-unlogin.png',
        nickname: '',
        loading: false,

        clubs: [],

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
        slideButtonTwo: [{
            text: '查看',
            // src: '/page/weui/cell/icon_love.svg', // icon的路径
        }, {
            type: 'warn',
            text: '修改',
            // extClass: 'test',
            // src: '/page/weui/cell/icon_del.svg', // icon的路径
        }],
        slideButtonOne: [{
            text: '查看',
            // src: '/page/weui/cell/icon_love.svg', // icon的路径
        }],
        // inputShowed: false,
        // inputVal: "",
        adShow: false, // banner广告
        videoAdLoaded: false,
        videoAdError: false,
        videoAdClosed: false,

        auditing: true,

        msgList: [], //[ {title: 'test1'}, {title: 'test3'} ],

        debug: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function(options) {
        console.log("clublist onload")
        // this.getOpenid()
        await this.userLogin()
        console.log("userLogin finished")

        this.getUserDetail()
        this.isAuditing()
        this.readNotices()
        let action = options.action
        if (action == 'sharejoin') {
            let clubid = options.clubid
            console.log("share invited to clubid: " + clubid)
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
                this.onJoinClub(clubid)
            }
        }
        if (!this.data.isAuditing) {
            this.checkCreateClubEnable()
        }
        this.setData({
            search: this.search.bind(this)
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        // this.getUserDetail()
        // this.loadUserInfo()
        if (this.data.openid) {
            this.loadClubs()
        }
        // this.createVideoAd()
        setTimeout(this.getBannerADHeight, 2000)
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        console.log("onShow")
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        console.log("onHide")
        /* 
         * 一旦离开页面，就不再检查邀请加入的动作，
         * 以免页面刷新或其他授权回调后的重新弹出邀请界面
         */
        this.setData({
            sharejoin: false
        })
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        console.log("onUnload")
    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        console.log("onPullDownRefresh")
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
        console.log("onClickDebug")
        // this.doUpload()
    },
    onChooseAvatar: async function(e) {
        console.log(e)
        const {
            avatarUrl
        } = e.detail
        await APIs.uploadImage(avatarUrl, 'head', this, (res) => {
            const {
                url
            } = res;
            if (url != null) {
                this.setData({
                    avatarUrl: url
                })
            }
        })
    },
    onNickNameChange: function(e) {
        console.log(e)
        let nickname = e.detail.value
        this.setData({
            nickname,
        })
    },
    onConfirmUserInfo: async function(e) {
        console.log(e)
        const userInfo = {
            avatarUrl: this.data.avatarUrl,
            name: this.data.nickname,
            openid: this.data.openid,
        }
        console.log(userInfo)
        saveGlobalData('userInfo', userInfo)
        this.setData({
            userInfo
        })
        let that = this
        await APIs.updateUserInfo(this.data.openid, userInfo, this, (res) => {
            // console.log(res)
            if( res.count == 1){
                that.showAuthDialog(false)
            }
        })
    },

    loading: function(value) {
        this.setData({
            loading: value
        })
    },

    userLogin: async function() {
        let openid = getGlobalData('openid')
        let userInfo = getGlobalData('userInfo')
        if (openid) {
            // console.log('stored openid: ' + openid)
            this.setData({
                openid: openid,
            })
        } 
        if( userInfo ){
           this.setData({
                userInfo: userInfo,
                avatarUrl: userInfo.avatarUrl,
                nickname: userInfo.name,
            })
        }
        if( openid && userInfo){
            this.setData({login: true})
        } else { //if( openid == null){
            console.log('user not login, login now')
            let code = await Utils.wxLogin();
            console.log('Utils.wxLogin return')
            console.log(code)
            if (code == null) {
                Utils.showError('微信授权登录失败')
                return
            }
            let that = this
            await APIs.login(code, this, (res) => {
                let {openid, userInfo} = res
                // console.log('get openid from userservice: ' + openid)
                if (openid != null && openid.length > 0) {
                    saveGlobalData('openid', openid)
                    that.setData({
                        openid,
                        login: true
                    })
                    that.loadClubs(openid)
                } else {
                    that.showAuthDialog(true)
                    return
                }
                if( userInfo ){
                    saveGlobalData('userInfo', userInfo)
                
                    that.setData({
                        userInfo: userInfo,
                        avatarUrl: userInfo.avatarUrl,
                        nickname: userInfo.name,
                        login: true
                    })
                    that.showAuthDialog(false)
                } else {
                    that.showAuthDialog(true)
                }
                
            })
        // } else if( userInfo == null){
        //     let that = this
        //     await APIs.getUserDetail(openid, this, (res) => {
        //         const{userInfo} = res
        //         if( userInfo != null){
        //             if( typeof userInfo === 'string'){
        //                 userInfo = JSON.parse(userInfo)
        //             }
        //             that.setData({
        //                 userInfo: userInfo,
        //                 avatarUrl: userInfo.avatarUrl,
        //                 nickname: userInfo.name,
        //             })
        //         }
        //     })
        }
    },
    loadUserInfo: async function() {
        // 获取用户信息
        let that = this

        Utils.getUserDetail({
            success: async res => {
                console.log(res.userInfo)
                getApp().globalData.userInfo = res.userInfo
                that.setData({
                    avatarUrl: res.userInfo.avatarUrl,
                    userInfo: res.userInfo,
                    login: true
                })
                that.updateUserInfo(res.userInfo)
                this.showAuthDialog(false)
                if (that.data.sharejoin) {
                    wx.hideLoading()
                    that.onJoinClub(that.data.sharedclubid)
                }
            },
            error: res => {
                that.setData({
                    login: false
                })
                if (that.data.sharejoin) {
                    wx.hideLoading()
                    that.showAuthDialog(true, "需要用户昵称，头像等信息以进行下一步操作")
                } else {
                    this.showAuthDialog(false)
                }
            }
        })
    },
    //更新用户信息
    updateUserInfo: function(userInfo) {
        APIs.updateUserInfo(userInfo, this, this.updateUserInfoCb)
    },

    updateUserInfoCb: function(data) {
        console.log(data)
        if (data.msg == "collection.update:ok") {
            wx.showToast({
                title: '更新信息成功',
                icon: 'success'
            })
        } else {
            wx.showToast({
                title: data.msg,
                icon: 'none'
            })
        }
    },

    isAuditing: async function() {
        let that = this
        await APIs.isAuditing(this, async res => {
            // console.log('isAuditing')
            // console.log(res)
            that.setData({
                auditing: res.auditing
            })
        })
    },
    // getOpenid: async function() {
    //     let openid = getGlobalData('openid')
    //     this.setData({
    //         openid: openid
    //     })
    // },
    getUserDetail: async function() {
        this.setData({
            detailPedding: true
        })
        let userInfo = getGlobalData('userInfo')
        // console.log('userInfo')
        // console.log(userInfo)
        if (userInfo != null) {
            this.setData({
                login: true,
                userInfo: userInfo,
                avatarUrl: userInfo.avatarUrl,
            })
            if (this.data.sharejoin) {
                wx.hideLoading()
                this.onJoinClub(this.data.sharedclubid)
            }
        } else {
            this.showAuthDialog(true, '需要授权获取用户昵称，头像等信息')
            // if (this.data.sharejoin) {
            //     wx.hideLoading()
            //     this.showAuthDialog(true, '需要授权获取用户昵称，头像等信息')
            // } 
        }
        this.setData({
            detailPedding: false
        })

    },
    loadClubs: function(openid = null) {
        let that = this
        if (openid == null) {
            openid = getGlobalData('openid')
        }
        if (openid == null) {
            console.error('null openid while loadClubs')
            return
        }
        APIs.loadClubs(openid, this, res => {
            that.setData({
                clubs: res.private,
                publicClubs: [], //data.public
            })
            if (this.data.clubs.length > 0 && !this.data.login && !this.data.detailPedding) {
                this.showAuthDialog(true, "微信修改授权机制，需要重新授权获取用户信息")
            }
        })
    },
    onTapUser: function(e) {
        if (this.data.login) {
            return
        }
        this.loadUserInfo()
    },
    onLongTapUser: function(e) {
        this.showAuthDialog(true, "重新授权获取用户信息")
        return
    },
    onClickPublicClub: function(e) {
        console.log(e)
        let data = e.currentTarget.dataset.item
        if (!data) {
            wx.showToast({
                title: '获取俱乐部信息失败',
                icon: 'none',
            })
            return
        }
        this.setData({
            selected: data,
            joinDialogShow: true,
        })
    },
    onInputPassword: function(e) {
        console.log(e)
        let data = e.detail.value
        this.setData({
            password: data
        })
    },
    tapDialogButton(e) {
        let btnIndex = e.detail.index
        if (btnIndex === 1) {
            this.loading(true)
            this.joinClub(this.data.selected._id)
        }
        this.setData({
            joinDialogShow: false
        })
    },
    onCancelAuthDialog: function(e) {
        // console.log(e)
        this.setData({
            authDialogShow: false
        })
    },
    onClickClubCell: function(event) {
        console.log(event)
        let clubid = event.currentTarget.dataset.clubid
        if (!clubid) {
            console.log('no cluid present with onClickClubCell, some error oops~')
            return
        }

        let type = event.type
        if (type == 'tap') {
            wx.navigateTo({
                url: '../matches/matchList?clubid=' + clubid
            })
        } else if (type == 'buttontap') {
            let buttonIndex = event.detail.index
            if (buttonIndex == 0) { //查看
                wx.navigateTo({
                    url: './detail?action=view&clubid=' + clubid
                })
            } else if (buttonIndex == 1) { //修改
                if (this.data.login) {
                    let userInfo = encodeURIComponent(JSON.stringify(this.data.userInfo))
                    wx.navigateTo({
                        url: './create?action=edit&clubid=' + clubid + '&userInfo=' + userInfo,
                    })
                } else {
                    wx.showToast({
                        title: '获取用户信息失败，无法修改',
                        icon: 'none',
                    })
                }
            }
        }
    },
    joinClub: function(clubid) {
        let that = this
        APIs.joinClub(clubid, this.data.userInfo, this.data.password,
            this, res => {
                let data = res
                if (data.status == 'fail') {
                    wx.showToast({
                        title: data.errMsg,
                        icon: 'none',
                    })
                } else if (data._id.length > 0) {
                    wx.showToast({
                        icon: 'success'
                    })
                    that.data.clubs.push(that.data.selected)
                    that.setData({
                        clubs: that.data.clubs
                    })
                }
                that.setData({
                    joinDialogShow: false
                })
            }
        )
    },
    onGetUserInfo: function(e) {
        console.log(e)
        if (e.detail.userInfo != null) {
            this.setData({
                login: true,
                avatarUrl: e.detail.userInfo.avatarUrl,
                userInfo: e.detail.userInfo
            })
        }
        if (this.data.sharejoin) {
            this.showAuthDialog(false)
            this.onJoinClub(this.data.sharedclubid)
        } else {
            this.onClickPublicClub(e)
        }
    },
    showAuthDialog: function(show, msg) {
        if (show) {
            this.setData({
                authDialogShow: show,
                // authDialogMessage: msg,
            })
            console.log(this.data.authDialogMessage)
        } else {
            this.setData({
                authDialogShow: show,
            })
        }
    },
    onJoinClub: function(clubid) {
        if (!this.data.login) {
            wx.showToast({
                title: '请先授权',
                icon: 'error'
            })
            return
        }
        wx.showLoading({
            title: '获取俱乐部信息',
            mask: true
        })
        APIs.getClubInfo(clubid, this, res => {
            wx.hideLoading()
            let data = res
            let e = {
                currentTarget: {
                    dataset: {
                        item: data
                    }
                }
            }
            if (data != null) {
                this.onClickPublicClub(e)
            } else {
                wx.showToast({
                    title: '错误：俱乐部信息不存在'
                })
            }
        })
    },
    onClickCreateClub: function(e) {
        console.log("onClickCreateClub")
        if (!this.data.login) {
            this.showAuthDialog(true, "创建俱乐部需要用户昵称，头像等信息")
            return
        }
        // this.showAD()
        if (this.data.vip) {
            this.gotoCreateClubPage()
        } else {
            if (this.data.videoAdLoaded) {
                this.showAD()
            } else if (this.data.videoAdError) {
                wx.showToast({
                    title: '广告加载失败',
                    icon: 'error',
                })
                this.gotoCreateClubPage()
            } else {
                wx.showLoading({
                    title: '广告努力加载中',
                })
                this.createVideoAd({
                    success: this.showAD,
                    error: this.gotoCreateClubPage,
                })
            }
        }
    },
    gotoCreateClubPage: function() {
        console.log("gotoCreateClubPage")
        var userInfo = encodeURIComponent(JSON.stringify(this.data.userInfo))
        wx.navigateTo({
            url: '../clubs/create?action=create&userInfo=' + userInfo,
        })
    },
    checkCreateClubEnable: function() {
        let that = this
        let openid = getGlobalData('openid')
        APIs.checkCreateClubEnable(openid, this, res => {
            console.log('checkCreateClubEnable')
            console.log(res)
            let data = res
            // let createClubEnable = data.vip || (data.clubs && (data.clubs.length <= 0))
            let createClubEnable = true
            that.setData({
                vip: data.vip,
                createClubEnable: createClubEnable,
                // createClubEnable: true,
            })
        })
    },
    onClickDownloadManual: function(e) {
        // let url = 'cloud://roundmatch.726f-roundmatch-1300750420/documents/羽毛球双打轮转小程序使用手册.pdf'
        let url = 'cloud://test-roundmatch.7465-test-roundmatch-1300750420/documents/羽毛球双打轮转小程序使用手册.pdf'
        wx.cloud.downloadFile({
            fileID: url
        }).then(res => {
            // get temp file path
            console.log(res.tempFilePath)
            let filePath = res.tempFilePath
            wx.openDocument({
                filePath: filePath,
                success: function(res) {
                    console.log('打开文档成功')
                }
            })
        }).catch(error => {
            // handle error
        })
    },
    search: function(value) {
        console.log("search: " + value)
        if (value.length == 0) {
            this.loading(false)
            return new Promise((resolve, reject) => {
                resolve([])
            })
        }
        this.loading(true)
        return this.searchClubs(value)
    },
    searchClubs: function(keyword) {
        return APIs.searchClubs(this, keyword).then(res => {
            let data = res.result
            let clubs = []
            data.forEach((club) => {
                clubs.push({
                    text: club.wholeName + '(' + club.shortName + ')',
                    value: club._id,
                })
            })
            this.loading(false)
            console.log(clubs)
            return clubs
        })
    },
    onTapSearchResult: function(e) {
        console.log('select result', e.detail)
        if (!this.data.login) {
            //  wx.showToast({
            //     title: '请先授权',
            //     icon: 'error'
            // })
            this.showAuthDialog(true)
            return
        }
        let clubid = e.detail.item.value
        var param = 'clubid=' + clubid
        if (this.data.login) {
            var userInfo = encodeURIComponent(JSON.stringify(this.data.userInfo))
            param = param + '&userInfo=' + userInfo
        }
        wx.navigateTo({
            url: './detail?action=join&' + param
        })
    },
    readNotices: function() {
        let that = this
        APIs.getNotices(this, "clubList", res => {
            console.log(res)
            that.setData({
                msgList: res
            })
        })
    },
    createVideoAd: function({
        success,
        error
    }) {
        // 在页面onLoad回调事件中创建激励视频广告实例
        if (wx.createRewardedVideoAd) {
            videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-0db63c1d84e9cd9c'
            })
            videoAd.onLoad(() => {
                console.log('videoAd.onLoad')
                wx.hideLoading()
                this.setData({
                    videoAdLoaded: true
                })
                if (success && !this.data.videoAdClosed) {
                    success()
                }
                this.setData({
                    videoAdClosed: false
                })
            })
            videoAd.onError((err) => {
                console.log('videoAd.onError')
                console.log(err)
                wx.hideLoading()
                this.setData({
                    videoAdError: true
                })
                if (error) {
                    error()
                }
            })
            videoAd.onClose((res) => {
                this.setData({
                    videoAdClosed: true
                })
                // 用户点击了【关闭广告】按钮
                if (res && res.isEnded) {
                    // 正常播放结束，可以下发游戏奖励
                    this.gotoCreateClubPage()
                } else {
                    // 播放中途退出，不下发游戏奖励
                    wx.showToast({
                        title: '请播放完成后关闭',
                        icon: 'none',
                    })
                }
            })
        }
    },
    showAD: function() {
        // 用户触发广告后，显示激励视频广告
        if (videoAd) {
            videoAd.show().catch(() => {
                // 失败重试
                videoAd.load()
                    .then(() => videoAd.show())
                    .catch(err => {
                        console.log('激励视频 广告显示失败')
                    })
            })
        }
    },
    getBannerADHeight: function() {
        var query = wx.createSelectorQuery()
        query.select('#bannerAD').boundingClientRect(function(res) {
            console.log('#bannerAD')
            console.log(res)
        }).exec()
    },


})