import { Component } from 'react'
import { View, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { userService } from '../../services/api'
import { saveGlobalData, getGlobalData } from '../../utils'
import './index.scss'

export default class Login extends Component {
  state = {
    avatarUrl: '/images/user-unlogin.png',
    userInfo: {},
    canIUseGetUserProfile: false
  }

  componentDidMount() {
    if (this.isLogin()) {
      this.redirect()
      return
    }

    if (Taro.getUserProfile) {
      this.setState({
        canIUseGetUserProfile: true
      })
    }

    this.login()
  }

  isLogin = () => {
    return (getGlobalData('openid') != null) && (getGlobalData('userInfo') != null)
  }

  redirect = () => {
    // 跳转到 tabBar 页面需要使用 switchTab，不能使用 redirectTo
    Taro.switchTab({
      url: '/pages/clubs/list'
    })
  }

  login = async () => {
    try {
      const res = await Taro.login()
      const code = res.code
      
      const data = await userService.login(code)
      
      if (data.data && data.data.openid) {
        saveGlobalData('openid', data.data.openid)
      }

      if (data.data && data.data.userInfo != null) {
        saveGlobalData('userInfo', data.data.userInfo)
        this.redirect()
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  getUserProfile = async (e) => {
    try {
      // 使用 openType='getUserProfile' 时，用户信息在 e.detail.userInfo 中
      // 不需要再次调用 Taro.getUserProfile
      const userInfo = e.detail?.userInfo
      
      if (!userInfo) {
        Taro.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
        return
      }
      
      console.log('获取到用户信息:', userInfo)
      
      let openid = getGlobalData('openid')
      
      // 如果没有 openid，先执行登录
      if (!openid) {
        console.log('没有 openid，执行登录...')
        await this.login()
        openid = getGlobalData('openid')
        console.log('登录后获取到 openid:', openid)
      }
      
      if (!openid) {
        Taro.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
        return
      }
      
      if (openid && userInfo) {
        console.log('开始更新用户信息，openid:', openid, 'userInfo:', userInfo)
        
        try {
          const updateResult = await userService.update(openid, userInfo)
          console.log('更新用户信息结果:', updateResult)
          
          // 检查更新结果，即使失败也继续执行
          if (updateResult && updateResult.code === 0) {
            console.log('更新用户信息成功')
          } else {
            console.warn('更新用户信息返回异常:', updateResult)
          }
        } catch (updateError) {
          console.error('更新用户信息异常:', updateError)
          // 即使更新失败，也继续执行后续逻辑
        }
        
        // 保存用户信息到本地存储
        try {
          saveGlobalData('userInfo', userInfo)
          console.log('用户信息已保存到本地存储')
        } catch (saveError) {
          console.error('保存用户信息失败:', saveError)
        }
        
        // 跳转到俱乐部列表
        try {
          console.log('准备跳转到俱乐部列表')
          this.redirect()
        } catch (redirectError) {
          console.error('跳转失败:', redirectError)
          Taro.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          })
        }
      } else {
        console.error('缺少必要参数:', { openid, userInfo })
        Taro.showToast({
          title: '参数错误',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('getUserProfile error:', error)
      Taro.showToast({
        title: error.message || '授权失败，请重试',
        icon: 'none'
      })
    }
  }

  render() {
    const { canIUseGetUserProfile } = this.state

    return (
      <View className='login-page'>
        <View className='login-content'>
          <Image className='avatar' src={this.state.avatarUrl} />
          {canIUseGetUserProfile ? (
            <Button 
              className='login-button' 
              openType='getUserProfile' 
              onGetUserProfile={this.getUserProfile}
            >
              授权登录
            </Button>
          ) : (
            <Button 
              className='login-button' 
              openType='getUserInfo' 
              onGetUserInfo={this.getUserProfile}
            >
              授权登录
            </Button>
          )}
        </View>
      </View>
    )
  }
}

