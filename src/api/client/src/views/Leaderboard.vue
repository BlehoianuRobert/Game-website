<template>
  <div class="page">
    <button @click="router.back()" style="background:#333;margin-bottom:16px">← Back</button>
    <h2>Leaderboard</h2>

    <div class="card" style="margin-bottom:16px">
      <label>Submit your score</label>
      <div style="display:flex;gap:8px;margin-top:8px">
        <input v-model.number="scoreInput" type="number" min="0" placeholder="Score" style="width:160px" />
        <button @click="submitScore">Submit</button>
      </div>
      <p v-if="myRank" style="margin-top:8px;color:#aaa">
        Your best: <strong style="color:#e94560">{{ myRank.score }}</strong> — Rank #{{ myRank.rank }}
      </p>
    </div>

    <div v-for="entry in leaderboard" :key="entry.player_id" class="card" style="display:flex;align-items:center;gap:16px;padding:12px 20px">
      <span style="font-size:1.4rem;min-width:36px;text-align:center">
        {{ entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}` }}
      </span>
      <div>
        <strong>{{ entry.username }}</strong>
        <p style="margin:0;color:#aaa;font-size:0.85rem">{{ entry.score.toLocaleString() }} pts</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'

const route  = useRoute()
const router = useRouter()
const gameId = route.params.gameId

const leaderboard = ref([])
const myRank      = ref(null)
const scoreInput  = ref(0)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  const [lb, me] = await Promise.all([
    api.get(`/leaderboard/${gameId}`),
    api.get(`/leaderboard/${gameId}/me`),
  ])
  leaderboard.value = lb.data.data
  myRank.value      = me.data.data
}

async function submitScore() {
  await api.post('/players/me/progress', { game_id: gameId, score: scoreInput.value })
  await loadData()
}
</script>
