<template>
  <div class="background-panel">
    <h3 class="panel-title">AI 智能换背景</h3>
    
    <!-- Processing State -->
    <div v-if="isProcessing" class="processing-state">
      <div class="spinner"></div>
      <p>正在使用 AI 移除背景...</p>
      <p class="processing-hint">首次使用需要下载模型，请耐心等待</p>
    </div>

    <!-- Preview & Options -->
    <div v-else class="preview-options">
      <div class="preview-area">
        <img :src="previewUrl" alt="预览" class="preview-image" />
      </div>

      <div class="background-options">
        <p class="options-title">选择背景色:</p>
        <div class="color-swatches">
          <button 
            v-for="(info, color) in BackgroundColors" 
            :key="color"
            class="color-swatch"
            :class="{ active: selectedColor === color }"
            :style="{ backgroundColor: info.hex }"
            @click="selectColor(color as BackgroundColor)"
          >
            <span class="swatch-label">{{ info.name }}</span>
          </button>
        </div>
      </div>

      <div class="panel-actions">
        <button class="btn btn-secondary" @click="handleCancel">
          上一步
        </button>
        <button class="btn btn-primary" @click="handleProcess">
          AI 移除背景
        </button>
        <button 
          class="btn btn-success" 
          @click="handleConfirm"
          :disabled="!previewUrl"
        >
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { removeBackground } from '@imgly/background-removal'
import { BackgroundColors, type BackgroundColor } from '../types'
import { dataURLToImage, imageToCanvas, canvasToDataURL } from '../utils/imageProcessor'

const props = defineProps<{
  imageSrc: string
}>()

const emit = defineEmits<{
  processed: [imageDataUrl: string]
  cancel: []
}>()

const isProcessing = ref(false)
const selectedColor = ref<BackgroundColor>('blue')
const backgroundRemovedUrl = ref('')
const previewUrl = ref('')

// Initialize preview with props.imageSrc
onMounted(() => {
  previewUrl.value = props.imageSrc
})

async function handleProcess() {
  isProcessing.value = true
  
  try {
    // Use AI to remove background
    const blob = await removeBackground(props.imageSrc, {
      device: 'gpu',
      progress: (key, current, total) => {
        console.log(`Downloading model: ${key} - ${current}/${total}`)
      }
    })
    
    // Convert blob to data URL
    const url = URL.createObjectURL(blob)
    backgroundRemovedUrl.value = url
    previewUrl.value = url
    
  } catch (error) {
    console.error('Background removal failed:', error)
    alert('AI 背景移除失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

function selectColor(color: BackgroundColor) {
  selectedColor.value = color
  updatePreview()
}

function updatePreview() {
  if (!backgroundRemovedUrl.value) {
    previewUrl.value = props.imageSrc
    return
  }

  // Apply background color to preview
  dataURLToImage(backgroundRemovedUrl.value).then(img => {
    const canvas = imageToCanvas(img)
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      const colorMap: Record<BackgroundColor, string> = {
        blue: '#3b82f6',
        white: '#ffffff',
        red: '#ef4444',
        transparent: 'transparent'
      }
      
      if (selectedColor.value !== 'transparent') {
        // Create new canvas with background
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = canvas.width
        tempCanvas.height = canvas.height
        const tempCtx = tempCanvas.getContext('2d')
        
        if (tempCtx) {
          tempCtx.fillStyle = colorMap[selectedColor.value]
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
          tempCtx.drawImage(canvas, 0, 0)
          previewUrl.value = canvasToDataURL(tempCanvas)
        }
      } else {
        previewUrl.value = canvasToDataURL(canvas)
      }
    }
  })
}

function handleCancel() {
  emit('cancel')
}

function handleConfirm() {
  if (previewUrl.value) {
    emit('processed', previewUrl.value)
  }
}

watch(() => props.imageSrc, () => {
  backgroundRemovedUrl.value = ''
  previewUrl.value = props.imageSrc
})
</script>

<style scoped>
.background-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.panel-title {
  font-size: 16px;
  color: var(--text-primary);
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e0e5ec;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.processing-hint {
  font-size: 14px;
  color: var(--text-muted);
}

.preview-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 400px;
}

.preview-area {
  width: 100%;
  height: 200px;
  max-height: 250px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.background-options {
  width: 100%;
}

.options-title {
  font-weight: 500;
  margin-bottom: 12px;
  text-align: center;
}

.color-swatches {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 80px;
  height: 60px;
  border-radius: var(--radius-md);
  border: 3px solid transparent;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.color-swatch.active {
  border-color: var(--primary);
  transform: scale(1.05);
}

.color-swatch[style*="transparent"] {
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
                    linear-gradient(-45deg, #ccc 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ccc 75%),
                    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 10px 10px;
  background-position: 0 0, 0 5px, 5px -5px, -5px 0px;
}

.swatch-label {
  font-size: 12px;
  color: var(--text-primary);
  background: rgba(255,255,255,0.9);
  padding: 2px 6px;
  border-radius: 4px;
}

.color-swatch[style*="background-color: #ffffff"] .swatch-label {
  color: #666;
}

.panel-actions {
  display: flex;
  gap: 16px;
  width: 100%;
  justify-content: center;
}

/* Button styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
}

.btn-secondary:hover {
  background: var(--gray-200);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}
</style>
