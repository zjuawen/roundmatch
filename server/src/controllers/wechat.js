'use strict'
const WechatAPI = require('co-wechat-api')
let wxappApi = new WechatAPI('wxf3f6462195815590', '81323b14609ba2cdcc3c738628e122a3')

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
