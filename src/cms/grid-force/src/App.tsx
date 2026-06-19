import { BrowserRouter, Navigate, NavLink, Route, Routes, Outlet } from 'react-router-dom'
import './App.css'
import Dashboard, { type DashboardCategory } from './dashboard/dashboard'
import Games from './dashboard/games/games'
import GameDetail from './dashboard/games/game'
import NewGame from './dashboard/games/newGame'
import Players from './dashboard/players/players'
import PlayerDetail from './dashboard/players/player'
import type { Game, Player as PlayerModel, PlayerProfile } from '../models'
import Login from './dashboard/auth/login'
import SignUp from './dashboard/auth/signup'
import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import NewGameVersion from './dashboard/games/newVersion'
import NewItem from './dashboard/games/newItem'
import EditItem from './dashboard/games/editItem'
import PlayerGames from './playerViews/games/games'
import PlayerGamePage from './playerViews/games/game'

// ... (existing mock data)

const players = [
  {
    id: 'player-001',
    username: 'nova_rider',
    email: 'nova.rider@example.com',
    password_hash: '$2b$10$mockhashnovarider000000000000000000000000000000000',
    status: 'active',
    created_at: '2026-04-18T09:15:00.000Z',
    role: 'player',
  },
  {
    id: 'player-002',
    username: 'emberfox',
    email: 'ember.fox@example.com',
    password_hash: '$2b$10$mockhashemberfox000000000000000000000000000000000',
    status: 'active',
    created_at: '2026-04-22T14:40:00.000Z',
    role: 'player',
  },
  {
    id: 'player-003',
    username: 'glitchpilot',
    email: 'glitch.pilot@example.com',
    password_hash: '$2b$10$mockhashglitchpilot000000000000000000000000000000',
    status: 'suspended',
    created_at: '2026-05-03T18:05:00.000Z',
    role: 'player',
  },
  {
    id: 'player-004',
    username: 'lumenbyte',
    email: 'lumen.byte@example.com',
    password_hash: '$2b$10$mockhashlumenbyte00000000000000000000000000000000',
    status: 'active',
    created_at: '2026-05-11T07:20:00.000Z',
    role: 'player',
  },
  {
    id: 'player-005',
    username: 'orbitmuse',
    email: 'orbit.muse@example.com',
    password_hash: '$2b$10$mockhashorbitmuse00000000000000000000000000000000',
    status: 'suspended',
    created_at: '2026-06-01T12:55:00.000Z',
    role: 'player'
  },
] satisfies PlayerModel[]

const playerProfiles = [
  {
    id: 'profile-001',
    player_id: 'player-001',
    display_name: 'Nova Rider',
    avatar_url: 'https://example.com/avatars/nova-rider.png',
    bio: 'Competitive strategist focused on co-op and live event play.',
    subscribed: true,
    created_at: '2026-04-18T10:05:00.000Z',
  },
  {
    id: 'profile-002',
    player_id: 'player-002',
    display_name: 'Ember Fox',
    avatar_url: 'https://example.com/avatars/ember-fox.png',
    bio: 'Builds high-score routes and shares short gameplay clips.',
    subscribed: true,
    created_at: '2026-04-22T15:05:00.000Z',
  },
  {
    id: 'profile-003',
    player_id: 'player-003',
    display_name: 'Glitch Pilot',
    avatar_url: null,
    bio: 'Experimenting with alternate accounts after moderation review.',
    subscribed: false,
    created_at: '2026-05-03T18:40:00.000Z',
  },
  {
    id: 'profile-004',
    player_id: 'player-004',
    display_name: 'Lumen Byte',
    avatar_url: 'https://example.com/avatars/lumen-byte.png',
    bio: 'Focuses on progression tracking and reward optimization.',
    subscribed: true,
    created_at: '2026-05-11T07:55:00.000Z',
  },
  {
    id: 'profile-005',
    player_id: 'player-005',
    display_name: null,
    avatar_url: null,
    bio: null,
    subscribed: false,
    created_at: '2026-06-01T13:10:00.000Z',
  },
] satisfies PlayerProfile[]

const categories: DashboardCategory[] = [
  { name: 'Players', path: 'players', component: <Players/> },
  { name: 'Games', path: 'games', component: <Games/> }
]

function PlayerDetailPage() {
  return <PlayerDetail />
}

function GameDetailPage() {
  return <GameDetail/>
}

// Layout pentru dashboard (cu sidebar)
function DashboardLayout() {
  const { Player } = useAuth();
  
  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl px-6 py-8 flex flex-col sticky top-0 h-screen">
        <div className="mb-10 px-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Grid Forge</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/80">CMS Platform</p>
            </div>
          </div>
          
          {Player && (
            <div className="mt-8 p-4 rounded-2xl bg-zinc-800/40 border border-zinc-700/50">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-1">Authenticated as</p>
              <p className="text-sm font-semibold text-zinc-200 truncate">{Player.username}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1" aria-label="Dashboard categories">
          <p className="px-3 mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Navigation</p>
          <ul className="space-y-1.5">
            {categories.map((category) => (
              <li key={category.path}>
                <NavLink
                  to={`/dashboard/${category.path}`}
                  className={({ isActive }: { isActive: boolean }) =>
                    `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border border-transparent'
                    }`
                  }
                >
                  <span className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                    categories.indexOf(category) === 0 ? 'bg-emerald-500' : 'bg-violet-500'
                  } group-[.active]:scale-125`}></span>
                  {category.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800/50">
           <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
             Sign out
           </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950">
        <header className="h-20 flex items-center justify-between px-10 border-b border-zinc-800/50 bg-zinc-950/20 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">System Online</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>
            <div className="h-10 w-10 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden ring-2 ring-emerald-500/10 shadow-lg">
               <img src={`https://ui-avatars.com/api/?name=${Player?.username || 'User'}&background=10b981&color=fff`} alt="avatar" />
            </div>
          </div>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Rute Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard categories={categories} />} />
          <Route path=":categoryPath" element={<Dashboard categories={categories} />} />
          <Route path="players/:playerId" element={<PlayerDetailPage />} />
          <Route path="games/new" element={<NewGame />} />
          <Route path="games/:gameId" element={<GameDetailPage />} />
          <Route path="games/:gameId/versions/new" element={<NewGameVersion />} />
          <Route path="games/:gameId/items/new" element={<NewItem />} />
          <Route path="games/:gameId/items/:itemId/edit" element={<EditItem />} />
        </Route>

        {/* Rute Player (fără layout-ul dashboard) */}
        <Route path="/games">
          <Route index element={<PlayerGames />} />
          <Route path="/games/:gameId" element={<PlayerGamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
