'use client';

import { useEffect, useRef, useState } from 'react';
import { Package, PlusCircle, CheckCircle2, Loader2, Sparkles, TrendingUp, Tag } from 'lucide-react';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { api } from '@/lib/api';

interface StorehouseCarouselProps {
    onProductAdded?: () => void;
}

export default function StorehouseCarousel({ onProductAdded }: StorehouseCarouselProps) {
    const swiperRef = useRef<Swiper | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [carouselConfig, setCarouselConfig] = useState({ slidesPerView: 4 });

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

    const fetchData = async () => {
        try {
            // Get curated products and settings
            const [res, myRes, settRes] = await Promise.all([
                api.get('/products?limit=50&inStorehouseCarousel=true&sort=-createdAt'),
                api.get('/products/my-products?limit=1000'),
                api.get('/settings/carousel')
            ]);

            if (res.success) {
                setProducts(res.data || []);
            }
            if (myRes.success) {
                const ids = new Set<string>((myRes.data || []).map((p: any) => String(p._id)));
                setAddedIds(ids);
            }
            if (settRes.success) {
                setCarouselConfig(settRes.carousel || { slidesPerView: 4 });
            }
        } catch (err) {
            console.error('Carousel fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (containerRef.current && !swiperRef.current && products.length > 0) {
            swiperRef.current = new Swiper(containerRef.current, {
                modules: [Navigation, Pagination, Autoplay],
                slidesPerView: 1,
                spaceBetween: 20,
                loop: products.length > 2,
                autoplay: {
                    delay: 2000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                },
                speed: 600,
                pagination: {
                    el: '.swiper-pagination-store',
                    clickable: true,
                    dynamicBullets: false, // Ensure all dots show or are better managed
                },
                breakpoints: {
                    640: { slidesPerView: 2, spaceBetween: 20 },
                    768: { slidesPerView: Math.min(3, carouselConfig.slidesPerView), spaceBetween: 24 },
                    1024: { slidesPerView: carouselConfig.slidesPerView, spaceBetween: 24 },
                },
            });
        }
    }, [products, carouselConfig]);

    const handleAdd = async (id: string) => {
        setAddingId(id);
        try {
            const res = await api.post('/products/add-to-store', { product_id: id });
            if (res.success) {
                setAddedIds(prev => new Set([...prev, id]));
                if (onProductAdded) onProductAdded();
            }
        } catch (err) {
            console.error('Add error:', err);
        } finally {
            setAddingId(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 bg-gray-50/50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-slate-800">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
    );

    if (products.length === 0) return null;

    return (
        <div className="relative group/carousel">
            <div className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-800">
                        <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-slate-100 leading-none">New Opportunities</h2>
                        <p className="text-sm text-gray-400 dark:text-slate-500 font-medium mt-1">Products freshly added by Admin to Storehouse</p>
                    </div>
                </div>
                <button
                    onClick={() => window.location.href = '/storehouse'}
                    className="hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                >
                    View All <Tag className="w-4 h-4" />
                </button>
            </div>

            <div ref={containerRef} className="swiper !pb-14 overflow-visible">
                <div className="swiper-wrapper">
                    {products.map((product) => {
                        const isAdded = addedIds.has(String(product._id));
                        const isAdding = addingId === product._id;
                        const imgSrc = product.image
                            ? (product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`)
                            : '';

                        return (
                            <div key={product._id} className="swiper-slide !h-auto">
                                <div className="glass-card !bg-white/70 dark:!bg-slate-900/70 border-white dark:border-slate-800 overflow-hidden h-full flex flex-col group/card shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                    {/* Image Section */}
                                    <div className="h-48 bg-gray-50 dark:bg-slate-800/50 relative overflow-hidden flex items-center justify-center">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <Package className="w-10 h-10 text-gray-200 dark:text-slate-700" />
                                        )}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className="bg-black/60 backdrop-blur-md text-[9px] font-black text-white px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                {product.category || 'Global'}
                                            </span>
                                        </div>
                                        {isAdded && (
                                            <div className="absolute inset-0 bg-primary-600/10 backdrop-blur-[2px] flex items-center justify-center">
                                                <div className="bg-white dark:bg-slate-900 border border-primary-500/20 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-primary-500" />
                                                    <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase">In Store</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-5 flex flex-col flex-1 text-left">
                                        <h4 className="font-black text-gray-900 dark:text-slate-100 text-sm mb-4 min-h-[3.5rem] leading-tight group-hover/card:text-primary-600 dark:group-hover/card:text-primary-400 transition-colors uppercase">
                                            {product.name}
                                        </h4>

                                        <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100 dark:border-slate-800">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Cost Price</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-slate-100">₹{(product.price || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-primary-500 dark:text-primary-400 uppercase tracking-widest">Est. Sell</p>
                                                <p className="text-sm font-black text-primary-600 dark:text-primary-400">₹{(product.selling_price || 0).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => !isAdded && handleAdd(product._id)}
                                            disabled={isAdded || isAdding}
                                            className={`mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black transition-all duration-300
                                                ${isAdded 
                                                    ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed' 
                                                    : 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 active:scale-95 uppercase tracking-widest'}`}
                                        >
                                            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : isAdded ? 'Linked to Store' : 'Add to My Store'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="swiper-pagination-store absolute !bottom-0 left-0 right-0 flex justify-center z-20"></div>
            </div>

            <style jsx global>{`
                .swiper-pagination-store .swiper-pagination-bullet { width: 8px; height: 8px; background: rgba(99, 102, 241, 0.2); opacity: 1; transition: all 0.3s; }
                .swiper-pagination-store .swiper-pagination-bullet-active { width: 24px; border-radius: 4px; background: #6366f1; }
            `}</style>
        </div>
    );
}

