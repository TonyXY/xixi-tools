<template>
  <div class="image-editor">
    <!-- Size Selector -->
    <div class="size-selector">
      <span class="size-label">选择尺寸:</span>
      <div class="size-buttons">
        <button 
          v-for="size in sizes" 
          :key="size"
          class="size-btn"
          :class="{ active: selectedSize === size }"
          @click="selectSize(size)"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <!-- Cropper Container -->
    <div class="cropper-wrapper">
      <img 
        ref="imageEl" 
        :src="imageSrc" 
        class="cropper-image"
        @load="onImageLoad"
      />
    </div>

    <!-- Action Buttons -->
    <div class="editor-actions">
      <button class="btn btn-secondary" @click="resetCropper">
        重置
      </button>
      <button class="btn btn-primary" @click="handleCrop">
        确认裁剪
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { PresetSizes } from '../types'

const props = defineProps<{
  imageSrc: string
}>()

const emit = defineEmits<{
  cropped: [imageDataUrl: string]
  cancel: []
}>()

const sizes = Object.keys(PresetSizes)
const selectedSize = ref('1寸')
const imageEl = ref<HTMLImageElement>()
let cropper: Cropper | null = null

function selectSize(size: string) {
  selectedSize.value = size
  const preset = PresetSizes[size]
  if (cropper && preset) {
    cropper.setAspectRatio(preset.aspectRatio)
  }
}

function onImageLoad() {
  if (imageEl.value && !cropper) {
    initCropper()
  }
}

function initCropper() {
  if (!imageEl.value) return

  const preset = PresetSizes[selectedSize.value]
  
  cropper = new Cropper(imageEl.value, {
    aspectRatio: preset?.aspectRatio || NaN,
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 0.8,
    restore: false,
    guides: true,
    center: true,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
    ready() {
      // Cropper ready
    }
  })
}

function resetCropper() {
  if (cropper) {
    cropper.reset()
  }
}

function handleCrop() {
  if (!cropper) return

  const canvas = cropper.getCroppedCanvas({
    maxWidth: 800,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  })

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
  emit('cropped', dataUrl)
}

onBeforeUnmount(() => {
  if (cropper) {
    cropper.destroy()
    cropper = null
  }
})
</script>

<style scoped>
.image-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.size-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.size-label {
  font-weight: 500;
  color: var(--text-primary);
}

.size-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.size-btn {
  padding: 8px 16px;
  border-radius: 20px;
  background: #e0e5ec;
  color: var(--text-primary);
  font-size: 14px;
}

.size-btn.active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
}

.size-btn:hover:not(.active) {
  background: #d0d5dc;
}

.cropper-wrapper {
  width: 100%;
  min-height: 400px;
  max-height: 600px;
  background: #f8fafc;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.cropper-image {
  display: block;
  max-width: 100%;
}

.editor-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 16px;
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
</style>
