<template>
  <div style="max-width:400px;margin:80px auto;padding:0 16px">
    <h1 style="color:#e94560;text-align:center">GRIDFORGE</h1>

    <div class="card">
      <div style="display:flex;gap:12px;margin-bottom:20px">
        <button :style="mode==='login'?'':'background:#333'" @click="mode='login'">Login</button>
        <button :style="mode==='register'?'':'background:#333'" @click="mode='register'">Register</button>
      </div>

      <form @submit.prevent="submit">
        <label>Email</label>
        <input v-model="form.email" type="email" required style="margin-bottom:12px" />

        <template v-if="mode==='register'">
          <label>Username</label>
          <input v-model="form.username" required style="margin-bottom:12px" />
        </template>

        <label>Password</label>
        <input v-model="form.password" type="password" required style="margin-bottom:16px" />

        <button type="submit" style="width:100%">{{ mode === 'login' ? 'Login' : 'Register' }}</button>
      </form>

      <p v-if="error" style="color:#e94560;margin-top:12px">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const mode   = ref('login')
const error  = ref('')
const form   = reactive({ email: '', password: '', username: '' })

async function submit() {
  error.value = ''
  try {
    const endpoint = mode.value === 'login' ? '/auth/login' : '/auth/register'
    const payload  = mode.value === 'login'
      ? { email: form.email, password: form.password }
      : { email: form.email, password: form.password, username: form.username }

    const { data } = await api.post(endpoint, payload)
    localStorage.setItem('token', data.data.token)
    router.push('/games')
  } catch (e) {
    error.value = e.response?.data?.error ?? e.response?.data?.message ?? 'Something went wrong.'
  }
}
</script>
