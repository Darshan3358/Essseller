'use client';

import { useEffect, useState } from 'react';
import { Users, Package, CreditCard, ArrowDownCircle, ShoppingCart, Box, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import SalesChart from '@/components/dashboard/SalesChart';

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    const isPositive = !sub?.includes('-') && sub;

    return (
        <div className="group relative overflow-hidden bg-[#1c1b4e] border border-white/10 rounded-[20px] lg:rounded-[24px] p-5 lg:p-6 transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-start mb-4 lg:mb-6">
                <div className="flex flex-col">
                    <span className="text-white/40 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.1em] mb-1">{label}</span>
                    <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight leading-none group-hover:scale-105 transition-transform duration-500">
                        {value}
                    </h3>
                </div>
                
                <div 
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-500"
                    style={{ background: `${color}15`, border: `1px solid ${color}33` }}
                >
                    <Icon size={16} className="lg:hidden" style={{ color }} />
                    <Icon size={18} className="hidden lg:block" style={{ color }} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {sub && (
                    <div className={`px-2 py-0.5 rounded-lg text-[9px] lg:text-[10px] font-bold flex items-center gap-1 ${
                        isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                        {sub}
                    </div>
                )}
            </div>

            <div 
                className="absolute -right-4 -bottom-4 w-20 lg:w-24 h-20 lg:h-24 blur-[40px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500"
                style={{ background: color }}
            />
        </div>
    );
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        
        fetch(`${apiUrl}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                return r.json();
            })
            .then(d => { 
                if (d.success) {
                    setStats(d.stats);
                    if (d.stats.chartData) setChartData(d.stats.chartData);
                } 
            })
            .catch(err => {
                console.error('Fetch error:', err);
                // Optional: set some state to show an error UI to the user
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div style={{
                width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.3)',
                borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent p-4 lg:p-10 space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2 selection:bg-blue-500">
                    Dashboard Overview <span className="text-white/20">Statistics</span>
                </h1>
                <p className="text-white/40 text-sm font-medium">
                    Manage your marketplace performance and seller activities
                </p>
            </div>

            {/* Alert badges */}
            {stats && (stats.pendingRecharges > 0 || stats.pendingWithdrawals > 0) && (
                <div className="flex flex-wrap gap-4">
                    {stats.pendingRecharges > 0 && (
                        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-3 animate-fade-in shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                            <AlertCircle size={18} className="text-amber-500" />
                            <span className="text-amber-500 text-sm font-bold">
                                {stats.pendingRecharges} Recharge requests pending
                            </span>
                        </div>
                    )}
                    {stats.pendingWithdrawals > 0 && (
                        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-3 animate-fade-in shadow-[0_0_20px_rgba(244,63,94,0.05)]">
                            <AlertCircle size={18} className="text-rose-500" />
                            <span className="text-rose-500 text-sm font-bold">
                                {stats.pendingWithdrawals} Withdrawal requests pending
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-5">
                {/* Top Row on Desktop (3 cards) */}
                <div className="lg:col-span-4">
                    <StatCard icon={Users} label="Total Sellers" value={stats?.totalUsers ?? 0} sub={`+${stats?.newSellers ?? 0} today`} color="#3b82f6" />
                </div>
                <div className="lg:col-span-4">
                    <StatCard icon={Box} label="Products" value={stats?.totalProducts ?? 0} sub="In storehouse" color="#60a5fa" />
                </div>
                <div className="lg:col-span-4">
                    <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders ?? 0} sub={`${stats?.ordersThisMonth ?? 0} month`} color="#06b6d4" />
                </div>

                {/* Bottom Row on Desktop (4 cards) */}
                <div className="lg:col-span-3">
                    <StatCard icon={CreditCard} label="Recharges" value={stats?.totalRecharges ?? 0} sub={`${stats?.pendingRecharges ?? 0} wait`} color="#10b981" />
                </div>
                <div className="lg:col-span-3">
                    <StatCard icon={ArrowDownCircle} label="Withdrawals" value={stats?.totalWithdrawals ?? 0} sub={`${stats?.pendingWithdrawals ?? 0} wait`} color="#f59e0b" />
                </div>
                <div className="lg:col-span-3">
                    <StatCard icon={Package} label="Packages" value={stats?.totalPackages ?? 0} sub="Purchased" color="#ec4899" />
                </div>
                <div className="lg:col-span-3">
                    <StatCard icon={TrendingUp} label="Revenue" value={`₹${(stats?.totalRevenue ?? 0).toFixed(0)}`} sub="Total" color="#14b8a6" />
                </div>
            </div>

            {/* Sales Statistics Chart */}
            <div className="bg-[#020617] border border-white/5 rounded-[32px] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
                <SalesChart data={chartData} />
            </div>

            {/* Quick Links */}
            <div className="bg-[#020617] border border-white/5 rounded-[32px] p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                    {[
                        { label: 'Manage Users', href: '/admin/dashboard/users', color: '#3b82f6' },
                        { label: 'Approve Recharges', href: '/admin/dashboard/recharge', color: '#10b981' },
                        { label: 'Process Withdrawals', href: '/admin/dashboard/withdraw', color: '#f59e0b' },
                        { label: 'View Orders', href: '/admin/dashboard/orders', color: '#06b6d4' },
                        { label: 'Add Products', href: '/admin/dashboard/products', color: '#60a5fa' },
                    ].map(a => (
                        <a key={a.href} href={a.href} className="group no-underline">
                            <div 
                                className="h-full flex flex-col items-center justify-center gap-3 lg:gap-4 p-4 lg:p-6 rounded-3xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/10 hover:translate-y-[-4px]"
                            >
                                <div 
                                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                                    style={{ background: `${a.color}15`, border: `1px solid ${a.color}33` }}
                                >
                                    <Package size={18} className="lg:hidden" style={{ color: a.color }} />
                                    <Package size={20} className="hidden lg:block" style={{ color: a.color }} />
                                </div>
                                <span className="text-white font-bold text-[11px] lg:text-sm text-center">{a.label}</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes spin{to{transform:rotate(360deg)}}
                
                @media (max-width: 600px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                    }
                    .stats-card {
                        padding: 12px !important;
                        gap: 10px !important;
                        flex-direction: column !important;
                    }
                    .stats-card-icon {
                        width: 32px !important;
                        height: 32px !important;
                    }
                    .stats-card-icon svg {
                        width: 14px !important;
                        height: 14px !important;
                    }
                    .stats-card-value {
                        font-size: 18px !important;
                    }
                }
            `}</style>
        </div>
    );
}
