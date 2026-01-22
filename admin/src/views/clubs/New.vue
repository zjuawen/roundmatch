<template>
  <div class="club-new">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新建俱乐部</span>
        </div>
      </template>
      <el-form :model="clubForm" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="俱乐部简称" prop="shortName">
          <el-input v-model="clubForm.shortName" placeholder="请输入俱乐部简称" />
        </el-form-item>
        <el-form-item label="俱乐部全称" prop="wholeName">
          <el-input v-model="clubForm.wholeName" placeholder="请输入俱乐部全称" />
        </el-form-item>
        <el-form-item label="Logo URL">
          <el-input v-model="clubForm.logo" placeholder="请输入Logo URL（可选）" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="clubForm.password" type="password" placeholder="留空表示无密码" show-password />
        </el-form-item>
        <el-form-item label="是否公开">
          <el-switch v-model="clubForm.public" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { clubsApi } from '@/api/clubs'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const clubForm = ref({
  shortName: '',
  wholeName: '',
  logo: '',
  password: '',
  public: true
})

const rules = {
  shortName: [
    { required: true, message: '请输入俱乐部简称', trigger: 'blur' }
  ],
  wholeName: [
    { required: true, message: '请输入俱乐部全称', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await clubsApi.create({
          shortName: clubForm.value.shortName,
          wholeName: clubForm.value.wholeName,
          logo: clubForm.value.logo,
          password: clubForm.value.password || null,
          public: clubForm.value.public,
          creator: 'admin'
        })
        ElMessage.success('创建成功')
        router.push(`/clubs/${response.data._id}`)
      } catch (error) {
        ElMessage.error('创建失败：' + error.message)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleCancel = () => {
  router.back()
}
</script>

<style scoped>
.club-new {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
