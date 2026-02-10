/**
 * Utility functions
 * Project : roundmatch
 **/
import Taro from '@tarojs/taro'
import { userService } from '../services/api'

export const saveGlobalData = (key, value) => {
  try {
    Taro.setStorageSync(key, value)
  } catch (e) {
    console.error('saveGlobalData error:', e)
  }
}

export const getGlobalData = (key) => {
  try {
    return Taro.getStorageSync(key)
  } catch (e) {
    console.error('getGlobalData error:', e)
    return null
  }
}

export const clearGlobalData = (key) => {
  try {
    Taro.removeStorageSync(key)
  } catch (e) {
    console.error('clearGlobalData error:', e)
  }
}

export const showError = (msg) => {
  Taro.showToast({
    title: msg || '操作失败',
    icon: 'none',
    duration: 2000
  })
}

export const showSuccess = (msg) => {
  Taro.showToast({
    title: msg || '操作成功',
    icon: 'success',
    duration: 2000
  })
}

export const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 静默登录获取 openid（不显示授权页面）
 * @returns {Promise<string|null>} 返回 openid，如果失败返回 null
 */
export const silentLogin = async () => {
  try {
    // 先检查本地是否已有 openid
    const cachedOpenid = getGlobalData('openid')
    if (cachedOpenid) {
      // 即使有缓存的 openid，也尝试从服务器获取最新的用户信息（包括头像）
      try {
        const { userService } = require('../services/api')
        const data = await userService.detail(cachedOpenid)
        if (data.data && data.data.userInfo) {
          saveGlobalData('userInfo', data.data.userInfo)
          console.log('已更新用户信息（包括头像）:', data.data.userInfo)
        }
      } catch (error) {
        console.warn('获取最新用户信息失败:', error)
        // 失败不影响，继续使用缓存的 openid
      }
      return cachedOpenid
    }

    // 尝试静默登录
    const res = await Taro.login()
    const code = res.code
    
    if (!code) {
      console.error('获取 code 失败')
      return null
    }

    // 调用登录 API（自动匹配系统用户）
    const data = await userService.login(code)
    
    if (data.data && data.data.openid) {
      saveGlobalData('openid', data.data.openid)
      // 如果同时获取到了用户信息，也保存
      if (data.data.userInfo) {
        saveGlobalData('userInfo', data.data.userInfo)
      } else {
        // 如果没有用户信息，尝试从服务器获取完整的用户信息（包括头像）
        try {
          const detailData = await userService.detail(data.data.openid)
          if (detailData.data && detailData.data.userInfo) {
            saveGlobalData('userInfo', detailData.data.userInfo)
            console.log('已获取完整用户信息（包括头像）:', detailData.data.userInfo)
          }
        } catch (error) {
          console.warn('获取用户详细信息失败:', error)
        }
      }
      return data.data.openid
    }
    
    return null
  } catch (error) {
    console.error('Silent login error:', error)
    return null
  }
}

/**
 * 安全地返回上一页，如果没有历史记录则跳转到默认页面
 * @param {string} defaultUrl - 默认跳转的页面路径
 */
export const safeNavigateBack = (defaultUrl = '/pages/matches/list') => {
  try {
    const pages = Taro.getCurrentPages()
    if (pages && pages.length > 1) {
      // 有历史记录，可以返回
      Taro.navigateBack()
    } else {
      // 没有历史记录（比如扫码进入），跳转到默认页面
      // 先尝试 switchTab（如果是 tabbar 页面）
      if (defaultUrl === '/pages/matches/list' || defaultUrl === '/pages/profile/index') {
        Taro.switchTab({
          url: defaultUrl
        }).catch(() => {
          // 如果 switchTab 失败，使用 redirectTo
          Taro.redirectTo({
            url: defaultUrl
          })
        })
      } else {
        // 非 tabbar 页面，使用 redirectTo
        Taro.redirectTo({
          url: defaultUrl
        })
      }
    }
  } catch (error) {
    console.error('safeNavigateBack error:', error)
    // 出错时也尝试跳转到默认页面
    Taro.redirectTo({
      url: defaultUrl
    })
  }
}

