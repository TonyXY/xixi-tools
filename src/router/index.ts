import { createRouter, createWebHistory } from 'vue-router'
import Home from '../apps/Home.vue'
import PhotoIdMaker from '../apps/PhotoIdMaker/index.vue'
import PhotoGallery from '../apps/PhotoGallery/index.vue'
import ImageWatermark from '../apps/ImageWatermark/index.vue'
import AIKnowledge from '../apps/AIKnowledge/index.vue'
import Movie from '../apps/Movie/index.vue'
import TextToImage from '../apps/TextToImage/index.vue'
import Xiaohongshu from '../apps/Xiaohongshu/index.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: Home },
  { path: '/photo-id', component: PhotoIdMaker },
  { path: '/photo-gallery', component: PhotoGallery },
  { path: '/watermark', component: ImageWatermark },
  { path: '/ai-knowledge', component: AIKnowledge },
  { path: '/movie', component: Movie },
  { path: '/text-to-image', component: TextToImage },
  { path: '/xiaohongshu', component: Xiaohongshu }
]

const router = createRouter({
  history: createWebHistory('/xixi-tools/'),
  routes
})

export default router
