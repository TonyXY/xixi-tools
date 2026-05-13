<template>
  <div class="folder-selector">
    <div class="input-group">
      <input 
        v-model="manualPath"
        type="text" 
        class="folder-input"
        placeholder="输入文件夹路径，如 /Users/xiaoyang/Downloads"
        @keyup.enter="submitManualPath"
      />
      <button class="btn btn-primary" @click="submitManualPath">
        浏览
      </button>
      <button class="btn btn-secondary" @click="refresh" :disabled="!currentFolder">
        🔄 刷新
      </button>
    </div>
    <div v-if="currentFolder" class="folder-info">
      <span class="folder-path">{{ currentFolder }}</span>
      <span class="photo-count">{{ photoCount }} 张照片</span>
    </div>
    <p v-else class="hint">输入文件夹路径后按回车，或点击"浏览"按钮</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGalleryStore } from '../stores/galleryStore'

const emit = defineEmits<{
  loaded: []
}>()

const store = useGalleryStore()
const manualPath = ref('')

const currentFolder = computed(() => store.currentFolder)
const photoCount = computed(() => store.photos.length)

async function submitManualPath() {
  if (manualPath.value.trim()) {
    await store.setFolder(manualPath.value.trim())
    if (store.currentFolder) {
      emit('loaded')
    }
    manualPath.value = ''
  }
}

async function refresh() {
  if (store.currentFolder) {
    await store.setFolder(store.currentFolder)
  }
}
</script>

<style scoped>
.folder-selector {
  padding: 12px;
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-100);
  margin-bottom: 12px;
}

.input-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.folder-input {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  font-size: 13px;
  transition: border-color 0.2s;
}

.folder-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.folder-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--gray-50);
  border-radius: var(--radius-sm);
}

.folder-path {
  font-size: 12px;
  color: var(--text-secondary);
  word-break: break-all;
}

.photo-count {
  font-size: 12px;
  color: var(--primary);
  font-weight: 500;
  white-space: nowrap;
}

.hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.btn {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-600);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--gray-200);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
