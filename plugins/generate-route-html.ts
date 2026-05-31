import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ROUTES = ['/home', '/photo-id', '/photo-gallery', '/watermark', '/ai-knowledge', '/movie']

export function generateRouteHtml(): Plugin {
  return {
    name: 'generate-route-html',
    closeBundle() {
      const indexHtml = path.resolve(__dirname, '../dist/index.html')
      const content = fs.readFileSync(indexHtml, 'utf-8')
      for (const route of ROUTES) {
        const dir = path.resolve(__dirname, `../dist${route}`)
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'index.html'), content)
      }
    }
  }
}
