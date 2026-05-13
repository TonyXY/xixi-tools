import type { BackgroundColor } from '../types'

/**
 * Convert data URL to Image object
 */
export function dataURLToImage(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataURL
  })
}

/**
 * Convert Image to canvas
 */
export function imageToCanvas(img: HTMLImageElement, width?: number, height?: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width || img.width
  canvas.height = height || img.height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }
  return canvas
}

/**
 * Convert canvas to data URL
 */
export function canvasToDataURL(canvas: HTMLCanvasElement, format: 'image/png' | 'image/jpeg' = 'image/png', quality: number = 0.92): string {
  return canvas.toDataURL(format, quality)
}

/**
 * Apply background color to canvas
 */
export function applyBackgroundColor(canvas: HTMLCanvasElement, color: BackgroundColor): string {
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvasToDataURL(canvas)

  const colorMap: Record<BackgroundColor, string> = {
    blue: '#3b82f6',
    white: '#ffffff',
    red: '#ef4444',
    transparent: 'transparent'
  }

  if (color === 'transparent') {
    return canvasToDataURL(canvas)
  }

  // Create temp canvas with background
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')
  
  if (tempCtx) {
    // Fill background
    tempCtx.fillStyle = colorMap[color]
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    // Draw original image
    tempCtx.drawImage(canvas, 0, 0)
  }

  return canvasToDataURL(tempCanvas)
}

/**
 * Apply image adjustments via canvas filter
 */
export function applyAdjustments(dataURL: string, brightness: number, contrast: number, saturation: number): Promise<string> {
  return new Promise(async (resolve) => {
    const img = await dataURLToImage(dataURL)
    const canvas = imageToCanvas(img)
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      // Apply CSS filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
      ctx.drawImage(img, 0, 0)
      ctx.filter = 'none'
    }

    resolve(canvasToDataURL(canvas))
  })
}

/**
 * Download image from data URL
 */
export function downloadImage(dataURL: string, filename: string, format: 'png' | 'jpg' = 'png'): void {
  const link = document.createElement('a')
  link.download = `${filename}.${format}`
  link.href = dataURL
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Get image dimensions with max constraints
 */
export function getImageDimensions(img: HTMLImageElement, maxWidth: number, maxHeight: number): { width: number; height: number } {
  let width = img.width
  let height = img.height

  if (width > maxWidth) {
    height = (maxWidth / width) * height
    width = maxWidth
  }

  if (height > maxHeight) {
    width = (maxHeight / height) * width
    height = maxHeight
  }

  return { width: Math.round(width), height: Math.round(height) }
}

/**
 * Load image from file
 */
export function loadImageFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
