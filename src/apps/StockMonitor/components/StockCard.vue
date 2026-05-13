<template>
  <div class="stock-card">
    <div class="stock-header">
      <div class="stock-info">
        <h3>{{ stock.name }}</h3>
        <span class="stock-code">{{ stock.code }}</span>
      </div>
      <div class="stock-price">
        <div class="current-price">¥{{ stock.price.toFixed(2) }}</div>
        <div class="price-change" :class="stock.change >= 0 ? 'price-up' : 'price-down'">
          {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}
          ({{ stock.changePercent >= 0 ? '+' : '' }}{{ stock.changePercent.toFixed(2) }}%)
        </div>
      </div>
    </div>
    
    <div class="stock-details">
      <div class="detail-item">
        <span class="detail-label">开盘</span>
        <span class="detail-value">{{ stock.open.toFixed(2) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">最高</span>
        <span class="detail-value">{{ stock.high.toFixed(2) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">最低</span>
        <span class="detail-value">{{ stock.low.toFixed(2) }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">成交量</span>
        <span class="detail-value">{{ formatVolume(stock.volume) }}</span>
      </div>
    </div>
    
    <div class="time-range">
      <button 
        v-for="range in timeRanges" 
        :key="range.value"
        class="time-btn"
        :class="{ active: currentRange === range.value }"
        @click="$emit('changeRange', range.value)"
      >
        {{ range.label }}
      </button>
    </div>
    
    <div v-if="history" class="chart-wrapper">
      <StockChart :history="history" />
    </div>
    
    <div class="stock-actions">
      <button class="action-btn" @click="$emit('refresh')">刷新</button>
      <button class="action-btn delete" @click="$emit('remove')">删除</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Stock, StockHistory, TimeRange } from '../types'
import StockChart from './StockChart.vue'

defineProps<{
  stock: Stock
  history?: StockHistory
  currentRange: TimeRange
}>()

defineEmits<{
  (e: 'refresh'): void
  (e: 'remove'): void
  (e: 'changeRange', range: TimeRange): void
}>()

const timeRanges = [
  { label: '分时', value: '1d' as TimeRange },
  { label: '日K', value: '1w' as TimeRange },
  { label: '周K', value: '1m' as TimeRange },
  { label: '月K', value: '3m' as TimeRange },
  { label: '年K', value: '1y' as TimeRange }
]

function formatVolume(volume: number): string {
  if (volume >= 100000000) {
    return (volume / 100000000).toFixed(2) + '亿'
  } else if (volume >= 10000) {
    return (volume / 10000).toFixed(2) + '万'
  }
  return volume.toString()
}
</script>

<style scoped>
.stock-card {
  background: #fff;
  border-radius: var(--radius-md);
  padding: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
  transition: all 0.2s;
}

.stock-card:hover {
  box-shadow: var(--shadow-md);
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.stock-info h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.stock-code {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--gray-100);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.stock-price {
  text-align: right;
}

.current-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.price-change {
  font-size: 11px;
  font-weight: 500;
}

.price-up {
  color: #ef4444;
}

.price-down {
  color: #10b981;
}

.stock-details {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 8px 0;
  border-top: 1px solid var(--gray-100);
  border-bottom: 1px solid var(--gray-100);
  margin-bottom: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.detail-label {
  font-size: 10px;
  color: var(--text-muted);
}

.detail-value {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.time-range {
  display: flex;
  gap: 3px;
  margin-bottom: 8px;
}

.time-btn {
  flex: 1;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
  color: var(--gray-500);
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:hover {
  border-color: var(--primary-light);
  color: var(--primary);
}

.time-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.stock-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.action-btn {
  flex: 1;
  padding: 6px 12px;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.action-btn.delete:hover {
  background: var(--danger);
  border-color: var(--danger);
}

.chart-wrapper {
  margin-bottom: 8px;
}
</style>