import { useState } from 'react'
import { type ItemRarity } from '../../../models/item'

interface ItemFormProps {
    initialName?: string;
    initialDescription?: string;
    initialRarity?: ItemRarity;
    onSubmit: (name: string, description: string, rarity: ItemRarity) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
    errors: string[];
    title: string;
    submitLabel: string;
}

const ItemForm = ({
    initialName = '',
    initialDescription = '',
    initialRarity = 'common',
    onSubmit,
    onCancel,
    loading,
    errors,
    title,
    submitLabel
}: ItemFormProps) => {
    const [name, setName] = useState(initialName)
    const [description, setDescription] = useState(initialDescription)
    const [rarity, setRarity] = useState<ItemRarity>(initialRarity)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(name, description, rarity)
    }

    return (
        <div className="p-10 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="h-px w-8 bg-emerald-500"></span>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500">
                        Registry Interface
                    </p>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter">{title}</h1>
            </header>

            <form onSubmit={handleSubmit} className="bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-zinc-800 p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent"></div>
                
                <div className="space-y-8">
                    <div className="group relative">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1 transition-colors group-focus-within:text-emerald-500">
                            Object Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Chronos Shard"
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-700 focus:border-emerald-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-emerald-500/5"
                            required
                        />
                    </div>

                    <div className="group relative">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1 transition-colors group-focus-within:text-emerald-500">
                            Manifestation Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Define the object properties..."
                            rows={4}
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-700 focus:border-emerald-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-emerald-500/5 resize-none"
                        />
                    </div>

                    <div className="group relative">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1 transition-colors group-focus-within:text-emerald-500">
                            Rarity Grade
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(['common', 'rare', 'epic', 'legendary'] as ItemRarity[]).map((grade) => (
                                <button
                                    key={grade}
                                    type="button"
                                    onClick={() => setRarity(grade)}
                                    className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                        rarity === grade 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                                            : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                                    }`}
                                >
                                    {grade}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {errors.length > 0 && (
                    <div className="mt-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                        {errors.map((error, index) => <p key={index} className="flex items-center gap-2"><span className="h-1 w-1 rounded-full bg-rose-500"></span>{error}</p>)}
                    </div>
                )}

                <div className="mt-12 flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:text-zinc-200 transition-all"
                    >
                        Abort
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative px-8 py-3 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <div className="h-4 w-4 rounded-full border-2 border-zinc-300 border-t-zinc-950 animate-spin"></div>}
                        {submitLabel}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ItemForm
