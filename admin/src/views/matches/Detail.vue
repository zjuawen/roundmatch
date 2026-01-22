<template>
  <div class="match-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>赛事详情</span>
          <div>
            <el-button @click="handleBack">返回</el-button>
            <el-button v-if="!isEdit" type="primary" @click="handleEdit">编辑</el-button>
          </div>
        </div>
      </template>
      <div v-loading="loading">
        <el-descriptions :column="2" border v-if="match">
          <el-descriptions-item label="赛事ID">{{ match._id }}</el-descriptions-item>
          <el-descriptions-item label="俱乐部">
            <el-tag
              v-if="match.club"
              @click="handleClubClick(match.club._id)"
              class="club-tag"
              type="primary"
            >
              {{ match.club.wholeName || match.club.shortName }}
            </el-tag>
            <span v-else style="color: #999;">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="玩家数">{{ match.playerCount || 0 }}</el-descriptions-item>
          <el-descriptions-item label="总场次">{{ match.total || 0 }}</el-descriptions-item>
          <el-descriptions-item label="完成场次">{{ match.finish || 0 }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="getTypeTagType(match.type)">
              {{ getTypeLabel(match.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建者">{{ match.owner || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(match.createDate) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(match.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            <span v-if="match.remark">{{ match.remark }}</span>
            <span v-else style="color: #999;">无</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="match.delete ? 'danger' : 'success'">
              {{ match.delete ? '已删除' : '正常' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 对阵情况 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <span>对阵情况</span>
      </template>
      <div v-loading="gamesLoading">
        <div v-if="games && games.length > 0">
          <el-table :data="games" stripe border>
            <el-table-column label="场次" width="80" align="center">
              <template #default="{ row }">
                <span>第{{ row.order }}场</span>
              </template>
            </el-table-column>
            <el-table-column label="队伍1" min-width="200">
              <template #default="{ row }">
                <div class="team-players">
                  <div class="player-item" v-if="row.player1">
                    <img 
                      v-if="row.player1.avatarUrl" 
                      :src="row.player1.avatarUrl" 
                      class="player-avatar"
                    />
                    <span class="player-name">{{ row.player1.name || '未知' }}</span>
                  </div>
                  <div class="player-item" v-if="row.player2">
                    <img 
                      v-if="row.player2.avatarUrl" 
                      :src="row.player2.avatarUrl" 
                      class="player-avatar"
                    />
                    <span class="player-name">{{ row.player2.name || '未知' }}</span>
                  </div>
                  <div v-if="!row.player1 && !row.player2" style="color: #999;">-</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="比分" width="120" align="center">
              <template #default="{ row }">
                <div class="score-display">
                  <span 
                    class="score" 
                    :class="{ 'score-completed': row.score1 >= 0 && row.score2 >= 0 }"
                  >
                    {{ row.score1 >= 0 ? row.score1 : '-' }}
                  </span>
                  <span class="score-separator">:</span>
                  <span 
                    class="score" 
                    :class="{ 'score-completed': row.score1 >= 0 && row.score2 >= 0 }"
                  >
                    {{ row.score2 >= 0 ? row.score2 : '-' }}
                  </span>
                </div>
                <el-tag 
                  v-if="row.score1 >= 0 && row.score2 >= 0" 
                  type="success" 
                  size="small"
                  style="margin-top: 5px;"
                >
                  已完成
                </el-tag>
                <el-tag 
                  v-else 
                  type="info" 
                  size="small"
                  style="margin-top: 5px;"
                >
                  未完成
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="队伍2" min-width="200">
              <template #default="{ row }">
                <div class="team-players">
                  <div class="player-item" v-if="row.player3">
                    <img 
                      v-if="row.player3.avatarUrl" 
                      :src="row.player3.avatarUrl" 
                      class="player-avatar"
                    />
                    <span class="player-name">{{ row.player3.name || '未知' }}</span>
                  </div>
                  <div class="player-item" v-if="row.player4">
                    <img 
                      v-if="row.player4.avatarUrl" 
                      :src="row.player4.avatarUrl" 
                      class="player-avatar"
                    />
                    <span class="player-name">{{ row.player4.name || '未知' }}</span>
                  </div>
                  <div v-if="!row.player3 && !row.player4" style="color: #999;">-</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-empty v-else description="暂无对阵数据" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { matchesApi } from '@/api/matches'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const matchId = route.params.id
const isEdit = computed(() => route.query.edit === 'true')
const loading = ref(false)
const gamesLoading = ref(false)
const match = ref(null)
const games = ref([])

onMounted(() => {
  loadMatchDetail()
  loadGames()
})

const loadMatchDetail = async () => {
  loading.value = true
  try {
    const response = await matchesApi.getById(matchId)
    match.value = response.data
  } catch (error) {
    ElMessage.error('加载失败：' + error.message)
    router.back()
  } finally {
    loading.value = false
  }
}

const loadGames = async () => {
  gamesLoading.value = true
  try {
    console.log('开始加载对阵数据，matchId:', matchId)
    const response = await matchesApi.getGames(matchId)
    console.log('对阵数据响应:', response)
    games.value = response.data || []
    console.log('设置后的 games:', games.value)
  } catch (error) {
    console.error('加载对阵数据失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    ElMessage.error('加载对阵数据失败：' + (error.response?.data?.message || error.message))
  } finally {
    gamesLoading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleEdit = () => {
  router.push(`/matches/${matchId}?edit=true`)
}

const handleClubClick = (clubId) => {
  router.push(`/clubs/${clubId}`)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

const getTypeLabel = (type) => {
  const typeMap = {
    'none': '无',
    'nonefix': '无固定',
    'fix': '固定',
    'single': '单打',
    'double': '双打'
  }
  return typeMap[type] || type || '未知'
}

const getTypeTagType = (type) => {
  const typeTagMap = {
    'none': 'info',
    'nonefix': 'warning',
    'fix': 'success',
    'single': 'primary',
    'double': 'success'
  }
  return typeTagMap[type] || 'info'
}
</script>

<style scoped>
.match-detail {
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

.team-players {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.player-name {
  font-size: 14px;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 18px;
  font-weight: bold;
}

.score {
  min-width: 30px;
  text-align: center;
  color: #999;
}

.score-completed {
  color: #409eff;
}

.score-separator {
  color: #999;
}
</style>
