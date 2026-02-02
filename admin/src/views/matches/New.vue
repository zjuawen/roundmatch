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
            <el-option label="固定搭档" value="fixpair" />
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
                共 {{ playersTotal }} 名成员
                <template v-if="matchForm.type === 'none'">
                  ，已选择 {{ selectedPlayers.length }} 名
                </template>
                <template v-else>
                  ，已配对 {{ selectedPlayerPairs.length }} 组
                </template>
              </span>
            </div>
            
            <!-- 无固定类型：已选选手显示 -->
            <div v-if="matchForm.type === 'none' && selectedPlayers.length > 0" style="margin-bottom: 15px;">
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

            <!-- 固定搭档类型：配对显示 -->
            <div v-if="matchForm.type === 'fixpair'" style="margin-bottom: 15px;">
              <div style="font-weight: bold; margin-bottom: 8px;">
                已配对 ({{ selectedPlayerPairs.filter(p => p.player1 || p.player2).length }} 组)
                <span style="color: #999; font-size: 12px; font-weight: normal; margin-left: 10px;">
                  共 {{ selectedPlayerPairs.reduce((sum, p) => sum + (p.player1 ? 1 : 0) + (p.player2 ? 1 : 0), 0) }} 名选手
                </span>
              </div>
              <div class="player-pairs-container">
                <div
                  v-for="(pair, index) in selectedPlayerPairs"
                  :key="index"
                  class="player-pair-item"
                >
                  <div class="pair-label">第{{ index + 1 }}组合</div>
                  <div class="pair-players">
                  <div
                    class="pair-player-slot"
                    :class="{ 
                      'slot-empty': !pair.player1,
                      'slot-active': activeGroupSlot && activeGroupSlot.pairIndex === index && (activeGroupSlot.slot === 1 || (activeGroupSlot.slot === 2 && !pair.player2))
                    }"
                    @click="activateGroupSlot(index, 1)"
                  >
                    <Avatar 
                      v-if="pair.player1"
                      :avatar-url="pair.player1.avatarUrl" 
                      :name="pair.player1.name || '未知'" 
                      :size="50"
                    />
                    <div v-else class="slot-placeholder">
                      {{ activeGroupSlot && activeGroupSlot.pairIndex === index && (activeGroupSlot.slot === 1 || (activeGroupSlot.slot === 2 && !pair.player2)) ? '已激活，点击下方选择' : '点击激活' }}
                    </div>
                    <span v-if="pair.player1" class="pair-player-name">{{ pair.player1.name || '未知' }}</span>
                    <el-icon v-if="pair.player1" class="pair-remove-icon" @click.stop="removePairPlayer(index, 1)">
                      <Close />
                    </el-icon>
                  </div>
                  <div class="pair-connector">+</div>
                  <div
                    class="pair-player-slot"
                    :class="{ 
                      'slot-empty': !pair.player2,
                      'slot-active': activeGroupSlot && activeGroupSlot.pairIndex === index && (activeGroupSlot.slot === 2 || (activeGroupSlot.slot === 1 && !pair.player1))
                    }"
                    @click="activateGroupSlot(index, 2)"
                  >
                    <Avatar 
                      v-if="pair.player2"
                      :avatar-url="pair.player2.avatarUrl" 
                      :name="pair.player2.name || '未知'" 
                      :size="50"
                    />
                    <div v-else class="slot-placeholder">
                      {{ activeGroupSlot && activeGroupSlot.pairIndex === index && (activeGroupSlot.slot === 2 || (activeGroupSlot.slot === 1 && !pair.player1)) ? '已激活，点击下方选择' : '点击激活' }}
                    </div>
                    <span v-if="pair.player2" class="pair-player-name">{{ pair.player2.name || '未知' }}</span>
                    <el-icon v-if="pair.player2" class="pair-remove-icon" @click.stop="removePairPlayer(index, 2)">
                      <Close />
                    </el-icon>
                  </div>
                  </div>
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click="removePair(index)"
                    style="margin-top: 8px;"
                  >
                    删除此组合
                  </el-button>
                </div>
                <el-button
                  type="primary"
                  plain
                  @click="addNewPair"
                  style="width: 100%; margin-top: 10px;"
                >
                  + 添加新组
                </el-button>
              </div>
            </div>

            <!-- 分组类型：A组/B组显示 -->
            <div v-if="matchForm.type === 'group'" style="margin-bottom: 15px;">
              <div style="font-weight: bold; margin-bottom: 8px;">
                已分组 ({{ selectedPlayerPairs.filter(p => p.player1 || p.player2).length }} 组)
                <span style="color: #999; font-size: 12px; font-weight: normal; margin-left: 10px;">
                  共 {{ selectedPlayerPairs.reduce((sum, p) => sum + (p.player1 ? 1 : 0) + (p.player2 ? 1 : 0), 0) }} 名选手
                </span>
              </div>
              <div class="player-groups-container">
                <div class="group-header">
                  <div class="group-header-item group-a">A组</div>
                  <div class="group-header-item group-b">B组</div>
                </div>
                <div
                  v-for="(pair, index) in selectedPlayerPairs"
                  :key="index"
                  class="group-row"
                >
                  <div
                    class="group-player-slot group-a"
                    :class="{ 
                      'slot-empty': !pair.player1,
                      'slot-active': activeGroupSlot && activeGroupSlot.pairIndex === index && activeGroupSlot.slot === 1
                    }"
                    @click="activateGroupSlot(index, 1)"
                  >
                    <Avatar 
                      v-if="pair.player1"
                      :avatar-url="pair.player1.avatarUrl" 
                      :name="pair.player1.name || '未知'" 
                      :size="40"
                    />
                    <div v-else class="slot-placeholder">
                      {{ activeGroupSlot && activeGroupSlot.pairIndex === index && activeGroupSlot.slot === 1 ? '已激活，点击下方选择' : '点击激活' }}
                    </div>
                    <span v-if="pair.player1" class="group-player-name">{{ pair.player1.name || '未知' }}</span>
                    <el-icon v-if="pair.player1" class="group-remove-icon" @click.stop="removePairPlayer(index, 1)">
                      <Close />
                    </el-icon>
                  </div>
                  <div
                    class="group-player-slot group-b"
                    :class="{ 
                      'slot-empty': !pair.player2,
                      'slot-active': activeGroupSlot && activeGroupSlot.pairIndex === index && activeGroupSlot.slot === 2
                    }"
                    @click="activateGroupSlot(index, 2)"
                  >
                    <Avatar 
                      v-if="pair.player2"
                      :avatar-url="pair.player2.avatarUrl" 
                      :name="pair.player2.name || '未知'" 
                      :size="40"
                    />
                    <div v-else class="slot-placeholder">
                      {{ activeGroupSlot && activeGroupSlot.pairIndex === index && activeGroupSlot.slot === 2 ? '已激活，点击下方选择' : '点击激活' }}
                    </div>
                    <span v-if="pair.player2" class="group-player-name">{{ pair.player2.name || '未知' }}</span>
                    <el-icon v-if="pair.player2" class="group-remove-icon" @click.stop="removePairPlayer(index, 2)">
                      <Close />
                    </el-icon>
                  </div>
                </div>
                <el-button
                  type="primary"
                  plain
                  @click="addNewPair"
                  style="width: 100%; margin-top: 10px;"
                >
                  + 添加新组
                </el-button>
              </div>
            </div>

            <!-- 成员列表 -->
            <div v-loading="playersLoading" style="border: 1px solid #dcdfe6; border-radius: 4px; padding: 10px; min-height: 200px;">
              <div v-if="displayPlayers.length === 0 && !playersLoading" style="text-align: center; color: #999; padding: 40px;">
                {{ playerSearchKeyword ? '未找到匹配的成员' : '暂无可用成员' }}
              </div>
              <div v-else>
                <!-- 激活提示 -->
                <div v-if="activeGroupSlot && (matchForm.type === 'fixpair' || matchForm.type === 'group')" 
                     style="margin-bottom: 10px; padding: 8px; background-color: #ecf5ff; border: 1px solid #b3d8ff; border-radius: 4px; color: #409eff; font-size: 12px;">
                  <el-icon style="vertical-align: middle;"><InfoFilled /></el-icon>
                  <span style="margin-left: 5px;">
                    {{ matchForm.type === 'fixpair' ? `已激活第${activeGroupSlot.pairIndex + 1}组合${activeGroupSlot.slot === 1 ? '左侧' : '右侧'}位置，点击下方成员进行选择` : 
                       `已激活${activeGroupSlot.slot === 1 ? 'A组' : 'B组'}第${activeGroupSlot.pairIndex + 1}行，点击下方成员进行选择` }}
                  </span>
                  <el-button type="text" size="small" @click="activeGroupSlot = null" style="float: right; padding: 0; margin-top: -2px;">取消激活</el-button>
                </div>
                <div class="players-grid">
                  <div
                    v-for="player in displayPlayers"
                    :key="player._id"
                    class="player-item"
                    :class="{ 
                      'player-selected': isPlayerSelected(player._id),
                      'player-clickable': activeGroupSlot && (matchForm.type === 'fixpair' || matchForm.type === 'group')
                    }"
                    @click="handlePlayerClick(player)"
                  >
                    <Avatar 
                      :avatar-url="player.avatarUrl" 
                      :name="player.name || '未知'" 
                      :size="40"
                    />
                    <span class="player-name">{{ player.name || '未知' }}</span>
                    <el-icon v-if="isPlayerSelected(player._id) && matchForm.type === 'none'" class="player-check-icon">
                      <CheckCircle />
                    </el-icon>
                  </div>
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

    <!-- 选择选手对话框（用于配对/分组） -->
    <el-dialog v-model="showSelectPlayerDialog" title="选择选手" width="600px">
      <div v-loading="playersLoading">
        <el-input
          v-model="playerSearchKeyword"
          placeholder="搜索成员姓名"
          clearable
          style="margin-bottom: 15px;"
          @input="handlePlayerSearch"
          @clear="handlePlayerSearchClear"
        />
        <div v-if="displayPlayers.length === 0" style="text-align: center; color: #999; padding: 40px;">
          {{ playerSearchKeyword ? '未找到匹配的成员' : '暂无可用成员' }}
        </div>
        <div v-else class="players-grid-dialog">
          <div
            v-for="player in displayPlayers"
            :key="player._id"
            class="player-item-dialog"
            @click="selectPlayerForPair(player)"
          >
            <Avatar 
              :avatar-url="player.avatarUrl" 
              :name="player.name || '未知'" 
              :size="50"
            />
            <span class="player-name-dialog">{{ player.name || '未知' }}</span>
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
      <template #footer>
        <el-button @click="showSelectPlayerDialog = false">取消</el-button>
      </template>
    </el-dialog>

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
const selectedPlayerPairs = ref([])
const playerSearchKeyword = ref('')
const showAddPlayerDialog = ref(false)
const showSelectPlayerDialog = ref(false)
const currentPairIndex = ref(-1)
const currentPairSlot = ref(1) // 1 or 2
const activeGroupSlot = ref(null) // { pairIndex: number, slot: 1|2 } 或 null
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
  // 获取所有已选择的选手ID
  const selectedIds = new Set()
  
  if (matchForm.value.type === 'none') {
    // 无固定类型：排除已选择的单个选手
    selectedPlayers.value.forEach(p => selectedIds.add(p._id))
  } else {
    // 固定搭档和分组类型：排除已配对的选手
    selectedPlayerPairs.value.forEach(pair => {
      if (pair.player1) selectedIds.add(pair.player1._id)
      if (pair.player2) selectedIds.add(pair.player2._id)
    })
  }
  
  return allPlayers.value.filter(p => !selectedIds.has(p._id))
})

// 监听类型变化，切换选择模式
watch(() => matchForm.value.type, (newType, oldType) => {
  // 切换类型时清空选择
  if (newType !== oldType) {
    activeGroupSlot.value = null // 清空激活状态
    if (newType === 'none') {
      selectedPlayerPairs.value = []
    } else {
      selectedPlayers.value = []
      // 初始化配对数组
      if (selectedPlayerPairs.value.length === 0) {
        selectedPlayerPairs.value = [{ player1: null, player2: null }]
      }
    }
  }
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
    selectedPlayerPairs.value = []
    matchForm.value.playerCount = 0
    playersTotal.value = 0
  }
}

const handleTypeChange = () => {
  // 切换到固定搭档或分组类型时，确保有至少一个配对
  if ((matchForm.value.type === 'fixpair' || matchForm.value.type === 'group') && selectedPlayerPairs.value.length === 0) {
    selectedPlayerPairs.value = [{ player1: null, player2: null }]
  }
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

const handlePlayerClick = (player) => {
  // 如果有激活的分组框，填入到激活的位置
  if (activeGroupSlot.value && (matchForm.value.type === 'fixpair' || matchForm.value.type === 'group')) {
    const { pairIndex, slot } = activeGroupSlot.value
    
    // 确保配对数组有足够的元素
    while (selectedPlayerPairs.value.length <= pairIndex) {
      selectedPlayerPairs.value.push({ player1: null, player2: null })
    }
    
    // 设置选中的选手
    if (slot === 1) {
      selectedPlayerPairs.value[pairIndex].player1 = player
    } else {
      selectedPlayerPairs.value[pairIndex].player2 = player
    }
    
    // 对于固定搭档类型，保持激活状态，自动切换到该组合的另一个空位置
    if (matchForm.value.type === 'fixpair') {
      const pair = selectedPlayerPairs.value[pairIndex]
      // 如果两个位置都填满了，取消激活
      if (pair.player1 && pair.player2) {
        activeGroupSlot.value = null
      } else {
        // 否则自动切换到另一个空位置
        if (slot === 1 && !pair.player2) {
          activeGroupSlot.value = { pairIndex, slot: 2 }
        } else if (slot === 2 && !pair.player1) {
          activeGroupSlot.value = { pairIndex, slot: 1 }
        } else {
          // 如果另一个位置已经填满，取消激活
          activeGroupSlot.value = null
        }
      }
    } else {
      // 分组类型，选择后取消激活
      activeGroupSlot.value = null
    }
    
    updatePlayerCount()
    return
  }
  
  // 无固定类型，使用原来的逻辑
  if (matchForm.value.type === 'none') {
    togglePlayer(player)
  }
}

const togglePlayer = (player) => {
  // 只用于无固定类型
  if (matchForm.value.type !== 'none') return
  
  const index = selectedPlayers.value.findIndex(p => p._id === player._id)
  if (index >= 0) {
    selectedPlayers.value.splice(index, 1)
  } else {
    selectedPlayers.value.push(player)
  }
  updatePlayerCount()
}

const activateGroupSlot = (pairIndex, slot) => {
  // 确保配对数组存在
  while (selectedPlayerPairs.value.length <= pairIndex) {
    selectedPlayerPairs.value.push({ player1: null, player2: null })
  }
  
  const pair = selectedPlayerPairs.value[pairIndex]
  
  // 对于固定搭档类型，如果点击的是同一个组合的另一个位置，切换激活位置
  if (matchForm.value.type === 'fixpair' && activeGroupSlot.value && activeGroupSlot.value.pairIndex === pairIndex) {
    // 如果点击的是已激活的位置，且该位置已有选手，取消激活
    if (activeGroupSlot.value.slot === slot && ((slot === 1 && pair.player1) || (slot === 2 && pair.player2))) {
      activeGroupSlot.value = null
      return
    }
    // 如果点击的是同一个组合的另一个位置，切换激活位置
    if (activeGroupSlot.value.slot !== slot) {
      // 如果该位置已有选手，不允许激活
      if ((slot === 1 && pair.player1) || (slot === 2 && pair.player2)) {
        return
      }
      activeGroupSlot.value = { pairIndex, slot }
      return
    }
  }
  
  // 如果点击的是已激活的位置，取消激活
  if (activeGroupSlot.value && activeGroupSlot.value.pairIndex === pairIndex && activeGroupSlot.value.slot === slot) {
    activeGroupSlot.value = null
    return
  }
  
  // 如果该位置已有选手，不允许激活（需要先删除）
  if (pair && ((slot === 1 && pair.player1) || (slot === 2 && pair.player2))) {
    return
  }
  
  // 激活该位置
  activeGroupSlot.value = { pairIndex, slot }
}

const handlePairSlotClick = (pairIndex, slot) => {
  // 这个方法现在用于对话框模式（如果以后需要）
  currentPairIndex.value = pairIndex
  currentPairSlot.value = slot
  showSelectPlayerDialog.value = true
  // 重新加载成员列表（排除已选择的）
  if (matchForm.value.clubid) {
    loadPlayers(matchForm.value.clubid, true)
  }
}

const selectPlayerForPair = (player) => {
  if (currentPairIndex.value < 0) return
  
  // 确保配对数组有足够的元素
  while (selectedPlayerPairs.value.length <= currentPairIndex.value) {
    selectedPlayerPairs.value.push({ player1: null, player2: null })
  }
  
  // 设置选中的选手
  if (currentPairSlot.value === 1) {
    selectedPlayerPairs.value[currentPairIndex.value].player1 = player
  } else {
    selectedPlayerPairs.value[currentPairIndex.value].player2 = player
  }
  
  showSelectPlayerDialog.value = false
  updatePlayerCount()
}

const removePairPlayer = (pairIndex, slot) => {
  if (selectedPlayerPairs.value[pairIndex]) {
    if (slot === 1) {
      selectedPlayerPairs.value[pairIndex].player1 = null
    } else {
      selectedPlayerPairs.value[pairIndex].player2 = null
    }
    
    // 如果两个位置都为空，删除这个配对
    if (!selectedPlayerPairs.value[pairIndex].player1 && !selectedPlayerPairs.value[pairIndex].player2) {
      selectedPlayerPairs.value.splice(pairIndex, 1)
      // 如果删除后没有配对了，且当前是固定搭档或分组类型，至少保留一个空配对
      if (selectedPlayerPairs.value.length === 0 && (matchForm.value.type === 'fixpair' || matchForm.value.type === 'group')) {
        selectedPlayerPairs.value = [{ player1: null, player2: null }]
      }
      // 如果删除的位置在当前激活位置之前或相同，需要调整或取消激活
      if (activeGroupSlot.value) {
        if (activeGroupSlot.value.pairIndex === pairIndex) {
          activeGroupSlot.value = null
        } else if (activeGroupSlot.value.pairIndex > pairIndex) {
          activeGroupSlot.value.pairIndex -= 1
        }
      }
    } else {
      // 如果删除的是当前激活的位置，取消激活
      if (activeGroupSlot.value && activeGroupSlot.value.pairIndex === pairIndex && activeGroupSlot.value.slot === slot) {
        activeGroupSlot.value = null
      }
    }
  }
  updatePlayerCount()
}

const removePair = (pairIndex) => {
  selectedPlayerPairs.value.splice(pairIndex, 1)
  // 如果删除后没有配对了，且当前是固定搭档或分组类型，至少保留一个空配对
  if (selectedPlayerPairs.value.length === 0 && (matchForm.value.type === 'fixpair' || matchForm.value.type === 'group')) {
    selectedPlayerPairs.value = [{ player1: null, player2: null }]
  }
  // 如果删除的是当前激活的位置，取消激活
  if (activeGroupSlot.value && activeGroupSlot.value.pairIndex === pairIndex) {
    activeGroupSlot.value = null
  } else if (activeGroupSlot.value && activeGroupSlot.value.pairIndex > pairIndex) {
    // 如果删除的位置在当前激活位置之前，需要调整激活位置的索引
    activeGroupSlot.value.pairIndex -= 1
  }
  updatePlayerCount()
}

const addNewPair = () => {
  // 移除硬编码限制，由服务端验证最终限制
  // 前端允许添加更多组，但保存时会由服务端验证
  selectedPlayerPairs.value.push({ player1: null, player2: null })
}

const removePlayer = (index) => {
  selectedPlayers.value.splice(index, 1)
  updatePlayerCount()
}

const updatePlayerCount = () => {
  if (matchForm.value.type === 'fixpair' || matchForm.value.type === 'group') {
    // 固定搭档和分组类型，计算配对中的实际选手数
    let count = 0
    selectedPlayerPairs.value.forEach(pair => {
      if (pair.player1) count++
      if (pair.player2) count++
    })
    matchForm.value.playerCount = count
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
        
        // 根据类型添加到相应的列表
        if (matchForm.value.type === 'none') {
          selectedPlayers.value.push(response.data)
        } else {
          // 固定搭档和分组类型，添加到第一个空位
          if (selectedPlayerPairs.value.length === 0) {
            selectedPlayerPairs.value.push({ player1: response.data, player2: null })
          } else {
            let added = false
            for (let i = 0; i < selectedPlayerPairs.value.length; i++) {
              if (!selectedPlayerPairs.value[i].player1) {
                selectedPlayerPairs.value[i].player1 = response.data
                added = true
                break
              } else if (!selectedPlayerPairs.value[i].player2) {
                selectedPlayerPairs.value[i].player2 = response.data
                added = true
                break
              }
            }
            if (!added) {
              selectedPlayerPairs.value.push({ player1: response.data, player2: null })
            }
          }
        }
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
      let playerIds = []
      
      if (matchForm.value.type === 'none') {
        // 无固定类型
        if (selectedPlayers.value.length === 0) {
          ElMessage.warning('请至少选择一个选手')
          return
        }
        // 移除硬编码限制，由服务端验证
        playerIds = selectedPlayers.value.map(p => p._id)
      } else {
        // 固定搭档和分组类型
        // 检查是否有未完成的配对
        const incompletePairs = selectedPlayerPairs.value.filter(pair => !pair.player1 || !pair.player2)
        if (incompletePairs.length > 0) {
          ElMessage.warning('请完成所有配对，每个配对需要2名选手')
          return
        }
        
        // 检查配对数量（基本验证，详细限制由服务端决定）
        const completePairs = selectedPlayerPairs.value.filter(pair => pair.player1 && pair.player2)
        if (completePairs.length < 1) {
          ElMessage.warning('至少需要1组配对（2名选手）')
          return
        }
        
        // 移除硬编码的最大限制，由服务端验证
        // 提取选手ID（按配对顺序）
        playerIds = []
        completePairs.forEach(pair => {
          playerIds.push(pair.player1._id)
          playerIds.push(pair.player2._id)
        })
      }
      
      loading.value = true
      try {
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

.player-item.player-clickable {
  cursor: pointer;
}

.player-item.player-clickable:hover {
  border-color: #67c23a;
  background-color: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.3);
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

/* 配对/分组相关样式 */
.player-pairs-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.player-pair-item {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.pair-label {
  font-weight: bold;
  margin-bottom: 10px;
  color: #606266;
}

.pair-players {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.pair-player-slot {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  min-height: 120px;
}

.pair-player-slot:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.pair-player-slot.slot-empty {
  background-color: #f5f7fa;
}

.pair-player-slot.slot-active {
  border-color: #409eff;
  border-width: 3px;
  background-color: #ecf5ff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

.slot-placeholder {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}

.pair-player-name {
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
  word-break: break-word;
}

.pair-connector {
  font-size: 24px;
  color: #909399;
  font-weight: bold;
}

.pair-remove-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #f56c6c;
  cursor: pointer;
  font-size: 18px;
}

.pair-remove-icon:hover {
  color: #f56c6c;
  transform: scale(1.2);
}

/* 分组相关样式 */
.player-groups-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.group-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.group-header-item {
  padding: 10px;
  text-align: center;
  font-weight: bold;
  border-right: 1px solid #dcdfe6;
}

.group-header-item.group-b {
  border-right: none;
}

.group-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #dcdfe6;
}

.group-row:last-child {
  border-bottom: none;
}

.group-player-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-right: 1px solid #dcdfe6;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  min-height: 80px;
}

.group-player-slot.group-b {
  border-right: none;
}

.group-player-slot:hover {
  background-color: #f5f7fa;
}

.group-player-slot.slot-empty {
  background-color: #fafafa;
}

.group-player-slot.slot-active {
  border: 3px solid #409eff;
  background-color: #ecf5ff;
  box-shadow: inset 0 0 8px rgba(64, 158, 255, 0.2);
}

.group-player-name {
  flex: 1;
  font-size: 14px;
}

.group-remove-icon {
  color: #f56c6c;
  cursor: pointer;
  font-size: 16px;
  margin-left: auto;
}

.group-remove-icon:hover {
  color: #f56c6c;
  transform: scale(1.2);
}

/* 对话框中的成员网格 */
.players-grid-dialog {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.player-item-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.player-item-dialog:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-name-dialog {
  margin-top: 6px;
  text-align: center;
  font-size: 12px;
  word-break: break-word;
  max-width: 100%;
}
</style>
