import api from './index'

export const clubsApi = {
  // 获取俱乐部列表
  list: (params = {}) => {
    return api.get('/admin/clubs', { params })
  },
  
  // 获取俱乐部详情
  getById: (id) => {
    return api.get(`/admin/clubs/${id}`)
  },
  
  // 创建俱乐部
  create: (data) => {
    return api.post('/admin/clubs', data)
  },
  
  // 更新俱乐部
  update: (id, data) => {
    return api.put(`/admin/clubs/${id}`, data)
  },
  
  // 删除俱乐部
  delete: (id) => {
    return api.delete(`/admin/clubs/${id}`)
  }
}
