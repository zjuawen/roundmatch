import { Component } from 'react'
import './app.scss'

class App extends Component {
  componentDidMount() {
    // 初始化云开发环境
    if (process.env.TARO_ENV === 'weapp') {
      // 微信小程序云开发初始化
      // wx.cloud.init({
      //   env: 'roundmatch',
      //   traceUser: true,
      // })
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App

