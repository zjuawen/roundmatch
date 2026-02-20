import { Component } from 'react'
import { View, Text, Input, Button, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { matchService, clubService, userService } from '../../services/api'
import { getGlobalData, formatDate } from '../../utils'
import './create.scss'

export default class MatchCreate extends Component {
  state = {
    // 基础信息
    clubid: null,
    openid: null,
    isCreator: false,
    
    // 创建模式：'manual' 手动创建, 'copy' 从历史比赛复制
    createMode: 'manual',
    
    // 手动创建表单
    name: '',
    type: 'none', // 'none' | 'fixpair' | 'group'
    startDate: '', // YYYY-MM-DD格式
    remark: '',
    
    // 选手相关
    players: [], // 所有成员列表
    selectedPlayers: [], // 无固定类型：已选选手 [{_id, name, avatarUrl}]
    selectedPlayerPairs: [], // 固定搭档/分组类型：已选配对 [{player1: {...}, player2: {...}}]
    activeGroupSlot: null, // {pairIndex: 0, slot: 1} 当前激活的槽位
    playerSearchKeyword: '',
    playersLoading: false,
    
    // 从历史比赛复制
    historyMatches: [], // 历史比赛列表
    historyMatchesLoading: false,
    selectedHistoryMatch: null, // 选中的历史比赛
    
    // UI状态
    loading: false,
    showHistoryList: false // 是否显示历史比赛列表
  }

  componentDidMount() {
    this.initPage()
  }

  // 初始化页面
  initPage = async () => {
    const openid = getGlobalData('openid')
    const clubid = getGlobalData('selectedClubId')
    
    if (!openid) {
      Taro.redirectTo({
        url: '/pages/login/index?returnUrl=' + encodeURIComponent('/pages/matches/create')
      })
      return
    }
    
    if (!clubid) {
      Taro.showToast({
        title: '请先选择俱乐部',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
      return
    }
    
    this.setState({ openid, clubid })
    
    // 检查权限
    await this.checkPermission(clubid, openid)
    
    // 加载成员列表
    await this.loadPlayers(clubid)
    
    // 设置默认开始日期为今天
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    this.setState({ startDate: `${year}-${month}-${day}` })
  }

  // 检查权限
  checkPermission = async (clubid, openid) => {
    try {
      // 检查是否是管理员（包括创建者和admins表中的管理员）
      const adminCheckData = await clubService.checkAdmin(clubid, openid)
      
      console.log('=== 创建比赛页面 - 判断是否是俱乐部管理员 ===')
      console.log('当前用户 openid:', openid)
      console.log('俱乐部ID clubid:', clubid)
      console.log('管理员检查结果:', adminCheckData.data)
      const isAdmin = adminCheckData.data?.isAdmin === true
      console.log('最终判断结果 isAdmin:', isAdmin)
      console.log('判断原因:', adminCheckData.data?.reason)
      console.log('==========================================')
      
      if (isAdmin) {
        this.setState({ isCreator: true })
      } else {
        console.warn('权限检查失败：用户不是俱乐部管理员')
        Taro.showToast({
          title: '只有俱乐部管理员可以创建比赛',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('Check permission error:', error)
      Taro.showToast({
        title: '权限检查失败',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  }

  // 加载成员列表
  loadPlayers = async (clubid) => {
    this.setState({ playersLoading: true })
    try {
      const data = await userService.listPlayers(clubid, 1, 100)
      const players = Array.isArray(data.data) ? data.data : []
      this.setState({ players })
    } catch (error) {
      console.error('Load players error:', error)
      Taro.showToast({
        title: '加载成员列表失败',
        icon: 'none'
      })
    } finally {
      this.setState({ playersLoading: false })
    }
  }

  // 切换创建模式
  handleModeChange = (mode) => {
    this.setState({ createMode: mode })
    
    if (mode === 'copy') {
      // 切换到复制模式，加载历史比赛列表
      this.loadHistoryMatches()
    } else {
      // 切换到手动创建模式，清空历史比赛选择
      this.setState({ selectedHistoryMatch: null })
    }
  }

  // 加载历史比赛列表
  loadHistoryMatches = async () => {
    const { clubid, openid } = this.state
    if (!clubid || !openid) return
    
    this.setState({ historyMatchesLoading: true })
    try {
      const data = await matchService.list(openid, clubid, 1, 50)
      const matches = Array.isArray(data.data) ? data.data : []
      this.setState({ historyMatches: matches, showHistoryList: true })
    } catch (error) {
      console.error('Load history matches error:', error)
      Taro.showToast({
        title: '加载历史比赛失败',
        icon: 'none'
      })
    } finally {
      this.setState({ historyMatchesLoading: false })
    }
  }

  // 选择历史比赛
  handleSelectHistoryMatch = async (match) => {
    const { clubid, openid } = this.state
    
    try {
      Taro.showLoading({ title: '加载中...' })
      const data = await matchService.getMatchForCopy(clubid, match._id, openid)
      Taro.hideLoading()
      
      if (data.data) {
        const matchData = data.data
        
        // 填充表单
        this.setState({
          name: matchData.name || '',
          type: matchData.type || 'none',
          remark: matchData.remark || '',
          selectedHistoryMatch: match
        })
        
        // 根据类型填充选手
        if (matchData.players && matchData.players.length > 0) {
          if (matchData.type === 'none') {
            // 无固定类型：填充selectedPlayers
            const selectedPlayers = []
            const playerMap = new Map(this.state.players.map(p => [p._id, p]))
            
            matchData.players.forEach(playerId => {
              const player = playerMap.get(playerId)
              if (player) {
                selectedPlayers.push(player)
              }
            })
            
            this.setState({ selectedPlayers })
          } else {
            // 固定搭档/分组类型：填充selectedPlayerPairs
            const selectedPlayerPairs = []
            const playerMap = new Map(this.state.players.map(p => [p._id, p]))
            
            // 按配对顺序填充（每2个为一对）
            for (let i = 0; i < matchData.players.length; i += 2) {
              const player1Id = matchData.players[i]
              const player2Id = matchData.players[i + 1]
              
              selectedPlayerPairs.push({
                player1: player1Id ? playerMap.get(player1Id) : null,
                player2: player2Id ? playerMap.get(player2Id) : null
              })
            }
            
            this.setState({ selectedPlayerPairs })
          }
        }
        
        // 隐藏历史比赛列表
        this.setState({ showHistoryList: false })
        
        Taro.showToast({
          title: '已加载比赛数据',
          icon: 'success'
        })
      }
    } catch (error) {
      Taro.hideLoading()
      console.error('Load match for copy error:', error)
      Taro.showToast({
        title: error.message || '加载比赛数据失败',
        icon: 'none'
      })
    }
  }

  // 处理比赛类型变化
  handleTypeChange = (e) => {
    const type = e.detail.value
    this.setState({ 
      type,
      selectedPlayers: [],
      selectedPlayerPairs: [],
      activeGroupSlot: null
    })
    
    // 如果是固定搭档或分组类型，初始化一个空配对
    if (type === 'fixpair' || type === 'group') {
      this.setState({ selectedPlayerPairs: [{ player1: null, player2: null }] })
    }
  }

  // 无固定类型：切换选手选择
  handlePlayerToggle = (player) => {
    const { selectedPlayers } = this.state
    const index = selectedPlayers.findIndex(p => p._id === player._id)
    
    if (index >= 0) {
      // 取消选择
      selectedPlayers.splice(index, 1)
    } else {
      // 添加选择
      selectedPlayers.push(player)
    }
    
    this.setState({ selectedPlayers: [...selectedPlayers] })
  }

  // 固定搭档/分组类型：激活槽位
  handleActivateSlot = (pairIndex, slot) => {
    this.setState({ activeGroupSlot: { pairIndex, slot } })
  }

  // 固定搭档/分组类型：选择选手到槽位
  handleSelectPlayerForPair = (player) => {
    const { activeGroupSlot, selectedPlayerPairs } = this.state
    
    if (!activeGroupSlot) return
    
    const { pairIndex, slot } = activeGroupSlot
    
    // 确保有足够的配对
    while (selectedPlayerPairs.length <= pairIndex) {
      selectedPlayerPairs.push({ player1: null, player2: null })
    }
    
    const pair = selectedPlayerPairs[pairIndex]
    if (slot === 1) {
      pair.player1 = player
    } else {
      pair.player2 = player
    }
    
    this.setState({ 
      selectedPlayerPairs: [...selectedPlayerPairs],
      activeGroupSlot: null
    })
  }

  // 添加新配对
  handleAddPair = () => {
    const { selectedPlayerPairs } = this.state
    this.setState({ 
      selectedPlayerPairs: [...selectedPlayerPairs, { player1: null, player2: null }]
    })
  }

  // 删除配对
  handleRemovePair = (index) => {
    const { selectedPlayerPairs } = this.state
    selectedPlayerPairs.splice(index, 1)
    this.setState({ selectedPlayerPairs: [...selectedPlayerPairs] })
  }

  // 删除配对中的选手
  handleRemovePairPlayer = (pairIndex, slot) => {
    const { selectedPlayerPairs } = this.state
    const pair = selectedPlayerPairs[pairIndex]
    if (slot === 1) {
      pair.player1 = null
    } else {
      pair.player2 = null
    }
    this.setState({ selectedPlayerPairs: [...selectedPlayerPairs] })
  }

  // 获取显示的成员列表（根据搜索关键词过滤）
  getDisplayPlayers = () => {
    const { players, playerSearchKeyword } = this.state
    if (!playerSearchKeyword) return players
    
    const keyword = playerSearchKeyword.toLowerCase()
    return players.filter(p => 
      (p.name || '').toLowerCase().includes(keyword)
    )
  }

  // 获取玩家数量
  getPlayerCount = () => {
    const { type, selectedPlayers, selectedPlayerPairs } = this.state
    
    if (type === 'none') {
      return selectedPlayers.length
    } else {
      // 计算配对中的选手总数
      let count = 0
      selectedPlayerPairs.forEach(pair => {
        if (pair.player1) count++
        if (pair.player2) count++
      })
      return count
    }
  }

  // 提交表单
  handleSubmit = async () => {
    const { clubid, name, type, startDate, remark, openid, selectedPlayers, selectedPlayerPairs } = this.state
    
    if (!name.trim()) {
      Taro.showToast({
        title: '请输入赛事名称',
        icon: 'none'
      })
      return
    }
    
    // 验证选手
    let players = []
    if (type === 'none') {
      if (selectedPlayers.length === 0) {
        Taro.showToast({
          title: '请至少选择一个选手',
          icon: 'none'
        })
        return
      }
      players = selectedPlayers.map(p => p._id)
    } else {
      // 检查所有配对是否完整
      const incompletePairs = selectedPlayerPairs.filter(p => !p.player1 || !p.player2)
      if (incompletePairs.length > 0) {
        Taro.showToast({
          title: '请完成所有配对',
          icon: 'none'
        })
        return
      }
      
      // 转换为选手ID数组（按配对顺序）
      players = []
      selectedPlayerPairs.forEach(pair => {
        players.push(pair.player1._id)
        players.push(pair.player2._id)
      })
    }
    
    if (this.state.loading) return
    
    this.setState({ loading: true })
    
    try {
      const data = await matchService.createMatch(
        clubid,
        name.trim(),
        type,
        players,
        startDate || null,
        remark.trim() || null,
        openid
      )
      
      Taro.showToast({
        title: '创建成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('Create match error:', error)
      Taro.showToast({
        title: error.message || '创建失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  // 格式化比赛名称显示
  formatMatchName = (match) => {
    if (match.name) return match.name
    if (match.createdate) return formatDate(match.createdate)
    return '未命名比赛'
  }

  render() {
    const {
      createMode,
      name,
      type,
      startDate,
      remark,
      selectedPlayers,
      selectedPlayerPairs,
      activeGroupSlot,
      playerSearchKeyword,
      playersLoading,
      historyMatches,
      historyMatchesLoading,
      showHistoryList,
      loading
    } = this.state

    const displayPlayers = this.getDisplayPlayers()
    const playerCount = this.getPlayerCount()

    return (
      <View className='match-create-page'>
        {/* 创建模式选择 */}
        <View className='mode-selector'>
          <View 
            className={`mode-item ${createMode === 'manual' ? 'active' : ''}`}
            onClick={() => this.handleModeChange('manual')}
          >
            <Text>手动创建</Text>
          </View>
          <View 
            className={`mode-item ${createMode === 'copy' ? 'active' : ''}`}
            onClick={() => this.handleModeChange('copy')}
          >
            <Text>从历史比赛复制</Text>
          </View>
        </View>

        {/* 从历史比赛复制：显示历史比赛列表 */}
        {createMode === 'copy' && showHistoryList && (
          <View className='history-matches-section'>
            <View className='section-title'>选择要复制的比赛</View>
            {historyMatchesLoading ? (
              <View className='loading'>加载中...</View>
            ) : historyMatches.length === 0 ? (
              <View className='empty'>暂无历史比赛</View>
            ) : (
              <View className='history-matches-list'>
                {historyMatches.map(match => (
                  <View 
                    key={match._id}
                    className='history-match-item'
                    onClick={() => this.handleSelectHistoryMatch(match)}
                  >
                    <View className='match-name'>{this.formatMatchName(match)}</View>
                    <View className='match-info'>
                      <Text className='match-type'>
                        {match.type === 'none' ? '无固定' : match.type === 'fixpair' ? '固定搭档' : match.type === 'group' ? '分组' : '未知'}
                      </Text>
                      <Text className='match-date'>{formatDate(match.createdate)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* 创建表单 */}
        {(!showHistoryList || createMode === 'manual') && (
          <View className='create-form'>
            <View className='form-item'>
              <Text className='label'>赛事名称</Text>
              <Input
                className='input'
                placeholder='请输入赛事名称'
                value={name}
                onInput={(e) => this.setState({ name: e.detail.value })}
              />
            </View>

            <View className='form-item'>
              <Text className='label'>比赛类型</Text>
              <Picker
                mode='selector'
                range={['无固定', '固定搭档', '分组']}
                rangeKey=''
                value={type === 'none' ? 0 : type === 'fixpair' ? 1 : 2}
                onChange={(e) => {
                  const index = e.detail.value
                  const types = ['none', 'fixpair', 'group']
                  this.handleTypeChange({ detail: { value: types[index] } })
                }}
              >
                <View className='picker'>
                  {type === 'none' ? '无固定' : type === 'fixpair' ? '固定搭档' : '分组'}
                </View>
              </Picker>
            </View>

            {/* 选手选择区域 */}
            <View className='form-item'>
              <Text className='label'>选择选手</Text>
              
              {/* 搜索框 */}
              <Input
                className='search-input'
                placeholder='搜索成员姓名'
                value={playerSearchKeyword}
                onInput={(e) => this.setState({ playerSearchKeyword: e.detail.value })}
              />

              {/* 无固定类型：已选选手显示 */}
              {type === 'none' && selectedPlayers.length > 0 && (
                <View className='selected-players'>
                  {selectedPlayers.map((player, index) => (
                    <View key={player._id} className='selected-player-tag'>
                      <Text className='player-name'>{player.name || '未知'}</Text>
                      <Text 
                        className='remove-btn'
                        onClick={() => {
                          const newSelected = [...selectedPlayers]
                          newSelected.splice(index, 1)
                          this.setState({ selectedPlayers: newSelected })
                        }}
                      >×</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* 固定搭档类型：配对显示 */}
              {type === 'fixpair' && (
                <View className='player-pairs'>
                  {selectedPlayerPairs.map((pair, index) => (
                    <View key={index} className='pair-item'>
                      <View className='pair-label'>第{index + 1}组合</View>
                      <View className='pair-players'>
                        <View
                          className={`pair-slot ${activeGroupSlot && activeGroupSlot.pairIndex === index && activeGroupSlot.slot === 1 ? 'active' : ''} ${!pair.player1 ? 'empty' : ''}`}
                          onClick={() => this.handleActivateSlot(index, 1)}
                        >
                          {pair.player1 ? (
                            <>
                              <Text className='player-name'>{pair.player1.name || '未知'}</Text>
                              <Text 
                                className='remove-btn'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  this.handleRemovePairPlayer(index, 1)
                                }}
                              >×</Text>
                            </>
                          ) : (
                            <Text className='placeholder'>点击选择</Text>
                          )}
                        </View>
                        <Text className='pair-connector'>+</Text>
                        <View
                          className={`pair-slot ${activeGroupSlot && activeGroupSlot.pairIndex === index && activeGroupSlot.slot === 2 ? 'active' : ''} ${!pair.player2 ? 'empty' : ''}`}
                          onClick={() => this.handleActivateSlot(index, 2)}
                        >
                          {pair.player2 ? (
                            <>
                              <Text className='player-name'>{pair.player2.name || '未知'}</Text>
                              <Text 
                                className='remove-btn'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  this.handleRemovePairPlayer(index, 2)
                                }}
                              >×</Text>
                            </>
                          ) : (
                            <Text className='placeholder'>点击选择</Text>
                          )}
                        </View>
                      </View>
                      <Text 
                        className='remove-pair-btn'
                        onClick={() => this.handleRemovePair(index)}
                      >删除此组合</Text>
                    </View>
                  ))}
                  <Button 
                    className='add-pair-btn'
                    onClick={this.handleAddPair}
                  >+ 添加新组</Button>
                </View>
              )}

              {/* 分组类型：A组/B组显示 */}
              {type === 'group' && (
                <View className='player-groups'>
                  <View className='group-header'>
                    <Text className='group-label'>A组</Text>
                    <Text className='group-label'>B组</Text>
                  </View>
                  {selectedPlayerPairs.map((pair, index) => (
                    <View key={index} className='group-row'>
                      <View
                        className={`group-slot ${activeGroupSlot && activeGroupSlot.pairIndex === index && activeGroupSlot.slot === 1 ? 'active' : ''} ${!pair.player1 ? 'empty' : ''}`}
                        onClick={() => this.handleActivateSlot(index, 1)}
                      >
                        {pair.player1 ? (
                          <>
                            <Text className='player-name'>{pair.player1.name || '未知'}</Text>
                            <Text 
                              className='remove-btn'
                              onClick={(e) => {
                                e.stopPropagation()
                                this.handleRemovePairPlayer(index, 1)
                              }}
                            >×</Text>
                          </>
                        ) : (
                          <Text className='placeholder'>点击选择</Text>
                        )}
                      </View>
                      <View
                        className={`group-slot ${activeGroupSlot && activeGroupSlot.pairIndex === index && activeGroupSlot.slot === 2 ? 'active' : ''} ${!pair.player2 ? 'empty' : ''}`}
                        onClick={() => this.handleActivateSlot(index, 2)}
                      >
                        {pair.player2 ? (
                          <>
                            <Text className='player-name'>{pair.player2.name || '未知'}</Text>
                            <Text 
                              className='remove-btn'
                              onClick={(e) => {
                                e.stopPropagation()
                                this.handleRemovePairPlayer(index, 2)
                              }}
                            >×</Text>
                          </>
                        ) : (
                          <Text className='placeholder'>点击选择</Text>
                        )}
                      </View>
                    </View>
                  ))}
                  <Button 
                    className='add-pair-btn'
                    onClick={this.handleAddPair}
                  >+ 添加新组</Button>
                </View>
              )}

              {/* 激活提示 */}
              {activeGroupSlot && (type === 'fixpair' || type === 'group') && (
                <View className='active-hint'>
                  <Text>
                    {type === 'fixpair' 
                      ? `已激活第${activeGroupSlot.pairIndex + 1}组合${activeGroupSlot.slot === 1 ? '左侧' : '右侧'}位置，点击下方成员进行选择`
                      : `已激活${activeGroupSlot.slot === 1 ? 'A组' : 'B组'}第${activeGroupSlot.pairIndex + 1}行，点击下方成员进行选择`}
                  </Text>
                  <Text 
                    className='cancel-active'
                    onClick={() => this.setState({ activeGroupSlot: null })}
                  >取消激活</Text>
                </View>
              )}

              {/* 成员列表 */}
              {playersLoading ? (
                <View className='loading'>加载中...</View>
              ) : (
                <View className='players-grid'>
                  {displayPlayers.map(player => {
                    const isSelected = type === 'none' 
                      ? selectedPlayers.some(p => p._id === player._id)
                      : false
                    
                    return (
                      <View
                        key={player._id}
                        className={`player-item ${isSelected ? 'selected' : ''} ${activeGroupSlot ? 'clickable' : ''}`}
                        onClick={() => {
                          if (type === 'none') {
                            this.handlePlayerToggle(player)
                          } else if (activeGroupSlot) {
                            this.handleSelectPlayerForPair(player)
                          }
                        }}
                      >
                        <Text className='player-name'>{player.name || '未知'}</Text>
                        {isSelected && type === 'none' && (
                          <Text className='check-icon'>✓</Text>
                        )}
                      </View>
                    )
                  })}
                </View>
              )}
            </View>

            <View className='form-item'>
              <Text className='label'>玩家数</Text>
              <Text className='player-count'>{playerCount}</Text>
            </View>

            <View className='form-item'>
              <Text className='label'>比赛开始日期</Text>
              <Picker
                mode='date'
                value={startDate}
                onChange={(e) => this.setState({ startDate: e.detail.value })}
              >
                <View className='picker'>
                  {startDate || '请选择日期'}
                </View>
              </Picker>
            </View>

            <View className='form-item'>
              <Text className='label'>备注</Text>
              <Input
                className='textarea'
                type='text'
                placeholder='请输入备注（可选）'
                value={remark}
                onInput={(e) => this.setState({ remark: e.detail.value })}
              />
            </View>

            <Button 
              className='submit-button'
              onClick={this.handleSubmit}
              disabled={loading}
            >
              {loading ? '创建中...' : '创建比赛'}
            </Button>
          </View>
        )}
      </View>
    )
  }
}
