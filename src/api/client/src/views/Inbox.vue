<template>
  <div class="page">
    <h2>Gift Inbox</h2>

    <div v-if="gifts.length === 0" class="card" style="color:#aaa">No gifts received.</div>

    <div v-for="gift in gifts" :key="gift.id" class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <strong>{{ gift.item.name }}</strong>
          <span style="margin-left:8px;font-size:0.8rem;color:#e94560">{{ gift.item.rarity }}</span>
          <p style="margin:4px 0 0;color:#aaa;font-size:0.85rem">From: {{ gift.sender.username }}</p>
        </div>
        <span style="font-size:0.8rem;padding:4px 8px;border-radius:4px"
          :style="statusStyle(gift.status)">{{ gift.status }}</span>
      </div>

      <div v-if="gift.status === 'pending'" style="display:flex;gap:8px;margin-top:12px">
        <button @click="respond(gift.id, 'accept')">Accept</button>
        <button style="background:#555" @click="respond(gift.id, 'decline')">Decline</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const gifts = ref([])

onMounted(loadGifts)

async function loadGifts() {
  const { data } = await api.get('/gifts/received')
  gifts.value = data.data
}

async function respond(id, action) {
  await api.patch(`/gifts/${id}/${action}`)
  await loadGifts()
}

function statusStyle(status) {
  return {
    accepted: 'background:#1b5e20;color:#a5d6a7',
    declined: 'background:#4a1010;color:#ef9a9a',
    pending:  'background:#333;color:#aaa',
  }[status] ?? ''
}
</script>
