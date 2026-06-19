<template>
  <div class="page">
    <h2>Inventory</h2>

    <div v-if="inventory.length === 0" class="card" style="color:#aaa">No items yet.</div>

    <div v-for="entry in inventory" :key="entry.id" class="card" style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <strong>{{ entry.item.name }}</strong>
        <span style="margin-left:8px;font-size:0.8rem;color:#e94560">{{ entry.item.rarity }}</span>
        <p style="margin:4px 0 0;color:#aaa;font-size:0.85rem">{{ entry.item.game?.name }}</p>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:1.1rem">x{{ entry.quantity }}</span>
        <button style="background:#333;padding:6px 12px" @click="openGiftModal(entry)">🎁 Gift</button>
      </div>
    </div>

    <!-- Gift modal -->
    <div v-if="giftModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:100">
      <div class="card" style="width:340px">
        <h3>Send Gift</h3>
        <p style="color:#aaa">Item: <strong>{{ giftModal.item.name }}</strong></p>
        <label>Recipient Player ID</label>
        <input v-model="recipientId" placeholder="UUID" style="margin-bottom:12px" />
        <div style="display:flex;gap:8px">
          <button @click="sendGift">Send</button>
          <button style="background:#333" @click="giftModal=null">Cancel</button>
        </div>
        <p v-if="giftMsg" style="margin-top:8px;color:#4caf50">{{ giftMsg }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const inventory  = ref([])
const giftModal  = ref(null)
const recipientId = ref('')
const giftMsg    = ref('')

onMounted(async () => {
  const { data } = await api.get('/players/me/inventory')
  inventory.value = data.data
})

function openGiftModal(entry) {
  giftModal.value  = entry
  recipientId.value = ''
  giftMsg.value    = ''
}

async function sendGift() {
  try {
    await api.post('/gifts', { recipient_id: recipientId.value, item_id: giftModal.value.item_id })
    giftMsg.value = 'Gift sent!'
    setTimeout(() => giftModal.value = null, 1500)
  } catch (e) {
    giftMsg.value = e.response?.data?.error ?? 'Failed to send gift.'
  }
}
</script>
