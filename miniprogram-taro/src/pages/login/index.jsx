import { Component } from 'react'
import { View, Button, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { userService } from '../../services/api'
import { saveGlobalData, getGlobalData } from '../../utils'
import userUnloginImage from '../../assets/images/user-unlogin.png'
import './index.scss'

const defaultAvatarUrl = userUnloginImage

export default class Login extends Component {
  state = {
    avatarUrl: defaultAvatarUrl,
    nickname: '',
    userInfo: {},
    returnUrl: null, // 授权后返回的页面 URL
    checking: true // 正在检查登录状态
  }

  componentDidMount() {
    this.initLogin()
  }

  initLogin = async () => {
    // 获取返回 URL 参数
    const router = Taro.getCurrentInstance().router
    const params = router?.params || {}
    let returnUrl = params.returnUrl || null
    
    // 解码 returnUrl
    if (returnUrl) {
      try {
        returnUrl = decodeURIComponent(returnUrl)
      } catch (e) {
        console.error('Failed to decode returnUrl:', e)
      }
    }
    
    console.log('Login page mounted, returnUrl:', returnUrl)
    
    // 保存返回 URL 到 state（解码后的）
    this.setState({ returnUrl, checking: true })

    // 先尝试静默登录获取 openid
    const { silentLogin } = await import('../../utils')
    let openid = await silentLogin()
    
    // 检查登录状态
    const userInfo = getGlobalData('userInfo')
    const isLoggedIn = openid && userInfo && userInfo.name
    
    console.log('Login status check:', { 
      openid: !!openid, 
      userInfo: !!userInfo, 
      isLoggedIn, 
      returnUrl
    })

    this.setState({ checking: false })

    // 如果已登录（有 openid 和 userInfo），且有 returnUrl，直接跳转回原页面
    if (isLoggedIn && returnUrl) {
      console.log('Already logged in with returnUrl, redirecting...')
      this.redirect(returnUrl)
      return
    }
    
    // 如果已登录但没有 returnUrl，跳转到默认页面
    if (isLoggedIn && !returnUrl) {
      console.log('Already logged in without returnUrl, redirecting to default...')
      this.redirect()
      return
    }

    // 如果有 openid 但没有 userInfo，需要用户授权获取用户信息
    // 显示授权界面，等待用户操作
    if (openid && !userInfo) {
      console.log('Has openid but no userInfo, showing auth interface')
      // 页面会显示授权界面
    } else if (!openid) {
      console.log('No openid, showing auth interface')
      // 页面会显示授权界面
    }
  }

  isLogin = () => {
    const openid = getGlobalData('openid')
    const userInfo = getGlobalData('userInfo')
    const result = (openid != null && openid !== false && openid !== '') && 
                   (userInfo != null && userInfo !== false && userInfo !== '')
    console.log('isLogin check:', { openid, userInfo, result })
    return result
  }

  redirect = (returnUrl = null) => {
    // 如果有返回 URL，跳转到返回页面
    if (returnUrl) {
      try {
        // 解码 URL
        const decodedUrl = decodeURIComponent(returnUrl)
        // 检查是否是 tabBar 页面
        if (decodedUrl.includes('/pages/matches/list') || decodedUrl.includes('/pages/profile/index')) {
          // tabBar 页面需要使用 switchTab
          let tabBarUrl = '/pages/matches/list'
          if (decodedUrl.includes('/pages/profile/index')) {
            tabBarUrl = '/pages/profile/index'
          }
          Taro.switchTab({
            url: tabBarUrl
          })
        } else {
          // 非 tabBar 页面，使用 redirectTo 或 navigateTo
          // 如果包含参数，使用 navigateTo 保持页面栈
          if (decodedUrl.includes('?')) {
            Taro.redirectTo({
              url: decodedUrl
            }).catch(() => {
              // 如果 redirectTo 失败，尝试 navigateTo
              Taro.navigateTo({
                url: decodedUrl
              }).catch(() => {
                // 如果都失败，跳转到默认页面（比赛列表）
                Taro.switchTab({
                  url: '/pages/matches/list'
                })
              })
            })
          } else {
            Taro.redirectTo({
              url: decodedUrl
            })
          }
        }
      } catch (error) {
        console.error('跳转返回页面失败:', error)
        // 跳转失败，跳转到默认页面（比赛列表）
        Taro.switchTab({
          url: '/pages/matches/list'
        })
      }
    } else {
      // 没有返回 URL，跳转到默认页面（比赛列表）
      Taro.switchTab({
        url: '/pages/matches/list'
      })
    }
  }

  login = async () => {
    try {
      const res = await Taro.login()
      const code = res.code
      
      const data = await userService.login(code)
      
      if (data.data && data.data.openid) {
        saveGlobalData('openid', data.data.openid)
        // 如果同时获取到了用户信息
        if (data.data && data.data.userInfo != null) {
          saveGlobalData('userInfo', data.data.userInfo)
          // 如果有 returnUrl，跳转回原页面；否则跳转到默认页面
          const { returnUrl } = this.state
          // 只有在没有 returnUrl 时才自动跳转（避免打断用户授权流程）
          if (!returnUrl) {
            this.redirect(null)
          }
          // 如果有 returnUrl，说明用户需要授权，不自动跳转，等待用户点击授权按钮
        }
        // 否则只保存 openid，不跳转，让用户主动授权获取用户信息
      }
    } catch (error) {
      console.error('Login error:', error)
      // 登录失败不影响页面显示，用户可以选择稍后重试
    }
  }

  // 选择头像
  onChooseAvatar = (e) => {
    const { avatarUrl } = e.detail
    console.log('选择头像:', avatarUrl)
    this.setState({
      avatarUrl: avatarUrl || defaultAvatarUrl
    })
  }

  // 输入昵称
  onNicknameInput = (e) => {
    const nickname = e.detail.value
    console.log('输入昵称:', nickname)
    this.setState({
      nickname: nickname
    })
  }

  // 昵称输入完成（失焦）
  onNicknameBlur = (e) => {
    const nickname = e.detail.value
    console.log('昵称输入完成:', nickname)
    this.setState({
      nickname: nickname
    })
  }

  // 提交用户信息
  handleSubmit = async () => {
    const { avatarUrl, nickname } = this.state
    
    // 验证必填项
    if (!nickname || nickname.trim() === '') {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 构建用户信息对象
    const userInfo = {
      avatarUrl: avatarUrl || defaultAvatarUrl,
      name: nickname.trim(), // 使用 name 字段，与后端保持一致
      nickName: nickname.trim() // 同时保存 nickName 以兼容旧数据
    }

    console.log('提交用户信息:', userInfo)
    
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
      
      // 跳转到返回页面或默认页面
      try {
        const { returnUrl } = this.state
        console.log('准备跳转，returnUrl:', returnUrl)
        this.redirect(returnUrl)
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
  }

  render() {
    const { avatarUrl, nickname, returnUrl, checking } = this.state
    
    // 如果正在检查登录状态，显示加载界面
    if (checking) {
      return (
        <View className='loading-page'>
          <View className='loading-container'>
            <View className='loading-spinner'></View>
            <View className='loading-text'>程序正在初始化...</View>
          </View>
        </View>
      )
    }

    return (
      <View className='login-page'>
        <View className='login-content'>
          <View className='title-section'>
            <View className='title-icon'>👤</View>
            <View className='title-text'>完善个人信息</View>
            <View className='title-desc'>请设置您的头像和昵称</View>
          </View>
          
          <View className='avatar-wrapper'>
            <Button 
              className='avatar-button' 
              openType='chooseAvatar'
              onChooseAvatar={this.onChooseAvatar}
            >
              <Image 
                className='avatar' 
                src={avatarUrl || defaultAvatarUrl}
                mode='aspectFill'
                onError={(e) => {
                  console.error('头像加载失败:', e)
                  this.setState({ avatarUrl: defaultAvatarUrl })
                }}
              />
            </Button>
            <View className='avatar-hint'>点击选择头像</View>
          </View>
          
          <View className='nickname-wrapper'>
            <View className='nickname-label'>昵称</View>
            <Input 
              className='nickname-input' 
              type='nickname'
              // placeholder='请输入昵称'
              value={nickname}
              onInput={this.onNicknameInput}
              onBlur={this.onNicknameBlur}
              maxLength={20}
            />
          </View>
          
          <Button 
            className='login-button' 
            onClick={this.handleSubmit}
          >
            完成授权
          </Button>
          
          {returnUrl && (
            <View className='return-hint'>
              授权完成后将自动返回原页面
            </View>
          )}
        </View>
      </View>
    )
  }
}

