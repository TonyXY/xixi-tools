<template>
  <div class="drama-card" @click="$emit('select', drama)">
    <div class="card-poster">
      <img :src="drama.cover" :alt="drama.title" loading="lazy" referrerpolicy="no-referrer" @error="onImgError" />
      <div class="card-rating" v-if="drama.rating > 0">
        <StarFilled /> {{ drama.rating }}
      </div>
      <div class="card-badge" v-if="drama.episodes && drama.episodes.length > 0">
        {{ drama.episodes.length }} 集
      </div>
    </div>
    <div class="card-info">
      <h3 class="card-title">{{ drama.title }}</h3>
      <p class="card-meta" v-if="drama.year || drama.region">
        {{ drama.year }}{{ drama.year && drama.region ? ' · ' : '' }}{{ drama.region }}
      </p>
      <p class="card-desc" v-if="drama.description">{{ truncate(drama.description, 60) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StarFilled } from '@ant-design/icons-vue'
import type { Drama } from '../types'

defineProps<{
  drama: Drama
}>()

defineEmits<{
  select: [drama: Drama]
}>()

function truncate(text: string, len: number) {
  return text.length > len ? text.slice(0, len) + '...' : text
}

function onImgError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWEyZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij7mm7TmlrDkuYvliqA8L3RleHQ+PC9zdmc+'
}
</script>

<style scoped>
.drama-card {
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.drama-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.card-poster {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: var(--gray-100);
}

.card-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-rating {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 2px;
}

.card-badge {
  position: absolute;
  bottom: 6px;
  left: 6px;
  padding: 2px 8px;
  font-size: 11px;
  color: #fff;
  background: rgba(99, 102, 241, 0.85);
  border-radius: var(--radius-sm);
}

.card-info {
  padding: 10px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
