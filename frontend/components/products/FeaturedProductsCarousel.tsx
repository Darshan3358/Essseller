'use client';

import { useEffect, useRef } from 'react';
import { Product } from '@/types';
import { Star, ShoppingCart, Sparkles } from 'lucide-react';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface FeaturedProductsCarouselProps {
    products: Product[];
}

export default function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
    const swiperRef = useRef<Swiper | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && !swiperRef.current) {
            swiperRef.current = new Swiper(containerRef.current, {
                modules: [Navigation, Pagination, Autoplay],
                slidesPerView: 1,
                spaceBetween: 20,
                loop: true,
                autoplay: {
                    delay: 4000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                    dynamicBullets: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    640: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 24,
                    },
                    1280: {
                        slidesPerView: 4,
                        spaceBetween: 24,
                    },
                },
            });
        }

        return () => {
            if (swiperRef.current) {
                swiperRef.current.destroy();
                swiperRef.current = null;
            }
        };
    }, []);

    const featuredProducts = products
        .filter(p => p.isFeatured)
        .sort((a, b) => a.featuredOrder - b.featuredOrder);

    if (featuredProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold gradient-text">Featured Products</h2>
                            <p className="text-gray-600 dark:text-slate-400 mt-1">Handpicked items just for you</p>
                        </div>
                    </div>
                </div>

                {/* Carousel */}
                <div className="relative">
                    <div ref={containerRef} className="swiper">
                        <div className="swiper-wrapper">
                            {featuredProducts.map((product) => (
                                <div key={product.id} className="swiper-slide">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="swiper-button-prev !w-12 !h-12 !bg-white !rounded-full !shadow-lg after:!text-primary-600 after:!text-xl hover:!bg-primary-50 !transition-all"></div>
                        <div className="swiper-button-next !w-12 !h-12 !bg-white !rounded-full !shadow-lg after:!text-primary-600 after:!text-xl hover:!bg-primary-50 !transition-all"></div>

                        {/* Pagination */}
                        <div className="swiper-pagination !bottom-0 !relative !mt-8"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ProductCard({ product }: { product: Product }) {
    const rating = 4.5; // Mock rating
    const discount = Math.round(((product.price - product.cost) / product.price) * 100);

    return (
        <div className="group premium-card overflow-hidden h-full flex flex-col">
            {/* Image Container */}
            <div className="relative overflow-hidden bg-gray-100 aspect-square">
                {/* Featured Badge */}
                <div className="absolute top-3 left-3 z-10">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        FEATURED
                    </div>
                </div>

                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-danger-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            -{discount}%
                        </div>
                    </div>
                )}

                {/* Product Image Placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-primary-100 via-purple-100 to-pink-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                            <ShoppingCart className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Product Image</p>
                    </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="btn-primary transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <ShoppingCart className="w-5 h-5 inline mr-2" />
                        Quick Add
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4 flex-1 flex flex-col">
                {/* Category */}
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
                    {product.category}
                </p>

                {/* Product Name */}
                <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-2 min-h-[3rem] flex-1">
                    {product.name}
                </h3>

                {/* Rating */}
                {/* Rating hidden as it is currently mock data */}
                {/* <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-slate-400">({rating})</span>
                </div> */}

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₹{product.price ? product.price.toFixed(2) : '0.00'}
                        </p>
                        {product.stock > 0 ? (
                            <p className="text-xs text-success-600 font-medium">
                                {product.stock} in stock
                            </p>
                        ) : (
                            <p className="text-xs text-danger-600 font-medium">Out of stock</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
