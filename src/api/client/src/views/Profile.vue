<template>
  <div class="page">
    <h2>My Profile</h2>
    <div v-if="player" class="card">
      <p><strong>Username:</strong> {{ player.username }}</p>
      <p><strong>Email:</strong> {{ player.email }}</p>
      <p><strong>Status:</strong> {{ player.status }}</p>
      <p><strong>Subscribed:</strong> {{ profile?.subscribed ? '✅ Yes (ad-free)' : '❌ No (ads enabled)' }}</p>

      <hr style="border-color:#333;margin:16px 0" />

      <label>Display Name</label>
      <input v-model="form.display_name" style="margin-bottom:12px" />

      <label>Bio</label>
      <input v-model="form.bio" style="margin-bottom:12px" />

      <label>Avatar URL</label>
      <input v-model="form.avatar_url" style="margin-bottom:16px" />

      <button @click="save">Save Changes</button>
      <p v-if="saved" style="color:#4caf50;margin-top:8px">Saved!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../api'

const player  = ref(null)
const profile = ref(null)
const saved   = ref(false)
const form    = reactive({ display_name: '', bio: '', avatar_url: '' })

onMounted(async () => {
  const { data } = await api.get('/auth/me')
  player.value   = data.data
  profile.value  = data.data.profile
  form.display_name = profile.value?.display_name ?? ''
  form.bio          = profile.value?.bio ?? ''
  form.avatar_url   = profile.value?.avatar_url ?? ''
})

async function save() {
  await api.put('/players/me', form)
  saved.value = true
  setTimeout(() => saved.value = false, 2000)
}
</script>
