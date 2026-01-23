import api from './index'

export const mediaApi = {
  // 检查头像 URL 是否有效
  checkAvatar: (url) => {
    return api.get('/admin/media/check-avatar', { params: { url } })
  }
}
