<template>
  <div class="watermark-app">
    <a-row :gutter="12">
      <a-col :span="6">
        <a-card class="panel-card">
          <a-collapse v-model:activeKey="activePanels" :bordered="false">
            <a-collapse-panel key="upload" header="上传图片">
              <div class="upload-section">
                <input
                  ref="fileInputRef"
                  type="file"
                  :multiple="isBatchMode"
                  accept="image/*"
                  @change="onFileChange"
                  class="file-input"
                />
                <a-button @click="triggerUpload">
                  <UploadOutlined /> 选择图片
                </a-button>
              </div>

              <div class="batch-toggle">
                <a-switch v-model:checked="isBatchMode" size="small" />
                <span>批量模式</span>
              </div>

              <div v-if="isBatchMode" class="batch-info">
                <a-tag color="green">已选择 {{ batchImages.length }} 张图片</a-tag>
              </div>
            </a-collapse-panel>

            <a-collapse-panel key="config" header="水印配置">
              <WatermarkPanel
                :config="config"
                @update:config="handleConfigUpdate"
              />
            </a-collapse-panel>

            <a-collapse-panel key="export" header="导出">
              <div class="export-section">
                <a-button
                  type="primary"
                  block
                  :disabled="!imageUrl"
                  @click="exportImage"
                >
                  <DownloadOutlined /> 导出图片
                </a-button>
                <a-button
                  v-if="isBatchMode && batchImages.length > 0"
                  type="primary"
                  block
                  class="batch-btn"
                  @click="exportBatch"
                >
                  <DownloadOutlined /> 批量导出 ({{ batchImages.length }})
                </a-button>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </a-card>
      </a-col>

      <a-col :span="18">
        <a-card class="preview-card">
          <div v-if="batchImages.length > 1" class="batch-preview">
            <div class="preview-thumbnails">
              <div
                v-for="(url, index) in batchImages"
                :key="index"
                :class="['thumb-item', { active: currentPreviewIndex === index }]"
                @click="currentPreviewIndex = index"
              >
                <img :src="url" />
                <span class="thumb-index">{{ index + 1 }}</span>
              </div>
            </div>
            <div class="preview-info">
              <a-tag>第 {{ currentPreviewIndex + 1 }} / {{ batchImages.length }} 张</a-tag>
            </div>
          </div>
          <ImagePreview
            :image-url="currentPreviewUrl"
            :config="config"
          />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import ImagePreview from './ImageWatermark/components/ImagePreview.vue'
import WatermarkPanel from './ImageWatermark/components/WatermarkPanel.vue'
import type { WatermarkConfig } from '../types/watermark'
import { defaultWatermarkConfig } from '../types/watermark'

const imageUrl = ref<string | null>(null)
const isBatchMode = ref(false)
const batchImages = ref<string[]>([])
const config = ref<WatermarkConfig>({ ...defaultWatermarkConfig })
const currentPreviewIndex = ref(0)
const currentPreviewUrl = ref<string | null>(null)
const activePanels = ref(['upload', 'config', 'export'])
const fileInputRef = ref<HTMLInputElement | null>(null)

const STORAGE_KEY = 'watermark-config'

function loadConfig() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      config.value = { ...defaultWatermarkConfig, ...JSON.parse(saved) }
    } catch {
      config.value = { ...defaultWatermarkConfig }
    }
  }
}

function saveConfig() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config.value))
}

function updateCurrentPreview() {
  if (batchImages.value.length > 0) {
    currentPreviewUrl.value = batchImages.value[currentPreviewIndex.value]
  } else {
    currentPreviewUrl.value = imageUrl.value
  }
}

function triggerUpload() {
  fileInputRef.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  if (isBatchMode.value) {
    batchImages.value = []
    for (let i = 0; i < files.length; i++) {
      batchImages.value.push(URL.createObjectURL(files[i]))
    }
    if (files.length > 0) {
      imageUrl.value = URL.createObjectURL(files[0])
    }
  } else {
    imageUrl.value = URL.createObjectURL(files[0])
  }
  updateCurrentPreview()
}

function handleConfigUpdate(newConfig: Partial<WatermarkConfig>) {
  config.value = { ...config.value, ...newConfig }
  saveConfig()
}

function drawWatermarkToCanvas(canvas: HTMLCanvasElement, imgUrl: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const img = new Image()
  img.onload = () => {
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)

    const { text, position, fontSize, color, opacity, rotation } = config.value
    if (!text) return

    ctx.save()
    ctx.font = `${fontSize}px sans-serif`
    ctx.fillStyle = color
    ctx.globalAlpha = opacity

    if (position === 'tiled') {
      drawTiledWatermark(ctx, canvas)
    } else {
      const pos = getPosition(canvas, ctx)
      ctx.translate(pos.x, pos.y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.fillText(text, 0, 0)
    }

    ctx.restore()
  }
  img.src = imgUrl
}

function drawTiledWatermark(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const { text, fontSize, rotation } = config.value
  const spacingX = fontSize * 8
  const spacingY = fontSize * 6

  ctx.rotate((rotation * Math.PI) / 180)

  for (let y = -canvas.height; y < canvas.height * 2; y += spacingY) {
    for (let x = -canvas.width; x < canvas.width * 2; x += spacingX) {
      ctx.save()
      ctx.translate(x, y)
      ctx.fillText(text, 0, 0)
      ctx.restore()
    }
  }
}

function getPosition(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const padding = 20
  const text = config.value.text
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  const textHeight = config.value.fontSize

  switch (config.value.position) {
    case 'top-left':
      return { x: padding, y: padding + textHeight }
    case 'top-right':
      return { x: canvas.width - textWidth - padding, y: padding + textHeight }
    case 'bottom-left':
      return { x: padding, y: canvas.height - padding }
    case 'bottom-right':
      return { x: canvas.width - textWidth - padding, y: canvas.height - padding }
    case 'center':
    default:
      return { x: (canvas.width - textWidth) / 2, y: (canvas.height + textHeight) / 2 }
  }
}

function exportImage() {
  if (!currentPreviewUrl.value) return

  const canvas = document.createElement('canvas')
  drawWatermarkToCanvas(canvas, currentPreviewUrl.value)

  setTimeout(() => {
    const link = document.createElement('a')
    link.download = 'watermarked-image.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, 100)
}

function exportBatch() {
  if (batchImages.value.length === 0) return

  batchImages.value.forEach((url, index) => {
    setTimeout(() => {
      const canvas = document.createElement('canvas')
      drawWatermarkToCanvas(canvas, url)

      setTimeout(() => {
        const link = document.createElement('a')
        link.download = `watermarked-image-${index + 1}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }, 100)
    }, index * 300)
  })
}

watch(() => batchImages.value, updateCurrentPreview)
watch(() => currentPreviewIndex.value, updateCurrentPreview)
watch(() => imageUrl.value, (v) => { if (!isBatchMode.value) currentPreviewUrl.value = v })

loadConfig()
</script>

<style>
.file-input {
  display: none;
}

.batch-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: #595959;
}

.batch-info {
  margin-top: 12px;
}

.export-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.batch-btn {
  background: #52c41a !important;
  border-color: #52c41a !important;
}

.batch-preview {
  margin-bottom: 12px;
}

.preview-thumbnails {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.thumb-item {
  position: relative;
  width: 60px;
  height: 60px;
  border: 2px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;
}

.thumb-item:hover {
  border-color: #40a9ff;
}

.thumb-item.active {
  border-color: #1890ff;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-index {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  padding: 0 4px;
  border-radius: 2px;
}

.preview-info {
  display: flex;
  justify-content: center;
}
</style>