'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminSpreadPackagePurchasesPage() {
    const router = useRouter();
    const [packages, setPackages] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    const fetchPurchases = useCallback(async () => {
        setLoading(true);
        const token = sessionStorage.getItem('adminToken');
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/spread-packages/purchases?page=${page}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (data.success) {
                setPackages(data.packages);
                setTotal(data.total);
                setTotalRevenue(data.totalRevenue);
                setPages(data.pages);
            }
        } catch (err) {
            console.error('Failed to fetch purchases:', err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

    const stats = [
        { label: 'Total Purchases', value: total, color: '#bfdbfe' },
        { label: 'Active Packages', value: packages.filter(p => p.status === 1).length, color: '#10b981' },
        { label: 'Spread Revenue', value: `$${totalRevenue.toLocaleString('en-IN')}`, color: '#f59e0b' }
    ];

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        onClick={() => router.back()}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', padding: '8px', color: 'white', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Spread Package Purchases</h1>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                            Track marketing package acquisitions by sellers
                        </p>
                    </div>
                </div>
                <button onClick={fetchPurchases} style={{
                    background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '8px', color: '#93c5fd', padding: '7px 12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600'
                }}>
                    <RefreshCw size={14} /> Refresh List
                </button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {stats.map(stat => (
                    <div key={stat.label} style={{
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px', padding: '16px'
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                        <div style={{ color: stat.color, fontSize: '24px', fontWeight: '800', marginTop: '4px' }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '14px 16px', width: '40px' }}>#</th>
                                {['Package Type', 'Amount', 'Seller Name', 'Shop Name', 'Status', 'Purchase Date'].map((h) => (
                                    <th key={h} style={{
                                        padding: '14px 16px', textAlign: 'left', fontSize: '11px',
                                        fontWeight: '700', color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                    <RefreshCw size={20} style={{ margin: '0 auto 8px', display: 'block', animation: 'spin 1s linear infinite' }} />
                                    Loading history...
                                </td></tr>
                            ) : packages.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                    <Sparkles size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                                    No spread purchases found
                                </td></tr>
                            ) : packages.map((pkg, i) => (
                                <tr key={pkg._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{(page - 1) * 20 + i + 1}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                                            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa',
                                        }}>{pkg.type.replace('Spread: ', '')}</span>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontWeight: '800', color: '#10b981' }}>
                                        ${pkg.amount?.toLocaleString('en-IN') || '0'}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{pkg.seller?.name || '—'}</td>
                                    <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.5)' }}>{pkg.seller?.shop_name || '—'}</td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                            background: pkg.status === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                                            color: pkg.status === 1 ? '#10b981' : '#f87171',
                                        }}>{pkg.status === 1 ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ color: 'white', fontWeight: '700', fontSize: '13px' }}>
                                            {new Date(pkg.created_at || pkg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                                            {new Date(pkg.created_at || pkg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{
                                width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                                background: p === page ? 'linear-gradient(135deg, #3b82f6, #60a5fa)' : 'rgba(255,255,255,0.06)',
                                color: p === page ? 'white' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                            }}>{p}</button>
                        ))}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
