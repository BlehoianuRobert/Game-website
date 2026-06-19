import { Link } from 'react-router-dom'
import type { Player } from '../../../models'
import { useEffect, useState } from 'react'
import { getPlayers } from '../../services/players'


const statusStyles: Record<string, string> = {
    active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    suspended: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
})

const formatDate = (value?: string) => value ? dateFormatter.format(new Date(value)) : 'N/A'

const Players = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayersData = async () => {
            setLoading(true);
            try {
                const response = await getPlayers();
                setPlayers(response.data || []);
            } catch (error) {
                console.error("Error fetching players:", error);
                setPlayers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayersData();
    }, []);

    if (loading) {
        return (
            <div className="p-10 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                    <div className="h-12 w-12 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin"></div>
                    <p className="font-medium tracking-tight">Accessing Player Directory...</p>
                </div>
            </div>
        );
    }

    if (players.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-10 rounded-[2.5rem] border border-dashed border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
                <div className="h-20 w-20 rounded-[2rem] bg-zinc-800/50 flex items-center justify-center mb-8 text-zinc-600 ring-1 ring-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No players registered</h3>
                <p className="text-zinc-500 text-center max-w-sm mb-8 leading-relaxed">Your community hasn't started yet. Players will appear here once they join your platform.</p>
            </div>
        )
    }

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 flex items-center justify-between">
                <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-widest ring-1 ring-white/5">
                    {players.length} Total Users
                </div>
            </div>

            <div className="grid gap-6">
                {players.map((player) => (
                    <Link
                        to={`/dashboard/players/${player.id}`}
                        key={player.id}
                        className="group block relative rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-1 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5"
                    >
                        <div className="rounded-[1.75rem] bg-zinc-900/60 p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center gap-8">
                            <div className="flex items-center gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                                    {player.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                            {player.username}
                                        </h2>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${player.status ? statusStyles[player.status] : 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20'}`}>
                                            {player.status || 'unknown'}
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 text-sm font-medium">{player.email}</p>
                                </div>
                            </div>

                            <div className="lg:ml-auto grid grid-cols-2 lg:flex gap-8 lg:gap-12">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Created At</span>
                                    <span className="text-sm text-zinc-400 font-semibold">{formatDate(player.created_at)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Unique Identifier</span>
                                    <span className="text-sm text-zinc-500 font-mono tracking-tight">{player.id}</span>
                                </div>
                            </div>

                            <div className="hidden lg:flex h-12 w-12 rounded-full border border-zinc-800 items-center justify-center text-zinc-600 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

export default Players