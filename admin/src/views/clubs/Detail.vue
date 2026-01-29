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
            <img 
              v-else-if="clubForm.logo && (clubForm.logo.startsWith('http://') || clubForm.logo.startsWith('https://') || clubForm.logo.startsWith('cloud://'))" 
              :src="clubForm.logo" 
              style="max-width: 200px; max-height: 200px;"
              @error="clubForm.logo = null"
            />
            <span v-else-if="clubForm.logo">无效的 Logo URL</span>
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
          
          <!-- 积分规则配置 -->
          <el-divider content-position="left">积分规则配置</el-divider>
          <el-form-item label="使用积分排名">
            <el-switch 
              v-if="isEdit" 
              v-model="clubForm.useScoreRanking" 
            />
            <el-tag v-else :type="clubForm.useScoreRanking ? 'success' : 'info'">
              {{ clubForm.useScoreRanking ? '启用' : '禁用' }}
            </el-tag>
          </el-form-item>
          <template v-if="clubForm.useScoreRanking">
            <el-form-item label="局胜分">
              <el-input-number 
                v-if="isEdit" 
                v-model.number="clubForm.scoreWinPoints" 
                :min="0" 
                :precision="0"
                :step="1"
                :controls-position="'right'"
                :formatter="(value) => value !== null && value !== undefined ? Math.round(value).toString() : ''"
                :parser="(value) => value === '' ? null : parseInt(value) || 0"
                @blur="clubForm.scoreWinPoints = clubForm.scoreWinPoints !== null ? Math.round(clubForm.scoreWinPoints) : null"
                placeholder="每局胜利获得的积分"
                style="width: 200px;"
              />
              <span v-else>{{ clubForm.scoreWinPoints !== null && clubForm.scoreWinPoints !== undefined ? Math.round(clubForm.scoreWinPoints) : '未设置' }}</span>
            </el-form-item>
            <el-form-item label="奖励分差值">
              <el-input-number 
                v-if="isEdit" 
                v-model.number="clubForm.scoreRewardThreshold" 
                :min="0" 
                :precision="0"
                :step="1"
                :controls-position="'right'"
                :formatter="(value) => value !== null && value !== undefined ? Math.round(value).toString() : ''"
                :parser="(value) => value === '' ? null : parseInt(value) || 0"
                @blur="clubForm.scoreRewardThreshold = clubForm.scoreRewardThreshold !== null ? Math.round(clubForm.scoreRewardThreshold) : null"
                placeholder="净胜分超过此值开始计算奖励分"
                style="width: 200px;"
              />
              <span v-else>{{ clubForm.scoreRewardThreshold !== null && clubForm.scoreRewardThreshold !== undefined ? Math.round(clubForm.scoreRewardThreshold) : '未设置' }}</span>
            </el-form-item>
            <el-form-item label="奖励分">
              <el-input-number 
                v-if="isEdit" 
                v-model.number="clubForm.scoreRewardPoints" 
                :min="0" 
                :precision="0"
                :step="1"
                :controls-position="'right'"
                :formatter="(value) => value !== null && value !== undefined ? Math.round(value).toString() : ''"
                :parser="(value) => value === '' ? null : parseInt(value) || 0"
                @blur="clubForm.scoreRewardPoints = clubForm.scoreRewardPoints !== null ? Math.round(clubForm.scoreRewardPoints) : null"
                placeholder="每超过阈值获得的积分"
                style="width: 200px;"
              />
              <span v-else>{{ clubForm.scoreRewardPoints !== null && clubForm.scoreRewardPoints !== undefined ? Math.round(clubForm.scoreRewardPoints) : '未设置' }}</span>
            </el-form-item>
            <el-form-item label="每局封顶奖励分">
              <el-input-number 
                v-if="isEdit" 
                v-model.number="clubForm.scoreRewardMaxPerGame" 
                :min="0" 
                :precision="0"
                :step="1"
                :controls-position="'right'"
                :formatter="(value) => value !== null && value !== undefined ? Math.round(value).toString() : ''"
                :parser="(value) => value === '' ? null : parseInt(value) || 0"
                @blur="clubForm.scoreRewardMaxPerGame = clubForm.scoreRewardMaxPerGame !== null ? Math.round(clubForm.scoreRewardMaxPerGame) : null"
                placeholder="每局最多能获得的奖励积分"
                style="width: 200px;"
              />
              <span v-else>{{ clubForm.scoreRewardMaxPerGame !== null && clubForm.scoreRewardMaxPerGame !== undefined ? Math.round(clubForm.scoreRewardMaxPerGame) : '未设置' }}</span>
            </el-form-item>
            <el-alert
              v-if="isEdit"
              title="积分计算说明"
              type="info"
              :closable="false"
              style="margin-bottom: 20px;"
            >
              <template #default>
                <div style="font-size: 12px; line-height: 1.6;">
                  <p>• 局胜分：每局比赛胜利获得的积分</p>
                  <p>• 奖励分差值：净胜分超过此值开始计算奖励分</p>
                  <p>• 奖励分：每超过差值获得的积分</p>
                  <p>• 每局封顶奖励分：每局最多能获得的奖励积分</p>
                  <p>• 每局积分 = 局胜分（如果胜利）+ 奖励分（根据净胜分计算，不超过封顶奖励分）</p>
                  <p>• 总积分 = 所有局积分之和</p>
                  <p>• 排名将按总积分从高到低排序</p>
                </div>
              </template>
            </el-alert>
          </template>
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
const clubForm = ref({
  shortName: '',
  wholeName: '',
  logo: '',
  password: '',
  public: true,
  scoreWinPoints: null,
  scoreRewardThreshold: null,
  scoreRewardPoints: null,
  scoreRewardMaxPerGame: null,
  useScoreRanking: false
})

onMounted(() => {
  loadClubDetail()
})

const loadClubDetail = async () => {
  loading.value = true
  try {
    const response = await clubsApi.getById(clubId)
    clubForm.value = response.data
    
    // 加载配置项
    try {
      const configResponse = await clubsApi.getConfig(clubId)
      // 确保布尔值正确转换
      clubForm.value.useScoreRanking = configResponse.data.useScoreRanking === true || configResponse.data.useScoreRanking === 1 || configResponse.data.useScoreRanking === 'true'
      // 确保局胜分为整数
      clubForm.value.scoreWinPoints = configResponse.data.scoreWinPoints !== null && configResponse.data.scoreWinPoints !== undefined ? Math.round(configResponse.data.scoreWinPoints) : null
      // 确保奖励分相关字段为整数
      clubForm.value.scoreRewardThreshold = configResponse.data.scoreRewardThreshold !== null && configResponse.data.scoreRewardThreshold !== undefined ? Math.round(configResponse.data.scoreRewardThreshold) : null
      clubForm.value.scoreRewardPoints = configResponse.data.scoreRewardPoints !== null && configResponse.data.scoreRewardPoints !== undefined ? Math.round(configResponse.data.scoreRewardPoints) : null
      clubForm.value.scoreRewardMaxPerGame = configResponse.data.scoreRewardMaxPerGame !== null && configResponse.data.scoreRewardMaxPerGame !== undefined ? Math.round(configResponse.data.scoreRewardMaxPerGame) : null
    } catch (error) {
      // 如果配置不存在，使用默认值
      clubForm.value.useScoreRanking = false
      clubForm.value.scoreWinPoints = null
      clubForm.value.scoreRewardThreshold = null
      clubForm.value.scoreRewardPoints = null
      clubForm.value.scoreRewardMaxPerGame = null
    }
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
    // 保存俱乐部基本信息
    await clubsApi.update(clubId, {
      shortName: clubForm.value.shortName,
      wholeName: clubForm.value.wholeName,
      logo: clubForm.value.logo,
      password: clubForm.value.password,
      public: clubForm.value.public
    })
    
    // 保存配置项，确保所有积分字段为整数
    await clubsApi.updateConfig(clubId, {
      useScoreRanking: clubForm.value.useScoreRanking,
      scoreWinPoints: clubForm.value.scoreWinPoints !== null ? Math.round(clubForm.value.scoreWinPoints) : null,
      scoreRewardThreshold: clubForm.value.scoreRewardThreshold !== null ? Math.round(clubForm.value.scoreRewardThreshold) : null,
      scoreRewardPoints: clubForm.value.scoreRewardPoints !== null ? Math.round(clubForm.value.scoreRewardPoints) : null,
      scoreRewardMaxPerGame: clubForm.value.scoreRewardMaxPerGame !== null ? Math.round(clubForm.value.scoreRewardMaxPerGame) : null
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

