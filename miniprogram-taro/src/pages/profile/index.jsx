import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { clubService } from '../../services/api'
import { getGlobalData, clearGlobalData, saveGlobalData } from '../../utils'
import userUnloginImage from '../../assets/images/user-unlogin.png'
import './index.scss'

export default class Profile extends Component {
  state = {
    userInfo: null,
    avatarUrl: userUnloginImage,
    clubs: [],
    currentClubId: null,
    loading: false,
    expanded: false // 是否展开俱乐部列表
  }

  componentDidMount() {
    // 设置导航栏标题
    Taro.setNavigationBarTitle({
      title: '个人中心'
    })
    
    this.loadUserInfo()
    this.loadClubs()
  }

  componentDidShow() {
    this.loadUserInfo()
    this.loadClubs()
  }

  loadUserInfo = async () => {
    const userInfo = getGlobalData('userInfo')
    const openid = getGlobalData('openid')
    
    // 先显示本地缓存的用户信息
    if (userInfo) {
      // 同时检查 avatarUrl 和 avatarurl 字段
      const avatarUrl = userInfo.avatarUrl || userInfo.avatarurl || userUnloginImage
      this.setState({
        userInfo,
        avatarUrl: avatarUrl
      })
    }
    
    // 如果有 openid，总是尝试从服务器获取最新的用户信息（包括头像）
    if (openid) {
      try {
        const { userService } = require('../../services/api')
        const data = await userService.detail(openid)
        if (data.data && data.data.userInfo) {
          const serverUserInfo = data.data.userInfo
          // 保存到本地存储
          saveGlobalData('userInfo', serverUserInfo)
          // 更新头像显示，同时检查 avatarUrl 和 avatarurl 字段
          const avatarUrl = serverUserInfo.avatarUrl || serverUserInfo.avatarurl || userUnloginImage
          this.setState({
            userInfo: serverUserInfo,
            avatarUrl: avatarUrl
          })
          console.log('已加载最新用户信息，头像URL:', avatarUrl)
        }
      } catch (error) {
        console.error('Load user info from server error:', error)
        // 如果加载失败，继续使用本地缓存的信息
      }
    }
  }

  // 加载用户已加入的俱乐部列表
  loadClubs = async () => {
    const openid = getGlobalData('openid')
    const currentClubId = getGlobalData('selectedClubId')
    
    if (!openid) {
      this.setState({ clubs: [], currentClubId: null })
      return
    }

    this.setState({ loading: true, currentClubId })
    
    try {
      const data = await clubService.list(openid)
      let clubs = (data.data?.private || []).map(club => ({
        _id: club._id,
        wholeName: club.wholename || club.wholeName,
        shortName: club.shortname || club.shortName,
        logo: club.logo
      }))
      
      // 如果有选中的默认俱乐部，将其移到第一个位置
      if (currentClubId && clubs.length > 0) {
        const currentClubIndex = clubs.findIndex(club => club._id === currentClubId)
        if (currentClubIndex > 0) {
          // 如果选中的俱乐部不在第一个位置，将其移到第一个
          const currentClub = clubs[currentClubIndex]
          clubs.splice(currentClubIndex, 1) // 从原位置移除
          clubs.unshift(currentClub) // 添加到第一个位置
          console.log('已将选中的默认俱乐部移到第一个位置:', currentClubId)
        }
      }
      
      this.setState({ clubs })
    } catch (error) {
      console.error('Load clubs error:', error)
      Taro.showToast({
        title: '加载俱乐部列表失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  // 切换俱乐部
  handleSwitchClub = (club) => {
    if (club._id === this.state.currentClubId) {
      return // 已经是当前俱乐部
    }

    saveGlobalData('selectedClubId', club._id)
    this.setState({ currentClubId: club._id })
    
    Taro.showToast({
      title: `已切换到${club.wholeName}`,
      icon: 'success',
      duration: 1500
    })

    // 跳转到比赛列表页面
    setTimeout(() => {
      Taro.switchTab({
        url: '/pages/matches/list'
      })
    }, 1500)
  }

  // 切换展开/收缩状态
  handleToggleExpand = () => {
    this.setState({ expanded: !this.state.expanded })
  }

  handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          clearGlobalData('openid')
          clearGlobalData('userInfo')
          clearGlobalData('selectedClubId')
          Taro.reLaunch({
            url: '/pages/login/index'
          })
        }
      }
    })
  }

  handleEditProfile = () => {
    Taro.navigateTo({
      url: '/pages/profile/edit'
    })
  }

  render() {
    const { userInfo, avatarUrl, clubs, currentClubId, expanded } = this.state
    const MAX_VISIBLE_CLUBS = 3
    const hasMoreClubs = clubs.length > MAX_VISIBLE_CLUBS
    const visibleClubs = expanded ? clubs : clubs.slice(0, MAX_VISIBLE_CLUBS)

    return (
      <View className='profile-page'>
        <View className='profile-header'>
          <Image 
            className='avatar' 
            src={avatarUrl}
            mode='aspectFill'
            onClick={this.handleEditProfile}
          />
          <View className='user-info'>
            <Text className='nickname'>{userInfo?.name || userInfo?.nickName || '未设置昵称'}</Text>
            {userInfo?.province && (
              <Text className='location'>{userInfo.province}{userInfo.city ? ` ${userInfo.city}` : ''}</Text>
            )}
          </View>
        </View>

        <View className='profile-content'>
          {/* 切换俱乐部 */}
          {clubs.length > 0 && (
            <View className='menu-section'>
              <View className='section-title'>我的俱乐部</View>
              {visibleClubs.map(club => (
                <View key={club._id}>
                  <View 
                    className={`menu-item ${club._id === currentClubId ? 'menu-item-active' : ''}`}
                    onClick={() => this.handleSwitchClub(club)}
                  >
                    <View className='club-info-wrapper'>
                      {club.logo && (
                        <Image 
                          className='club-logo' 
                          src={club.logo}
                          mode='aspectFit'
                        />
                      )}
                      <View className='club-info'>
                        <Text className='club-name'>{club.wholeName}</Text>
                        {club.shortName && (
                          <Text className='club-shortname'>[ {club.shortName} ]</Text>
                        )}
                      </View>
                    </View>
                    {club._id === currentClubId && (
                      <Text className='current-badge'>当前</Text>
                    )}
                    {club._id !== currentClubId && (
                      <Text className='menu-arrow'>›</Text>
                    )}
                  </View>
                  <View className='menu-divider' />
                </View>
              ))}
              {hasMoreClubs && (
                <View className='expand-toggle' onClick={this.handleToggleExpand}>
                  <Text className='expand-text'>
                    {expanded ? '收起' : `展开更多 (${clubs.length - MAX_VISIBLE_CLUBS}个)`}
                  </Text>
                  <Text className={`expand-arrow ${expanded ? 'expanded' : ''}`}>▼</Text>
                </View>
              )}
            </View>
          )}

          <View className='menu-section'>
            <View className='menu-item' onClick={this.handleEditProfile}>
              <Text className='menu-label'>编辑资料</Text>
              <Text className='menu-arrow'>›</Text>
            </View>
            <View className='menu-divider' />
            <View className='menu-item' onClick={this.handleLogout}>
              <Text className='menu-label logout'>退出登录</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
