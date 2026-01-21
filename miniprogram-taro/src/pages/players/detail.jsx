import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getGlobalData } from '../../utils'
import './detail.scss'

export default class PlayerDetail extends Component {
  state = {
    player: null,
    loading: true
  }

  componentDidMount() {
    const openid = getGlobalData('openid')
    if (!openid) {
      Taro.redirectTo({
        url: '/pages/login/index'
      })
      return
    }

    this.loadPlayer()
  }

  loadPlayer = async () => {
    try {
      const router = Taro.getCurrentInstance().router
      const { id } = router?.params || {}
      if (!id) {
        Taro.showToast({
          title: '参数错误',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
        return
      }

      // TODO: 实现玩家详情加载逻辑
      this.setState({
        player: null,
        loading: false
      })
    } catch (error) {
      console.error('Load player error:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setState({ loading: false })
    }
  }

  render() {
    const { player, loading } = this.state

    if (loading) {
      return (
        <View className='player-detail-page'>
          <View className='loading'>加载中...</View>
        </View>
      )
    }

    if (!player) {
      return (
        <View className='player-detail-page'>
          <View className='empty'>玩家不存在</View>
        </View>
      )
    }

    return (
      <View className='player-detail-page'>
        <View className='player-info'>
          <Text className='player-name'>{player.name || '未知玩家'}</Text>
        </View>
      </View>
    )
  }
}
