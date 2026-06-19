<template>
  <div>
    <nav v-if="isLoggedIn" style="padding:12px;background:#1a1a2e;display:flex;gap:16px;align-items:center">
      <span style="color:#e94560;font-weight:bold;font-size:1.2rem">GRIDFORGE</span>
      <router-link to="/games">Games</router-link>
      <router-link to="/profile">Profile</router-link>
      <router-link to="/inventory">Inventory</router-link>
      <router-link to="/inbox">Inbox</router-link>
      <button @click="logout" style="margin-left:auto">Logout</button>
    </nav>

    <AdOverlay />
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AdOverlay from './components/AdOverlay.vue'
import api from './api'

const router = useRouter()
const isLoggedIn = computed(() => !!localStorage.getItem('token'))

async function logout() {
  await api.post('/auth/logout').catch(() => {})
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: sans-serif; background: #0f0f1a; color: #eee; }
a { color: #e94560; text-decoration: none; }
button { cursor: pointer; background: #e94560; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; }
input { padding: 8px; border-radius: 4px; border: 1px solid #444; background: #1a1a2e; color: #eee; width: 100%; }
.card { background: #1a1a2e; border-radius: 8px; padding: 20px; margin: 12px 0; }
.page { max-width: 800px; margin: 24px auto; padding: 0 16px; }
</style>
