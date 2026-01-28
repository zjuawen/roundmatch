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
  
  // 获取赛事对阵数据
  getGames: (id) => {
    return api.get(`/admin/matches/${id}/games`)
  },
  
  // 获取赛事排名统计
  getRanking: (id) => {
    return api.get(`/admin/matches/${id}/ranking`)
  },
  
  // 获取或生成小程序码
  getQRCode: (id) => {
    return api.get(`/admin/matches/${id}/qrcode`)
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
