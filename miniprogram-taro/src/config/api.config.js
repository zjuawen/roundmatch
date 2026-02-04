/**
 * API 配置
 * 用于配置不同环境下的服务器地址
 * 
 * 注意：小程序运行时没有 process 对象
 * Taro 编译时会替换 process.env.XXX 为字符串常量
 * 直接使用 process.env.XXX，不要访问 process 对象本身
 */

// 开发环境配置
const DEV_CONFIG = {
  // 小程序开发环境：使用局域网 IP（小程序无法访问 localhost）
  // 请根据实际情况修改为你的局域网 IP
  // 获取本机 IP: ifconfig | grep "inet " | grep -v 127.0.0.1 (macOS/Linux)
  // 或: ipconfig (Windows)
  miniProgram: 'http://localhost:8300/', // 小程序开发环境地址
  
  // H5 开发环境：可以使用 localhost
  h5: 'http://localhost:8300/',
  
  // 其他平台开发环境
  default: 'http://localhost:8300/'
}

// 生产环境配置
const PROD_CONFIG = {
  // 生产环境服务器地址
  default: 'https://rmapi.sdiread.com/'
}

/**
 * 获取 API 基础地址
 * 
 * Taro 编译时会替换 process.env.XXX 为字符串常量
 * 直接使用 process.env.XXX，不要访问 process 对象本身
 */
export function getApiBaseUrl() {
  // Taro 编译时会将这些替换为字符串常量（如 'weapp', 'development'）
  // 直接使用，webpack DefinePlugin 会在编译时替换
  // @ts-ignore - Taro 编译时会替换
  const taroEnv = process.env.TARO_ENV || 'weapp'
  // @ts-ignore - Taro 编译时会替换
  const nodeEnv = process.env.NODE_ENV || 'production'
  
  // 判断是否为开发环境
  const isDevelopment = nodeEnv === 'development'
  
  // 判断是否为小程序环境
  const isMiniProgram = ['weapp', 'swan', 'alipay', 'tt', 'qq', 'jd'].includes(taroEnv)
  
  if (isDevelopment) {
    // 开发环境
    if (isMiniProgram) {
      return DEV_CONFIG.miniProgram
    } else if (taroEnv === 'h5') {
      return DEV_CONFIG.h5
    } else {
      return DEV_CONFIG.default
    }
  } else {
    // 生产环境
    return PROD_CONFIG.default
  }
}

/**
 * 获取 RustFS 文件服务器地址（用于图片访问）
 */
export function getRustfsUrl() {
  // @ts-ignore - Taro 编译时会替换
  const taroEnv = process.env.TARO_ENV || 'weapp'
  // @ts-ignore - Taro 编译时会替换
  const nodeEnv = process.env.NODE_ENV || 'production'
  
  const isDevelopment = nodeEnv === 'development'
  const isMiniProgram = ['weapp', 'swan', 'alipay', 'tt', 'qq', 'jd'].includes(taroEnv)

  if (isDevelopment) {
    // 开发环境
    if (isMiniProgram) {
      // 小程序开发环境：使用局域网 IP
      return 'http://localhost:9000/' // 请修改为你的 RustFS 局域网 IP
    } else {
      return 'http://localhost:9000/'
    }
  } else {
    // 生产环境：使用生产 RustFS 地址
    return 'https://rfapi.sdiread.com/' // 请修改为你的生产环境 RustFS 地址
  }
}

export default {
  getApiBaseUrl,
  getRustfsUrl
}
