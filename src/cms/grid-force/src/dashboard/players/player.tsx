import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Item, Player, PlayerItem, PlayerProfile, PlayerProgress } from '../../../models'
import { getPlayerProfile, getPlayers } from '../../services/players'

interface PlayerPageProps {
    player?: Player
    profile?: PlayerProfile | null
    players?: Player[]
    profiles?: PlayerProfile[]
}

const statusStyles: Record<string, string> = {
    active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    suspended: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
})

const formatDate = (value?: string) => value ? dateFormatter.format(new Date(value)) : 'N/A'

const PlayerPage = (props: PlayerPageProps) => {
    const { playerId } = useParams<{ playerId?: string }>()
    const [player, setPlayer] = useState<Player | null>(props.player ?? null)
    const [profile, setProfile] = useState<PlayerProfile | null>(props.profile ?? null)
    const [items] = useState<Item[]>([])
    const [playerItems] = useState<PlayerItem[]>([])
    const [playerProgresses] = useState<PlayerProgress[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPlayerData = async () => {
        if (!playerId) return;
        setLoading(true);

        try {
            // Fetch profile
            const profileData = await getPlayerProfile(playerId);
            setProfile(profileData);

            // Fetch player details if not provided in props
            if (!props.player) {
                const playersData = await getPlayers();
                const foundPlayer = playersData.data.find((p: Player) => p.id === playerId);
                if (foundPlayer) {
                    setPlayer(foundPlayer);
                }
            }
        } catch (error) {
            console.error("Error fetching player data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (playerId && (!props.player || !props.profile)) {
            fetchPlayerData();
        } else {
            setLoading(false);
        }
    }, [playerId])

    const playerItemsForPlayer =
        player
            ? playerItems
                  .filter((entry) => entry.player_id === player.id)
                  .map((entry) => {
                      const item = items.find((candidate) => candidate.id === entry.item_id)

                      return item ? { ...entry, item } : null
                  })
                  .filter((entry): entry is PlayerItem & { item: Item } => entry !== null)
            : []

    const playerProgressesForPlayer =
        player
            ? playerProgresses.filter((entry) => entry.player_id === player.id)
            : []
    
    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                    <div className="h-12 w-12 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin"></div>
                    <p className="font-medium tracking-tight">Accessing Neural Profile...</p>
                </div>
            </div>
        )
    }

    if (!player) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-2xl font-bold text-white mb-4">Player not found</h1>
                <Link to="/dashboard/players" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors">
                    Return to Directory
                </Link>
            </div>
        )
    }

    return (
        <div className="p-10 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Link to="/dashboard/players" className="text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Back to Directory</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-6 mb-6">
                        <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-emerald-500/20 ring-4 ring-emerald-500/10">
                            {player.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
                                {profile?.display_name ?? player.username}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-zinc-500 font-medium">@{player.username}</p>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${player.status ? statusStyles[player.status] : 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'}`}>
                                    {player.status || 'unknown'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 font-bold text-sm hover:bg-zinc-800 transition-all active:scale-95 shadow-lg">
                        Edit Profile
                    </button>
                    <button className="px-6 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-all active:scale-95">
                        Suspend
                    </button>
                </div>
            </header>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Left: Bio & Stats */}
                <div className="xl:col-span-2 space-y-10">
                    {/* Identity Metadata */}
                    <section className="grid sm:grid-cols-2 gap-6">
                        <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 flex flex-col justify-between">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black mb-4">Registration Node</span>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-widest">Joined On</p>
                                <p className="text-xl font-bold text-white tracking-tight">{formatDate(player.created_at)}</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-zinc-900/40 border border-zinc-800 flex flex-col justify-between">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black mb-4">Neural Address</span>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-widest">Email Contact</p>
                                <p className="text-xl font-bold text-white tracking-tight truncate">{player.email}</p>
                            </div>
                        </div>
                    </section>

                    {/* Bio & Extended Profile */}
                    <section className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 text-zinc-800">
                             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-6 relative z-10">Neural Profile Data</h2>
                        {profile ? (
                            <div className="space-y-8 relative z-10">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black mb-2">Biography</p>
                                    <p className="text-lg text-zinc-400 font-light leading-relaxed">
                                        {profile.bio ?? 'No narrative established for this operative.'}
                                    </p>
                                </div>
                                <div className="flex gap-12">
                                     <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black mb-1">Subscription</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${profile.subscribed ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`}></div>
                                            <span className="text-sm font-bold text-zinc-200">{profile.subscribed ? 'Premium Active' : 'Standard Node'}</span>
                                        </div>
                                     </div>
                                     <div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black mb-1">Last Sync</p>
                                        <span className="text-sm font-bold text-zinc-200">{formatDate(profile.created_at)}</span>
                                     </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-6 flex items-center gap-4 text-zinc-500 italic">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                 Profile data has not been synchronized for this operative.
                            </div>
                        )}
                    </section>

                    {/* Inventory Registry */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                            Asset Inventory
                        </h2>
                        {playerItemsForPlayer.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {playerItemsForPlayer.map((entry) => (
                                    <div key={entry.id} className="p-6 rounded-[2rem] bg-zinc-900/30 border border-zinc-800 hover:border-emerald-500/20 transition-all group">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                                entry.item.rarity === 'legendary' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' :
                                                entry.item.rarity === 'epic' ? 'border-violet-500/30 bg-violet-500/10 text-violet-500' :
                                                'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                                {entry.item.rarity}
                                            </span>
                                            <div className="px-2 py-1 rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                QTY: {entry.quantity}
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-bold text-zinc-100 mb-1">{entry.item.name}</h4>
                                        <p className="text-xs text-zinc-500 line-clamp-2">{entry.item.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 rounded-[2rem] border border-dashed border-zinc-800 bg-zinc-900/10 text-center text-zinc-500 italic">
                                No physical assets registered in inventory.
                            </div>
                        )}
                    </section>
                </div>

                {/* Right: Progress & Stats */}
                <div className="space-y-10">
                    <section className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                             Operational Progress
                        </h2>

                        {playerProgressesForPlayer.length > 0 ? (
                            <div className="space-y-4">
                                {playerProgressesForPlayer.map((entry) => (
                                    <div key={entry.id} className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 flex items-center justify-between group">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Game Node</p>
                                            <p className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">{entry.game_id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-400 tabular-nums">{entry.score.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Aggregate Score</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-sm italic">No behavioral progress data captured.</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}

export default PlayerPage
