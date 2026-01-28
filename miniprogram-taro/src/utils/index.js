/**
 * Utility functions
 * Project : roundmatch
 **/
import Taro from '@tarojs/taro'

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
 * 安全地返回上一页，如果没有历史记录则跳转到默认页面
 * @param {string} defaultUrl - 默认跳转的页面路径
 */
export const safeNavigateBack = (defaultUrl = '/pages/clubs/list') => {
  try {
    const pages = Taro.getCurrentPages()
    if (pages && pages.length > 1) {
      // 有历史记录，可以返回
      Taro.navigateBack()
    } else {
      // 没有历史记录（比如扫码进入），跳转到默认页面
      // 先尝试 switchTab（如果是 tabbar 页面）
      if (defaultUrl === '/pages/clubs/list' || defaultUrl === '/pages/matches/list') {
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

