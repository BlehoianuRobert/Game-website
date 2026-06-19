import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchData } from '../../services/endpoints'
import VersionForm from './VersionForm'
import { addGameVersion } from '../../services/games'
import type { GameVersion } from '../../../models'

const NewVersion = () => {
    const { gameId } = useParams<{ gameId: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<string[]>([])

    const handleSubmit = async (version: string, isActive: boolean) => {
        setLoading(true)
        setErrors([])

        try {
            const versionData: GameVersion = {
                game_id: gameId!,
                version,
                is_active: isActive,
                released_at: new Date().toISOString(),
            }
            await addGameVersion(versionData)
            navigate(`/dashboard/games/${gameId}`)
        } catch (err: any) {
            setErrors(['Failed to create version. Please try again.'])
            setLoading(false)
        }
    }

    return (
        <section className="border border-slate-800 bg-slate-900 p-8 h-full">
            <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                        Game management
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">Add version</h1>
                    <p className="mt-3 max-w-2xl text-slate-400">
                        Add a new version string to the current game.
                    </p>
                </div>
            </div>

            <VersionForm
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/dashboard/games/${gameId}`)}
                loading={loading}
                errors={errors}
                title="Add version"
                submitLabel="Add Version"
            />
        </section>
    )
}

export default NewVersion
