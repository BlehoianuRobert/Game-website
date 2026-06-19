import { Link } from 'react-router-dom'
import type { Game } from '../../../models'
import { getAllGames } from '../../services/games';
import { useEffect, useState } from 'react';
import GameCard from './GameCard';


const Games = () => {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        const fetchGames = async () => {
            const fetchedGames = await getAllGames();
            setGames(fetchedGames);
        };

        fetchGames();
    }, []);

    if (games.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-10 rounded-[2.5rem] border border-dashed border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
                <div className="h-20 w-20 rounded-[2rem] bg-zinc-800/50 flex items-center justify-center mb-8 text-zinc-600 ring-1 ring-zinc-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="M15 19l2 2 4-4"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Initialize your library</h3>
                <p className="text-zinc-500 text-center max-w-sm mb-8 leading-relaxed">You haven't added any games to your forge yet. Start by creating your first interactive experience.</p>
                <Link
                    to="/dashboard/games/new"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/40 transition-all duration-300 active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Create First Game
                </Link>
            </div>
        )
    }

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-widest ring-1 ring-white/5">
                        {games.length} Entries Found
                    </div>
                </div>

                <Link
                    to="/dashboard/games/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-white hover:shadow-xl hover:shadow-white/5 transition-all duration-300 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    New Experience
                </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 2xl:grid-cols-3">
                {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                ))}
            </div>
        </section>
    )
}

export default Games
