import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Photo {
  name: string
  path: string
  relativePath: string
  size: number
  modified: number
}

export const useGalleryStore = defineStore('gallery', () => {
  const currentFolder = ref('')
  const photos = ref<Photo[]>([])
  const selectedPhoto = ref<Photo | null>(null)
  const isLoading = ref(false)

  async function setFolder(folderPath: string) {
    isLoading.value = true
    try {
      const res = await fetch('/api/select-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath })
      })
      const data = await res.json()
      
      if (data.ok) {
        currentFolder.value = data.currentFolder
        await loadPhotos()
      } else {
        window.dispatchEvent(new CustomEvent('gallery-error', { detail: data.error || '无法访问该文件夹' }))
      }
    } catch (error) {
      window.dispatchEvent(new CustomEvent('gallery-error', { detail: '无法连接到服务器' }))
      console.error(error)
    } finally {
      isLoading.value = false
    }
  }

  async function loadPhotos() {
    if (!currentFolder.value) return
    
    isLoading.value = true
    try {
      const res = await fetch('/api/photos')
      const data = await res.json()
      if (data.photos) {
        photos.value = data.photos.map((relativePath: string) => ({
          name: relativePath.split('/').pop() || relativePath.split('\\').pop() || '',
          path: relativePath,
          relativePath: relativePath,
          size: 0,
          modified: 0
        }))
      }
    } catch (error) {
      console.error('Failed to load photos:', error)
    } finally {
      isLoading.value = false
    }
  }

  function selectPhoto(photo: Photo) {
    selectedPhoto.value = photo
  }

  function clearSelection() {
    selectedPhoto.value = null
  }

  function getThumbnailUrl(photoPath: string): string {
    return `/api/thumbnail/${encodeURIComponent(photoPath)}`
  }

  function getPhotoUrl(photoPath: string): string {
    return `/api/photo/${encodeURIComponent(photoPath)}`
  }

  return {
    currentFolder,
    photos,
    selectedPhoto,
    isLoading,
    setFolder,
    loadPhotos,
    selectPhoto,
    clearSelection,
    getThumbnailUrl,
    getPhotoUrl
  }
})
