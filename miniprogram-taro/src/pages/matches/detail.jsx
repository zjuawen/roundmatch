import { Component } from 'react'
import { View, Text, Image, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { matchService, gameService } from '../../services/api'
import { getGlobalData, safeNavigateBack } from '../../utils'
import { generateAvatarColor, getAvatarText } from '../../utils/imageUtils'
import './detail.scss'

export default class MatchDetail extends Component {
  state = {
    match: null,
    games: [],
    allGames: [], // 保存所有原始数据
    loading: true,
    clubid: null,
    matchId: null,
    // Tab 切换
    activeTab: 'enrollment', // 'enrollment' 报名情况, 'games' 对阵, 'ranking' 排名
    // 报名数据
    enrollment: [], // 报名名单
    matchInfo: null, // 比赛基本信息（从games中推断）
    // 排名数据
    ranking: [],
    rankingLoading: false,
    useScoreRanking: false, // 是否启用积分排名
    // 比分输入对话框
    scoreDialogShow: false,
    scoreDialogIndex: -1,
    tempScore1: '',
    tempScore2: '',
    savingScore: false,
    // 筛选相关
    filterType: null, // 'only' 只看该选手, 'exclude' 不看该选手
    filterPlayerId: null, // 筛选的选手ID
    filterPlayerName: null, // 筛选的选手名称
    // 弹出菜单
    menuShow: false,
    menuPlayerId: null,
    menuPlayerName: null,
    menuPosition: { x: 0, y: 0 }
  }

  componentDidMount() {
    // 设置导航栏标题
    Taro.setNavigationBarTitle({
      title: '比赛详情'
    })

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
      let { clubid, id, matchid, scene } = router?.params || {}
      
      // 如果路由参数中没有 scene，尝试从全局存储获取（app.js 中保存的）
      if (!scene) {
        scene = getGlobalData('launchScene')
      }
      
      // 如果是从小程序码扫码进入，scene参数可能是：
      // 1. 新格式：直接是 matchid（推荐）
      // 2. 旧格式：c=clubid&m=matchid（向后兼容）
      // 3. 被截断的旧格式：c=xxx（可能是被截断的旧格式，也可能是新格式的 matchid 被误判）
      if (scene && !matchid) {
        try {
          // 先尝试解码
          let decodedScene = scene
          try {
            decodedScene = decodeURIComponent(scene)
          } catch (e) {
            decodedScene = scene
          }
          
          // 检查是否是完整的旧格式（包含 c= 和 &m=）
          if (decodedScene.includes('c=') && decodedScene.includes('&m=')) {
            // 完整的旧格式：c=clubid&m=matchid
            const sceneParams = new URLSearchParams(decodedScene)
            clubid = clubid || sceneParams.get('c')
            matchid = matchid || sceneParams.get('m')
            console.log('解析scene参数（完整旧格式）:', { scene, decodedScene, clubid, matchid })
          } else if (decodedScene.startsWith('c=')) {
            // 被截断的旧格式：c=xxx（只有 c= 前缀，没有 &m=）
            // 可能是：
            // 1. 旧格式被截断：c=clubid（无法获取 matchid，这种情况应该报错）
            // 2. 新格式被误判：c=matchid（实际上 matchid 就是 c= 后面的值）
            // 我们尝试提取 c= 后面的值作为 matchid（兼容新格式被误判的情况）
            const matchIdFromC = decodedScene.substring(2) // 去掉 "c=" 前缀
            if (matchIdFromC && matchIdFromC.length > 0) {
              matchid = matchIdFromC
              console.log('解析scene参数（被截断格式，提取matchid）:', { scene, decodedScene, matchid })
            } else {
              console.error('scene参数格式错误:', { scene, decodedScene })
              Taro.showToast({
                title: '二维码格式错误',
                icon: 'none'
              })
              setTimeout(() => {
                safeNavigateBack('/pages/matches/list')
              }, 1500)
              return
            }
          } else {
            // 新格式：直接是 matchid
            matchid = decodedScene
            console.log('解析scene参数（新格式）:', { scene, decodedScene, matchid })
          }
        } catch (e) {
          console.warn('解析scene参数失败:', e)
          // 如果解析失败，尝试直接使用 scene 作为 matchid（新格式）
          if (!matchid && scene) {
            matchid = scene
            console.log('使用原始scene作为matchid:', matchid)
          }
        }
      }
      
      // 支持 id 和 matchid 两种参数名
      const matchId = id || matchid
      if (!matchId) {
        console.error('缺少比赛ID参数:', { id, matchid, scene, router: router?.params })
        Taro.showToast({
          title: '参数错误',
          icon: 'none'
        })
        setTimeout(() => {
          safeNavigateBack('/pages/matches/list')
        }, 1500)
        return
      }

      // 如果没有 clubid，尝试从全局存储获取
      // 如果还是没有，readMatch API 会通过 matchid 自动查询 clubid
      let targetClubid = clubid || getGlobalData('selectedClubId')
      
      // 保存 matchId 到 state
      this.setState({ matchId: matchId })

      // 调用 API，即使 clubid 为 null 也可以（API 会通过 matchid 查询）
      const data = await matchService.read(targetClubid || null, matchId)
      
      // 如果之前没有 clubid，从返回的数据中获取（如果有 games，可以从第一个 game 获取 clubid）
      if (!targetClubid && data.data && data.data.length > 0) {
        // 注意：readMatch 返回的是 games 数组，不包含 match 信息
        // 我们需要通过其他方式获取 clubid，或者让 API 返回
        // 暂时先不处理，因为 API 已经支持 clubid 为 null
      }
      
      // 如果还是没有 clubid，尝试从第一个 game 中获取（如果有）
      if (!targetClubid && data.data && data.data.length > 0 && data.data[0].clubid) {
        targetClubid = data.data[0].clubid
        this.setState({ clubid: targetClubid })
      }
      // matchService.read 返回的是对阵数据数组
      const games = Array.isArray(data.data) ? data.data : []
      
      // 按 order 字段排序（从小到大）
      games.sort((a, b) => {
        const orderA = a.order || 0
        const orderB = b.order || 0
        return orderA - orderB
      })
      
      // 处理玩家头像 URL（服务端已检查并返回 avatarValid，直接使用）
      for (const game of games) {
        for (let i = 1; i <= 4; i++) {
          const player = game[`player${i}`]
          if (player) {
            // 统一处理 avatarUrl 字段（可能返回的是 avatarurl）
            const avatarUrl = player.avatarUrl || player.avatarurl || ''
            player.avatarUrl = avatarUrl || ''
            // 使用服务端返回的 avatarValid，如果没有则默认为 true（向后兼容）
            player.avatarValid = player.avatarValid !== undefined ? player.avatarValid : (avatarUrl ? true : false)
          }
        }
      }
      
      console.log('处理后的 games 数据:', games)
      
      // 提取报名信息
      const enrollment = this.extractEnrollment(games)
      
      // 立即设置state，不等待头像检查完成
      this.setState({
        games: games,
        allGames: games, // 保存原始数据
        enrollment: enrollment,
        loading: false
      }, () => {
        // 如果有筛选条件，应用筛选
        this.applyFilter()
      })
      
      // 如果当前在排名 tab，则加载排名数据
      if (this.state.activeTab === 'ranking') {
        this.loadRanking(matchId)
      }
    } catch (error) {
      console.error('Load match error:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setState({ loading: false })
    }
  }

  // 加载对阵数据（只刷新games，不刷新match信息和用户头像）
  loadGames = async () => {
    const { matchId, clubid, games: currentGames } = this.state
    if (!matchId) {
      console.error('loadGames: matchId 为空')
      return
    }
    
    console.log('开始刷新对阵数据，matchId:', matchId)
    try {
      const targetClubid = clubid || getGlobalData('selectedClubId')
      const data = await matchService.read(targetClubid || null, matchId)
      
      // matchService.read 返回的是对阵数据数组
      const newGames = Array.isArray(data.data) ? data.data : []
      
      // 按 order 字段排序（从小到大）
      newGames.sort((a, b) => {
        const orderA = a.order || 0
        const orderB = b.order || 0
        return orderA - orderB
      })
      
      // 保留现有games中的头像信息（avatarUrl 和 avatarValid），只更新比分等数据
      const updatedGames = newGames.map(newGame => {
        // 查找当前games中对应的game（通过_id或order匹配）
        const existingGame = currentGames.find(g => 
          (g._id && g._id === newGame._id) || 
          (g.order !== undefined && g.order === newGame.order)
        )
        
        if (existingGame) {
          // 保留现有游戏中的头像信息
          const preservedGame = { ...newGame }
          for (let i = 1; i <= 4; i++) {
            const existingPlayer = existingGame[`player${i}`]
            const newPlayer = newGame[`player${i}`]
            if (existingPlayer && newPlayer) {
              // 保留头像相关字段
              preservedGame[`player${i}`] = {
                ...newPlayer,
                avatarUrl: existingPlayer.avatarUrl || newPlayer.avatarUrl || newPlayer.avatarurl || '',
                avatarValid: existingPlayer.avatarValid !== undefined ? existingPlayer.avatarValid : true
              }
            }
          }
          return preservedGame
        }
        
        // 如果没有找到对应的现有游戏，使用新数据（这种情况在首次加载后不应该发生）
        return newGame
      })
      
      console.log('刷新后的 games 数据:', updatedGames)
      
      // 更新allGames和games数据（保留头像信息）
      // 先更新allGames，然后根据过滤条件更新games
      const { filterType, filterPlayerId } = this.state
      let finalGames = updatedGames
      
      // 如果有过滤条件，应用过滤
      if (filterType && filterPlayerId) {
        if (filterType === 'only') {
          // 只看该选手：只显示包含该选手的比赛
          finalGames = updatedGames.filter(game => {
            return game.player1?._id === filterPlayerId ||
                   game.player2?._id === filterPlayerId ||
                   game.player3?._id === filterPlayerId ||
                   game.player4?._id === filterPlayerId
          })
        } else if (filterType === 'exclude') {
          // 不看该选手：不显示包含该选手的比赛
          finalGames = updatedGames.filter(game => {
            return game.player1?._id !== filterPlayerId &&
                   game.player2?._id !== filterPlayerId &&
                   game.player3?._id !== filterPlayerId &&
                   game.player4?._id !== filterPlayerId
          })
        }
      }
      
      // 更新报名信息
      const enrollment = this.extractEnrollment(updatedGames)
      
      this.setState({
        allGames: updatedGames,
        games: finalGames,
        enrollment: enrollment
      })
    } catch (error) {
      console.error('Load games error:', error)
      Taro.showToast({
        title: '刷新对阵数据失败',
        icon: 'none'
      })
    }
  }

  // 加载排名数据（只刷新排名数据，不刷新用户头像）
  loadRanking = async (matchId) => {
    const { ranking: currentRanking } = this.state
    if (!matchId) {
      console.error('loadRanking: matchId 为空')
      return
    }
    
    console.log('开始加载排名数据，matchId:', matchId)
    this.setState({ rankingLoading: true })
    try {
      const data = await matchService.ranking(matchId)
      console.log('排名 API 返回数据:', data)
      const newRanking = Array.isArray(data.data) ? data.data : []
      console.log('解析后的排名数据:', newRanking)
      console.log('排名数据数量:', newRanking.length)
      
      // 保留现有排名数据中的头像信息（avatarUrl 和 avatarValid），只更新排名、积分等数据
      const updatedRanking = newRanking.map(newItem => {
        // 查找当前排名中对应的项（通过 playerId 或 playerIds 匹配）
        const existingItem = currentRanking.find(item => {
          if (newItem.playerId && item.playerId) {
            return item.playerId === newItem.playerId
          }
          if (newItem.playerIds && item.playerIds) {
            // 对于固定搭档模式，比较 playerIds 数组
            const newIds = Array.isArray(newItem.playerIds) ? newItem.playerIds.sort().join(',') : ''
            const existingIds = Array.isArray(item.playerIds) ? item.playerIds.sort().join(',') : ''
            return newIds === existingIds && newIds !== ''
          }
          return false
        })
        
        if (existingItem) {
          // 保留现有项中的头像信息（优先使用服务端返回的 avatarValid）
          const preservedItem = { ...newItem }
          
          // 保留 player 的头像信息
          if (existingItem.player && newItem.player) {
            const avatarUrl = newItem.player.avatarUrl || newItem.player.avatarurl || existingItem.player.avatarUrl || ''
            preservedItem.player = {
              ...newItem.player,
              avatarUrl: avatarUrl,
              // 优先使用服务端返回的 avatarValid，如果没有则使用现有的
              avatarValid: newItem.player.avatarValid !== undefined ? newItem.player.avatarValid : (existingItem.player.avatarValid !== undefined ? existingItem.player.avatarValid : true)
            }
          }
          
          // 保留 player2 的头像信息（固定搭档模式）
          if (existingItem.player2 && newItem.player2) {
            const avatarUrl2 = newItem.player2.avatarUrl || newItem.player2.avatarurl || existingItem.player2.avatarUrl || ''
            preservedItem.player2 = {
              ...newItem.player2,
              avatarUrl: avatarUrl2,
              // 优先使用服务端返回的 avatarValid，如果没有则使用现有的
              avatarValid: newItem.player2.avatarValid !== undefined ? newItem.player2.avatarValid : (existingItem.player2.avatarValid !== undefined ? existingItem.player2.avatarValid : true)
            }
          }
          
          return preservedItem
        }
        
        // 如果没有找到对应的现有项，使用新数据，确保 avatarValid 字段存在
        const processedItem = { ...newItem }
        if (processedItem.player) {
          const avatarUrl = processedItem.player.avatarUrl || processedItem.player.avatarurl || ''
          processedItem.player = {
            ...processedItem.player,
            avatarUrl: avatarUrl,
            avatarValid: processedItem.player.avatarValid !== undefined ? processedItem.player.avatarValid : (avatarUrl && avatarUrl.trim() ? true : false)
          }
        }
        if (processedItem.player2) {
          const avatarUrl2 = processedItem.player2.avatarUrl || processedItem.player2.avatarurl || ''
          processedItem.player2 = {
            ...processedItem.player2,
            avatarUrl: avatarUrl2,
            avatarValid: processedItem.player2.avatarValid !== undefined ? processedItem.player2.avatarValid : (avatarUrl2 && avatarUrl2.trim() ? true : false)
          }
        }
        return processedItem
      })
      
      // 检查是否启用积分排名（如果排名数据中有score字段，则认为启用了积分排名）
      const useScoreRanking = updatedRanking.length > 0 && 
        updatedRanking.some(item => item.score !== undefined)
      
      this.setState({
        ranking: updatedRanking,
        useScoreRanking: useScoreRanking,
        rankingLoading: false
      })
    } catch (error) {
      console.error('Load ranking error:', error)
      this.setState({
        ranking: [],
        useScoreRanking: false,
        rankingLoading: false
      })
      Taro.showToast({
        title: '刷新排名数据失败',
        icon: 'none'
      })
    }
  }

  // 从games数据中提取报名信息
  extractEnrollment = (games) => {
    if (!games || games.length === 0) {
      return []
    }
    
    // 辅助函数：提取player ID
    const getPlayerId = (player) => {
      if (!player) return null
      if (typeof player === 'string') {
        return player
      }
      return player._id || player.id || player
    }
    
    // 判断是否为固定搭档模式（通过第一个game的player1和player2是否成对出现）
    const isFixPairMode = games.some(game => game.player1 && game.player2)
    
    const enrollmentMap = new Map() // 用于去重
    const processedPairs = new Set() // 已处理的配对
    
    games.forEach(game => {
      if (isFixPairMode) {
        // 固定搭档模式：player1和player2是一对，player3和player4是一对
        if (game.player1 && game.player2) {
          const player1Id = getPlayerId(game.player1)
          const player2Id = getPlayerId(game.player2)
          const pairKey1 = [player1Id, player2Id].sort().join('_')
          if (!processedPairs.has(pairKey1)) {
            processedPairs.add(pairKey1)
            enrollmentMap.set(pairKey1, {
              player1: game.player1,
              player2: game.player2,
              index: enrollmentMap.size + 1
            })
          }
        }
        if (game.player3 && game.player4) {
          const player3Id = getPlayerId(game.player3)
          const player4Id = getPlayerId(game.player4)
          const pairKey2 = [player3Id, player4Id].sort().join('_')
          if (!processedPairs.has(pairKey2)) {
            processedPairs.add(pairKey2)
            enrollmentMap.set(pairKey2, {
              player1: game.player3,
              player2: game.player4,
              index: enrollmentMap.size + 1
            })
          }
        }
      } else {
        // 非固定搭档模式：每个选手单独显示
        const players = [game.player1, game.player2, game.player3, game.player4].filter(Boolean)
        players.forEach(player => {
          const playerId = getPlayerId(player)
          if (playerId && !enrollmentMap.has(playerId)) {
            enrollmentMap.set(playerId, {
              player1: player,
              player2: null,
              index: enrollmentMap.size + 1
            })
          }
        })
      }
    })
    
    return Array.from(enrollmentMap.values())
  }

  // 分享比赛按钮点击处理
  handleShareMatch = () => {
    // 使用 openType='share' 的按钮会自动触发分享
    // 这里可以添加一些提示或日志
    console.log('分享比赛', this.state.matchId)
  }

  // 小程序分享功能（当用户点击分享按钮或右上角分享菜单时触发）
  onShareAppMessage = (res) => {
    const { matchId, clubid } = this.state
    
    if (!matchId) {
      return {
        title: '比赛详情',
        path: '/pages/matches/list'
      }
    }
    
    // 构建分享路径，包含比赛ID和clubid（如果有）
    let sharePath = `/pages/matches/detail?id=${matchId}`
    if (clubid) {
      sharePath += `&clubid=${clubid}`
    }
    
    // 获取比赛名称（如果有）
    const matchName = this.getMatchName()
    
    return {
      title: matchName || '比赛详情',
      path: sharePath,
      imageUrl: '' // 可以设置分享图片
    }
  }

  // 获取比赛名称（用于分享标题）
  getMatchName = () => {
    // 可以从 games 数据中推断比赛信息，或者从其他来源获取
    // 这里暂时返回默认值
    return '比赛详情'
  }

  // 切换 Tab
  handleTabChange = (tab) => {
    const { matchId, allGames } = this.state
    
    // 如果切换到相同的tab，不处理
    if (tab === this.state.activeTab) {
      return
    }
    
    this.setState({ activeTab: tab })
    
    // 根据切换的tab刷新对应的数据
    if (tab === 'enrollment') {
      // 切换到报名tab，从allGames提取报名信息
      const enrollment = this.extractEnrollment(allGames)
      this.setState({ enrollment })
    } else if (tab === 'games') {
      // 切换到对阵tab，刷新对阵数据
      this.loadGames()
    } else if (tab === 'ranking') {
      // 切换到排名tab，刷新排名数据
      this.loadRanking(matchId)
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
      const updatedAllGames = prevState.allGames.map(game => {
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
      return { games: updatedGames, allGames: updatedAllGames }
    })
  }

  // 长按头像显示菜单
  handleAvatarLongPress = (e, playerId, playerName) => {
    e.stopPropagation()
    // 获取触摸位置
    const touch = e.touches && e.touches[0] || e.changedTouches && e.changedTouches[0]
    if (touch) {
      this.setState({
        menuShow: true,
        menuPlayerId: playerId,
        menuPlayerName: playerName,
        menuPosition: { x: touch.clientX, y: touch.clientY }
      })
    } else {
      this.setState({
        menuShow: true,
        menuPlayerId: playerId,
        menuPlayerName: playerName,
        menuPosition: { x: 0, y: 0 }
      })
    }
  }

  // 关闭菜单
  handleMenuClose = () => {
    this.setState({
      menuShow: false,
      menuPlayerId: null,
      menuPlayerName: null
    })
  }

  // 只看该选手
  handleFilterOnly = () => {
    const { menuPlayerId, menuPlayerName } = this.state
    this.setState({
      filterType: 'only',
      filterPlayerId: menuPlayerId,
      filterPlayerName: menuPlayerName,
      menuShow: false
    }, () => {
      this.applyFilter()
    })
  }

  // 不看该选手
  handleFilterExclude = () => {
    const { menuPlayerId, menuPlayerName } = this.state
    this.setState({
      filterType: 'exclude',
      filterPlayerId: menuPlayerId,
      filterPlayerName: menuPlayerName,
      menuShow: false
    }, () => {
      this.applyFilter()
    })
  }

  // 清除筛选
  handleClearFilter = () => {
    this.setState({
      filterType: null,
      filterPlayerId: null,
      filterPlayerName: null
    }, () => {
      this.applyFilter()
    })
  }

  // 应用筛选
  applyFilter = () => {
    const { allGames, filterType, filterPlayerId } = this.state
    if (!filterType || !filterPlayerId) {
      // 没有筛选条件，显示所有数据
      this.setState({ games: allGames })
      return
    }

    let filteredGames = []
    if (filterType === 'only') {
      // 只看该选手：只显示包含该选手的比赛
      filteredGames = allGames.filter(game => {
        return game.player1?._id === filterPlayerId ||
               game.player2?._id === filterPlayerId ||
               game.player3?._id === filterPlayerId ||
               game.player4?._id === filterPlayerId
      })
    } else if (filterType === 'exclude') {
      // 不看该选手：不显示包含该选手的比赛
      filteredGames = allGames.filter(game => {
        return game.player1?._id !== filterPlayerId &&
               game.player2?._id !== filterPlayerId &&
               game.player3?._id !== filterPlayerId &&
               game.player4?._id !== filterPlayerId
      })
    }

    this.setState({ games: filteredGames })
  }

  // 查看个人详情
  handleViewPlayerDetail = () => {
    const { menuPlayerId } = this.state
    this.handleMenuClose()
    if (menuPlayerId) {
      Taro.navigateTo({
        url: `/pages/users/detail?id=${menuPlayerId}`
      })
    }
  }

  // 点击 VS 或比分，打开比分输入对话框
  handleScoreClick = (game, index) => {
    // 如果比分是0，不显示0，显示为空
    const score1 = game.score1 >= 0 ? game.score1 : -1
    const score2 = game.score2 >= 0 ? game.score2 : -1
    
    this.setState({
      scoreDialogShow: true,
      scoreDialogIndex: index,
      tempScore1: score1 > 0 ? String(score1) : '',
      tempScore2: score2 > 0 ? String(score2) : ''
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

    // 空字符串转换为0，否则解析为整数
    const score1 = tempScore1 === '' ? 0 : parseInt(tempScore1)
    const score2 = tempScore2 === '' ? 0 : parseInt(tempScore2)

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
      
      // 获取 clubid，优先使用 state 中的，如果没有则从 game 数据中获取
      const actualClubid = clubid || game.clubid || game.clubId || null
      
      // 准备游戏数据
      const gamedata = {
        _id: game._id,
        matchid: game.matchId || game.matchid,
        score1: score1,
        score2: score2
      }

      // 调用 API 保存比分
      await gameService.save(actualClubid, gamedata, openid)

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
        
        this.setState({ 
          games: updatedGames,
          allGames: updatedGames // 同时更新原始数据
        }, () => {
          // 如果有筛选条件，重新应用筛选
          this.applyFilter()
        })
        
        // 如果当前在排名 tab，重新加载排名
        if (this.state.activeTab === 'ranking') {
          this.loadRanking(matchId)
        }
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
        {/* Tab 页签 */}
        <View className='tab-container'>
          <View 
            className={`tab-item ${this.state.activeTab === 'enrollment' ? 'active' : ''}`}
            onClick={() => this.handleTabChange('enrollment')}
          >
            <Text className={`tab-text ${this.state.activeTab === 'enrollment' ? 'active' : ''}`}>
              报名情况
            </Text>
          </View>
          <View 
            className={`tab-item ${this.state.activeTab === 'games' ? 'active' : ''}`}
            onClick={() => this.handleTabChange('games')}
          >
            <Text className={`tab-text ${this.state.activeTab === 'games' ? 'active' : ''}`}>
              对阵
            </Text>
          </View>
          <View 
            className={`tab-item ${this.state.activeTab === 'ranking' ? 'active' : ''}`}
            onClick={() => this.handleTabChange('ranking')}
          >
            <Text className={`tab-text ${this.state.activeTab === 'ranking' ? 'active' : ''}`}>
              排名
            </Text>
          </View>
        </View>
        
        {/* 比赛进度 - 仅在对阵界面显示 */}
        {this.state.activeTab === 'games' && (
          <View className='match-progress-section'>
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
        )}
        
        {/* 报名情况内容 */}
        {this.state.activeTab === 'enrollment' && (
          <View className='enrollment-section'>
            <View className='enrollment-header'>
              <Text className='enrollment-title'>报名名单</Text>
              <View className='enrollment-status'>
                <Text className='enrollment-count'>{this.state.enrollment.length}</Text>
                <Text className='enrollment-total'>/ {this.state.enrollment.length}</Text>
              </View>
            </View>
            {this.state.enrollment && this.state.enrollment.length > 0 ? (
              <View className='enrollment-list'>
                {this.state.enrollment.map((item, index) => (
                  <View key={index} className='enrollment-item'>
                    <View className='enrollment-number'>
                      <Text className='enrollment-number-text'>{item.index}</Text>
                    </View>
                    <View className='enrollment-players'>
                      {/* 第一个选手 */}
                      <View className='enrollment-player'>
                        {item.player1?.avatarValid && item.player1?.avatarUrl && item.player1.avatarUrl.trim() !== '' ? (
                          <Image 
                            className='enrollment-player-avatar'
                            src={item.player1.avatarUrl}
                            mode='aspectFill'
                          />
                        ) : (
                          <View
                            className='enrollment-player-avatar-text'
                            style={{ backgroundColor: generateAvatarColor(item.player1?.name || '') }}
                          >
                            <Text className='enrollment-player-avatar-text-content'>
                              {getAvatarText(item.player1?.name || '')}
                            </Text>
                          </View>
                        )}
                        {item.player1?.gender !== undefined && (
                          <View className={`enrollment-gender-badge ${item.player1.gender === 1 ? 'male' : 'female'}`}>
                            <Text className='enrollment-gender-icon'>{item.player1.gender === 1 ? '♂' : '♀'}</Text>
                          </View>
                        )}
                        <Text className='enrollment-player-name'>{item.player1?.name || '未知'}</Text>
                      </View>
                      {/* 固定搭档模式：显示第二个选手 */}
                      {item.player2 && (
                        <>
                          <Text className='enrollment-pair-separator'>+</Text>
                          <View className='enrollment-player'>
                            {item.player2?.avatarValid && item.player2?.avatarUrl && item.player2.avatarUrl.trim() !== '' ? (
                              <Image 
                                className='enrollment-player-avatar'
                                src={item.player2.avatarUrl}
                                mode='aspectFill'
                              />
                            ) : (
                              <View
                                className='enrollment-player-avatar-text'
                                style={{ backgroundColor: generateAvatarColor(item.player2?.name || '') }}
                              >
                                <Text className='enrollment-player-avatar-text-content'>
                                  {getAvatarText(item.player2?.name || '')}
                                </Text>
                              </View>
                            )}
                            {item.player2?.gender !== undefined && (
                              <View className={`enrollment-gender-badge ${item.player2.gender === 1 ? 'male' : 'female'}`}>
                                <Text className='enrollment-gender-icon'>{item.player2.gender === 1 ? '♂' : '♀'}</Text>
                              </View>
                            )}
                            <Text className='enrollment-player-name'>{item.player2?.name || '未知'}</Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className='enrollment-empty'>
                <Text className='enrollment-empty-text'>暂无报名信息</Text>
              </View>
            )}
          </View>
        )}
        
        {/* 分享按钮 - 固定在底部，仅在报名情况界面显示 */}
        {this.state.activeTab === 'enrollment' && (
          <View className='enrollment-share-container-fixed'>
            <Button 
              className='enrollment-share-button'
              openType='share'
              onClick={this.handleShareMatch}
            >
              分享比赛
            </Button>
          </View>
        )}
        
        {/* 对阵内容 */}
        {this.state.activeTab === 'games' && (
          <View className={`games-list ${this.state.filterType ? 'has-filter' : ''}`}>
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
                          onLongPress={(e) => game.player1?._id && this.handleAvatarLongPress(e, game.player1._id, game.player1.name)}
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
                          onLongPress={(e) => game.player1?._id && this.handleAvatarLongPress(e, game.player1._id, game.player1.name)}
                        >
                          <Text className='game-player-avatar-text-content'>
                            {getAvatarText(game.player1?.name || '')}
                          </Text>
                        </View>
                      )}
                      <View className='game-player-name'>
                        <View className='game-player-name-wrapper'>
                          <Text className='game-player-name-text'>
                            {game.player1?.name || '未知'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className='game-team-divider' />
                    <View className='game-player-row'>
                      {game.player2?.avatarValid && game.player2?.avatarUrl ? (
                        <Image 
                          className='game-player-avatar'
                          src={game.player2.avatarUrl}
                          mode='aspectFill'
                          onLongPress={(e) => game.player2?._id && this.handleAvatarLongPress(e, game.player2._id, game.player2.name)}
                          onError={() => {
                            console.error('玩家2头像加载失败:', game.player2?.avatarUrl)
                            this.handleAvatarError(game._id, 2)
                          }}
                        />
                      ) : (
                        <View 
                          className='game-player-avatar-text'
                          style={{ backgroundColor: generateAvatarColor(game.player2?.name || '') }}
                          onLongPress={(e) => game.player2?._id && this.handleAvatarLongPress(e, game.player2._id, game.player2.name)}
                        >
                          <Text className='game-player-avatar-text-content'>
                            {getAvatarText(game.player2?.name || '')}
                          </Text>
                        </View>
                      )}
                      <View className='game-player-name'>
                        <View className='game-player-name-wrapper'>
                          <Text className='game-player-name-text'>
                            {game.player2?.name || '未知'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  {/* 中间比分 */}
                  <View className='game-score-section'>
                    {isFinished ? (
                      <View 
                        className='game-score-display game-score-clickable'
                        onLongPress={() => this.handleScoreClick(game, index)}
                      >
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
                          onLongPress={(e) => game.player3?._id && this.handleAvatarLongPress(e, game.player3._id, game.player3.name)}
                          onError={() => {
                            console.error('玩家3头像加载失败:', game.player3?.avatarUrl)
                            this.handleAvatarError(game._id, 3)
                          }}
                        />
                      ) : (
                        <View 
                          className='game-player-avatar-text'
                          style={{ backgroundColor: generateAvatarColor(game.player3?.name || '') }}
                          onLongPress={(e) => game.player3?._id && this.handleAvatarLongPress(e, game.player3._id, game.player3.name)}
                        >
                          <Text className='game-player-avatar-text-content'>
                            {getAvatarText(game.player3?.name || '')}
                          </Text>
                        </View>
                      )}
                      <View className='game-player-name'>
                        <View className='game-player-name-wrapper'>
                          <Text className='game-player-name-text'>
                            {game.player3?.name || '未知'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View className='game-team-divider' />
                    <View className='game-player-row'>
                      {game.player4?.avatarValid && game.player4?.avatarUrl ? (
                        <Image 
                          className='game-player-avatar'
                          src={game.player4.avatarUrl}
                          mode='aspectFill'
                          onLongPress={(e) => game.player4?._id && this.handleAvatarLongPress(e, game.player4._id, game.player4.name)}
                          onError={() => {
                            console.error('玩家4头像加载失败:', game.player4?.avatarUrl)
                            this.handleAvatarError(game._id, 4)
                          }}
                        />
                      ) : (
                        <View 
                          className='game-player-avatar-text'
                          style={{ backgroundColor: generateAvatarColor(game.player4?.name || '') }}
                          onLongPress={(e) => game.player4?._id && this.handleAvatarLongPress(e, game.player4._id, game.player4.name)}
                        >
                          <Text className='game-player-avatar-text-content'>
                            {getAvatarText(game.player4?.name || '')}
                          </Text>
                        </View>
                      )}
                      <View className='game-player-name'>
                        <View className='game-player-name-wrapper'>
                          <Text className='game-player-name-text'>
                            {game.player4?.name || '未知'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
          </View>
        )}
        
        {/* 排名内容 */}
        {this.state.activeTab === 'ranking' && (
          <View className={`ranking-section ${this.state.filterType ? 'has-filter' : ''}`}>
            {this.state.rankingLoading ? (
              <View className='ranking-loading'>加载排名中...</View>
            ) : this.state.ranking && this.state.ranking.length > 0 ? (
              <View className='ranking-list'>
                {this.state.ranking.map((item, index) => {
                  const isPairMode = (item.playerIds && item.playerIds.length > 1) || item.player2
                  
                  return (
                    <View key={item.playerId} className={`ranking-item ${isPairMode ? 'ranking-item-pair' : ''}`}>
                      <View className='ranking-rank'>
                        <Text className={`ranking-rank-text ${item.rank === 1 ? 'rank-gold' : item.rank === 2 ? 'rank-silver' : item.rank === 3 ? 'rank-bronze' : ''}`}>
                          {item.rank}
                        </Text>
                      </View>
                      <View className='ranking-player-container'>
                        {isPairMode ? (
                          // 固定搭档模式：显示配对信息（上下分行排列）
                          <View className='ranking-pair'>
                            <View className='ranking-pair-players'>
                              <View className='ranking-pair-player'>
                                {item.player?.avatarValid && item.player?.avatarUrl && item.player.avatarUrl.trim() !== '' ? (
                                  <Image 
                                    className='ranking-player-avatar'
                                    src={item.player.avatarUrl}
                                    mode='aspectFill'
                                  />
                                ) : (
                                  <View
                                    className='ranking-player-avatar-text'
                                    style={{ backgroundColor: generateAvatarColor(item.player?.name || '') }}
                                  >
                                    <Text className='ranking-player-avatar-text-content'>
                                      {getAvatarText(item.player?.name || '')}
                                    </Text>
                                  </View>
                                )}
                                <Text className='ranking-player-name'>{item.player?.name || '未知'}</Text>
                              </View>
                              <View className='ranking-pair-player'>
                                {item.player2?.avatarValid && item.player2?.avatarUrl && item.player2.avatarUrl.trim() !== '' ? (
                                  <Image 
                                    className='ranking-player-avatar'
                                    src={item.player2.avatarUrl}
                                    mode='aspectFill'
                                  />
                                ) : (
                                  <View
                                    className='ranking-player-avatar-text'
                                    style={{ backgroundColor: generateAvatarColor(item.player2?.name || '') }}
                                  >
                                    <Text className='ranking-player-avatar-text-content'>
                                      {getAvatarText(item.player2?.name || '')}
                                    </Text>
                                  </View>
                                )}
                                <Text className='ranking-player-name'>{item.player2?.name || '未知'}</Text>
                              </View>
                            </View>
                          </View>
                        ) : (
                          // 非固定搭档模式：显示单个选手
                          <View className='ranking-player'>
                            {item.player?.avatarValid && item.player?.avatarUrl && item.player.avatarUrl.trim() !== '' ? (
                              <Image 
                                className='ranking-player-avatar'
                                src={item.player.avatarUrl}
                                mode='aspectFill'
                              />
                            ) : (
                              <View
                                className='ranking-player-avatar-text'
                                style={{ backgroundColor: generateAvatarColor(item.player?.name || '') }}
                              >
                                <Text className='ranking-player-avatar-text-content'>
                                  {getAvatarText(item.player?.name || '')}
                                </Text>
                              </View>
                            )}
                            <Text className='ranking-player-name'>{item.player?.name || '未知'}</Text>
                          </View>
                        )}
                      </View>
                      <View className='ranking-stats'>
                        <View className='ranking-stat-item'>
                          <Text className='ranking-stat-label'>胜负</Text>
                          <Text className='ranking-stat-value wins-losses'>{item.wins}-{item.losses}</Text>
                        </View>
                        {/* 如果启用积分排名，显示积分相关字段；否则显示胜率 */}
                        {this.state.useScoreRanking ? (
                          <>
                            <View className='ranking-stat-item'>
                              <Text className='ranking-stat-label'>总积分</Text>
                              <Text className='ranking-stat-value score'>{item.score || 0}</Text>
                            </View>
                            <View className='ranking-stat-item'>
                              <Text className='ranking-stat-label'>局胜分</Text>
                              <Text className='ranking-stat-value base-score'>{item.baseScore || 0}</Text>
                            </View>
                            <View className='ranking-stat-item'>
                              <Text className='ranking-stat-label'>奖励分</Text>
                              <Text className='ranking-stat-value reward-score'>{item.rewardScore || 0}</Text>
                            </View>
                          </>
                        ) : (
                          <View className='ranking-stat-item'>
                            <Text className='ranking-stat-label'>胜率</Text>
                            <Text className='ranking-stat-value win-rate'>{item.winRate}%</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )
                })}
              </View>
            ) : (
              <View className='ranking-empty'>暂无排名数据</View>
            )}
          </View>
        )}

        {/* 比分输入对话框 */}
        {this.state.scoreDialogShow && (
          <View className='score-dialog-mask' onClick={this.handleScoreDialogClose}>
            <View className='score-dialog' onClick={(e) => e.stopPropagation()}>
              <View className='score-dialog-header'>
                <Text className='score-dialog-title'>
                  {this.state.scoreDialogIndex >= 0 && this.state.games[this.state.scoreDialogIndex] && 
                   this.state.games[this.state.scoreDialogIndex].score1 >= 0 && 
                   this.state.games[this.state.scoreDialogIndex].score2 >= 0
                    ? '修改比分' : '输入比分'}
                </Text>
              </View>
              
              <View className='score-dialog-content'>
                <View className='score-input-row'>
                  <Input
                    className='score-input'
                    type='number'
                    placeholder=''
                    value={this.state.tempScore1}
                    onInput={this.handleScore1Input}
                    focus
                  />
                  <Text className='score-separator'>:</Text>
                  <Input
                    className='score-input'
                    type='number'
                    placeholder=''
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

        {/* 弹出菜单 */}
        {this.state.menuShow && (
          <View className='player-menu-mask' onClick={this.handleMenuClose}>
            <View className='player-menu' onClick={(e) => e.stopPropagation()}>
              <View className='player-menu-header'>
                <Text className='player-menu-title'>{this.state.menuPlayerName}</Text>
              </View>
              <View className='player-menu-item' onClick={this.handleFilterOnly}>
                <Text className='player-menu-item-text'>只看该选手</Text>
              </View>
              <View className='player-menu-item' onClick={this.handleFilterExclude}>
                <Text className='player-menu-item-text'>不看该选手</Text>
              </View>
              <View className='player-menu-item' onClick={this.handleViewPlayerDetail}>
                <Text className='player-menu-item-text'>个人详情</Text>
              </View>
              <View className='player-menu-item player-menu-item-cancel' onClick={this.handleMenuClose}>
                <Text className='player-menu-item-text'>取消</Text>
              </View>
            </View>
          </View>
        )}

        {/* 筛选条件显示 */}
        {this.state.filterType && this.state.filterPlayerName && (
          <View className='filter-bar'>
            <View className='filter-content'>
              <Text className='filter-text'>
                {this.state.filterType === 'only' ? '只看' : '不看'}：{this.state.filterPlayerName}
              </Text>
              <View className='filter-clear' onClick={this.handleClearFilter}>
                <Text className='filter-clear-text'>清除</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }
}
