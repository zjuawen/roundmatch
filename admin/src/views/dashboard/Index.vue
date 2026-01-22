<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-title">{{ stat.title }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api'

const stats = ref([
  { title: '俱乐部总数', value: 0 },
  { title: '用户总数', value: 0 },
  { title: '比赛总数', value: 0 },
  { title: '今日活跃', value: 0 }
])

onMounted(async () => {
  // TODO: Load dashboard statistics
  // const data = await api.get('/admin/dashboard/stats')
  // stats.value = data.stats
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-title {
  color: #666;
  font-size: 14px;
}
</style>

