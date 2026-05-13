<template>
  <div id="app">
    <section class="search-section">
      <div class="search-form">
        <input 
          v-model="stockCode" 
          type="text" 
          class="search-input" 
          placeholder="输入股票代码，如 600519"
          @keyup.enter="addStock"
        />
        <button class="search-btn" @click="addStock" :disabled="store.loading">
          添加
        </button>
      </div>
      
      <div class="quick-stocks">
        <button
          v-for="stock in popularStocks"
          :key="stock.code"
          class="quick-stock-btn"
          @click="addStockByCode(stock.code)"
        >
          {{ stock.code }}
        </button>
      </div>
    </section>
    
    <div v-if="store.stocks.length > 0" class="stock-grid">
      <StockCard
        v-for="stock in store.stocks"
        :key="stock.code"
        :stock="stock"
        :history="store.getHistory(stock.code)"
        :current-range="store.currentTimeRange"
        @refresh="refreshStock(stock.code)"
        @remove="removeStock(stock.code)"
        @change-range="changeRange"
      />
    </div>
    
    <div v-else class="empty-state">
      <div class="empty-icon">📊</div>
      <p class="empty-text">输入股票代码开始监控</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStockStore } from './StockMonitor/stores/stockStore'
import { getPopularStocks } from './StockMonitor/utils/stockApi'
import { TimeRange } from './StockMonitor/types'
import StockCard from './StockMonitor/components/StockCard.vue'

const store = useStockStore()
const stockCode = ref('')
const popularStocks = getPopularStocks()

async function addStock() {
  if (!stockCode.value.trim()) return
  const result = await store.addStock(stockCode.value.trim())
  if (result.success) {
    stockCode.value = ''
  }
  alert(result.message)
}

async function addStockByCode(code: string) {
  const result = await store.addStock(code)
  if (!result.success) {
    alert(result.message)
  }
}

function removeStock(code: string) {
  store.removeStock(code)
}

async function refreshStock(code: string) {
  await store.refreshStock(code)
}

async function refreshAll() {
  await store.refreshAll()
}

async function changeRange(range: TimeRange) {
  await store.setTimeRange(range)
}

onMounted(async () => {
  await store.loadFromStorage()
})
</script>

<style scoped>
#app {
  padding: 0;
}

.search-section {
  margin-bottom: 12px;
}

.search-form {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: #fff;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.search-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.quick-stocks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.quick-stock-btn {
  padding: 4px 10px;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gray-600);
}

.quick-stock-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.empty-state {
  text-align: center;
  padding: 24px 0;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.empty-text {
  color: var(--text-muted);
  font-size: 13px;
}
</style>