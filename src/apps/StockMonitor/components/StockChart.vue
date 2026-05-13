<template>
  <div class="chart-container">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Chart } from 'chart.js/auto'
import { StockHistory } from '../types'

const props = defineProps<{
  history: StockHistory
}>()

const chartRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// 判断是否是分时图
const isIntraday = (data: StockHistory['data']) => {
  return data[0]?.date.includes(':')
}

function createChart() {
  if (!chartRef.value) return
  
  const data = props.history.data
  const intraday = isIntraday(data)
  
  // 分时图用折线，K线图用蜡烛
  if (intraday) {
    createLineChart()
  } else {
    createCandleChart()
  }
}

function createLineChart() {
  if (!chartRef.value) return
  
  const data = props.history.data
  const labels = data.map(d => d.date.slice(11)) // 只显示时间
  
  // 分时图颜色
  const firstPrice = data[0]?.open || 0
  const lastPrice = data[data.length - 1]?.close || 0
  const lineColor = lastPrice >= firstPrice ? '#ef4444' : '#22c55e'
  
  if (chart) chart.destroy()
  
  chart = new Chart(chartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: data.map(d => d.close),
        borderColor: lineColor,
        backgroundColor: lineColor + '20',
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#fff',
          bodyColor: '#94a3b8',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              const d = data[context.dataIndex]
              const price = d.close
              const change = ((price - firstPrice) / firstPrice * 100).toFixed(2)
              const sign = price >= firstPrice ? '+' : ''
              return [
                `价格: ¥${price.toFixed(2)}`,
                `涨跌: ${sign}${change}%`
              ]
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#334155', drawBorder: false },
          ticks: { 
            color: '#64748b', 
            maxTicksLimit: 6, 
            font: { size: 10 },
            autoSkip: true
          }
        },
        y: {
          position: 'right',
          grid: { color: '#334155', drawBorder: false },
          ticks: {
            color: '#64748b',
            font: { size: 10 },
            callback: (value) => '¥' + (value as number).toFixed(2)
          }
        }
      }
    }
  })
}

function createCandleChart() {
  if (!chartRef.value) return
  
  const data = props.history.data
  const labels = data.map(d => d.date.slice(5))
  
  // 计算颜色
  const colors = data.map((d, i) => {
    return d.close >= (i > 0 ? data[i - 1].close : d.open) ? '#ef4444' : '#22c55e'
  })
  
  // 计算合理的价格范围
  const allPrices = data.flatMap(d => [d.high, d.low])
  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)
  const priceRange = maxPrice - minPrice
  const padding = priceRange * 0.1
  const yMin = Math.floor((minPrice - padding) * 100) / 100
  const yMax = Math.ceil((maxPrice + padding) * 100) / 100
  
  if (chart) chart.destroy()
  
  chart = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'K线',
        data: data.map(d => [d.open, d.close]),
        backgroundColor: colors.map(c => c + 'aa'),
        borderColor: colors,
        borderWidth: 1,
        borderSkipped: false,
        barPercentage: 0.5,
        categoryPercentage: 0.8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#fff',
          bodyColor: '#94a3b8',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              const idx = context.dataIndex
              const d = data[idx]
              const up = d.close >= (idx > 0 ? data[idx - 1].close : d.open)
              const sign = up ? '↑' : '↓'
              return [
                `开盘: ¥${d.open.toFixed(2)}`,
                `收盘: ¥${d.close.toFixed(2)} ${sign}`,
                `最高: ¥${d.high.toFixed(2)}`,
                `最低: ¥${d.low.toFixed(2)}`
              ]
            }
          }
        }
      },
      scales: {
        x: {
          type: 'category',
          grid: { color: '#334155', drawBorder: false },
          ticks: { color: '#64748b', maxTicksLimit: 8, font: { size: 10 } }
        },
        y: {
          position: 'right',
          min: yMin,
          max: yMax,
          grid: { color: '#334155', drawBorder: false },
          ticks: {
            color: '#64748b',
            font: { size: 10 },
            callback: (value) => '¥' + (value as number).toFixed(2)
          }
        }
      }
    },
    plugins: [{
      id: 'candlestick',
      afterDatasetsDraw(chart) {
        const ctx = chart.ctx
        const meta = chart.getDatasetMeta(0)
        const dataset = props.history.data
        
        meta.data.forEach((bar, idx) => {
          const d = dataset[idx]
          const x = bar.x
          const yScale = chart.scales.y
          
          const highY = yScale.getPixelForValue(d.high)
          const lowY = yScale.getPixelForValue(d.low)
          const openY = yScale.getPixelForValue(d.open)
          const closeY = yScale.getPixelForValue(d.close)
          
          ctx.beginPath()
          ctx.strokeStyle = colors[idx]
          ctx.lineWidth = 1
          
          ctx.moveTo(x, highY)
          ctx.lineTo(x, Math.min(openY, closeY))
          
          ctx.moveTo(x, Math.max(openY, closeY))
          ctx.lineTo(x, lowY)
          
          ctx.stroke()
        })
      }
    }]
  })
}

onMounted(() => createChart())
watch(() => props.history, () => createChart(), { deep: true })
onUnmounted(() => chart?.destroy())
</script>

<style scoped>
.chart-container {
  height: 220px;
  position: relative;
}
</style>