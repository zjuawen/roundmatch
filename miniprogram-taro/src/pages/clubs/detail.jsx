import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { clubService } from '../../services/api'
import { getGlobalData } from '../../utils'
import './detail.scss'

export default class ClubDetail extends Component {
  state = {
    club: null,
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

    this.loadClub()
  }

  loadClub = async () => {
    try {
      const router = Taro.getCurrentInstance().router
      const { id: clubid } = router?.params || {}
      if (!clubid) {
        Taro.showToast({
          title: '参数错误',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
        return
      }

      const data = await clubService.info(clubid)
      this.setState({
        club: data.data,
        loading: false
      })
    } catch (error) {
      console.error('Load club error:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setState({ loading: false })
    }
  }

  render() {
    const { club, loading } = this.state

    if (loading) {
      return (
        <View className='club-detail-page'>
          <View className='loading'>加载中...</View>
        </View>
      )
    }

    if (!club) {
      return (
        <View className='club-detail-page'>
          <View className='empty'>俱乐部不存在</View>
        </View>
      )
    }

    return (
      <View className='club-detail-page'>
        <View className='club-info'>
          <Text className='club-name'>{club.wholeName}</Text>
          {club.shortName && (
            <Text className='club-short-name'>{club.shortName}</Text>
          )}
        </View>
      </View>
    )
  }
}
