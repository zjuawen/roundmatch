/**
 * API 配置 - 简化版本（如果编译时替换不工作）
 * 
 * 如果 process.env 编译时替换有问题，可以使用这个版本
 * 手动根据构建命令选择配置
 */

// 开发环境配置
const DEV_CONFIG = {
  miniProgram: 'http://localhost:8300/', // 小程序开发环境地址（需要改为局域网 IP）
  h5: 'http://localhost:8300/',
  default: 'http://localhost:8300/'
}

// 生产环境配置
const PROD_CONFIG = {
  default: 'https://xw.sdiread.com/'
}

/**
 * 获取 API 基础地址 - 简化版本
 * 
 * 如果编译时替换不工作，可以手动设置 isDevelopment
 */
export function getApiBaseUrl() {
  // 方式一：使用编译时替换（推荐）
  // @ts-ignore
  const taroEnv = process.env.TARO_ENV || 'weapp'
  // @ts-ignore
  const nodeEnv = process.env.NODE_ENV || 'production'
  
  // 方式二：如果编译时替换不工作，手动设置（取消注释下面的行）
  // const taroEnv = 'weapp'  // 手动设置为 'weapp' 或其他平台
  // const nodeEnv = 'development'  // 手动设置为 'development' 或 'production'
  
  const isDevelopment = nodeEnv === 'development'
  const isMiniProgram = ['weapp', 'swan', 'alipay', 'tt', 'qq', 'jd'].includes(taroEnv)
  
  if (isDevelopment) {
    if (isMiniProgram) {
      return DEV_CONFIG.miniProgram
    } else if (taroEnv === 'h5') {
      return DEV_CONFIG.h5
    } else {
      return DEV_CONFIG.default
    }
  } else {
    return PROD_CONFIG.default
  }
}

export function getRustfsUrl() {
  // @ts-ignore
  const taroEnv = process.env.TARO_ENV || 'weapp'
  // @ts-ignore
  const nodeEnv = process.env.NODE_ENV || 'production'
  
  const isDevelopment = nodeEnv === 'development'
  const isMiniProgram = ['weapp', 'swan', 'alipay', 'tt', 'qq', 'jd'].includes(taroEnv)

  if (isDevelopment) {
    if (isMiniProgram) {
      return 'http://localhost:9000/'
    } else {
      return 'http://localhost:9000/'
    }
  } else {
    return 'https://rustfs.yourdomain.com/'
  }
}

export default {
  getApiBaseUrl,
  getRustfsUrl
}
