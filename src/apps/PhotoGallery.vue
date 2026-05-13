<template>
  <div id="app">
    <main class="app-main">
      <FolderSelector @loaded="onLoaded" />
      
      <div v-if="store.currentFolder" class="folder-info">
        <span class="folder-path">{{ store.currentFolder }}</span>
        <span class="photo-count">{{ store.photos.length }} 张</span>
      </div>
      
      <PhotoGrid />
    </main>
    
    <PhotoViewer />
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useGalleryStore } from './PhotoGallery/stores/galleryStore'
import FolderSelector from './PhotoGallery/components/FolderSelector.vue'
import PhotoGrid from './PhotoGallery/components/PhotoGrid.vue'
import PhotoViewer from './PhotoGallery/components/PhotoViewer.vue'
import Toast from './PhotoGallery/components/Toast.vue'

const store = useGalleryStore()
const toast = ref<any>(null)

function onLoaded() {}
</script>

<style scoped>
#app {
  max-width: 100%;
}

.app-main {
  min-height: 300px;
}

.folder-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--gray-50);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.folder-path {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.photo-count {
  font-size: 12px;
  color: var(--text-muted);
}
</style>