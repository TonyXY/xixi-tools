import { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

const MOVIE_SOURCES = [
  { id: 'ffzy', name: '非凡资源', baseUrl: 'https://cj.ffzyapi.com/api.php/provide/vod/', priority: 1 },
]

function getActiveMovieSources() {
  return [...MOVIE_SOURCES].sort((a, b) => a.priority - b.priority)
}

async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<Response | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } catch { return null }
  finally { clearTimeout(timer) }
}

async function searchCMS(query: string, page = 1) {
  const sources = getActiveMovieSources()
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      try {
        const url = `${source.baseUrl}?ac=videolist&wd=${encodeURIComponent(query)}&pg=${page}`
        const res = await fetchWithTimeout(url)
        if (!res || !res.ok) return null
        const data = await res.json()
        if (data.code !== 1 || !Array.isArray(data.list)) return null
        return { items: data.list, sourceName: source.name, sourceBaseUrl: source.baseUrl, total: data.total || 0, pagecount: data.pagecount || 1 }
      } catch { return null }
    })
  )
  const valid: any[] = []
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) valid.push(r.value)
  }
  return valid
}

async function getCMSDetail(sourceBaseUrl: string, vodId: number) {
  try {
    const url = `${sourceBaseUrl}?ac=detail&ids=${vodId}`
    const res = await fetchWithTimeout(url)
    if (!res || !res.ok) return null
    const data = await res.json()
    return data.code === 1 && data.list?.length ? data.list[0] : null
  } catch { return null }
}

async function searchDouban(query: string) {
  try {
    const url = `https://movie.douban.com/j/subject_suggest?q=${encodeURIComponent(query)}`
    const res = await fetchWithTimeout(url)
    if (!res || !res.ok) return []
    const raw = await res.json()
    return Array.isArray(raw) ? raw.map((item: any) => ({
      id: item.id || '', title: item.title || '', cover: item.cover || item.img || '',
      rate: item.rate || '', url: item.url || '', is_new: Boolean(item.is_new)
    })) : []
  } catch { return [] }
}

async function searchDoubanFiltered(tags: string[], sort = 'recommend', start = 0) {
  try {
    const params = new URLSearchParams({ sort, range: '0,10', tags: tags.join(','), start: String(start) })
    const url = `https://movie.douban.com/j/new_search_subjects?${params}`
    const res = await fetchWithTimeout(url)
    if (!res || !res.ok) return []
    const data = await res.json()
    return data.data || data.subjects || []
  } catch { return [] }
}

function normalizeTitle(title: string) {
  return title.replace(/[\s·\-_、。，！？《》【】「」『』""'']/g, '').toLowerCase()
}

function titleSimilarity(a: string, b: string) {
  const na = normalizeTitle(a), nb = normalizeTitle(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.85
  const setA = new Set(na.split('')), setB = new Set(nb.split(''))
  const intersection = [...setA].filter(c => setB.has(c))
  const unionSize = new Set([...setA, ...setB]).size
  return unionSize === 0 ? 0 : intersection.length / unionSize
}

function parseEpisodes(raw: string) {
  if (!raw) return []
  const allGroups = raw.split('$$$')
  const groups = allGroups.length > 1 ? [allGroups[1], ...allGroups.slice(0, 1), ...allGroups.slice(2)] : allGroups
  const episodeMap = new Map<number, any>()
  for (const group of groups) {
    for (const entry of group.split('#')) {
      const parts = entry.split('$')
      if (parts.length < 2) continue
      const url = parts[parts.length - 1]
      const title = parts[parts.length - 2]
      if (!url.startsWith('http')) continue
      const num = parseInt(title.match(/(\d+)/)?.[1] || '0')
      if (num === 0) continue
      if (!episodeMap.has(num)) {
        episodeMap.set(num, { id: `ep-${num}`, number: num, title, playUrl: url })
      }
    }
  }
  return Array.from(episodeMap.values()).sort((a, b) => a.number - b.number)
}

function sendJson(res: ServerResponse, data: any, status = 200) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

function parseUrl(req: IncomingMessage) {
  const u = new URL(req.url || '/', 'http://localhost')
  return u
}

// ===== Route Handlers =====

async function handleHot(req: IncomingMessage, res: ServerResponse) {
  try {
    const currentYear = new Date().getFullYear()
    const [resultsCurrent, resultsPrev] = await Promise.all([
      searchDoubanFiltered(['电视剧', String(currentYear)], 'T', 0),
      searchDoubanFiltered(['电视剧', String(currentYear - 1)], 'T', 0),
    ])
    const seen = new Set<string>()
    const unique: any[] = []
    for (const s of [...resultsCurrent, ...resultsPrev]) {
      const key = normalizeTitle(s.title)
      if (!seen.has(key) && parseFloat(s.rate) > 0) { seen.add(key); unique.push(s) }
    }
    unique.sort((a, b) => parseFloat(b.rate) - parseFloat(a.rate))
    const items = unique.slice(0, 20).map((subject, index) => ({
      id: subject.id, title: subject.title, cover: subject.cover || '',
      rating: parseFloat(subject.rate) || 0, category: '电视剧', rank: index + 1,
    }))
    sendJson(res, { items })
  } catch { sendJson(res, { error: '获取热门数据失败' }, 500) }
}

async function handleSearch(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = parseUrl(req)
    const query = url.searchParams.get('q') || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const region = url.searchParams.get('region') || ''
    if (!query.trim()) return sendJson(res, { items: [], total: 0, page, pageSize: 20, hasMore: false })

    const [sourceResults, doubanSubjects] = await Promise.all([searchCMS(query, page), searchDouban(query)])
    const seenTitles = new Set<string>()
    const mergedItems: any[] = []
    let totalCount = 0, maxPageCount = 1

    for (const result of sourceResults) {
      totalCount += result.total
      maxPageCount = Math.max(maxPageCount, result.pagecount)
      for (const item of result.items) {
        const normalized = item.vod_name.trim().toLowerCase()
        if (!seenTitles.has(normalized)) {
          seenTitles.add(normalized)
          mergedItems.push({ item, sourceName: result.sourceName, sourceBaseUrl: result.sourceBaseUrl })
        }
      }
    }

    const filtered = region
      ? mergedItems.filter(({ item }) => item.vod_area === region)
      : mergedItems

    const dramas = filtered.map(({ item, sourceName, sourceBaseUrl }) => {
      const hasEnded = item.vod_remarks?.includes('完结') || item.vod_remarks?.includes('全')
      let bestMatch: any = null, bestScore = 0
      for (const sub of doubanSubjects) {
        const score = titleSimilarity(item.vod_name, sub.title)
        if (score > bestScore && score >= 0.5) { bestScore = score; bestMatch = sub }
      }
      return {
        id: String(item.vod_id), title: bestMatch ? bestMatch.title : item.vod_name,
        cover: item.vod_pic || bestMatch?.cover || '',
        rating: bestMatch ? parseFloat(bestMatch.rate) || 0 : parseFloat(item.vod_score) || 0,
        year: parseInt(item.vod_year) || 0, category: item.type_name || '', region: item.vod_area || '',
        director: item.vod_director || '',
        actors: item.vod_actor ? item.vod_actor.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        description: item.vod_content ? item.vod_content.replace(/<[^>]*>/g, '').trim() : '',
        episodes: parseEpisodes(item.vod_play_url), status: hasEnded ? 'completed' : 'airing',
        updateTime: item.vod_time || '', source: sourceName, sourceUrl: sourceBaseUrl,
      }
    })

    sendJson(res, { items: dramas, total: totalCount, page, pageSize: 20, hasMore: page < maxPageCount })
  } catch { sendJson(res, { error: '搜索服务暂时不可用' }, 500) }
}

async function handleDetail(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = parseUrl(req)
    const id = url.searchParams.get('id')
    const source = url.searchParams.get('source')
    if (!id || !source) return sendJson(res, { error: '缺少参数' }, 400)

    const cmsItem = await getCMSDetail(source, parseInt(id))
    if (!cmsItem) return sendJson(res, { error: '未找到该剧集' }, 404)

    const hasEnded = cmsItem.vod_remarks?.includes('完结') || cmsItem.vod_remarks?.includes('全')
    const drama = {
      id: String(cmsItem.vod_id), title: cmsItem.vod_name || '', cover: cmsItem.vod_pic || '',
      rating: parseFloat(cmsItem.vod_score) || 0, year: parseInt(cmsItem.vod_year) || 0,
      category: cmsItem.type_name || '', region: cmsItem.vod_area || '',
      director: cmsItem.vod_director || '',
      actors: cmsItem.vod_actor ? cmsItem.vod_actor.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      description: cmsItem.vod_content ? cmsItem.vod_content.replace(/<[^>]*>/g, '').trim() : '',
      episodes: parseEpisodes(cmsItem.vod_play_url), status: hasEnded ? 'completed' : 'airing',
      updateTime: cmsItem.vod_time || '', source: 'CMS源', sourceUrl: source,
    }
    sendJson(res, drama)
  } catch { sendJson(res, { error: '获取详情失败' }, 500) }
}

async function handleCategory(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = parseUrl(req)
    const cat = url.searchParams.get('cat') || '电视剧'
    const page = parseInt(url.searchParams.get('page') || '1')
    const subjects = await searchDoubanFiltered([cat], 'T', (page - 1) * 20)
    const items = subjects.map((subject: any) => ({
      id: subject.id, title: subject.title, cover: subject.cover || '',
      rating: parseFloat(subject.rate) || 0, category: cat,
    }))
    sendJson(res, { items, total: items.length, page, pageSize: 20, hasMore: items.length === 20 })
  } catch { sendJson(res, { error: '获取分类数据失败' }, 500) }
}

// ===== Vite Plugin =====

export function movieApiPlugin(): Plugin {
  return {
    name: 'movie-api',
    configureServer(server) {
      // Must run before Vite's built-in middleware and proxy
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (!url.startsWith('/api/movie/')) return next()
        if (req.method !== 'GET') return next()

        const path = url.replace('/api/movie', '').split('?')[0]

        try {
          switch (path) {
            case '/hot':
              await handleHot(req, res)
              break
            case '/search':
              await handleSearch(req, res)
              break
            case '/detail':
              await handleDetail(req, res)
              break
            case '/category':
              await handleCategory(req, res)
              break
            default:
              next()
          }
        } catch (e) {
          sendJson(res, { error: 'Internal error' }, 500)
        }
      })
    }
  }
}
