import { Component } from 'react'
import { View, Text, Image, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { matchService, gameService } from '../../services/api'
import { getGlobalData } from '../../utils'
import { checkAvatarUrl, generateAvatarColor, getAvatarText } from '../../utils/imageUtils'
import './detail.scss'

export default class MatchDetail extends Component {
  state = {
    match: null,
    games: [],
    loading: true,
    clubid: null,
    matchId: null,
    // 比分输入对话框
    scoreDialogShow: false,
    scoreDialogIndex: -1,
    tempScore1: '',
    tempScore2: '',
    savingScore: false
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

      // 保存 clubid 和 matchId 到 state
      this.setState({ clubid: targetClubid, matchId: matchId })

      const data = await matchService.read(targetClubid, matchId)
      // matchService.read 返回的是对阵数据数组
      const games = Array.isArray(data.data) ? data.data : []
      
      // 按 order 字段排序（从小到大）
      games.sort((a, b) => {
        const orderA = a.order || 0
        const orderB = b.order || 0
        return orderA - orderB
      })
      
      // 处理玩家头像 URL 并检查有效性
      for (const game of games) {
        for (let i = 1; i <= 4; i++) {
          const player = game[`player${i}`]
          if (player) {
            // 统一处理 avatarUrl 字段（可能返回的是 avatarurl）
            const avatarUrl = player.avatarUrl || player.avatarurl || ''
            
            if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
              // 检查头像是否有效
              try {
                const isValid = await checkAvatarUrl(avatarUrl)
                player.avatarUrl = isValid ? avatarUrl : ''
                player.avatarValid = isValid
              } catch (error) {
                console.warn(`检查玩家${i}头像失败:`, error)
                player.avatarUrl = avatarUrl
                player.avatarValid = true // 检查失败时默认尝试加载
              }
            } else {
              player.avatarUrl = ''
              player.avatarValid = false
            }
          }
        }
      }
      
      console.log('处理后的 games 数据:', games)
      
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

  calculateProgress = () => {
    const { games } = this.state
    const finishedCount = games.filter(game => game.score1 >= 0 && game.score2 >= 0).length
    const totalCount = games.length
    return { finishedCount, totalCount }
  }

  handleAvatarError = (gameId, playerIndex) => {
    // 更新对应玩家的头像有效性状态
    this.setState(prevState => {
      const updatedGames = prevState.games.map(game => {
        if (game._id === gameId) {
          const player = game[`player${playerIndex}`]
          if (player) {
            return {
              ...game,
              [`player${playerIndex}`]: {
                ...player,
                avatarValid: false
              }
            }
          }
        }
        return game
      })
      return { games: updatedGames }
    })
  }

  // 点击 VS 或比分，打开比分输入对话框
  handleScoreClick = (game, index) => {
    const isFinished = game.score1 >= 0 && game.score2 >= 0
    if (isFinished) {
      // 已完成的比赛，长按可以修改
      return
    }
    
    this.setState({
      scoreDialogShow: true,
      scoreDialogIndex: index,
      tempScore1: game.score1 >= 0 ? String(game.score1) : '',
      tempScore2: game.score2 >= 0 ? String(game.score2) : ''
    })
  }

  // 输入比分1
  handleScore1Input = (e) => {
    this.setState({
      tempScore1: e.detail.value
    })
  }

  // 输入比分2
  handleScore2Input = (e) => {
    this.setState({
      tempScore2: e.detail.value
    })
  }

  // 关闭比分对话框
  handleScoreDialogClose = () => {
    this.setState({
      scoreDialogShow: false,
      scoreDialogIndex: -1,
      tempScore1: '',
      tempScore2: ''
    })
  }

  // 保存比分
  handleSaveScore = async () => {
    const { games, scoreDialogIndex, tempScore1, tempScore2, clubid } = this.state
    
    if (scoreDialogIndex < 0 || scoreDialogIndex >= games.length) {
      return
    }

    const score1 = parseInt(tempScore1)
    const score2 = parseInt(tempScore2)

    // 验证比分
    if (isNaN(score1) || isNaN(score2) || score1 < 0 || score2 < 0) {
      Taro.showToast({
        title: '请输入有效的比分',
        icon: 'none'
      })
      return
    }

    const game = games[scoreDialogIndex]
    const oldScore1 = game.score1
    const oldScore2 = game.score2

    // 如果比分没有变化，直接关闭
    if (oldScore1 === score1 && oldScore2 === score2) {
      this.handleScoreDialogClose()
      return
    }

    this.setState({ savingScore: true })

    try {
      const openid = getGlobalData('openid')
      
      // 准备游戏数据
      const gamedata = {
        _id: game._id,
        matchid: game.matchId || game.matchid,
        score1: score1,
        score2: score2
      }

      // 调用 API 保存比分
      await gameService.save(clubid, gamedata, openid)

      // 更新本地状态
      const updatedGames = games.map((g, idx) => {
        if (idx === scoreDialogIndex) {
          return {
            ...g,
            score1: score1,
            score2: score2
          }
        }
        return g
      })

      this.setState({
        games: updatedGames,
        savingScore: false
      })

      Taro.showToast({
        title: '保存成功',
        icon: 'success'
      })

      // 关闭对话框
      this.handleScoreDialogClose()

      // 重新加载比赛数据以更新进度（不重新检查头像，只更新比分）
      const { clubid, matchId } = this.state
      if (clubid && matchId) {
        const data = await matchService.read(clubid, matchId)
        const games = Array.isArray(data.data) ? data.data : []
        
        // 按 order 字段排序
        games.sort((a, b) => {
          const orderA = a.order || 0
          const orderB = b.order || 0
          return orderA - orderB
        })
        
        // 保留已有的头像有效性状态，只更新比分
        const updatedGames = games.map(newGame => {
          const oldGame = this.state.games.find(g => g._id === newGame._id)
          if (oldGame) {
            // 保留头像有效性状态
            for (let i = 1; i <= 4; i++) {
              const oldPlayer = oldGame[`player${i}`]
              const newPlayer = newGame[`player${i}`]
              if (oldPlayer && newPlayer) {
                newPlayer.avatarValid = oldPlayer.avatarValid
                newPlayer.avatarUrl = oldPlayer.avatarUrl || newPlayer.avatarUrl || newPlayer.avatarurl || ''
              }
            }
          }
          return newGame
        })
        
        this.setState({ games: updatedGames })
      }
    } catch (error) {
      console.error('保存比分失败:', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'none'
      })
      this.setState({ savingScore: false })
    }
  }


  render() {
    const { games, loading } = this.state

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

    const { finishedCount, totalCount } = this.calculateProgress()
    const progressPercent = totalCount > 0 ? (finishedCount / totalCount * 100) : 0

    return (
      <View className='match-detail-page'>
        {/* 比赛标题和进度 */}
        <View className='match-info-header'>
          <Text className='match-title'>比赛对阵</Text>
          <View className='match-progress-container'>
            <Text className='match-progress-label'>比赛进度</Text>
            <View className='match-progress-bar-wrapper'>
              <View 
                className='match-progress-bar'
                style={{ width: `${progressPercent}%` }}
              />
            </View>
            <Text className='match-progress-text'>{finishedCount}/{totalCount}场</Text>
          </View>
        </View>
        
        <View className='games-list'>
          {games.map((game, index) => {
            const isFinished = game.score1 >= 0 && game.score2 >= 0
            
            return (
              <View 
                key={game._id} 
                className='game-card'
              >
                {/* 进行中标签 - 右上角 */}
                {/* {!isFinished && (
                  <View className='game-status-badge-corner'>
                    <Text className='game-status-text-corner'>进行中</Text>
                  </View>
                )} */}
                
                {/* 左侧序号和状态 */}
                <View className='game-number-badge'>
                  <Text className='game-number-text'>{index + 1}</Text>
                  {isFinished && (
                    <View className='game-status-check'>
                      <Text className='game-status-check-text'>✓</Text>
                    </View>
                  )}
                </View>
                
                {/* 主要内容区域 */}
                <View className='game-card-content'>
                  {/* 左侧队伍 */}
                  <View className='game-team'>
                    <View className='game-player-row'>
                      {game.player1?.avatarValid && game.player1?.avatarUrl ? (
                        <Image 
                          className='game-player-avatar'
                          src={game.player1.avatarUrl}
                          mode='aspectFill'
                          onError={() => {
                            console.error('玩家1头像加载失败:', game.player1?.avatarUrl)
                            // 标记为无效，更新状态
                            this.handleAvatarError(game._id, 1)
                          }}
                        />
                      ) : (
                        <View 
                          className='game-player-avatar-text'
                          style={{ backgroundColor: generateAvatarColor(game.player1?.name || '') }}
                        >
                          <Text className='game-player-avatar-text-content'>
                            {getAvatarText(game.player1?.name || '')}
                          </Text>
                        </View>
                      )}
                      <Text className='game-player-name'>
                        {game.player1?.name || '未知'}
                      </Text>
                    </View>
                    <View className='game-team-divider' />
                    <View className='game-player-row'>
                      {game.player2?.avatarValid && game.player2?.avatarUrl ? (
                        <Image 
                          className='game-player-avatar'
                          src={game.player2.avatarUrl}
                          mode='aspectFill'
                          onError={() => {
                            console.error('玩家2头像加载失败:', game.player2?.avatarUrl)
                            this.handleAvatarError(game._id, 2)
                          }}
                        />
                      ) : (
                        <View 
                          className='game-player-avatar-text'
                          style={{ backgroundColor: generateAvatarColor(game.player2?.name || '') }}
                        >
                          <Text className='game-player-avatar-text-content'>
                            {getAvatarText(game.player2?.name || '')}
                          </Text>
                        </View>
                      )}
                      <Text className='game-player-name'>
                        {game.player2?.name || '未知'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* 中间比分 */}
                  <View className='game-score-section'>
                    {isFinished ? (
                      <View className='game-score-display'>
                        <Text className='game-score-winner'>{game.score1}</Text>
                        <Text className='game-score-separator'>:</Text>
                        <Text className='game-score-loser'>{game.score2}</Text>
                      </View>
                    ) : (
                      <View 
                        className='game-score-vs-clickable'
                        onClick={() => this.handleScoreClick(game, index)}
                      >
                        <Text className='game-score-vs'>VS</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* 右侧队伍 */}
                  <View className='game-team'>
                    <View className='game-player-row'>
                      {game.player3?.avatarValid && game.player3?.avatarUrl ? (
                        <Image 
                          className='game-player-avatar'
                          src={game.player3.avatarUrl}
                          mode='aspectFill'
                          onError={() => {
                            console.error('玩家3头像加载失败:', game.player3?.avatarUrl)
                            this.handleAvatarError(game._id, 3)
                          }}
                        />
                      ) : (
                        <View 
                          className='game-player-avatar-text'
                          style={{ backgroundColor: generateAvatarColor(game.player3?.name || '') }}
                        >
                          <Text className='game-player-avatar-text-content'>
                            {getAvatarText(game.player3?.name || '')}
                          </Text>
                        </View>
                      )}
                      <Text className='game-player-name'>
                        {game.player3?.name || '未知'}
                      </Text>
                    </View>
                    <View className='game-team-divider' />
                    <View className='game-player-row'>
                      {game.player4?.avatarValid && game.player4?.avatarUrl ? (
                        <Image 
                          className='game-player-avatar'
                          src={game.player4.avatarUrl}
                          mode='aspectFill'
                          onError={() => {
                            console.error('玩家4头像加载失败:', game.player4?.avatarUrl)
                            this.handleAvatarError(game._id, 4)
                          }}
                        />
                      ) : (
                        <View 
                          className='game-player-avatar-text'
                          style={{ backgroundColor: generateAvatarColor(game.player4?.name || '') }}
                        >
                          <Text className='game-player-avatar-text-content'>
                            {getAvatarText(game.player4?.name || '')}
                          </Text>
                        </View>
                      )}
                      <Text className='game-player-name'>
                        {game.player4?.name || '未知'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>

        {/* 比分输入对话框 */}
        {this.state.scoreDialogShow && (
          <View className='score-dialog-mask' onClick={this.handleScoreDialogClose}>
            <View className='score-dialog' onClick={(e) => e.stopPropagation()}>
              <View className='score-dialog-header'>
                <Text className='score-dialog-title'>输入比分</Text>
              </View>
              
              <View className='score-dialog-content'>
                <View className='score-input-row'>
                  <Input
                    className='score-input'
                    type='number'
                    placeholder='0'
                    value={this.state.tempScore1}
                    onInput={this.handleScore1Input}
                    focus
                  />
                  <Text className='score-separator'>:</Text>
                  <Input
                    className='score-input'
                    type='number'
                    placeholder='0'
                    value={this.state.tempScore2}
                    onInput={this.handleScore2Input}
                  />
                </View>
                
                {this.state.scoreDialogIndex >= 0 && this.state.games[this.state.scoreDialogIndex] && (
                  <View className='score-dialog-players'>
                    <View className='score-dialog-team'>
                      <Text className='score-dialog-player-name'>
                        {this.state.games[this.state.scoreDialogIndex].player1?.name || '未知'}
                      </Text>
                      <Text className='score-dialog-player-name'>
                        {this.state.games[this.state.scoreDialogIndex].player2?.name || '未知'}
                      </Text>
                    </View>
                    <Text className='score-dialog-vs'>VS</Text>
                    <View className='score-dialog-team'>
                      <Text className='score-dialog-player-name'>
                        {this.state.games[this.state.scoreDialogIndex].player3?.name || '未知'}
                      </Text>
                      <Text className='score-dialog-player-name'>
                        {this.state.games[this.state.scoreDialogIndex].player4?.name || '未知'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View className='score-dialog-footer'>
                <Button 
                  className='score-dialog-btn score-dialog-btn-cancel'
                  onClick={this.handleScoreDialogClose}
                >
                  取消
                </Button>
                <Button 
                  className='score-dialog-btn score-dialog-btn-confirm'
                  onClick={this.handleSaveScore}
                  loading={this.state.savingScore}
                >
                  确定
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
