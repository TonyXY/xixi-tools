<template>
  <SearchView v-if="!isPlayerView" />
  <PlayerView v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SearchView from './components/SearchView.vue'
import PlayerView from './components/PlayerView.vue'

const route = useRoute()

const isPlayerView = computed(() => {
  return !!(route.query.id && route.query.source)
})
</script>
