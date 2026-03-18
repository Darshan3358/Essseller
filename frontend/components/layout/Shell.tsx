'use client';

import { useState, useEffect, useRef } from 'react';
import Navigation from './Navigation';
import { LayoutDashboard, Menu, Bell, Search, LogOut, ChevronDown, Wallet, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, getFullImageUrl } from '@/lib/api';

export default function Shell({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/sellers/stats');
                if (response.success) {
                    setStats(response.stats);
                }
            } catch (error) {
                console.error('Error fetching stats in Shell:', error);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
            {/* Ambient Background Elements - Simplified */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[25%] h-[40%] bg-blue-500/5 rounded-full blur-[80px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[25%] h-[40%] bg-blue-400/5 rounded-full blur-[80px]" />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Faster transitions */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-[70] w-72 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 
                transform transition-transform duration-200 ease-in-out lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full relative z-10">
                    <div className="p-8">
                        <div className="flex items-center gap-4">
                            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg">
                                <LayoutDashboard className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-500">SmartSeller</h1>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(var(--color-rgb),0.4)] ${user?.verified === 1 ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-red-500 shadow-red-500/40'}`} />
                                    <p className={`text-[10px] uppercase tracking-widest font-black ${user?.verified === 1 ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-500'}`}>
                                        {user?.verified === 1 ? 'Verified' : 'Unverified Account'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
                        <Navigation />
                    </div>

                    <div className="p-6">
                        <div className="glass-card !bg-white/40 dark:!bg-slate-800/40 border-white/40 dark:border-slate-700/40 p-4 group cursor-pointer hover:!bg-white/60 dark:hover:!bg-slate-800/60 transition-all duration-200">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:rotate-3 transition-transform overflow-hidden">
                                        {(user?.shop_logo || stats?.shopLogo) && !imageError ? (
                                            <img 
                                                src={getFullImageUrl(user?.shop_logo || stats?.shopLogo)} 
                                                alt="Shop Logo" 
                                                className="w-full h-full object-cover"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            user?.name?.slice(0, 2).toUpperCase() || 'GS'
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white rounded-full" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{user?.name || 'Guest Seller'}</p>
                                        {user?.verified === 1 && (
                                            <div title="Verified Seller" className="flex-shrink-0">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10" strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 dark:text-slate-400 font-semibold truncate">{user?.email || 'Individual Plan'}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100/50 hidden group-hover:block transition-all duration-200">
                                <button
                                    onClick={() => logout()}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-danger-500 hover:bg-danger-50 py-2 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-3 h-3" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:pl-72 flex flex-col min-h-screen relative z-10">
                <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800 sticky top-0 z-[50] flex items-center justify-between px-4 lg:px-8 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl lg:hidden transition-all"
                        >
                            <Menu className="w-6 h-6 text-gray-700 dark:text-slate-300" />
                        </button>

                        {/* ESS Logo - Responsive */}
                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/dashboard')}>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                <span className="text-white font-black text-xs">ESS</span>
                            </div>
                            <span className="hidden sm:block font-black text-lg tracking-tighter text-gray-900 dark:text-slate-100 ml-1">SmartSeller</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
                        <SearchBar router={router} />
                    </div>

                    <div className="flex items-center gap-3 lg:gap-4">
                        {/* Wallet Balance */}
                        <button
                            onClick={() => router.push('/deposit')}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-success-50 to-emerald-50 dark:from-emerald-900/10 dark:to-success-900/10 border border-success-100 dark:border-success-900/40 rounded-2xl hover:shadow-md transition-all group"
                        >
                            <div className="p-1.5 bg-success-500 rounded-lg group-hover:scale-110 transition-transform hidden xs:block">
                                <Wallet className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-[9px] font-bold text-success-600 dark:text-success-400 uppercase tracking-tighter leading-none">Wallet</span>
                                <span className="text-sm font-black text-gray-900 dark:text-slate-100 leading-none mt-1">${(stats?.mainWallet || 0).toLocaleString()}</span>
                            </div>
                            <PlusCircle className="w-4 h-4 text-success-500 ml-1 opacity-50 group-hover:opacity-100 transition-opacity hidden sm:block" />
                        </button>

                        <div className="h-8 w-[1px] bg-gray-200 hidden sm:block mx-1"></div>

                        <button className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-2xl relative group transition-all shrink-0">
                            <Bell className="w-5 h-5 text-gray-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger-500 rounded-full border-2 border-white dark:border-slate-900" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-3 sm:p-4 lg:p-8 relative">
                    {children}
                </main>
            </div>
        </div>
    );
}

function Smartphone({ size = 24, className = "" }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
        </svg>
    );
}

function SearchBar({ router }: { router: ReturnType<typeof useRouter> }) {
    const [query, setQuery] = useState('');
    const pathname = usePathname();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            const q = encodeURIComponent(query.trim());
            // Route based on current page context
            if (pathname?.includes('/products')) {
                router.push(`/products?keyword=${q}`);
            } else if (pathname?.includes('/orders')) {
                router.push(`/orders?keyword=${q}`);
            } else {
                // Default: search storehouse
                router.push(`/storehouse?search=${q}`);
            }
            setQuery('');
        }
    };

    return (
        <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
                type="text"
                placeholder="Search products, orders..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100/50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-400/20 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium dark:text-slate-100 dark:placeholder:text-slate-500"
            />
        </div>
    );
}
