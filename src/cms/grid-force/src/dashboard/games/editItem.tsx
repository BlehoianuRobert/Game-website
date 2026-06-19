import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getItem, updateItem } from '../../services/items'
import { type ItemRarity } from '../../../models/item'
import ItemForm from './ItemForm'
import { type Item } from '../../../models'

const EditItem = () => {
    const { gameId, itemId } = useParams<{ gameId: string, itemId: string }>()
    const navigate = useNavigate()
    const [item, setItem] = useState<Item | null>(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<string[]>([])

    useEffect(() => {
        if (itemId) {
            getItem(itemId).then(setItem).catch(() => setErrors(['Failed to load item.']))
        }
    }, [itemId])

    const handleSubmit = async (name: string, description: string, rarity: ItemRarity) => {
        if (!itemId) return
        setLoading(true)
        setErrors([])

        try {
            await updateItem(itemId, {
                name,
                description,
                rarity,
            })
            navigate(`/dashboard/games/${gameId}`)
        } catch (err: any) {
            setErrors(['Failed to update item. Please try again.'])
            setLoading(false)
        }
    }

    if (!item) {
        return <section className="p-8 text-white">Loading...</section>
    }

    return (
        <section className="border border-slate-800 bg-slate-900 p-8 h-full">
            <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                        Item management
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold text-white">Edit item</h1>
                    <p className="mt-3 max-w-2xl text-slate-400">
                        Update the details of the item.
                    </p>
                </div>
            </div>

            <ItemForm
                initialName={item.name}
                initialDescription={item.description || ''}
                initialRarity={item.rarity}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/dashboard/games/${gameId}`)}
                loading={loading}
                errors={errors}
                title="Edit item"
                submitLabel="Save Changes"
            />
        </section>
    )
}

export default EditItem
