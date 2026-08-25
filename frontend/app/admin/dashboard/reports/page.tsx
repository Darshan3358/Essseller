'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Clock, Activity, ShoppingCart, User, TrendingDown, 
    ArrowLeft, DollarSign, TrendingUp, Package, RefreshCw
} from 'lucide-react';
import SalesChart from '@/components/dashboard/SalesChart';

interface Stats {
    totalSales: number;
    totalOrders: number;
    todaySales: number;
    thisMonthSales: number;
    lastMonthSales: number;
    netProfit: number;
    avgOrderValue: number;
    chartData: any[];
    categoryCounts: { _id: string; count: number }[];
}

export default function AdminSellerReportsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sellerId = searchParams.get('seller_id');

    const [stats, setStats] = useState<Stats | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [period, setPeriod] = useState('30');

    const fetchStats = useCallback(async () => {
        if (!sellerId) {
            setError('No seller selected');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const token = sessionStorage.getItem('adminToken');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/seller-stats/${sellerId}?days=${period}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setOrders(data.orders || []);
            } else {
                setError(data.message || 'Failed to load seller reports');
            }
        } catch (e) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [sellerId, period]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const fmt = (n: number) => `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (!sellerId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
                <AlertCircle size={48} className="text-rose-500 mb-4" />
                <h2 className="text-xl font-bold">No Seller Selected</h2>
                <p className="text-white/40 mb-6">Please select a seller from the user management page.</p>
                <button
                    onClick={() => router.push('/admin/dashboard/users')}
                    className="px-6 py-2 bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-all"
                >
                    Back to Users
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <button
                        onClick={() => router.back()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            color: '#3b82f6', background: 'none', border: 'none',
                            cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                            marginBottom: '12px', padding: 0
                        }}
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>
                        Seller <span style={{ color: '#3b82f6' }}>Performance Report</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '4px' }}>
                        Detailed analytics and historical data for Seller ID: {sellerId}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {['7', '30', '180', '365'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                style={{
                                    padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                    background: period === p ? '#3b82f6' : 'transparent',
                                    color: period === p ? 'white' : 'rgba(255,255,255,0.5)'
                                }}
                            >
                                {p === '7' ? '1W' : p === '30' ? '1M' : p === '180' ? '6M' : '1Y'}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchStats}
                        style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px', color: '#f87171', marginBottom: '24px' }}>
                    {error}
                </div>
            )}

            {loading && !stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ height: '140px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', animation: 'pulse 2s infinite' }} />
                    ))}
                </div>
            ) : stats ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Metrics Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                        {[
                            { label: 'Total Sales', value: fmt(stats.totalSales), sub: `Today: ${fmt(stats.todaySales)}`, icon: DollarSign, color: '#3b82f6' },
                            { label: 'Total Orders', value: stats.totalOrders, sub: `This Month: ${fmt(stats.thisMonthSales)}`, icon: ShoppingCart, color: '#10b981' },
                            { label: 'Avg Order Value', value: fmt(stats.avgOrderValue), sub: `Last Month: ${fmt(stats.lastMonthSales)}`, icon: Activity, color: '#a78bfa' },
                            { label: 'Net Profit', value: fmt(stats.netProfit), sub: `Margin: ${stats.totalSales > 0 ? ((stats.netProfit / stats.totalSales) * 100).toFixed(1) : 0}%`, icon: TrendingUp, color: '#fbbf24' },
                        ].map((m, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                    <div style={{ padding: '10px', background: `${m.color}15`, borderRadius: '14px', border: `1px solid ${m.color}33` }}>
                                        <m.icon size={20} style={{ color: m.color }} />
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {m.label}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'white', margin: '0 0 4px' }}>{m.value}</h3>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: '600' }}>{m.sub}</p>
                                <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', width: '60px', height: '60px', borderRadius: '50%', background: m.color, opacity: 0.1, filter: 'blur(20px)' }} />
                            </div>
                        ))}
                    </div>

                    {/* Dynamic Chart Section (Mirroring Dashboard) */}
                    <div style={{ background: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '256px', height: '256px', background: 'rgba(59,130,246,0.05)', filter: 'blur(100px)', pointerEvents: 'none' }} />
                        <SalesChart data={stats.chartData} onRangeChange={(r) => {
                            if (r === '7days') setPeriod('7');
                            if (r === '30days') setPeriod('30');
                            if (r === '6months') setPeriod('180');
                            if (r === '12months') setPeriod('365');
                        }} />
                    </div>

                    {/* Category & Recent Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Package size={18} style={{ color: '#fbbf24' }} /> Category Breakdown
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {stats.categoryCounts.length === 0 ? (
                                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center' }}>No products found</p>
                                ) : stats.categoryCounts.map((cat, i) => {
                                    const total = stats.categoryCounts.reduce((a, b) => a + b.count, 0);
                                    const pct = total > 0 ? (cat.count / total) * 100 : 0;
                                    const colors = ['#3b82f6', '#10b981', '#a78bfa', '#fbbf24', '#f87171'];
                                    const color = colors[i % colors.length];
                                    return (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>{cat._id || 'General'}</span>
                                                <span style={{ fontWeight: '800' }}>{cat.count} ({pct.toFixed(0)}%)</span>
                                            </div>
                                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Activity Mini-List */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Clock size={18} style={{ color: '#a78bfa' }} /> Recent Sales
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {orders.slice(0, 5).map((o, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700' }}>#{o.order_id || o.id}</div>
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#3b82f6' }}>${parseFloat(o.order_total).toFixed(2)}</div>
                                    </div>
                                ))}
                                {orders.length === 0 && <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center' }}>No orders found</p>}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

function AlertCircle({ size = 24, className = "" }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}
