<template>
  <div class="preview">
    <canvas ref="canvasRef" class="preview-canvas"></canvas>
    <div v-if="!props.imageUrl" class="preview-placeholder">
      <p>请上传图片</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { WatermarkConfig } from '../types/watermark'

const props = defineProps<{
  imageUrl: string | null
  config: WatermarkConfig
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

function render() {
  if (!canvasRef.value || !props.imageUrl) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const img = new Image()
  img.onload = () => {
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)
    drawWatermark(ctx, canvas)
  }
  img.src = props.imageUrl
}

function drawWatermark(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const { text, position, fontSize, color, opacity, rotation } = props.config
  if (!text) return

  ctx.save()
  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = color
  ctx.globalAlpha = opacity

  if (position === 'tiled') {
    drawTiledWatermark(ctx, canvas)
  } else {
    const pos = getPosition(canvas, ctx)
    ctx.translate(pos.x, pos.y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.fillText(text, 0, 0)
  }

  ctx.restore()
}

function drawTiledWatermark(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  const { text, fontSize, opacity, rotation } = props.config

  const spacingX = fontSize * 8
  const spacingY = fontSize * 6

  ctx.rotate((rotation * Math.PI) / 180)

  for (let y = -canvas.height; y < canvas.height * 2; y += spacingY) {
    for (let x = -canvas.width; x < canvas.width * 2; x += spacingX) {
      ctx.save()
      ctx.translate(x, y)
      ctx.fillText(text, 0, 0)
      ctx.restore()
    }
  }
}

function getPosition(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const padding = 20
  const text = props.config.text
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  const textHeight = props.config.fontSize

  switch (props.config.position) {
    case 'top-left':
      return { x: padding, y: padding + textHeight }
    case 'top-right':
      return { x: canvas.width - textWidth - padding, y: padding + textHeight }
    case 'bottom-left':
      return { x: padding, y: canvas.height - padding }
    case 'bottom-right':
      return { x: canvas.width - textWidth - padding, y: canvas.height - padding }
    case 'center':
    default:
      return { x: (canvas.width - textWidth) / 2, y: (canvas.height + textHeight) / 2 }
  }
}

function getCanvas() {
  return canvasRef.value
}

watch(() => props.imageUrl, render)
watch(() => props.config, render, { deep: true })

defineExpose({ getCanvas, render })
</script>

<style scoped>
.preview {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: auto;
  background: #f5f5f5;
}

.preview-canvas {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

.preview-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
</style>