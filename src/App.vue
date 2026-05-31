<template>
  <a-layout class="layout">
    <!-- Desktop sidebar -->
    <a-layout-sider
      v-if="!isMobile"
      v-model:collapsed="collapsed"
      class="sider"
      collapsible
      :width="200"
      :style="{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }"
    >
      <div class="logo">🛠️</div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item v-for="item in menuItems" :key="item.key" @click="navigate(item.path)">
          <template #icon>
            <component :is="item.icon" />
          </template>
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- Mobile drawer -->
    <a-drawer
      v-if="isMobile"
      :open="drawerVisible"
      placement="left"
      :width="220"
      :closable="false"
      :body-style="{ padding: 0, background: '#1f2937' }"
      @close="drawerVisible = false"
    >
      <div class="logo" style="height:48px;">🛠️</div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item v-for="item in menuItems" :key="item.key" @click="navigate(item.path)">
          <template #icon>
            <component :is="item.icon" />
          </template>
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
    </a-drawer>

    <a-layout class="main-layout" :class="{ collapsed: collapsed && !isMobile, mobile: isMobile }">
      <a-layout-header class="header">
        <span class="collapse-btn" @click="toggleNav">
          <MenuUnfoldOutlined v-if="navCollapsed" />
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
import { ref, computed, watch, onMounted, onUnmounted, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CameraOutlined,
  EditOutlined,
  RobotOutlined,
  PlaySquareOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)
const drawerVisible = ref(false)
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
const selectedKeys = ref<string[]>([route.path.slice(1) || 'home'])

const menuItems = [
  { key: 'photo-id', path: '/photo-id', icon: markRaw(CameraOutlined), label: '证件照制作' },
  { key: 'watermark', path: '/watermark', icon: markRaw(EditOutlined), label: '图片水印' },
  { key: 'ai-knowledge', path: '/ai-knowledge', icon: markRaw(RobotOutlined), label: 'AI知识库' },
  { key: 'movie', path: '/movie', icon: markRaw(PlaySquareOutlined), label: '影视搜索' },
]

// Computed for the header toggle icon
const navCollapsed = computed(() => isMobile.value ? !drawerVisible.value : collapsed.value)

function toggleNav() {
  if (isMobile.value) {
    drawerVisible.value = !drawerVisible.value
  } else {
    collapsed.value = !collapsed.value
  }
}

// Resize handler: switch between mobile/desktop mode
let resizeTimer: ReturnType<typeof setTimeout> | null = null
function handleResize() {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    const mobile = window.innerWidth < 768
    if (mobile !== isMobile.value) {
      isMobile.value = mobile
      if (mobile) {
        collapsed.value = false
        drawerVisible.value = false
      }
    }
  }, 200)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeTimer) clearTimeout(resizeTimer)
})

const titles: Record<string, string> = {
  home: '首页',
  'photo-id': '证件照制作',
  'photo-gallery': '相册浏览',
  watermark: '图片水印',
  'ai-knowledge': 'AI知识库',
  movie: '影视搜索'
}

const descs: Record<string, string> = {
  home: '精选实用工具，提升你的工作效率',
  'photo-id': '上传照片，AI抠图换背景，自动裁剪调整',
  'photo-gallery': '选择文件夹浏览本地图片，支持缩略图预览',
  watermark: '添加文字或图片水印，支持批量处理',
  'ai-knowledge': '学习AI的常用网站及工具介绍',
  movie: '搜索热播影视剧，在线选集播放'
}

const pageDesc = computed(() => descs[selectedKeys.value[0]] || '')
const pageTitle = computed(() => titles[selectedKeys.value[0]] || '我的工具')

function navigate(path: string) {
  if (isMobile.value) {
    drawerVisible.value = false
  }
  router.push(path)
}

watch(() => route.path, (path) => {
  selectedKeys.value = [path.slice(1) || 'home']
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.main-layout {
  margin-left: 200px;
  min-height: 100vh;
  transition: margin-left 0.2s;
}

.main-layout.collapsed {
  margin-left: 80px;
}

.main-layout.mobile {
  margin-left: 0;
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
  font-size: 18px;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
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
  display: none;
}

@media (min-width: 640px) {
  .page-desc {
    display: block;
  }
}

.sider {
  background: #1f2937 !important;
}

.sider :deep(.ant-layout-sider-children) {
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

.content {
  margin: 8px;
  padding: 12px;
  background: #fff;
  border-radius: var(--radius-sm);
  min-height: 100vh;
}

/* Mobile drawer menu styling */
:deep(.ant-drawer-content-wrapper) {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

:deep(.ant-drawer-content) {
  background: #1f2937;
}
</style>
