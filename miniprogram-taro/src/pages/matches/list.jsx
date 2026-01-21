import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { matchService } from '../../services/api'
import { getGlobalData } from '../../utils'
import './list.scss'

export default class MatchList extends Component {
  state = {
    matches: [],
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
    this.loadMatches()
  }

  loadMatches = async () => {
    this.setState({ loading: true })
    try {
      const { openid } = this.state
      const data = await matchService.list(openid, null, 1, 20)
      this.setState({
        matches: data.data?.list || []
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
    Taro.navigateTo({
      url: `/pages/matches/detail?id=${match._id}`
    })
  }

  render() {
    const { matches, loading } = this.state

    return (
      <View className='match-list-page'>
        <View className='header'>
          <Text className='title'>比赛</Text>
        </View>
        
        {loading ? (
          <View className='loading'>加载中...</View>
        ) : (
          <View className='match-list'>
            {matches.length === 0 ? (
              <View className='empty'>暂无比赛</View>
            ) : (
              matches.map(match => (
                <View 
                  key={match._id} 
                  className='match-item'
                  onClick={() => this.handleMatchClick(match)}
                >
                  <Text className='match-info'>比赛 #{match._id}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    )
  }
}
