<template>
  <div class="panel">
    <div class="panel-section">
      <label class="panel-label">水印文字</label>
      <input
        v-model="localConfig.text"
        type="text"
        class="panel-input"
        placeholder="输入水印文字"
        @input="emitUpdate"
      />
    </div>

    <div class="panel-section">
      <label class="panel-label">位置</label>
      <div class="position-grid">
        <button
          v-for="pos in positions"
          :key="pos.value"
          :class="['position-btn', { active: localConfig.position === pos.value }]"
          @click="selectPosition(pos.value)"
        >
          {{ pos.label }}
        </button>
      </div>
    </div>

    <div class="panel-section">
      <label class="panel-label">字体大小: {{ localConfig.fontSize }}px</label>
      <input
        v-model.number="localConfig.fontSize"
        type="range"
        min="12"
        max="72"
        class="panel-range"
        @input="emitUpdate"
      />
    </div>

    <div class="panel-section">
      <label class="panel-label">颜色</label>
      <input
        v-model="localConfig.color"
        type="color"
        class="panel-color"
        @input="emitUpdate"
      />
    </div>

    <div class="panel-section">
      <label class="panel-label">透明度: {{ Math.round(localConfig.opacity * 100) }}%</label>
      <input
        v-model.number="localConfig.opacity"
        type="range"
        min="0.1"
        max="1"
        step="0.1"
        class="panel-range"
        @input="emitUpdate"
      />
    </div>

    <div class="panel-section">
      <label class="panel-label">旋转: {{ localConfig.rotation }}°</label>
      <div class="rotation-options">
        <button
          v-for="angle in rotations"
          :key="angle"
          :class="['rotation-btn', { active: localConfig.rotation === angle }]"
          @click="selectRotation(angle)"
        >
          {{ angle }}°
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WatermarkConfig, WatermarkPosition } from '../types/watermark'

const props = defineProps<{
  config: WatermarkConfig
}>()

const emit = defineEmits<{
  'update:config': [config: Partial<WatermarkConfig>]
}>()

const localConfig = ref<WatermarkConfig>({ ...props.config })

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig }
}, { deep: true })

const positions = [
  { value: 'top-left' as WatermarkPosition, label: '左上' },
  { value: 'top-right' as WatermarkPosition, label: '右上' },
  { value: 'center' as WatermarkPosition, label: '中心' },
  { value: 'bottom-left' as WatermarkPosition, label: '左下' },
  { value: 'bottom-right' as WatermarkPosition, label: '右下' },
  { value: 'tiled' as WatermarkPosition, label: '平铺' }
]

const rotations = [0, 45, 90, 135, 180, 225, 270, 315]

function emitUpdate() {
  emit('update:config', { ...localConfig.value })
}

function selectPosition(position: WatermarkPosition) {
  localConfig.value.position = position
  emitUpdate()
}

function selectRotation(rotation: number) {
  localConfig.value.rotation = rotation
  emitUpdate()
}
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.panel-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.panel-input:focus {
  outline: none;
  border-color: #4a90d9;
}

.panel-range {
  width: 100%;
  cursor: pointer;
}

.panel-color {
  width: 100%;
  height: 36px;
  padding: 2px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

.position-btn,
.rotation-btn {
  padding: 8px 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.position-btn:hover,
.rotation-btn:hover {
  background: #e8e8e8;
}

.position-btn.active,
.rotation-btn.active {
  background: #4a90d9;
  color: #fff;
  border-color: #4a90d9;
}

.rotation-options {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>