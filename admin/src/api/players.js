import api from './index'

export const playersApi = {
  // 获取俱乐部成员列表
  list: (clubid, params = {}) => {
    return api.get('/admin/players', { 
      params: { 
        clubid,
        ...params
      } 
    })
  },
  
  // 创建新成员
  create: (data) => {
    return api.post('/admin/players', data)
  }
}
