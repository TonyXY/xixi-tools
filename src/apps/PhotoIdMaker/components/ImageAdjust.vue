<template>
  <div class="image-adjust">
    <h3 class="panel-title">图像调整</h3>
    
    <div class="adjust-content">
      <!-- Preview -->
      <div class="preview-area">
        <img 
          :src="previewUrl" 
          alt="预览" 
          class="preview-image"
          :style="filterStyle"
        />
      </div>

      <!-- Sliders -->
      <div class="sliders">
        <div class="slider-group">
          <label class="slider-label">
            <span>亮度</span>
            <span class="slider-value">{{ brightness }}</span>
          </label>
          <input 
            type="range" 
            v-model.number="brightness" 
            min="0" 
            max="200" 
            class="slider"
          />
        </div>

        <div class="slider-group">
          <label class="slider-label">
            <span>对比度</span>
            <span class="slider-value">{{ contrast }}</span>
          </label>
          <input 
            type="range" 
            v-model.number="contrast" 
            min="0" 
            max="200" 
            class="slider"
          />
        </div>

        <div class="slider-group">
          <label class="slider-label">
            <span>饱和度</span>
            <span class="slider-value">{{ saturation }}</span>
          </label>
          <input 
            type="range" 
            v-model.number="saturation" 
            min="0" 
            max="200" 
            class="slider"
          />
        </div>
      </div>

      <!-- Reset -->
      <div class="reset-area">
        <button class="btn btn-secondary" @click="resetSliders">
          重置
        </button>
      </div>
    </div>

    <!-- Actions -->
    <div class="panel-actions">
      <button class="btn btn-secondary" @click="handleCancel">
        上一步
      </button>
      <button class="btn btn-primary" @click="handleConfirm">
        确认
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { dataURLToImage, imageToCanvas, canvasToDataURL } from '../utils/imageProcessor'

const props = defineProps<{
  imageSrc: string
}>()

const emit = defineEmits<{
  adjusted: [imageDataUrl: string]
  cancel: []
}>()

const brightness = ref(100)
const contrast = ref(100)
const saturation = ref(100)
const previewUrl = ref('')

onMounted(() => {
  previewUrl.value = props.imageSrc
})

const filterStyle = computed(() => ({
  filter: `brightness(${brightness.value}%) contrast(${contrast.value}%) saturate(${saturation.value}%)`
}))

function resetSliders() {
  brightness.value = 100
  contrast.value = 100
  saturation.value = 100
}

async function applyFiltersToImage(): Promise<string> {
  const img = await dataURLToImage(props.imageSrc)
  const canvas = imageToCanvas(img)
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    ctx.filter = `brightness(${brightness.value}%) contrast(${contrast.value}%) saturate(${saturation.value}%)`
    ctx.drawImage(img, 0, 0)
    ctx.filter = 'none'
  }
  
  return canvasToDataURL(canvas)
}

async function handleConfirm() {
  const result = await applyFiltersToImage()
  emit('adjusted', result)
}

function handleCancel() {
  emit('cancel')
}

watch(() => props.imageSrc, (newSrc) => {
  previewUrl.value = newSrc
  resetSliders()
})
</script>

<style scoped>
.image-adjust {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.panel-title {
  font-size: 16px;
  color: var(--text-primary);
}

.adjust-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 400px;
}

.preview-area {
  width: 100%;
  height: 180px;
  max-height: 220px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: filter 0.1s;
}

.sliders {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.slider-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-label {
  display: flex;
  justify-content: space-between;
  font-weight: 500;
  color: var(--text-primary);
}

.slider-value {
  color: var(--text-muted);
  font-weight: normal;
}

.slider {
  width: 100%;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #1a1a2e, #667eea);
  border-radius: 4px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--primary);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  border: 3px solid var(--primary);
  cursor: pointer;
}

.reset-area {
  display: flex;
  justify-content: center;
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
