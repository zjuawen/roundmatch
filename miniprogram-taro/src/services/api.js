/**
 * API service for Taro
 * Project : roundmatch
 **/
import Taro from '@tarojs/taro'

// 微信小程序不能访问 localhost，需要使用局域网 IP
// 获取本机 IP: ifconfig | grep "inet " | grep -v 127.0.0.1
const SERVER_URL = process.env.NODE_ENV === 'development' 
  ? 'http://10.1.21.185:8300/' 
  : 'https://roundmatch.microripples.cn/'

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

