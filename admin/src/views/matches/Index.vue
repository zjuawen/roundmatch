<template>
  <div class="matches-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>赛事管理</span>
          <el-button type="primary" @click="handleAdd">新增赛事</el-button>
        </div>
      </template>
      <div class="search-bar" style="margin-bottom: 20px;">
        <el-input
          v-model="keyword"
          placeholder="搜索备注"
          style="width: 300px; margin-right: 10px;"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-input
          v-if="isSuperAdmin"
          v-model="clubid"
          placeholder="俱乐部ID（可选）"
          style="width: 200px; margin-right: 10px;"
          clearable
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <el-table :data="matches" v-loading="loading" stripe>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createDate) }}
          </template>
        </el-table-column>
        <el-table-column label="俱乐部" min-width="150">
          <template #default="{ row }">
            <span v-if="row.club">{{ row.club.wholeName || row.club.shortName }}</span>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="playerCount" label="玩家数" />
        <el-table-column prop="total" label="总场次" />
        <el-table-column prop="finish" label="完成场次" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { matchesApi } from '@/api/matches'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

const matches = ref([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const clubid = ref('')

onMounted(() => {
  loadMatches()
})

const loadMatches = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    if (clubid.value) {
      params.clubid = clubid.value
    }
    const response = await matchesApi.list(params)
    matches.value = response.data.list || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  router.push('/matches/new')
}

const handleView = (row) => {
  router.push(`/matches/${row._id}`)
}

const handleEdit = (row) => {
  router.push(`/matches/${row._id}?edit=true`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个赛事吗？', '提示', {
      type: 'warning'
    })
    await matchesApi.delete(row._id)
    ElMessage.success('删除成功')
    loadMatches()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

const handleSearch = () => {
  pageNum.value = 1
  loadMatches()
}

const handlePageChange = (page) => {
  pageNum.value = page
  loadMatches()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  pageNum.value = 1
  loadMatches()
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
.matches-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

