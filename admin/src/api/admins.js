import api from './index'

export const adminsApi = {
  // 获取管理员列表
  list: (params = {}) => {
    return api.get('/admin/admins', { params })
  },
  
  // 获取管理员详情
  getById: (id) => {
    return api.get(`/admin/admins/${id}`)
  },
  
  // 创建管理员
  create: (data) => {
    return api.post('/admin/admins', data)
  },
  
  // 更新管理员
  update: (id, data) => {
    return api.put(`/admin/admins/${id}`, data)
  },
  
  // 删除管理员
  delete: (id) => {
    return api.delete(`/admin/admins/${id}`)
  },
  
  // 获取当前登录管理员信息
  getCurrent: () => {
    return api.get('/admin/auth/me')
  }
}
