'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Package as PackageIcon, RefreshCw, CheckCircle2, Plus, Minus } from 'lucide-react';

const PKG_COLORS: any = {
    'Enterprise Pro': { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)' },
    'Professional Seller': { color: '#a855f7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)' },
    'Starter Merchant': { color: '#9ca3af', bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)' },
};

export default function AdminPackagesPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
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

    const fetchPackages = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/packages?page=${page}&status=all`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (data.success) {
                setPackages(data.packages);
                setTotal(data.total);
                setPages(data.pages);
            }
        } catch (err) {
            console.error('Failed to fetch packages:', err);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchPackages(); }, [fetchPackages]);

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Package Activations</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                        {total} total · Packages activate instantly upon seller purchase — no approval required
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{
                        padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                        background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981',
                        display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                        <CheckCircle2 size={13} /> Auto-Activated
                    </div>
                    <button onClick={fetchPackages} style={{
                        background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '8px', color: '#818cf8', padding: '7px 12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600'
                    }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {[
                    { label: 'Total Purchases', value: total, color: '#a5b4fc' },
                    { label: 'Active Packages', value: packages.filter(p => p.status === 1).length, color: '#10b981' },
                    { label: 'Revenue', value: `$${packages.reduce((s, p) => s + (p.amount || 0), 0).toLocaleString()}`, color: '#f59e0b' }
                ].map(stat => (
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
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '0' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                                <th className="res-show-mobile" style={{ padding: '14px 16px', width: '40px' }}></th>
                                {['#', 'Package', 'Amount', 'Products', 'Seller', 'Shop', 'Status', 'Date'].map((h, i) => (
                                    <th key={h} className={i > 2 ? 'res-hide-mobile' : ''} style={{
                                        padding: '14px 16px', textAlign: 'left', fontSize: '11px',
                                        fontWeight: '700', color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                    <RefreshCw size={20} style={{ margin: '0 auto 8px', display: 'block', animation: 'spin 1s linear infinite' }} />
                                    Loading...
                                </td></tr>
                            ) : packages.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                    <PackageIcon size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                                    No package purchases yet
                                </td></tr>
                            ) : packages.map((pkg, i) => {
                                const pkgStyle = PKG_COLORS[pkg.type] || PKG_COLORS['Starter Merchant'];
                                return (
                                    <React.Fragment key={pkg._id}>
                                        <tr
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <td className="res-show-mobile" style={{ padding: '14px 16px' }}>
                                                <button 
                                                    onClick={() => toggleRow(pkg._id)}
                                                    style={{ border: 'none', background: 'rgba(99,102,241,0.2)', color: '#6366f1', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {expandedRows.has(pkg._id) ? <Minus size={14} /> : <Plus size={14} />}
                                                </button>
                                            </td>
                                            <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{(page - 1) * 20 + i + 1}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                                                    background: pkgStyle.bg, border: `1px solid ${pkgStyle.border}`, color: pkgStyle.color,
                                                    whiteSpace: 'nowrap', display: 'inline-block', minWidth: '120px', textAlign: 'center'
                                                }}>{pkg.type || '—'}</span>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontWeight: '800', color: '#10b981', fontSize: '16px' }}>
                                                ${pkg.amount?.toLocaleString() || '0'}
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                                                {pkg.product_limit >= 1000000 ? '∞ Unlimited' : pkg.product_limit}
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '14px 16px', fontWeight: '600', fontSize: '14px' }}>{pkg.seller?.name || '—'}</td>
                                            <td className="res-hide-mobile" style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{pkg.seller?.shop_name || '—'}</td>
                                            <td className="res-hide-mobile" style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                    background: pkg.status === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
                                                    border: `1px solid ${pkg.status === 1 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
                                                    color: pkg.status === 1 ? '#10b981' : '#f87171',
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px'
                                                }}>
                                                    {pkg.status === 1 ? <><CheckCircle2 size={10} /> Active</> : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                                                {pkg.created_at || pkg.createdAt
                                                    ? new Date(pkg.created_at || pkg.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : '—'}
                                            </td>
                                        </tr>

                                        {expandedRows.has(pkg._id) && (
                                            <tr className="res-show-mobile" style={{ background: 'rgba(99,102,241,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td colSpan={10} style={{ padding: '16px' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '12px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Seller</span>
                                                            <span style={{ fontSize: '13px', color: 'white' }}>{pkg.seller?.name || '—'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Limits</span>
                                                            <span style={{ fontSize: '13px', color: 'white' }}>{pkg.product_limit >= 1000000 ? '∞ Unlimited' : pkg.product_limit} Products</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Status</span>
                                                            <span style={{
                                                                padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                                                                background: pkg.status === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)', color: pkg.status === 1 ? '#10b981' : '#f87171'
                                                            }}>{pkg.status === 1 ? 'Active' : 'Inactive'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Date</span>
                                                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                                                                {pkg.created_at || pkg.createdAt ? new Date(pkg.created_at || pkg.createdAt).toLocaleDateString() : '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{
                                width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                                background: p === page ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
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
