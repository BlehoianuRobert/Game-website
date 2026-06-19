<template>
  <div v-if="visible" style="
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,0.92);z-index:9999;
    display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;
  ">
    <h2 style="font-size:2rem;margin-bottom:8px">📺 Advertisement</h2>
    <p style="color:#aaa;margin-bottom:24px">GRIDFORGE Premium removes all ads.</p>

    <div style="
      width:120px;height:120px;border-radius:50%;
      border:6px solid #e94560;
      display:flex;align-items:center;justify-content:center;
      font-size:2.5rem;font-weight:bold;margin-bottom:24px;
    ">{{ countdown }}</div>

    <p style="color:#888;font-size:0.9rem">This ad cannot be skipped.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const visible  = ref(false)
const countdown = ref(30)
const router   = useRouter()

let adToken = null

async function checkAdStatus() {
  if (!localStorage.getItem('token')) return

  try {
    const { data } = await api.get('/ads/status')
    const status = data.data

    if (status.ads_enabled && status.state === 'ad_pending') {
      await startAd()
    }
  } catch {
    // silently ignore — auth errors handled by axios interceptor
  }
}

async function startAd() {
  try {
    const { data } = await api.post('/ads/start')
    adToken  = data.data.token
    visible.value  = true
    countdown.value = 30

    const interval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(interval)
        completeAd()
      }
    }, 1000)
  } catch {
    // ad_pending state not set — skip
  }
}

async function completeAd() {
  try {
    await api.post('/ads/complete', { token: adToken })
  } finally {
    visible.value = false
    adToken = null
  }
}

// Check on every route navigation
router.afterEach(() => {
  checkAdStatus()
})

// Check on mount
onMounted(checkAdStatus)
</script>
