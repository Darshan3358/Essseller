'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, Shield, ShieldOff, CheckCircle, XCircle, RefreshCw, Package, Edit, X, Plus, Minus, Edit2 } from 'lucide-react';
import React from 'react';

function Badge({ children, color }: any) {
    const colors: any = {
        green: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
        red: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
        yellow: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
        gray: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)', text: 'rgba(255,255,255,0.5)' },
    };
    const c = colors[color] || colors.gray;
    return (
        <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
            background: c.bg, border: `1px solid ${c.border}`, color: c.text
        }}>{children}</span>
    );
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users?page=${page}&keyword=${keyword}&status=${statusFilter}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
            setUsers(data.users);
            setTotal(data.total);
            setPages(data.pages);
        }
        setLoading(false);
    }, [page, keyword, statusFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleAction = async (id: string, updates: any) => {
        setActionLoading(id);
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (!data.success) {
                alert('Action failed: ' + (data.message || 'Unknown error'));
            }
        } catch (e: any) {
            alert('Network error: ' + e.message);
        }
        await fetchUsers();
        setActionLoading(null);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        setActionLoading(id);
        const token = localStorage.getItem('adminToken');
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
        await fetchUsers();
        setActionLoading(null);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError('');
        setSaveSuccess('');
        setActionLoading(editingUser._id);
        const token = localStorage.getItem('adminToken');
        try {
            const payload: any = {
                name: editingUser.name,
                email: editingUser.email,
                shop_name: editingUser.shop_name,
            };
            // Only send balance if it was provided
            if (editingUser.wallet_balance !== '' && editingUser.wallet_balance !== undefined) {
                payload.wallet_balance = Number(editingUser.wallet_balance);
            }
            if (editingUser.guarantee_balance !== '' && editingUser.guarantee_balance !== undefined) {
                payload.guarantee_balance = Number(editingUser.guarantee_balance);
            }
            if (editingUser.store_health !== '' && editingUser.store_health !== undefined) {
                payload.store_health = Number(editingUser.store_health);
            }
            if (editingUser.store_performance !== undefined) {
                payload.store_performance = editingUser.store_performance;
            }
            if (editingUser.store_status !== undefined) {
                payload.store_status = editingUser.store_status;
            }
            // Only send passwords if admin filled them in
            if (editingUser.password && editingUser.password.trim() !== '') {
                payload.password = editingUser.password.trim();
            }
            if (editingUser.trans_password && editingUser.trans_password.trim() !== '') {
                payload.trans_password = editingUser.trans_password.trim();
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${editingUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setSaveSuccess('User updated successfully!');
                await fetchUsers();
                setTimeout(() => {
                    setEditingUser(null);
                    setSaveSuccess('');
                }, 1200);
            } else {
                setSaveError(data.message || 'Failed to update user');
            }
        } catch (e: any) {
            setSaveError('Network error: ' + e.message);
        }
        setActionLoading(null);
    };

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Manage Users</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>{total} total sellers</p>
                </div>
                <button onClick={fetchUsers} style={{
                    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '10px', color: '#818cf8', padding: '8px 12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600'
                }}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input
                        value={keyword}
                        onChange={e => { setKeyword(e.target.value); setPage(1); }}
                        placeholder="Search by name, email, shop..."
                        style={{
                            width: '100%', padding: '10px 10px 10px 36px',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '10px' }}>
                    {[
                        { label: 'All Users', value: 'all' },
                        { label: 'Active', value: '0' },
                        { label: 'Frozen', value: '1' }
                    ].map(st => (
                        <button
                            key={st.value}
                            onClick={() => { setStatusFilter(st.value); setPage(1); }}
                            style={{
                                padding: '6px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                background: statusFilter === st.value ? '#6366f1' : 'transparent',
                                color: statusFilter === st.value ? 'white' : 'rgba(255,255,255,0.6)'
                            }}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>
            </div>


            {/* Table */}
            <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '0' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <th className="res-show-mobile" style={{ padding: '14px 16px', width: '40px' }}></th>
                                {['ID', 'Name', 'Shop', 'Created', 'Password', 'Trans Pass', 'Status', 'Verified', 'Actions'].map((h, i) => (
                                    <th key={h} className={i > 1 && i < 8 ? 'res-hide-mobile' : ''} style={{
                                        padding: '14px 16px', textAlign: 'left',
                                        fontSize: '11px', fontWeight: '700',
                                        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No users found</td></tr>
                            ) : users.map(u => (
                                <React.Fragment key={u._id}>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td className="res-show-mobile" style={{ padding: '12px 16px' }}>
                                            <button 
                                                onClick={() => toggleRow(u._id)}
                                                style={{ border: 'none', background: 'rgba(99,102,241,0.2)', color: '#6366f1', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                {expandedRows.has(u._id) ? <Minus size={14} /> : <Plus size={14} />}
                                            </button>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{u.id || '—'}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px' }}>{u.name}</td>
                                        <td className="res-hide-mobile" style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{u.shop_name}</td>
                                        <td className="res-hide-mobile" style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                                                {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="res-hide-mobile" style={{ padding: '12px 16px' }}>
                                            <div style={{
                                                fontSize: '11px', color: 'rgba(255,255,255,0.4)',
                                                fontFamily: 'monospace', maxWidth: '80px', overflow: 'hidden',
                                                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px'
                                            }} title={u.password}>
                                                {u.password || '—'}
                                            </div>
                                        </td>
                                        <td className="res-hide-mobile" style={{ padding: '12px 16px' }}>
                                            <div style={{
                                                fontSize: '11px', color: 'rgba(255,255,255,0.4)',
                                                fontFamily: 'monospace', maxWidth: '80px', overflow: 'hidden',
                                                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px'
                                            }} title={u.trans_password}>
                                                {u.trans_password || '—'}
                                            </div>
                                        </td>
                                        <td className="res-hide-mobile" style={{ padding: '12px 16px' }}>
                                            <Badge color={u.freeze === 1 ? 'red' : 'green'}>{u.freeze === 1 ? 'Frozen' : 'Active'}</Badge>
                                        </td>
                                        <td className="res-hide-mobile" style={{ padding: '12px 16px' }}>
                                            <Badge color={u.verified === 1 ? 'green' : 'yellow'}>{u.verified === 1 ? 'Verified' : 'Pending'}</Badge>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => router.push(`/admin/dashboard/products?seller_id=${u._id}&seller_name=${encodeURIComponent(u.name || u.shop_name || 'Seller')}`)}
                                                    data-tooltip="View Products"
                                                    style={{
                                                        background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                                                        borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                                                        color: '#10b981', display: 'flex'
                                                    }}
                                                >
                                                    <Package size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingUser({ ...u, password: '', trans_password: '' })}
                                                    disabled={actionLoading === u._id}
                                                    data-tooltip="Edit User"
                                                    style={{
                                                        background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)',
                                                        borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                                                        color: '#38bdf8', display: 'flex'
                                                    }}
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(u._id, { freeze: u.freeze === 1 ? 0 : 1 })}
                                                    disabled={actionLoading === u._id}
                                                    data-tooltip={u.freeze === 1 ? 'Unfreeze Account' : 'Freeze Account'}
                                                    style={{
                                                        background: u.freeze === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                                        border: u.freeze === 1 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                                                        borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                                                        color: u.freeze === 1 ? '#10b981' : '#f87171', display: 'flex'
                                                    }}
                                                >
                                                    <Shield size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(u._id, { verified: u.verified === 1 ? 0 : 1 })}
                                                    disabled={actionLoading === u._id}
                                                    data-tooltip={u.verified === 1 ? 'Unverify Seller' : 'Verify Seller'}
                                                    style={{
                                                        background: u.verified === 1 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                                                        border: u.verified === 1 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
                                                        borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                                                        color: u.verified === 1 ? '#f87171' : '#10b981', display: 'flex'
                                                    }}
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u._id, u.name)}
                                                    disabled={actionLoading === u._id}
                                                    data-tooltip="Delete User Permanently"
                                                    style={{
                                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                                        borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                                                        color: '#f87171', display: 'flex'
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Expanded Row for Mobile */}
                                    {expandedRows.has(u._id) && (
                                        <tr className="res-show-mobile" style={{ background: 'rgba(99,102,241,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td colSpan={11} style={{ padding: '16px' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '12px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Email</span>
                                                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{u.email}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Shop</span>
                                                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{u.shop_name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Created</span>
                                                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Status</span>
                                                        <Badge color={u.freeze === 1 ? 'red' : 'green'}>{u.freeze === 1 ? 'Frozen' : 'Active'}</Badge>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Verified</span>
                                                        <Badge color={u.verified === 1 ? 'green' : 'yellow'}>{u.verified === 1 ? 'Verified' : 'Pending'}</Badge>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div style={{
                        padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px',
                        borderTop: '1px solid rgba(255,255,255,0.08)'
                    }}>
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

            {/* Edit Modal */}
            {editingUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '24px', width: '100%', maxWidth: '500px',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div style={{ 
                            padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Edit User</h2>
                            <button onClick={() => { setEditingUser(null); setSaveError(''); setSaveSuccess(''); }} style={{
                                background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer', display: 'flex'
                            }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveEdit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {saveError && (
                                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#f87171', fontSize: '13px', fontWeight: '600' }}>
                                    ⚠ {saveError}
                                </div>
                            )}
                            {saveSuccess && (
                                <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#10b981', fontSize: '13px', fontWeight: '600' }}>
                                    ✓ {saveSuccess}
                                </div>
                            )}
                            {[
                                { label: 'Name', key: 'name', type: 'text' },
                                { label: 'Email', key: 'email', type: 'email' },
                                { label: 'Shop Name', key: 'shop_name', type: 'text' },
                                { label: 'Wallet Balance ($)', key: 'wallet_balance', type: 'number' },
                                { label: 'Guarantee Balance ($)', key: 'guarantee_balance', type: 'number' },
                                { label: 'Store Health (%)', key: 'store_health', type: 'number' },
                                { label: 'Store Performance', key: 'store_performance', type: 'text' },
                                { label: 'Store Status', key: 'store_status', type: 'text' },
                                { label: 'New Login Password (Leave blank to keep)', key: 'password', type: 'text' },
                                { label: 'New Trans Password (Leave blank to keep)', key: 'trans_password', type: 'text' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type}
                                        value={editingUser[field.key] || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, [field.key]: e.target.value })}
                                        style={{
                                            width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                            color: 'white', fontSize: '14px', outline: 'none'
                                        }}
                                        required={['name', 'email', 'shop_name'].includes(field.key)}
                                        step={field.type === 'number' ? '0.01' : undefined}
                                    />
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button type="button" onClick={() => setEditingUser(null)} style={{
                                    flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                    color: 'white', fontWeight: '700', cursor: 'pointer'
                                }}>Cancel</button>
                                <button type="submit" disabled={actionLoading === editingUser._id} style={{
                                    flex: 1, padding: '14px', background: '#6366f1',
                                    border: 'none', borderRadius: '12px',
                                    color: 'white', fontWeight: '700', cursor: 'pointer',
                                    opacity: actionLoading === editingUser._id ? 0.7 : 1
                                }}>
                                    {actionLoading === editingUser._id ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
