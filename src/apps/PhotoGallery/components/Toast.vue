<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="message" class="toast" :class="type">
        <span class="toast-icon">{{ type === 'error' ? '❌' : 'ℹ️' }}</span>
        <span class="toast-message">{{ message }}</span>
        <button class="toast-close" @click="close">×</button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const message = ref('')
const type = ref<'info' | 'error'>('info')
let timer: ReturnType<typeof setTimeout> | null = null

function show(msg: string, msgType: 'info' | 'error' = 'info', duration = 3000) {
  message.value = msg
  type.value = msgType
  
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    message.value = ''
  }, duration)
}

function close() {
  message.value = ''
  if (timer) clearTimeout(timer)
}

// Expose methods for global use
defineExpose({ show, close })
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  z-index: 9999;
  max-width: 90%;
}

.toast.info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.toast.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.toast-icon {
  font-size: 20px;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
