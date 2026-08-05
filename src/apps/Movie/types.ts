export interface DramaEpisode {
  id: string
  number: number
  title: string
  playUrl: string
}

export interface Drama {
  id: string
  title: string
  cover: string
  rating: number
  year: number
  category: string
  region: string
  director: string
  actors: string[]
  description: string
  episodes: DramaEpisode[]
  status: 'completed' | 'airing'
  updateTime: string
  source: string
  sourceUrl: string
  rank?: number
}

export interface HotDrama {
  id: string
  title: string
  cover: string
  rating: number
  category: string
  rank: number
}

export interface SearchResult {
  items: Drama[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface DramaDetail extends Drama {}

export const HOT_TAGS = ['电视剧', '电影', '国产剧', '悬疑', '古装', '都市', '喜剧', '爱情']

const currentYear = new Date().getFullYear()
export const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => String(currentYear - i))
