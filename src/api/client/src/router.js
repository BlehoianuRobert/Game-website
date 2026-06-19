import { createRouter, createWebHistory } from 'vue-router'
import Login from './views/Login.vue'
import Profile from './views/Profile.vue'
import Games from './views/Games.vue'
import Leaderboard from './views/Leaderboard.vue'
import Inventory from './views/Inventory.vue'
import Inbox from './views/Inbox.vue'

const routes = [
  { path: '/',              redirect: '/games' },
  { path: '/login',         component: Login,       meta: { public: true } },
  { path: '/profile',       component: Profile },
  { path: '/games',         component: Games },
  { path: '/leaderboard/:gameId', component: Leaderboard },
  { path: '/inventory',     component: Inventory },
  { path: '/inbox',         component: Inbox },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (!to.meta.public && !token) return '/login'
})

export default router
