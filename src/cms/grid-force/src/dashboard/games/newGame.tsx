import { useState } from 'react'
import { NewGame as NewGameValidation } from '../../validation_schemas/games'
import { createGame } from '../../services/games'
import type { Game } from '../../../models'
import { useNavigate } from 'react-router-dom'

const NewGame = () => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const [errors, setErrors] = useState<String[]>([]);

    const generatedId = 'GAME-NODE-' + Math.random().toString(36).substring(2, 7).toUpperCase()
    const generatedCreatedAt = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date())

    const validateForm = (name: string) => {
        const validate = NewGameValidation.safeParse({ name, description });

        if (!validate.success) {
            setErrors(validate.error.issues.map(issue => issue.message));

            return false;
        } else {
            setErrors([]);
            return true;
        }
    }

    const navigate = useNavigate();

    const handleAddGame = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        if(!validateForm(name)){
            setLoading(false);
            setErrors(["An error occurred while creating the game. Please try again."]);
            return;
        }

        const gameData: Game = {
            name,
            description: description || null,
            created_at: generatedCreatedAt
        };

        const response = await createGame(gameData);

        if(!response){
            setErrors(["An error occurred while creating the game. Please try again."]);
        }

        setLoading(false);
        navigate(`/dashboard/games/${response.data.id}`);
    }

    return (
        <div className="p-10 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">New Deployment</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Initialize Game Node</h1>
                <p className="text-zinc-500 text-lg font-light max-w-xl mx-auto">
                    Define the core parameters for your next interactive manifestation.
                </p>
            </header>

            <form onSubmit={handleAddGame} className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] border border-zinc-800 p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="p-6 rounded-2xl bg-zinc-950/50 border border-zinc-800 shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-2">Protocol Identifier</p>
                        <p className="text-sm font-mono text-zinc-300 tracking-wider">{generatedId}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-zinc-950/50 border border-zinc-800 shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-2">System Timestamp</p>
                        <p className="text-sm font-mono text-zinc-300 tracking-wider">{generatedCreatedAt}</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="group relative">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1 transition-colors group-focus-within:text-emerald-500">
                            Game Designation
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g., Aether Drift"
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-700 focus:border-emerald-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-emerald-500/5"
                            required
                        />
                    </div>

                    <div className="group relative">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1 transition-colors group-focus-within:text-emerald-500">
                            Operational Objectives
                        </label>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Describe the scope of this experience..."
                            rows={4}
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-700 focus:border-emerald-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-emerald-500/5 resize-none"
                        />
                    </div>
                </div>

                {errors.length > 0 && (
                    <div className="mt-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((error, index) => <li key={index}>{error}</li>)}
                        </ul>
                    </div>
                )}

                <div className="mt-12 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/games')}
                        className="text-sm font-bold text-zinc-500 hover:text-zinc-200 transition-all"
                    >
                        Abort Mission
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative px-10 py-4 bg-zinc-100 text-zinc-950 font-black rounded-[1.25rem] hover:bg-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 overflow-hidden"
                    >
                        {loading ? (
                            <div className="h-5 w-5 rounded-full border-2 border-zinc-300 border-t-zinc-950 animate-spin"></div>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        )}
                        Authorize Deployment
                    </button>
                </div>
            </form>
        </div>
    )
}

export default NewGame
