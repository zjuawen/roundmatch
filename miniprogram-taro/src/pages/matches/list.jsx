import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { matchService, clubService, userService } from '../../services/api'
import { getGlobalData, formatDate } from '../../utils'
import userUnloginImage from '../../assets/images/user-unlogin.png'
import editIcon from '../../assets/images/edit.png'
import './list.scss'

// 立即执行的日志，确认文件被加载
console.log('🔵 [比赛列表页面] 文件已加载，准备初始化组件')

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
    contentTopMarginRpx: 88, // 内容区域顶部间距（rpx）
    isCreator: false // 是否是俱乐部创建者
  }

  componentDidMount() {
    console.log('=== 比赛列表页面 componentDidMount ===')
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
    
    console.log('准备调用 initMatchList 和 loadUserAvatar')
    this.initMatchList()
    this.loadUserAvatar()
  }

  // 初始化比赛列表
  initMatchList = async () => {
    console.log('=== initMatchList 被调用 ===')
    const openid = getGlobalData('openid')
    console.log('从全局数据获取的 openid:', openid)
    
    if (!openid) {
      console.log('openid 为空，设置状态并返回')
      this.setState({ openid: null, clubid: null })
      return
    }

    let clubid = getGlobalData('selectedClubId')
    console.log('从全局数据获取的 clubid:', clubid)
    
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
      console.log('initMatchList: 准备加载俱乐部信息和比赛列表')
      console.log('clubid:', clubid, 'openid:', openid)
      this.loadClubInfo(clubid)
      this.loadMatches(clubid, openid)
    } else {
      console.log('initMatchList: clubid 为空，跳过加载')
    }
  }

  componentDidShow() {
    console.log('=== 比赛列表页面 componentDidShow ===')
    // 页面显示时也检查是否有新的 clubid（因为 switchTab 跳转时可能不会重新执行 componentDidMount）
    const openid = getGlobalData('openid')
    let clubid = getGlobalData('selectedClubId')
    console.log('componentDidShow - openid:', openid, 'clubid:', clubid)
    console.log('componentDidShow - state.openid:', this.state.openid, 'state.clubid:', this.state.clubid)
    
    // 加载用户头像
    this.loadUserAvatar()
    
    // 如果没有选中的俱乐部且有 openid，尝试自动获取第一个俱乐部
    if (!clubid && openid && openid !== this.state.openid) {
      console.log('componentDidShow: 没有 clubid，尝试自动获取第一个俱乐部')
      // 异步获取第一个俱乐部
      this.autoSelectDefaultClub(openid).then(selectedClubId => {
        if (selectedClubId) {
          console.log('componentDidShow: 自动选择了俱乐部:', selectedClubId)
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
      console.log('componentDidShow: clubid 或 openid 有变化，重新加载数据')
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

  // 点击创建按钮
  handleCreateClick = () => {
    Taro.navigateTo({
      url: '/pages/matches/create'
    })
  }

  // 点击修改俱乐部信息按钮
  handleEditClubClick = () => {
    Taro.navigateTo({
      url: `/pages/clubs/edit?clubid=${this.state.clubid}`
    })
  }

  // 加载俱乐部信息
  loadClubInfo = async (clubid) => {
    console.log('=== loadClubInfo 被调用 ===')
    console.log('clubid:', clubid)
    
    if (!clubid) {
      console.log('clubid 为空，返回')
      this.setState({ clubInfo: null, description: '', isCreator: false })
      return
    }

    try {
      console.log('开始调用 clubService.info...')
      const data = await clubService.info(clubid)
      console.log('clubService.info 返回:', data)
      
      if (data.data) {
        const clubInfo = {
          wholeName: data.data.wholename || data.data.wholeName,
          shortName: data.data.shortname || data.data.shortName,
          creator: data.data.creator
        }
        console.log('设置 clubInfo:', clubInfo)
        this.setState({ clubInfo })
        
        // 加载俱乐部简介（支持 description 和 intro 字段）
        const description = data.data.description || data.data.intro || ''
        this.setState({ description })
        
        // 检查是否是管理员（包括创建者和admins表中的管理员）
        const openid = getGlobalData('openid')
        console.log('获取到的 openid:', openid)
        
        if (openid) {
          try {
            console.log('开始调用 clubService.checkAdmin...')
            console.log('参数 - clubid:', clubid, 'openid:', openid)
            const adminCheckData = await clubService.checkAdmin(clubid, openid)
            console.log('=== 比赛列表页面 - 判断是否是俱乐部管理员 ===')
            console.log('当前用户 openid:', openid)
            console.log('俱乐部ID clubid:', clubid)
            console.log('俱乐部信息:', clubInfo)
            console.log('俱乐部创建者 creator:', clubInfo.creator)
            console.log('管理员检查结果:', adminCheckData)
            console.log('管理员检查结果 data:', adminCheckData.data)
            const isAdmin = adminCheckData.data?.isAdmin === true
            console.log('最终判断结果 isAdmin:', isAdmin)
            console.log('判断原因:', adminCheckData.data?.reason)
            console.log('==========================================')
            this.setState({ isCreator: isAdmin })
          } catch (error) {
            console.error('检查管理员权限失败:', error)
            console.error('错误详情:', error.message)
            console.error('错误堆栈:', error.stack)
            // 如果检查失败，回退到只检查 creator
            const isCreator = openid && clubInfo.creator === openid
            console.log('回退到 creator 检查，结果:', isCreator)
            this.setState({ isCreator })
          }
        } else {
          console.log('openid 为空，设置 isCreator 为 false')
          this.setState({ isCreator: false })
        }
      } else {
        console.log('data.data 为空')
      }
    } catch (error) {
      console.error('Load club info error:', error)
      console.error('错误详情:', error.message)
      this.setState({ description: '', isCreator: false })
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
    const { matches, loading, openid, description, clubid, avatarUrl, statusBarHeight, navBarContentHeightRpx, contentTopMarginRpx, clubInfo, isCreator } = this.state

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
            <View className='navbar-right'>
              {/* 创建按钮已移至右下角浮动按钮 */}
            </View>
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
          <>
            <View className='description-section'>
              <View className='description-header'>
                <View className='description-icon'>📝</View>
                <Text className='description-title'>俱乐部简介</Text>
                {isCreator && (
                  <View className='edit-club-icon-button' onClick={this.handleEditClubClick}>
                    <Image className='edit-club-icon' src={editIcon} mode='aspectFit' />
                  </View>
                )}
              </View>
              <Text className='description-text'>{description || '暂无简介'}</Text>
            </View>
            
            {isCreator && (
              <View className='create-match-section'>
                <View className='create-match-button-full' onClick={this.handleCreateClick}>
                  <Text className='create-match-button-text'>+ 创建比赛</Text>
                </View>
              </View>
            )}
          </>
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
