/**
 * API service for Taro
 * Project : roundmatch
 **/
import Taro from '@tarojs/taro'
import { getApiBaseUrl } from '../config/api.config'

// 获取服务器地址（根据运行环境和平台自动判断）
const SERVER_URL = getApiBaseUrl()

// 开发环境下输出当前使用的服务器地址
// Taro 编译时会替换 process.env.XXX 为字符串常量
// @ts-ignore - Taro 编译时会替换
const NODE_ENV = process.env.NODE_ENV || 'production'
if (NODE_ENV === 'development') {
  console.log('[API] 当前服务器地址:', SERVER_URL)
  // @ts-ignore
  console.log('[API] TARO_ENV:', process.env.TARO_ENV)
  // @ts-ignore
  console.log('[API] NODE_ENV:', NODE_ENV)
}

class ApiService {
  request(options) {
    return new Promise((resolve, reject) => {
      Taro.request({
        url: SERVER_URL + options.url,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'content-type': 'application/json',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.code === 0) {
              resolve(res.data)
            } else {
              reject(new Error(res.data.msg || '请求失败'))
            }
          } else {
            reject(new Error(`HTTP Error: ${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  get(url, data) {
    return this.request({ url, method: 'GET', data })
  }

  post(url, data) {
    return this.request({ url, method: 'POST', data })
  }
}

export default new ApiService()

// API functions
export const clubService = {
  list: (openid) => api.get('api/clubservice', { action: 'list', openid }),
  create: (info, userInfo) => api.get('api/clubservice', { action: 'create', info, userInfo }),
  join: (clubid, userInfo, password) => api.get('api/clubservice', { action: 'join', clubid, userInfo, password }),
  info: (clubid) => api.get('api/clubservice', { action: 'info', clubid }),
  search: (keyword) => api.get('api/clubservice', { action: 'search', keyword })
}

export const userService = {
  login: (code) => api.get('api/userservice', { action: 'login', code }),
  detail: (openid) => api.get('api/userservice', { action: 'detail', openid }),
  update: (openid, userInfo) => {
    // 将 userInfo 对象序列化为 JSON 字符串，因为 GET 请求需要字符串参数
    return api.get('api/userservice', { 
      action: 'update', 
      openid, 
      userInfo: JSON.stringify(userInfo) 
    })
  }
}

export const matchService = {
  list: (openid, clubid, pageNum, pageSize) => api.get('api/matchservice', { 
    action: 'list', 
    openid, 
    clubid, 
    pageNum, 
    pageSize 
  }),
  create: (players, type) => api.get('api/matchservice', { action: 'create', players, type }),
  read: (clubid, matchid) => api.get('api/matchservice', { action: 'read', clubid, matchid }),
  delete: (clubid, matchid) => api.get('api/matchservice', { action: 'delete', clubid, matchid })
}

const api = new ApiService()

