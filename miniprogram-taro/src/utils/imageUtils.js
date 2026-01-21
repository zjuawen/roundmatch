/**
 * 图片工具函数
 * 用于处理 RustFS 对象存储的图片 URL
 */

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
 * 图片加载错误处理
 * @param {object} event - 错误事件对象
 * @param {function} setState - setState 函数
 * @param {string} defaultUrl - 默认图片路径
 */
export function handleImageError(event, setState, defaultUrl = '/assets/images/default-club-logo.svg') {
  console.error('图片加载失败:', event.detail?.errMsg || '未知错误')
  // Taro 的 Image 组件错误处理
  if (setState && event.currentTarget?.dataset) {
    const { type, index } = event.currentTarget.dataset
    // 可以根据 type 和 index 更新对应的状态
    // 这里需要根据具体页面实现
  }
}
