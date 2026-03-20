'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, Edit2, RefreshCw, X, Check, Plus, ShoppingCart, TrendingUp, Package, ChevronDown, Loader2, Minus, Eye, Warehouse } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_COLORS: any = {
    pending: { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)' },
    processing: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)' },
    shipped: { color: '#93c5fd', bg: 'rgba(129,140,248,0.15)', border: 'rgba(129,140,248,0.3)' },
    delivered: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
    cancelled: { color: '#f87171', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
};
const PAYMENT_METHODS = [
    { id: 'UPI', label: 'UPI', icon: '📱', color: '#f59e0b' },
    { id: 'Card', label: 'Card', icon: '💳', color: '#60a5fa' },
    { id: 'Crypto', label: 'Crypto', icon: '₿', color: '#f97316' },
    { id: 'COD', label: 'COD', icon: '💵', color: '#10b981' },
];

type ProductItem = { product_id: string; qty: number; name?: string; selling_price?: number };

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [turnover, setTurnover] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState<any>(null);
    const [editStatus, setEditStatus] = useState('');
    const [editPickUpStatus, setEditPickUpStatus] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // View Order Items Modal state
    const [viewModal, setViewModal] = useState<{ order: any; items: any[]; loading: boolean } | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    const openViewModal = async (order: any) => {
        setViewModal({ order, items: [], loading: true });
        try {
            const res = await fetch(`${API}/orders/${order._id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            const data = await res.json();
            setViewModal({ order, items: data.orderItems || [], loading: false });
        } catch {
            setViewModal({ order, items: [], loading: false });
        }
    };

    // Add Order Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [sellers, setSellers] = useState<any[]>([]);
    const [selectedSellerId, setSelectedSellerId] = useState('');
    const [sellerProducts, setSellerProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [productItems, setProductItems] = useState<ProductItem[]>([{ product_id: '', qty: 1 }]);
    const [orderForm, setOrderForm] = useState({
        customer_name: '', customer_email: '', customer_phone: '',
        customer_address: '', payment_method: 'COD'
    });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const getToken = () => localStorage.getItem('adminToken');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), keyword, status: statusFilter });
        const res = await fetch(`${API}/admin/orders?${params}`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (data.success) {
            setOrders(data.orders);
            setTotal(data.total);
            setPages(data.pages);
            // Compute turnover
            const tv = (data.orders || []).reduce((s: number, o: any) => s + parseFloat(o.order_total || '0'), 0);
            setTurnover(tv);
        }
        setLoading(false);
    }, [page, keyword, statusFilter]);

    const fetchSellers = async () => {
        const res = await fetch(`${API}/admin/users?limit=500`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (data.success) setSellers(data.users || []);
    };

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // Load seller's products when seller is selected
    useEffect(() => {
        if (!selectedSellerId) { setSellerProducts([]); return; }
        const load = async () => {
            setLoadingProducts(true);
            try {
                // Use dedicated endpoint that reliably fetches seller's store products
                const res = await fetch(`${API}/admin/seller-store-products/${selectedSellerId}`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                const data = await res.json();
                console.log('[Admin Order] seller products response:', data);
                setSellerProducts(data.products || []);
            } catch (e) {
                console.error('Failed to load seller products', e);
                setSellerProducts([]);
            }
            setLoadingProducts(false);
        };
        load();
    }, [selectedSellerId]);

    const openAddModal = async () => {
        setShowAddModal(true);
        setSelectedSellerId('');
        setSellerProducts([]);
        setProductItems([{ product_id: '', qty: 1 }]);
        setOrderForm({ customer_name: '', customer_email: '', customer_phone: '', customer_address: '', payment_method: 'UPI' });
        setFormError('');
        if (sellers.length === 0) await fetchSellers();
    };

    const addProductRow = () => setProductItems(prev => [...prev, { product_id: '', qty: 1 }]);
    const removeProductRow = (i: number) => setProductItems(prev => prev.filter((_, idx) => idx !== i));
    const updateProductRow = (i: number, field: keyof ProductItem, value: any) => {
        setProductItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
    };

    // Compute order total preview
    const orderTotal = productItems.reduce((sum, item) => {
        const product = sellerProducts.find((p: any) => p._id === item.product_id);
        if (product && item.qty > 0) {
            return sum + (parseFloat(product.selling_price) || 0) * item.qty;
        }
        return sum;
    }, 0);

    const handleSubmitOrder = async () => {
        if (!selectedSellerId) return setFormError('Please select a seller');
        if (!orderForm.customer_name.trim()) return setFormError('Customer name is required');
        if (!orderForm.customer_address.trim()) return setFormError('Customer address is required');
        const validProducts = productItems.filter(p => p.product_id && p.qty > 0);
        if (validProducts.length === 0) return setFormError('Please select at least one product');

        setSubmitting(true);
        setFormError('');
        try {
            const res = await fetch(`${API}/admin/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({
                    seller_id: selectedSellerId,
                    ...orderForm,
                    products: validProducts
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowAddModal(false);
                fetchOrders();
            } else {
                setFormError(data.message || 'Failed to create order');
            }
        } catch (e: any) {
            setFormError(e.message || 'Network error');
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this order?')) return;
        setActionLoading(id);
        await fetch(`${API}/admin/orders/${id}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` }
        });
        await fetchOrders();
        setActionLoading(null);
    };

    const handleUpdateStatus = async () => {
        if (!editModal) return;
        setActionLoading(editModal._id);
        try {
            const res = await fetch(`${API}/admin/orders/${editModal._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ status: editStatus, pick_up_status: editPickUpStatus })
            });
            const data = await res.json();
            if (data.success) {
                setEditModal(null);
                await fetchOrders();
                alert('Order status updated successfully!');
            } else {
                alert(data.message || 'Failed to update order status');
            }
        } catch (error: any) {
            console.error('Update status error:', error);
            alert('Error updating status: ' + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px',
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '11px', fontWeight: '700',
        color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px'
    };

    return (
        <div style={{ padding: '28px', color: 'white', minHeight: '100vh' }}>
            {/* ── Stats Cards ── */}
            <div className="orders-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {/* Total Orders */}
                <div className="order-stat-card" style={{
                    background: 'linear-gradient(135deg, #3b3bff 0%, #3b82f6 100%)',
                    borderRadius: '18px', padding: '22px', boxShadow: '0 8px 20px rgba(59,130,246,0.3)'
                }}>
                    <div className="stat-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div className="stat-card-icon" style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
                            <ShoppingCart size={18} color="white" />
                        </div>
                        <span className="stat-card-label" style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Orders</span>
                    </div>
                    <p className="stat-card-value" style={{ fontSize: '36px', fontWeight: '900', margin: 0, lineHeight: 1 }}>{total}</p>
                </div>

                {/* Total Turnover */}
                <div className="order-stat-card" style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                    borderRadius: '18px', padding: '22px', boxShadow: '0 8px 20px rgba(14,165,233,0.3)'
                }}>
                    <div className="stat-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div className="stat-card-icon" style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
                            <TrendingUp size={18} color="white" />
                        </div>
                        <span className="stat-card-label" style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Turnover</span>
                    </div>
                    <p className="stat-card-value" style={{ fontSize: '24px', fontWeight: '900', margin: 0, lineHeight: 1 }}>₹{turnover.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>

                {/* Add Order */}
                <button
                    onClick={openAddModal}
                    className="order-stat-card add-btn"
                    style={{
                        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                        borderRadius: '18px', padding: '22px', border: 'none', cursor: 'pointer',
                        textAlign: 'left', boxShadow: '0 8px 20px rgba(96,165,250,0.35)',
                        transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                    onMouseEnter={e => { (e.currentTarget.style.transform = 'translateY(-2px)'); (e.currentTarget.style.boxShadow = '0 14px 28px rgba(96,165,250,0.45)'); }}
                    onMouseLeave={e => { (e.currentTarget.style.transform = 'translateY(0)'); (e.currentTarget.style.boxShadow = '0 8px 20px rgba(96,165,250,0.35)'); }}
                >
                    <div className="stat-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div className="stat-card-icon" style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px' }}>
                            <Plus size={18} color="white" />
                        </div>
                        <span className="stat-card-label" style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Add Order</span>
                    </div>
                    <p className="stat-card-value-small" style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'white' }}>Create New Order</p>
                    <p className="stat-card-sub" style={{ fontSize: '12px', margin: '4px 0 0', color: 'rgba(255,255,255,0.55)' }}>Select seller & products</p>
                </button>
            </div>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px' }}>All Orders</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Manage and filter orders below</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['all', ...ORDER_STATUSES].map(s => (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} style={{
                            padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                            border: statusFilter === s ? 'none' : '1px solid rgba(255,255,255,0.08)',
                            background: statusFilter === s ? 'linear-gradient(135deg, #3b82f6, #60a5fa)' : 'rgba(255,255,255,0.04)',
                            color: statusFilter === s ? 'white' : 'rgba(255,255,255,0.4)',
                            cursor: 'pointer', textTransform: 'capitalize', boxShadow: statusFilter === s ? '0 4px 10px rgba(59,130,246,0.3)' : 'none'
                        }}>{s}</button>
                    ))}
                </div>
            </div>

            {/* ── Search ── */}
            <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '18px' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                    value={keyword}
                    onChange={e => { setKeyword(e.target.value); setPage(1); }}
                    placeholder="Search orders..."
                    style={{ ...inputStyle, paddingLeft: '36px' }}
                />
            </div>

            {/* ── Table ── */}
            <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px', overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '0' }}>
                        <thead>
                            <tr style={{ background: 'rgba(59,130,246,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                <th className="res-show-mobile" style={{ padding: '13px 14px', width: '40px' }}></th>
                                {['Order Code', 'Customer', 'Seller / Shop', 'Total', 'Cost', 'Supplier', 'Status', 'Pick up', 'Payment', 'Date / Delivery Time', 'Actions'].map((h, i) => (
                                    <th key={h} className={i > 1 && i < 9 ? 'res-hide-mobile' : ''} style={{
                                        padding: '13px 14px', textAlign: 'left', fontSize: '10px',
                                        fontWeight: '700', color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={11} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }} />
                                </td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={11} style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No orders found</td></tr>
                            ) : orders.map(o => {
                                const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
                                return (
                                    <React.Fragment key={o._id}>
                                        <tr
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.06)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <td className="res-show-mobile" style={{ padding: '13px 14px' }}>
                                                <button 
                                                    onClick={() => toggleRow(o._id)}
                                                    style={{ border: 'none', background: 'rgba(59,130,246,0.2)', color: '#3b82f6', borderRadius: '4px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    {expandedRows.has(o._id) ? <Minus size={14} /> : <Plus size={14} />}
                                                </button>
                                            </td>
                                            <td style={{ padding: '13px 14px', fontFamily: 'monospace', color: '#bfdbfe', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                                {o.order_code}
                                            </td>
                                            <td style={{ padding: '13px 14px' }}>
                                                <div style={{ fontWeight: '700', fontSize: '13px' }}>{o.customer_name}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '2px' }}>{o.customer_phone || o.customer_email || ''}</div>
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '13px 14px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>{o.seller?.name || '—'}</div>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{o.seller?.shop_name || ''}</div>
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '13px 14px', fontWeight: '800', color: '#10b981', whiteSpace: 'nowrap' }}>
                                                ₹{parseFloat(o.order_total || '0').toFixed(2)}
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.45)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                                ₹{(o.cost_amount || 0).toFixed(2)}
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '13px 14px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Warehouse size={13} className="opacity-50" />
                                                    {o.supplier_name || 'EssSmart Store'}
                                                </div>
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '13px 14px' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                                                    background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color,
                                                    textTransform: 'capitalize', whiteSpace: 'nowrap'
                                                }}>{o.status}</span>
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '13px 14px' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '800',
                                                    background: (o.pick_up_status?.toLowerCase().includes('picked') && !o.pick_up_status?.toLowerCase().includes('unpicked')) ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                                    border: (o.pick_up_status?.toLowerCase().includes('picked') && !o.pick_up_status?.toLowerCase().includes('unpicked')) ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(239,68,68,0.25)',
                                                    color: (o.pick_up_status?.toLowerCase().includes('picked') && !o.pick_up_status?.toLowerCase().includes('unpicked')) ? '#10b981' : '#f87171',
                                                    textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '0.02em'
                                                }}>{o.pick_up_status || 'Unpicked-Up'}</span>
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '13px 14px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                                                    background: o.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.12)',
                                                    color: o.payment_status === 'paid' ? '#10b981' : '#fbbf24',
                                                    textTransform: 'capitalize', whiteSpace: 'nowrap'
                                                }}>{o.payment_status}</span>
                                            </td>
                                            <td className="res-hide-mobile" style={{ padding: '13px 14px', whiteSpace: 'nowrap' }}>
                                                {o.status === 'delivered' && o.deliveredAt ? (
                                                    <>
                                                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981' }}>
                                                            Delivered at {new Date(o.deliveredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: '#34d399', marginTop: '3px', fontWeight: 'bold' }}>
                                                            {new Date(o.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>
                                                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '3px' }}>
                                                            {o.createdAt ? new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                            <td style={{ padding: '13px 14px' }}>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button
                                                        onClick={() => openViewModal(o)}
                                                        data-tooltip="View Items in Order"
                                                        style={{
                                                            background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                                                            borderRadius: '8px', padding: '7px 9px', cursor: 'pointer', color: '#10b981', display: 'flex'
                                                        }}>
                                                        <Eye size={13} />
                                                    </button>
                                                    <button 
                                                        onClick={() => { setEditModal(o); setEditStatus(o.status); setEditPickUpStatus(o.pick_up_status || 'Unpicked-Up'); }} 
                                                        data-tooltip="Edit Order Status"
                                                        style={{
                                                            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                                                            borderRadius: '8px', padding: '7px 9px', cursor: 'pointer', color: '#93c5fd', display: 'flex'
                                                        }}><Edit2 size={13} /></button>
                                                    <button 
                                                        onClick={() => handleDelete(o._id)} 
                                                        disabled={actionLoading === o._id} 
                                                        data-tooltip="Delete Order Permanently"
                                                        style={{
                                                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                                            borderRadius: '8px', padding: '7px 9px', cursor: 'pointer', color: '#f87171', display: 'flex'
                                                        }}><Trash2 size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Row for Mobile */}
                                        {expandedRows.has(o._id) && (
                                            <tr className="res-show-mobile" style={{ background: 'rgba(59,130,246,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td colSpan={10} style={{ padding: '16px' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '12px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Seller</span>
                                                            <span style={{ fontSize: '13px', color: 'white' }}>{o.seller?.name || '—'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Order Amount</span>
                                                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>₹{parseFloat(o.order_total || '0').toFixed(2)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Status</span>
                                                            <span style={{
                                                                padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                                                                background: sc.bg, color: sc.color
                                                            }}>{o.status}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Pick up</span>
                                                            <span style={{
                                                                padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '800',
                                                                background: (o.pick_up_status?.toLowerCase().includes('picked') && !o.pick_up_status?.toLowerCase().includes('unpicked')) ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                                                color: (o.pick_up_status?.toLowerCase().includes('picked') && !o.pick_up_status?.toLowerCase().includes('unpicked')) ? '#10b981' : '#f87171',
                                                                whiteSpace: 'nowrap'
                                                            }}>{o.pick_up_status || 'Unpicked-Up'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Payment</span>
                                                            <span style={{
                                                                padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                                                                background: o.payment_status === 'paid' ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.12)',
                                                                color: o.payment_status === 'paid' ? '#10b981' : '#fbbf24',
                                                            }}>{o.payment_status}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Date</span>
                                                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '—'}</span>
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
                {pages > 1 && (
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{
                                width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                                background: p === page ? 'linear-gradient(135deg, #3b82f6, #60a5fa)' : 'rgba(255,255,255,0.05)',
                                color: p === page ? 'white' : 'rgba(255,255,255,0.4)',
                                cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                                boxShadow: p === page ? '0 4px 10px rgba(59,130,246,0.3)' : 'none'
                            }}>{p}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* ══════════════ ADD ORDER MODAL ══════════════ */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000,
                    padding: '24px', overflowY: 'auto'
                }}>
                    <div style={{
                        background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 100%)',
                        border: '1px solid rgba(59,130,246,0.25)',
                        borderRadius: '24px', padding: '0', width: '100%', maxWidth: '680px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.6)', overflow: 'hidden', marginTop: '12px'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(96,165,250,0.15) 100%)',
                            borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '22px 28px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ padding: '10px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderRadius: '12px' }}>
                                    <ShoppingCart size={18} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Create New Order</h2>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>Fill in the order details below</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} style={{
                                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                                display: 'flex', transition: 'all 0.15s'
                            }}><X size={16} /></button>
                        </div>

                        <div style={{ padding: '28px' }}>
                            {formError && (
                                <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '13px', fontWeight: '600' }}>
                                    ⚠ {formError}
                                </div>
                            )}

                            {/* Section: Seller */}
                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <div style={{ width: '3px', height: '18px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderRadius: '2px' }} />
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Seller</span>
                                </div>
                                <label style={labelStyle}>Select Seller *</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={selectedSellerId}
                                        onChange={e => setSelectedSellerId(e.target.value)}
                                        style={{ ...inputStyle, paddingRight: '36px', appearance: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="">— Select a seller —</option>
                                        {sellers.map(s => (
                                            <option key={s._id} value={s._id} style={{ background: '#1e3a8a' }}>
                                                {s.name} {s.shop_name ? `(${s.shop_name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                                </div>
                            </div>

                            {/* Section: Customer */}
                            <div style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                    <div style={{ width: '3px', height: '18px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', borderRadius: '2px' }} />
                                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Customer Details</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {[
                                        { key: 'customer_name', label: 'Full Name *', placeholder: 'John Doe' },
                                        { key: 'customer_phone', label: 'Phone Number', placeholder: '91XXXXXXXXXX' },
                                        { key: 'customer_email', label: 'Email Address', placeholder: 'customer@email.com' },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label style={labelStyle}>{field.label}</label>
                                            <input
                                                type="text"
                                                value={(orderForm as any)[field.key]}
                                                onChange={e => setOrderForm(f => ({ ...f, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                style={inputStyle}
                                            />
                                        </div>
                                    ))}

                                    {/* Payment Method as card selector */}
                                    <div>
                                        <label style={labelStyle}>Payment Method</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {PAYMENT_METHODS.map(pm => (
                                                <button
                                                    key={pm.id}
                                                    onClick={() => setOrderForm(f => ({ ...f, payment_method: pm.id }))}
                                                    style={{
                                                        flex: 1, padding: '10px 6px', borderRadius: '10px', cursor: 'pointer',
                                                        border: orderForm.payment_method === pm.id ? `2px solid ${pm.color}` : '1px solid rgba(255,255,255,0.1)',
                                                        background: orderForm.payment_method === pm.id ? `${pm.color}22` : 'rgba(255,255,255,0.04)',
                                                        color: orderForm.payment_method === pm.id ? pm.color : 'rgba(255,255,255,0.5)',
                                                        fontSize: '11px', fontWeight: '700', textAlign: 'center',
                                                        transition: 'all 0.15s',
                                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '18px' }}>{pm.icon}</span>
                                                    {pm.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <label style={labelStyle}>Delivery Address *</label>
                                    <textarea
                                        value={orderForm.customer_address}
                                        onChange={e => setOrderForm(f => ({ ...f, customer_address: e.target.value }))}
                                        placeholder="Full delivery address..."
                                        rows={2}
                                        style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                                    />
                                </div>
                            </div>

                            {/* Section: Products */}
                            <div style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '3px', height: '18px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '2px' }} />
                                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Products</span>
                                    </div>
                                    <button onClick={addProductRow} style={{
                                        display: 'flex', alignItems: 'center', gap: '5px',
                                        padding: '6px 12px', background: 'rgba(16,185,129,0.12)',
                                        border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px',
                                        color: '#10b981', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
                                    }}><Plus size={13} /> Add Product</button>
                                </div>

                                {loadingProducts && (
                                    <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '6px' }} />
                                        Loading seller's products...
                                    </div>
                                )}

                                {!selectedSellerId && !loadingProducts && (
                                    <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '13px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                        <Package size={24} style={{ marginBottom: '8px', opacity: 0.3, display: 'block', margin: '0 auto 8px' }} />
                                        Select a seller to load their products
                                    </div>
                                )}

                                {selectedSellerId && !loadingProducts && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {productItems.map((item, i) => (
                                            <div key={i} style={{
                                                display: 'grid', gridTemplateColumns: '1fr 100px auto',
                                                gap: '12px', alignItems: 'center',
                                                padding: '12px', background: 'rgba(255,255,255,0.04)',
                                                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px'
                                            }}>
                                                <div style={{ position: 'relative' }}>
                                                    <select
                                                        value={item.product_id}
                                                        onChange={e => updateProductRow(i, 'product_id', e.target.value)}
                                                        style={{ ...inputStyle, fontSize: '12px', padding: '8px 32px 8px 10px', appearance: 'none', cursor: 'pointer' }}
                                                    >
                                                        <option value="">Select product...</option>
                                                        {sellerProducts.map((p: any) => (
                                                            <option key={p._id} value={p._id} style={{ background: '#1e3a8a' }}>
                                                                {p.name} — ₹{p.selling_price}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={12} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <button onClick={() => updateProductRow(i, 'qty', Math.max(1, item.qty - 1))} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}><Minus size={12} /></button>
                                                    <input type="number" min={1} value={item.qty}
                                                        onChange={e => updateProductRow(i, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                                                        style={{ ...inputStyle, width: '50px', textAlign: 'center', padding: '6px 4px', fontSize: '13px', fontWeight: '700' }}
                                                    />
                                                    <button onClick={() => updateProductRow(i, 'qty', item.qty + 1)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}><Plus size={12} /></button>
                                                </div>
                                                <button onClick={() => removeProductRow(i)} disabled={productItems.length === 1} style={{
                                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                                                    borderRadius: '8px', padding: '8px', cursor: productItems.length === 1 ? 'not-allowed' : 'pointer',
                                                    color: '#f87171', display: 'flex', opacity: productItems.length === 1 ? 0.4 : 1
                                                }}><X size={13} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Order Total Preview */}
                            {orderTotal > 0 && (
                                <div style={{
                                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                                    borderRadius: '12px', padding: '14px 18px', marginBottom: '20px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: '600' }}>Estimated Order Total</span>
                                    <span style={{ color: '#10b981', fontSize: '18px', fontWeight: '900' }}>₹{orderTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setShowAddModal(false)} style={{
                                    flex: 1, padding: '13px', background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                    color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: '700', fontSize: '14px'
                                }}>Cancel</button>
                                <button onClick={handleSubmitOrder} disabled={submitting} style={{
                                    flex: 2, padding: '13px', background: submitting ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                    border: 'none', borderRadius: '12px', color: 'white', cursor: submitting ? 'not-allowed' : 'pointer',
                                    fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: submitting ? 'none' : '0 6px 18px rgba(59,130,246,0.4)'
                                }}>
                                    {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ShoppingCart size={16} />}
                                    {submitting ? 'Creating...' : 'Create Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ VIEW ORDER ITEMS MODAL ══════════════ */}
            {viewModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px'
                }}>
                    <div style={{
                        background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 100%)',
                        border: '1px solid rgba(59,130,246,0.25)', borderRadius: '24px',
                        width: '100%', maxWidth: '640px', maxHeight: '85vh', overflow: 'hidden',
                        boxShadow: '0 30px 70px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.1) 100%)',
                            borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px' }}>
                                    <Package size={18} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'white' }}>Order Products</h2>
                                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#bfdbfe', fontFamily: 'monospace', fontWeight: '600' }}>
                                        {viewModal.order.order_code}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setViewModal(null)} style={{
                                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                                borderRadius: '10px', padding: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex'
                            }}><X size={16} /></button>
                        </div>

                        {/* Order Meta Strip */}
                        <div style={{
                            display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                            flexShrink: 0
                        }}>
                            {[
                                { label: 'Customer', value: viewModal.order.customer_name },
                                { label: 'Total', value: `₹${parseFloat(viewModal.order.order_total || '0').toFixed(2)}` },
                                { label: 'Status', value: viewModal.order.status },
                                { label: 'Payment', value: `${viewModal.order.payment_status} (${viewModal.order.payment_method || 'N/A'})` },
                            ].map((m, idx) => (
                                <div key={idx} style={{
                                    flex: 1, padding: '12px 16px',
                                    borderRight: idx < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700', marginBottom: '4px' }}>{m.label}</div>
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', textTransform: 'capitalize' }}>{m.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Products List */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
                            {viewModal.loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '12px' }}>
                                    <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Loading products...</span>
                                </div>
                            ) : viewModal.items.length === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '12px' }}>
                                    <Package size={40} color="rgba(255,255,255,0.1)" />
                                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>No products found for this order</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {/* Table Header */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px',
                                        padding: '8px 14px',
                                        background: 'rgba(59,130,246,0.08)', borderRadius: '10px',
                                        fontSize: '10px', fontWeight: '700', color: 'rgba(255,255,255,0.4)',
                                        textTransform: 'uppercase', letterSpacing: '0.06em'
                                    }}>
                                        <span>Product</span>
                                        <span style={{ textAlign: 'center' }}>Qty</span>
                                        <span style={{ textAlign: 'right' }}>Unit Price</span>
                                        <span style={{ textAlign: 'right' }}>Subtotal</span>
                                    </div>

                                    {/* Product Rows */}
                                    {viewModal.items.map((item: any, idx: number) => {
                                        const productName = item.product?.name || item.name || `Product #${idx + 1}`;
                                        const productImage = item.product?.image || null;
                                        const unitPrice = parseFloat(item.price || item.product?.selling_price || 0);
                                        const qty = parseInt(item.quantity || item.qty || 1);
                                        const subtotal = unitPrice * qty;
                                        return (
                                            <div key={item._id || idx} style={{
                                                display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px',
                                                alignItems: 'center', padding: '14px',
                                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                                                borderRadius: '12px', transition: 'background 0.15s'
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.07)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                                            >
                                                {/* Product Info */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                                    {productImage ? (
                                                        <img
                                                            src={productImage.startsWith('http') ? productImage : `${API?.replace('/api', '')}${productImage}`}
                                                            alt={productName}
                                                            style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}
                                                            onError={e => { (e.target as any).style.display = 'none'; }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '40px', height: '40px', borderRadius: '8px',
                                                            background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(96,165,250,0.3))',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                        }}>
                                                            <Package size={16} color="rgba(255,255,255,0.5)" />
                                                        </div>
                                                    )}
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productName}</div>
                                                        {item.product?.category && (
                                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{item.product.category}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Qty */}
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)',
                                                        borderRadius: '8px', padding: '4px 10px', fontSize: '13px', fontWeight: '800', color: '#bfdbfe'
                                                    }}>×{qty}</span>
                                                </div>
                                                {/* Unit Price */}
                                                <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>
                                                    ₹{unitPrice.toFixed(2)}
                                                </div>
                                                {/* Subtotal */}
                                                <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: '800', color: '#10b981' }}>
                                                    ₹{subtotal.toFixed(2)}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Grand Total Row */}
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '14px 16px', marginTop: '4px',
                                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                                        borderRadius: '12px'
                                    }}>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>
                                            {viewModal.items.length} Product{viewModal.items.length !== 1 ? 's' : ''} Total
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981' }}>
                                            ₹{parseFloat(viewModal.order.order_total || '0').toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                            <button onClick={() => setViewModal(null)} style={{
                                width: '100%', padding: '12px', background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontWeight: '700', fontSize: '14px'
                            }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Status Modal ── */}
            {editModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 100%)',
                        border: '1px solid rgba(59,130,246,0.3)', borderRadius: '24px',
                        padding: '32px', width: '100%', maxWidth: '380px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <h3 style={{ margin: '0 0 6px', color: 'white', fontSize: '18px', fontWeight: '800' }}>Update Order Status</h3>
                        <p style={{ margin: '0 0 20px', color: '#bfdbfe', fontSize: '12px', fontFamily: 'monospace', fontWeight: '600' }}>{editModal.order_code}</p>
                        <label style={{ ...labelStyle, marginTop: '20px' }}>Order Status</label>
                        <select
                            value={editStatus}
                            onChange={e => setEditStatus(e.target.value)}
                            style={{ ...inputStyle, marginBottom: '20px', textTransform: 'capitalize', cursor: 'pointer' }}
                        >
                            {ORDER_STATUSES.map(s => (
                                <option key={s} value={s} style={{ background: '#1e3a8a', textTransform: 'capitalize' }}>{s}</option>
                            ))}
                        </select>

                        <label style={labelStyle}>Pick up Status</label>
                        <select
                            value={editPickUpStatus}
                            onChange={e => setEditPickUpStatus(e.target.value)}
                            style={{ ...inputStyle, marginBottom: '24px', cursor: 'pointer' }}
                        >
                            <option value="Unpicked-Up" style={{ background: '#1e3a8a' }}>Unpicked-Up</option>
                            <option value="Picked-Up" style={{ background: '#1e3a8a' }}>Picked-Up</option>
                        </select>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setEditModal(null)} style={{
                                flex: 1, padding: '12px', background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: '700'
                            }}>Cancel</button>
                            <button onClick={handleUpdateStatus} disabled={actionLoading === editModal._id} style={{
                                flex: 1, padding: '12px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                border: 'none', borderRadius: '12px', color: 'white', cursor: actionLoading === editModal._id ? 'not-allowed' : 'pointer', fontWeight: '800',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                boxShadow: '0 4px 14px rgba(59,130,246,0.4)', opacity: actionLoading === editModal._id ? 0.7 : 1
                            }}>
                                {actionLoading === editModal._id ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                {actionLoading === editModal._id ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                @media (max-width: 600px) {
                    .orders-stats-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                    }
                    .order-stat-card {
                        padding: 14px !important;
                    }
                    .stat-card-header {
                        margin-bottom: 8px !important;
                        gap: 6px !important;
                    }
                    .stat-card-icon {
                        padding: 6px !important;
                    }
                    .stat-card-icon svg {
                        width: 14px !important;
                        height: 14px !important;
                    }
                    .stat-card-label {
                        font-size: 10px !important;
                    }
                    .stat-card-value {
                        font-size: 20px !important;
                    }
                    .stat-card-value-small {
                        font-size: 14px !important;
                    }
                    .stat-card-sub {
                        font-size: 10px !important;
                    }
                    .orders-stats-grid > .add-btn {
                        grid-column: span 2 !important;
                        padding: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}
