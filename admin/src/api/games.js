import api from './index'

export const gamesApi = {
  // 更新比分
  updateScore: (gameId, data) => {
    return api.put(`/admin/games/${gameId}/score`, data)
  },
  
  // 获取操作流水
  getScoreLogs: (params = {}) => {
    return api.get('/admin/games/score-logs', { params })
  }
}
