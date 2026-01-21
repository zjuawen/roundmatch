import { Component } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { clubService } from '../../services/api'
import { getGlobalData } from '../../utils'
import './list.scss'

export default class ClubList extends Component {
  state = {
    clubs: [],
    loading: false,
    openid: null,
    avatarUrl: '/assets/images/user-unlogin.png',
    userInfo: null,
    searchKeyword: ''
  }

  componentDidMount() {
    this.initData()
  }

  componentDidShow() {
    // 页面显示时也检查登录状态，因为 switchTab 跳转时可能不会重新执行 componentDidMount
    this.initData()
  }

  initData = () => {
    const openid = getGlobalData('openid')
    const userInfo = getGlobalData('userInfo')
    console.log('ClubList initData, openid:', openid)
    
    if (!openid) {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
      return
    }
    
    // 加载用户信息
    if (userInfo) {
      this.setState({
        avatarUrl: userInfo.avatarUrl || '/images/user-unlogin.png',
        userInfo
      })
    }
    
    // 如果 openid 已存在且与 state 中的不同，或者 clubs 为空，则重新加载
    if (openid !== this.state.openid || this.state.clubs.length === 0) {
      this.setState({ openid })
      // 直接传递 openid，避免 setState 异步问题
      this.loadClubs(openid)
    }
  }

  loadClubs = async (openidParam) => {
    this.setState({ loading: true })
    try {
      // 优先使用传入的参数，如果没有则从 state 获取
      const openid = openidParam || this.state.openid || getGlobalData('openid')
      
      if (!openid) {
        console.error('openid 为空，无法加载俱乐部列表')
        Taro.showToast({
          title: '登录信息失效，请重新登录',
          icon: 'none'
        })
        Taro.redirectTo({
          url: '/pages/login/index'
        })
        return
      }
      
      console.log('加载俱乐部列表，openid:', openid)
      const data = await clubService.list(openid)
      console.log('俱乐部列表数据:', data)
      
      // 处理返回的数据，统一字段名为驼峰命名
      const clubs = (data.data?.private || []).map(club => ({
        _id: club._id,
        wholeName: club.wholename || club.wholeName,
        shortName: club.shortname || club.shortName,
        logo: club.logo,
        password: club.password,
        vip: club.vip,
        creator: club.creator,
        delete: club.delete,
        public: club.public,
        maxMatchAllow: club.maxmatchallow || club.maxMatchAllow,
        createDate: club.createdate || club.createDate,
        updateTime: club.updatetime || club.updateTime,
        owner: club.owner
      }))
      
      console.log('处理后的俱乐部列表:', clubs)
      this.setState({
        clubs
      })
    } catch (error) {
      console.error('Load clubs error:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  handleClubClick = (club) => {
    Taro.navigateTo({
      url: `/pages/matches/list?clubid=${club._id}`
    })
  }

  handleCreate = () => {
    Taro.navigateTo({
      url: '/pages/clubs/create'
    })
  }

  handleUserAvatarClick = () => {
    // 点击用户头像的处理逻辑
    if (!this.state.userInfo) {
      Taro.navigateTo({
        url: '/pages/login/index'
      })
    }
  }

  handleSearchInput = (e) => {
    this.setState({ searchKeyword: e.detail.value })
  }

  handleSearch = () => {
    const { searchKeyword } = this.state
    if (searchKeyword.trim()) {
      // 搜索俱乐部逻辑
      Taro.navigateTo({
        url: `/pages/clubs/detail?action=search&keyword=${encodeURIComponent(searchKeyword)}`
      })
    }
  }

  render() {
    const { clubs, loading, avatarUrl } = this.state

    return (
      <View className='club-list-page'>
        {/* 顶部用户头像和搜索框 */}
        <View className='page-header'>
          <Image 
            className='avatar-user' 
            src={avatarUrl || '/assets/images/user-unlogin.png'}
            onClick={this.handleUserAvatarClick}
            onError={(e) => {
              console.error('用户头像加载失败:', avatarUrl, e)
              this.setState({ avatarUrl: '/assets/images/user-unlogin.png' })
            }}
          />
          <View className='search-container'>
            <Input 
              className='search-input'
              placeholder='搜索俱乐部'
              value={this.state.searchKeyword}
              onInput={this.handleSearchInput}
              onConfirm={this.handleSearch}
            />
          </View>
        </View>

        {/* 俱乐部列表 */}
        <View className='page-body'>
          {loading ? (
            <View className='loading'>加载中...</View>
          ) : clubs.length === 0 ? (
            <View className='empty'>
              还未加入任何俱乐部。请从上方搜索自己的俱乐部加入，或从队友分享的邀请链接中点击加入。
            </View>
          ) : (
            <View className='clubs-section'>
              <View className='section-title'>已加入的俱乐部</View>
              <View className='club-list'>
                {clubs.map((club, index) => (
                  <View 
                    key={club._id} 
                    className='club-item'
                    onClick={() => this.handleClubClick(club)}
                  >
                    <View className='club-content'>
                      <Image 
                        className='club-avatar' 
                        src={club.logo || '/assets/images/default-club-logo.svg'}
                        mode='aspectFit'
                        onError={(e) => {
                          console.error('俱乐部 Logo 加载失败:', club.logo, e)
                          // 如果加载失败，更新状态使用默认图片
                          const updatedClubs = this.state.clubs.map((c, idx) => 
                            idx === index 
                              ? { ...c, logo: '/assets/images/default-club-logo.svg' }
                              : c
                          )
                          this.setState({ clubs: updatedClubs })
                        }}
                      />
                      {club.vip && (
                        <Image 
                          className='vip-icon' 
                          src='/assets/images/vip.svg'
                          mode='aspectFit'
                        />
                      )}
                      <Text className='club-name'>{club.wholeName}</Text>
                      <Text className='club-shortname'>[ {club.shortName} ]</Text>
                      {club.owner && (
                        <Image 
                          className='owner-icon' 
                          src='/assets/images/owner.svg'
                          mode='aspectFit'
                        />
                      )}
                    </View>
                    <View className='club-divider' />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 创建俱乐部按钮 */}
        <View className='create-button-container'>
          <View className='create-button' onClick={this.handleCreate}>
            <Text className='create-button-text'>创建俱乐部</Text>
          </View>
        </View>
      </View>
    )
  }
}

