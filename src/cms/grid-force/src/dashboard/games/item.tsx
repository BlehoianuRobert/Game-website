import { Link } from 'react-router-dom'
import type { Item } from '../../../models'

interface GameItemProps {
    item: Item
}

const GameItem = ({ item }: GameItemProps) => {
    return (
        <div className="group relative rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900/50 hover:border-zinc-700">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 shadow-inner group-hover:border-emerald-500/20 group-hover:text-emerald-500 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{item.name}</h3>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${
                                item.rarity === 'legendary' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' :
                                item.rarity === 'epic' ? 'border-violet-500/30 bg-violet-500/10 text-violet-500' :
                                'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                            }`}>
                                {item.rarity}
                            </span>
                        </div>
                        <p className="text-xs font-mono text-zinc-600 tracking-tight">{item.id}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                        to={`/dashboard/games/${item.game_id}/items/${item.id}/edit`}
                        className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                        title="Edit Item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </Link>
                    <button
                        type="button"
                        className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                        title="Delete Item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800/50">
                <p className="text-sm text-zinc-400 leading-relaxed font-light">
                    {item.description ?? 'System catalog entry for designated game shard objects.'}
                </p>
                <div className="mt-4 flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-1">Game Context</span>
                        <span className="text-xs text-zinc-500 font-mono tracking-tighter">{item.game_id}</span>
                     </div>
                </div>
            </div>
        </div>
    )
}

export default GameItem