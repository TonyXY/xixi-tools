import type { HotDrama, Drama, DramaDetail } from '../types'

const API_BASE = '/api/movie'

async function fetchJson<T>(url: string, errorMsg: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(errorMsg)
  return res.json()
}

export async function fetchHot(): Promise<HotDrama[]> {
  const data = await fetchJson<{ items: HotDrama[] }>(`${API_BASE}/hot`, '获取热门数据失败')
  return data.items || []
}

export async function searchDramas(query: string, page = 1, region = ''): Promise<{
  items: Drama[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}> {
  let url = `${API_BASE}/search?q=${encodeURIComponent(query)}&page=${page}`
  if (region) url += `&region=${encodeURIComponent(region)}`
  const data = await fetchJson<{
    items: Drama[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
  }>(url, '搜索请求失败')
  return data
}

export async function fetchDetail(id: string, source: string): Promise<DramaDetail> {
  return fetchJson<DramaDetail>(
    `${API_BASE}/detail?id=${encodeURIComponent(id)}&source=${encodeURIComponent(source)}`,
    '获取详情失败'
  )
}
