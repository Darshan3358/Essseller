'use client';

import { useState, useEffect, Suspense } from 'react';
import Shell from '@/components/layout/Shell';
import {
    Warehouse, Package, Search, Filter, CheckCircle2, PlusCircle, Tag, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';

function StorehousePageInner() {
    const { t } = useTranslate();
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<any[]>([]);
    const [addedProductIds, setAddedProductIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch all products from the global storehouse
            const storeRes = await api.get('/products?limit=1000');
            if (storeRes.success) {
                setProducts(storeRes.data || []);
            }
            // Fetch the products the seller has already added
            const myRes = await api.get('/products/my-products?limit=10000');
            if (myRes.success) {
                const ids = new Set<string>((myRes.data || []).map((p: any) => String(p._id || p.id)));
                setAddedProductIds(ids);
            }
        } catch (error) {
            console.error('Failed to fetch storehouse data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleAddToStore = async (product: any) => {
        setAddingId(product._id);
        try {
            const res = await api.post('/products/add-to-store', { product_id: product._id });
            if (res.success) {
                setAddedProductIds(prev => new Set([...prev, String(product._id)]));
            } else {
                alert(res.message || t('Failed to add product'));
            }
        } catch (err: any) {
            alert(err.message || t('Error adding product'));
        } finally {
            setAddingId(null);
        }
    };

    // Derive categories
    const categoryMap = products.reduce((acc: Record<string, number>, p: any) => {
        const cat = p.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});
    const allCategories = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));

    const filteredProducts = products
        .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
        .filter(p => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
        });

    if (authLoading || !user) return null;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

    return (
        <Shell>
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="text-left">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                            <Warehouse className="w-6 h-6 text-primary-500" />
                            {t('Storehouse')}
                        </h2>
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mt-1">
                            {t('Browse & Add Products to Your Store')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6 sticky top-24">
                        <div className="lg:hidden glass-card p-6 !bg-white/60 dark:!bg-slate-900/60 text-left">
                            <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-primary-500" />
                                {t('Categories')}
                            </h3>
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl text-sm font-black appearance-none border-2 border-primary-500 dark:border-primary-600 bg-primary-500 dark:bg-primary-600 text-white focus:outline-none focus:ring-4 focus:ring-primary-400/20 transition-all shadow-lg shadow-primary-500/10"
                                >
                                    <option value="All">{t('All Products')}</option>
                                    {allCategories.map(cat => (
                                        <option key={cat.name} value={cat.name}>
                                            {t(cat.name).replace(/_/g, ' ')} ({cat.count})
                                        </option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">
                                    ▾
                                </span>
                            </div>
                        </div>

                        {/* Desktop: Category Button List */}
                        <div className="hidden lg:block glass-card p-6 !bg-white/60 dark:!bg-slate-900/60 text-left">
                            <h3 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-primary-500" />
                                {t('Categories')}
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-black transition-all ${selectedCategory === 'All' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 active:scale-[0.98]' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                >
                                    <span>{t('All Products')}</span>
                                </button>
                                {allCategories.map(cat => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-black transition-all ${selectedCategory === cat.name ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 active:scale-[0.98]' : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                    >
                                        <span className="truncate mr-2 capitalize">{t(cat.name as any)}</span>
                                        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${selectedCategory === cat.name ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}>
                                            {cat.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={t('Search products...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-bold text-gray-900 dark:text-slate-100 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        {isLoading ? (
                            <div className="glass-card p-24 text-center text-gray-400 dark:text-slate-500 flex flex-col items-center gap-4 !bg-white/60 dark:!bg-slate-900/60">
                                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-3xl">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                                </div>
                                <p className="font-black text-lg tracking-tight">{t('Loading storehouse products...')}</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="glass-card p-24 text-center flex flex-col items-center gap-6 !bg-white/60 dark:!bg-slate-900/60">
                                <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-full">
                                    <Package className="w-20 h-20 text-gray-200 dark:text-slate-700" />
                                </div>
                                <div>
                                    <p className="font-black text-2xl text-gray-900 dark:text-slate-100 mb-2">{t('No products found.')}</p>
                                    <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('Try adjusting your search or filters.')}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredProducts.map(product => {
                                    const isAdded = addedProductIds.has(String(product._id));
                                    const isAdding = addingId === product._id;
                                    const imgSrc = product.image
                                        ? (product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`)
                                        : '';

                                    return (
                                        <div
                                            key={product._id}
                                            className={`glass-card overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl text-left !bg-white/60 dark:!bg-slate-900/60 ${isAdded ? 'ring-4 ring-primary-500/20 dark:ring-primary-500/10 border-primary-500/40' : ''}`}
                                        >
                                            {/* Product Image */}
                                            <div className="h-56 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden relative group/img">
                                                {imgSrc ? (
                                                    <img src={imgSrc} alt={product.name} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <Tag className="w-12 h-12 text-gray-200 dark:text-slate-700" />
                                                )}
                                                {isAdded && (
                                                    <div className="absolute top-4 right-4 bg-primary-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg animate-in fade-in zoom-in duration-300">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('Added')}
                                                    </div>
                                                )}
                                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-white/10">
                                                    {t(product.category || 'Uncategorized')}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-6 flex flex-col flex-1">
                                                <h4 className="text-base font-black text-gray-900 dark:text-slate-100 leading-tight mb-1 line-clamp-3 min-h-[3.75rem]">{product.name}</h4>
                                                {product.brand && (
                                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mb-4">{product.brand}</p>
                                                )}

                                                <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-100 dark:border-slate-800">
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">{t('Cost')}</p>
                                                        <p className="text-lg font-black text-gray-900 dark:text-slate-100 tracking-tight">${(product.price || 0).toLocaleString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-primary-500 dark:text-primary-400 font-black uppercase tracking-widest mb-1">{t('Selling')}</p>
                                                        <p className="text-lg font-black text-primary-600 dark:text-primary-400 tracking-tight">${(product.selling_price || 0).toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => !isAdded && handleAddToStore(product)}
                                                    disabled={isAdded || isAdding}
                                                    className={`mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-black transition-all duration-300
                                                        ${isAdded
                                                            ? 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 border border-gray-100 dark:border-slate-700 cursor-default'
                                                            : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white shadow-lg shadow-primary-600/20 active:scale-[0.98]'
                                                        }`}
                                                >
                                                    {isAdding ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : isAdded ? (
                                                        <><CheckCircle2 className="w-5 h-5" /> {t('Already Added')}</>
                                                    ) : (
                                                        <><PlusCircle className="w-5 h-5" /> {t('Add to My Store')}</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx global>{`
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
            `}</style>
        </Shell>
    );
}

export default function StorehousePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950"><div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-primary-500/20" /></div>}>
            <StorehousePageInner />
        </Suspense>
    );
}
