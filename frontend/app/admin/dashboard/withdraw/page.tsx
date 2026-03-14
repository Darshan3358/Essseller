'use client';

import React from 'react';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, RefreshCw, Building2, ChevronDown, ChevronUp, Clock, AlertCircle, Plus, Minus } from 'lucide-react';

const STATUS_MAP: any = {
    0: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
    1: { label: 'Approved', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
    2: { label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
};

const OP_TYPE: any = { 1: 'Bank Transfer', 2: 'USDT', 3: 'Package' };

export default function AdminWithdrawPage() {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('0'); // default to Pending
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<{ id: string; amount: number; seller: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [mobileExpandedRows, setMobileExpandedRows] = useState<Set<string>>(new Set());

    const toggleMobileRow = (id: string) => {
        const newExpanded = new Set(mobileExpandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setMobileExpandedRows(newExpanded);
    };
    const [successMsg, setSuccessMsg] = useState('');

    const fetchWithdrawals = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals?page=${page}&status=${statusFilter}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (data.success) {
                setWithdrawals(data.withdrawals);
                setTotal(data.total);
                setPages(data.pages);
            }
        } catch (err) {
            console.error('Failed to fetch withdrawals:', err);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

    const handleStatus = async (id: string, status: number, reason?: string) => {
        setActionLoading(id);
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/withdrawals/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status, reason })
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg(data.message || (status === 1 ? 'Withdrawal approved!' : 'Withdrawal rejected!'));
                setTimeout(() => setSuccessMsg(''), 3000);
            }
        } catch (err) {
            console.error('Action failed:', err);
        }
        await fetchWithdrawals();
        setActionLoading(null);
        setRejectModal(null);
        setRejectReason('');
    };

    const pendingCount = statusFilter === 'all' ? withdrawals.filter(w => w.status === 0).length : (statusFilter === '0' ? total : 0);

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Withdrawal Requests</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                        {total} total • Review and approve/reject seller withdrawal requests
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[
                        { val: '0', label: '⏳ Pending' },
                        { val: '1', label: '✅ Approved' },
                        { val: '2', label: '❌ Rejected' },
                        { val: 'all', label: 'All' }
                    ].map(f => (
                        <button key={f.val} onClick={() => { setStatusFilter(f.val); setPage(1); }} style={{
                            padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                            border: statusFilter === f.val ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
                            background: statusFilter === f.val ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                            color: statusFilter === f.val ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer'
                        }}>{f.label}</button>
                    ))}
                    <button onClick={fetchWithdrawals} style={{
                        background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '8px', color: '#818cf8', padding: '7px 10px', cursor: 'pointer', display: 'flex'
                    }}><RefreshCw size={15} /></button>
                </div>
            </div>

            {/* Success Banner */}
            {successMsg && (
                <div style={{
                    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                    borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
                    color: '#10b981', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <CheckCircle size={16} /> {successMsg}
                </div>
            )}

            {/* Pending alert if any */}
            {statusFilter === '0' && total > 0 && (
                <div style={{
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
                    color: '#f59e0b', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <Clock size={15} /> {total} pending withdrawal request{total > 1 ? 's' : ''} awaiting your review
                </div>
            )}

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
                                {['#', 'Seller', 'Amount', 'Method', 'Bank Details', 'Status', 'Date', 'Actions'].map((h, i) => (
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
                                <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                    <RefreshCw size={20} style={{ margin: '0 auto 8px', display: 'block', animation: 'spin 1s linear infinite' }} />
                                    Loading...
                                </td></tr>
                            ) : withdrawals.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                    <AlertCircle size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                                    No withdrawals found
                                </td></tr>
                            ) : withdrawals.map((w, i) => {
                                const s = STATUS_MAP[w.status] || STATUS_MAP[0];
                                const isExpanded = expandedRow === w._id;
                                const hasBankDetails = !!(w.bank_details && (w.bank_details.account_number || w.bank_details.upi_id));
                                return (
                                    <React.Fragment key={w._id}>
                                        <tr
                                            style={{ borderBottom: isExpanded || mobileExpandedRows.has(w._id) ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <td className="res-show-mobile" style={{ padding: '14px 16px' }}>
                                                <button 
                                                    onClick={() => toggleMobileRow(w._id)}
                                                    style={{ border: 'none', background: 'rgba(99,102,241,0.2)', color: '#6366f1', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {mobileExpandedRows.has(w._id) ? <Minus size={14} /> : <Plus size={14} />}
                                                </button>
                                            </td>
                                            <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{(page - 1) * 20 + i + 1}</td>

                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: '600', fontSize: '14px' }}>{w.seller?.name || 'Unknown'}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{w.seller?.email || ''}</div>
                                                <div className="res-hide-mobile" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px' }}>{w.seller?.shop_name || ''}</div>
                                            </td>

                                            <td style={{ padding: '14px 16px', fontWeight: '800', fontSize: '18px' }}>
                                                <span style={{ color: '#f59e0b' }}>₹{(w.amount || 0).toLocaleString('en-IN')}</span>
                                            </td>

                                            <td className="res-hide-mobile" style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                                                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc'
                                                }}>{OP_TYPE[w.op_type] || 'Bank'}</span>
                                            </td>

                                            <td className="res-hide-mobile" style={{ padding: '14px 16px' }}>
                                                {hasBankDetails ? (
                                                    <button onClick={() => setExpandedRow(isExpanded ? null : w._id)} style={{
                                                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                                                        borderRadius: '8px', color: '#10b981', padding: '5px 10px', cursor: 'pointer',
                                                        fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'
                                                    }}>
                                                        <Building2 size={12} /> View {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                                    </button>
                                                ) : (
                                                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>—</span>
                                                )}
                                            </td>

                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                    background: s.bg, border: `1px solid ${s.border}`, color: s.color
                                                }}>{s.label}</span>
                                            </td>

                                            <td className="res-hide-mobile" style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                                                {w.createdAt ? new Date(w.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                                <div style={{ fontSize: '10px', marginTop: '2px', color: 'rgba(255,255,255,0.2)' }}>
                                                    {w.createdAt ? new Date(w.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </div>
                                            </td>

                                            <td style={{ padding: '14px 16px' }}>
                                                {w.status === 0 ? (
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            onClick={() => handleStatus(w._id, 1)}
                                                            disabled={actionLoading === w._id}
                                                            data-tooltip="Approve Withdrawal"
                                                            style={{
                                                                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)',
                                                                borderRadius: '8px', padding: '7px 10px', cursor: actionLoading === w._id ? 'not-allowed' : 'pointer',
                                                                color: '#10b981', display: 'flex', alignItems: 'center', opacity: actionLoading === w._id ? 0.6 : 1
                                                            }}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setRejectModal({ id: w._id, amount: w.amount, seller: w.seller?.name || 'Seller' })}
                                                            disabled={actionLoading === w._id}
                                                            data-tooltip="Reject Withdrawal"
                                                            style={{
                                                                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                                                                borderRadius: '8px', padding: '7px 10px', cursor: actionLoading === w._id ? 'not-allowed' : 'pointer',
                                                                color: '#f87171', display: 'flex', alignItems: 'center', opacity: actionLoading === w._id ? 0.6 : 1
                                                            }}
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span style={{ color: w.status === 1 ? '#10b981' : '#f87171', fontSize: '12px', fontWeight: '600' }}>
                                                            {w.status === 1 ? '✅ Approved' : '❌ Rejected'}
                                                        </span>
                                                        {w.reason && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '2px' }}>{w.reason}</div>}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Mobile expanded row */}
                                        {mobileExpandedRows.has(w._id) && (
                                            <tr className="res-show-mobile" style={{ background: 'rgba(99,102,241,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td colSpan={10} style={{ padding: '16px' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '12px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Shop</span>
                                                            <span style={{ fontSize: '13px', color: 'white' }}>{w.seller?.shop_name || '—'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Method</span>
                                                            <span style={{ fontSize: '13px', color: 'white' }}>{OP_TYPE[w.op_type] || 'Bank'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Date</span>
                                                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                                                                {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '—'}
                                                            </span>
                                                        </div>
                                                        {hasBankDetails && (
                                                            <div style={{ marginTop: '4px' }}>
                                                                <button onClick={() => setExpandedRow(isExpanded ? null : w._id)} style={{
                                                                    width: '100%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                                                                    borderRadius: '8px', padding: '10px', color: '#10b981', cursor: 'pointer', fontSize: '12px', fontWeight: '800'
                                                                }}>
                                                                    {isExpanded ? '▲ Hide Bank Details' : '▼ View Bank Details'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}

                                        {/* Expanded Bank Details Row */}
                                        {isExpanded && (
                                            <tr key={`${w._id}-details`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td colSpan={8} style={{ padding: '0 16px 16px 60px' }}>
                                                    <div style={{
                                                        background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
                                                        borderRadius: '12px', padding: '16px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                            <Building2 size={14} style={{ color: '#10b981' }} />
                                                            <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '700' }}>Bank Account Details for Transfer</span>
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                                            {w.bank_details?.bank_name && (
                                                                <div>
                                                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>Bank Name</div>
                                                                    <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{w.bank_details.bank_name}</div>
                                                                </div>
                                                            )}
                                                            {w.bank_details?.account_name && (
                                                                <div>
                                                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>Account Holder</div>
                                                                    <div style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{w.bank_details.account_name}</div>
                                                                </div>
                                                            )}
                                                            {w.bank_details?.account_number && (
                                                                <div>
                                                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>Account Number</div>
                                                                    <div style={{ color: '#f59e0b', fontSize: '14px', fontWeight: '700', letterSpacing: '1px' }}>
                                                                        {w.bank_details.account_number}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {w.bank_details?.ifsc_code && (
                                                                <div>
                                                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>IFSC Code</div>
                                                                    <div style={{ color: '#a5b4fc', fontSize: '14px', fontWeight: '700' }}>{w.bank_details.ifsc_code}</div>
                                                                </div>
                                                            )}
                                                            {w.bank_details?.upi_id && (
                                                                <div>
                                                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>UPI ID</div>
                                                                    <div style={{ color: '#34d399', fontSize: '14px', fontWeight: '700' }}>{w.bank_details.upi_id}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {w.notes && (
                                                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '3px' }}>Notes</div>
                                                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{w.notes}</div>
                                                            </div>
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

            {/* Reject Modal */}
            {rejectModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#1e1b4b', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '420px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <XCircle size={20} style={{ color: '#f87171' }} />
                            <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '700' }}>Reject Withdrawal</h3>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '20px' }}>
                            Rejecting ₹{rejectModal.amount?.toLocaleString('en-IN')} request from <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{rejectModal.seller}</strong>
                        </p>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase' }}>
                            Reason for Rejection (visible to seller)
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="e.g. Insufficient balance verification, invalid bank details..."
                            style={{
                                width: '100%', padding: '12px', background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                color: 'white', fontSize: '14px', minHeight: '100px', outline: 'none',
                                resize: 'vertical', boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                            <button onClick={() => { setRejectModal(null); setRejectReason(''); }} style={{
                                flex: 1, padding: '12px', background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                            }}>Cancel</button>
                            <button onClick={() => handleStatus(rejectModal.id, 2, rejectReason)} style={{
                                flex: 1, padding: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                border: 'none', borderRadius: '10px', color: 'white',
                                cursor: 'pointer', fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                            }}>
                                <XCircle size={14} /> Confirm Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
