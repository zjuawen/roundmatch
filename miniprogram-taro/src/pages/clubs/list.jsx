import { Component } from 'react'
import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { clubService } from '../../services/api'
import { getGlobalData, saveGlobalData } from '../../utils'
import userUnloginImage from '../../assets/images/user-unlogin.png'
import './list.scss'

export default class ClubList extends Component {
  state = {
    clubs: [],
    publicClubs: [], // 公开俱乐部列表
    loading: false,
    openid: null,
    avatarUrl: userUnloginImage,
    userInfo: null,
    searchKeyword: '',
    isShowingPublicClubs: false, // 是否显示公开俱乐部列表
    currentProvince: null, // 当前省份
    hasCheckedClubs: false // 是否已经检查过俱乐部
  }

  componentDidMount() {
    this.initData(true) // 首次加载
  }

  componentDidShow() {
    // 页面显示时也检查登录状态，因为 switchTab 跳转时可能不会重新执行 componentDidMount
    // 但如果是通过 tabBar 进入，不应该自动跳转，应该显示俱乐部列表
    this.initData(false)
  }

  initData = async (isFirstLoad = false) => {
    const openid = getGlobalData('openid')
    const userInfo = getGlobalData('userInfo')
    console.log('ClubList initData, openid:', openid, 'isFirstLoad:', isFirstLoad)
    
    // 允许未登录用户查看页面，但不加载数据
    // 加载用户信息
    if (userInfo) {
      this.setState({
        avatarUrl: userInfo.avatarUrl || userUnloginImage,
        userInfo
      })
    }
    
    // 如果已登录且 openid 已存在且与 state 中的不同，或者 clubs 为空，则重新加载
    if (openid && (openid !== this.state.openid || this.state.clubs.length === 0)) {
      this.setState({ openid })
      // 检查用户是否有俱乐部
      await this.checkAndLoadClubs(openid, isFirstLoad)
    } else if (!openid) {
      // 未登录状态，清空 openid，显示公开俱乐部列表
      this.setState({ openid: null, clubs: [] })
      if (!this.state.hasCheckedClubs || this.state.publicClubs.length === 0) {
        await this.loadPublicClubs()
      }
    }
  }

  // 检查用户是否有俱乐部
  // isFirstLoad: 是否是首次加载，首次加载时如果有俱乐部则自动跳转
  checkAndLoadClubs = async (openid, isFirstLoad = false) => {
    // 如果已经检查过且不是首次加载，直接加载俱乐部列表
    if (this.state.hasCheckedClubs && !isFirstLoad) {
      await this.loadClubs(openid)
      return
    }

    try {
      const data = await clubService.list(openid)
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

      this.setState({ hasCheckedClubs: true })

      if (clubs.length > 0) {
        // 用户有俱乐部
        this.setState({ clubs, isShowingPublicClubs: false })
        
        // 只有在首次加载时才自动跳转到比赛列表
        if (isFirstLoad) {
          // 优先使用缓存的默认俱乐部，如果没有则使用第一个俱乐部
          let selectedClubId = getGlobalData('selectedClubId')
          
          // 检查缓存的俱乐部是否还在用户的俱乐部列表中
          const cachedClubExists = selectedClubId && clubs.some(club => club._id === selectedClubId)
          
          if (!cachedClubExists) {
            // 如果缓存的俱乐部不存在，使用第一个俱乐部作为默认
            selectedClubId = clubs[0]._id
            saveGlobalData('selectedClubId', selectedClubId)
            console.log('使用第一个俱乐部作为默认俱乐部:', selectedClubId)
          } else {
            console.log('使用缓存的默认俱乐部:', selectedClubId)
          }
          
          // 跳转到比赛列表
          Taro.switchTab({
            url: '/pages/matches/list'
          })
        }
      } else {
        // 用户没有俱乐部，跳转到公开俱乐部列表页面
        if (isFirstLoad) {
          Taro.redirectTo({
            url: '/pages/clubs/public-list'
          })
        } else {
          // 如果不是首次加载，在当前页面显示公开俱乐部列表
          this.setState({ clubs: [], isShowingPublicClubs: true })
          await this.loadPublicClubs()
        }
      }
    } catch (error) {
      console.error('Check clubs error:', error)
      // 如果检查失败，也跳转到公开俱乐部列表页面
      if (isFirstLoad) {
        Taro.redirectTo({
          url: '/pages/clubs/public-list'
        })
      } else {
        this.setState({ clubs: [], isShowingPublicClubs: true, hasCheckedClubs: true })
        await this.loadPublicClubs()
      }
    }
  }

  // 加载用户已加入的俱乐部列表（原有方法）
  loadClubs = async (openidParam) => {
    this.setState({ loading: true })
    try {
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
        clubs,
        isShowingPublicClubs: false
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

  // 加载公开俱乐部列表
  loadPublicClubs = async () => {
    this.setState({ loading: true })
    try {
      // 获取用户定位信息
      let province = null
      try {
        const location = await Taro.getLocation({
          type: 'gcj02'
        })
        // 通过逆地理编码获取省份信息
        // 注意：小程序需要先获取定位权限
        // 这里先尝试获取，如果失败则使用用户信息中的省份
        const userInfo = getGlobalData('userInfo')
        if (userInfo && userInfo.province) {
          province = userInfo.province
        }
      } catch (locationError) {
        console.log('获取定位失败，使用用户信息中的省份:', locationError)
        const userInfo = getGlobalData('userInfo')
        if (userInfo && userInfo.province) {
          province = userInfo.province
        }
      }

      this.setState({ currentProvince: province })
      
      console.log('加载公开俱乐部列表，省份:', province)
      const data = await clubService.listPublic(province)
      console.log('公开俱乐部列表数据:', data)
      
      // 处理返回的数据，统一字段名为驼峰命名
      const publicClubs = (data.data || []).map(club => ({
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
        owner: club.owner,
        locked: club.locked
      }))
      
      console.log('处理后的公开俱乐部列表:', publicClubs)
      this.setState({
        publicClubs
      })
    } catch (error) {
      console.error('Load public clubs error:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
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
    // 如果是公开俱乐部，需要先加入
    if (this.state.isShowingPublicClubs) {
      // 跳转到俱乐部详情页加入俱乐部
      Taro.navigateTo({
        url: `/pages/clubs/detail?clubid=${club._id}`
      })
    } else {
      // 保存 clubid 到全局存储，因为 switchTab 不支持 URL 参数
      saveGlobalData('selectedClubId', club._id)
      // 使用 switchTab 跳转到 tabbar 页面
      Taro.switchTab({
        url: '/pages/matches/list'
      })
    }
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
    const { clubs, publicClubs, loading, avatarUrl, isShowingPublicClubs, currentProvince } = this.state
    const displayClubs = isShowingPublicClubs ? publicClubs : clubs

    return (
      <View className='club-list-page'>
        {/* 顶部用户头像和搜索框 */}
        <View className='page-header'>
          <Image 
            className='avatar-user' 
            src={avatarUrl || userUnloginImage}
            onClick={this.handleUserAvatarClick}
            onError={(e) => {
              console.error('用户头像加载失败:', avatarUrl, e)
              this.setState({ avatarUrl: userUnloginImage })
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
          ) : isShowingPublicClubs ? (
            // 显示公开俱乐部列表
            <>
              {currentProvince && (
                <View className='section-title'>
                  公开俱乐部列表 {currentProvince ? `（${currentProvince}）` : ''}
                </View>
              )}
              {publicClubs.length === 0 ? (
                <View className='empty'>
                  {currentProvince 
                    ? `暂无${currentProvince}的公开俱乐部`
                    : '暂无公开俱乐部'}
                </View>
              ) : (
                <View className='clubs-section'>
                  {!currentProvince && (
                    <View className='section-title'>公开俱乐部列表</View>
                  )}
                  <View className='club-list'>
                    {publicClubs.map((club, index) => (
                      <View 
                        key={club._id} 
                        className='club-item'
                        onClick={() => this.handleClubClick(club)}
                      >
                        <View className='club-content'>
                          <View className='club-avatar-wrapper'>
                            <Image 
                              className='club-avatar' 
                              src={club.logo || '/assets/images/default-club-logo.svg'}
                              mode='aspectFit'
                              onError={(e) => {
                                console.error('俱乐部 Logo 加载失败:', club.logo, e)
                                const updatedClubs = this.state.publicClubs.map((c, idx) => 
                                  idx === index 
                                    ? { ...c, logo: '/assets/images/default-club-logo.svg' }
                                    : c
                                )
                                this.setState({ publicClubs: updatedClubs })
                              }}
                            />
                            {(club.vip === 1 || club.vip === true || club.vip === '1') && (
                              <Image 
                                className='vip-icon' 
                                src='/assets/images/vip.svg'
                                mode='aspectFit'
                              />
                            )}
                          </View>
                          <Text className='club-name'>{club.wholeName}</Text>
                          <Text className='club-shortname'>[ {club.shortName} ]</Text>
                          {club.locked && (
                            <View className='locked-badge'>
                              <Text className='locked-text'>🔒</Text>
                            </View>
                          )}
                        </View>
                        <View className='club-divider' />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : !this.state.openid ? (
            <View className='empty'>
              请先登录以查看已加入的俱乐部。点击右上角头像进行登录。
            </View>
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
                      <View className='club-avatar-wrapper'>
                        <Image 
                          className='club-avatar' 
                          src={club.logo || '/assets/images/default-club-logo.svg'}
                          mode='aspectFit'
                          onError={(e) => {
                            console.error('俱乐部 Logo 加载失败:', club.logo, e)
                            const updatedClubs = this.state.clubs.map((c, idx) => 
                              idx === index 
                                ? { ...c, logo: '/assets/images/default-club-logo.svg' }
                                : c
                            )
                            this.setState({ clubs: updatedClubs })
                          }}
                        />
                        {(club.vip === 1 || club.vip === true || club.vip === '1') && (
                          <Image 
                            className='vip-icon' 
                            src='/assets/images/vip.svg'
                            mode='aspectFit'
                          />
                        )}
                      </View>
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

