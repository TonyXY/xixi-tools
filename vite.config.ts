import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const routes = ['/home', '/stock', '/photo-id', '/photo-gallery', '/watermark', '/ai-knowledge']

function generateRouteHtml(): import('vite').Plugin {
  return {
    name: 'generate-route-html',
    closeBundle() {
      const indexHtml = path.resolve(__dirname, 'dist/index.html')
      const content = fs.readFileSync(indexHtml, 'utf-8')
      for (const route of routes) {
        const dir = path.resolve(__dirname, `dist${route}`)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), content)
      }
    }
  }
}

export default defineConfig({
  base: '/xixi-tools/',
  plugins: [vue(), generateRouteHtml()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true
      }
    }
  }
})