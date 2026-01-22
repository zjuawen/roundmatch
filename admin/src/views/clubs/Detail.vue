<template>
  <div class="club-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>俱乐部详情</span>
          <div>
            <el-button v-if="!isEdit" @click="handleEdit">编辑</el-button>
            <el-button v-if="isEdit" type="primary" @click="handleSave">保存</el-button>
            <el-button v-if="isEdit" @click="handleCancel">取消</el-button>
          </div>
        </div>
      </template>
      <div v-loading="loading">
        <el-form :model="clubForm" label-width="120px" v-if="clubForm">
          <el-form-item label="俱乐部简称">
            <el-input v-if="isEdit" v-model="clubForm.shortName" />
            <span v-else>{{ clubForm.shortName }}</span>
          </el-form-item>
          <el-form-item label="俱乐部全称">
            <el-input v-if="isEdit" v-model="clubForm.wholeName" />
            <span v-else>{{ clubForm.wholeName }}</span>
          </el-form-item>
          <el-form-item label="Logo">
            <el-input v-if="isEdit" v-model="clubForm.logo" placeholder="Logo URL" />
            <img v-else-if="clubForm.logo" :src="clubForm.logo" style="max-width: 200px; max-height: 200px;" />
            <span v-else>无</span>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-if="isEdit" v-model="clubForm.password" type="password" placeholder="留空表示无密码" show-password />
            <span v-else>{{ clubForm.password ? '***' : '无密码' }}</span>
          </el-form-item>
          <el-form-item label="是否公开">
            <el-switch v-if="isEdit" v-model="clubForm.public" />
            <el-tag v-else :type="clubForm.public ? 'success' : 'info'">
              {{ clubForm.public ? '公开' : '私有' }}
            </el-tag>
          </el-form-item>
          <el-form-item label="创建者">
            <span>{{ clubForm.creatorName || clubForm.creator || '未知' }}</span>
          </el-form-item>
          <el-form-item label="创建时间">
            <span>{{ formatDate(clubForm.createDate) }}</span>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clubsApi } from '@/api/clubs'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const clubId = route.params.id
const isEdit = computed(() => route.query.edit === 'true')
const loading = ref(false)
const clubForm = ref(null)

onMounted(() => {
  loadClubDetail()
})

const loadClubDetail = async () => {
  loading.value = true
  try {
    const response = await clubsApi.getById(clubId)
    clubForm.value = response.data
  } catch (error) {
    ElMessage.error('加载失败：' + error.message)
    router.back()
  } finally {
    loading.value = false
  }
}

const handleEdit = () => {
  router.push(`/clubs/${clubId}?edit=true`)
}

const handleCancel = () => {
  router.push(`/clubs/${clubId}`)
  loadClubDetail()
}

const handleSave = async () => {
  if (!clubForm.value.shortName || !clubForm.value.wholeName) {
    ElMessage.error('俱乐部简称和全称不能为空')
    return
  }

  loading.value = true
  try {
    await clubsApi.update(clubId, {
      shortName: clubForm.value.shortName,
      wholeName: clubForm.value.wholeName,
      logo: clubForm.value.logo,
      password: clubForm.value.password,
      public: clubForm.value.public
    })
    ElMessage.success('保存成功')
    router.push(`/clubs/${clubId}`)
    loadClubDetail()
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}
</script>

<style scoped>
.club-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

