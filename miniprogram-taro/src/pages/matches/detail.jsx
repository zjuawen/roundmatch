import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { matchService } from '../../services/api'
import { getGlobalData } from '../../utils'
import './detail.scss'

export default class MatchDetail extends Component {
  state = {
    match: null,
    games: [],
    loading: true,
    expandedGames: {} // 记录每个 game 的展开状态
  }

  componentDidMount() {
    const openid = getGlobalData('openid')
    if (!openid) {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
      return
    }

    this.loadMatch()
  }

  loadMatch = async () => {
    try {
      const router = Taro.getCurrentInstance().router
      const { clubid, id, matchid } = router?.params || {}
      // 支持 id 和 matchid 两种参数名
      const matchId = id || matchid
      if (!matchId) {
        Taro.showToast({
          title: '参数错误',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
        return
      }

      // 如果没有 clubid，尝试从全局存储获取
      const targetClubid = clubid || getGlobalData('selectedClubId')
      if (!targetClubid) {
        Taro.showToast({
          title: '缺少俱乐部ID',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
        return
      }

      const data = await matchService.read(targetClubid, matchId)
      // matchService.read 返回的是对阵数据数组
      const games = Array.isArray(data.data) ? data.data : []
      
      // 按 order 字段排序（从小到大）
      games.sort((a, b) => {
        const orderA = a.order || 0
        const orderB = b.order || 0
        return orderA - orderB
      })
      
      this.setState({
        games: games,
        loading: false
      })
    } catch (error) {
      console.error('Load match error:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setState({ loading: false })
    }
  }

  handleToggleExpand = (gameId) => {
    this.setState(prevState => ({
      expandedGames: {
        ...prevState.expandedGames,
        [gameId]: !prevState.expandedGames[gameId]
      }
    }))
  }

  render() {
    const { games, loading, expandedGames } = this.state

    if (loading) {
      return (
        <View className='match-detail-page'>
          <View className='loading'>加载中...</View>
        </View>
      )
    }

    if (!games || games.length === 0) {
      return (
        <View className='match-detail-page'>
          <View className='empty'>暂无对阵数据</View>
        </View>
      )
    }

    return (
      <View className='match-detail-page'>
        <View className='match-header'>
          <Text className='match-title'>比赛对阵</Text>
        </View>
        
        <View className='games-list'>
          {games.map((game, index) => {
            const isFinished = game.score1 >= 0 && game.score2 >= 0
            const defaultAvatar = '/assets/images/user-unlogin.png'
            const isExpanded = expandedGames[game._id] !== false // 默认展开
            
            return (
              <View 
                key={game._id} 
                className={`game-item ${isExpanded ? 'game-item-expanded' : 'game-item-collapsed'}`}
                style={{ backgroundColor: isFinished ? '#c1fcb4' : '#fff' }}
              >
                <View className='game-header'>
                  <View className='game-status-icon'>
                    <Text className='game-status-text'>{isFinished ? '✓' : '○'}</Text>
                  </View>
                  <Text className='game-number'>第{index + 1}场</Text>
                  <View className='game-expand-icon' onClick={() => this.handleToggleExpand(game._id)}>
                    <Text className='game-expand-text'>{isExpanded ? '−' : '+'}</Text>
                  </View>
                </View>
                
                <View className={`game-content ${isExpanded ? 'game-content-expanded' : 'game-content-collapsed'}`}>
                  {/* 玩家1 */}
                  <View className='game-player-column'>
                    {isExpanded && game.player1 && (
                      <Image 
                        className='game-player-avatar'
                        src={game.player1.avatarUrl || defaultAvatar}
                        mode='aspectFill'
                        onError={(e) => {
                          e.target.src = defaultAvatar
                        }}
                      />
                    )}
                    <Text className='game-player-name'>
                      {game.player1?.name || '未知'}
                    </Text>
                  </View>
                  
                  {/* 玩家2 */}
                  <View className='game-player-column'>
                    {isExpanded && game.player2 && (
                      <Image 
                        className='game-player-avatar'
                        src={game.player2.avatarUrl || defaultAvatar}
                        mode='aspectFill'
                        onError={(e) => {
                          e.target.src = defaultAvatar
                        }}
                      />
                    )}
                    <Text className='game-player-name'>
                      {game.player2?.name || '未知'}
                    </Text>
                  </View>
                  
                  {/* 比分 */}
                  <View className='game-score-column'>
                    {isFinished ? (
                      <Text className='game-score'>
                        {game.score1}:{game.score2}
                      </Text>
                    ) : (
                      <Text className='game-score-vs'>VS</Text>
                    )}
                  </View>
                  
                  {/* 玩家3 */}
                  <View className='game-player-column'>
                    {isExpanded && game.player3 && (
                      <Image 
                        className='game-player-avatar'
                        src={game.player3.avatarUrl || defaultAvatar}
                        mode='aspectFill'
                        onError={(e) => {
                          e.target.src = defaultAvatar
                        }}
                      />
                    )}
                    <Text className='game-player-name'>
                      {game.player3?.name || '未知'}
                    </Text>
                  </View>
                  
                  {/* 玩家4 */}
                  <View className='game-player-column'>
                    {isExpanded && game.player4 && (
                      <Image 
                        className='game-player-avatar'
                        src={game.player4.avatarUrl || defaultAvatar}
                        mode='aspectFill'
                        onError={(e) => {
                          e.target.src = defaultAvatar
                        }}
                      />
                    )}
                    <Text className='game-player-name'>
                      {game.player4?.name || '未知'}
                    </Text>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      </View>
    )
  }
}
