<template>
  <div class="home">
    <div class="welcome">
      <h1>我的工具集</h1>
      <p>精选实用工具，提升你的工作效率</p>
    </div>

    <div class="tool-grid">
      <div v-for="tool in visibleTools" :key="tool.key" class="tool-card" @click="go(tool.key)">
        <div class="card-icon" :style="{ background: tool.bg }">
          <span class="icon-emoji">{{ tool.icon }}</span>
        </div>
        <div class="card-body">
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.desc }}</p>
        </div>
      </div>
    </div>

    <div class="divider-row">
      <span class="divider-line"></span>
      <span class="divider-text">其他工具</span>
      <span class="divider-line"></span>
    </div>

    <div class="tool-grid">
      <div v-for="tool in hiddenTools" :key="tool.key" class="tool-card muted" @click="go(tool.key)">
        <div class="card-icon" :style="{ background: tool.bg }">
          <span class="icon-emoji">{{ tool.icon }}</span>
        </div>
        <div class="card-body">
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const visibleTools = [
  { key: 'photo-id', name: '证件照制作', desc: '上传照片，AI抠图换背景，自动裁剪调整', icon: '📷', bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { key: 'watermark', name: '图片水印', desc: '添加文字或图片水印，支持批量处理', icon: '💧', bg: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' },
  { key: 'ai-knowledge', name: 'AI知识库', desc: '学习AI的常用网站及工具介绍', icon: '🤖', bg: 'linear-gradient(135deg, #f59e0b, #f97316)' },
]

const hiddenTools = [
  { key: 'stock', name: '股票监控', desc: '实时监控股票走势，快速添加指数或个股', icon: '📈', bg: 'linear-gradient(135deg, #10b981, #059669)' },
  { key: 'photo-gallery', name: '相册浏览', desc: '选择文件夹浏览本地图片，支持缩略图预览', icon: '🖼️', bg: 'linear-gradient(135deg, #ec4899, #db2777)' },
]

function go(key: string) {
  router.push(`/${key}`)
}
</script>

<style scoped>
.home {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px;
}

.welcome {
  text-align: center;
  margin-bottom: 40px;
}

.welcome h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.welcome p {
  font-size: 15px;
  color: var(--text-secondary);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.tool-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tool-card:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.tool-card.muted {
  opacity: 0.75;
}

.tool-card.muted:hover {
  opacity: 1;
}

.card-icon {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-emoji {
  font-size: 24px;
  line-height: 1;
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-body h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.card-body p {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.divider-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 8px 0 24px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--gray-200);
}

.divider-text {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
