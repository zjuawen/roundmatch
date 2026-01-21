import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { matchService } from '../../services/api'
import { getGlobalData } from '../../utils'
import './detail.scss'

export default class MatchDetail extends Component {
  state = {
    match: null,
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

    this.loadMatch()
  }

  loadMatch = async () => {
    try {
      const router = Taro.getCurrentInstance().router
      const { clubid, id } = router?.params || {}
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

      const data = await matchService.read(clubid, id)
      this.setState({
        match: data.data,
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

  render() {
    const { match, loading } = this.state

    if (loading) {
      return (
        <View className='match-detail-page'>
          <View className='loading'>加载中...</View>
        </View>
      )
    }

    if (!match) {
      return (
        <View className='match-detail-page'>
          <View className='empty'>比赛不存在</View>
        </View>
      )
    }

    return (
      <View className='match-detail-page'>
        <View className='match-info'>
          <Text className='match-id'>比赛 #{match._id}</Text>
        </View>
      </View>
    )
  }
}
