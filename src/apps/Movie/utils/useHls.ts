import { ref, watch, type Ref } from 'vue'
import Hls from 'hls.js'

export function useHls(videoRef: Ref<HTMLVideoElement | null>, sourceUrl: Ref<string>) {
  const playerReady = ref(false)
  const playerError = ref('')
  let hlsInstance: Hls | null = null

  function destroyHls() {
    if (hlsInstance) {
      hlsInstance.destroy()
      hlsInstance = null
    }
    playerReady.value = false
    playerError.value = ''
  }

  function attachHls(url: string, video: HTMLVideoElement) {
    if (!Hls.isSupported()) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url
        playerReady.value = true
      } else {
        playerError.value = '浏览器不支持 HLS 播放'
      }
      return
    }

    const hls = new Hls()
    hlsInstance = hls

    hls.loadSource(url)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      playerReady.value = true
      playerError.value = ''
      video.play().catch(() => {})
    })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        playerError.value = `播放出错: ${data.type}`
        destroyHls()
      }
    })
  }

  function playSource(url: string) {
    destroyHls()
    if (!url) return

    const video = videoRef.value
    if (!video) return

    if (url.includes('.m3u8')) {
      attachHls(url, video)
    } else {
      video.src = url
      playerReady.value = true
      playerError.value = ''
    }
  }

  watch(sourceUrl, (url) => {
    playSource(url)
  })

  return {
    playerReady,
    playerError,
    playSource,
    destroy: destroyHls
  }
}
