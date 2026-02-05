'use strict'
const WechatAPI = require('co-wechat-api')
const fs = require('fs')
const path = require('path')
const https = require('https')
const { uploadFile } = require("../utils/storage")
const { getFileBaseUrl } = require("../config/storage.config")
const SERVER_URL_UPLOADS = getFileBaseUrl()

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
	},
	/**
	 * 生成小程序码（无数量限制）
	 * @param {string} scene - 场景值，最大32个字符
	 * @param {string} page - 页面路径，如 'pages/matches/detail'
	 * @param {object} options - 可选参数 { width: 280, autoColor: false, lineColor: {...}, isHyaline: false }
	 * @returns {Promise<string>} 小程序码的URL
	 */
	async getUnlimitedQRCode(scene, page, options = {}) {
		try {
			// 日志输出：小程序码指向的页面路径和参数
			console.log('========== 生成小程序码 ==========')
			console.log('页面路径 (page):', page || '未指定（使用默认首页）')
			console.log('场景值 (scene):', scene)
			console.log('完整路径:', page ? `${page}?scene=${encodeURIComponent(scene)}` : `首页?scene=${encodeURIComponent(scene)}`)
			console.log('================================')
			
			// 获取 access_token
			const tokenData = await wxappApi.ensureAccessToken()
			const accessToken = tokenData.accessToken
			
			if (!accessToken) {
				throw new Error('无法获取 access_token')
			}
			
			// 直接调用微信API生成小程序码
			const buffer = await new Promise((resolve, reject) => {
				const postData = JSON.stringify({
					scene: scene, // 场景值，最大32个字符
					page: page || undefined, // 页面路径（可选）
					width: options.width || 280, // 二维码宽度，默认280
					auto_color: options.autoColor !== false, // 自动配置线条颜色
					line_color: options.lineColor || { r: 0, g: 0, b: 0 }, // 线条颜色
					is_hyaline: options.isHyaline || false // 是否需要透明底色
				})
				
				const options_req = {
					hostname: 'api.weixin.qq.com',
					path: `/wxa/getwxacodeunlimit?access_token=${accessToken}`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': Buffer.byteLength(postData)
					}
				}
				
				const req = https.request(options_req, (res) => {
					const chunks = []
					
					res.on('data', (chunk) => {
						chunks.push(chunk)
					})
					
					res.on('end', () => {
						const buffer = Buffer.concat(chunks)
						
						// 检查是否是错误响应（JSON格式）
						try {
							const jsonResponse = JSON.parse(buffer.toString())
							if (jsonResponse.errcode) {
								reject(new Error(`微信API错误: ${jsonResponse.errcode} - ${jsonResponse.errmsg}`))
								return
							}
						} catch (e) {
							// 不是JSON，说明是图片数据，继续处理
						}
						
						resolve(buffer)
					})
				})
				
				req.on('error', (error) => {
					reject(error)
				})
				
				req.write(postData)
				req.end()
			})

			// 生成临时文件名
			const tempFileName = `qrcode_${Date.now()}_${Math.random().toString(36).substring(7)}.png`
			const tempFilePath = path.join(__dirname, '../../temp', tempFileName)
			
			// 确保temp目录存在
			const tempDir = path.dirname(tempFilePath)
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir, { recursive: true })
			}

			// 保存到临时文件
			fs.writeFileSync(tempFilePath, buffer)

			// 生成对象存储的完整路径（包含目录和文件名）
			const objectKey = `qrcode/${tempFileName}`

			// 上传到对象存储（uploadFile 返回完整的 URL 字符串）
			const qrcodeUrl = await uploadFile(tempFilePath, objectKey)
			
			// 日志输出：小程序码生成成功
			console.log('小程序码生成成功')
			console.log('小程序码URL:', qrcodeUrl)
			console.log('================================')
			
			// 删除临时文件
			try {
				fs.unlinkSync(tempFilePath)
			} catch (e) {
				console.warn('删除临时文件失败:', e)
			}

			// 返回完整URL（uploadFile 已经返回了完整的 URL）
			return qrcodeUrl
		} catch (error) {
			console.error('生成小程序码失败:', error)
			throw error
		}
	}
}
