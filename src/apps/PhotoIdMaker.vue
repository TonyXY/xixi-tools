<template>
  <div id="app">
    <div class="step-indicator">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="step-item"
        :class="{ active: currentStep >= index, current: currentStep === index }"
      >
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-label">{{ step }}</span>
      </div>
    </div>

    <main class="app-main">
      <PhotoUploader 
        v-if="currentStep === 0"
        @upload="handleUpload"
      />

      <ImageEditor 
        v-if="currentStep === 1"
        :imageSrc="originalImage"
        @cropped="handleCropped"
        @cancel="handleCancel"
      />

      <BackgroundPanel 
        v-if="currentStep === 2"
        :imageSrc="croppedImage"
        @processed="handleBackgroundProcessed"
        @cancel="handleCancel"
      />

      <ImageAdjust 
        v-if="currentStep === 3"
        :imageSrc="backgroundRemovedImage"
        @adjusted="handleAdjusted"
        @cancel="handleCancel"
      />

      <PreviewPanel 
        v-if="currentStep === 4"
        :finalImage="finalImage"
        @download="handleDownload"
        @startOver="handleStartOver"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PhotoUploader from './PhotoIdMaker/components/PhotoUploader.vue'
import ImageEditor from './PhotoIdMaker/components/ImageEditor.vue'
import BackgroundPanel from './PhotoIdMaker/components/BackgroundPanel.vue'
import ImageAdjust from './PhotoIdMaker/components/ImageAdjust.vue'
import PreviewPanel from './PhotoIdMaker/components/PreviewPanel.vue'

const steps = ['上传照片', '调整裁剪', 'AI换背景', '图像调整', '预览下载']
const currentStep = ref(0)

const originalImage = ref('')
const croppedImage = ref('')
const backgroundRemovedImage = ref('')
const finalImage = ref('')

function handleUpload(imageDataUrl: string) {
  originalImage.value = imageDataUrl
  currentStep.value = 1
}

function handleCropped(imageDataUrl: string) {
  croppedImage.value = imageDataUrl
  currentStep.value = 2
}

function handleBackgroundProcessed(imageDataUrl: string) {
  backgroundRemovedImage.value = imageDataUrl
  currentStep.value = 3
}

function handleAdjusted(imageDataUrl: string) {
  finalImage.value = imageDataUrl
  currentStep.value = 4
}

function handleDownload() {}

function handleCancel() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function handleStartOver() {
  currentStep.value = 0
  originalImage.value = ''
  croppedImage.value = ''
  backgroundRemovedImage.value = ''
  finalImage.value = ''
}
</script>

<style scoped>
#app {
  max-width: 800px;
  margin: 0 auto;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--gray-100);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-500);
  transition: all 0.2s;
}

.step-item.active {
  background: var(--primary-light);
  color: var(--primary-dark);
}

.step-item.current {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.3);
}

.step-number {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-200);
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
}

.step-item.current .step-number {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.app-main {
  background: #fff;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-md);
  padding: 16px;
  min-height: 350px;
}
</style>