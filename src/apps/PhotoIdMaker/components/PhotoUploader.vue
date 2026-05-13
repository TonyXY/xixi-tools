<template>
  <div class="photo-uploader">
    <div 
      class="upload-zone"
      :class="{ 'drag-over': isDragOver, 'has-preview': previewUrl }"
      @click="triggerFileInput"
      @dragover.prevent="isDragOver = true"
      @dragleave.prevent="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <input 
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        @change="handleFileChange"
      />
      
      <div v-if="!previewUrl" class="upload-placeholder">
        <div class="upload-icon">📸</div>
        <p class="upload-text">点击或拖拽上传照片</p>
        <p class="upload-hint">支持 JPG、PNG 格式</p>
      </div>

      <div v-else class="preview-container">
        <img :src="previewUrl" alt="预览" class="preview-image" />
        <button class="remove-btn" @click.stop="removeImage">×</button>
      </div>
    </div>

    <div v-if="previewUrl" class="upload-actions">
      <button class="btn btn-primary" @click="confirmUpload">
        确认上传
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { loadImageFromFile } from '../utils/imageProcessor'

const emit = defineEmits<{
  upload: [imageDataUrl: string]
}>()

const fileInput = ref<HTMLInputElement>()
const previewUrl = ref('')
const isDragOver = ref(false)

function triggerFileInput() {
  if (!previewUrl.value) {
    fileInput.value?.click()
  }
}

async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    await processFile(file)
  }
}

async function handleDrop(event: DragEvent) {
  isDragOver.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    await processFile(file)
  }
}

async function processFile(file: File) {
  if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
    alert('请上传 JPG 或 PNG 格式的图片')
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过 10MB')
    return
  }

  try {
    const dataUrl = await loadImageFromFile(file)
    previewUrl.value = dataUrl
  } catch (error) {
    alert('图片加载失败，请重试')
  }
}

function confirmUpload() {
  if (previewUrl.value) {
    emit('upload', previewUrl.value)
  }
}

function removeImage() {
  previewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<style scoped>
.photo-uploader {
  max-width: 600px;
  margin: 0 auto;
}

.upload-zone {
  border: 2px dashed #cbd5e1;
  border-radius: var(--radius-md);
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover {
  border-color: var(--primary);
  background: #f8fafc;
}

.upload-zone.drag-over {
  border-color: var(--primary);
  background: #f0f5ff;
  transform: scale(1.02);
}

.upload-zone.has-preview {
  border-style: solid;
  background: white;
  padding: 20px;
}

.upload-placeholder {
  pointer-events: none;
}

.upload-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.preview-container {
  position: relative;
  width: 100%;
  max-height: 200px;
  overflow: hidden;
  border-radius: var(--radius-sm);
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-container:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.9);
}

.upload-actions {
  margin-top: 24px;
  text-align: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 28px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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
</style>
