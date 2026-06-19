import { useState } from 'react'
import User from '../../validation_schemas/player'
import { signup } from '../../services/login'
import type { Player } from '../../../models/player'
import { useAuth } from '../../context/AuthContext'
import { Link, Navigate, Router, useNavigate } from 'react-router-dom'

const SignUp = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isDev, setIsDev] = useState(false)

    const [errors, setErrors] = useState<String[]>([]);

    const {setPlayer} = useAuth();

    const validateForm = (email: string, password: string, confirmPassword: string) => {
        const validate = User.safeParse({ name, email, password });
        if (!validate.success) {
            setErrors(validate.error.issues.map(issue => issue.message));
            if (password !== confirmPassword) {
                setErrors(prevErrors => [...prevErrors, "Passwords do not match"]);
            }
            return false;
        } else {
            setErrors([]);
            return true;
        }
    }

    const navigate = useNavigate();

    const handleSubmit = async (event: React.SubmitEvent) => {
        event.preventDefault()
        if(validateForm(email, password, confirmPassword)){
            const response = await signup(name, email, password, isDev ? 'dev' : 'player');

            if(!response){
                setErrors(["An error occurred during signup. Please try again."]);
            }


            const player: Player = {
                id: response.data.player.id,
                username: response.data.player.username,
                email: response.data.player.email,
                role: response.data.player.role,
            };

            setPlayer(player);

            navigate('/dashboard');
        }
    };

    return (
        <section className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12 font-sans overflow-hidden relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-xl animate-in fade-in zoom-in duration-700">
                <div className="bg-zinc-900/40 backdrop-blur-2xl rounded-[3rem] border border-zinc-800/50 p-12 shadow-2xl shadow-black/50 relative overflow-hidden">
                    {/* Interior glow */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>
                    
                    <div className="mb-12 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
                            <div className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">Identity Creation</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Join the Forge</h1>
                        <p className="text-zinc-500 text-lg font-light leading-relaxed">
                            Initialize your operative credentials to access the platform.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid gap-6">
                            <div className="group relative">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1 transition-colors group-focus-within:text-violet-400">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-700 focus:border-violet-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-violet-500/5"
                                />
                            </div>

                            <div className="group relative">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1 transition-colors group-focus-within:text-violet-400">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-700 focus:border-violet-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-violet-500/5"
                                />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="group relative">
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1 transition-colors group-focus-within:text-violet-400">
                                        Access Key
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-700 focus:border-violet-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-violet-500/5"
                                    />
                                </div>
                                <div className="group relative">
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2 ml-1 transition-colors group-focus-within:text-violet-400">
                                        Confirm Key
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        placeholder="••••••••"
                                        className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-6 py-4 text-zinc-200 outline-none transition-all placeholder:text-zinc-700 focus:border-violet-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-violet-500/5"
                                    />
                                </div>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer group py-2">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isDev}
                                    onChange={(event) => setIsDev(event.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="h-5 w-5 rounded-md border border-zinc-700 bg-zinc-800 transition-all peer-checked:bg-emerald-500 peer-checked:border-emerald-500"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0.5 left-0.5 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Sign up as Developer</span>
                        </label>

                        {errors.length > 0 && (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-in shake duration-500">
                                <ul className="list-disc list-inside">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="group relative w-full overflow-hidden rounded-[1.25rem] bg-zinc-100 px-8 py-5 text-lg font-bold text-zinc-950 transition-all hover:bg-white hover:shadow-2xl hover:shadow-white/10 active:scale-[0.98]"
                        >
                            Initialize Account
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-zinc-500 text-sm">
                            Already have credentials? <Link to="/login" className="text-violet-400 font-bold hover:text-violet-300 transition-colors">Sign in here</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-6 text-zinc-600 text-sm font-medium">
                    <p>Internal system v4.3.1</p>
                    <div className="h-1 w-1 rounded-full bg-zinc-800"></div>
                    <p>© 2026 Grid Forge</p>
                </div>
            </div>
        </section>
    )
}

export default SignUp