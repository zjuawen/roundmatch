// miniprogram/pages/clubs/create.js
var APIs = require('../common/apis.js')
var Utils = require('../common/utils.js')

Page({

	/**
		* 页面的初始数据
		*/
	data: {
		title: "创建俱乐部",
		action: 'view', //'create', 'join'
		btnText: '确定', // '创建', '加入'
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
		auditing: true,
	},

	loading: function(value) {
		this.setData({
			loading: value
		})
	},

	onOkButton: function() {
		let errMsg = null
		if (this.data.wholeName.length == 0) {
			errMsg = '请填写俱乐部名称'
		} else if (this.data.shortName.length == 0) {
			errMsg = '请填写俱乐部缩写'
		} else if (this.data.password != this.data.password2) {
			errMsg = '两次密码不一致'
		}

		if (errMsg) {
			wx.showToast({
				icon: "none",
				title: errMsg,
				duration: 2000
			})
			return
		}

		let action = this.data.action

		if (action == 'create') {
			this.createClub()
		} else if (action == 'edit') {
			this.updateClub()
		}
	},

	onInputWholdName: function(e) {
		console.log(e)
		let value = e.detail.value
		this.setData({
			wholeName: value
		})
	},

	onInputShortName: function(e) {
		console.log(e)
		let value = e.detail.value
		this.setData({
			shortName: value
		})
	},

	onInputPassword: function(e) {
		console.log(e)
		let value = e.detail.value
		this.setData({
			password: value
		})
	},

	onReinputPassword: function(e) {
		console.log(e)
		let value = e.detail.value
		this.setData({
			password2: value
		})
	},

	onSwitchPublic: function(e) {
		console.log(e)
		let value = e.detail.value
		let publicInfo = value ? '允许被其他人搜索到' : '不允许被其他人搜索到'
		this.setData({
			public: value,
			publicInfo: publicInfo,
		})
	},

	//创建俱乐部
	createClub: function() {
		let clubInfo = {
			wholeName: this.data.wholeName,
			shortName: this.data.shortName,
			logo: this.data.logo,
			public: this.data.public,
			password: this.data.password,
		}
		let userInfo = this.data.userInfo

		APIs.createClub(clubInfo, userInfo, this, res => {
			let data = res
			if (data.errCode == 1) {
				wx.showToast({
					icon: "none",
					title: data.errMsg,
					duration: 3000
				})
			} else if (data.errCode == 87014) {
				wx.showToast({
					icon: "none",
					title: "输入信息中包含不符合法律法规内容，请修改后重新提交",
					duration: 3000
				})
			} else {
				wx.redirectTo({
					url: '../clubs/clubList',
				})
			}
		})
	},

	//修改俱乐部信息
	updateClub: function() {
		let clubInfo = {
			clubid: this.data.clubid,
			wholeName: this.data.wholeName,
			shortName: this.data.shortName,
			logo: this.data.logo,
			public: this.data.public,
			password: this.data.password,
		}
		let userInfo = this.data.userInfo

		APIs.updateClub(clubInfo, userInfo, this, res => {
			let data = res
			if (data.errCode == 1) {
				wx.showToast({
					icon: "none",
					title: data.errMsg,
					duration: 3000
				})
			} else if (data.errCode == 87014) {
				wx.showToast({
					icon: "none",
					title: "输入信息中包含不符合相关法律法规内容，请修改后重新提交",
					duration: 3000
				})
			} else {
				wx.redirectTo({
					url: '../clubs/clubList',
				})
			}
		})
	},

	// beforeRead: function(event) {
	//   console.log(event)
	// },

	// oversize: function(event){
	//   wx.showToast({ title: '请选择200K以下的图片', icon: 'none' })
	// },

	onSelectLogo: function(event) {
		console.log(event)
		const {
			tempFiles,
			contents
		} = event.detail
		// console.log(tempFiles[0])
		let fileObject = {
			url: tempFiles[0].path,
			loading: true
		}
		this.setData({
			fileList: [fileObject]
		})
		let that = this
		APIs.imageSecCheck(this, contents[0], res => {
			if (res.errCode == 0) {
				console.log('uploading: ' + tempFiles[0].path)
				APIs.uploadImage(tempFiles[0].path, 'icon', this, (res)=> {
					console.log('APIs.uploadImage callback')
					console.log(res)
					let fileObject = {
						url: res.url,
						loading: false
					}
					this.setData({
						fileList: [fileObject],
						logo: res.url,
					})
				})
			} else if (res.errCode == 87014) {
				this.setData({
					fileList: []
				})
				wx.showToast({
					icon: "none",
					title: "上传图片内容不符合相关法律法规内容，请修改后重新提交",
					duration: 3000
				})
			} else {
				this.setData({
					fileList: []
				})
				wx.showToast({
					icon: "none",
					title: "上传图片失败：" + res.errMsg,
					duration: 3000
				})
			}
		})
	},

	onDeleteLogo: function(event) {
		console.log(event)
		this.setData({
			fileList: [],
			logo: ''
		})
	},

	onFailLogo: function(event) {
		console.log(event)
		let type = event.type
		if (type == 'fail') {
			let detail = event.detail
			if (detail.type == 1) {
				wx.showToast({
					icon: "none",
					title: "最大允许图片尺寸为200K",
					duration: 3000
				})
			}
		}
	},

	uploadImageToCloud: function() {
		// console.log('upload files', files)

		// 上传图片
		let filePath = this.data.fileList[0].url

		let fileName = 'icon-' + Utils.getCurrentDateTime() + filePath.match(/\.[^.]+?$/)[0]

		APIs.uploadIcon(this, filePath, (res) => {
			let fileObject = {
				url: res.url,
				loading: false
			}
			this.setData({
				fileList: [fileObject],
				logo: res.url,
			})
		})
		// const cloudPath = 'clubicons/' + fileName

		// wx.cloud.uploadFile({
		// 	cloudPath,
		// 	filePath,
		// 	success: res => {
		// 		console.log('[上传文件] 成功：', res)
		// 		if( res.errMsg == "cloud.uploadFile:ok"){
		// 			var fileObject = {
		// 				url: res.fileID,
		// 				loading: false
		// 			}
		// 			this.setData({
		// 				fileList: [ fileObject ],
		// 				logo: res.fileID,
		// 			})
		// 		}
		// 	}
		// })
	},

	isAuditing: async function() {
		let that = this
		await APIs.isAuditing(this, async res => {
			that.setData({
				auditing: res.auditing
			})
		})
	},

	/**
		* 生命周期函数--监听页面加载
		*/
	onLoad: function(options) {
		console.log(options)
		var userInfoObject = JSON.parse(decodeURIComponent(options.userInfo))
		console.log(userInfoObject)
		this.isAuditing()
		if (options.action == 'create') {
			this.setData({
				userInfo: userInfoObject,
				creator: userInfoObject.name,
				action: options.action,
				btnText: '创建',
				title: '创建俱乐部',
			})
		} else if (options.action == 'edit') {
			this.setData({
				userInfo: userInfoObject,
				creator: userInfoObject.name,
				action: options.action,
				btnText: '确定',
				title: '修改俱乐部',
				clubid: options.clubid,
			})
			APIs.getClubInfo(options.clubid, this, res => {
				console.log(res)
				var logoList = []
				if (res.logo && res.logo.length > 0) {
					logoList = [{
						url: res.logo
					}]
				}

				this.setData({
					wholeName: res.wholeName,
					shortName: res.shortName,
					logo: res.logo,
					public: res.public,
					fileList: logoList,
				})
			})
		}
	},

	/**
		* 生命周期函数--监听页面初次渲染完成
		*/
	onReady: function() {

	},

	/**
		* 生命周期函数--监听页面显示
		*/
	onShow: function() {

	},

	/**
		* 生命周期函数--监听页面隐藏
		*/
	onHide: function() {

	},

	/**
		* 生命周期函数--监听页面卸载
		*/
	onUnload: function() {

	},

	/**
		* 页面相关事件处理函数--监听用户下拉动作
		*/
	onPullDownRefresh: function() {

	},

	/**
		* 页面上拉触底事件的处理函数
		*/
	onReachBottom: function() {

	},

	/**
		* 用户点击右上角分享
		*/
	onShareAppMessage: function() {

	}
})