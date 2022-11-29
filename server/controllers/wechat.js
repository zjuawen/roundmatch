'use strict'
const WechatAPI = require('co-wechat-api')
let wxappApi = new WechatAPI('wxf3f6462195815590', 'bb1434a237637a2feeea1a3cf56307af')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
	async getOpenid (code) {
	    let userLogin = await wxappApi.code2Session(code)
	    return userLogin
	},
	async getUserInfo (openid) {
		let userInfo = await wxappApi.getUser(openid)
	    return userInfo
	}
}
