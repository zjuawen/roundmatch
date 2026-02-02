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
  },
  avatarValid: {
    type: Boolean,
    default: undefined // undefined 表示未提供，需要检查；true/false 表示服务端已检查
  }
})

const showImage = ref(false)
const imgRef = ref(null)
const imageSrc = ref('')

// 图片加载错误处理（备用方案）
const handleImageError = () => {
  console.log('图片加载失败，使用文字头像')
  showImage.value = false
  imageSrc.value = ''
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

// 根据 avatarValid 和 avatarUrl 决定是否显示图片
const updateImageDisplay = () => {
  cleanupBlobUrl()
  
  if (!props.avatarUrl || !props.avatarUrl.trim()) {
    showImage.value = false
    imageSrc.value = ''
    return
  }
  
  // 如果服务端提供了 avatarValid 字段，直接使用
  if (props.avatarValid !== undefined) {
    if (props.avatarValid) {
      imageSrc.value = props.avatarUrl
      showImage.value = true
    } else {
      showImage.value = false
      imageSrc.value = ''
    }
    return
  }
  
  // 如果没有提供 avatarValid，尝试直接显示（兼容旧代码）
  // 如果图片加载失败，onerror 事件会处理
  imageSrc.value = props.avatarUrl
  showImage.value = true
}

// 监听 avatarUrl 和 avatarValid 变化
watch([() => props.avatarUrl, () => props.avatarValid], () => {
  updateImageDisplay()
}, { immediate: true })

onMounted(() => {
  updateImageDisplay()
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
