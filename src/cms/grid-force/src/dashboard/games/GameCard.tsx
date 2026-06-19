import { Link } from 'react-router-dom'
import type { Game } from '../../../models'

interface GameCardProps {
    game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
    return (
        <Link
            to={`/dashboard/games/${game.id}`}
            className="group relative rounded-[2rem] border border-zinc-800 bg-zinc-900/40 p-8 transition-all duration-300 hover:border-emerald-500/30 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden"
        >
            {/* Hover decorative gradient */}
            <div className="absolute -top-10 -right-10 h-32 w-32 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                {game.id}
                             </p>
                        </div>
                        <h2 className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {game.name}
                        </h2>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:border-emerald-500/20 group-hover:text-emerald-400 transition-all">
                        Active
                    </div>
                </div>

                <p className="text-zinc-400 leading-relaxed font-light line-clamp-2 min-h-[3rem]">
                    {game.description ?? 'A high-performance interactive experience powered by Grid Forge.'}
                </p>

                <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Created</span>
                        <span className="text-xs text-zinc-400 font-medium">
                            {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(game.created_at))}
                        </span>
                    </div>
                    
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default GameCard
