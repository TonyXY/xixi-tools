<template>
  <a-layout class="layout">
    <a-layout-sider v-model:collapsed="collapsed" class="sider" collapsible :width="200" :style="{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }">
      <div class="logo">🛠️</div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="photo-id" @click="navigate('/photo-id')">
          <template #icon><CameraOutlined /></template>
          <span>证件照制作</span>
        </a-menu-item>
        <a-menu-item key="watermark" @click="navigate('/watermark')">
          <template #icon><EditOutlined /></template>
          <span>图片水印</span>
        </a-menu-item>
        <a-menu-item key="ai-knowledge" @click="navigate('/ai-knowledge')">
          <template #icon><RobotOutlined /></template>
          <span>AI知识库</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    
    <a-layout class="main-layout" :style="{ marginLeft: collapsed ? '80px' : '200px' }">
      <a-layout-header class="header">
        <span class="collapse-btn" @click="collapsed = !collapsed">
          <MenuUnfoldOutlined v-if="collapsed" />
          <MenuFoldOutlined v-else />
        </span>
        <div class="header-info">
          <span class="page-title">{{ pageTitle }}</span>
          <span class="page-desc">{{ pageDesc }}</span>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CameraOutlined,
  EditOutlined,
  RobotOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const selectedKeys = ref<string[]>([route.path.slice(1) || 'stock'])

const titles: Record<string, string> = {
  stock: '股票监控',
  'photo-id': '证件照制作',
  'photo-gallery': '相册浏览',
  watermark: '图片水印',
  'ai-knowledge': 'AI知识库'
}

const descs: Record<string, string> = {
  stock: '实时监控股票走势，快速添加指数或个股',
  'photo-id': '上传照片，AI抠图换背景，自动裁剪调整',
  'photo-gallery': '选择文件夹浏览本地图片，支持缩略图预览',
  watermark: '添加文字或图片水印，支持批量处理',
  'ai-knowledge': '学习AI的常用网站及工具介绍'
}

const pageDesc = computed(() => descs[selectedKeys.value[0]] || '')

const pageTitle = computed(() => titles[selectedKeys.value[0]] || '我的工具')

function navigate(path: string) {
  router.push(path)
}

watch(() => route.path, (path) => {
  selectedKeys.value = [path.slice(1) || 'stock']
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@import url('https://cdn.jsdelivr.net/npm/antd@5/dist/reset.css');

:root {
  /* Primary palette */
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #818cf8;
  
  /* Neutral palette */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Text */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  
  /* Semantic */
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  
  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text-primary);
  background: var(--gray-50);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Global button styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--gray-200);
  border-color: var(--gray-300);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.layout {
  min-height: 100vh;
}

.main-layout {
  min-height: 100vh;
}

.header {
  background: #fff !important;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px !important;
  line-height: 48px !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  position: sticky;
  top: 0;
  z-index: 50;
}

.collapse-btn {
  font-size: 14px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.collapse-btn:hover {
  color: var(--primary);
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.page-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.page-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.2;
}

.sider {
  background: #1f2937 !important;
}

.sider .ant-layout-sider-children {
  background: #1f2937;
}

.logo {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
}

.trigger {
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;
}

.trigger:hover {
  color: var(--primary);
}

.page-title {
  font-size: 13px;
  font-weight: 600;
}

.content {
  margin: 8px;
  padding: 12px;
  background: #fff;
  border-radius: var(--radius-sm);
  min-height: 100vh;
}
</style>