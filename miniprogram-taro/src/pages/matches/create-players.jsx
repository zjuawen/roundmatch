import { Component } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { userService } from '../../services/api'
import { getGlobalData } from '../../utils'
import './create.scss'

const DRAFT_KEY = 'matchCreatePlayerDraft'

const emptyPairs = (n) => Array.from({ length: n }, () => ({ player1: null, player2: null }))

export default class MatchCreatePlayers extends Component {
  state = {
    clubid: null,
    type: 'none',
    participantCount: 8,
    pairCount: 2,
    players: [],
    selectedPlayers: [],
    selectedPlayerPairs: [],
    activeGroupSlot: null,
    playerSearchKeyword: '',
    playersLoading: false,
    playersPageNum: 1,
    playersPageSize: 50,
    playersHasMore: true,
    playersTotal: 0,
    playerFilter: 'all'
  }

  componentDidMount() {
    this.initFromRoute()
  }

  initFromRoute = async () => {
    const router = Taro.getCurrentInstance().router
    const params = router?.params || {}
    const clubid = params.clubid
    const type = params.type || 'none'
    const participantCount = Math.max(4, parseInt(params.participantCount, 10) || 8)
    const pairCount = Math.max(2, parseInt(params.pairCount, 10) || 2)

    if (!clubid) {
      Taro.showToast({ title: '缺少俱乐部', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
      return
    }

    const openid = getGlobalData('openid')
    if (!openid) {
      Taro.redirectTo({
        url: '/pages/login/index?returnUrl=' + encodeURIComponent('/pages/matches/create-players?clubid=' + clubid)
      })
      return
    }

    let selectedPlayers = []
    let selectedPlayerPairs = type === 'fixpair' || type === 'group' ? emptyPairs(pairCount) : []

    try {
      const draft = Taro.getStorageSync(DRAFT_KEY)
      if (draft && draft.clubid === clubid && draft.type === type) {
        if (Array.isArray(draft.selectedPlayers)) {
          selectedPlayers = draft.selectedPlayers
        }
        if (Array.isArray(draft.selectedPlayerPairs) && (type === 'fixpair' || type === 'group')) {
          const pairs = [...draft.selectedPlayerPairs]
          while (pairs.length < pairCount) pairs.push({ player1: null, player2: null })
          if (pairs.length > pairCount) selectedPlayerPairs = pairs.slice(0, pairCount)
          else selectedPlayerPairs = pairs
        }
      }
    } catch (e) {
      console.warn(e)
    }

    this.setState({
      clubid,
      type,
      participantCount,
      pairCount,
      selectedPlayers,
      selectedPlayerPairs
    })

    await this.loadPlayers(clubid, 1, false)
  }

  loadPlayers = async (clubid, pageNum = 1, append = false) => {
    const { playersPageSize } = this.state
    this.setState({ playersLoading: true })
    try {
      const data = await userService.listPlayers(clubid, pageNum, playersPageSize)
      const result = data.data || {}
      const newPlayers = Array.isArray(result.list) ? result.list : []
      const total = result.total || 0
      const hasMore = result.hasMore !== undefined ? result.hasMore : (pageNum * playersPageSize < total)
      this.setState({
        players: append ? [...this.state.players, ...newPlayers] : newPlayers,
        playersPageNum: pageNum,
        playersTotal: total,
        playersHasMore: hasMore
      })
    } catch (error) {
      console.error('Load players error:', error)
      Taro.showToast({ title: '加载成员列表失败', icon: 'none' })
    } finally {
      this.setState({ playersLoading: false })
    }
  }

  loadMorePlayers = () => {
    const { clubid, playersPageNum, playersHasMore, playersLoading } = this.state
    if (!playersHasMore || playersLoading) return
    this.loadPlayers(clubid, playersPageNum + 1, true)
  }

  handlePlayerToggle = (player) => {
    const { type, selectedPlayers, participantCount } = this.state
    if (type !== 'none') return
    const next = [...selectedPlayers]
    const i = next.findIndex(p => p._id === player._id)
    if (i >= 0) {
      next.splice(i, 1)
    } else {
      if (next.length >= participantCount) {
        Taro.showToast({ title: `最多选择 ${participantCount} 人`, icon: 'none' })
        return
      }
      next.push(player)
    }
    this.setState({ selectedPlayers: next })
  }

  handleActivateSlot = (pairIndex, slot) => {
    this.setState({ activeGroupSlot: { pairIndex, slot } })
  }

  handleSelectPlayerForPair = (player) => {
    const { activeGroupSlot, selectedPlayerPairs, type } = this.state
    if (!activeGroupSlot || (type !== 'fixpair' && type !== 'group')) return
    const { pairIndex, slot } = activeGroupSlot
    const pairs = [...selectedPlayerPairs]
    while (pairs.length <= pairIndex) pairs.push({ player1: null, player2: null })
    const pair = { ...pairs[pairIndex] }
    if (slot === 1) pair.player1 = player
    else pair.player2 = player
    pairs[pairIndex] = pair
    this.setState({ selectedPlayerPairs: pairs, activeGroupSlot: null })
  }

  handleRemovePairPlayer = (pairIndex, slot) => {
    const selectedPlayerPairs = this.state.selectedPlayerPairs.map((p, i) => {
      if (i !== pairIndex) return p
      if (slot === 1) return { ...p, player1: null }
      return { ...p, player2: null }
    })
    this.setState({ selectedPlayerPairs })
  }

  handleSearchKeywordChange = (e) => {
    this.setState({ playerSearchKeyword: e.detail.value })
  }

  handleSelectAll = () => {
    const { type, players, selectedPlayers, participantCount } = this.state
    if (type !== 'none') return
    const cap = Math.min(participantCount, players.length)
    const merged = []
    const seen = new Set()
    for (const p of selectedPlayers) {
      if (merged.length >= cap) break
      merged.push(p)
      seen.add(p._id)
    }
    for (const p of players) {
      if (merged.length >= cap) break
      if (!seen.has(p._id)) {
        merged.push(p)
        seen.add(p._id)
      }
    }
    this.setState({ selectedPlayers: merged })
  }

  handleDeselectAll = () => {
    if (this.state.type !== 'none') return
    this.setState({ selectedPlayers: [] })
  }

  handleInvertSelection = () => {
    const { type, players, selectedPlayers, participantCount } = this.state
    if (type !== 'none') return
    const selectedIds = new Set(selectedPlayers.map(p => p._id))
    const next = players.filter(p => !selectedIds.has(p._id)).slice(0, participantCount)
    this.setState({ selectedPlayers: next })
  }

  getDisplayPlayers = () => {
    const { players, playerSearchKeyword, playerFilter, type, selectedPlayers } = this.state
    let filtered = players
    if (type === 'none' && playerFilter !== 'all') {
      const selectedIds = new Set(selectedPlayers.map(p => p._id))
      if (playerFilter === 'selected') filtered = filtered.filter(p => selectedIds.has(p._id))
      else if (playerFilter === 'unselected') filtered = filtered.filter(p => !selectedIds.has(p._id))
    }
    if (playerSearchKeyword) {
      const keyword = playerSearchKeyword.toLowerCase()
      filtered = filtered.filter(p => (p.name || '').toLowerCase().includes(keyword))
    }
    return filtered
  }

  handleDone = () => {
    const {
      clubid,
      type,
      participantCount,
      pairCount,
      selectedPlayers,
      selectedPlayerPairs
    } = this.state
    try {
      Taro.setStorageSync(DRAFT_KEY, {
        clubid,
        type,
        participantCount,
        pairCount,
        selectedPlayers,
        selectedPlayerPairs,
        updatedAt: Date.now()
      })
    } catch (e) {
      console.error(e)
    }
    Taro.navigateBack()
  }

  render() {
    const {
      type,
      participantCount,
      pairCount,
      selectedPlayers,
      selectedPlayerPairs,
      activeGroupSlot,
      playerSearchKeyword,
      playersLoading,
      players,
      playersTotal,
      playersHasMore,
      playerFilter
    } = this.state

    const displayPlayers = this.getDisplayPlayers()

    return (
      <View className='match-create-page'>
        <View className='create-form create-players-inner'>
          <View className='form-item'>
            <Text className='player-placeholder-hint player-optional-tip'>
              {type === 'none'
                ? `无固定：最多选 ${participantCount} 人；未满部分将留空位，成员可在比赛详情报名。`
                : `固定搭档/分组：共 ${pairCount} 组；空位可赛后由成员报名。点选槽位后再点下方成员。`}
            </Text>

            <Input
              className='search-input'
              placeholder='搜索成员姓名'
              value={playerSearchKeyword}
              onInput={this.handleSearchKeywordChange}
            />

            {type === 'none' && (
              <View className='quick-actions'>
                <View className='action-buttons'>
                  <View className='action-btn' onClick={this.handleSelectAll}>
                    <Text className='action-btn-text'>全选至上限</Text>
                  </View>
                  <View className='action-btn' onClick={this.handleDeselectAll}>
                    <Text className='action-btn-text'>清空</Text>
                  </View>
                  <View className='action-btn' onClick={this.handleInvertSelection}>
                    <Text className='action-btn-text'>反选</Text>
                  </View>
                </View>
                <View className='filter-buttons'>
                  <View
                    className={`filter-btn ${playerFilter === 'all' ? 'active' : ''}`}
                    onClick={() => this.setState({ playerFilter: 'all' })}
                  >
                    <Text className='filter-btn-text'>全部</Text>
                  </View>
                  <View
                    className={`filter-btn ${playerFilter === 'selected' ? 'active' : ''}`}
                    onClick={() => this.setState({ playerFilter: 'selected' })}
                  >
                    <Text className='filter-btn-text'>已选</Text>
                  </View>
                  <View
                    className={`filter-btn ${playerFilter === 'unselected' ? 'active' : ''}`}
                    onClick={() => this.setState({ playerFilter: 'unselected' })}
                  >
                    <Text className='filter-btn-text'>未选</Text>
                  </View>
                </View>
              </View>
            )}

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
                  </View>
                ))}
              </View>
            )}

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
              </View>
            )}

            {activeGroupSlot && (type === 'fixpair' || type === 'group') && (
              <View className='active-hint'>
                <Text>
                  {type === 'fixpair'
                    ? `第${activeGroupSlot.pairIndex + 1}组${activeGroupSlot.slot === 1 ? '左' : '右'}，点下方成员填入`
                    : `${activeGroupSlot.slot === 1 ? 'A' : 'B'}组第${activeGroupSlot.pairIndex + 1}行`}
                </Text>
                <Text className='cancel-active' onClick={() => this.setState({ activeGroupSlot: null })}>
                  取消
                </Text>
              </View>
            )}

            {playersLoading && players.length === 0 ? (
              <View className='loading'>加载中...</View>
            ) : (
              <>
                <View className='players-grid'>
                  {displayPlayers.map(player => {
                    const isSelected =
                      type === 'none' ? selectedPlayers.some(p => p._id === player._id) : false
                    return (
                      <View
                        key={player._id}
                        className={`player-item ${isSelected ? 'selected' : ''} ${(type === 'fixpair' || type === 'group') && activeGroupSlot ? 'clickable' : ''}`}
                        onClick={() => {
                          if (type === 'none') this.handlePlayerToggle(player)
                          else if ((type === 'fixpair' || type === 'group') && activeGroupSlot) {
                            this.handleSelectPlayerForPair(player)
                          }
                        }}
                      >
                        <Text className='player-name'>{player.name || '未知'}</Text>
                        {isSelected && type === 'none' && <Text className='check-icon'>✓</Text>}
                      </View>
                    )
                  })}
                </View>
                {playersHasMore && !playerSearchKeyword && playerFilter === 'all' && (
                  <View className='load-more-section'>
                    {playersLoading ? (
                      <View className='loading-more'>加载中...</View>
                    ) : (
                      <View className='load-more-btn' onClick={this.loadMorePlayers}>
                        <Text className='load-more-text'>加载更多 ({playersTotal - players.length} 人)</Text>
                      </View>
                    )}
                  </View>
                )}
                {!playerSearchKeyword && playerFilter === 'all' && playersTotal > 0 && (
                  <View className='players-total-info'>
                    <Text className='total-text'>共 {playersTotal} 人，已加载 {players.length} 人</Text>
                  </View>
                )}
              </>
            )}

            <Button className='submit-button' onClick={this.handleDone}>
              完成
            </Button>
          </View>
        </View>
      </View>
    )
  }
}
