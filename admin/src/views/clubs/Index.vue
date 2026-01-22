<template>
  <div class="clubs-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>俱乐部管理</span>
          <el-button 
            v-if="isSuperAdmin" 
            type="primary" 
            @click="handleAdd"
          >
            新增俱乐部
          </el-button>
        </div>
      </template>
      <div class="search-bar" style="margin-bottom: 20px;">
        <el-input
          v-model="keyword"
          placeholder="搜索俱乐部名称"
          style="width: 300px; margin-right: 10px;"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <el-table :data="clubs" v-loading="loading" stripe>
        <el-table-column prop="shortName" label="简称" />
        <el-table-column prop="wholeName" label="全称" />
        <el-table-column label="创建者">
          <template #default="{ row }">
            {{ row.creatorName || row.creator || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="public" label="公开">
          <template #default="{ row }">
            <el-tag :type="row.public ? 'success' : 'info'">
              {{ row.public ? '公开' : '私有' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              v-if="isSuperAdmin" 
              size="small" 
              type="danger" 
              @click="handleDelete(row)"
            >
              删除
            </el-button>
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
import { clubsApi } from '@/api/clubs'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const isSuperAdmin = computed(() => authStore.isSuperAdmin)

const clubs = ref([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const keyword = ref('')

onMounted(() => {
  loadClubs()
})

const loadClubs = async () => {
  loading.value = true
  try {
    const response = await clubsApi.list({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    clubs.value = response.data.list || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  router.push('/clubs/new')
}

const handleView = (row) => {
  router.push(`/clubs/${row._id}`)
}

const handleEdit = (row) => {
  router.push(`/clubs/${row._id}?edit=true`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个俱乐部吗？', '提示', {
      type: 'warning'
    })
    await clubsApi.delete(row._id)
    ElMessage.success('删除成功')
    loadClubs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

const handleSearch = () => {
  pageNum.value = 1
  loadClubs()
}

const handlePageChange = (page) => {
  pageNum.value = page
  loadClubs()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  pageNum.value = 1
  loadClubs()
}
</script>

<style scoped>
.clubs-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

