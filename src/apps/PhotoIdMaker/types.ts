export interface PhotoSize {
  name: string
  width: number  // px at 300dpi
  height: number // px at 300dpi
  aspectRatio: number
}

export type BackgroundColor = 'blue' | 'white' | 'red' | 'transparent'

export interface ImageAdjustments {
  brightness: number  // 0-200, 100 = default
  contrast: number    // 0-200, 100 = default
  saturation: number  // 0-200, 100 = default
}

export interface PhotoState {
  originalImage: string
  croppedImage: string
  backgroundRemovedImage: string
  finalImage: string
  selectedSize: string
  backgroundColor: BackgroundColor
  adjustments: ImageAdjustments
  isProcessing: boolean
  currentStep: number
}

// 常见证件照尺寸 (300dpi)
export const PresetSizes: Record<string, PhotoSize> = {
  '1寸': { name: '1寸', width: 295, height: 413, aspectRatio: 5/7 },
  '2寸': { name: '2寸', width: 413, height: 579, aspectRatio: 7/9 },
  '签证': { name: '签证', width: 413, height: 551, aspectRatio: 3/4 },
  '驾照': { name: '驾照', width: 378, height: 472, aspectRatio: 4/5 },
}

export const BackgroundColors: Record<BackgroundColor, { name: string; hex: string }> = {
  blue: { name: '蓝底', hex: '#3b82f6' },
  white: { name: '白底', hex: '#ffffff' },
  red: { name: '红底', hex: '#ef4444' },
  transparent: { name: '透明', hex: 'transparent' },
}
