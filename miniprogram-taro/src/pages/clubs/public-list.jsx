import { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { clubService } from '../../services/api'
import { getGlobalData } from '../../utils'
import './public-list.scss'

export default class PublicClubList extends Component {
  state = {
    clubs: [],
    loading: false,
    currentProvince: null
  }

  componentDidMount() {
    this.loadPublicClubs()
  }

  componentDidShow() {
    // 页面显示时重新加载，以便获取最新的俱乐部列表
    this.loadPublicClubs()
  }

  // 加载公开俱乐部列表
  loadPublicClubs = async () => {
    this.setState({ loading: true })
    try {
      // 获取用户信息中的省份
      let province = null
      const userInfo = getGlobalData('userInfo')
      if (userInfo && userInfo.province) {
        province = userInfo.province
      }

      // 如果没有省份，尝试获取定位
      if (!province) {
        try {
          await Taro.getLocation({
            type: 'gcj02'
          })
          // 注意：小程序需要用户授权才能获取定位
          // 这里先使用用户信息中的省份，如果获取定位失败则显示所有公开俱乐部
        } catch (locationError) {
          console.log('获取定位失败:', locationError)
        }
      }

      this.setState({ currentProvince: province })
      
      console.log('加载公开俱乐部列表，省份:', province)
      const data = await clubService.listPublic(province)
      console.log('公开俱乐部列表数据:', data)
      
      // 处理返回的数据，统一字段名为驼峰命名
      const clubs = (data.data || []).map(club => ({
        _id: club._id,
        wholeName: club.wholename || club.wholeName,
        shortName: club.shortname || club.shortName,
        logo: club.logo,
        password: club.password,
        vip: club.vip,
        creator: club.creator,
        delete: club.delete,
        public: club.public,
        maxMatchAllow: club.maxmatchallow || club.maxMatchAllow,
        createDate: club.createdate || club.createDate,
        updateTime: club.updatetime || club.updateTime,
        owner: club.owner,
        locked: club.locked
      }))
      
      console.log('处理后的公开俱乐部列表:', clubs)
      this.setState({
        clubs
      })
    } catch (error) {
      console.error('Load public clubs error:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  handleClubClick = (club) => {
    // 跳转到俱乐部详情页加入俱乐部
    Taro.navigateTo({
      url: `/pages/clubs/detail?clubid=${club._id}`
    })
  }

  render() {
    const { clubs, loading, currentProvince } = this.state

    return (
      <View className='public-club-list-page'>
        <View className='page-header'>
          <Text className='page-title'>
            公开俱乐部{currentProvince ? `（${currentProvince}）` : ''}
          </Text>
        </View>

        <View className='page-body'>
          {loading ? (
            <View className='loading'>加载中...</View>
          ) : clubs.length === 0 ? (
            <View className='empty'>
              {currentProvince 
                ? `暂无${currentProvince}的公开俱乐部`
                : '暂无公开俱乐部'}
            </View>
          ) : (
            <View className='clubs-section'>
              <View className='club-list'>
                {clubs.map((club, index) => (
                  <View 
                    key={club._id} 
                    className='club-item'
                    onClick={() => this.handleClubClick(club)}
                  >
                    <View className='club-content'>
                      <View className='club-avatar-wrapper'>
                        <Image 
                          className='club-avatar' 
                          src={club.logo || '/assets/images/default-club-logo.svg'}
                          mode='aspectFit'
                          onError={(e) => {
                            console.error('俱乐部 Logo 加载失败:', club.logo, e)
                            const updatedClubs = this.state.clubs.map((c, idx) => 
                              idx === index 
                                ? { ...c, logo: '/assets/images/default-club-logo.svg' }
                                : c
                            )
                            this.setState({ clubs: updatedClubs })
                          }}
                        />
                        {(club.vip === 1 || club.vip === true || club.vip === '1') && (
                          <Image 
                            className='vip-icon' 
                            src='/assets/images/vip.svg'
                            mode='aspectFit'
                          />
                        )}
                      </View>
                      <View className='club-info'>
                        <Text className='club-name'>{club.wholeName}</Text>
                        <Text className='club-shortname'>[ {club.shortName} ]</Text>
                      </View>
                      {club.locked && (
                        <View className='locked-badge'>
                          <Text className='locked-text'>🔒</Text>
                        </View>
                      )}
                    </View>
                    <View className='club-divider' />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    )
  }
}
