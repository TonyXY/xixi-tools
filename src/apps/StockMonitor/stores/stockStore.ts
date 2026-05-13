import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Stock, StockHistory, TimeRange } from '../types'
import { getStockInfo, getStockHistory, validateStockCode } from '../utils/stockApi'

export const useStockStore = defineStore('stock', () => {
  // 监控的股票列表
  const stocks = ref<Stock[]>([])
  
  // 股票历史数据
  const histories = ref<Map<string, StockHistory>>(new Map())
  
  // 当前选择的时间范围
  const currentTimeRange = ref<TimeRange>('1m')
  
  // 加载状态
  const loading = ref(false)
  
  // 添加股票
  async function addStock(code: string): Promise<{ success: boolean; message: string }> {
    if (!validateStockCode(code)) {
      return { success: false, message: '请输入6位股票代码' }
    }
    
    // 检查是否已存在
    if (stocks.value.some(s => s.code === code)) {
      return { success: false, message: '该股票已在监控列表中' }
    }
    
    loading.value = true
    
    try {
      const stock = await getStockInfo(code)
      if (stock) {
        stocks.value.push(stock)
        
        // 获取历史数据
        const history = await getStockHistory(code, currentTimeRange.value)
        if (history) {
          histories.value.set(code, history)
        }
        
        // 保存到本地存储
        saveToStorage()
        
        return { success: true, message: '添加成功' }
      }
      return { success: false, message: '未找到该股票' }
    } catch (error) {
      return { success: false, message: '获取股票信息失败' }
    } finally {
      loading.value = false
    }
  }
  
  // 删除股票
  function removeStock(code: string) {
    stocks.value = stocks.value.filter(s => s.code !== code)
    histories.value.delete(code)
    saveToStorage()
  }
  
  // 刷新单个股票
  async function refreshStock(code: string) {
    try {
      const stock = await getStockInfo(code)
      if (stock) {
        const index = stocks.value.findIndex(s => s.code === code)
        if (index !== -1) {
          stocks.value[index] = stock
        }
      }
    } catch (error) {
      console.error('刷新失败:', error)
    }
  }
  
  // 刷新所有股票
  async function refreshAll() {
    loading.value = true
    try {
      await Promise.all(stocks.value.map(s => refreshStock(s.code)))
    } finally {
      loading.value = false
    }
  }
  
  // 切换时间范围
  async function setTimeRange(range: TimeRange) {
    currentTimeRange.value = range
    // 重新获取所有股票的历史数据
    await Promise.all(
      stocks.value.map(s => getStockHistory(s.code, range).then(h => {
        if (h) histories.value.set(s.code, h)
      }))
    )
  }
  
  // 获取历史数据
  function getHistory(code: string): StockHistory | undefined {
    return histories.value.get(code)
  }
  
  // 本地存储
  function saveToStorage() {
    const codes = stocks.value.map(s => s.code)
    localStorage.setItem('monitoredStocks', JSON.stringify(codes))
  }
  
  async function loadFromStorage() {
    // 暂时不自动加载，避免加载失败
  }
  
  return {
    stocks,
    histories,
    currentTimeRange,
    loading,
    addStock,
    removeStock,
    refreshStock,
    refreshAll,
    setTimeRange,
    getHistory,
    loadFromStorage
  }
})