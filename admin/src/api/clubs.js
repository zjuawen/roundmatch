import api from './index'

export const clubsApi = {
  // 获取俱乐部列表
  list: (params = {}) => {
    return api.get('/admin/clubs', { params })
  },
  
  // 搜索俱乐部（用于下拉选择）
  search: (keyword = '', limit = 50) => {
    return api.get('/admin/clubs', { 
      params: { 
        keyword, 
        pageSize: limit,
        pageNum: 1
      } 
    })
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
  },
  
  // 获取俱乐部配置
  getConfig: (clubId) => {
    return api.get(`/admin/clubs/${clubId}/config`)
  },
  
  // 更新俱乐部配置
  updateConfig: (clubId, data) => {
    return api.put(`/admin/clubs/${clubId}/config`, data)
  }
}
