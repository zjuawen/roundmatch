import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const admin = ref(JSON.parse(localStorage.getItem('admin') || 'null'))

  const isAuthenticated = ref(!!token.value)
  const isSuperAdmin = ref(admin.value?.role === 'super_admin')

  // 账号密码登录
  const login = async (username, password) => {
    try {
      const response = await api.post('/admin/auth/login', { username, password })
      token.value = response.data.token
      admin.value = response.data.admin
      isSuperAdmin.value = admin.value.role === 'super_admin'
      localStorage.setItem('token', token.value)
      localStorage.setItem('admin', JSON.stringify(admin.value))
      isAuthenticated.value = true
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 微信扫码登录
  const loginByWechat = async (code, openid) => {
    try {
      const response = await api.post('/admin/auth/login/wechat', { code, openid })
      token.value = response.data.token
      admin.value = response.data.admin
      isSuperAdmin.value = admin.value.role === 'super_admin'
      localStorage.setItem('token', token.value)
      localStorage.setItem('admin', JSON.stringify(admin.value))
      isAuthenticated.value = true
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 获取当前管理员信息
  const getCurrentAdmin = async () => {
    try {
      const response = await api.get('/admin/auth/me')
      admin.value = response.data
      isSuperAdmin.value = admin.value.role === 'super_admin'
      localStorage.setItem('admin', JSON.stringify(admin.value))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    token.value = ''
    admin.value = null
    isAuthenticated.value = false
    isSuperAdmin.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
  }

  return {
    token,
    admin,
    isAuthenticated,
    isSuperAdmin,
    login,
    loginByWechat,
    getCurrentAdmin,
    logout
  }
})

