// miniprogram/pages/matchList/matchList.js
var APIs = require('../common/apis.js')
var Utils = require('../common/utils.js')

const saveGlobalData = require('../common/utils').saveGlobalData
const getGlobalData = require('../common/utils').getGlobalData
const showError = require('../common/utils').showError

// 在页面中定义激励视频广告
let videoAd = null
Page({
    /**
     * 页面的初始数据
     */
    data: {
        title: "比赛列表",
        loading: false,
        players: [],
        matches: [],
        pageNum: 1, //初始页默认值为1
        pageSize: 10,
        noMore: false,
        slideButtonOne: [{
            type: 'warn',
            text: '删除',
            // src: '/page/weui/cell/icon_love.svg', // icon的路径
        }],
        defaultAvatar: '/images/user-unlogin.png',
        orderField: 'notSet',
        orderDesc: 'notSet',
        //tabbar
        tabIndex: 0,
        tabLabelList: [{
            "text": "比赛列表",
            "iconPath": "/images/match-list.svg",
            "selectedIconPath": "/images/match-list-selected.svg",
            // dot: true
        }, {
            "text": "排行榜",
            "iconPath": "/images/match-statistic.svg",
            "selectedIconPath": "/images/match-statistic-selected.svg",
            // badge: 'New'
        }],
        //dialog
        clickIndex: 0,
        dialogShow: false,
        dialogBtns: [{
            text: '取消'
        }, {
            text: '确定'
        }],
        tempName: '',
        showActionsheet: false,
        gameTypeNames: [{
            text: '轮转搭档循环',
            value: 1,
            type: 'warn',
        }, {
            text: '固定搭档循环',
            value: 2
        }, {
            text: '分级搭档循环',
            value: 3
        }, ],
        filterShow: false,
        dateFrom: '2019-01-01',
        dateTo: Utils.getCurrentDate(),
        filterNum: 1,
        adShow: false, //app.globalData.adShow1, //true,
        dialogAdPrompt: false,
        adPromptDialogButtons: [{
            text: '这次不看'
        }, {
            text: '支持一下'
        }],
        videoAdLoaded: false,
        videoAdError: false,
        videoAdClosed: false,
        msgList: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        // this.createVideoAd()
        // console.log("app.globalData.adShow1", app.globalData.adShow1)
        this.setData({
            clubid: options.clubid,
            // adShow: app.globalData.adShow1,
        })
        wx.hideShareMenu({})
        this.getClubInfo(this.data.clubid)
        this.readNotices()
        // this.loadMatches(this.data.clubid)
        // this.loadPlayers(this.data.clubid)
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            matches: [],
            pageNum: 1,
            noMore: false
        })
        this.loadMatches(this.data.clubid)
        if (this.data.tabIndex == 1) {
            this.loadPlayersStatistic(this.data.clubid)
        }
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
    onPullDownRefresh: function() {},
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        console.log("load more")
        if (this.data.noMore) {
            console.log("No more data")
            return
        } else {
            this.setData({
                pageNum: this.data.pageNum + 1
            })
            console.log("Load more, page: " + this.data.pageNum)
        }
        this.loadMatches(this.data.clubid)
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        let player = getApp().globalData.userInfo
        let clubinfo = getApp().globalData.clubinfo
        let shareUrl = '/pages/clubs/clubList?action=sharejoin&clubid=' + this.data.clubid
        console.log(shareUrl)
        return ({
            title: player.name + "邀请你加入\"" + clubinfo.wholeName + "\"",
            imageUrl: '/images/background.jpg',
            path: shareUrl,
        })
    },

    loading: function(value) {
        this.setData({
            loading: value
        })
    },
    loadMatches: function(clubid) {
        this.loading(true)
        let that = this
        let pageNum = this.data.pageNum
        let pageSize = this.data.pageSize
        let openid = getGlobalData('openid')
        APIs.listMatch(openid, clubid, pageNum, pageSize, this, res => {
            let newData = res.data
            newData.forEach((item) => {
                if (!item.name) {
                    item.name = item.createDate
                }
            })
            that.setData({
                noMore: (newData.length < that.data.pageSize)
            })
            newData = that.data.matches.concat(newData)
            that.setData({
                matches: newData
            })
            //delay show ad
            that.setData({
                adShow: app.globalData.adShow1
            })
            that.loading(false)
        })
    },
    getClubInfo: function(clubid) {
        this.loading(true)
        let that = this
        APIs.getClubInfo(clubid, this, res => {
            let clubinfo = res
            that.setData({
                clubinfo: clubinfo,
                title: clubinfo.wholeName,
            })
            getApp().globalData.clubinfo = clubinfo
            wx.showShareMenu({})
            that.loading(false)
            // return clubinfo
        })
    },
    showActionsheet: function(value) {
        this.setData({
            showActionsheet: value
        })
    },
    onNewGame: function(gameType) {
        // this.showAdPromptDialog()
        // return
        let that = this
        let clubid = this.data.clubid
        // this.showAdPromptDialog()
        // return
        APIs.isVip(this, clubid, res => {
            let vip = res
            // let vip = data.vip
            if (vip) {
                this.showActionsheet(true)
            } else {
                // this.showAdPromptDialog()
                APIs.needUnlockMatchCount(this, clubid, res => {
                    let needUnlock = res
                    if (needUnlock) {
                        this.showAdPromptDialog()
                        // this.showVideoAd()
                    } else {
                        this.showActionsheet(true)
                    }
                })
            }
        })
    },
    showAdPromptDialog: function() {
        this.setData({
            dialogAdPrompt: true
        })
    },
    tapAdPromptDialogButton: function(e) {
        let index = e.detail.index
        this.setData({
            dialogAdPrompt: false
        })
        if (index == 0) { //拒绝观看
            this.showActionsheet(true)
        } else {
            wx.showLoading({
                title: '广告努力加载中',
            })
            if (!this.data.videoAdLoaded) {
                this.createVideoAd({
                    success: this.showVideoAd,
                    error: this.showActionsheet,
                    param: true
                })
            } else {
                this.showVideoAd()
            }
            // this.showVideoAd()
        }
    },
    createVideoAd: function({
        success,
        error,
        param
    }) {
        // 在页面onLoad回调事件中创建激励视频广告实例
        if (wx.createRewardedVideoAd) {
            videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-8027a5ffe9d6c3c3'
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
                    error(param)
                }
            })
            videoAd.onClose((res) => {
                this.setData({
                    videoAdClosed: true
                })
                // 用户点击了【关闭广告】按钮
                if (res && res.isEnded) {
                    // 正常播放结束，可以下发游戏奖励
                    let clubid = this.data.clubid
                    APIs.unlockMatchCount(this, clubid, res => {
                        console.log('unlockMatchCount', res)
                        if (res.success) {
                            wx.showToast({
                                title: '解锁成功，感谢支持',
                                icon: 'none',
                            })
                        } else {
                            wx.showToast({
                                title: '解锁失败，' + res.errMsg,
                                icon: 'none',
                            })
                        }
                    })
                } else {
                    // 播放中途退出，不下发游戏奖励
                    wx.showToast({
                        title: '请播放完成后关闭才可以获得解锁',
                        icon: 'none',
                    })
                }
                // this.showActionsheet(true)
            })
        }
    },
    showVideoAd: function() {
        if (videoAd) {
            videoAd.show().catch(() => {
                // 失败重试
                videoAd.load().then(() => videoAd.show()).catch(err => {
                    console.log('激励视频 广告显示失败')
                    this.showActionsheet(true)
                    // APIs.unlockMatchCount(this, clubid)
                })
            })
        }
    },
    onActionSheetClick: function(event) {
        console.log(event)
        let value = event.detail.value
        this.showActionsheet(false)
        this.goPlayerList(value)
    },
    goPlayerList: function(value) {
        if (value == 3) {
            wx.navigateTo({
                url: '../players/playerList?clubid=' + this.data.clubid + '&action=new&&type=group',
            })
        } else if (value == 2) {
            wx.navigateTo({
                url: '../players/playerList?clubid=' + this.data.clubid + '&action=new&&type=fixpair',
            })
        } else { //if( value==1 )
            wx.navigateTo({
                url: '../players/playerList?clubid=' + this.data.clubid + '&action=new',
            })
        }
    },
    tabChange(e) {
        console.log('tab change', e)
        let index = e.detail.index
        let title = (index == 0) ? '比赛列表' : '排行榜'
        if (index == 0) {
            let tabLabelList = this.data.tabLabelList
            if (tabLabelList[0].badge != null) {
                tabLabelList[0].badge = null
                this.setData({
                    tabLabelList: tabLabelList
                })
            }
        } else {
            this.loadPlayersStatistic(this.data.clubid)
        }
        this.setData({
            title: title,
            tabIndex: index
        })
    },
    loadPlayersStatistic: function(clubid) {
        let that = this
        var date = null
        if (this.data.dateFrom && this.data.dateTo) {
            date = {
                from: this.data.dateFrom,
                to: this.data.dateTo
            }
        }
        APIs.statisClub(this, clubid, date, this.data.filterNum, res => {
            let data = res
            data.forEach(function(item) {
                // item.pigCount = 0
                // item.crownCount = 0
                // item.winCount = 1
                // item.lostCount = 2
                let winrate = item.winCount / (item.lostCount + item.winCount)
                let rateStr = '0%'
                if (isNaN(winrate)) {
                    winrate = 0
                    rateStr = '0%'
                } else {
                    rateStr = (winrate * 100).toFixed(2) + '%'
                }
                item.winrate = winrate
                item.rateStr = rateStr
            })
            this.setData({
                players: data,
                orderField: 'notSet',
                orderDesc: 'notSet',
            })
        })
    },
    onTapOrder: function(e) {
        console.log('onTapOrder', e)
        let field = e.currentTarget.dataset.id
        let players = this.data.players
        let desc = this.data.orderDesc
        if (desc == 'notSet') {
            desc = true
        }
        this.reorderPlayers(players, field, desc)
        this.setData({
            orderField: field,
            players: players,
            orderDesc: !desc,
        })
    },
    onEditMatchTitle: function(event) {
        console.log(event)
        let index = event.target.dataset.index
        let data = this.data.matches
        this.setData({
            tempName: data[index].name
        })
        this.openDialog(index)
    },
    //输入比赛名称
    inputNewName: function(e) {
        console.log(e)
        let value = e.detail.value
        // let data = this.data.games
        // data[this.data.clickIndex].score1 = parseInt(value)
        this.setData({
            tempName: value
        })
    },
    //比赛名称输入框按钮
    tapDialogButton(e) {
        if (e.detail.index === 1) {
            this.loading(true)
            let validat = this.setNewMatchName()
            if (validat) {
                this.onUpdateMatch(this.data.clickIndex)
            } else {
                this.loading(false)
            }
        }
        this.setData({
            dialogShow: false,
            // showOneButtonDialog: false
        })
    },
    onUpdateMatch: function(index) {
        this.loading(true)
        let func = 'matchService'
        let action = 'update'
        console.log('update match ...')
        let data = this.data.matches
        wx.cloud.callFunction({
            name: func,
            data: {
                action: action,
                match: {
                    matchid: data[index]._id,
                    name: data[index].name,
                }
            },
            success: res => {
                console.log('[云函数] ' + func + ' return: ', res.result)
                let updated = res.result.data.updated
                this.loading(false)
            },
            fail: err => {
                console.error('[云函数] ' + func + ' 调用失败', err)
                wx.navigateTo({
                    url: '../error/deployFunctions',
                })
            }
        })
    },
    //修改比赛标题
    setNewMatchName: function() {
        let data = this.data.matches
        let name = data[this.data.clickIndex].name
        if (name == this.data.tempName) {
            console.log("title not modified")
            return false
        }
        data[this.data.clickIndex].name = this.data.tempName
        this.setData({
            matches: data
        })
        return true
    },
    //弹出输入框
    openDialog: function(index) {
        this.setData({
            dialogShow: true,
            clickIndex: index,
        })
    },
    onClickMatchCellButton: function(event) {
        console.log(event)
        let type = event.type
        if (type != 'buttontap') {
            return
        }
        let index = event.detail.index
        if (index == 0) {
            let matchid = event.currentTarget.dataset.matchid
            this.oDeleteMatch(matchid)
        }
    },
    oDeleteMatch: function(matchid) {
        console.log('onDeleteGame')
        let clubid = this.data.clubid
        var that = this
        wx.showModal({
            title: '提示',
            content: '确定要删除吗？',
            success: function(sm) {
                if (sm.confirm) {
                    console.log('确定删除')
                    that.deleteMatch(clubid, matchid)
                } else if (sm.cancel) {
                    console.log('取消删除')
                }
            }
        })
    },
    deleteMatch: function(clubid, matchid) {
        let that = this
        APIs.deleteMatch(this, clubid, matchid, res => {
            that.setData({
                matches: [],
                pageNum: 1,
                noMore: false
            })
            that.loadMatches(that.data.clubid)
        })
    },
    onClickMatchCell: function(event) {
        console.log(event)
        let clubid = this.data.clubid
        let matchid = event.currentTarget.dataset.matchid
        let url = '../matches/detail?action=old&clubid=' + clubid + '&matchid=' + matchid
        let index = event.currentTarget.dataset.index
        let type = this.data.matches[index].type
        if (type) {
            url = url + '&type=' + type
        }
        wx.navigateTo({
            url: url
        })
    },
    reorderPlayers: function(data, field, desc) {
        data.sort(function(player1, player2) {
            let value1 = player1[field]
            let value2 = player2[field]
            if (desc) {
                return value2 - value1
            } else {
                return value1 - value2
            }
        })
    },
    onSwitchFilter: function(e) {
        this.setData({
            filterShow: !this.data.filterShow,
        })
    },
    bindDateFromChange: function(e) {
        this.setData({
            dateFrom: e.detail.value
        })
    },
    bindDateToChange: function(e) {
        this.setData({
            dateTo: e.detail.value
        })
    },
    bindFilterNumInput: function(e) {
        console.log(e)
        this.setData({
            filterNum: e.detail.value
        })
    },
    bindFilterNumMinus: function(e) {
        if (this.data.filterNum <= 0) {
            return
        }
        this.setData({
            filterNum: this.data.filterNum - 1
        })
    },
    bindFilterNumPlus: function(e) {
        this.setData({
            filterNum: this.data.filterNum + 1
        })
    },
    onFilter: function(e) {
        console.log(e)
        this.loadPlayersStatistic(this.data.clubid)
    },
    readNotices: function() {
        let that = this
        APIs.getNotices(this, "matchList", res => {
            console.log(res)
            that.setData({
                msgList: res,
            })
        })
    },
    adClose: function() {
        console.log('adClose')
        this.setData({
            adShow: false
        })
        app.globalData.adShow1 = false
        console.log("app.globalData.adShow1 set to ", app.globalData.adShow1)
    },
    adError: function(err) {
        console.log('Banner 广告加载失败', err)
        this.setData({
            adShow: false
        })
    },

})