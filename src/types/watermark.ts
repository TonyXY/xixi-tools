export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'tiled'

export interface WatermarkConfig {
  text: string
  position: WatermarkPosition
  fontSize: number
  color: string
  opacity: number
  rotation: number
}

export const defaultWatermarkConfig: WatermarkConfig = {
  text: '水印',
  position: 'bottom-right',
  fontSize: 24,
  color: '#ffffff',
  opacity: 0.5,
  rotation: 0
}