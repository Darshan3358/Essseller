'use client';

import { useState, useEffect } from 'react';
import {
    AmountReceivablesCard,
    TotalLifetimeSalesCard,
    TodaySalesCard,
    ThisMonthSalesCard,
    LastMonthSalesCard
} from '@/components/dashboard/MetricCard';
import UserPerformanceChart from '@/components/dashboard/UserPerformanceChart';
import { ChartDataPoint, DateRange } from '@/types';
import FeaturedProductsCarousel from '@/components/products/FeaturedProductsCarousel';
import StorehouseCarousel from '@/components/dashboard/StorehouseCarousel';
import { TrendingUp, Package, Zap, Sparkles, Activity, ArrowUpRight, Globe, CheckCircle2, Heart, Eye, Gem, Shield, Clock, ArrowRight, X, Star } from 'lucide-react';
import Shell from '@/components/layout/Shell';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, isLoading: authLoading, updateUser } = useAuth();
    const router = useRouter();

    // Original Stats from DB
    const [stats, setStats] = useState({
        amountReceivables: 0,
        totalLifetimeSales: 0,
        todaySales: 0,
        todayChange: 0,
        thisMonthSales: 0,
        thisMonthChange: 0,
        lastMonthSales: 0,
        netProfit: 0,
        netProfitMargin: 0,
        planName: 'Free Plan',
        productLimit: 0,
        totalProducts: 0,
        remainingProducts: 0,
        views: 0,
        usedViews: 0,
        remainingViews: 0,
        planFeatures: [] as string[]
    });
    
    const [planDisplayData, setPlanDisplayData] = useState<any>({
        plan_title: 'Loading...',
        used_text: '0',
        remaining_text: '0',
        views_text: '0',
        features: []
    });

    const [chartData, setChartData] = useState<any[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showHealthModal, setShowHealthModal] = useState(false);

    const refetchChartData = async (range: DateRange) => {
        let days = 7;
        if (range === '30days') days = 30;
        if (range === '6months') days = 180;
        if (range === '12months') days = 365;

        try {
            const statsRes = await api.get(`/sellers/stats?days=${days}`);
            if (statsRes.success && statsRes.stats.chartData) {
                setChartData(statsRes.stats.chartData);
            }
        } catch (error) {
            console.error('Error refetching chart data:', error);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Fetch original stats from Database
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                // Ensure profile info is fresh
                const [profileRes, shopRes] = await Promise.all([
                    api.get('/auth/profile'),
                    api.get('/sellers/shop-settings'),
                ]);
                if (profileRes.success || profileRes._id) {
                    const freshUser = profileRes.success ? profileRes.data : profileRes;
                    if (shopRes.success && shopRes.data?.shop_name) {
                        freshUser.shop_name = shopRes.data.shop_name;
                    }
                    updateUser(freshUser);
                }

                // Fetch basic stats
                const statsRes = await api.get('/sellers/stats');
                if (statsRes.success) {
                    const dbStats = statsRes.stats;
                    setStats(prev => ({
                        ...prev,
                        totalLifetimeSales: dbStats.totalSales || 0,
                        amountReceivables: dbStats.guaranteeMoney || 0,
                        todaySales: dbStats.todaySales || 0,
                        thisMonthSales: dbStats.thisMonthSales || 0,
                        lastMonthSales: dbStats.lastMonthSales || 0,
                        netProfit: dbStats.netProfit || 0,
                        netProfitMargin: dbStats.netProfitMargin || 0,
                        planName: dbStats.planName || 'Free Plan',
                        productLimit: dbStats.productLimit || 0,
                        totalProducts: dbStats.totalProducts || 0,
                        remainingProducts: dbStats.remainingProducts || 0,
                        views: dbStats.views || 0,
                        usedViews: dbStats.used_views || 0,
                        remainingViews: dbStats.remaining_views || 0,
                        planFeatures: dbStats.planFeatures || [],
                    }));
                    if (dbStats.chartData) {
                        setChartData(dbStats.chartData);
                    }
                }

                // Fetch real products for carousel (featured by admin)
                const productsRes = await api.get('/products/featured');
                if (productsRes.success) {
                    setFeaturedProducts(productsRes.data || []);
                }
                
/* Removed redundant planRes fetching as features are now in stats */
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    // Optimized Loading: Show Shell immediately to feel fast
    if (authLoading) return null;
    if (!user) return null;

    return (
        <Shell>
            <div className="space-y-5 sm:space-y-10 pb-10 sm:pb-20 max-w-[1600px] mx-auto transition-all duration-500">


                {/* Hero Welcome Section */}
                <section className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-blue-700 rounded-[2.5rem] opacity-90 group-hover:opacity-100 transition-opacity duration-1000 shadow-[0_20px_50px_rgba(79,70,229,0.3)]"></div>
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                    {/* Floating Decorative Elements */}
                    <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>
                    <div className="absolute bottom-[-20%] left-[10%] w-48 h-48 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>

                    <div className="relative z-10 p-4 sm:p-10 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-10 text-center md:text-left">
                        <div className="text-white space-y-4 md:space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 animate-fade-in shadow-inner mx-auto md:mx-0">
                                <Zap className="w-3 md:w-4 h-3 md:h-4 text-yellow-300 fill-yellow-300" />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Live Store Intelligence</span>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl sm:text-4xl lg:text-7xl font-black tracking-tight animate-slide-up leading-tight flex flex-wrap items-center gap-2 sm:gap-3">
                                    Hello, <span className="text-yellow-300">{(user.shop_name || user.name || 'Seller').toUpperCase()}</span>!
                                </h1>
                                <p className="text-base md:text-xl text-primary-50 opacity-90 animate-slide-up stagger-1 max-w-lg mx-auto md:mx-0">
                                    Welcome back to your dashboard. All systems are online and running smoothly.
                                </p>
                            </div>
                        </div>

                        {/* Single Store Health Card */}
                        <div className="relative">
                            <div className="glass-card !bg-white/98 dark:!bg-slate-900/98 border-white/50 dark:border-slate-800/50 p-4 sm:p-7 w-full max-w-[220px] sm:max-w-none backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 relative overflow-hidden group/card" style={{ width: undefined }}>
                                {/* Top accent bar */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500"></div>

                                {/* Subtle background glow */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100/40 rounded-full blur-3xl"></div>

                                <div className="relative z-10 text-left space-y-5">
                                    {/* Header Row */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shadow-inner">
                                                <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">Store Health</span>
                                        </div>
                                        <span className="text-[10px] font-black text-white px-3 py-1.5 bg-emerald-500 rounded-full tracking-wider shadow-md flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block"></span>
                                            {user.store_status || 'ACTIVE'}
                                        </span>
                                    </div>

                                    {/* Score */}
                                    <div>
                                        <h4 className="text-3xl sm:text-[3.8rem] font-black text-slate-900 dark:text-slate-100 leading-none tracking-tighter">
                                            {user.store_health || 95}%
                                        </h4>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5">
                                            <span>Performance</span>
                                            <span className="text-emerald-600 dark:text-emerald-400">{user.store_performance || 'Excellent'}</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${user.store_health || 95}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Last Updated */}
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shadow-sm" />
                                        Last Updated: <span className="text-slate-600 dark:text-slate-300 font-bold">
                                            {user.store_health_updated_at 
                                                ? new Date(user.store_health_updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                                                : 'Today'}
                                        </span>
                                    </p>

                                    {/* Show Detail Button — visible to all (admin can control via backend) */}
                                    <button
                                        onClick={() => setShowHealthModal(true)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 active:scale-95"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Show Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Main Stats Grid */}
                <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 animate-slide-up stagger-1">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <AmountReceivablesCard amount={stats.amountReceivables} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-2">
                        <TotalLifetimeSalesCard amount={stats.totalLifetimeSales} />
                    </div>
                    <div className="col-span-2 sm:col-span-2 sm:col-start-1 md:col-start-auto lg:col-span-1">
                        <TodaySalesCard amount={stats.todaySales} change={stats.todayChange} />
                    </div>
                </section>

                {/* Sub Stats & Net Profit Row */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 animate-slide-up stagger-2">
                    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6">
                        <ThisMonthSalesCard amount={stats.thisMonthSales} change={stats.thisMonthChange} />
                        <LastMonthSalesCard amount={stats.lastMonthSales} />
                    </div>

                    <div className="premium-card relative overflow-hidden group/profit min-h-[250px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-success-600 to-emerald-700 group-hover:scale-110 transition-transform duration-700 opacity-95"></div>
                        <div className="relative z-10 p-4 sm:p-6 md:p-8 h-full flex flex-col justify-between text-white text-left">
                            <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0">
                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-success-200 truncate">Total Net Profit</p>
                                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-black mt-2 leading-none truncate">
                                        ₹{stats.netProfit.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                    </h3>
                                </div>
                                <div className="p-3 md:p-4 bg-white/20 rounded-2xl shadow-xl backdrop-blur-md group-hover/profit:rotate-12 transition-transform shrink-0">
                                    <TrendingUp className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                            </div>

                            <div className="mt-3 md:mt-8 pt-3 md:pt-8 border-t border-white/20">
                                <div className="flex justify-between items-end gap-2 text-left">
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider truncate">Margin Percentage</p>
                                        <p className="text-2xl md:text-3xl font-black text-yellow-300">{stats.netProfitMargin}%</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="flex items-center gap-1 text-success-300 font-bold justify-end">
                                            <ArrowUpRight className="w-4 h-4" />
                                            <span className="text-xs md:text-sm">Active</span>
                                        </div>
                                        <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold">Data Status</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Premium Plan Card - Moved Above Analytics */}
                <div className="w-full animate-slide-up stagger-3">
                    <section className="text-left">
                        <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.2)] transition-all duration-500" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #EC4899 100%)' }}>
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 p-5 md:p-8 flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                            <Sparkles className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Current Plan</p>
                                            <p className="text-sm font-bold text-white/70">Premium subscription</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-white bg-white/20 border border-white/30 px-5 py-2 rounded-full tracking-[0.15em] backdrop-blur-md uppercase">ACTIVE</span>
                                </div>

                                {/* Central Diamond */}
                                <div className="flex flex-col items-center mb-10">
                                    <div className="w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.2)] border border-white/30 mb-8 relative">
                                        <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl scale-75"></div>
                                        <Gem className="w-14 h-14 text-white drop-shadow-2xl relative z-10" />
                                    </div>
                                    <h3 className="text-5xl font-black text-white tracking-tight drop-shadow-md text-center">{stats.planName}</h3>
                                </div>

                                {/* Features Pills - Dynamic from Stats */}
                                <div className="flex flex-wrap justify-center gap-3 mb-10">
                                    {stats.planFeatures && stats.planFeatures.length > 0 ? (
                                        stats.planFeatures.map((f: string, i: number) => (
                                            <span key={i} className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-2xl text-xs font-bold text-white backdrop-blur-md flex items-center gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" /> {f}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="px-5 py-2.5 bg-white/10 border border-white/20 rounded-2xl text-xs font-bold text-white backdrop-blur-md">
                                            Standard Selling Features
                                        </span>
                                    )}
                                </div>

                                {/* UI Elements from Image */}
                                <div className="space-y-8">
                                    <button onClick={() => router.push('/packages')} className="w-full flex items-center justify-center gap-3 py-5 bg-white text-primary-700 rounded-[1.8rem] font-black text-lg tracking-uppercase transition-all shadow-xl active:scale-95 shadow-white/10">
                                        Upgrade Level <ArrowRight className="w-6 h-6" />
                                    </button>

                                    <div className="grid grid-cols-3 gap-6 text-center pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-2xl font-black text-white">
                                                {stats.usedViews.toLocaleString()}
                                            </p>
                                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">Used</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-white">
                                                {stats.remainingViews.toLocaleString()}
                                            </p>
                                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">Remaining</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-pink-200">
                                                {stats.views.toLocaleString()}
                                            </p>
                                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">Views</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Analytics Split */}
                {/* Performance & Analytics Section - Full Width */}
                <section className="animate-slide-up stagger-4">
                    <UserPerformanceChart data={chartData} onRangeChange={refetchChartData} />
                </section>

                {/* New Storehouse Discovery Carousel */}
                <section className="animate-slide-up stagger-5">
                    <StorehouseCarousel 
                        onProductAdded={async () => {
                            // Refresh featured products when a new product is added to store
                            const productsRes = await api.get('/products/featured');
                            if (productsRes.success) {
                                setFeaturedProducts(productsRes.data || []);
                            }
                        }} 
                    />
                </section>


                {/* Footer */}
                <footer className="text-center pt-16 mt-16 border-t border-gray-100 dark:border-slate-800">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-400 dark:text-slate-500">
                            © 2026 <span className="gradient-text font-black tracking-tighter">SmartSeller Pro</span>.
                            All systems operational.
                        </p>
                    </div>
                </footer>
            </div >

            {/* Premium Store Health Detail Modal */}
            {showHealthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-left">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
                        onClick={() => setShowHealthModal(false)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20 dark:border-white/10 animate-scale-in">
                        {/* Header Gradient */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10"></div>
                        
                        <div className="relative p-5 md:p-8 space-y-6 md:space-y-8">
                            {/* Close Button */}
                            <button 
                                onClick={() => setShowHealthModal(false)}
                                className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>

                            {/* Header Section */}
                            <div className="flex items-center gap-5 pt-2">
                                <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                                    <Activity className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Store Intelligence</h3>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Granular performance analysis</p>
                                </div>
                            </div>

                            {/* Main Score & Status */}
                            <div className="flex items-center justify-between p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Current Protocol</p>
                                    <h4 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{user.store_health || 95}% <span className="text-sm font-bold opacity-40">OPTIMIZED</span></h4>
                                </div>
                                <div className="text-right">
                                    <span className="px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-black shadow-md">
                                        {user.store_status || 'ACTIVE'}
                                    </span>
                                </div>
                            </div>

                            {/* Detailed Metrics List */}
                            <div className="space-y-4">
                                {[
                                    { 
                                        label: 'Order Fulfillment', 
                                        value: user.diagnostics?.fulfillment || '100%', 
                                        sub: parseInt(user.diagnostics?.fulfillment || '100') >= 90 ? 'Perfect' : 'Improving', 
                                        icon: CheckCircle2, 
                                        color: 'text-emerald-500' 
                                    },
                                    { 
                                        label: 'Customer Rating', 
                                        value: user.diagnostics?.rating || '4.9/5', 
                                        sub: parseFloat(user.diagnostics?.rating || '4.9') >= 4.5 ? 'Elite' : 'Good', 
                                        icon: Star, 
                                        color: 'text-amber-500' 
                                    },
                                    { 
                                        label: 'Response Time', 
                                        value: user.diagnostics?.responseTime || '< 2 Hours', 
                                        sub: 'Fast', 
                                        icon: Clock, 
                                        color: 'text-blue-500' 
                                    },
                                    { 
                                        label: 'Quality Score', 
                                        value: user.diagnostics?.qualityScore || '98%', 
                                        sub: parseInt(user.diagnostics?.qualityScore || '95') >= 90 ? 'Premium' : 'Standard', 
                                        icon: Shield, 
                                        color: 'text-blue-500' 
                                    }
                                ].map((m, i) => (
                                    <div key={i} className="flex items-center justify-between group p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700/50 ${m.color}`}>
                                                <m.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{m.label}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{m.sub}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{m.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Action */}
                            <button 
                                onClick={() => setShowHealthModal(false)}
                                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-sm tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 dark:shadow-none"
                            >
                                CLOSE ANALYSIS
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx global>{`
                @keyframes float-premium {
                    0%, 100% { transform: translateY(0) scale(1) rotate(0); }
                    50% { transform: translateY(-15px) scale(1.02) rotate(2deg); }
                }
                .animate-float-premium {
                    animation: float-premium 6s ease-in-out infinite;
                }
                @keyframes scale-in {
                    0% { opacity: 0; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in {
                    animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </Shell>
    );
}
