import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { movieApiPlugin } from './plugins/movie-api-plugin'
import { generateRouteHtml } from './plugins/generate-route-html'

export default defineConfig({
  base: '/xixi-tools/',
  plugins: [vue(), generateRouteHtml(), movieApiPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api/folders': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/select-folder': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/photos': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/thumbnail': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/photo': { target: 'http://localhost:3005', changeOrigin: true },
    }
  }
})
