import { Component } from 'react'
import Taro from '@tarojs/taro'
import { saveGlobalData, silentLogin } from './utils'
import './app.scss'

class App extends Component {
  async onLaunch(options) {
    // 处理小程序启动参数（包括小程序码扫码进入）
    console.log('App onLaunch options:', options)
    
    // 小程序码扫码进入时，scene 参数可能在以下位置：
    // 1. options.scene - 场景值（数字）
    // 2. options.query.scene - scene 参数（字符串，URL编码）
    // 3. options.path - 页面路径，可能包含 query 参数
    
    let scene = null
    
    // 优先从 query 参数获取
    if (options && options.query && options.query.scene) {
      scene = options.query.scene
      console.log('从 options.query.scene 获取 scene:', scene)
    }
    
    // 如果没有，尝试从 path 中解析
    if (!scene && options && options.path) {
      try {
        const pathMatch = options.path.match(/[?&]scene=([^&]+)/)
        if (pathMatch && pathMatch[1]) {
          scene = pathMatch[1]
          console.log('从 options.path 解析 scene:', scene)
        }
      } catch (e) {
        console.warn('解析 path 中的 scene 失败:', e)
      }
    }
    
    // 保存 scene 到全局存储
    if (scene) {
      saveGlobalData('launchScene', scene)
      console.log('保存 launchScene 到全局存储:', scene)
    }

    // 自动静默登录：获取 openid 并匹配系统用户
    try {
      console.log('开始自动登录...')
      const openid = await silentLogin()
      if (openid) {
        console.log('自动登录成功，openid:', openid)
      } else {
        console.log('自动登录失败，将在需要时提示用户授权')
      }
    } catch (error) {
      console.error('自动登录异常:', error)
      // 登录失败不影响应用启动，后续页面会处理
    }
  }

  componentDidMount() {
    // 初始化云开发环境
    if (process.env.TARO_ENV === 'weapp') {
      // 微信小程序云开发初始化
      // wx.cloud.init({
      //   env: 'roundmatch',
      //   traceUser: true,
      // })
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App

