import { useParams } from 'react-router-dom';

export interface DashboardCategory {
    name: string;
    path: string;
    component?: React.JSX.Element;
}

interface DashboardProps {
    categories: DashboardCategory[];
}

const Dashboard = ({ categories }: DashboardProps) => {
    const { categoryPath } = useParams<{ categoryPath?: string }>();
    const selectedCategory = categories.find((category) => category.path === categoryPath) ?? categories[0];

    return (
        <div className="p-10 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="h-px w-8 bg-emerald-500"></span>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500">
                        Active Workspace
                    </p>
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                    {selectedCategory.name}
                </h1>
                <p className="max-w-2xl text-lg text-zinc-400 leading-relaxed font-light">
                    Managing data and configurations for <span className="font-semibold text-emerald-400/90 border-b border-emerald-500/20">{selectedCategory.path}</span>. 
                    Real-time updates are synchronized across all connected services.
                </p>
            </header>

            <section className="relative">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 h-64 w-64 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
                
                {selectedCategory.component ? (
                    <div className="grid gap-8">
                        {selectedCategory.component}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-10 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30">
                        <div className="h-16 w-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 text-zinc-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <p className="text-zinc-500 font-medium">No content available for this category.</p>
                        <p className="text-zinc-600 text-sm mt-1">Please select another workspace from the navigation.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;