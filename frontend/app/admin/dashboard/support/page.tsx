'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FileText, MessageSquare, Clock, CheckCircle2, AlertCircle, RefreshCw, X, MessageCircle } from 'lucide-react';

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [remark, setRemark] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [mobileExpandedRows, setMobileExpandedRows] = useState<Set<string>>(new Set());

    const toggleMobileRow = (id: string) => {
        const next = new Set(mobileExpandedRows);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setMobileExpandedRows(next);
    };

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setTickets(data.data);
                setTotal(data.data.length);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleUpdate = async (status?: string) => {
        if (!selectedTicket) return;
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/support/${selectedTicket._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ remark, status })
            });
            const data = await res.json();
            if (data.success) {
                setSelectedTicket(null);
                setRemark('');
                fetchTickets();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Support Tickets</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>{total} total requests</p>
                </div>
                <button onClick={fetchTickets} style={{
                    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '8px', color: '#818cf8', padding: '10px', cursor: 'pointer', display: 'flex'
                }}><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></button>
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '0' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(99,102,241,0.08)' }}>
                                <th className="res-show-mobile" style={{ padding: '14px 16px', width: '40px' }}></th>
                                {['TID', 'Seller', 'Subject', 'Priority', 'Status', 'Date', 'Action'].map((h, i) => (
                                    <th key={h} className={i === 0 || i === 2 || i === 3 || i === 5 ? 'res-hide-mobile' : ''} style={{
                                        padding: '14px 16px', textAlign: 'left', fontSize: '11px',
                                        fontWeight: '700', color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '50px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No tickets found</td></tr>
                            ) : (
                                tickets.map((tkt) => {
                                    const isExpanded = mobileExpandedRows.has(tkt._id);
                                    return (
                                        <React.Fragment key={tkt._id ?? Math.random()}>
                                            <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <td className="res-show-mobile" style={{ padding: '14px 16px' }}>
                                                    <button 
                                                        onClick={() => toggleMobileRow(tkt._id)}
                                                        style={{ border: 'none', background: 'rgba(99,102,241,0.2)', color: '#818cf8', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex' }}
                                                    >
                                                        {isExpanded ? <AlertCircle size={14} /> : <MessageSquare size={14} />}
                                                    </button>
                                                </td>
                                                <td className="res-hide-mobile" style={{ padding: '14px 16px', fontSize: '11px', fontWeight: '700', color: '#818cf8' }}>
                                                    {tkt._id ? tkt._id.slice(-6).toUpperCase() : 'N/A'}
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{tkt.seller_id?.name || 'Unknown'}</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{tkt.seller_id?.email || ''}</div>
                                                </td>
                                                <td className="res-hide-mobile" style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '500' }}>{tkt.subject}</td>
                                                <td className="res-hide-mobile" style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                                                        background: tkt.priority === 'High' ? 'rgba(239,68,68,0.1)' : tkt.priority === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(107,114,128,0.1)',
                                                        color: tkt.priority === 'High' ? '#f87171' : tkt.priority === 'Medium' ? '#fbbf24' : '#9ca3af',
                                                        border: `1px solid ${tkt.priority === 'High' ? 'rgba(239,68,68,0.2)' : tkt.priority === 'Medium' ? 'rgba(245,158,11,0.2)' : 'rgba(107,114,128,0.2)'}`
                                                    }}>{tkt.priority}</span>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{
                                                        padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700',
                                                        background: tkt.status === 'Resolved' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                                                        color: tkt.status === 'Resolved' ? '#10b981' : '#818cf8',
                                                        border: `1px solid ${tkt.status === 'Resolved' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}`
                                                    }}>{tkt.status}</span>
                                                </td>
                                                <td className="res-hide-mobile" style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                                                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>
                                                        {tkt.createdAt ? new Date(tkt.createdAt).toLocaleDateString() : '—'}
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                                                        {tkt.createdAt ? new Date(tkt.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <button
                                                        onClick={() => { setSelectedTicket(tkt); setRemark(tkt.remark || ''); }}
                                                        data-tooltip="Manage Ticket"
                                                        style={{
                                                            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                                            borderRadius: '8px', color: '#818cf8', padding: '7px 10px', cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}
                                                    >
                                                        <MessageCircle size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr className="res-show-mobile" style={{ background: 'rgba(99,102,241,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td colSpan={10} style={{ padding: '16px' }}>
                                                        <div style={{ display: 'grid', gap: '8px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ fontSize: '10px', opacity: 0.4, textTransform: 'uppercase' }}>TID</span>
                                                                <span style={{ fontSize: '12px', color: '#818cf8', fontWeight: '700' }}>{tkt._id?.toUpperCase()}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <span style={{ fontSize: '10px', opacity: 0.4, textTransform: 'uppercase' }}>Subject</span>
                                                                <span style={{ fontSize: '13px' }}>{tkt.subject}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontSize: '10px', opacity: 0.4, textTransform: 'uppercase' }}>Priority</span>
                                                                <span style={{
                                                                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800',
                                                                    background: tkt.priority === 'High' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                                                    color: tkt.priority === 'High' ? '#f87171' : '#fbbf24'
                                                                }}>{tkt.priority}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ fontSize: '10px', opacity: 0.4, textTransform: 'uppercase' }}>Date</span>
                                                                <span style={{ fontSize: '12px', opacity: 0.6 }}>{tkt.createdAt ? new Date(tkt.createdAt).toLocaleString() : '—'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manage Modal */}
            {selectedTicket && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }} onClick={() => setSelectedTicket(null)}>
                    <div style={{
                        background: '#1e1b4b', border: '1px solid rgba(99,102,241,0.3)',
                        borderRadius: '24px', width: '100%', maxWidth: '500px', overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Manage Ticket</h3>
                            <button onClick={() => setSelectedTicket(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '8px' }}>Description</p>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.6 }}>
                                    {selectedTicket.description}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '8px' }}>Admin Remark / Reply</p>
                                <textarea
                                    value={remark}
                                    onChange={e => setRemark(e.target.value)}
                                    placeholder="Add your response here..."
                                    style={{
                                        width: '100%', minHeight: '120px', background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                        color: 'white', padding: '12px', fontSize: '14px', outline: 'none', resize: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleUpdate('In Progress')}
                                    disabled={isUpdating}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.3)',
                                        background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: '700', cursor: 'pointer'
                                    }}
                                >Update Remark</button>
                                <button
                                    onClick={() => handleUpdate('Resolved')}
                                    disabled={isUpdating}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                                        background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontWeight: '800', cursor: 'pointer'
                                    }}
                                >Resolve Case</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
