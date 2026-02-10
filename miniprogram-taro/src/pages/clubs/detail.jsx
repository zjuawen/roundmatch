import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { clubService } from '../../services/api'
import { getGlobalData, saveGlobalData, clearGlobalData } from '../../utils'
import './detail.scss'

export default class ClubDetail extends Component {
  state = {
    club: null,
    loading: true
  }

  componentDidMount() {
    this.checkAndLogin()
  }

  // 检查并尝试静默登录
  checkAndLogin = async () => {
    let openid = getGlobalData('openid')
    
    // 如果没有 openid，尝试静默登录
    if (!openid) {
      this.setState({ loading: true })
      try {
        const { silentLogin } = await import('../../utils')
        openid = await silentLogin()
        
        if (!openid) {
          // 静默登录失败，跳转到登录页面（需要用户授权）
          const router = Taro.getCurrentInstance().router
          const { id: clubid, clubid: clubidParam } = router?.params || {}
          const targetClubid = clubid || clubidParam
          const returnUrl = targetClubid 
            ? `/pages/clubs/detail?clubid=${targetClubid}`
            : '/pages/clubs/detail'
          Taro.redirectTo({
            url: '/pages/login/index?returnUrl=' + encodeURIComponent(returnUrl)
          })
          return
        }
      } catch (error) {
        console.error('Check and login error:', error)
        Taro.redirectTo({
          url: '/pages/login/index'
        })
        return
      }
    }

    // 修改 tabBar 为比赛和个人中心
    this.updateTabBar()
    this.loadClub()
  }

  componentWillUnmount() {
    // 恢复默认的 tabBar
    this.restoreTabBar()
  }

  // 更新 tabBar 为比赛和个人中心
  updateTabBar = () => {
    try {
      // 修改第一个 tab（索引 0）为比赛列表
      // 注意：pagePath 不能修改，所以这里只修改文本和图标
      Taro.setTabBarItem({
        index: 0,
        text: '比赛',
        iconPath: 'assets/images/match-list.png',
        selectedIconPath: 'assets/images/match-list-selected.png'
      })
      // 修改第二个 tab（索引 1）为个人中心
      // 注意：需要将 pagePath 改为个人中心页面，但 setTabBarItem 不支持修改 pagePath
      // 所以我们需要在 app.config.js 中配置，或者使用其他方式
      // 这里先修改文本和图标
      Taro.setTabBarItem({
        index: 1,
        text: '个人中心',
        iconPath: 'assets/images/match-list.png', // 使用默认图标，后续可以替换
        selectedIconPath: 'assets/images/match-list-selected.png'
      })
      
      // 由于无法修改 pagePath，我们需要在 app.config.js 中配置 tabBar
      // 或者在 app.js 中处理 tabBar 切换事件
      // 这里先保存一个标记，表示当前在俱乐部详情页
      saveGlobalData('inClubDetail', true)
    } catch (error) {
      console.error('更新 tabBar 失败:', error)
    }
  }

  // 恢复默认的 tabBar
  restoreTabBar = () => {
    try {
      // 恢复第一个 tab 为俱乐部
      Taro.setTabBarItem({
        index: 0,
        text: '俱乐部',
        iconPath: 'assets/images/match-list.png',
        selectedIconPath: 'assets/images/match-list-selected.png'
      })
      // 恢复第二个 tab 为比赛
      Taro.setTabBarItem({
        index: 1,
        text: '比赛',
        iconPath: 'assets/images/match-list.png',
        selectedIconPath: 'assets/images/match-list-selected.png'
      })
      
      // 清除标记
      clearGlobalData('inClubDetail')
    } catch (error) {
      console.error('恢复 tabBar 失败:', error)
    }
  }

  loadClub = async () => {
    try {
      const router = Taro.getCurrentInstance().router
      const { id: clubid, clubid: clubidParam } = router?.params || {}
      const targetClubid = clubid || clubidParam
      
      if (!targetClubid) {
        Taro.showToast({
          title: '参数错误',
          icon: 'none'
        })
        setTimeout(() => {
          Taro.navigateBack()
        }, 1500)
        return
      }

      // 保存 clubid 到全局存储，以便 tabBar 跳转时使用
      saveGlobalData('selectedClubId', targetClubid)

      const data = await clubService.info(targetClubid)
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
