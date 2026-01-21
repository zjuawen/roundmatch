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

