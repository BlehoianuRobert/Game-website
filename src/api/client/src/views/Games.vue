<template>
  <div class="page">
    <h2>Games</h2>
    <div v-for="game in games" :key="game.id" class="card" style="cursor:pointer" @click="goLeaderboard(game.id)">
      <h3 style="margin:0 0 8px">{{ game.name }}</h3>
      <p style="color:#aaa;margin:0">{{ game.description }}</p>
      <p style="color:#e94560;margin:8px 0 0;font-size:0.85rem">View Leaderboard →</p>
    </div>
    <p v-if="games.length === 0" style="color:#aaa">No games yet.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const games  = ref([])

onMounted(async () => {
  const { data } = await api.get('/games')
  games.value = data.data.data ?? data.data
})

function goLeaderboard(gameId) {
  router.push(`/leaderboard/${gameId}`)
}
</script>
