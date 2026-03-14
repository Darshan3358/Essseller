'use client';

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import { Search, Package, CheckCircle2, Loader2, Tag, Gem, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';

export default function ProductsPage() {
    const { t } = useTranslate();
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEntries, setShowEntries] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const statsRes = await api.get('/sellers/stats');
            if (statsRes.success) setStats(statsRes.stats);

            // Fetch only this seller's added products
            const response = await api.get('/products/my-products?limit=10000');
            if (response.success) setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const filtered = products.filter(p => {
        const q = searchQuery.toLowerCase();
        return (
            (p.name || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filtered.length / showEntries);
    const paginated = filtered.slice((currentPage - 1) * showEntries, currentPage * showEntries);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

    if (authLoading || !user) return null;

    return (
        <Shell>
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="text-left">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">{t('Products')}</h2>
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mt-1">{t('Manage Your Store Products')}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Products Count */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Package size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm font-bold text-blue-100 uppercase tracking-widest mb-4">{t('Products')}</p>
                            <p className="text-6xl font-black mb-6 tracking-tighter">{products.length}</p>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-blue-200/80 uppercase tracking-wider">{t('Remaining Uploads')}</p>
                                <p className="text-3xl font-black text-blue-100">{stats?.remainingProducts ?? '—'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/storehouse')}
                            className="relative z-10 mt-10 w-full py-4 bg-white text-blue-700 text-sm font-black rounded-2xl transition-all hover:bg-blue-50 active:scale-[0.98] shadow-lg shadow-blue-900/20"
                        >
                            {t('Browse Storehouse')} →
                        </button>
                    </div>


                </div>

                {/* Table Section */}
                <div className="glass-card overflow-hidden !bg-white/60 dark:!bg-slate-900/60">
                    {/* Table Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-gray-100 dark:border-slate-800">
                        <h3 className="font-black text-gray-900 dark:text-slate-100 text-lg">{t('All Products')}</h3>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                                <span className="font-bold">{t('Show')}</span>
                                <select
                                    value={showEntries}
                                    onChange={e => { setShowEntries(Number(e.target.value)); setCurrentPage(1); }}
                                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-sm font-black text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                >
                                    {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                                <span className="font-bold">{t('entries')}</span>
                            </div>
                            <div className="relative flex items-center min-w-[240px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={t('Search...')}
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className={`w-full pl-11 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 dark:focus:border-blue-500 font-bold text-gray-900 dark:text-slate-100 transition-all ${searchQuery ? 'pr-20' : 'pr-4'}`}
                                />
                                {searchQuery && (
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                                        {filtered.length} {t('found')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400 dark:text-slate-500">
                            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                            <span className="font-black text-lg tracking-tight">{t('Loading products...')}</span>
                        </div>
                    ) : paginated.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-6 text-gray-400 dark:text-slate-500">
                            <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-full">
                                <Package className="w-16 h-16 text-gray-200 dark:text-slate-700" />
                            </div>
                            <div className="text-center">
                                <p className="font-black text-xl text-gray-900 dark:text-slate-100 mb-2">{t('No products found.')}</p>
                                <p className="text-sm font-medium">{t('Your store inventory is currently empty.')}</p>
                            </div>
                            <button
                                onClick={() => router.push('/storehouse')}
                                className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                            >
                                {t('Go to Storehouse to Add Products')}
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left table-fixed min-w-[1000px]">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest w-16">#</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest w-24">{t('Photo')}</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest w-[250px]">{t('Name')}</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest w-[150px]">{t('Category')}</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest w-[250px]">{t('Description')}</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest w-[120px] text-right">{t('Base Price')}</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest w-[120px] text-right">{t('Selling Price')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {paginated.map((product, idx) => {
                                        const imgSrc = product.image
                                            ? (product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`)
                                            : '';
                                        const rowNum = (currentPage - 1) * showEntries + idx + 1;

                                        return (
                                            <tr key={product._id || product.link_id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                                                <td className="px-6 py-6 text-xs font-black text-gray-400 dark:text-slate-500">{rowNum}</td>
                                                <td className="px-6 py-6">
                                                    <div className="w-14 h-14 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden flex items-center justify-center shadow-sm">
                                                        {imgSrc ? (
                                                            <img
                                                                src={imgSrc}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                                                            />
                                                        ) : (
                                                            <Tag className="w-6 h-6 text-gray-300 dark:text-slate-600" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-sm font-black text-gray-900 dark:text-slate-100 leading-tight truncate-2-lines" title={product.name}>{product.name}</p>
                                                    {product.brand && (
                                                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold mt-1.5 uppercase tracking-wider">{product.brand}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-6">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                                        {t(product.category || '—')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed" title={product.description || 'No description'}>
                                                        {product.description || t('No description')}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <p className="text-base font-black text-gray-900 dark:text-slate-100 tracking-tight">${(product.price || 0).toLocaleString()}</p>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="inline-flex flex-col items-end">
                                                        <p className="text-lg font-black text-blue-600 dark:text-blue-400 tracking-tighter">${(product.selling_price || 0).toLocaleString()}</p>
                                                        <p className="text-[8px] font-black text-success-500 uppercase tracking-tighter mt-0.5">Live on Store</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Table Footer */}
                    {!isLoading && filtered.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/10">
                            <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                {t('Showing')} <span className="text-gray-900 dark:text-slate-200">{Math.min((currentPage - 1) * showEntries + 1, filtered.length)}–{Math.min(currentPage * showEntries, filtered.length)}</span> {t('of')} <span className="text-gray-900 dark:text-slate-200">{filtered.length}</span> {t('products')}
                            </p>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-xs font-black border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-95"
                                    >
                                        Prev
                                    </button>
                                    <div className="flex items-center gap-1.5 mx-2">
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => currentPage <= 3 ? i + 1 : currentPage - 2 + i).filter(p => p >= 1 && p <= totalPages).map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(p)}
                                                className={`w-10 h-10 text-xs font-black rounded-xl transition-all ${p === currentPage ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 active:scale-95' : 'text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-xs font-black border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-95"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes float-premium {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-10px) rotate(2deg); }
                }
                .animate-float-premium {
                    animation: float-premium 5s ease-in-out infinite;
                }
                .glass-card {
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 32px;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.02), 0 4px 6px -4px rgb(0 0 0 / 0.02);
                }
                .dark .glass-card {
                    background: rgba(15, 23, 42, 0.6);
                    border-color: rgba(51, 65, 85, 0.3);
                }
                .truncate-2-lines {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </Shell>
    );
}
