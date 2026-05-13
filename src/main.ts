import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import App from './App.vue'

import StockMonitor from './apps/StockMonitor.vue'
import PhotoIdMaker from './apps/PhotoIdMaker.vue'
import PhotoGallery from './apps/PhotoGallery.vue'
import ImageWatermark from './apps/ImageWatermark.vue'
import AIKnowledge from './apps/AIKnowledge.vue'

const routes = [
  { path: '/', redirect: '/stock' },
  { path: '/stock', component: StockMonitor },
  { path: '/photo-id', component: PhotoIdMaker },
  { path: '/photo-gallery', component: PhotoGallery },
  { path: '/watermark', component: ImageWatermark },
  { path: '/ai-knowledge', component: AIKnowledge }
]

const router = createRouter({
  history: createWebHistory('/xixi-tools/'),
  routes
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Antd)
app.mount('#app')