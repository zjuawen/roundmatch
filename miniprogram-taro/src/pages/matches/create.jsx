import { Component } from 'react'
import { View, Text, Input, Button, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { matchService, clubService, userService } from '../../services/api'
import { getGlobalData, formatDate } from '../../utils'
import { OPEN_SLOT_PLAYER_ID } from '../../constants/openSlot'
import './create.scss'

const DRAFT_KEY = 'matchCreatePlayerDraft'
const NONE_COUNT_OPTIONS = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16]
const PAIR_COUNT_OPTIONS = [2, 3, 4, 5, 6]

const emptyPairs = (n) => Array.from({ length: n }, () => ({ player1: null, player2: null }))

const indexInOptions = (opts, value) => {
  const i = opts.indexOf(value)
  if (i >= 0) return i
  let best = 0
  let bestDiff = Infinity
  opts.forEach((n, idx) => {
    const d = Math.abs(n - value)
    if (d < bestDiff) {
      bestDiff = d
      best = idx
    }
  })
  return best
}

export default class MatchCreate extends Component {
  state = {
    clubid: null,
    openid: null,
    createMode: 'manual',
    name: '',
    type: 'none',
    participantCount: 8,
    pairCount: 2,
    startDate: '',
    remark: '',
    venueName: '',
    venueAddress: '',
    venueLatitude: null,
    venueLongitude: null,
    selectedPlayers: [],
    selectedPlayerPairs: [],
    historyMatches: [],
    historyMatchesLoading: false,
    selectedHistoryMatch: null,
    loading: false,
    showHistoryList: false
  }

  componentDidMount() {
    this.initPage()
  }

  componentDidShow() {
    this.loadDraftFromStorage()
  }

  loadDraftFromStorage = () => {
    const { clubid } = this.state
    if (!clubid) return
    try {
      const draft = Taro.getStorageSync(DRAFT_KEY)
      if (!draft || draft.clubid !== clubid) return
      const patch = {}
      if (Array.isArray(draft.selectedPlayers)) {
        patch.selectedPlayers = draft.selectedPlayers
      }
      if (Array.isArray(draft.selectedPlayerPairs)) {
        patch.selectedPlayerPairs = draft.selectedPlayerPairs
      }
      if (Object.keys(patch).length) this.setState(patch)
    } catch (e) {
      console.warn(e)
    }
  }

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
      Taro.showToast({ title: '请先选择俱乐部', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
      return
    }

    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const startDate = `${year}-${month}-${day}`

    this.setState({ openid, clubid, startDate }, () => this.loadDraftFromStorage())

    await this.checkPermission(clubid, openid)
  }

  checkPermission = async (clubid, openid) => {
    try {
      const adminCheckData = await clubService.checkAdmin(clubid, openid)
      const isAdmin = adminCheckData.data?.isAdmin === true
      if (!isAdmin) {
        Taro.showToast({ title: '只有俱乐部管理员可以创建比赛', icon: 'none' })
        setTimeout(() => Taro.navigateBack(), 1500)
      }
    } catch (error) {
      console.error('Check permission error:', error)
      Taro.showToast({ title: '权限检查失败', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
    }
  }

  handleModeChange = (mode) => {
    this.setState({ createMode: mode })
    if (mode === 'copy') {
      this.loadHistoryMatches()
    } else {
      this.setState({ selectedHistoryMatch: null })
    }
  }

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
      Taro.showToast({ title: '加载历史比赛失败', icon: 'none' })
    } finally {
      this.setState({ historyMatchesLoading: false })
    }
  }

  handleSelectHistoryMatch = async (match) => {
    const { clubid, openid } = this.state
    try {
      Taro.showLoading({ title: '加载中...' })
      const data = await matchService.getMatchForCopy(clubid, match._id, openid)
      Taro.hideLoading()

      if (!data.data) return

      const matchData = data.data
      const nextType = matchData.type || 'none'

      let playerMap = new Map()
      try {
        const listRes = await userService.listPlayers(clubid, 1, 200)
        const list = listRes.data?.list || []
        playerMap = new Map(list.map(p => [p._id, p]))
      } catch (e) {
        console.warn(e)
      }

      const patch = {
        name: matchData.name || '',
        type: nextType,
        remark: matchData.remark || '',
        venueName: matchData.venueName || '',
        venueAddress: matchData.venueAddress || '',
        venueLatitude: matchData.venueLatitude ?? null,
        venueLongitude: matchData.venueLongitude ?? null,
        selectedHistoryMatch: match,
        showHistoryList: false
      }

      if (matchData.players && matchData.players.length > 0) {
        if (nextType === 'none') {
          const selectedPlayers = []
          matchData.players.forEach(playerId => {
            const player = playerMap.get(playerId)
            if (player) selectedPlayers.push(player)
          })
          patch.selectedPlayers = selectedPlayers
          patch.selectedPlayerPairs = []
          patch.participantCount = Math.max(
            4,
            matchData.playerCount || matchData.players.length || selectedPlayers.length || 8
          )
        } else {
          const selectedPlayerPairs = []
          for (let i = 0; i < matchData.players.length; i += 2) {
            const player1Id = matchData.players[i]
            const player2Id = matchData.players[i + 1]
            selectedPlayerPairs.push({
              player1: player1Id ? playerMap.get(player1Id) || null : null,
              player2: player2Id ? playerMap.get(player2Id) || null : null
            })
          }
          patch.selectedPlayerPairs = selectedPlayerPairs.length
            ? selectedPlayerPairs
            : emptyPairs(2)
          patch.pairCount = Math.max(2, selectedPlayerPairs.length || 2)
          patch.selectedPlayers = []
        }
      } else {
        patch.selectedPlayers = []
        const pc = patch.pairCount ?? this.state.pairCount
        patch.selectedPlayerPairs =
          nextType === 'fixpair' || nextType === 'group' ? emptyPairs(pc) : []
      }

      this.setState(patch)

      try {
        Taro.setStorageSync(DRAFT_KEY, {
          clubid,
          type: nextType,
          participantCount: patch.participantCount ?? this.state.participantCount,
          pairCount: patch.pairCount ?? this.state.pairCount,
          selectedPlayers: patch.selectedPlayers ?? [],
          selectedPlayerPairs: patch.selectedPlayerPairs ?? [],
          updatedAt: Date.now()
        })
      } catch (e) {}

      Taro.showToast({ title: '已加载比赛数据', icon: 'success' })
    } catch (error) {
      Taro.hideLoading()
      console.error('Load match for copy error:', error)
      Taro.showToast({ title: error.message || '加载比赛数据失败', icon: 'none' })
    }
  }

  handleTypeChange = (nextType) => {
    this.setState({
      type: nextType,
      selectedPlayers: [],
      selectedPlayerPairs:
        nextType === 'fixpair' || nextType === 'group'
          ? emptyPairs(this.state.pairCount)
          : []
    })
  }

  handleParticipantCountPick = (e) => {
    const i = parseInt(e.detail.value, 10)
    const n = NONE_COUNT_OPTIONS[i] ?? 8
    this.setState((prev) => ({
      participantCount: n,
      selectedPlayers: (prev.selectedPlayers || []).slice(0, n)
    }))
  }

  handlePairCountPick = (e) => {
    const i = parseInt(e.detail.value, 10)
    const n = PAIR_COUNT_OPTIONS[i] ?? 2
    this.setState((prev) => {
      const old = prev.selectedPlayerPairs || []
      const next = emptyPairs(n)
      for (let j = 0; j < n && j < old.length; j++) next[j] = { ...old[j] }
      return { pairCount: n, selectedPlayerPairs: next }
    })
  }

  goSelectPlayers = () => {
    const {
      clubid,
      type,
      participantCount,
      pairCount,
      selectedPlayers,
      selectedPlayerPairs
    } = this.state
    if (!clubid) return
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
    Taro.navigateTo({
      url: `/pages/matches/create-players?clubid=${encodeURIComponent(clubid)}&type=${type}&participantCount=${participantCount}&pairCount=${pairCount}`
    })
  }

  countFilledPairSlots = () => {
    return this.state.selectedPlayerPairs.reduce(
      (n, p) => n + (p.player1 ? 1 : 0) + (p.player2 ? 1 : 0),
      0
    )
  }

  buildPlayersPayload = () => {
    const { type, participantCount, pairCount, selectedPlayers, selectedPlayerPairs } = this.state

    if (type === 'none') {
      const ids = selectedPlayers.map(p => p._id)
      const pad = Math.max(0, participantCount - ids.length)
      return [...ids, ...Array(pad).fill(OPEN_SLOT_PLAYER_ID)]
    }

    let pairs = [...selectedPlayerPairs]
    while (pairs.length < pairCount) pairs.push({ player1: null, player2: null })
    if (pairs.length > pairCount) pairs = pairs.slice(0, pairCount)
    return pairs.map(pair => ({
      player1: pair.player1 || null,
      player2: pair.player2 || null
    }))
  }

  handleChooseVenueLocation = async () => {
    try {
      const res = await Taro.chooseLocation()
      this.setState({
        venueName: res.name || '',
        venueAddress: res.address || '',
        venueLatitude: res.latitude ?? null,
        venueLongitude: res.longitude ?? null
      })
    } catch (error) {
      if (error && error.errMsg && String(error.errMsg).includes('cancel')) return
      Taro.showToast({ title: '选择位置失败', icon: 'none' })
    }
  }

  handleClearVenueLocation = () => {
    this.setState({
      venueName: '',
      venueAddress: '',
      venueLatitude: null,
      venueLongitude: null
    })
  }

  handleSubmit = async () => {
    const {
      clubid,
      name,
      type,
      startDate,
      remark,
      openid,
      venueName,
      venueAddress,
      venueLatitude,
      venueLongitude,
      participantCount,
      selectedPlayers
    } = this.state

    if (!name.trim()) {
      Taro.showToast({ title: '请输入赛事名称', icon: 'none' })
      return
    }

    if (type === 'none' && selectedPlayers.length > participantCount) {
      Taro.showToast({ title: '已选人数超过参赛人数，请去「选择参赛选手」调整', icon: 'none' })
      return
    }

    const players = this.buildPlayersPayload()

    if (this.state.loading) return
    this.setState({ loading: true })

    try {
      await matchService.createMatch(
        clubid,
        name.trim(),
        type,
        players,
        startDate || null,
        remark.trim() || null,
        openid,
        {
          venueName: venueName || null,
          venueAddress: venueAddress || null,
          venueLatitude,
          venueLongitude
        }
      )

      try {
        Taro.removeStorageSync(DRAFT_KEY)
      } catch (e) {}

      Taro.showToast({ title: '创建成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (error) {
      console.error('Create match error:', error)
      Taro.showToast({ title: error.message || '创建失败', icon: 'none' })
    } finally {
      this.setState({ loading: false })
    }
  }

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
      participantCount,
      pairCount,
      startDate,
      remark,
      venueName,
      venueAddress,
      venueLatitude,
      venueLongitude,
      selectedPlayers,
      historyMatches,
      historyMatchesLoading,
      showHistoryList,
      loading
    } = this.state

    const typeLabels = ['无固定', '固定搭档', '分组']
    const typeKeys = ['none', 'fixpair', 'group']
    const typeIndex = typeKeys.indexOf(type)

    const noneIdx = indexInOptions(NONE_COUNT_OPTIONS, participantCount)
    const pairIdx = indexInOptions(PAIR_COUNT_OPTIONS, pairCount)

    const prefillSummary =
      type === 'none'
        ? `无固定：已选 ${selectedPlayers.length} / ${participantCount} 人`
        : `${type === 'group' ? '分组' : '固定搭档'}：${this.countFilledPairSlots()} / ${pairCount * 2} 位置（${pairCount} 组）`

    return (
      <View className='match-create-page'>
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
            <Text>从历史复制</Text>
          </View>
        </View>

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
                        {match.type === 'none'
                          ? '无固定'
                          : match.type === 'fixpair'
                            ? '固定搭档'
                            : match.type === 'group'
                              ? '分组'
                              : '未知'}
                      </Text>
                      <Text className='match-date'>{formatDate(match.createdate)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {(!showHistoryList || createMode === 'manual') && (
          <View className='create-form'>
            <View className='form-item'>
              <Text className='label'>
                <Text className='label-required'>*</Text>赛事名称
              </Text>
              <Input
                className='input'
                placeholder='请输入赛事名称'
                value={name}
                onInput={(e) => this.setState({ name: e.detail.value })}
              />
            </View>

            <View className='form-item'>
              <Text className='label'>
                <Text className='label-required'>*</Text>赛制
              </Text>
              <Picker
                mode='selector'
                range={typeLabels}
                value={typeIndex >= 0 ? typeIndex : 0}
                onChange={(e) => {
                  const i = parseInt(e.detail.value, 10)
                  this.handleTypeChange(typeKeys[i] || 'none')
                }}
              >
                <View className='picker'>{typeLabels[typeIndex >= 0 ? typeIndex : 0]}</View>
              </Picker>
            </View>

            <View className='form-item'>
              <Text className='label'>
                <Text className='label-required'>*</Text>
                {type === 'none' ? '参赛人数' : '搭档组数'}
              </Text>
              {type === 'none' ? (
                <Picker
                  mode='selector'
                  range={NONE_COUNT_OPTIONS.map((n) => `${n} 人`)}
                  value={noneIdx}
                  onChange={this.handleParticipantCountPick}
                >
                  <View className='picker'>{participantCount} 人</View>
                </Picker>
              ) : (
                <Picker
                  mode='selector'
                  range={PAIR_COUNT_OPTIONS.map((n) => `${n} 组（${n * 2} 个位置）`)}
                  value={pairIdx}
                  onChange={this.handlePairCountPick}
                >
                  <View className='picker'>
                    {pairCount} 组（{pairCount * 2} 个位置）
                  </View>
                </Picker>
              )}
              <Text className='scale-hint'>
                {type === 'none'
                  ? '人数含预留空位；未点选选手时将以空位生成对阵。'
                  : '每组 2 人；空位可在比赛详情由成员报名。'}
              </Text>
            </View>

            <View className='form-item'>
              <Text className='label'>参赛选手（可选）</Text>
              <View className='prefill-card' onClick={this.goSelectPlayers}>
                <View className='prefill-main'>
                  <Text className='prefill-summary'>{prefillSummary}</Text>
                  <Text className='prefill-arrow'>去选择 ›</Text>
                </View>
                <Text className='prefill-sub'>点击进入成员列表，不选则全部空位</Text>
              </View>
            </View>

            <View className='form-item'>
              <Text className='label'>比赛场馆（可选）</Text>
              <View className='venue-section'>
                <View className='venue-actions'>
                  <Button className='venue-btn' onClick={this.handleChooseVenueLocation}>
                    选择位置
                  </Button>
                  {(venueName || venueAddress) && (
                    <Button className='venue-btn venue-btn-clear' onClick={this.handleClearVenueLocation}>
                      清空
                    </Button>
                  )}
                </View>
                {(venueName || venueAddress) ? (
                  <View className='venue-info'>
                    {venueName ? <Text className='venue-name'>{venueName}</Text> : null}
                    {venueAddress ? <Text className='venue-address'>{venueAddress}</Text> : null}
                    {venueLatitude !== null && venueLongitude !== null ? (
                      <Text className='venue-coord'>
                        {venueLatitude.toFixed(6)}, {venueLongitude.toFixed(6)}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <Text className='venue-placeholder'>未选择场馆位置</Text>
                )}
              </View>
            </View>

            <View className='form-item'>
              <Text className='label'>比赛开始日期</Text>
              <Picker mode='date' value={startDate} onChange={(e) => this.setState({ startDate: e.detail.value })}>
                <View className='picker'>{startDate || '请选择日期'}</View>
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

            <Button className='submit-button' onClick={this.handleSubmit} disabled={loading}>
              {loading ? '创建中...' : '创建比赛'}
            </Button>
          </View>
        )}
      </View>
    )
  }
}
