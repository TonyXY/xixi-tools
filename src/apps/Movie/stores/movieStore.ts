import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { HotDrama, Drama } from '../types'
import { fetchHot, searchDramas } from '../utils/movieApi'

const HISTORY_KEY = 'movie-search-history'
const MAX_HISTORY = 10

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(items: string[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
  } catch { /* quota exceeded — ignore */ }
}

export const useMovieStore = defineStore('movie', () => {
  const hotDramas = ref<HotDrama[]>([])
  const searchResults = ref<Drama[] | null>(null)
  const loading = ref(false)
  const error = ref('')
  const searchQuery = ref('')
  const searching = ref(false)
  const chineseOnly = ref(true)
  const searchHistory = ref<string[]>(loadHistory())
  const selectedTags = ref<string[]>([])
  const selectedYear = ref('')

  watch(searchHistory, (val) => {
    saveHistory(val)
  })

  function toggleTag(tag: string) {
    const idx = selectedTags.value.indexOf(tag)
    if (idx >= 0) {
      selectedTags.value.splice(idx, 1)
    } else {
      selectedTags.value.push(tag)
    }
  }

  async function loadHot() {
    loading.value = true
    error.value = ''
    try {
      hotDramas.value = await fetchHot()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '加载热门数据失败'
    } finally {
      loading.value = false
    }
  }

  async function doSearch(query: string) {
    if (!query.trim() && !selectedTags.value.length) return
    searchQuery.value = query
    searching.value = true
    loading.value = true
    error.value = ''
    if (query.trim()) addToHistory(query.trim())
    try {
      const region = chineseOnly.value ? '大陆' : ''
      const data = await searchDramas(query, 1, region, selectedTags.value, selectedYear.value)
      searchResults.value = data.items || []
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '搜索失败'
    } finally {
      loading.value = false
      searching.value = false
    }
  }

  function clearSearch() {
    searchResults.value = null
    searchQuery.value = ''
    selectedTags.value = []
  }

  function addToHistory(query: string) {
    const arr = searchHistory.value.filter(q => q !== query)
    arr.unshift(query)
    searchHistory.value = arr.slice(0, MAX_HISTORY)
  }

  function removeFromHistory(query: string) {
    searchHistory.value = searchHistory.value.filter(q => q !== query)
  }

  function clearHistory() {
    searchHistory.value = []
  }

  return {
    hotDramas,
    searchResults,
    loading,
    error,
    searchQuery,
    searching,
    chineseOnly,
    searchHistory,
    selectedTags,
    selectedYear,
    loadHot,
    doSearch,
    clearSearch,
    toggleTag,
    removeFromHistory,
    clearHistory,
  }
})
