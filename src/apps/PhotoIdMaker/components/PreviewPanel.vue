<template>
  <div class="preview-panel">
    <h3 class="panel-title">预览并下载</h3>
    
    <div class="preview-content">
      <div class="preview-area">
        <img :src="finalImage" alt="最终效果" class="final-image" />
      </div>

      <div class="download-options">
        <p class="options-title">选择下载格式:</p>
        <div class="format-buttons">
          <button 
            class="format-btn"
            :class="{ active: downloadFormat === 'png' }"
            @click="downloadFormat = 'png'"
          >
            PNG
          </button>
          <button 
            class="format-btn"
            :class="{ active: downloadFormat === 'jpg' }"
            @click="downloadFormat = 'jpg'"
          >
            JPG
          </button>
        </div>
      </div>

      <div class="preview-info">
        <p>✅ 证件照制作完成</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="panel-actions">
      <button class="btn btn-secondary" @click="handleStartOver">
        重新制作
      </button>
      <button class="btn btn-success" @click="handleDownload">
        下载证件照
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { downloadImage } from '../utils/imageProcessor'

const props = defineProps<{
  finalImage: string
}>()

const emit = defineEmits<{
  download: []
  startOver: []
}>()

const downloadFormat = ref<'png' | 'jpg'>('png')

function handleDownload() {
  const timestamp = new Date().toISOString().slice(0, 10)
  const filename = `证件照_${timestamp}`
  
  if (downloadFormat.value === 'jpg') {
    // Convert to JPEG
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      downloadImage(dataUrl, filename, 'jpg')
    }
    img.src = props.finalImage
  } else {
    downloadImage(props.finalImage, filename, 'png')
  }
  
  emit('download')
}

function handleStartOver() {
  emit('startOver')
}
</script>

<style scoped>
.preview-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.panel-title {
  font-size: 20px;
  color: var(--text-primary);
}

.preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 500px;
}

.preview-area {
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  /* Show checkerboard for transparent background */
  background-image: 
    linear-gradient(45deg, #eee 25%, transparent 25%),
    linear-gradient(-45deg, #eee 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #eee 75%),
    linear-gradient(-45deg, transparent 75%, #eee 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.final-image {
  max-width: 100%;
  max-height: 450px;
  object-fit: contain;
  box-shadow: var(--shadow-md);
}

.download-options {
  width: 100%;
}

.options-title {
  font-weight: 500;
  margin-bottom: 12px;
  text-align: center;
}

.format-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.format-btn {
  padding: 12px 32px;
  border-radius: var(--radius-md);
  background: #e0e5ec;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
}

.format-btn.active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
}

.format-btn:hover:not(.active) {
  background: #d0d5dc;
}

.preview-info {
  color: var(--success);
  font-weight: 500;
}

.panel-actions {
  display: flex;
  gap: 16px;
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

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}
</style>
