import { createRouter, createWebHistory } from 'vue-router'
import Home from '../apps/Home.vue'
import PhotoIdMaker from '../apps/PhotoIdMaker/index.vue'
import PhotoGallery from '../apps/PhotoGallery/index.vue'
import ImageWatermark from '../apps/ImageWatermark/index.vue'
import AIKnowledge from '../apps/AIKnowledge/index.vue'
import Movie from '../apps/Movie/index.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home },
  { path: '/photo-id', component: PhotoIdMaker },
  { path: '/photo-gallery', component: PhotoGallery },
  { path: '/watermark', component: ImageWatermark },
  { path: '/ai-knowledge', component: AIKnowledge },
  { path: '/movie', component: Movie }
]

const router = createRouter({
  history: createWebHistory('/xixi-tools/'),
  routes
})

export default router
