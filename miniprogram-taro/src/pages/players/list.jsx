import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getGlobalData } from '../../utils'
import './list.scss'

export default class PlayerList extends Component {
  state = {
    players: [],
    loading: false,
    openid: null
  }

  componentDidMount() {
    const openid = getGlobalData('openid')
    if (!openid) {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
      return
    }
    
    this.setState({ openid })
    this.loadPlayers()
  }

  loadPlayers = async () => {
    this.setState({ loading: true })
    try {
      // TODO: 实现玩家列表加载逻辑
      this.setState({
        players: []
      })
    } catch (error) {
      console.error('Load players error:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  handlePlayerClick = (player) => {
    Taro.navigateTo({
      url: `/pages/players/detail?id=${player._id}`
    })
  }

  render() {
    const { players, loading } = this.state

    return (
      <View className='player-list-page'>
        <View className='header'>
          <Text className='title'>玩家</Text>
        </View>
        
        {loading ? (
          <View className='loading'>加载中...</View>
        ) : (
          <View className='player-list'>
            {players.length === 0 ? (
              <View className='empty'>暂无玩家</View>
            ) : (
              players.map(player => (
                <View 
                  key={player._id} 
                  className='player-item'
                  onClick={() => this.handlePlayerClick(player)}
                >
                  <Text className='player-name'>{player.name || '未知玩家'}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    )
  }
}
