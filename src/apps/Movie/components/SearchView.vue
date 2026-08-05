<template>
  <div class="movie-page">
    <!-- Search Bar -->
    <div class="search-section">
      <div class="search-box">
        <input
          v-model="store.searchQuery"
          type="text"
          placeholder="搜索影视剧名称..."
          class="search-input"
          @keyup.enter="doSearch"
        />
        <button class="btn btn-primary search-btn" :disabled="!store.searchQuery.trim()" @click="doSearch">
          <SearchOutlined />
          搜索
        </button>
      </div>
      <div v-if="store.searchHistory.length && store.searchResults === null" class="search-history">
        <div class="history-header">
          <span class="history-label">历史搜索</span>
          <span class="history-clear" @click="store.clearHistory()">清空</span>
        </div>
        <div class="history-tags">
          <span v-for="q in store.searchHistory" :key="q" class="history-tag" @click="searchByQuery(q)">
            {{ q }}
            <CloseOutlined class="history-remove" @click.stop="store.removeFromHistory(q)" />
          </span>
        </div>
      </div>
      <div class="filter-scroll">
        <div class="filter-row">
          <span
            class="filter-pill"
            :class="{ active: store.chineseOnly }"
            @click="store.chineseOnly = !store.chineseOnly"
          >仅大陆</span>
          <span
            v-for="y in YEAR_OPTIONS"
            :key="y"
            class="filter-pill"
            :class="{ active: store.selectedYear === y }"
            @click="store.selectedYear = store.selectedYear === y ? '' : y"
          >{{ y }}</span>
        </div>
        <div class="filter-row">
          <span
            v-for="tag in HOT_TAGS"
            :key="tag"
            class="filter-pill"
            :class="{ active: store.selectedTags.includes(tag) }"
            @click="store.toggleTag(tag)"
          >{{ tag }}</span>
          <button v-if="store.selectedTags.length || store.selectedYear" class="btn btn-text filter-go-btn" @click="doSearch">
            筛选
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>正在加载...</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="error-section">
      <p class="error-msg">{{ store.error }}</p>
      <button class="btn btn-primary" @click="store.loadHot()">重试</button>
    </div>

    <!-- Search Results -->
    <template v-else-if="store.searchResults !== null">
      <div class="section-header">
        <h2>搜索结果</h2>
        <span class="result-count">共 {{ store.searchResults.length }} 条</span>
        <button class="btn btn-secondary btn-sm" @click="clearSearch">返回热门</button>
      </div>
      <div v-if="store.searchResults.length === 0" class="empty-section">
        <p>未找到相关影视，试试其他关键词</p>
      </div>
      <div v-else class="drama-grid">
        <DramaCard v-for="drama in store.searchResults" :key="drama.id" :drama="drama" @select="openDetail" />
      </div>
    </template>

    <!-- Hot Dramas -->
    <template v-else>
      <div class="section-header">
        <h2><FireOutlined /> 热门剧集</h2>
      </div>
      <div v-if="store.hotDramas.length === 0" class="empty-section">
        <p>暂无热门数据</p>
      </div>
      <div v-else class="hot-scroll">
        <div
          v-for="drama in store.hotDramas"
          :key="drama.id"
          class="hot-card"
          @click="openHotDrama(drama)"
        >
          <div class="hot-rank" :class="'rank-' + Math.min(drama.rank, 3)">#{{ drama.rank }}</div>
          <div class="hot-poster">
            <img :src="drama.cover" :alt="drama.title" loading="lazy" referrerpolicy="no-referrer" @error="onImgError" />
          </div>
          <div class="hot-info">
            <h4>{{ drama.title }}</h4>
            <span class="hot-rating"><StarFilled /> {{ drama.rating }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SearchOutlined, StarFilled, FireOutlined, LoadingOutlined, CloseOutlined } from '@ant-design/icons-vue'
import { useMovieStore } from '../stores/movieStore'
import { HOT_TAGS, YEAR_OPTIONS } from '../types'
import type { Drama, HotDrama } from '../types'
import { searchDramas } from '../utils/movieApi'
import DramaCard from './DramaCard.vue'

const router = useRouter()
const store = useMovieStore()

onMounted(() => {
  if (store.hotDramas.length === 0) {
    store.loadHot()
  }
})

function doSearch() {
  store.doSearch(store.searchQuery)
}

function clearSearch() {
  store.clearSearch()
}

function searchByQuery(q: string) {
  store.searchQuery = q
  store.doSearch(q)
}

function openDetail(drama: Drama) {
  if (drama.sourceUrl && drama.id) {
    router.push(`/movie?id=${drama.id}&source=${encodeURIComponent(drama.sourceUrl)}&title=${encodeURIComponent(drama.title)}`)
  } else {
    window.open(`https://movie.douban.com/subject/${drama.id}/`, '_blank')
  }
}

async function openHotDrama(drama: HotDrama) {
  try {
    const result = await searchDramas(drama.title, 1)
    if (result.items?.length > 0) {
      const first = result.items[0]
      router.push(`/movie?id=${first.id}&source=${encodeURIComponent(first.sourceUrl)}&title=${encodeURIComponent(first.title)}`)
      return
    }
  } catch (e) {
    console.warn('搜索剧集失败，跳转豆瓣兜底', e)
  }
  window.open(`https://movie.douban.com/subject/${drama.id}/`, '_blank')
}

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWEyZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij7mm7TmlrDkuYvliqA8L3RleHQ+PC9zdmc+'
}
</script>

<style scoped>
.movie-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}

/* Search */
.search-section {
  margin-bottom: 24px;
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 10px 16px;
  font-size: 14px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--primary);
}

.search-btn {
  padding: 10px 20px;
  font-size: 14px;
  gap: 4px;
}

/* Filter pills (region, year, category tags) */
.filter-scroll {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;
}

.filter-row::-webkit-scrollbar {
  display: none;
}

.filter-pill {
  flex-shrink: 0;
  padding: 5px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.filter-pill:active {
  transform: scale(0.95);
}

.filter-pill.active {
  color: #fff;
  background: var(--primary);
  border-color: var(--primary);
}

.filter-go-btn {
  flex-shrink: 0;
  padding: 5px 14px;
  font-size: 12px;
  color: #fff;
  background: var(--primary);
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  white-space: nowrap;
}

/* Search History */
.search-history {
  margin-top: 12px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.history-label {
  font-size: 12px;
  color: var(--text-muted);
}

.history-clear {
  font-size: 11px;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.history-clear:hover {
  color: var(--danger);
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.history-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px 3px 10px;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--gray-100);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s;
  max-width: 100%;
}

.history-tag:hover {
  color: var(--primary);
  background: #eef2ff;
}

.history-remove {
  font-size: 10px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.history-tag:hover .history-remove {
  opacity: 0.8;
}

.history-remove:hover {
  opacity: 1 !important;
  color: var(--danger);
}

/* Section Header */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.result-count {
  font-size: 13px;
  color: var(--text-muted);
}

/* Drama Grid */
.drama-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

/* Hot Grid (replaces horizontal scroll) */
.hot-scroll {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}

.hot-card {
  position: relative;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (hover: hover) {
  .hot-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }
}

.hot-rank {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border-radius: var(--radius-sm);
  z-index: 1;
}

.hot-rank.rank-1 {
  background: #ef4444;
}

.hot-rank.rank-2 {
  background: #f59e0b;
}

.hot-rank.rank-3 {
  background: #6366f1;
}

.hot-poster {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: var(--gray-100);
}

.hot-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-info {
  padding: 10px;
}

.hot-info h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-rating {
  font-size: 11px;
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 2px;
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

/* Error */
.error-section {
  text-align: center;
  padding: 40px 0;
}

.error-msg {
  color: var(--danger);
  margin-bottom: 12px;
  font-size: 14px;
}

/* Empty */
.empty-section {
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: 14px;
}

/* Utilities */
.btn-sm {
  padding: 6px 14px;
  font-size: 12px;
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .movie-page {
    padding: 10px;
  }

  .search-box {
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1 1 100%;
    order: 0;
  }

  .search-btn {
    flex: 1;
    order: 1;
    justify-content: center;
  }

  .drama-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }

  .section-header h2 {
    font-size: 16px;
  }

  .hot-scroll {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

@media (max-width: 400px) {
  .drama-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
}
</style>
