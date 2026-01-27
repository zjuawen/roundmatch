<template>
  <div 
    class="avatar-container" 
    :style="{
      width: size + 'px',
      height: size + 'px',
      fontSize: fontSize + 'px',
      backgroundColor: computedBackgroundColor
    }"
  >
    <img 
      v-if="showImage && imageSrc" 
      ref="imgRef"
      :src="imageSrc" 
      class="avatar-image"
      :style="{ width: size + 'px', height: size + 'px' }"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    <span v-else class="avatar-text" :style="{ color: textColor }">{{ displayText }}</span>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { mediaApi } from '@/api/media'

const props = defineProps({
  avatarUrl: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 32
  },
  backgroundColor: {
    type: String,
    default: null // null 表示使用默认的颜色生成逻辑
  }
})

const showImage = ref(false) // 默认不显示图片，等待检查完成
const imgRef = ref(null)
const imageSrc = ref('')
const isChecking = ref(false) // 是否正在检查

// 使用后端 API 检查头像 URL 的响应头 X-Errno
const checkAvatarUrl = async (url) => {
  if (!url) {
    showImage.value = false
    imageSrc.value = ''
    isChecking.value = false
    return
  }

  isChecking.value = true
  showImage.value = false
  imageSrc.value = '' // 先清空，避免图片加载

  try {
    // 调用后端 API 检查响应头
    const response = await mediaApi.checkAvatar(url)
    const { isValid, errno } = response.data
    
    // console.log('头像检查结果:', { url, isValid, errno })
    
    if (!isValid) {
      // console.log('头像无效（X-Errno: -6101 或其他原因），使用文字头像')
      showImage.value = false
      imageSrc.value = ''
      isChecking.value = false
      return
    }
    
    // 如果检查通过，设置图片源
    // 注意：只有在检查通过后才设置 imageSrc，这样图片才会加载
    imageSrc.value = url
    showImage.value = true
    isChecking.value = false
  } catch (error) {
    console.warn('检查头像URL失败:', error)
    // 如果检查失败，尝试直接使用原 URL
    // 如果图片加载失败，onerror 事件会处理
    imageSrc.value = url
    showImage.value = true
    isChecking.value = false
  }
}

// 图片加载错误处理（备用方案）
const handleImageError = () => {
  console.log('图片加载失败，使用文字头像')
  showImage.value = false
  imageSrc.value = '' // 清空图片源，确保不会再次尝试加载
}

// 图片加载成功处理
const handleImageLoad = () => {
  // 图片加载成功，不需要额外处理
}

// 清理 blob URL
const cleanupBlobUrl = () => {
  if (imageSrc.value && imageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(imageSrc.value)
    imageSrc.value = ''
  }
}

// 监听 avatarUrl 变化
watch(() => props.avatarUrl, async (newUrl, oldUrl) => {
  // 清理旧的 blob URL
  cleanupBlobUrl()
  
  if (newUrl) {
    // 检查头像URL
    await checkAvatarUrl(newUrl)
  } else {
    showImage.value = false
    imageSrc.value = ''
  }
}, { immediate: true })

onMounted(async () => {
  if (props.avatarUrl) {
    await checkAvatarUrl(props.avatarUrl)
  } else {
    showImage.value = false
    imageSrc.value = ''
  }
})

// 组件卸载时清理 blob URL
onUnmounted(() => {
  cleanupBlobUrl()
})

// 获取名字的第一个字
const displayText = computed(() => {
  if (props.name && props.name.length > 0) {
    return props.name.charAt(0).toUpperCase()
  }
  return '?'
})

// 根据名字生成背景色
const computedBackgroundColor = computed(() => {
  // 如果指定了背景色，直接使用
  if (props.backgroundColor) {
    return props.backgroundColor
  }
  
  // 否则使用默认的颜色生成逻辑
  const colors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', 
    '#909399', '#9C27B0', '#00BCD4', '#FF9800',
    '#4CAF50', '#2196F3', '#FF5722', '#795548'
  ]
  if (props.name && props.name.length > 0) {
    const index = props.name.charCodeAt(0) % colors.length
    return colors[index]
  }
  return '#909399'
})

// 根据背景色决定文字颜色
const textColor = computed(() => {
  // 如果背景色是白色或浅色，使用深色文字
  if (props.backgroundColor === '#ffffff' || props.backgroundColor === '#fff' || props.backgroundColor === 'white') {
    return '#333'
  }
  // 默认使用白色文字（深色背景）
  return '#fff'
})

// 根据尺寸计算字体大小
const fontSize = computed(() => {
  return Math.floor(props.size * 0.5)
})
</script>

<style scoped>
.avatar-container {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-text {
  font-weight: bold;
  user-select: none;
}
</style>
