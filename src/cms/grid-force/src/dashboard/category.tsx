import { useParams } from 'react-router-dom';
import type { DashboardCategory } from './dashboard';

interface CategoryViewProps {
  categories: DashboardCategory[];
  defaultCategoryPath?: string;
}

const CategoryView = ({ categories }: CategoryViewProps) => {
  const { categoryPath } = useParams<{ categoryPath: string }>();
  const selectedCategory = categories.find((category) => category.path === (categoryPath ?? undefined))
    ?? categories.find((category) => category.path === undefined)
    ?? categories.find((category) => category.path === categories[0]?.path);

  const activeCategoryPath = categoryPath ?? categories[0]?.path;

  if (!selectedCategory) {
    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-slate-300">
        <h1 className="text-2xl font-semibold text-white">Category not found</h1>
        <p className="mt-3 text-slate-400">Choose a category from the sidebar.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
        Active category
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-white">{selectedCategory.name}</h1>
      <p className="mt-4 max-w-2xl text-slate-300">
        This is the routed content area for <span className="font-medium text-cyan-200">{activeCategoryPath}</span>.
        The dashboard remains a SPA while the URL updates to match the selected category.
      </p>
    </section>
  );
};

export default CategoryView;