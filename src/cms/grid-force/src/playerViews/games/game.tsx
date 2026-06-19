import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Game, Item, PlayerProgress } from '../../../models'
import { getGame } from '../../services/games'
import { getGameLeaderboard } from '../../services/leaderboard'
import { getMyGameProgress, getInventory } from '../../services/players'
import type { Leaderboard } from '../../../models/leaderboard'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
})

const formatDate = (value?: string) => value ? dateFormatter.format(new Date(value)) : 'N/A'


const PlayerGamePage = () => {
    const { gameId } = useParams<{ gameId?: string }>()
    const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([])
    const [game, setGame] = useState<Game | null>(null)
    const [progress, setProgress] = useState<PlayerProgress | null>(null)
    const [inventory, setInventory] = useState<Item[]>([])

    const fetchGameData = async () => {
        if (!gameId) return;

        const gameData = await getGame(gameId);
        setGame(gameData);

        const leaderboardData = await getGameLeaderboard(gameId);
        setLeaderboard(leaderboardData);

        try {
            const progressData = await getMyGameProgress(gameId);
            setProgress(progressData);
            
            const inventoryData = await getInventory();
            setInventory(inventoryData);
        } catch (error) {
            console.error("No player data found:", error);
        }
    }

    useEffect(() => {
        fetchGameData();
    }, [])

    if (!game) {
        return (
            <div className="p-10 flex items-center justify-center min-h-screen bg-zinc-950">
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                    <div className="h-12 w-12 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin"></div>
                    <p className="font-medium tracking-tight">Syncing Shard State...</p>
                </div>
            </div>
        )
    }

    return (
        <section className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-10 lg:p-20 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-emerald-500/5 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
                <header className="mb-16">
                    <Link to="/games" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-all mb-8 group">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                         <span className="text-xs font-bold uppercase tracking-[0.2em]">Return to Portal</span>
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Active Session</p>
                            </div>
                            <h1 className="text-7xl font-black text-white tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
                                {game.name}
                            </h1>
                            <p className="text-xl text-zinc-400 font-light leading-relaxed">
                                {game.description ?? 'A high-fidelity interactive simulation integrated with the Grid Forge network.'}
                            </p>
                        </div>

                        {progress && (
                            <div className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-emerald-500/20 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 min-w-[280px]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-2 text-center">Operational Standing</p>
                                <p className="text-4xl font-black text-white text-center tabular-nums mb-1">{progress.score.toLocaleString()}</p>
                                <p className="text-[10px] font-medium text-zinc-500 text-center uppercase tracking-widest">Aggregate Rank Score</p>
                            </div>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Inventory & Stats */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Shard Inventory */}
                        <section className="p-10 rounded-[3rem] bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 text-zinc-800/30 -z-10">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                            </div>
                            
                            <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-4">
                                Registered Assets
                                <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-500 font-bold">{inventory.length}</span>
                            </h2>
                            
                            {inventory.length > 0 ? (
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {inventory.map(item => (
                                        <div key={item.id} className="group p-6 rounded-[2rem] bg-zinc-950/50 border border-zinc-800 hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                                    item.rarity === 'legendary' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' :
                                                    item.rarity === 'epic' ? 'border-violet-500/30 bg-violet-500/10 text-violet-500' :
                                                    'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                                                }`}>
                                                    {item.rarity}
                                                </span>
                                                <div className="h-2 w-2 rounded-full bg-zinc-800 group-hover:bg-emerald-500 transition-colors"></div>
                                            </div>
                                            <p className="text-lg font-bold text-zinc-100 mb-1 group-hover:text-emerald-400 transition-colors">{item.name}</p>
                                            <p className="text-xs text-zinc-500 font-medium tracking-tight uppercase">{item.id}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <p className="text-zinc-600 font-medium italic">No assets detected in current inventory branch.</p>
                                </div>
                            )}
                        </section>
                        
                        {/* Shard Specs */}
                        <section className="grid sm:grid-cols-2 gap-8">
                             <div className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/50">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-4">Node Identity</p>
                                <p className="text-sm font-mono text-zinc-300 tracking-wider mb-1">{game.id}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Global Resource Identifier</p>
                             </div>
                             <div className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/50">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-4">Synchronization</p>
                                <p className="text-sm font-bold text-zinc-300 tracking-wider mb-1">{formatDate(game.created_at)}</p>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Initial Manifestation Date</p>
                             </div>
                        </section>
                    </div>

                    {/* Right Column: Competitive Matrix */}
                    <div className="space-y-12">
                        <section className="p-8 rounded-[3rem] bg-zinc-900/40 border border-zinc-800/50 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors -z-10">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                High Score Matrix
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            </h2>
                            
                            {leaderboard.length > 0 ? (
                                <div className="space-y-4">
                                    {leaderboard.map((entry) => (
                                        <div
                                            key={entry.player_id}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all group/item"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg ${
                                                    entry.rank === 1 ? 'bg-emerald-500 text-white' : 
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
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-600 text-sm italic font-medium">Competitive metrics pending shard resolution.</p>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PlayerGamePage;
