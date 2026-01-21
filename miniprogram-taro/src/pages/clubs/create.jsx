import { Component } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { clubService } from '../../services/api'
import { getGlobalData } from '../../utils'
import './create.scss'

export default class ClubCreate extends Component {
  state = {
    wholeName: '',
    shortName: '',
    password: '',
    loading: false
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

  handleSubmit = async () => {
    const { wholeName, shortName, password, loading } = this.state
    
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
        wholeName: wholeName.trim(),
        shortName: shortName.trim(),
        password: password.trim() || undefined
      }

      await clubService.create(info, userInfo)
      
      Taro.showToast({
        title: '创建成功',
        icon: 'success'
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      console.error('Create club error:', error)
      Taro.showToast({
        title: error.message || '创建失败',
        icon: 'none'
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  render() {
    const { wholeName, shortName, password, loading } = this.state

    return (
      <View className='club-create-page'>
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
              placeholder='设置加入密码，留空则公开'
              value={password}
              onInput={this.handlePasswordChange}
            />
          </View>

          <Button 
            className='submit-button' 
            onClick={this.handleSubmit}
            disabled={loading}
          >
            {loading ? '创建中...' : '创建俱乐部'}
          </Button>
        </View>
      </View>
    )
  }
}
