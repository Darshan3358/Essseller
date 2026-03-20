'use client';

import { useEffect, useState } from 'react';
import { Users, Package, CreditCard, ArrowDownCircle, ShoppingCart, Box, TrendingUp, Clock, AlertCircle, RefreshCw, Copy, Check, Key, Trash2, Lock, Unlock } from 'lucide-react';
import SalesChart from '@/components/dashboard/SalesChart';

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    const isPositive = !sub?.includes('-') && sub;
    return (
        <div className="group relative overflow-hidden bg-[#1c1b4e] border border-white/10 rounded-[20px] lg:rounded-[24px] p-5 lg:p-6 transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-start mb-4 lg:mb-6">
                <div className="flex flex-col">
                    <span className="text-white/40 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.1em] mb-1">{label}</span>
                    <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight leading-none group-hover:scale-105 transition-transform duration-500">{value}</h3>
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
                    <Icon size={16} className="lg:hidden" style={{ color }} />
                    <Icon size={18} className="hidden lg:block" style={{ color }} />
                </div>
            </div>
            <div className="flex items-center gap-2">
                {sub && <div className={`px-2 py-0.5 rounded-lg text-[9px] lg:text-[10px] font-bold flex items-center gap-1 ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{sub}</div>}
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 lg:w-24 h-20 lg:h-24 blur-[40px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500" style={{ background: color }} />
        </div>
    );
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('7days');
    const [chartData, setChartData] = useState<any[]>([]);

    // Invite codes
    const [codes, setCodes] = useState<any[]>([]);
    const [codesLoading, setCodesLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [codeMsg, setCodeMsg] = useState('');
    const [codeError, setCodeError] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

    useEffect(() => {
        const token = getToken();
        fetch(`${apiUrl}/admin/stats?range=${range}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d => { if (d.success) { setStats(d.stats); if (d.stats.chartData) setChartData(d.stats.chartData); } })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [range]);

    useEffect(() => { fetchCodes(); }, []);

    const fetchCodes = async () => {
        setCodesLoading(true);
        try {
            const res = await fetch(`${apiUrl}/settings/invite-codes`, { headers: { Authorization: `Bearer ${getToken()}` } });
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                // Server not restarted yet or route missing — silently skip
                setCodesLoading(false);
                return;
            }
            const data = await res.json();
            if (data.success) { setCodes(data.codes); setCodeError(''); }
        } catch (e) { console.error(e); }
        setCodesLoading(false);
    };

    // Generate random code and auto-save immediately
    const generateRandom = async () => {
        const prefixes = ['LKC', 'ESS', 'REF', 'ACT', 'VIP'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const generated = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
        setCodeMsg(''); setCodeError('');
        setGenerating(true);
        try {
            const res = await fetch(`${apiUrl}/settings/invite-codes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ code: generated })
            });
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                setCodeError('Server error — please restart the backend and try again.');
                setGenerating(false);
                return;
            }
            const data = await res.json();
            if (data.success) {
                setCodeMsg('✅ Activation code updated successfully!');
                fetchCodes();
                setTimeout(() => setCodeMsg(''), 3000);
            } else { setCodeError(data.message || 'Failed to create'); }
        } catch (e: any) { setCodeError('Network error: ' + e.message); }
        setGenerating(false);
    };

    const deleteCode = async (id: string, code: string) => {
        if (!confirm(`Delete code "${code}"?`)) return;
        try {
            const res = await fetch(`${apiUrl}/settings/invite-codes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
            const data = await res.json();
            if (data.success) { fetchCodes(); setCodeMsg('🗑 Code deleted'); setTimeout(() => setCodeMsg(''), 2000); }
            else setCodeError(data.message || 'Delete failed');
        } catch (e: any) { setCodeError(e.message); }
    };

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) return (
        <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    const unusedCodes = codes.filter(c => !c.isUsed);
    const usedCodes = codes.filter(c => c.isUsed);

    return (
        <div className="min-h-screen bg-transparent p-4 lg:p-10 space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
                    Dashboard Overview <span className="text-white/20">Statistics</span>
                </h1>
                <p className="text-white/40 text-sm font-medium">Manage your marketplace performance and seller activities</p>
            </div>

            {/* Alert badges */}
            {stats && (stats.pendingRecharges > 0 || stats.pendingWithdrawals > 0) && (
                <div className="flex flex-wrap gap-4">
                    {stats.pendingRecharges > 0 && (
                        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-3">
                            <AlertCircle size={18} className="text-amber-500" />
                            <span className="text-amber-500 text-sm font-bold">{stats.pendingRecharges} Recharge requests pending</span>
                        </div>
                    )}
                    {stats.pendingWithdrawals > 0 && (
                        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-5 py-3">
                            <AlertCircle size={18} className="text-rose-500" />
                            <span className="text-rose-500 text-sm font-bold">{stats.pendingWithdrawals} Withdrawal requests pending</span>
                        </div>
                    )}
                </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-5">
                <div className="lg:col-span-4"><StatCard icon={Users} label="Total Sellers" value={stats?.totalUsers ?? 0} sub={`+${stats?.newSellers ?? 0} today`} color="#3b82f6" /></div>
                <div className="lg:col-span-4"><StatCard icon={Box} label="Products" value={stats?.totalProducts ?? 0} sub="In storehouse" color="#60a5fa" /></div>
                <div className="lg:col-span-4"><StatCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders ?? 0} sub={`${stats?.ordersThisMonth ?? 0} month`} color="#06b6d4" /></div>
                <div className="lg:col-span-3"><StatCard icon={CreditCard} label="Recharges" value={stats?.totalRecharges ?? 0} sub={`${stats?.pendingRecharges ?? 0} wait`} color="#10b981" /></div>
                <div className="lg:col-span-3"><StatCard icon={ArrowDownCircle} label="Withdrawals" value={stats?.totalWithdrawals ?? 0} sub={`${stats?.pendingWithdrawals ?? 0} wait`} color="#f59e0b" /></div>
                <div className="lg:col-span-3"><StatCard icon={Package} label="Packages" value={stats?.totalPackages ?? 0} sub="Purchased" color="#ec4899" /></div>
                <div className="lg:col-span-3"><StatCard icon={TrendingUp} label="Revenue" value={`₹${(stats?.totalRevenue ?? 0).toFixed(0)}`} sub="Total" color="#14b8a6" /></div>
            </div>

            {/* Sales Chart */}
            <div className="bg-[#020617] border border-white/5 rounded-[32px] p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
                <SalesChart data={chartData} onRangeChange={(r) => setRange(r)} />
            </div>

            {/* ── Activation Code Manager ── */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '32px', padding: '32px 36px',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 0 60px rgba(139,92,246,0.07)'
            }}>
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ padding: '12px', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', borderRadius: '16px', boxShadow: '0 8px 20px rgba(124,58,237,0.4)' }}>
                            <Key size={22} color="white" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'white' }}>Activation Codes</h2>
                            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Single-use — one account per code</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                            <a 
                                href="/admin/dashboard/invite-codes"
                                style={{ 
                                    textDecoration: 'none', fontSize: '10px', fontWeight: '800', 
                                    color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', 
                                    letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '4px',
                                    transition: 'color 0.2s', cursor: 'pointer'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#7c3aed'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                            >
                                View History <TrendingUp size={10} />
                            </a>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <a 
                                    href="/admin/dashboard/invite-codes?tab=available"
                                    style={{ textDecoration: 'none', padding: '7px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', fontSize: '11px', fontWeight: '800', color: '#10b981', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                                >
                                    {unusedCodes.length} Available
                                </a>
                                <a 
                                    href="/admin/dashboard/invite-codes?tab=used"
                                    style={{ textDecoration: 'none', padding: '7px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', fontSize: '11px', fontWeight: '800', color: '#f87171', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                                >
                                    {usedCodes.length} Used
                                </a>
                            </div>
                        </div>
                        <button
                            onClick={generateRandom}
                            disabled={generating}
                            style={{
                                padding: '12px 20px', borderRadius: '14px', cursor: generating ? 'not-allowed' : 'pointer',
                                background: generating ? 'rgba(139,92,246,0.25)' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                                border: 'none', color: 'white', fontWeight: '900', fontSize: '13px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: generating ? 'none' : '0 8px 24px rgba(124,58,237,0.35)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {generating ? <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <RefreshCw size={14} />}
                            {generating ? 'Generating...' : 'Generate Random'}
                        </button>
                    </div>
                </div>

                {/* Display ONLY the latest unused code */}
                {unusedCodes.length > 0 && !codeError && (
                    <div style={{ 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.06)', 
                        borderRadius: '20px', padding: '20px 24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Unlock size={24} className="text-[#34d399]" />
                            </div>
                            <div>
                                <span style={{ fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Latest Available Code</span>
                                <div style={{ fontSize: '28px', fontWeight: '900', color: '#34d399', fontFamily: 'monospace', letterSpacing: '0.15em', marginTop: '2px' }}>
                                    {unusedCodes[0].code}
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => copyCode(unusedCodes[0].code, unusedCodes[0]._id)}
                            style={{ 
                                padding: '10px 20px', borderRadius: '12px', background: copiedId === unusedCodes[0]._id ? '#059669' : 'rgba(52,211,153,0.1)', 
                                color: copiedId === unusedCodes[0]._id ? 'white' : '#34d399', border: 'none', fontWeight: '800', fontSize: '13px',
                                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
                            }}
                        >
                            {copiedId === unusedCodes[0]._id ? <Check size={16} /> : <Copy size={16} />}
                            {copiedId === unusedCodes[0]._id ? 'Copied' : 'Copy Latest'}
                        </button>
                    </div>
                )}

                {(codeMsg || codeError) && (
                    <div style={{ marginTop: '20px' }}>
                        {codeMsg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '11px 16px', fontSize: '13px', fontWeight: '600', color: '#10b981' }}>{codeMsg}</div>}
                        {codeError && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '11px 16px', fontSize: '13px', fontWeight: '600', color: '#f87171' }}>⚠ {codeError}</div>}
                    </div>
                )}

                <style>{`
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                `}</style>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#020617] border border-white/5 rounded-[32px] p-8 lg:p-10 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full" />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
                    {[
                        { label: 'Manage Users', href: '/admin/dashboard/users', color: '#3b82f6', icon: Users },
                        { label: 'Approve Recharges', href: '/admin/dashboard/recharge', color: '#10b981', icon: CreditCard },
                        { label: 'Process Withdrawals', href: '/admin/dashboard/withdraw', color: '#f59e0b', icon: ArrowDownCircle },
                        { label: 'View Orders', href: '/admin/dashboard/orders', color: '#06b6d4', icon: ShoppingCart },
                        { label: 'Activation Codes', href: '/admin/dashboard/invite-codes', color: '#7c3aed', icon: Key },
                        { label: 'Add Products', href: '/admin/dashboard/products', color: '#60a5fa', icon: Box },
                    ].map(a => (
                        <a key={a.href} href={a.href} className="group no-underline">
                            <div className="h-full flex flex-col items-center justify-center gap-3 lg:gap-4 p-4 lg:p-6 rounded-3xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/10 hover:translate-y-[-4px]">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500" style={{ background: `${a.color}15`, border: `1px solid ${a.color}33` }}>
                                    <a.icon size={20} style={{ color: a.color }} />
                                </div>
                                <span className="text-white font-bold text-[11px] lg:text-sm text-center">{a.label}</span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
