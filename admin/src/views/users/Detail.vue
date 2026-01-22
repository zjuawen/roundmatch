<template>
  <div class="user-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户详情</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>
      <div v-loading="loading">
        <el-descriptions :column="2" border v-if="user">
          <el-descriptions-item label="姓名">{{ user.name || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="OpenID">{{ user.openid }}</el-descriptions-item>
          <el-descriptions-item label="头像">
            <img v-if="user.avatarUrl" :src="user.avatarUrl" style="width: 50px; height: 50px; border-radius: 50%;" />
            <span v-else>无</span>
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            <span v-if="user.gender === 1">男</span>
            <span v-else-if="user.gender === 2">女</span>
            <span v-else>未知</span>
          </el-descriptions-item>
          <el-descriptions-item label="国家">{{ user.country || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="省份">{{ user.province || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="城市">{{ user.city || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(user.createDate) }}</el-descriptions-item>
          <el-descriptions-item label="所属俱乐部" :span="2">
            <div v-if="user.clubs && user.clubs.length > 0">
              <el-tag
                v-for="club in user.clubs"
                :key="club._id"
                style="margin-right: 5px; margin-bottom: 5px;"
                @click="handleClubClick(club._id)"
                class="club-tag"
              >
                {{ club.wholeName || club.shortName }}
              </el-tag>
            </div>
            <span v-else style="color: #999;">无</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usersApi } from '@/api/users'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const openid = route.params.id
const loading = ref(false)
const user = ref(null)

onMounted(() => {
  loadUserDetail()
})

const loadUserDetail = async () => {
  loading.value = true
  try {
    const response = await usersApi.getById(openid)
    user.value = response.data
  } catch (error) {
    ElMessage.error('加载失败：' + error.message)
    router.back()
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleClubClick = (clubId) => {
  router.push(`/clubs/${clubId}`)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}
</script>

<style scoped>
.user-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.club-tag {
  cursor: pointer;
}

.club-tag:hover {
  opacity: 0.8;
}
</style>
