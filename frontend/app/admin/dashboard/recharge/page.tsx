'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, RefreshCw, Filter, Plus, Minus } from 'lucide-react';

const STATUS_MAP: any = {
    0: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },
    1: { label: 'Approved', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
    2: { label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
};

export default function AdminRechargePage() {
    const [recharges, setRecharges] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [mobileExpandedRows, setMobileExpandedRows] = useState<Set<string>>(new Set());

    const toggleMobileRow = (id: string) => {
        const newExpanded = new Set(mobileExpandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setMobileExpandedRows(newExpanded);
    };

    const fetchRecharges = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const url = `${process.env.NEXT_PUBLIC_API_URL}/admin/recharges?page=${page}&status=${statusFilter}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
            setRecharges(data.recharges);
            setTotal(data.total);
            setPages(data.pages);
        }
        setLoading(false);
    }, [page, statusFilter]);

    useEffect(() => { fetchRecharges(); }, [fetchRecharges]);

    const handleStatus = async (id: string, status: number, reason?: string) => {
        setActionLoading(id);
        const token = localStorage.getItem('adminToken');
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/recharges/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status, reason })
        });
        await fetchRecharges();
        setActionLoading(null);
        setRejectModal(null);
        setRejectReason('');
    };

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Recharge Requests</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>{total} total requests</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Filter buttons */}
                    {[{ val: 'all', label: 'All' }, { val: '0', label: 'Pending' }, { val: '1', label: 'Approved' }, { val: '2', label: 'Rejected' }].map(f => (
                        <button key={f.val} onClick={() => { setStatusFilter(f.val); setPage(1); }} style={{
                            padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                            border: statusFilter === f.val ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            background: statusFilter === f.val ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                            color: statusFilter === f.val ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer'
                        }}>{f.label}</button>
                    ))}
                    <button onClick={fetchRecharges} style={{
                        background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '8px', color: '#818cf8', padding: '7px 10px', cursor: 'pointer', display: 'flex'
                    }}><RefreshCw size={15} /></button>
                </div>
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '0' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <th className="res-show-mobile" style={{ padding: '14px 16px', width: '40px' }}></th>
                                {['#', 'Seller', 'Amount', 'Method', 'Status', 'Date', 'Proof', 'Actions'].map((h, i) => (
                                    <th key={h} className={i > 2 && i < 7 ? 'res-hide-mobile' : ''} style={{
                                        padding: '14px 16px', textAlign: 'left', fontSize: '11px',
                                        fontWeight: '700', color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ padding: '50px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading...</td></tr>
                            ) : recharges.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '50px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No recharges found</td></tr>
                            ) : recharges.map((r, i) => {
                                const s = STATUS_MAP[r.status] || STATUS_MAP[0];
                                return (
                                     <React.Fragment key={r._id}>
                                        <tr
                                            style={{ borderBottom: expandedRow === r._id || mobileExpandedRows.has(r._id) ? 'none' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <td className="res-show-mobile" style={{ padding: '14px 16px' }}>
                                                <button 
                                                    onClick={() => toggleMobileRow(r._id)}
                                                    style={{ border: 'none', background: 'rgba(99,102,241,0.2)', color: '#6366f1', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {mobileExpandedRows.has(r._id) ? <Minus size={14} /> : <Plus size={14} />}
                                                </button>
                                            </td>
                                            <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{(page - 1) * 20 + i + 1}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                                    {r.seller_id?.name || r.seller?.name || 'Unknown'}
                                                </div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
                                                    {r.seller_id?.email || r.seller?.email || ''}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontWeight: '700', color: '#10b981', fontSize: '16px' }}>
                                                ${parseFloat(r.amount || '0').toFixed(2)}
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                    background: r.payment_method === 'bank' ? 'rgba(59,130,246,0.15)' : 'rgba(99,102,241,0.15)',
                                                    border: `1px solid ${r.payment_method === 'bank' ? 'rgba(59,130,246,0.3)' : 'rgba(99,102,241,0.3)'}`,
                                                    color: r.payment_method === 'bank' ? '#60a5fa' : '#a5b4fc'
                                                }}>
                                                    {r.payment_method === 'bank' ? '🏦 Bank' : '₿ Crypto'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                                                    background: s.bg, border: `1px solid ${s.border}`, color: s.color
                                                }}>{s.label}</span>
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>
                                                    {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) :
                                                        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                                                </div>
                                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                                                    {r.created_at ? new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) :
                                                        r.createdAt ? new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '14px 16px' }}>
                                                <button onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)} style={{
                                                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                                    borderRadius: '8px', padding: '5px 10px', color: '#a5b4fc',
                                                    cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                                                }}>
                                                    {expandedRow === r._id ? '▲ Hide' : '▼ Proof'}
                                                </button>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                {r.status === 0 ? (
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            onClick={() => handleStatus(r._id, 1)}
                                                            disabled={actionLoading === r._id}
                                                            data-tooltip="Approve Recharge"
                                                            style={{
                                                                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                                                                borderRadius: '8px', padding: '7px 10px', cursor: 'pointer',
                                                                color: '#10b981', display: 'flex', alignItems: 'center',
                                                                opacity: actionLoading === r._id ? 0.6 : 1
                                                            }}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectModal({ id: r._id })}
                                                            disabled={actionLoading === r._id}
                                                            data-tooltip="Reject Recharge"
                                                            style={{
                                                                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                                                                borderRadius: '8px', padding: '7px 10px', cursor: 'pointer',
                                                                color: '#f87171', display: 'flex', alignItems: 'center',
                                                                opacity: actionLoading === r._id ? 0.6 : 1
                                                            }}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                                                        {r.reason || 'Done'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                        {/* Mobile expanded row */}
                                        {mobileExpandedRows.has(r._id) && (
                                            <tr className="res-show-mobile" style={{ background: 'rgba(99,102,241,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td colSpan={10} style={{ padding: '16px' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '12px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Method</span>
                                                            <span style={{ fontSize: '13px', color: 'white' }}>{r.payment_method === 'bank' ? '🏦 Bank' : '₿ Crypto'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Date</span>
                                                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                                                                {r.created_at ? new Date(r.created_at).toLocaleDateString() : (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—')}
                                                            </span>
                                                        </div>
                                                        <div style={{ marginTop: '4px' }}>
                                                            <button onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)} style={{
                                                                width: '100%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                                                borderRadius: '8px', padding: '10px', color: '#a5b4fc', cursor: 'pointer', fontSize: '12px', fontWeight: '800'
                                                            }}>
                                                                {expandedRow === r._id ? '▲ Hide Proof Details' : '▼ View Proof Details'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        {/* Expandable proof row */}
                                        {expandedRow === r._id && (
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td colSpan={8} style={{ padding: '0 16px 16px 48px' }}>
                                                    <div style={{
                                                        background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
                                                        borderRadius: '12px', padding: '16px',
                                                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px'
                                                    }}>
                                                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', gridColumn: '1 / -1', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Payment Proof Details</div>
                                                        {[
                                                            { label: 'Sender Wallet / From', value: r.sender_wallet },
                                                            { label: 'Transaction Hash / TxID', value: r.txn_hash },
                                                            { label: 'Bank UTR / Reference', value: r.bank_reference },
                                                            { label: 'Network', value: r.network },
                                                        ].map(field => field.value ? (
                                                            <div key={field.label}>
                                                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>{field.label}</div>
                                                                <div style={{ color: 'white', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all', fontWeight: '600' }}>{field.value}</div>
                                                            </div>
                                                        ) : null)}
                                                        {!r.sender_wallet && !r.txn_hash && !r.bank_reference && (
                                                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>No proof submitted yet</div>
                                                        )}
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

            {/* Reject Modal */}
            {rejectModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#1e1b4b', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '400px'
                    }}>
                        <h3 style={{ margin: '0 0 16px', color: 'white', fontSize: '18px', fontWeight: '700' }}>Reject Recharge</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 16px' }}>Provide a reason for rejection:</p>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            style={{
                                width: '100%', padding: '12px', background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                color: 'white', fontSize: '14px', minHeight: '100px', outline: 'none',
                                resize: 'vertical', boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                            <button onClick={() => setRejectModal(null)} style={{
                                flex: 1, padding: '11px', background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: '600'
                            }}>Cancel</button>
                            <button
                                onClick={() => handleStatus(rejectModal.id, 2, rejectReason)}
                                style={{
                                    flex: 1, padding: '11px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: '700'
                                }}
                            >Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
