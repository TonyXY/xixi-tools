export interface Stock {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  volume: number
  timestamp: number
}

export interface StockHistory {
  code: string
  name: string
  data: {
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }[]
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    fill: boolean
    tension: number
  }[]
}

export type TimeRange = '1d' | '1w' | '1m' | '3m' | '1y'