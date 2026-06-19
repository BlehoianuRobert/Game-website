import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createItem } from '../../services/items'
import { type ItemRarity } from '../../../models/item'
import ItemForm from './ItemForm'

const NewItem = () => {
    const { gameId } = useParams<{ gameId: string }>()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<string[]>([])

    const handleSubmit = async (name: string, description: string, rarity: ItemRarity) => {
        setLoading(true)
        setErrors([])

        try {
            await createItem({
                game_id: gameId!,
                name,
                description,
                rarity,
            })
            navigate(`/dashboard/games/${gameId}`)
        } catch (err: any) {
            setErrors(['Failed to create item. Please try again.'])
            setLoading(false)
        }
    }

    return (
        <section className="border border-slate-800 bg-slate-900 p-8 h-full">
            <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                        Item management
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">Add item</h1>
                    <p className="mt-3 max-w-2xl text-slate-400">
                        Create a new item for the current game.
                    </p>
                </div>
            </div>

            <ItemForm
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/dashboard/games/${gameId}`)}
                loading={loading}
                errors={errors}
                title="Add item"
                submitLabel="Add Item"
            />
        </section>
    )
}

export default NewItem
