/**
 * 图片工具函数
 * 用于处理 RustFS 对象存储的图片 URL
 */
import { mediaService } from '../services/api'

/**
 * 处理图片 URL，确保可以正常显示
 * @param {string} url - 原始图片 URL
 * @returns {string} 处理后的图片 URL
 */
export function processImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return ''
  }

  // 如果已经是完整的 HTTP/HTTPS URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // 如果是 cloud:// 格式（旧格式），返回空或默认图片
  if (url.startsWith('cloud://')) {
    console.warn('检测到旧的云存储 URL:', url)
    return '' // 或者返回默认图片
  }

  // 如果是相对路径，直接返回（小程序会自动处理）
  return url
}

/**
 * 检查头像 URL 是否有效（通过检查响应头 X-Errno 或 X-Info）
 * 异步执行，不阻塞页面加载
 * @param {string} url - 头像 URL
 * @param {function} callback - 回调函数，参数为 (isValid, newAvatarUrl)
 * @returns {void}
 */
export function checkAvatarUrlAsync(url, callback) {
  if (!url || typeof url !== 'string') {
    if (callback) callback(false, null)
    return
  }

  // 如果不是 HTTP/HTTPS URL，直接返回 false
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (callback) callback(false, null)
    return
  }

  // 使用 setTimeout 确保异步执行，不阻塞主线程
  setTimeout(() => {
    mediaService.checkAvatar(url)
      .then(response => {
        const isValid = response.data?.isValid === true
        const newAvatarUrl = response.data?.newAvatarUrl || null
        if (callback) callback(isValid, newAvatarUrl)
      })
      .catch(error => {
        console.warn('检查头像URL失败:', error)
        // 如果检查失败，默认返回 true，让图片尝试加载
        if (callback) callback(true, null)
      })
  }, 0)
}

/**
 * 检查头像 URL 是否有效（通过检查响应头 X-Errno 或 X-Info）
 * @deprecated 使用 checkAvatarUrlAsync 代替，避免阻塞页面加载
 * @param {string} url - 头像 URL
 * @returns {Promise<boolean>} 是否有效
 */
export async function checkAvatarUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }

  // 如果不是 HTTP/HTTPS URL，直接返回 false
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false
  }

  try {
    const response = await mediaService.checkAvatar(url)
    return response.data?.isValid === true
  } catch (error) {
    console.warn('检查头像URL失败:', error)
    // 如果检查失败，默认返回 true，让图片尝试加载
    return true
  }
}

/**
 * 获取图片 URL，如果为空则返回默认图片
 * @param {string} url - 图片 URL
 * @param {string} defaultUrl - 默认图片路径
 * @returns {string} 图片 URL
 */
export function getImageUrl(url, defaultUrl = '/assets/images/default-club-logo.svg') {
  const processedUrl = processImageUrl(url)
  return processedUrl || defaultUrl
}

/**
 * 根据名字生成背景色
 * @param {string} name - 名字
 * @returns {string} 背景色
 */
export function generateAvatarColor(name) {
  const colors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', 
    '#909399', '#9C27B0', '#00BCD4', '#FF9800',
    '#4CAF50', '#2196F3', '#FF5722', '#795548'
  ]
  if (name && name.length > 0) {
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }
  return '#909399'
}

/**
 * 获取名字的首字母
 * @param {string} name - 名字
 * @returns {string} 首字母
 */
export function getAvatarText(name) {
  if (name && name.length > 0) {
    return name.charAt(0).toUpperCase()
  }
  return '?'
}
