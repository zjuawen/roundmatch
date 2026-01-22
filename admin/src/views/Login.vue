<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>RoundMatch 管理台</h2>
        </div>
      </template>
      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="账号登录" name="account">
          <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" style="margin-top: 20px;">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="微信登录" name="wechat">
          <div class="wechat-login" style="margin-top: 20px; text-align: center;">
            <el-alert
              title="微信扫码登录"
              type="info"
              :closable="false"
              style="margin-bottom: 20px;"
            />
            <div class="qr-code-placeholder" style="width: 200px; height: 200px; margin: 0 auto; border: 1px dashed #ddd; display: flex; align-items: center; justify-content: center; background: #f5f5f5;">
              <span style="color: #999;">二维码占位</span>
            </div>
            <el-button 
              type="primary" 
              @click="handleWechatLogin" 
              :loading="wechatLoading" 
              style="margin-top: 20px; width: 100%"
            >
              微信扫码登录
            </el-button>
            <el-alert
              title="提示：请先绑定微信账号"
              type="warning"
              :closable="false"
              style="margin-top: 20px;"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const loading = ref(false)
const wechatLoading = ref(false)
const activeTab = ref('account')

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await authStore.login(form.username, form.password)
        if (result.success) {
          ElMessage.success('登录成功')
          router.push('/dashboard')
        } else {
          ElMessage.error(result.error || '登录失败')
        }
      } catch (error) {
        ElMessage.error('登录失败：' + error.message)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleWechatLogin = async () => {
  // TODO: 实现微信扫码登录逻辑
  // 1. 获取微信授权码
  // 2. 调用后端接口获取 openid
  // 3. 使用 openid 登录
  
  wechatLoading.value = true
  try {
    // 临时实现：需要实际集成微信登录
    ElMessage.warning('微信登录功能待实现，请使用账号密码登录')
    
    // 示例代码：
    // const code = await getWechatCode() // 获取微信授权码
    // const result = await authStore.loginByWechat(code, openid)
    // if (result.success) {
    //   ElMessage.success('登录成功')
    //   router.push('/dashboard')
    // }
  } catch (error) {
    ElMessage.error('微信登录失败：' + error.message)
  } finally {
    wechatLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
}

.login-tabs {
  margin-top: 10px;
}

.wechat-login {
  padding: 20px 0;
}

.qr-code-placeholder {
  border-radius: 4px;
}
</style>

