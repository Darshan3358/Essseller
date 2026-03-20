'use client';

import { useEffect, useState } from 'react';
import { Users, Package, CreditCard, ArrowDownCircle, ShoppingCart, Box, TrendingUp, Clock, AlertCircle, RefreshCw, Copy, Check, Key, Trash2, Plus, Lock, Unlock } from 'lucide-react';
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
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all duration-500" style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
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

    // Invite codes state
    const [codes, setCodes] = useState<any[]>([]);
    const [codesLoading, setCodesLoading] = useState(false);
    const [newCodeInput, setNewCodeInput] = useState('');
    const [newCodeLabel, setNewCodeLabel] = useState('');
    const [creating, setCreating] = useState(false);
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
            const data = await res.json();
            if (data.success) setCodes(data.codes);
        } catch (e) { console.error(e); }
        setCodesLoading(false);
    };

    const generateRandom = async () => {
        const prefixes = ['LKC', 'ESS', 'REF', 'ACT', 'VIP'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const generated = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
        setNewCodeInput(generated);
        setCodeMsg(''); setCodeError('');

        // Auto-save immediately
        setCreating(true);
        try {
            const res = await fetch(`${apiUrl}/settings/invite-codes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ code: generated, label: newCodeLabel.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setCodeMsg(`✅ Activation code updated successfully!`);
                setNewCodeInput(''); setNewCodeLabel('');
                fetchCodes();
            } else { setCodeError(data.message || 'Failed to create'); }
        } catch (e: any) { setCodeError(e.message); }
        setCreating(false);
    };

    const createCode = async () => {
        setCreating(true); setCodeMsg(''); setCodeError('');
        try {
            const res = await fetch(`${apiUrl}/settings/invite-codes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ code: newCodeInput.trim().toUpperCase() || undefined, label: newCodeLabel.trim() })
            });
            const data = await res.json();
            if (data.success) {
                setCodeMsg(`✅ Code "${data.data.code}" created!`);
                setNewCodeInput(''); setNewCodeLabel('');
                fetchCodes();
            } else { setCodeError(data.message || 'Failed to create'); }
        } catch (e: any) { setCodeError(e.message); }
        setCreating(false);
    };

    const deleteCode = async (id: string, code: string) => {
        if (!confirm(`Delete code "${code}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${apiUrl}/settings/invite-codes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
            const data = await res.json();
            if (data.success) { setCodeMsg('🗑 Code deleted'); fetchCodes(); }
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

            {/* ── Single-Use Activation Code Manager ── */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: '32px', padding: '32px 36px',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 0 60px rgba(139,92,246,0.07)'
            }}>
                <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ padding: '12px', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', borderRadius: '16px', boxShadow: '0 8px 20px rgba(124,58,237,0.4)' }}>
                            <Key size={22} color="white" />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'white' }}>Activation Codes</h2>
                            <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                                Each code is single-use — one account per code
                            </p>
                        </div>
                    </div>
                    {/* Summary badges */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ padding: '6px 14px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#10b981' }}>
                            {unusedCodes.length} Available
                        </div>
                        <div style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#f87171' }}>
                            {usedCodes.length} Used
                        </div>
                    </div>
                </div>

                {/* Create New Code */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Generate New Code</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                            value={newCodeInput}
                            onChange={e => { setNewCodeInput(e.target.value.toUpperCase()); setCodeMsg(''); setCodeError(''); }}
                            placeholder="e.g. LKC1234 (leave blank to auto-generate)"
                            maxLength={16}
                            style={{
                                flex: 2, minWidth: '180px', padding: '12px 16px',
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', color: 'white', fontSize: '15px', fontWeight: '700',
                                fontFamily: 'monospace', letterSpacing: '0.1em', outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                        <input
                            value={newCodeLabel}
                            onChange={e => setNewCodeLabel(e.target.value)}
                            placeholder="Label (e.g. 'For Rahul')"
                            style={{
                                flex: 1, minWidth: '140px', padding: '12px 16px',
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                            }}
                        />
                        <button onClick={generateRandom} style={{
                            padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
                            color: '#60a5fa', fontWeight: '700', fontSize: '12px',
                            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap'
                        }}>
                            <RefreshCw size={13} /> Random
                        </button>
                        <button onClick={createCode} disabled={creating} style={{
                            padding: '12px 20px', borderRadius: '10px', cursor: creating ? 'not-allowed' : 'pointer',
                            background: creating ? 'rgba(139,92,246,0.2)' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                            border: 'none', color: 'white', fontWeight: '800', fontSize: '13px',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: creating ? 'none' : '0 4px 14px rgba(124,58,237,0.4)'
                        }}>
                            {creating ? <div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> : <Plus size={13} />}
                            {creating ? 'Creating...' : 'Create Code'}
                        </button>
                    </div>
                    {codeMsg && <div style={{ marginTop: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', fontWeight: '600', color: '#10b981' }}>{codeMsg}</div>}
                    {codeError && <div style={{ marginTop: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', fontWeight: '600', color: '#f87171' }}>⚠ {codeError}</div>}
                </div>

                {/* Code List */}
                {codesLoading ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading codes...</div>
                ) : codes.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '14px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                        No codes yet. Create your first activation code above.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Available codes first */}
                        {unusedCodes.length > 0 && (
                            <>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Unlock size={11} /> Available ({unusedCodes.length})
                                </div>
                                {unusedCodes.map(c => (
                                    <div key={c._id} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
                                        borderRadius: '12px', padding: '12px 16px', flexWrap: 'wrap'
                                    }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: '900', color: '#34d399', letterSpacing: '0.1em', flex: 1, minWidth: '100px' }}>{c.code}</span>
                                        {c.label && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>{c.label}</span>}
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={10} /> {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </span>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => copyCode(c.code, c._id)} style={{
                                                padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                                                background: copiedId === c._id ? 'rgba(16,185,129,0.15)' : 'rgba(52,211,153,0.1)',
                                                color: copiedId === c._id ? '#10b981' : '#34d399',
                                                fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px'
                                            }}>
                                                {copiedId === c._id ? <Check size={11} /> : <Copy size={11} />}
                                                {copiedId === c._id ? 'Copied' : 'Copy'}
                                            </button>
                                            <button onClick={() => deleteCode(c._id, c.code)} style={{
                                                padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                                                background: 'rgba(239,68,68,0.08)', color: '#f87171',
                                                display: 'flex', alignItems: 'center'
                                            }}>
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* Used codes */}
                        {usedCodes.length > 0 && (
                            <>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '16px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Lock size={11} /> Used ({usedCodes.length})
                                </div>
                                {usedCodes.map(c => (
                                    <div key={c._id} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: '12px', padding: '12px 16px', flexWrap: 'wrap', opacity: 0.7
                                    }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textDecoration: 'line-through', flex: 1, minWidth: '100px' }}>{c.code}</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            {c.usedBy && <span style={{ fontSize: '11px', color: '#f87171', fontWeight: '600' }}>Used by: {c.usedBy}</span>}
                                            {c.usedAt && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>
                                                {new Date(c.usedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>}
                                        </div>
                                        <button onClick={() => deleteCode(c._id, c.code)} style={{
                                            padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', border: 'none',
                                            background: 'rgba(239,68,68,0.06)', color: 'rgba(248,113,113,0.5)',
                                            display: 'flex', alignItems: 'center'
                                        }}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}

                <p style={{ margin: '20px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.18)', lineHeight: '1.6' }}>
                    🔒 Each code works for exactly one registration. Once used, it is automatically locked. Share codes individually with new sellers.
                </p>
            </div>

            {/* Quick Actions */}
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
                            <div className="h-full flex flex-col items-center justify-center gap-3 lg:gap-4 p-4 lg:p-6 rounded-3xl border border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/10 hover:border-white/10 hover:translate-y-[-4px]">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110" style={{ background: `${a.color}15`, border: `1px solid ${a.color}33` }}>
                                    <Package size={18} className="lg:hidden" style={{ color: a.color }} />
                                    <Package size={20} className="hidden lg:block" style={{ color: a.color }} />
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
