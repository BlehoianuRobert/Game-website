import { useState } from 'react'

interface VersionFormProps {
    initialVersion?: string;
    initialIsActive?: boolean;
    onSubmit: (version: string, isActive: boolean) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
    errors: string[];
    title: string;
    submitLabel: string;
}

const VersionForm = ({
    initialVersion = '',
    initialIsActive = false,
    onSubmit,
    onCancel,
    loading,
    errors,
    title,
    submitLabel
}: VersionFormProps) => {
    const [version, setVersion] = useState(initialVersion)
    const [isActive, setIsActive] = useState(initialIsActive)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(version, isActive)
    }

    return (
        <div className="p-10 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="h-px w-8 bg-emerald-500"></span>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500">
                        Release Management
                    </p>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter">{title}</h1>
            </header>

            <form onSubmit={handleSubmit} className="bg-zinc-900/40 backdrop-blur-xl rounded-[2.5rem] border border-zinc-800 p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent"></div>
                
                <div className="space-y-8">
                    <div className="group relative">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1 transition-colors group-focus-within:text-emerald-500">
                            Version Semantic
                        </label>
                        <input
                            type="text"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            placeholder="e.g., 2.4.0-stable"
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-700 focus:border-emerald-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-emerald-500/5"
                            required
                        />
                    </div>

                    <label className="flex items-center gap-4 cursor-pointer group py-2">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="h-6 w-6 rounded-lg border border-zinc-700 bg-zinc-800 transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-500"></div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-1 left-1 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">Set as Primary Node</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Active traffic will be routed to this branch</span>
                        </div>
                    </label>
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
                        Discard
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

export default VersionForm
