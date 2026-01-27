import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { matchService } from '../../services/api'
import { getGlobalData, formatDate } from '../../utils'
import './list.scss'

export default class MatchList extends Component {
  state = {
    matches: [],
    loading: false,
    openid: null,
    clubid: null
  }

  componentDidMount() {
    const openid = getGlobalData('openid')
    if (!openid) {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
      return
    }
    
    // 从全局存储读取 clubid（如果是从俱乐部列表跳转过来的）
    const clubid = getGlobalData('selectedClubId')
    
    this.setState({ openid, clubid })
    this.loadMatches(clubid, openid)
  }

  componentDidShow() {
    // 页面显示时也检查是否有新的 clubid（因为 switchTab 跳转时可能不会重新执行 componentDidMount）
    const openid = getGlobalData('openid')
    const clubid = getGlobalData('selectedClubId')
    
    // 如果 openid 不存在，重定向到登录页
    if (!openid) {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
      return
    }
    
    // 如果 clubid 或 openid 有变化，重新加载数据
    if (clubid !== this.state.clubid || openid !== this.state.openid) {
      this.setState({ clubid, openid })
      this.loadMatches(clubid, openid)
    }
  }

  loadMatches = async (clubid, openid) => {
    this.setState({ loading: true })
    try {
      // 优先使用传入的参数，如果没有则从 state 获取
      const targetOpenid = openid !== undefined ? openid : (this.state.openid || getGlobalData('openid'))
      const targetClubid = clubid !== undefined ? clubid : this.state.clubid
      
      if (!targetOpenid) {
        console.error('openid 为空，无法加载比赛列表')
        Taro.showToast({
          title: '登录信息失效，请重新登录',
          icon: 'none'
        })
        Taro.redirectTo({
          url: '/pages/login/index'
        })
        return
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
    const { matches, loading } = this.state

    return (
      <View className='match-list-page'>
        <View className='header'>
          <Text className='title'>比赛列表</Text>
        </View>
        
        {loading ? (
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
    )
  }
}
