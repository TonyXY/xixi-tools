<template>
  <div class="player-page">
    <button class="btn btn-secondary btn-back" @click="goBack">
      <ArrowLeftOutlined /> 返回
    </button>

    <!-- Loading -->
    <div v-if="loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>正在加载...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-section">
      <p class="error-msg">{{ error }}</p>
      <button class="btn btn-primary" @click="fetchDetail">重试</button>
    </div>

    <!-- Drama Detail -->
    <template v-else-if="drama">
      <!-- Player -->
      <div class="player-container">
        <div class="player-wrapper">
          <video ref="videoRef" controls autoplay class="video-player" playsinline></video>
          <div v-if="playerError" class="player-fallback">
            <p>{{ playerError }}</p>
            <a v-if="currentPlayUrl" :href="currentPlayUrl" target="_blank" class="btn btn-primary" rel="noopener noreferrer">
              <LinkOutlined /> 在新标签页中打开
            </a>
          </div>
        </div>
        <div v-if="currentPlayUrl" class="player-info">
          <span class="now-playing">正在播放：{{ currentEpisodeTitle || drama.title }}</span>
        </div>
      </div>

      <!-- Tabs: Info / Episodes -->
      <div class="detail-tabs">
        <a-tabs v-model:activeKey="activeTab" size="small">
          <a-tab-pane key="episodes" tab="播放列表">
            <div v-if="drama.episodes && drama.episodes.length" class="episode-grid">
              <button
                v-for="ep in drama.episodes"
                :key="ep.id"
                class="episode-btn"
                :class="{ active: currentPlayUrl === ep.playUrl }"
                @click="playEpisode(ep)"
              >
                {{ ep.title }}
              </button>
            </div>
            <div v-else class="episode-empty">
              暂无播放资源
            </div>
          </a-tab-pane>
          <a-tab-pane key="info" tab="简介">
            <div class="drama-info">
              <div class="info-poster">
                <img :src="drama.cover" :alt="drama.title" @error="onImgError" />
              </div>
              <div class="info-body">
                <h1 class="info-title">{{ drama.title }}</h1>
                <div class="info-meta">
                  <span v-if="drama.rating > 0" class="meta-rating"><StarFilled /> {{ drama.rating }}</span>
                  <span v-if="drama.year">{{ drama.year }}</span>
                  <span v-if="drama.region">{{ drama.region }}</span>
                  <span v-if="drama.category">{{ drama.category }}</span>
                  <span v-if="drama.status" class="meta-status" :class="drama.status">
                    {{ drama.status === 'completed' ? '已完结' : '更新中' }}
                  </span>
                  <span v-if="drama.updateTime">更新: {{ drama.updateTime }}</span>
                </div>
                <div v-if="drama.director" class="info-line">
                  <span class="label">导演：</span>{{ drama.director }}
                </div>
                <div v-if="drama.actors && drama.actors.length" class="info-line">
                  <span class="label">主演：</span>{{ drama.actors.join(' / ') }}
                </div>
                <p v-if="drama.description" class="info-desc">{{ drama.description }}</p>
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftOutlined, StarFilled, LinkOutlined } from '@ant-design/icons-vue'
import type { Drama, DramaEpisode } from '../types'
import { fetchDetail } from '../utils/movieApi'
import { useHls } from '../utils/useHls'

const route = useRoute()
const router = useRouter()

const drama = ref<Drama | null>(null)
const loading = ref(false)
const error = ref('')
const currentPlayUrl = ref('')
const currentEpisodeTitle = ref('')
const activeTab = ref('episodes')
const videoRef = ref<HTMLVideoElement | null>(null)
let isUnmounted = false

const { playerError, destroy } = useHls(videoRef, currentPlayUrl)

onMounted(() => {
  fetchDetailData()
})

onUnmounted(() => {
  isUnmounted = true
  destroy()
})

onUnmounted(() => {
  destroy()
})

async function fetchDetailData() {
  const id = route.query.id as string
  const source = route.query.source as string
  if (!id || !source) {
    error.value = '缺少参数'
    return
  }
  loading.value = true
  error.value = ''
  try {
    drama.value = await fetchDetail(id, source)
    // Wait for DOM to render video element before attaching hls
    await nextTick()
    if (drama.value.episodes && drama.value.episodes.length > 0) {
      playEpisode(drama.value.episodes[0])
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function playEpisode(ep: DramaEpisode) {
  currentEpisodeTitle.value = ep.title
  if (currentPlayUrl.value === ep.playUrl) {
    // 点击已选中的剧集 → 触发重新加载
    currentPlayUrl.value = ''
    nextTick(() => {
      if (!isUnmounted) currentPlayUrl.value = ep.playUrl
    })
  } else {
    currentPlayUrl.value = ep.playUrl
  }
}

function goBack() {
  router.push('/movie')
}

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWEyZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij7mm7TmlrDkuYvliqA8L3RleHQ+PC9zdmc+'
}
</script>

<style scoped>
.player-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px;
}

.btn-back {
  margin-bottom: 16px;
  padding: 6px 14px;
  font-size: 13px;
}

/* Loading */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--text-muted);
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-section {
  text-align: center;
  padding: 40px 0;
}

.error-msg {
  color: var(--danger);
  margin-bottom: 12px;
}

/* Player */
.player-container {
  margin-bottom: 20px;
}

.player-wrapper {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.player-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--gray-400);
  font-size: 14px;
  background: rgba(0, 0, 0, 0.85);
  z-index: 2;
}

.player-info {
  margin-top: 8px;
}

.now-playing {
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
}

/* Detail Tabs */
.detail-tabs {
  margin-bottom: 24px;
}

.detail-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 16px;
}

.detail-tabs :deep(.ant-tabs-nav::before) {
  border-bottom: 1px solid var(--gray-200);
}

.detail-tabs :deep(.ant-tabs-tab) {
  font-size: 14px;
  padding: 8px 0;
  margin-right: 24px;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.detail-tabs :deep(.ant-tabs-tab:hover) {
  color: var(--primary);
}

.detail-tabs :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: var(--primary);
  font-weight: 600;
}

.detail-tabs :deep(.ant-tabs-ink-bar) {
  background: var(--primary);
  height: 2px;
}

/* Drama Info */
.drama-info {
  display: flex;
  gap: 20px;
}

.info-poster {
  width: 140px;
  flex-shrink: 0;
}

.info-poster img {
  width: 100%;
  border-radius: var(--radius-md);
  aspect-ratio: 2/3;
  object-fit: cover;
}

.info-body {
  flex: 1;
  min-width: 0;
}

.info-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.info-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.meta-rating {
  color: #f59e0b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
}

.meta-status {
  padding: 1px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.meta-status.completed {
  background: #d1fae5;
  color: #059669;
}

.meta-status.airing {
  background: #fef3c7;
  color: #d97706;
}

.info-line {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  line-height: 1.5;
}

.info-line .label {
  color: var(--text-muted);
}

.info-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-top: 8px;
}

.episode-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.episode-btn {
  padding: 8px 16px;
  font-size: 13px;
  font-family: inherit;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.episode-btn:hover {
  border-color: var(--primary-light);
  color: var(--primary);
}

.episode-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.episode-empty {
  padding: 20px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

/* Responsive */
@media (max-width: 640px) {
  .player-page {
    padding: 10px;
  }

  .drama-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 14px;
  }

  .info-poster {
    width: 120px;
  }

  .info-meta {
    justify-content: center;
    gap: 6px;
    font-size: 12px;
  }

  .info-title {
    font-size: 17px;
  }

  .episode-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .episode-grid {
    gap: 6px;
  }

  .player-wrapper {
    aspect-ratio: 16/9;
    border-radius: var(--radius-md);
  }
}
</style>
