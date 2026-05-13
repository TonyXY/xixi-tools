<template>
  <div id="app">
    <header class="app-header">
      <h1 class="app-title">🖼️ 相册浏览</h1>
      <p class="app-subtitle">浏览本地图片文件夹，支持缩略图和大图预览</p>
    </header>

    <main class="app-main">
      <FolderSelector @loaded="onLoaded" />
      
      <div v-if="store.currentFolder" class="folder-info">
        <span class="folder-path">{{ store.currentFolder }}</span>
        <span class="photo-count">{{ store.photos.length }} 张照片</span>
      </div>
      
      <PhotoGrid />
    </main>
    
    <PhotoViewer />
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useGalleryStore } from './stores/galleryStore'
import FolderSelector from './components/FolderSelector.vue'
import PhotoGrid from './components/PhotoGrid.vue'
import PhotoViewer from './components/PhotoViewer.vue'
import Toast from './components/Toast.vue'

const store = useGalleryStore()
const toast = ref<any>(null)

function onLoaded() {
  // Photos loaded by store
}

function handleError(event: CustomEvent) {
  if (toast.value) {
    toast.value.show(event.detail, 'error')
  }
}

onMounted(() => {
  window.addEventListener('gallery-error', handleError as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('gallery-error', handleError as EventListener)
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  min-height: 100vh;
}

#app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  text-align: center;
  padding: 30px 0;
}

.app-title {
  font-size: 32px;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.app-subtitle {
  color: #666;
  font-size: 16px;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.folder-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.folder-path {
  font-size: 14px;
  color: #666;
  word-break: break-all;
}

.photo-count {
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
}
</style>
