import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { movieApiPlugin } from './plugins/movie-api-plugin'
import { generateRouteHtml } from './plugins/generate-route-html'
import { textToImagePlugin } from './plugins/text-to-image-plugin'

export default defineConfig({
  base: '/xixi-tools/',
  // movieApiPlugin handles /api/movie/* in dev (runs inside Vite, no Express needed)
  // For production, the same API is served by server/movie-api.js (Express router)
  plugins: [vue(), generateRouteHtml(), movieApiPlugin(), textToImagePlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api/movie': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/folders': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/select-folder': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/photos': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/thumbnail': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/photo': { target: 'http://localhost:3005', changeOrigin: true },
    }
  }
})
