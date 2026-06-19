import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Game, GameVersion, Item, Player } from '../../../models'
import GameItem from './item'
import { getGame, getGameVersions, deleteGameVersion } from '../../services/games'
import { getGameItems } from '../../services/items'
import { getGameLeaderboard } from '../../services/leaderboard'
import type { Leaderboard } from '../../../models/leaderboard'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
})

const formatDate = (value?: string) => value ? dateFormatter.format(new Date(value)) : 'N/A'
const formatBoolean = (value: boolean) => (value ? 'Enabled' : 'Disabled')


const GamePage = () => {
    const { gameId } = useParams<{ gameId?: string }>()
    const [gameVersions, setGameVersions] = useState<GameVersion[]>([])
    const [gameItems, setGameItems] = useState<Item[]>([])
    const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([])
    const [game, setGame] = useState<Game | null>(null)

    const fetchGameData = async () => {
        if (!gameId) return;

        const gameData = await getGame(gameId);
        setGame(gameData);

        const versionsData = await getGameVersions(gameId);
        setGameVersions(versionsData);

        const itemsData = await getGameItems(gameId);
        setGameItems(itemsData);

        const leaderboardData = await getGameLeaderboard(gameId);
        setLeaderboard(leaderboardData);
    }

    useEffect(() => {
        fetchGameData();
    }, [])

    const handleDeleteVersion = async (versionId: string | undefined) => {
        if (!versionId || !gameId || !confirm('Confirm deletion of this version branch?')) {
            return;
        }

        try {
            await deleteGameVersion(gameId, versionId);
            setGameVersions(gameVersions.filter(v => v.id !== versionId));
        } catch (error) {
            console.error("Error deleting version:", error);
        }
    }

    if (!game) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                    <div className="h-12 w-12 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin"></div>
                    <p className="font-medium tracking-tight">Synchronizing Forge Data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-10 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Link to="/dashboard/games" className="text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                             <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Back to Inventory</span>
                        </Link>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
                        {game.name}
                    </h1>
                    <p className="text-lg text-zinc-400 leading-relaxed font-light">
                        {game.description ?? 'A high-performance interactive experience registered in the Grid Forge ecosystem.'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                     <div className="px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl ring-1 ring-white/5 flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Created</span>
                        <span className="text-xs text-zinc-300 font-semibold">{formatDate(game.created_at)}</span>
                     </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Left Column: Versions & Items */}
                <div className="xl:col-span-2 space-y-12">
                    
                    {/* Versions Section */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 2v10"/><path d="M18.4 4.6a10 10 0 1 0 0 14.8"/><path d="M7 8l-4 4 4 4"/></svg>
                                Release Branches
                            </h2>
                            <Link
                                to={`/dashboard/games/${game.id}/versions/new`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 text-zinc-950 text-xs font-bold rounded-xl hover:bg-white transition-all active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                New Release
                            </Link>
                        </div>

                        {gameVersions.length > 0 ? (
                            <div className="space-y-4">
                                {gameVersions.map((version) => (
                                    <div key={version.id} className="group relative rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900/50 hover:border-zinc-700">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-colors ${version.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                                                     <span className="text-sm font-black">v{version.version}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-zinc-100">{version.version} Branch</h3>
                                                    <p className="text-xs font-mono text-zinc-600 mt-0.5">{version.id}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${version.is_active ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-zinc-800 bg-zinc-900 text-zinc-600'}`}>
                                                    {version.is_active ? 'Active Node' : 'Standby'}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteVersion(version.id)}
                                                    className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-600 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-zinc-800/50 grid grid-cols-2 md:grid-cols-3 gap-6">
                                             <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Release Date</span>
                                                <span className="text-sm text-zinc-400 font-medium">{formatDate(version.released_at)}</span>
                                             </div>
                                             <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Status</span>
                                                <span className="text-sm text-zinc-400 font-medium">{formatBoolean(version.is_active)}</span>
                                             </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 px-8 rounded-[2rem] border border-dashed border-zinc-800 bg-zinc-900/10 flex flex-col items-center justify-center text-center">
                                <p className="text-zinc-500 font-medium">No versions deployed yet.</p>
                            </div>
                        )}
                    </section>

                    {/* Items Section */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                                Object Registry
                            </h2>
                            <Link
                                to={`/dashboard/games/${game.id}/items/new`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 text-zinc-950 text-xs font-bold rounded-xl hover:bg-white transition-all active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                Register Item
                            </Link>
                        </div>

                        {gameItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {gameItems.map((item) => (
                                    <GameItem key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 px-8 rounded-[2rem] border border-dashed border-zinc-800 bg-zinc-900/10 flex flex-col items-center justify-center text-center">
                                <p className="text-zinc-500 font-medium">Registry is currently empty.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Leaderboard & Stats */}
                <div className="space-y-10">
                    <section className="rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800 p-8 shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-8 relative z-10 flex items-center gap-3">
                             High Score Matrix
                             <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </h2>

                        {leaderboard.length > 0 ? (
                            <div className="space-y-4 relative z-10">
                                {leaderboard.map((entry) => (
                                    <Link
                                        key={entry.player_id}
                                        to={`/dashboard/players/${entry.player_id}`}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all group/item"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg ${
                                                entry.rank === 1 ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 
                                                entry.rank === 2 ? 'bg-zinc-200 text-zinc-900' : 
                                                entry.rank === 3 ? 'bg-zinc-700 text-white' : 
                                                'bg-zinc-800 text-zinc-500'
                                            }`}>
                                                {entry.rank}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-100 group-hover/item:text-emerald-400 transition-colors">{entry.username}</p>
                                                <p className="text-[10px] text-zinc-600 font-mono tracking-tighter uppercase">{formatDate(entry.updated_at)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-emerald-400 tabular-nums">{entry.score.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">PTS</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 text-sm italic">Competitive metrics are not yet available for this shard.</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}

export default GamePage
