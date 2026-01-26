import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue')
      },
      {
        path: 'clubs',
        name: 'Clubs',
        component: () => import('@/views/clubs/Index.vue')
      },
      {
        path: 'clubs/new',
        name: 'ClubNew',
        component: () => import('@/views/clubs/New.vue'),
        meta: { requiresSuperAdmin: true }
      },
      {
        path: 'clubs/:id',
        name: 'ClubDetail',
        component: () => import('@/views/clubs/Detail.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/Index.vue')
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: () => import('@/views/users/Detail.vue')
      },
      {
        path: 'matches',
        name: 'Matches',
        component: () => import('@/views/matches/Index.vue')
      },
      {
        path: 'matches/new',
        name: 'MatchNew',
        component: () => import('@/views/matches/New.vue')
      },
      {
        path: 'matches/:id',
        name: 'MatchDetail',
        component: () => import('@/views/matches/Detail.vue')
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/statistics/Index.vue')
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/system/Index.vue')
      },
      {
        path: 'admins',
        name: 'Admins',
        component: () => import('@/views/admins/Index.vue'),
        meta: { requiresSuperAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // 检查是否需要超级管理员权限
  if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    ElMessage.warning('需要超级管理员权限')
    next('/dashboard')
    return
  }
  
  next()
})

export default router

