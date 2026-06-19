import { useState } from 'react'
import { LoginUser } from '../../validation_schemas/player'
import { login } from '../../services/login'
import type { Player } from '../../../models'
import { useAuth } from '../../context/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'

const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [rememberMe, setRememberMe] = useState(false)

	const [errors, setErrors] = useState<String[]>([]);
	const {setPlayer} = useAuth();

	const validateForm = (email: string, password: string) => {
        const validate = LoginUser.safeParse({email, password });
        if (!validate.success) {
            setErrors(validate.error.issues.map(issue => issue.message));

            return false;
        } else {
            setErrors([]);
            return true;
        }
    }
	
	const navigate = useNavigate();

	const handleSubmit = async (event: React.SubmitEvent) => {
			event.preventDefault()
			if(validateForm(email, password)){
				const response = await login(email, password);
	
				if(!response){
					setErrors(["An error occurred during login. Please try again."]);
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
		<section className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
			<div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/30">
				<div className="mb-8">
					<p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
						Grid Force
					</p>
					<h1 className="mt-3 text-3xl font-semibold text-white">Sign in</h1>
					<p className="mt-3 text-sm leading-6 text-slate-400">
						Access the dashboard with your account to manage games, players, and content.
					</p>
				</div>

				<form className="space-y-5" onSubmit={handleSubmit}>
					<label className="block space-y-2">
						<span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
							Email
						</span>
						<input
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							placeholder="you@example.com"
							className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50"
						/>
					</label>

					<label className="block space-y-2">
						<span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
							Password
						</span>
						<input
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							placeholder="Enter your password"
							className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500/50"
						/>
					</label>

					<div className="flex items-center justify-between gap-4">
						<label className="flex items-center gap-3 text-sm text-slate-300">
							<input
								type="checkbox"
								checked={rememberMe}
								onChange={(event) => setRememberMe(event.target.checked)}
								className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 accent-cyan-500"
							/>
							Remember me
						</label>

						<button type="button" className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200">
							Forgot password?
						</button>
					</div>

					{errors.length > 0 && (
                        <div className="mt-4 p-4 text-sm text-red-700">
                            <ul>
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                            </ul>
                        </div>
                    )}

					<button
						type="submit"
						className="inline-flex w-full items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
					>
						Sign in
					</button>
				</form>

				<div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4 text-sm text-slate-400">
					Use your dashboard credentials to continue.
				</div>
			</div>
		</section>
	)
}

export default Login