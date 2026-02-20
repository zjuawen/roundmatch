import { Component } from 'react'
import { View, Text, Input, Button, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { clubService } from '../../services/api'
import { getGlobalData } from '../../utils'
import './edit.scss'

export default class ClubEdit extends Component {
  state = {
    clubid: '',
    wholeName: '',
    shortName: '',
    password: '',
    description: '',
    loading: false
  }

  componentDidMount() {
    Taro.setNavigationBarTitle({
      title: '修改俱乐部信息'
    })
    
    // 获取路由参数
    const params = Taro.getCurrentInstance().router?.params || {}
    const clubid = params.clubid || this.$router?.params?.clubid
    
    if (clubid) {
      this.setState({ clubid })
      this.loadClubInfo(clubid)
    } else {
      Taro.showToast({
        title: '缺少俱乐部ID',
        icon: 'none'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  }

  // 加载俱乐部信息
  loadClubInfo = async (clubid) => {
    try {
      const data = await clubService.info(clubid)
      if (data.data) {
        const clubInfo = data.data
        this.setState({
          wholeName: clubInfo.wholename || clubInfo.wholeName || '',
          shortName: clubInfo.shortname || clubInfo.shortName || '',
          password: '', // 密码不显示，留空
          description: clubInfo.description || ''
        })
      }
    } catch (error) {
      console.error('Load club info error:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  }

  handleWholeNameChange = (e) => {
    this.setState({ wholeName: e.detail.value })
  }

  handleShortNameChange = (e) => {
    this.setState({ shortName: e.detail.value })
  }

  handlePasswordChange = (e) => {
    this.setState({ password: e.detail.value })
  }

  handleDescriptionChange = (e) => {
    this.setState({ description: e.detail.value })
  }

  handleSubmit = async () => {
    const { clubid, wholeName, shortName, password, description, loading } = this.state
    
    if (!wholeName.trim()) {
      Taro.showToast({
        title: '请输入完整名称',
        icon: 'none'
      })
      return
    }

    if (!shortName.trim()) {
      Taro.showToast({
        title: '请输入简称',
        icon: 'none'
      })
      return
    }

    if (loading) return

    this.setState({ loading: true })

    try {
      const openid = getGlobalData('openid')
      const userInfo = getGlobalData('userInfo')
      
      if (!openid) {
        Taro.redirectTo({
          url: '/pages/login/index'
        })
        return
      }

      const info = {
        clubid: clubid,
        wholeName: wholeName.trim(),
        shortName: shortName.trim(),
        password: password.trim() || undefined,
        description: description.trim() || undefined
      }

      await clubService.update(clubid, info, userInfo)
      
      Taro.showToast({
        title: '修改成功',
        icon: 'success'
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('Update club error:', error)
      Taro.showToast({
        title: error.message || '修改失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    const { wholeName, shortName, password, description, loading } = this.state

    return (
      <View className='club-edit-page'>
        <View className='form'>
          <View className='form-item'>
            <Text className='label'>完整名称</Text>
            <Input
              className='input'
              placeholder='请输入俱乐部完整名称'
              value={wholeName}
              onInput={this.handleWholeNameChange}
            />
          </View>

          <View className='form-item'>
            <Text className='label'>简称</Text>
            <Input
              className='input'
              placeholder='请输入俱乐部简称'
              value={shortName}
              onInput={this.handleShortNameChange}
            />
          </View>

          <View className='form-item'>
            <Text className='label'>密码（可选）</Text>
            <Input
              className='input'
              type='password'
              placeholder='留空则不修改密码'
              value={password}
              onInput={this.handlePasswordChange}
            />
            <Text className='hint'>留空则不修改密码，输入新密码将替换旧密码</Text>
          </View>

          <View className='form-item'>
            <Text className='label'>俱乐部简介</Text>
            <Textarea
              className='textarea'
              placeholder='请输入俱乐部简介'
              value={description}
              onInput={this.handleDescriptionChange}
              maxlength={500}
              showConfirmBar={false}
            />
          </View>

          <Button 
            className='submit-button' 
            onClick={this.handleSubmit}
            disabled={loading}
          >
            {loading ? '保存中...' : '保存修改'}
          </Button>
        </View>
      </View>
    )
  }
}
