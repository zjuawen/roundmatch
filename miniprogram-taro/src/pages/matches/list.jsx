import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { matchService, clubService, userService } from '../../services/api'
import { getGlobalData, formatDate } from '../../utils'
import userUnloginImage from '../../assets/images/user-unlogin.png'
import './list.scss'

export default class MatchList extends Component {
  state = {
    matches: [],
    loading: false,
    openid: null,
    clubid: null,
    clubInfo: null, // 俱乐部信息
    description: '', // 俱乐部简介
    avatarUrl: userUnloginImage, // 用户头像
    statusBarHeight: 0, // 状态栏高度（px）
    navBarContentHeightRpx: 88, // 导航栏内容高度（rpx）
    navBarTotalHeightPx: 44, // 导航栏总高度（px）
    contentTopMarginRpx: 88 // 内容区域顶部间距（rpx）
  }

  componentDidMount() {
    // 获取系统信息，用于自定义导航栏
    const systemInfo = Taro.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const screenWidth = systemInfo.screenWidth || 375
    
    // 导航栏内容高度：88rpx（增加高度）
    const navBarContentHeightRpx = 88
    const navBarContentHeightPx = (navBarContentHeightRpx * screenWidth) / 750
    
    // 导航栏总高度（px）= 状态栏高度(px) + 导航栏内容高度(px)
    const navBarTotalHeightPx = statusBarHeight + navBarContentHeightPx
    
    // 导航栏总高度（rpx），用于内容区域的 marginTop
    const navBarTotalHeightRpx = (navBarTotalHeightPx * 750) / screenWidth
    
    this.setState({ 
      statusBarHeight, 
      navBarContentHeightRpx: navBarContentHeightRpx, // 导航栏内容高度（rpx）
      navBarTotalHeightPx: navBarTotalHeightPx, // 导航栏总高度（px）
      contentTopMarginRpx: navBarTotalHeightRpx // 内容区域顶部间距（rpx）
    })
    
    this.initMatchList()
    this.loadUserAvatar()
  }

  // 初始化比赛列表
  initMatchList = async () => {
    const openid = getGlobalData('openid')
    
    if (!openid) {
      this.setState({ openid: null, clubid: null })
      return
    }

    let clubid = getGlobalData('selectedClubId')
    
    // 如果没有选中的俱乐部，自动获取第一个俱乐部并设置为默认
    if (!clubid) {
      try {
        const { clubService } = await import('../../services/api')
        const data = await clubService.list(openid)
        const clubs = data.data?.private || []
        
        if (clubs.length > 0) {
          // 使用第一个俱乐部作为默认俱乐部
          clubid = clubs[0]._id
          const { saveGlobalData } = await import('../../utils')
          saveGlobalData('selectedClubId', clubid)
          console.log('自动选择第一个俱乐部作为默认:', clubid)
        }
      } catch (error) {
        console.error('自动获取俱乐部失败:', error)
      }
    }
    
    this.setState({ openid, clubid })
    
    // 加载数据
    if (clubid) {
      this.loadClubInfo(clubid)
      this.loadMatches(clubid, openid)
    }
  }

  componentDidShow() {
    // 页面显示时也检查是否有新的 clubid（因为 switchTab 跳转时可能不会重新执行 componentDidMount）
    const openid = getGlobalData('openid')
    let clubid = getGlobalData('selectedClubId')
    
    // 加载用户头像
    this.loadUserAvatar()
    
    // 如果没有选中的俱乐部且有 openid，尝试自动获取第一个俱乐部
    if (!clubid && openid && openid !== this.state.openid) {
      // 异步获取第一个俱乐部
      this.autoSelectDefaultClub(openid).then(selectedClubId => {
        if (selectedClubId) {
          clubid = selectedClubId
          this.setState({ clubid, openid })
          this.loadClubInfo(clubid)
          this.loadMatches(clubid, openid)
        }
      })
      return
    }
    
    // 如果 clubid 或 openid 有变化，重新加载数据
    if (clubid !== this.state.clubid || openid !== this.state.openid) {
      this.setState({ clubid, openid })
      // 只有登录后才加载数据
      if (openid && clubid) {
        this.loadClubInfo(clubid)
        this.loadMatches(clubid, openid)
      } else if (!openid) {
        // 未登录时清空列表
        this.setState({ matches: [], clubInfo: null, description: '' })
      }
    }
  }

  // 自动选择默认俱乐部
  autoSelectDefaultClub = async (openid) => {
    try {
      const { clubService } = await import('../../services/api')
      const data = await clubService.list(openid)
      const clubs = data.data?.private || []
      
      if (clubs.length > 0) {
        const clubid = clubs[0]._id
        const { saveGlobalData } = await import('../../utils')
        saveGlobalData('selectedClubId', clubid)
        console.log('自动选择第一个俱乐部作为默认:', clubid)
        return clubid
      }
    } catch (error) {
      console.error('自动获取俱乐部失败:', error)
    }
    return null
  }

  // 加载用户头像
  loadUserAvatar = async () => {
    const openid = getGlobalData('openid')
    const userInfo = getGlobalData('userInfo')
    
    if (userInfo) {
      const avatarUrl = userInfo.avatarUrl || userInfo.avatarurl || userUnloginImage
      this.setState({ avatarUrl })
    }
    
    // 如果有 openid，尝试从服务器获取最新的用户信息
    if (openid) {
      try {
        const data = await userService.detail(openid)
        if (data.data && data.data.userInfo) {
          const serverUserInfo = data.data.userInfo
          const avatarUrl = serverUserInfo.avatarUrl || serverUserInfo.avatarurl || userUnloginImage
          this.setState({ avatarUrl })
        }
      } catch (error) {
        console.error('Load user avatar error:', error)
      }
    } else {
      // 未登录时使用默认头像
      this.setState({ avatarUrl: userUnloginImage })
    }
  }

  // 点击头像跳转到个人中心
  handleAvatarClick = () => {
    Taro.switchTab({
      url: '/pages/profile/index'
    })
  }

  // 加载俱乐部信息
  loadClubInfo = async (clubid) => {
    if (!clubid) {
      this.setState({ clubInfo: null, description: '' })
      return
    }

    try {
      const data = await clubService.info(clubid)
      if (data.data) {
        const clubInfo = {
          wholeName: data.data.wholename || data.data.wholeName,
          shortName: data.data.shortname || data.data.shortName
        }
        this.setState({ clubInfo })
        
        // 加载俱乐部简介（支持 description 和 intro 字段）
        const description = data.data.description || data.data.intro || ''
        this.setState({ description })
      }
    } catch (error) {
      console.error('Load club info error:', error)
      this.setState({ description: '' })
    }
  }


  loadMatches = async (clubid, openid) => {
    this.setState({ loading: true })
    try {
      // 优先使用传入的参数，如果没有则从 state 获取
      let targetOpenid = openid !== undefined ? openid : (this.state.openid || getGlobalData('openid'))
      const targetClubid = clubid !== undefined ? clubid : this.state.clubid
      
      // 如果没有 openid，尝试静默登录
      if (!targetOpenid) {
        console.log('openid 为空，尝试静默登录...')
        const { silentLogin } = await import('../../utils')
        targetOpenid = await silentLogin()
        
        if (targetOpenid) {
          this.setState({ openid: targetOpenid })
        } else {
          // 静默登录失败，跳转到登录页面（需要用户授权）
          Taro.redirectTo({
            url: '/pages/login/index?returnUrl=' + encodeURIComponent('/pages/matches/list')
          })
          return
        }
      }
      
      const data = await matchService.list(targetOpenid, targetClubid || null, 1, 20)
      // API 返回的 data.data 直接是数组，不是 data.data.list
      this.setState({
        matches: Array.isArray(data.data) ? data.data : []
      })
    } catch (error) {
      console.error('Load matches error:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  handleMatchClick = (match) => {
    const clubid = this.state.clubid || getGlobalData('selectedClubId')
    Taro.navigateTo({
      url: `/pages/matches/detail?clubid=${clubid}&matchid=${match._id}`
    })
  }

  formatMatchName = (match) => {
    if (match.name) {
      return match.name
    }
    if (match.createdate) {
      return formatDate(match.createdate)
    }
    return '未命名比赛'
  }

  render() {
    const { matches, loading, openid, description, clubid, avatarUrl, statusBarHeight, navBarContentHeightRpx, contentTopMarginRpx, clubInfo } = this.state

    return (
      <View className='match-list-page'>
        {/* 自定义导航栏 */}
        <View 
          className='custom-navbar'
          style={{
            paddingTop: `${statusBarHeight}px`
          }}
        >
          <View className='navbar-content'>
            <View className='navbar-left' onClick={this.handleAvatarClick}>
              <Image 
                className='navbar-avatar' 
                src={avatarUrl}
                mode='aspectFill'
              />
            </View>
            <View className='navbar-center'>
              <Text className='navbar-title'>{clubInfo?.wholeName || '比赛列表'}</Text>
            </View>
            <View className='navbar-right'></View>
          </View>
        </View>
        
        {/* 内容区域，添加顶部间距以避免被导航栏遮挡 */}
        <View 
          className='match-list-content'
          style={{ 
            marginTop: `${contentTopMarginRpx}rpx` // 使用精确计算的间距
          }}
        >
        {clubid && (
          <View className='description-section'>
            <View className='description-header'>
              <View className='description-icon'>📝</View>
              <Text className='description-title'>俱乐部简介</Text>
            </View>
            <Text className='description-text'>{description || '暂无简介'}</Text>
          </View>
        )}
        
        {!openid ? (
          <View className='empty'>请先登录以查看比赛列表。点击右上角头像进行登录。</View>
        ) : loading ? (
          <View className='loading'>加载中...</View>
        ) : (
          <View className='match-list'>
            {matches.length === 0 ? (
              <View className='empty'>暂无比赛</View>
            ) : (
              matches.map(match => {
                const isFinished = match.finish >= match.total
                const matchName = this.formatMatchName(match)
                const progressPercent = match.total > 0 ? (match.finish / match.total * 100).toFixed(0) : 0
                
                return (
                  <View 
                    key={match._id} 
                    className={`match-item ${isFinished ? 'match-item-finished' : 'match-item-unfinished'}`}
                    onClick={() => this.handleMatchClick(match)}
                  >
                    <View className='match-header'>
                      <Text className='match-name'>{matchName}</Text>
                    </View>
                    
                    {!isFinished && match.total > 0 && (
                      <View className='match-progress-container'>
                        <View 
                          className='match-progress-bar'
                          style={{ width: `${progressPercent}%` }}
                        />
                      </View>
                    )}
                    
                    <View className='match-info-container'>
                      <View className='match-info-item'>
                        <Text className='match-info-label'>参赛人数</Text>
                        <Text className='match-info-value'>{match.playercount || match.playerCount || 0}人</Text>
                      </View>
                      <View className='match-info-divider' />
                      <View className='match-info-item'>
                        <Text className='match-info-label'>完成场数</Text>
                        <Text className={`match-info-value ${!isFinished ? 'match-info-value-progress' : ''}`}>
                          {match.finish || 0}场
                        </Text>
                      </View>
                      <View className='match-info-divider' />
                      <View className='match-info-item'>
                        <Text className='match-info-label'>总场数</Text>
                        <Text className='match-info-value'>{match.total || 0}场</Text>
                      </View>
                    </View>
                    
                    {isFinished && (
                      <View className='match-finished-badge'>
                        <Text className='match-finished-text'>已完成</Text>
                      </View>
                    )}
                  </View>
                )
              })
            )}
          </View>
        )}
        </View>
      </View>
    )
  }
}
