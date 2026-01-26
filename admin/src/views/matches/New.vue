<template>
  <div class="match-new">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>新建赛事</span>
        </div>
      </template>
      <el-form :model="matchForm" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="俱乐部" prop="clubid">
          <el-select
            v-model="matchForm.clubid"
            placeholder="请选择俱乐部"
            filterable
            remote
            :remote-method="searchClubs"
            :loading="clubSearchLoading"
            style="width: 100%;"
            @focus="handleClubSelectFocus"
            @change="handleClubChange"
          >
            <el-option
              v-for="club in clubs"
              :key="club._id"
              :label="club.wholeName || club.shortName"
              :value="club._id"
            >
              <span>{{ club.wholeName || club.shortName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="赛事名称" prop="name">
          <el-input v-model="matchForm.name" placeholder="请输入赛事名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="matchForm.type" placeholder="请选择类型" style="width: 100%;" @change="handleTypeChange">
            <el-option label="无固定" value="none" />
            <el-option label="固定搭档" value="fix" />
            <el-option label="分组" value="group" />
          </el-select>
        </el-form-item>
        
        <!-- 选手选择区域 -->
        <el-form-item v-if="matchForm.clubid" label="选择选手">
          <div style="width: 100%;">
            <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
              <el-input
                v-model="playerSearchKeyword"
                placeholder="搜索成员姓名"
                clearable
                style="width: 250px;"
                @input="handlePlayerSearch"
                @clear="handlePlayerSearchClear"
              />
              <el-button type="primary" @click="showAddPlayerDialog = true">新建成员</el-button>
              <span style="color: #999; font-size: 12px;">
                共 {{ playersTotal }} 名成员，已选择 {{ selectedPlayers.length }} 名
              </span>
            </div>
            
            <!-- 已选选手显示 -->
            <div v-if="selectedPlayers.length > 0" style="margin-bottom: 15px;">
              <div style="font-weight: bold; margin-bottom: 8px;">已选择 ({{ selectedPlayers.length }})</div>
              <div class="selected-players">
                <el-tag
                  v-for="(player, index) in selectedPlayers"
                  :key="player._id || index"
                  closable
                  @close="removePlayer(index)"
                  class="selected-player-tag"
                >
                  <Avatar 
                    :avatar-url="player.avatarUrl" 
                    :name="player.name || '未知'" 
                    :size="18"
                    class="selected-player-avatar"
                  />
                  <span class="selected-player-name">{{ player.name || '未知' }}</span>
                </el-tag>
              </div>
            </div>

            <!-- 成员列表 -->
            <div v-loading="playersLoading" style="border: 1px solid #dcdfe6; border-radius: 4px; padding: 10px; min-height: 200px;">
              <div v-if="displayPlayers.length === 0 && !playersLoading" style="text-align: center; color: #999; padding: 40px;">
                {{ playerSearchKeyword ? '未找到匹配的成员' : '暂无可用成员' }}
              </div>
              <div v-else class="players-grid">
                <div
                  v-for="player in displayPlayers"
                  :key="player._id"
                  class="player-item"
                  :class="{ 'player-selected': isPlayerSelected(player._id) }"
                  @click="togglePlayer(player)"
                >
                  <Avatar 
                    :avatar-url="player.avatarUrl" 
                    :name="player.name || '未知'" 
                    :size="40"
                  />
                  <span class="player-name">{{ player.name || '未知' }}</span>
                  <el-icon v-if="isPlayerSelected(player._id)" class="player-check-icon">
                    <CheckCircle />
                  </el-icon>
                </div>
              </div>
              
              <!-- 分页 -->
              <div v-if="playersTotal > playersPageSize" style="margin-top: 15px; text-align: right; border-top: 1px solid #ebeef5; padding-top: 15px;">
                <el-pagination
                  v-model:current-page="playersPageNum"
                  v-model:page-size="playersPageSize"
                  :total="playersTotal"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next"
                  @size-change="handlePlayersPageSizeChange"
                  @current-change="handlePlayersPageChange"
                />
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="玩家数">
          <el-input-number v-model="matchForm.playerCount" :min="0" :max="1000" :disabled="true" />
          <span style="margin-left: 10px; color: #999; font-size: 12px;">根据选择的选手自动计算</span>
        </el-form-item>
        <el-form-item label="创建者">
          <el-input v-model="matchForm.owner" placeholder="请输入创建者（默认：admin）" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="matchForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注（可选）"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 新建成员对话框 -->
    <el-dialog v-model="showAddPlayerDialog" title="新建成员" width="500px">
      <el-form :model="newPlayerForm" label-width="100px" ref="newPlayerFormRef">
        <el-form-item label="姓名" prop="name" :rules="[{ required: true, message: '请输入姓名', trigger: 'blur' }]">
          <el-input v-model="newPlayerForm.name" placeholder="请输入成员姓名" />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="newPlayerForm.avatarUrl" placeholder="请输入头像URL（可选）" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="newPlayerForm.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddPlayerDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreatePlayer" :loading="createPlayerLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { matchesApi } from '@/api/matches'
import { clubsApi } from '@/api/clubs'
import { playersApi } from '@/api/players'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import Avatar from '@/components/Avatar.vue'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref(null)
const newPlayerFormRef = ref(null)
const loading = ref(false)
const clubSearchLoading = ref(false)
const playersLoading = ref(false)
const createPlayerLoading = ref(false)
const clubs = ref([])
const allPlayers = ref([])
const selectedPlayers = ref([])
const playerSearchKeyword = ref('')
const showAddPlayerDialog = ref(false)
const playersPageNum = ref(1)
const playersPageSize = ref(10)
const playersTotal = ref(0)
const searchTimer = ref(null)

const matchForm = ref({
  clubid: '',
  name: '',
  type: 'none',
  playerCount: 0,
  owner: 'admin',
  remark: ''
})

const newPlayerForm = ref({
  name: '',
  avatarUrl: '',
  gender: 0
})

// 如果是俱乐部管理员，自动设置俱乐部ID
const isClubAdmin = computed(() => authStore.admin?.role === 'club_admin')
if (isClubAdmin.value && authStore.admin?.clubid) {
  matchForm.value.clubid = authStore.admin.clubid
  // 加载俱乐部信息
  clubsApi.getById(authStore.admin.clubid).then(response => {
    if (response.data) {
      clubs.value = [response.data]
      loadPlayers(authStore.admin.clubid)
    }
  }).catch(() => {})
}

// 当前页显示的成员列表（排除已选择的）
const displayPlayers = computed(() => {
  return allPlayers.value.filter(p => !isPlayerSelected(p._id))
})

// 监听类型变化，更新玩家数
watch(() => matchForm.value.type, () => {
  updatePlayerCount()
})

const rules = {
  clubid: [
    { required: true, message: '请选择俱乐部', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入赛事名称', trigger: 'blur' }
  ]
}

const searchClubs = async (keyword) => {
  if (!keyword) {
    clubs.value = []
    return
  }
  clubSearchLoading.value = true
  try {
    const response = await clubsApi.search(keyword, 20)
    clubs.value = response.data.list || []
  } catch (error) {
    console.error('搜索俱乐部失败:', error)
  } finally {
    clubSearchLoading.value = false
  }
}

const handleClubSelectFocus = async () => {
  if (clubs.value.length === 0) {
    clubSearchLoading.value = true
    try {
      const response = await clubsApi.search('', 50)
      clubs.value = response.data.list || []
    } catch (error) {
      console.error('加载俱乐部列表失败:', error)
    } finally {
      clubSearchLoading.value = false
    }
  }
}

const handleClubChange = (clubid) => {
  if (clubid) {
    playerSearchKeyword.value = ''
    playersPageNum.value = 1
    loadPlayers(clubid, true)
  } else {
    allPlayers.value = []
    selectedPlayers.value = []
    matchForm.value.playerCount = 0
    playersTotal.value = 0
  }
}

const handleTypeChange = () => {
  updatePlayerCount()
}

const loadPlayers = async (clubid, resetPage = true) => {
  if (!clubid) return
  
  if (resetPage) {
    playersPageNum.value = 1
  }
  
  playersLoading.value = true
  try {
    const params = {
      pageNum: playersPageNum.value,
      pageSize: playersPageSize.value
    }
    
    if (playerSearchKeyword.value) {
      params.keyword = playerSearchKeyword.value
    }
    
    const response = await playersApi.list(clubid, params)
    allPlayers.value = response.data.list || []
    playersTotal.value = response.data.total || 0
  } catch (error) {
    console.error('加载成员列表失败:', error)
    ElMessage.error('加载成员列表失败：' + error.message)
  } finally {
    playersLoading.value = false
  }
}

const handlePlayerSearch = () => {
  // 防抖处理
  if (searchTimer.value) {
    clearTimeout(searchTimer.value)
  }
  
  searchTimer.value = setTimeout(() => {
    if (matchForm.value.clubid) {
      loadPlayers(matchForm.value.clubid, true)
    }
  }, 300)
}

const handlePlayerSearchClear = () => {
  if (matchForm.value.clubid) {
    loadPlayers(matchForm.value.clubid, true)
  }
}

const handlePlayersPageChange = (page) => {
  playersPageNum.value = page
  if (matchForm.value.clubid) {
    loadPlayers(matchForm.value.clubid, false)
  }
}

const handlePlayersPageSizeChange = (size) => {
  playersPageSize.value = size
  playersPageNum.value = 1
  if (matchForm.value.clubid) {
    loadPlayers(matchForm.value.clubid, false)
  }
}

const isPlayerSelected = (playerId) => {
  return selectedPlayers.value.some(p => p._id === playerId)
}

const togglePlayer = (player) => {
  const index = selectedPlayers.value.findIndex(p => p._id === player._id)
  if (index >= 0) {
    selectedPlayers.value.splice(index, 1)
  } else {
    // 根据类型决定如何添加
    if (matchForm.value.type === 'fix' || matchForm.value.type === 'group') {
      // 固定搭档和分组类型，需要成对添加
      // 这里简化处理，直接添加单个选手
      selectedPlayers.value.push(player)
    } else {
      // 无固定类型，直接添加
      selectedPlayers.value.push(player)
    }
  }
  updatePlayerCount()
}

const removePlayer = (index) => {
  selectedPlayers.value.splice(index, 1)
  updatePlayerCount()
}

const updatePlayerCount = () => {
  if (matchForm.value.type === 'fix' || matchForm.value.type === 'group') {
    // 固定搭档和分组类型，玩家数 = 选中选手数（需要是偶数）
    matchForm.value.playerCount = selectedPlayers.value.length
  } else {
    // 无固定类型，玩家数 = 选中选手数
    matchForm.value.playerCount = selectedPlayers.value.length
  }
}

const handleCreatePlayer = async () => {
  if (!newPlayerFormRef.value) return
  
  await newPlayerFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!matchForm.value.clubid) {
        ElMessage.warning('请先选择俱乐部')
        return
      }
      
      createPlayerLoading.value = true
      try {
        const response = await playersApi.create({
          clubid: matchForm.value.clubid,
          name: newPlayerForm.value.name,
          avatarUrl: newPlayerForm.value.avatarUrl,
          gender: newPlayerForm.value.gender
        })
        
        // 添加到选中列表
        selectedPlayers.value.push(response.data)
        updatePlayerCount()
        
        // 如果当前没有搜索关键词，添加到列表显示
        if (!playerSearchKeyword.value) {
          allPlayers.value.push(response.data)
          playersTotal.value += 1
        }
        
        // 重置表单
        newPlayerForm.value = {
          name: '',
          avatarUrl: '',
          gender: 0
        }
        showAddPlayerDialog.value = false
        
        ElMessage.success('创建成员成功')
      } catch (error) {
        ElMessage.error('创建成员失败：' + (error.response?.data?.msg || error.message))
      } finally {
        createPlayerLoading.value = false
      }
    }
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 验证选手数量
      if (selectedPlayers.value.length === 0) {
        ElMessage.warning('请至少选择一个选手')
        return
      }
      
      if (matchForm.value.type === 'fix' || matchForm.value.type === 'group') {
        if (selectedPlayers.value.length < 4) {
          ElMessage.warning('固定搭档和分组类型至少需要4个选手')
          return
        }
        if (selectedPlayers.value.length % 2 !== 0) {
          ElMessage.warning('固定搭档和分组类型需要偶数个选手')
          return
        }
      } else {
        if (selectedPlayers.value.length < 4) {
          ElMessage.warning('至少需要4个选手')
          return
        }
        if (selectedPlayers.value.length > 8) {
          ElMessage.warning('最多支持8个选手')
          return
        }
      }
      
      loading.value = true
      try {
        // 提取选手ID数组
        const playerIds = selectedPlayers.value.map(p => p._id)
        
        const response = await matchesApi.create({
          clubid: matchForm.value.clubid,
          name: matchForm.value.name,
          type: matchForm.value.type,
          playerCount: matchForm.value.playerCount,
          owner: matchForm.value.owner || 'admin',
          remark: matchForm.value.remark || '',
          players: playerIds
        })
        ElMessage.success('创建成功')
        router.push(`/matches/${response.data._id}`)
      } catch (error) {
        ElMessage.error('创建失败：' + (error.response?.data?.msg || error.message))
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
.match-new {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-players {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selected-player-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  height: auto;
  line-height: 1.5;
}

.selected-player-avatar {
  flex-shrink: 0;
  vertical-align: middle;
}

.selected-player-name {
  vertical-align: middle;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.player-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  min-height: 100px;
}

.player-item:hover {
  background-color: #f5f7fa;
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-item.player-selected {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.player-name {
  margin-top: 8px;
  text-align: center;
  font-size: 14px;
  word-break: break-word;
  max-width: 100%;
}

.player-check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #409eff;
  font-size: 18px;
}
</style>
