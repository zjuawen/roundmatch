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
          <el-descriptions-item label="小程序码" :span="2">
            <div v-if="match.qrcodeUrl" class="qrcode-container">
              <img :src="match.qrcodeUrl" alt="小程序码" class="qrcode-image" />
              <div class="qrcode-actions">
                <el-button size="small" @click="downloadQRCode">下载</el-button>
                <el-button size="small" @click="refreshQRCode">刷新</el-button>
              </div>
            </div>
            <div v-else class="qrcode-loading">
              <el-button size="small" type="primary" @click="generateQRCode" :loading="qrcodeGenerating">
                生成小程序码
              </el-button>
            </div>
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
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="对阵情况" name="games"></el-tab-pane>
          <el-tab-pane label="排名统计" name="ranking"></el-tab-pane>
          <el-tab-pane label="操作流水" name="logs"></el-tab-pane>
        </el-tabs>
      </template>
      
      <!-- 对阵情况标签页 -->
      <div v-show="activeTab === 'games'">
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
                      />
                      <span class="player-name">{{ row.player1.name || '未知' }}</span>
                    </div>
                    <span v-if="row.player1 && row.player2" class="player-separator">/</span>
                    <div class="player-item" v-if="row.player2">
                      <Avatar 
                        :avatar-url="row.player2.avatarUrl" 
                        :name="row.player2.name || '未知'"
                        :size="32"
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
                      />
                      <span class="player-name">{{ row.player3.name || '未知' }}</span>
                    </div>
                    <span v-if="row.player3 && row.player4" class="player-separator">/</span>
                    <div class="player-item" v-if="row.player4">
                      <Avatar 
                        :avatar-url="row.player4.avatarUrl" 
                        :name="row.player4.name || '未知'"
                        :size="32"
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
      <div v-show="activeTab === 'ranking'" v-loading="rankingLoading">
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
                  />
                  <span class="player-name">{{ row.player.name || '未知' }}</span>
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
                {{ row.operator }}
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
const activeTab = ref('games')
const scoreLogs = ref([])
const logsLoading = ref(false)
const logsPageNum = ref(1)
const logsPageSize = ref(20)
const logsTotal = ref(0)
const selectedGameId = ref('')
const ranking = ref([])
const rankingLoading = ref(false)
const useScoreRanking = ref(false) // 是否启用积分排名

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
    'none': '无固定',
    'fix': '固定搭档',
    'group': '分组'
  }
  return typeMap[type] || type || '未知'
}

const getTypeTagType = (type) => {
  const typeTagMap = {
    'none': 'info',
    'fix': 'success',
    'group': 'warning'
  }
  return typeTagMap[type] || 'info'
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
    
    // 重新加载赛事详情以更新完成场次
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

const handleTabChange = (tabName) => {
  if (tabName === 'logs' && scoreLogs.value.length === 0) {
    loadScoreLogs()
  } else if (tabName === 'ranking' && ranking.value.length === 0) {
    loadRanking()
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
</script>

<style scoped>
.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.qrcode-image {
  width: 200px;
  height: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background: #fff;
}

.qrcode-actions {
  display: flex;
  gap: 8px;
}

.qrcode-loading {
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

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.qrcode-image {
  width: 200px;
  height: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background: #fff;
}

.qrcode-actions {
  display: flex;
  gap: 8px;
}

.qrcode-loading {
  display: flex;
  align-items: center;
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
</style>
