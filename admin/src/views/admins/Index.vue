<template>
  <div class="admins-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>管理员管理</span>
          <el-button type="primary" @click="handleAdd">新增管理员</el-button>
        </div>
      </template>
      <div class="search-bar" style="margin-bottom: 20px;">
        <el-input
          v-model="keyword"
          placeholder="搜索管理员用户名"
          style="width: 300px; margin-right: 10px;"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-select
          v-model="roleFilter"
          placeholder="选择角色"
          style="width: 150px; margin-right: 10px;"
          clearable
        >
          <el-option label="全部" value="" />
          <el-option label="超级管理员" value="super_admin" />
          <el-option label="俱乐部管理员" value="club_admin" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <el-table :data="admins" v-loading="loading" stripe>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="row.role === 'super_admin' ? 'danger' : 'primary'">
              {{ row.role === 'super_admin' ? '超级管理员' : '俱乐部管理员' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联俱乐部">
          <template #default="{ row }">
            <span v-if="row.club">{{ row.club.wholeName || row.club.shortName }}</span>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createDate" label="创建时间">
          <template #default="{ row }">
            {{ formatDate(row.createDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(row)"
              :disabled="row.role === 'super_admin'"
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form :model="adminForm" :rules="adminRules" ref="adminFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="adminForm.username" 
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
          <el-input 
            v-model="adminForm.password" 
            type="password" 
            placeholder="请输入密码"
            :show-password="true"
          />
          <div v-if="isEdit" style="color: #999; font-size: 12px; margin-top: 5px;">
            留空则不修改密码
          </div>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="adminForm.role" placeholder="选择角色" style="width: 100%;">
            <el-option label="超级管理员" value="super_admin" />
            <el-option label="俱乐部管理员" value="club_admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联俱乐部" prop="clubid" v-if="adminForm.role === 'club_admin'">
          <el-select
            v-model="adminForm.clubid"
            placeholder="选择俱乐部"
            filterable
            style="width: 100%;"
            @focus="loadClubs"
          >
            <el-option
              v-for="club in clubs"
              :key="club._id"
              :label="club.wholeName || club.shortName"
              :value="club._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="adminForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { adminsApi } from '@/api/admins'
import { clubsApi } from '@/api/clubs'
import { ElMessage, ElMessageBox } from 'element-plus'

const admins = ref([])
const clubs = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const roleFilter = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentAdminId = ref(null)
const adminFormRef = ref(null)

const dialogTitle = computed(() => isEdit.value ? '编辑管理员' : '新增管理员')

const adminForm = ref({
  username: '',
  password: '',
  role: 'club_admin',
  clubid: null,
  status: 1
})

const adminRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

onMounted(() => {
  loadAdmins()
})

const loadAdmins = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    if (keyword.value) {
      params.keyword = keyword.value
    }
    if (roleFilter.value) {
      params.role = roleFilter.value
    }
    const response = await adminsApi.list(params)
    admins.value = response.data.list || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const loadClubs = async () => {
  if (clubs.value.length > 0) return
  
  try {
    const response = await clubsApi.list({ pageSize: 1000 })
    clubs.value = response.data.list || []
  } catch (error) {
    console.error('加载俱乐部列表失败:', error)
  }
}

const handleAdd = () => {
  isEdit.value = false
  currentAdminId.value = null
  adminForm.value = {
    username: '',
    password: '',
    role: 'club_admin',
    clubid: null,
    status: 1
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentAdminId.value = row._id
  adminForm.value = {
    username: row.username,
    password: '',
    role: row.role,
    clubid: row.clubid,
    status: row.status
  }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这个管理员吗？', '提示', {
      type: 'warning'
    })
    await adminsApi.delete(row._id)
    ElMessage.success('删除成功')
    loadAdmins()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

const handleSubmit = async () => {
  if (!adminFormRef.value) return
  
  await adminFormRef.value.validate(async (valid) => {
    if (valid) {
      // 如果是编辑且密码为空，则不传密码字段
      const submitData = { ...adminForm.value }
      if (isEdit.value && !submitData.password) {
        delete submitData.password
      }
      
      // 如果是超级管理员，清空 clubid
      if (submitData.role === 'super_admin') {
        submitData.clubid = null
      }
      
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await adminsApi.update(currentAdminId.value, submitData)
          ElMessage.success('更新成功')
        } else {
          await adminsApi.create(submitData)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadAdmins()
      } catch (error) {
        ElMessage.error((isEdit.value ? '更新' : '创建') + '失败：' + error.message)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleSearch = () => {
  pageNum.value = 1
  loadAdmins()
}

const handlePageChange = (page) => {
  pageNum.value = page
  loadAdmins()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  pageNum.value = 1
  loadAdmins()
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}
</script>

<style scoped>
.admins-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
