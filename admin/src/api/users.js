import api from './index'

export const usersApi = {
  // 获取用户列表
  list: (params = {}) => {
    return api.get('/admin/users', { params })
  },
  
  // 获取用户详情
  getById: (openid) => {
    return api.get(`/admin/users/${openid}`)
  }
}
