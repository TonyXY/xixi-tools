// 股票API - 东方财富（前端直接调用）
import { Stock, StockHistory, TimeRange } from '../types'

// 中国股票名称和基础价格（备用）
const STOCK_INFO: Record<string, { name: string; basePrice: number }> = {
  '000001': { name: '平安银行', basePrice: 12.50 },
  '000002': { name: '万科A', basePrice: 8.20 },
  '600000': { name: '浦发银行', basePrice: 8.15 },
  '600036': { name: '招商银行', basePrice: 38.50 },
  '600519': { name: '贵州茅台', basePrice: 1680.00 },
  '601318': { name: '中国平安', basePrice: 45.80 },
  '601398': { name: '工商银行', basePrice: 5.80 },
  '601939': { name: '建设银行', basePrice: 7.20 },
  '000858': { name: '五粮液', basePrice: 145.00 },
  '000333': { name: '美的集团', basePrice: 62.50 },
  '600276': { name: '恒瑞医药', basePrice: 48.50 },
  '300750': { name: '宁德时代', basePrice: 195.00 },
  '688981': { name: '中芯国际', basePrice: 52.30 },
  '002594': { name: '比亚迪', basePrice: 245.00 },
  '600030': { name: '中信证券', basePrice: 22.50 }
}

// 东方财富实时行情API（支持CORS）
async function fetchEastmoneyQuote(code: string): Promise<Stock | null> {
  try {
    const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f57,f58,f107,f169,f170,f171,f47,f48,f57,f58,f107,f169,f170,f171,f47,f48&ut=fa5fd1943c7b386f172d6893dbfba10b`
    
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'Origin': 'https://quote.eastmoney.com/'
      }
    })
    
    const data = await response.json()
    
    if (data.data) {
      const d = data.data
      return {
        code,
        name: d.f58 || STOCK_INFO[code]?.name || code,
        price: d.f43 || 0,
        change: d.f169 || 0,
        changePercent: d.f170 || 0,
        open: d.f46 || 0,
        high: d.f44 || 0,
        low: d.f45 || 0,
        volume: d.f47 || 0,
        timestamp: Date.now()
      }
    }
    return null
  } catch (error) {
    console.error('Eastmoney quote error:', error)
    return null
  }
}

// 获取股票信息
export async function getStockInfo(code: string): Promise<Stock | null> {
  // 先尝试东方财富API
  const stock = await fetchEastmoneyQuote(code)
  if (stock) return stock
  
  // 失败则用模拟数据
  const info = STOCK_INFO[code]
  if (!info) return null
  
  const prevClose = info.basePrice
  const price = Math.round(info.basePrice * (1 + (Math.random() - 0.5) * 0.06) * 100) / 100
  const change = Math.round((price - prevClose) * 100) / 100
  const changePercent = Math.round((change / prevClose) * 10000) / 100
  
  return {
    code,
    name: info.name,
    price,
    change,
    changePercent,
    open: Math.round(prevClose * (1 + (Math.random() - 0.5) * 0.02) * 100) / 100,
    high: Math.round(Math.max(price, prevClose) * 1.02 * 100) / 100,
    low: Math.round(Math.min(price, prevClose) * 0.98 * 100) / 100,
    volume: Math.floor(1000000 + Math.random() * 5000000),
    timestamp: Date.now()
  }
}

// 东方财富历史K线API
async function fetchEastmoneyHistory(code: string, range: TimeRange): Promise<StockHistory | null> {
  try {
    const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`
    let klt = 101 // 日K
    let limit = 30
    
    switch (range) {
      case '1w': limit = 7; break
      case '1m': limit = 30; break
      case '3m': limit = 90; break
      case '1y': limit = 250; break
      default: limit = 30
    }
    
    const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=${klt}&fqt=1&beg=0&end=20500101&lmt=${limit}`
    
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://quote.eastmoney.com/'
      }
    })
    
    const result = await response.json()
    
    if (result.data && result.data.klines) {
      const history = result.data.klines.map((k: string) => {
        const fields = k.split(',')
        return {
          date: fields[0],
          open: parseFloat(fields[1]),
          close: parseFloat(fields[2]),
          high: parseFloat(fields[3]),
          low: parseFloat(fields[4]),
          volume: parseInt(fields[5])
        }
      })
      
      return {
        code,
        name: result.data.name || STOCK_INFO[code]?.name || code,
        data: history
      }
    }
    return null
  } catch (error) {
    console.error('Eastmoney history error:', error)
    return null
  }
}

// 获取股票历史数据
export async function getStockHistory(code: string, range: TimeRange): Promise<StockHistory | null> {
  const history = await fetchEastmoneyHistory(code, range)
  if (history && history.data.length > 0) return history
  
  // 失败则用模拟数据
  const info = STOCK_INFO[code]
  const name = info?.name || code
  
  const data: StockHistory['data'] = []
  let price = (info?.basePrice || 100) * 0.95
  let days: number
  
  switch (range) {
    case '1w': days = 7; break
    case '1m': days = 30; break
    case '3m': days = 90; break
    case '1y': days = 365; break
    default: days = 30
  }
  
  const now = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    const open = price
    const dayChange = (Math.random() - 0.48) * 0.03
    const high = open * (1 + Math.abs(dayChange) * 1.5)
    const low = open * (1 - Math.abs(dayChange) * 1.5)
    const close = open * (1 + dayChange)
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(Math.min(high, close * 1.02) * 100) / 100,
      low: Math.round(Math.max(low, close * 0.98) * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(1000000 + Math.random() * 5000000)
    })
    
    price = close
  }
  
  return { code, name, data }
}

// 验证股票代码格式
export function validateStockCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

// 获取常用股票列表
export function getPopularStocks(): { code: string; name: string }[] {
  return Object.entries(STOCK_INFO).map(([code, info]) => ({ code, name: info.name }))
}