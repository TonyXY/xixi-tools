<template>
  <Teleport to="body">
    <div v-if="store.selectedPhoto" class="viewer-overlay" @click.self="close">
      <button class="close-btn" @click="close">×</button>
      
      <button class="nav-btn prev" @click="prev" :disabled="!canPrev">
        ‹
      </button>
      
      <div class="viewer-content">
        <img 
          v-if="currentPhotoUrl"
          :src="currentPhotoUrl" 
          :alt="store.selectedPhoto.name"
          class="full-image"
        />
        <div v-else class="loading-image">
          <div class="spinner"></div>
        </div>
        <div class="photo-info">
          {{ store.selectedPhoto.name }}
        </div>
      </div>
      
      <button class="nav-btn next" @click="next" :disabled="!canNext">
        ›
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch, ref } from 'vue'
import { useGalleryStore } from '../stores/galleryStore'

const store = useGalleryStore()
const currentPhotoUrl = ref('')

const currentIndex = computed(() => {
  if (!store.selectedPhoto) return -1
  return store.photos.findIndex(p => p.path === store.selectedPhoto?.path)
})

const canPrev = computed(() => currentIndex.value > 0)
const canNext = computed(() => currentIndex.value < store.photos.length - 1)

function close() {
  store.clearSelection()
}

function prev() {
  if (canPrev.value) {
    store.selectPhoto(store.photos[currentIndex.value - 1])
  }
}

function next() {
  if (canNext.value) {
    store.selectPhoto(store.photos[currentIndex.value + 1])
  }
}

async function loadFullPhoto() {
  if (!store.selectedPhoto) return
  
  const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI
  if (isElectron) {
    const url = await store.loadPhoto(store.selectedPhoto.path)
    currentPhotoUrl.value = url
  } else {
    currentPhotoUrl.value = store.getPhotoUrl(store.selectedPhoto.path)
  }
}

watch(() => store.selectedPhoto, loadFullPhoto)

function handleKeydown(e: KeyboardEvent) {
  if (!store.selectedPhoto) return
  
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  loadFullPhoto()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-image {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  color: white;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255,255,255,0.3);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 80px;
  background: rgba(255,255,255,0.1);
  color: white;
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255,255,255,0.2);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn.prev {
  left: 20px;
}

.nav-btn.next {
  right: 20px;
}

.viewer-content {
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.full-image {
  max-width: 100%;
  max-height: calc(90vh - 60px);
  object-fit: contain;
}

.photo-info {
  margin-top: 16px;
  color: white;
  font-size: 14px;
}
</style>
