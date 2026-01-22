import api from './index'

export const matchesApi = {
  // 获取赛事列表
  list: (params = {}) => {
    return api.get('/admin/matches', { params })
  },
  
  // 获取赛事详情
  getById: (id) => {
    return api.get(`/admin/matches/${id}`)
  },
  
  // 创建赛事
  create: (data) => {
    return api.post('/admin/matches', data)
  },
  
  // 更新赛事
  update: (id, data) => {
    return api.put(`/admin/matches/${id}`, data)
  },
  
  // 删除赛事
  delete: (id) => {
    return api.delete(`/admin/matches/${id}`)
  }
}
