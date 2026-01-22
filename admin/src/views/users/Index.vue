<template>
  <div class="users-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>
      <div class="search-bar" style="margin-bottom: 20px;">
        <el-input
          v-model="keyword"
          placeholder="搜索用户姓名"
          style="width: 300px; margin-right: 10px;"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <el-table :data="users" v-loading="loading" stripe>
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <span v-if="row.gender === 1">男</span>
            <span v-else-if="row.gender === 2">女</span>
            <span v-else style="color: #999;">未知</span>
          </template>
        </el-table-column>
        <el-table-column prop="city" label="城市" />
        <el-table-column label="加入时间" width="180">
          <template #default="{ row }">
            <span v-if="row.earliestJoinDate">{{ formatDate(row.earliestJoinDate) }}</span>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column label="所属俱乐部" min-width="200">
          <template #default="{ row }">
            <div v-if="row.clubs && row.clubs.length > 0">
              <el-tag
                v-for="club in row.clubs"
                :key="club._id"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ club.wholeName || club.shortName }}
              </el-tag>
            </div>
            <span v-else style="color: #999;">无</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination" style="margin-top: 20px; text-align: right;">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usersApi } from '@/api/users'
import { ElMessage } from 'element-plus'

const router = useRouter()
const users = ref([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const keyword = ref('')

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await usersApi.list({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    users.value = response.data.list || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const handleView = (row) => {
  router.push(`/users/${row.openid}`)
}

const handleSearch = () => {
  pageNum.value = 1
  loadUsers()
}

const handlePageChange = (page) => {
  pageNum.value = page
  loadUsers()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  pageNum.value = 1
  loadUsers()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.users-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

