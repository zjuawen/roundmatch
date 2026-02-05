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
          <el-descriptions-item label="类型">
            <el-tag :type="getTypeTagType(match.type)">
              {{ getTypeLabel(match.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建者">{{ match.owner || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(match.createDate) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatDate(match.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="备注">
            <span v-if="match.remark" class="remark-text" :title="match.remark">{{ match.remark }}</span>
            <span v-else style="color: #999;">无</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="match.delete ? 'danger' : 'success'" size="small">
              {{ match.delete ? '已删除' : '正常' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="小程序码" :span="2">
            <div v-if="match.qrcodeUrl" class="qrcode-container-compact">
              <img :src="match.qrcodeUrl" alt="小程序码" class="qrcode-image-compact" />
              <div class="qrcode-actions-compact">
                <el-button size="small" type="text" @click="downloadQRCode">下载</el-button>
                <el-button size="small" type="text" @click="refreshQRCode">刷新</el-button>
              </div>
            </div>
            <div v-else class="qrcode-loading-compact">
              <el-button size="small" type="primary" @click="generateQRCode" :loading="qrcodeGenerating">
                生成
              </el-button>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 对阵情况 -->
    <el-card style="margin-top: 20px;">
      <template #header>
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="报名情况" name="enrollment"></el-tab-pane>
          <el-tab-pane label="对阵情况" name="games"></el-tab-pane>
          <el-tab-pane label="排名统计" name="ranking"></el-tab-pane>
          <el-tab-pane label="操作流水" name="logs"></el-tab-pane>
        </el-tabs>
      </template>
      
      <!-- 报名情况标签页 -->
      <div v-show="activeTab === 'enrollment'">
        <div v-loading="enrollmentLoading">
          <!-- 比赛类型和报名人数信息 -->
          <div class="enrollment-info" v-if="match">
            <div class="enrollment-info-item" v-if="match.type">
              <span class="info-label">比赛类型：</span>
              <span class="info-value">{{ getTypeLabel(match.type) }}</span>
            </div>
            <div class="enrollment-info-item">
              <span class="info-label">报名名单：</span>
              <span class="info-value">{{ enrollment.length }} 人</span>
            </div>
          </div>
          
          <!-- 报名列表 -->
          <div v-if="enrollment && enrollment.length > 0" style="margin-top: 20px;">
            <el-table :data="enrollment" stripe border>
              <el-table-column label="序号" width="80" align="center">
                <template #default="{ row }">
                  <span>{{ row.index }}</span>
                </template>
              </el-table-column>
              <el-table-column label="选手" min-width="300">
                <template #default="{ row }">
                  <div class="enrollment-players">
                    <!-- 第一个选手 -->
                    <div class="player-item" v-if="row.player1">
                      <Avatar 
                        :avatar-url="row.player1.avatarUrl" 
                        :name="row.player1.name || '未知'"
                        :size="32"
                        :avatar-valid="row.player1.avatarValid"
                      />
                      <span class="player-name">{{ row.player1.name || '未知' }}</span>
                      <el-tag 
                        v-if="row.player1.gender !== undefined" 
                        :type="row.player1.gender === 1 ? 'primary' : 'danger'"
                        size="small"
                        style="margin-left: 8px;"
                      >
                        {{ row.player1.gender === 1 ? '♂' : '♀' }}
                      </el-tag>
                    </div>
                    <!-- 固定搭档模式：显示第二个选手 -->
                    <template v-if="row.player2">
                      <span class="player-separator">+</span>
                      <div class="player-item">
                        <Avatar 
                          :avatar-url="row.player2.avatarUrl" 
                          :name="row.player2.name || '未知'"
                          :size="32"
                          :avatar-valid="row.player2.avatarValid"
                        />
                        <span class="player-name">{{ row.player2.name || '未知' }}</span>
                        <el-tag 
                          v-if="row.player2.gender !== undefined" 
                          :type="row.player2.gender === 1 ? 'primary' : 'danger'"
                          size="small"
                          style="margin-left: 8px;"
                        >
                          {{ row.player2.gender === 1 ? '♂' : '♀' }}
                        </el-tag>
                      </div>
                    </template>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="暂无报名信息" />
        </div>
      </div>
      
      <!-- 对阵情况标签页 -->
      <div v-show="activeTab === 'games'">
      <!-- 比赛实时情况 -->
      <div class="match-realtime-info" v-if="match">
        <div class="realtime-info-item">
          <span class="info-label">完成场次：</span>
          <span class="info-value">{{ match.finish || 0 }} / {{ match.total || 0 }}</span>
        </div>
        <div class="realtime-info-item progress-item">
          <div class="progress-container">
            <el-progress 
              :percentage="matchProgress" 
              :status="matchProgressStatus"
              :stroke-width="20"
              :format="formatProgress"
            />
          </div>
        </div>
      </div>
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
                  <template v-if="row.player1 || row.player2">
                    <div class="player-item" v-if="row.player1">
                      <Avatar 
                        :avatar-url="row.player1.avatarUrl" 
                        :name="row.player1.name || '未知'"
                        :size="32"
                        :avatar-valid="row.player1.avatarValid"
                      />
                      <span class="player-name">{{ row.player1.name || '未知' }}</span>
                    </div>
                    <span v-if="row.player1 && row.player2" class="player-separator">/</span>
                    <div class="player-item" v-if="row.player2">
                      <Avatar 
                        :avatar-url="row.player2.avatarUrl" 
                        :name="row.player2.name || '未知'"
                        :size="32"
                        :avatar-valid="row.player2.avatarValid"
                      />
                      <span class="player-name">{{ row.player2.name || '未知' }}</span>
                    </div>
                  </template>
                  <span v-else style="color: #999;">-</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="比分" width="200" align="center">
              <template #default="{ row, $index }">
                <div v-if="editingScoreIndex === $index" class="score-edit-container">
                  <el-input-number
                    v-model="editingScore.score1"
                    :min="0"
                    :max="99"
                    size="small"
                    style="width: 70px;"
                    controls-position="right"
                  />
                  <span class="score-separator">:</span>
                  <el-input-number
                    v-model="editingScore.score2"
                    :min="0"
                    :max="99"
                    size="small"
                    style="width: 70px;"
                    controls-position="right"
                  />
                  <div style="margin-top: 8px; display: flex; gap: 5px; justify-content: center;">
                    <el-button size="small" type="primary" @click="saveScore(row, $index)">保存</el-button>
                    <el-button size="small" @click="cancelEditScore">取消</el-button>
                  </div>
                </div>
                <div v-else class="score-display">
                  <span 
                    class="score" 
                    :class="{ 'score-completed': row.score1 > 0 && row.score2 > 0 }"
                  >
                    {{ (row.score1 != null && row.score1 >= 0) ? row.score1 : 0 }}
                  </span>
                  <span class="score-separator">:</span>
                  <span 
                    class="score" 
                    :class="{ 'score-completed': row.score1 > 0 && row.score2 > 0 }"
                  >
                    {{ (row.score2 != null && row.score2 >= 0) ? row.score2 : 0 }}
                  </span>
                </div>
                <div v-if="editingScoreIndex !== $index" style="margin-top: 5px;">
                  <el-tag 
                    v-if="row.score1 > 0 && row.score2 > 0" 
                    type="success" 
                    size="small"
                  >
                    已完成
                  </el-tag>
                  <el-tag 
                    v-else 
                    type="info" 
                    size="small"
                  >
                    未完成
                  </el-tag>
                  <el-button
                    v-if="isEdit"
                    type="text"
                    size="small"
                    style="margin-left: 8px;"
                    @click="editScore(row, $index)"
                  >
                    编辑
                  </el-button>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="队伍2" min-width="200">
              <template #default="{ row }">
                <div class="team-players">
                  <template v-if="row.player3 || row.player4">
                    <div class="player-item" v-if="row.player3">
                      <Avatar 
                        :avatar-url="row.player3.avatarUrl" 
                        :name="row.player3.name || '未知'"
                        :size="32"
                        :avatar-valid="row.player3.avatarValid"
                      />
                      <span class="player-name">{{ row.player3.name || '未知' }}</span>
                    </div>
                    <span v-if="row.player3 && row.player4" class="player-separator">/</span>
                    <div class="player-item" v-if="row.player4">
                      <Avatar 
                        :avatar-url="row.player4.avatarUrl" 
                        :name="row.player4.name || '未知'"
                        :size="32"
                        :avatar-valid="row.player4.avatarValid"
                      />
                      <span class="player-name">{{ row.player4.name || '未知' }}</span>
                    </div>
                  </template>
                  <span v-else style="color: #999;">-</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-empty v-else description="暂无对阵数据" />
      </div>
      </div>
      
      <!-- 排名统计标签页 -->
      <div v-show="activeTab === 'ranking'">
      <!-- 比赛实时情况 -->
      <div class="match-realtime-info" v-if="match">
        <div class="realtime-info-item">
          <span class="info-label">完成场次：</span>
          <span class="info-value">{{ match.finish || 0 }} / {{ match.total || 0 }}</span>
        </div>
        <div class="realtime-info-item progress-item">
          <div class="progress-container">
            <el-progress 
              :percentage="matchProgress" 
              :status="matchProgressStatus"
              :stroke-width="20"
              :format="formatProgress"
            />
          </div>
        </div>
      </div>
      <div v-loading="rankingLoading">
        <div v-if="ranking && ranking.length > 0">
          <el-table :data="ranking" stripe border>
            <el-table-column label="排名" width="80" align="center">
              <template #default="{ row }">
                <span class="rank-number" :class="getRankClass(row.rank)">
                  {{ row.rank }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="选手" min-width="200">
              <template #default="{ row }">
                <div class="player-item">
                  <Avatar 
                    :avatar-url="row.player.avatarUrl" 
                    :name="row.player.name || '未知'"
                    :size="40"
                    :avatar-valid="row.player.avatarValid"
                  />
                  <span class="player-name">{{ row.player.name || '未知' }}</span>
                  <!-- 固定搭档模式：显示第二个选手 -->
                  <template v-if="match.type === 'fixpair' && row.player2">
                    <span style="margin: 0 8px; color: #909399;">+</span>
                    <Avatar 
                      :avatar-url="row.player2.avatarUrl" 
                      :name="row.player2.name || '未知'"
                      :size="40"
                      :avatar-valid="row.player2.avatarValid"
                    />
                    <span class="player-name">{{ row.player2.name || '未知' }}</span>
                  </template>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="胜负" width="100" align="center">
              <template #default="{ row }">
                <span class="stat-value wins-losses">{{ row.wins }}-{{ row.losses }}</span>
              </template>
            </el-table-column>
            <!-- 如果启用积分排名，显示积分相关列；否则显示胜率 -->
            <el-table-column v-if="!useScoreRanking" label="胜率" width="120" align="center">
              <template #default="{ row }">
                <span class="stat-value win-rate">{{ row.winRate }}%</span>
              </template>
            </el-table-column>
            <el-table-column v-if="useScoreRanking" label="总积分" width="100" align="center">
              <template #default="{ row }">
                <span class="stat-value score">{{ row.score || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="useScoreRanking" label="局胜分" width="100" align="center">
              <template #default="{ row }">
                <span class="stat-value base-score">{{ row.baseScore || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="useScoreRanking" label="奖励分" width="100" align="center">
              <template #default="{ row }">
                <span class="stat-value reward-score">{{ row.rewardScore || 0 }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-empty v-else description="暂无参赛选手" />
      </div>
      </div>
      
      <!-- 操作流水标签页 -->
      <div v-show="activeTab === 'logs'" v-loading="logsLoading">
        <div style="margin-bottom: 15px;">
          <el-select
            v-model="selectedGameId"
            placeholder="筛选场次（全部）"
            clearable
            style="width: 200px;"
            @change="loadScoreLogs"
          >
            <el-option
              v-for="game in games"
              :key="game._id"
              :label="`第${game.order}场`"
              :value="game._id"
            />
          </el-select>
        </div>
        
        <el-table :data="scoreLogs" stripe border v-if="scoreLogs.length > 0">
          <el-table-column label="操作时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createDate || row.createdate) }}
            </template>
          </el-table-column>
          <el-table-column label="场次" width="100" align="center">
            <template #default="{ row }">
              <span v-if="getGameOrder(row.gameid)">
                第{{ getGameOrder(row.gameid) }}场
              </span>
              <span v-else style="color: #999;">-</span>
            </template>
          </el-table-column>
          <el-table-column label="比分变更" width="200" align="center">
            <template #default="{ row }">
              <div class="score-change">
                <span class="old-score">
                  {{ formatScore(row.oldScore1 || row.oldscore1) }}:{{ formatScore(row.oldScore2 || row.oldscore2) }}
                </span>
                <el-icon style="margin: 0 8px; color: #409eff;"><ArrowRight /></el-icon>
                <span class="new-score">
                  {{ formatScore(row.newScore1 || row.newscore1) }}:{{ formatScore(row.newScore2 || row.newscore2) }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作来源" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="(row.operatorType || row.operatortype) === 'admin' ? 'success' : 'info'" size="small">
                {{ (row.operatorType || row.operatortype) === 'admin' ? '管理台' : '小程序' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作者" width="150">
            <template #default="{ row }">
              <div style="font-size: 14px; color: #333;">
                {{ (row.operatorType || row.operatortype) === 'wechat' && row.operatorName ? row.operatorName : row.operator }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="备注" min-width="150">
            <template #default="{ row }">
              <span v-if="row.remark">{{ row.remark }}</span>
              <span v-else style="color: #999;">-</span>
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-else description="暂无操作流水记录" />
        
        <!-- 分页 -->
        <div v-if="logsTotal > 0" style="margin-top: 15px; text-align: right;">
          <el-pagination
            v-model:current-page="logsPageNum"
            v-model:page-size="logsPageSize"
            :total="logsTotal"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleLogsPageSizeChange"
            @current-change="handleLogsPageChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { matchesApi } from '@/api/matches'
import { gamesApi } from '@/api/games'
import { ElMessage, ElMessageBox } from 'element-plus'
import Avatar from '@/components/Avatar.vue'

const route = useRoute()
const router = useRouter()
const matchId = route.params.id
const isEdit = computed(() => route.query.edit === 'true')
const loading = ref(false)
const gamesLoading = ref(false)
const match = ref(null)
const games = ref([])
const editingScoreIndex = ref(-1)
const editingScore = ref({ score1: 0, score2: 0 })
const qrcodeGenerating = ref(false)
const savingScore = ref(false)
const activeTab = ref('enrollment')
const scoreLogs = ref([])
const logsLoading = ref(false)
const logsPageNum = ref(1)
const logsPageSize = ref(20)
const logsTotal = ref(0)
const selectedGameId = ref('')
const ranking = ref([])
const rankingLoading = ref(false)
const useScoreRanking = ref(false) // 是否启用积分排名
const enrollment = ref([])
const enrollmentLoading = ref(false)

onMounted(() => {
  loadMatchDetail()
  loadGames()
  // 默认显示报名情况tab，加载报名数据
  if (activeTab.value === 'enrollment') {
    loadEnrollment()
  }
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
    // console.log('设置后的 games:', games.value)
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
    'none': '无固定搭档',
    'fixpair': '固定搭档',
    'fix': '固定搭档', // 向后兼容
    'group': '分组比赛'
  }
  return typeMap[type] || type || '未知'
}

const getTypeTagType = (type) => {
  const typeTagMap = {
    'none': 'info',
    'fixpair': 'success',
    'fix': 'success', // 向后兼容
    'group': 'warning'
  }
  return typeTagMap[type] || 'info'
}

// 计算比赛进度百分比
const matchProgress = computed(() => {
  if (!match.value || !match.value.total || match.value.total === 0) {
    return 0
  }
  const finish = match.value.finish || 0
  const total = match.value.total || 0
  return Math.round((finish / total) * 100)
})

// 获取进度条状态
const matchProgressStatus = computed(() => {
  const progress = matchProgress.value
  if (progress === 0) {
    return null // 未开始，显示默认颜色
  } else if (progress === 100) {
    return 'success' // 已完成，显示绿色
  } else {
    return null // 进行中，显示默认颜色
  }
})

// 格式化进度显示
const formatProgress = (percentage) => {
  return `${percentage}%`
}

// 获取进度状态文本
const getProgressStatusText = (progress) => {
  if (progress === 0) {
    return '未开始'
  } else if (progress === 100) {
    return '已完成'
  } else {
    return '进行中'
  }
}

// 获取进度标签类型
const getProgressTagType = (progress) => {
  if (progress === 0) {
    return 'info'
  } else if (progress === 100) {
    return 'success'
  } else {
    return 'warning'
  }
}

const editScore = (row, index) => {
  editingScoreIndex.value = index
  editingScore.value = {
    score1: (row.score1 != null && row.score1 >= 0) ? row.score1 : 0,
    score2: (row.score2 != null && row.score2 >= 0) ? row.score2 : 0
  }
}

const cancelEditScore = () => {
  editingScoreIndex.value = -1
  editingScore.value = { score1: 0, score2: 0 }
}

const saveScore = async (row, index) => {
  if (editingScore.value.score1 < 0 || editingScore.value.score2 < 0) {
    ElMessage.warning('请输入有效的比分（不能为负数）')
    return
  }
  
  // 确保比分至少为0
  if (editingScore.value.score1 === null || editingScore.value.score1 === undefined) {
    editingScore.value.score1 = 0
  }
  if (editingScore.value.score2 === null || editingScore.value.score2 === undefined) {
    editingScore.value.score2 = 0
  }

  savingScore.value = true
  try {
    await gamesApi.updateScore(row._id, {
      score1: editingScore.value.score1,
      score2: editingScore.value.score2
    })
    
    ElMessage.success('比分更新成功')
    
    // 更新本地数据
    games.value[index].score1 = editingScore.value.score1
    games.value[index].score2 = editingScore.value.score2
    
    // 重新加载赛事详情以更新完成场次和进度
    await loadMatchDetail()
    
    // 如果当前在操作流水标签页，重新加载流水
    if (activeTab.value === 'logs') {
      await loadScoreLogs()
    }
    
    // 如果当前在排名统计标签页，重新加载排名
    if (activeTab.value === 'ranking') {
      await loadRanking()
    }
    
    cancelEditScore()
  } catch (error) {
    ElMessage.error('更新比分失败：' + (error.response?.data?.msg || error.message))
  } finally {
    savingScore.value = false
  }
}

const handleTabChange = async (tabName) => {
  // 每次切换标签时都重新加载赛事详情（因为每个标签页都显示完成场次等信息）
  await loadMatchDetail()
  
  // 根据切换的标签加载对应的数据
  if (tabName === 'enrollment') {
    await loadEnrollment()
  } else if (tabName === 'games') {
    await loadGames()
  } else if (tabName === 'ranking') {
    await loadRanking()
  } else if (tabName === 'logs') {
    await loadScoreLogs()
  }
}

const loadScoreLogs = async () => {
  if (!matchId) return
  
  logsLoading.value = true
  try {
    const params = {
      matchid: matchId,
      pageNum: logsPageNum.value,
      pageSize: logsPageSize.value
    }
    
    if (selectedGameId.value) {
      params.gameid = selectedGameId.value
    }
    
    const response = await gamesApi.getScoreLogs(params)
    scoreLogs.value = response.data.list || []
    logsTotal.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载操作流水失败：' + (error.response?.data?.msg || error.message))
  } finally {
    logsLoading.value = false
  }
}

const handleLogsPageChange = (page) => {
  logsPageNum.value = page
  loadScoreLogs()
}

const handleLogsPageSizeChange = (size) => {
  logsPageSize.value = size
  logsPageNum.value = 1
  loadScoreLogs()
}

const getGameOrder = (gameId) => {
  const game = games.value.find(g => g._id === gameId)
  return game ? game.order : null
}

const formatScore = (score) => {
  if (score == null || score === undefined) {
    return 0
  }
  // 如果score是-1，转换为0显示
  if (score < 0) {
    return 0
  }
  return score
}

// 加载排名统计
const loadRanking = async () => {
  if (!matchId) return
  
  rankingLoading.value = true
  try {
    const response = await matchesApi.getRanking(matchId)
    ranking.value = response.data || []
    // 检查是否启用积分排名（如果排名数据中有score字段，则认为启用了积分排名）
    useScoreRanking.value = ranking.value.length > 0 && 
      ranking.value.some(item => item.score !== undefined)
  } catch (error) {
    ElMessage.error('加载排名统计失败：' + (error.response?.data?.msg || error.message))
    ranking.value = []
    useScoreRanking.value = false
  } finally {
    rankingLoading.value = false
  }
}

// 获取排名样式类
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return ''
}

// 生成小程序码
const generateQRCode = async () => {
  if (!matchId) return
  
  qrcodeGenerating.value = true
  try {
    const response = await matchesApi.getQRCode(matchId)
    if (response.data && response.data.qrcodeUrl) {
      match.value.qrcodeUrl = response.data.qrcodeUrl
      ElMessage.success('小程序码生成成功')
    }
  } catch (error) {
    ElMessage.error('生成小程序码失败：' + (error.response?.data?.msg || error.message))
  } finally {
    qrcodeGenerating.value = false
  }
}

// 刷新小程序码
const refreshQRCode = async () => {
  try {
    await ElMessageBox.confirm('确定要重新生成小程序码吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 先清除旧的小程序码URL，强制重新生成
    match.value.qrcodeUrl = null
    await generateQRCode()
  } catch (error) {
    // 用户取消
  }
}

// 下载小程序码
const downloadQRCode = () => {
  if (!match.value.qrcodeUrl) {
    ElMessage.warning('小程序码不存在')
    return
  }
  
  // 创建一个临时的a标签来下载图片
  const link = document.createElement('a')
  link.href = match.value.qrcodeUrl
  link.download = `match_${matchId}_qrcode.png`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 提取报名信息
const extractEnrollment = (games) => {
  if (!games || games.length === 0) {
    return []
  }
  
  // 辅助函数：提取player ID
  const getPlayerId = (player) => {
    if (!player) return null
    if (typeof player === 'string') {
      return player
    }
    return player._id || player.id || player
  }
  
  // 根据比赛类型决定显示方式
  const matchType = match.value?.type || 'none'
  const isPairMode = matchType === 'fixpair' || matchType === 'fix' || matchType === 'group'
  
  const enrollmentMap = new Map() // 用于去重
  const processedPairs = new Set() // 已处理的配对
  
  games.forEach(game => {
    if (isPairMode) {
      // 固定搭档或分组模式：player1和player2是一对，player3和player4是一对
      if (game.player1 && game.player2) {
        const player1Id = getPlayerId(game.player1)
        const player2Id = getPlayerId(game.player2)
        const pairKey1 = [player1Id, player2Id].sort().join('_')
        if (!processedPairs.has(pairKey1)) {
          processedPairs.add(pairKey1)
          enrollmentMap.set(pairKey1, {
            player1: game.player1,
            player2: game.player2,
            index: enrollmentMap.size + 1
          })
        }
      }
      if (game.player3 && game.player4) {
        const player3Id = getPlayerId(game.player3)
        const player4Id = getPlayerId(game.player4)
        const pairKey2 = [player3Id, player4Id].sort().join('_')
        if (!processedPairs.has(pairKey2)) {
          processedPairs.add(pairKey2)
          enrollmentMap.set(pairKey2, {
            player1: game.player3,
            player2: game.player4,
            index: enrollmentMap.size + 1
          })
        }
      }
    } else {
      // 不固定模式：每个选手单独显示（按人员列表）
      const players = [game.player1, game.player2, game.player3, game.player4].filter(Boolean)
      players.forEach(player => {
        const playerId = getPlayerId(player)
        if (playerId && !enrollmentMap.has(playerId)) {
          enrollmentMap.set(playerId, {
            player1: player,
            player2: null,
            index: enrollmentMap.size + 1
          })
        }
      })
    }
  })
  
  return Array.from(enrollmentMap.values())
}

// 加载报名情况
const loadEnrollment = async () => {
  if (!matchId) return
  
  enrollmentLoading.value = true
  try {
    // 确保 match 数据已加载
    if (!match.value) {
      await loadMatchDetail()
    }
    
    // 加载games数据
    const response = await matchesApi.getGames(matchId)
    let gamesData = response.data || []
    
    // 处理玩家头像 URL（与服务端返回的 avatarValid 保持一致）
    for (const game of gamesData) {
      for (let i = 1; i <= 4; i++) {
        const player = game[`player${i}`]
        if (player) {
          // 统一处理 avatarUrl 字段（可能返回的是 avatarurl）
          const avatarUrl = player.avatarUrl || player.avatarurl || ''
          player.avatarUrl = avatarUrl || ''
          // 使用服务端返回的 avatarValid，如果没有则默认为 true（向后兼容）
          player.avatarValid = player.avatarValid !== undefined ? player.avatarValid : (avatarUrl ? true : false)
        }
      }
    }
    
    // 从games数据中提取报名信息
    enrollment.value = extractEnrollment(gamesData)
  } catch (error) {
    ElMessage.error('加载报名情况失败：' + (error.response?.data?.msg || error.message))
    enrollment.value = []
  } finally {
    enrollmentLoading.value = false
  }
}
</script>

<style scoped>
.remark-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qrcode-container-compact {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.qrcode-image-compact {
  width: 100px;
  height: 100px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 4px;
  background: #fff;
  flex-shrink: 0;
}

.qrcode-actions-compact {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.qrcode-loading-compact {
  display: flex;
  align-items: center;
}
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
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-separator {
  color: #999;
  font-size: 14px;
  margin: 0 4px;
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
  margin: 0 5px;
}

.score-edit-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-direction: column;
}

.score-change {
  display: flex;
  align-items: center;
  justify-content: center;
}

.old-score {
  color: #999;
  text-decoration: line-through;
}

.new-score {
  color: #409eff;
  font-weight: bold;
}

.rank-number {
  font-size: 18px;
  font-weight: bold;
  color: #666;
}

.rank-gold {
  color: #ffd700;
  font-size: 20px;
}

.rank-silver {
  color: #c0c0c0;
  font-size: 20px;
}

.rank-bronze {
  color: #cd7f32;
  font-size: 20px;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
}

.stat-value.wins-losses {
  color: #333;
  font-weight: 500;
}

.stat-value.win-rate {
  color: #409eff;
  font-weight: bold;
}

.stat-value.score {
  color: #e6a23c;
  font-weight: bold;
  font-size: 16px;
}

.stat-value.base-score {
  color: #67c23a;
}

.stat-value.reward-score {
  color: #f56c6c;
}

.progress-container {
  width: 100%;
}

.progress-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.match-realtime-info {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 15px 20px;
  margin-bottom: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.realtime-info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.realtime-info-item.progress-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #303133;
  font-weight: bold;
}

.progress-container {
  flex: 1;
  max-width: 400px;
}

.enrollment-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 15px 20px;
  margin-bottom: 20px;
  background: #f0f7ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.enrollment-info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.enrollment-players {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.player-separator {
  color: #999;
  font-size: 16px;
  font-weight: bold;
  margin: 0 4px;
}
</style>
