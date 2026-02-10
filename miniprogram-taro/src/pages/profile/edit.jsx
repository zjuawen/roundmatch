import { Component } from 'react'
import { View, Button, Image, Input, Picker, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { userService } from '../../services/api'
import { saveGlobalData, getGlobalData } from '../../utils'
import userUnloginImage from '../../assets/images/user-unlogin.png'
import './edit.scss'

const defaultAvatarUrl = userUnloginImage

const genderOptions = ['男', '女', '未知']

export default class EditProfile extends Component {
  state = {
    avatarUrl: defaultAvatarUrl,
    nickname: '',
    gender: '未知',
    genderIndex: 2,
    loading: false
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '编辑资料'
    })
    
    this.loadUserInfo()
  }

  // 加载用户信息
  loadUserInfo = async () => {
    const userInfo = getGlobalData('userInfo')
    const openid = getGlobalData('openid')
    
    // 先显示本地缓存的用户信息
    if (userInfo) {
      this.setState({
        avatarUrl: userInfo.avatarUrl || defaultAvatarUrl,
        nickname: userInfo.name || userInfo.nickName || '',
        gender: userInfo.gender === 1 ? '男' : userInfo.gender === 2 ? '女' : '未知',
        genderIndex: userInfo.gender === 1 ? 0 : userInfo.gender === 2 ? 1 : 2
      })
    }
    
    // 如果有 openid，总是尝试从服务器获取最新的用户信息（包括头像）
    if (openid) {
      try {
        const data = await userService.detail(openid)
        if (data.data && data.data.userInfo) {
          const serverUserInfo = data.data.userInfo
          saveGlobalData('userInfo', serverUserInfo)
          // 更新显示，确保头像URL正确
          // 同时检查 avatarUrl 和 avatarurl 字段
          const avatarUrl = serverUserInfo.avatarUrl || serverUserInfo.avatarurl || defaultAvatarUrl
          this.setState({
            avatarUrl: avatarUrl,
            nickname: serverUserInfo.name || serverUserInfo.nickName || '',
            gender: serverUserInfo.gender === 1 ? '男' : serverUserInfo.gender === 2 ? '女' : '未知',
            genderIndex: serverUserInfo.gender === 1 ? 0 : serverUserInfo.gender === 2 ? 1 : 2
          })
          console.log('已加载最新用户信息，头像URL:', avatarUrl)
        }
      } catch (error) {
        console.error('Load user info error:', error)
        // 如果加载失败，继续使用本地缓存的信息
      }
    }
  }

  // 选择头像
  onChooseAvatar = async (e) => {
    const { avatarUrl } = e.detail
    console.log('选择头像:', avatarUrl)
    
    // 先更新显示
    this.setState({
      avatarUrl: avatarUrl || defaultAvatarUrl
    })
    
    // 上传头像到服务器
    if (avatarUrl && avatarUrl !== defaultAvatarUrl) {
      try {
        const serverAvatarUrl = await this.uploadAvatarToServer(avatarUrl)
        
        // 上传成功，更新头像 URL 为服务器返回的链接
        this.setState({
          avatarUrl: serverAvatarUrl
        })
        
        Taro.showToast({
          title: '头像上传成功',
          icon: 'success',
          duration: 1500
        })
      } catch (error) {
        console.error('上传头像失败:', error)
        Taro.showToast({
          title: '上传头像失败，请重试',
          icon: 'none',
          duration: 2000
        })
        // 上传失败，恢复默认头像
        this.setState({
          avatarUrl: defaultAvatarUrl
        })
      }
    }
  }

  // 输入昵称
  onNicknameInput = (e) => {
    const nickname = e.detail.value
    this.setState({
      nickname: nickname
    })
  }

  // 昵称输入完成（失焦）
  onNicknameBlur = (e) => {
    const nickname = e.detail.value
    this.setState({
      nickname: nickname
    })
  }

  // 选择性别
  onGenderChange = (e) => {
    const index = parseInt(e.detail.value)
    this.setState({
      genderIndex: index,
      gender: genderOptions[index]
    })
  }

  // 上传头像到服务器（支持本地路径和网络 URL）
  uploadAvatarToServer = async (avatarUrl) => {
    try {
      let filePath = avatarUrl
      
      // 如果是网络 URL，需要先下载到本地
      if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
        Taro.showLoading({
          title: '下载头像中...',
          mask: true
        })
        
        const downloadRes = await Taro.downloadFile({
          url: avatarUrl
        })
        
        if (downloadRes.statusCode === 200 && downloadRes.tempFilePath) {
          filePath = downloadRes.tempFilePath
          console.log('头像下载成功，临时路径:', filePath)
        } else {
          Taro.hideLoading()
          throw new Error('下载头像失败: ' + (downloadRes.errMsg || '未知错误'))
        }
      }
      
      // 检查文件路径是否有效
      if (!filePath || (!filePath.startsWith('http://tmp/') && !filePath.startsWith('wxfile://') && !filePath.startsWith('file://') && !filePath.startsWith('/'))) {
        Taro.hideLoading()
        throw new Error('无效的文件路径: ' + filePath)
      }
      
      // 上传到服务器
      Taro.showLoading({
        title: '上传头像中...',
        mask: true
      })
      
      const { mediaService } = await import('../../services/api')
      const result = await mediaService.upload(filePath, 'head')
      
      Taro.hideLoading()
      
      console.log('上传响应:', result)
      
      // 检查响应格式
      if (result && result.code === 0) {
        if (result.data && result.data.url) {
          console.log('头像上传成功，URL:', result.data.url)
          return result.data.url
        } else {
          console.error('上传响应中 data 为空或没有 url:', result)
          throw new Error('服务器返回数据格式错误，请检查服务器日志')
        }
      } else {
        console.error('上传失败:', result)
        throw new Error(result.msg || '上传失败')
      }
    } catch (error) {
      Taro.hideLoading()
      console.error('上传头像异常:', error)
      throw error
    }
  }


  // 提交用户信息
  handleSubmit = async () => {
    const { avatarUrl, nickname, genderIndex } = this.state
    
    // 验证必填项
    if (!nickname || nickname.trim() === '') {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.setState({ loading: true })

    try {
      // 构建用户信息对象
      const genderValue = genderIndex === 0 ? 1 : genderIndex === 1 ? 2 : 0
      const userInfo = {
        avatarUrl: avatarUrl || defaultAvatarUrl,
        name: nickname.trim(),
        nickName: nickname.trim(),
        gender: genderValue
      }

      console.log('提交用户信息:', userInfo)
      
      const openid = getGlobalData('openid')
      
      if (!openid) {
        Taro.showToast({
          title: '登录信息失效，请重新登录',
          icon: 'none'
        })
        this.setState({ loading: false })
        return
      }
      
      // 更新用户信息
      const updateResult = await userService.update(openid, userInfo)
      console.log('更新用户信息结果:', updateResult)
      
      if (updateResult && updateResult.code === 0) {
        // 优先使用后端返回的用户信息（包含完整的 avatarUrl）
        let finalUserInfo = userInfo
        if (updateResult.data && updateResult.data.userInfo) {
          finalUserInfo = updateResult.data.userInfo
          console.log('使用后端返回的用户信息:', finalUserInfo)
        }
        
        // 保存用户信息到本地存储
        saveGlobalData('userInfo', finalUserInfo)
        
        Taro.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1500
        })
        
        // 延迟返回上一页
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      } else {
        Taro.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('更新用户信息异常:', error)
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    const { avatarUrl, nickname, genderIndex, loading } = this.state

    return (
      <View className='edit-profile-page'>
        <View className='edit-content'>
          <View className='title-section'>
            <View className='title-icon'>✏️</View>
            <View className='title-text'>编辑个人资料</View>
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
          
          <View className='form-section'>
            <View className='form-item'>
              <View className='form-label'>昵称</View>
              <Input 
                className='form-input' 
                type='nickname'
                value={nickname}
                onInput={this.onNicknameInput}
                onBlur={this.onNicknameBlur}
                maxLength={20}
                placeholder='请输入昵称'
              />
            </View>
            
            <View className='form-item'>
              <View className='form-label'>性别</View>
              <Picker
                mode='selector'
                range={genderOptions}
                value={genderIndex}
                onChange={this.onGenderChange}
              >
                <View className='picker-view'>
                  <Text className='picker-text'>{genderOptions[genderIndex]}</Text>
                  <Text className='picker-arrow'>›</Text>
                </View>
              </Picker>
            </View>
          </View>
        </View>
        
        <View className='submit-button-wrapper'>
          <Button 
            className='submit-button' 
            onClick={this.handleSubmit}
            disabled={loading}
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </View>
      </View>
    )
  }
}
