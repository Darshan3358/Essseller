'use client';

import { useState, useEffect } from 'react';
import { 
    Layout, Settings, Save, Search, Package, CheckCircle2, Circle, AlertCircle, Loader2,
    Monitor, Smartphone, Tablet, Filter
} from 'lucide-react';
import { api } from '@/lib/api';

export default function CarouselManagement() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [settings, setSettings] = useState({ slidesPerView: 4 });
    const [saveLoading, setSaveLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, settRes] = await Promise.all([
                api.get('/admin/products?limit=1000'),
                api.get('/settings/carousel')
            ]);

            if (prodRes.success) setProducts(prodRes.products || []);
            if (settRes.success) {
                setSettings({
                    slidesPerView: settRes.carousel?.slidesPerView || 4
                });
            }
        } catch (error) {
            console.error('Failed to fetch carousel data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleCarouselStatus = async (product: any) => {
        setActionLoading(product._id);
        try {
            const res = await api.put(`/admin/products/${product._id}`, {
                inStorehouseCarousel: !product.inStorehouseCarousel
            });
            if (res.success) {
                setProducts(products.map(p => 
                    p._id === product._id ? { ...p, inStorehouseCarousel: !p.inStorehouseCarousel } : p
                ));
            }
        } catch (error) {
            console.error('Toggle error:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSaveSettings = async () => {
        setSaveLoading(true);
        try {
            await api.put('/settings/carousel', settings);
            alert('Carousel settings updated successfully');
        } catch (err) {
            alert('Failed to update settings');
        } finally {
            setSaveLoading(false);
        }
    };

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))].filter(Boolean);

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const carouselProducts = products.filter(p => p.inStorehouseCarousel);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="space-y-8 p-4 md:p-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-left">
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                        <Layout className="w-8 h-8 text-indigo-500" />
                        Carousel Management
                    </h1>
                    <p className="text-slate-400 font-medium mt-1">Control products featured in the user dashboard discovery carousel.</p>
                </div>
            </div>

            {/* Settings Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 sticky top-24">
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-indigo-400" />
                            Display Settings
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                                    Products Per View (Desktop)
                                </label>
                                <div className="relative">
                                    <input 
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={settings.slidesPerView || ''}
                                        onChange={(e) => setSettings({ ...settings, slidesPerView: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
                                    />
                                    <Monitor className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 font-medium">Recommended: 4 for optimal balance.</p>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold text-slate-300">Total in Carousel</span>
                                    <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-black">
                                        {carouselProducts.length} Products
                                    </span>
                                </div>
                                {carouselProducts.length < 4 && (
                                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-left">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                        <p className="text-xs text-amber-200/80 font-medium leading-relaxed">
                                            Add at least 4 products to ensure the carousel looks full on desktop.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleSaveSettings}
                                disabled={saveLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Config
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Selection List */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden">
                        <div className="p-8 border-b border-white/5">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative group flex-1">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                    <input 
                                        type="text"
                                        placeholder="Search Storehouse Products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                                <div className="relative min-w-[180px]">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-12"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                                        ))}
                                    </select>
                                    <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Product</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Category</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center font-mono">Carousel</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-slate-300">
                                    {filteredProducts.map(p => (
                                        <tr key={p._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-800 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
                                                        {p.image ? (
                                                            <img src={p.image.startsWith('http') ? p.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${p.image}`} className="w-full h-full object-cover" />
                                                        ) : <Package className="w-6 h-6 text-slate-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm line-clamp-1">{p.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">${(p.selling_price || 0).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-black uppercase tracking-wider bg-slate-800 px-3 py-1 rounded-lg">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button 
                                                    onClick={() => toggleCarouselStatus(p)}
                                                    disabled={actionLoading === p._id}
                                                    className={`p-3 rounded-2xl transition-all active:scale-95 ${p.inStorehouseCarousel ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10' : 'bg-slate-800 text-slate-600 border border-white/5 hover:border-slate-500'}`}
                                                >
                                                    {actionLoading === p._id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : p.inStorehouseCarousel ? (
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    ) : (
                                                        <Circle className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredProducts.length === 0 && (
                                <div className="p-20 text-center">
                                    <Package className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold">No products found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.3); }
            `}</style>
        </div>
    );
}

