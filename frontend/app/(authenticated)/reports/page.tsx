'use client';

import { useState, useEffect, useCallback } from 'react';
import { Filter, Calendar, DollarSign, Package, TrendingUp, BarChart3, FilePieChart, RefreshCw } from 'lucide-react';

interface DailyRow {
    date: string;
    sales: number;
    profit: number;
    orders: number;
    aov: number;
}

interface Stats {
    totalSales: number;
    netProfit: number;
    totalOrders: number;
    avgOrderValue: number;
    todaySales: number;
    thisMonthSales: number;
    lastMonthSales: number;
    chartData: DailyRow[];
    categoryCounts: { _id: string; count: number }[];
}

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [period, setPeriod] = useState<'7' | '30' | '180' | '365'>('30');
    const [stats, setStats] = useState<Stats | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async (overrideStart?: string, overrideEnd?: string) => {
        setLoading(true);
        setError('');
        try {
            const token = sessionStorage.getItem('token');
            if (!token) { setError('Not authenticated'); setLoading(false); return; }

            const start = overrideStart !== undefined ? overrideStart : dateRange.start;
            const end = overrideEnd !== undefined ? overrideEnd : dateRange.end;

            const [statsRes, ordersRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/sellers/stats?days=${period}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/myorders?limit=1000`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const statsData = await statsRes.json();
            const ordersData = await ordersRes.json();

            if (statsData.success) {
                const s = statsData.stats;
                // Total orders from actual order list
                const allOrders: any[] = ordersData.success ? (ordersData.orders || []) : [];
                setOrders(allOrders);

                // Filter by date range if set
                const filtered = filterByDate(allOrders, start, end);

                const totalRevenue = filtered.reduce((acc: number, o: any) => acc + (parseFloat(o.order_total) || 0), 0);
                const totalCost = filtered.reduce((acc: number, o: any) => acc + (parseFloat(o.cost_amount) || 0), 0);
                const totalOrderCount = filtered.length;
                const avgVal = totalOrderCount > 0 ? totalRevenue / totalOrderCount : 0;

                setStats({
                    totalSales: totalRevenue,
                    netProfit: Math.max(0, totalRevenue - totalCost),
                    totalOrders: totalOrderCount,
                    avgOrderValue: avgVal,
                    todaySales: s.todaySales || 0,
                    thisMonthSales: s.thisMonthSales || 0,
                    lastMonthSales: s.lastMonthSales || 0,
                    chartData: s.chartData || [],
                    categoryCounts: s.categoryCounts || [],
                });
            } else {
                setError(statsData.message || 'Failed to load stats');
            }
        } catch (e) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [period, dateRange.start, dateRange.end]);

    useEffect(() => { fetchData(); }, [period]);

    function filterByDate(list: any[], start: string, end: string) {
        if (!start && !end) return list;
        return list.filter((o: any) => {
            const d = new Date(o.createdAt);
            if (start && d < new Date(start)) return false;
            if (end && d > new Date(end + 'T23:59:59')) return false;
            return true;
        });
    }

    const handleApply = () => fetchData();

    // Build daily rows from orders (grouped by date)
    const dailyRows = (() => {
        if (!stats) return [];
        // Use chartData from backend if no date filter
        if (!dateRange.start && !dateRange.end) return stats.chartData.slice(-10).reverse();

        // Otherwise build from filtered orders
        const filtered = filterByDate(orders, dateRange.start, dateRange.end);
        const map: Record<string, { sales: number; cost: number; orders: number }> = {};
        filtered.forEach((o: any) => {
            const key = new Date(o.createdAt).toISOString().split('T')[0];
            if (!map[key]) map[key] = { sales: 0, cost: 0, orders: 0 };
            map[key].sales += parseFloat(o.order_total) || 0;
            map[key].cost += parseFloat(o.cost_amount) || 0;
            map[key].orders += 1;
        });
        return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 15).map(([date, v]) => ({
            date,
            sales: Math.round(v.sales),
            profit: Math.max(0, Math.round(v.sales - v.cost)),
            orders: v.orders,
            aov: v.orders > 0 ? Math.round(v.sales / v.orders) : 0
        }));
    })();

    const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const statCards = stats ? [
        { title: 'Total Revenue', value: fmt(stats.totalSales), sub: `Today: ${fmt(stats.todaySales)}`, icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-50' },
        { title: 'Orders', value: String(stats.totalOrders), sub: `This month: ${fmt(stats.thisMonthSales)}`, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Avg Order Value', value: fmt(stats.avgOrderValue), sub: `Last month: ${fmt(stats.lastMonthSales)}`, icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50' },
        { title: 'Net Profit', value: fmt(stats.netProfit), sub: stats.totalSales > 0 ? `Margin: ${((stats.netProfit / stats.totalSales) * 100).toFixed(1)}%` : 'Margin: 0%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    ] : [];

    return (
        <>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Reports & Analytics</h2>
                        <p className="text-gray-600">Deep dive into your store performance metrics</p>
                    </div>
                    <button
                        onClick={() => fetchData()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 text-primary-600 font-semibold hover:bg-primary-100 transition-all text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Period Selector */}
                <div className="flex gap-2">
                    {(['7', '30', '180', '365'] as const).map(d => (
                        <button
                            key={d}
                            onClick={() => setPeriod(d)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${period === d ? 'bg-primary-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {d === '7' ? '1W' : d === '30' ? '1M' : d === '180' ? '6M' : '1Y'}
                        </button>
                    ))}
                </div>

                {/* Filters */}
                <div className="glass-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary-500" /> Start Date
                            </label>
                            <input
                                type="date"
                                className="input-field py-2 text-sm"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary-500" /> End Date
                            </label>
                            <input
                                type="date"
                                className="input-field py-2 text-sm"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-primary-500" /> Quick Range
                            </label>
                            <select
                                className="input-field py-2 text-sm"
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (!v) {
                                        setDateRange({ start: '', end: '' });
                                        fetchData('', '');
                                        return;
                                    }
                                    const endDate = new Date();
                                    const startDate = new Date();
                                    startDate.setDate(endDate.getDate() - parseInt(v));
                                    const startStr = startDate.toISOString().split('T')[0];
                                    const endStr = endDate.toISOString().split('T')[0];
                                    setDateRange({ start: startStr, end: endStr });
                                    fetchData(startStr, endStr);
                                }}
                            >
                                <option value="">All Time</option>
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleApply} className="btn-primary w-full py-2">Apply Filters</button>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">{error}</div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="metric-card animate-pulse">
                                <div className="h-6 w-24 bg-gray-200 rounded mb-3" />
                                <div className="h-8 w-32 bg-gray-200 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((stat, idx) => (
                                <div key={idx} className="metric-card">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2 rounded-xl ${stat.bg}`}>
                                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">{stat.sub}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                            ))}
                        </div>

                        {/* Performance Table */}
                        <div className="glass-card overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FilePieChart className="w-5 h-5 text-primary-600" />
                                    Performance Data
                                </h3>
                                <span className="text-xs text-gray-400">{dailyRows.length} records</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Revenue</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Net Profit</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-center">Orders</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Avg Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {dailyRows.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">
                                                    No performance data for selected range.
                                                </td>
                                            </tr>
                                        ) : (
                                            dailyRows.map((row, i) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{row.date}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{fmt(row.sales)}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-green-600 text-right">{fmt(row.profit)}</td>
                                                    <td className="px-6 py-4 text-sm text-center">
                                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-bold text-xs">
                                                            {row.orders}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 text-right">{fmt(row.aov)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        {stats && stats.categoryCounts.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="glass-card p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Products by Category</h3>
                                    <div className="space-y-4">
                                        {stats.categoryCounts.map((cat, i) => {
                                            const total = stats.categoryCounts.reduce((a, c) => a + c.count, 0);
                                            const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
                                            const colors = ['bg-primary-500', 'bg-blue-500', 'bg-violet-500', 'bg-green-500', 'bg-amber-500'];
                                            return (
                                                <div key={i} className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-semibold text-gray-700 capitalize">{cat._id || 'Uncategorized'}</span>
                                                        <span className="font-bold text-gray-900">{cat.count} ({pct}%)</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div className={`h-full ${colors[i % colors.length]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="premium-card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                    <TrendingUp className="w-10 h-10 mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold mb-2">Sales Summary</h3>
                                    <div className="space-y-3 text-blue-100 text-sm">
                                        <div className="flex justify-between">
                                            <span>Today</span>
                                            <span className="font-bold text-white">{fmt(stats.todaySales)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-white/20 pt-3">
                                            <span>This Month</span>
                                            <span className="font-bold text-white">{fmt(stats.thisMonthSales)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-white/20 pt-3">
                                            <span>Last Month</span>
                                            <span className="font-bold text-white">{fmt(stats.lastMonthSales)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-white/20 pt-3">
                                            <span>Total Revenue</span>
                                            <span className="font-bold text-white">{fmt(stats.totalSales)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
