<template>
  <div class="photo-grid">
    <div v-if="store.isLoading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="store.photos.length === 0" class="empty">
      <p>暂无照片，请先选择文件夹</p>
    </div>
    
    <div v-else class="grid">
      <div 
        v-for="photo in store.photos" 
        :key="photo.path"
        class="photo-item"
        @click="store.selectPhoto(photo)"
      >
        <img 
          v-if="isElectron && thumbnails[photo.path]"
          :src="thumbnails[photo.path]" 
          :alt="photo.name"
          class="thumbnail"
          loading="lazy"
        />
        <img 
          v-else-if="!isElectron"
          :src="store.getThumbnailUrl(photo.path)" 
          :alt="photo.name"
          class="thumbnail"
          loading="lazy"
        />
        <div v-else class="thumbnail-loading">
          <div class="spinner-small"></div>
        </div>
        <div class="photo-name">{{ photo.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGalleryStore } from '../stores/galleryStore'

const store = useGalleryStore()
const thumbnails = ref<Record<string, string>>({})

// Check if running in Electron
const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI

async function loadThumbnails() {
  if (!isElectron) return
  
  thumbnails.value = {}
  for (const photo of store.photos) {
    const url = await store.loadThumbnail(photo.path)
    if (url) {
      thumbnails.value[photo.path] = url
    }
  }
}

watch(() => store.photos, loadThumbnails, { immediate: true })
</script>

<style scoped>
.photo-grid {
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-100);
  min-height: 250px;
}

.loading, .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-muted);
  font-size: 13px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.photo-item {
  cursor: pointer;
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.photo-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.thumbnail {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.thumbnail-loading {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-50);
}

.photo-name {
  padding: 6px;
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: var(--gray-50);
}
</style>
