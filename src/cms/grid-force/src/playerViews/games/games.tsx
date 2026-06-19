import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Game } from '../../../models';
import { getAllGames } from '../../services/games';

const PlayerGames = () => {
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        const fetchGames = async () => {
            const fetchedGames = await getAllGames();
            setGames(fetchedGames);
        };

        fetchGames();
    }, []);

    return (
        <section className="min-h-screen bg-zinc-950 text-zinc-200 font-sans p-10 lg:p-20 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto animate-in fade-in duration-1000">
                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] animate-pulse"></span>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Live Experiences</p>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter mb-4">Player Portal</h1>
                    <p className="text-xl text-zinc-500 font-light max-w-2xl leading-relaxed">
                        Access high-performance interactive shards synchronized across the global Grid Forge network.
                    </p>
                </header>

                {games.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center rounded-[3rem] bg-zinc-900/20 border border-dashed border-zinc-800 backdrop-blur-sm">
                         <p className="text-zinc-600 font-medium tracking-tight">No active game shards found in this sector.</p>
                    </div>
                ) : (
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                        {games.map((game) => (
                            <div key={game.id} className="group relative rounded-[2.5rem] bg-zinc-900/40 border border-zinc-800/50 p-1 transition-all duration-500 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5">
                                <div className="h-full rounded-[2.25rem] bg-zinc-900/60 p-8 flex flex-col">
                                    <div className="mb-8">
                                        <div className="h-12 w-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:border-emerald-500/20 group-hover:text-emerald-500 transition-all mb-6">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/></svg>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight mb-3">{game.name}</h2>
                                        <p className="text-zinc-500 font-light leading-relaxed line-clamp-3">
                                            {game.description ?? 'A unique interactive journey through the digital expanse of the Grid Forge.'}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-auto pt-8 border-t border-zinc-800/50 flex items-center justify-between">
                                        <Link
                                            to={`/games/${game.id}`}
                                            className="px-8 py-3 bg-zinc-100 text-zinc-950 font-black rounded-xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg"
                                        >
                                            Enter Shard
                                        </Link>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 group-hover:text-emerald-500/50 transition-colors">
                                             SEC-ALPHA
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PlayerGames;
