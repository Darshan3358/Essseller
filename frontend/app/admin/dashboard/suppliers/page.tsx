'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Star, MapPin, Phone, Mail, Clock, TrendingUp, Users, CheckCircle, X, Save } from 'lucide-react';
import React from 'react';

export default function AdminSuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        location: 'Global',
        contact: '',
        email: '',
        deliveryTimeEstimate: '3-10 days',
        commissionRate: 0.05,
        status: 'active',
        rating: 0
    });

    const fetchSuppliers = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setSuppliers(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            alert('Failed to load suppliers');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleOpenModal = (supplier: any = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                location: supplier.location || 'Global',
                contact: supplier.contact || '',
                email: supplier.email || '',
                deliveryTimeEstimate: supplier.deliveryTimeEstimate || '3-10 days',
                commissionRate: supplier.commissionRate || 0.05,
                status: supplier.status || 'active',
                rating: supplier.rating || 0
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                location: 'Global',
                contact: '',
                email: '',
                deliveryTimeEstimate: '3-10 days',
                commissionRate: 0.05,
                status: 'active',
                rating: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        try {
            let res;
            if (editingSupplier) {
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/${editingSupplier._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(formData)
                });
            } else {
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(formData)
                });
            }

            const data = await res.json();

            if (data.success) {
                alert(editingSupplier ? 'Supplier updated successfully' : 'Supplier created successfully');
                setIsModalOpen(false);
                fetchSuppliers();
            } else {
                alert(data.message || 'Operation failed');
            }
        } catch (error: any) {
            console.error('Error saving supplier:', error);
            alert(error.message || 'An error occurred');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this supplier?')) return;
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                alert('Supplier deleted successfully');
                fetchSuppliers();
            } else {
                alert(data.message || 'Delete failed');
            }
        } catch (error: any) {
            console.error('Error deleting supplier:', error);
            alert(error.message || 'An error occurred');
        }
    };

    const avgRating = suppliers.length > 0
        ? (suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length).toFixed(1)
        : "0.0";

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Suppliers Center</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Manage your supplier network and performance</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        background: '#3b82f6', border: 'none',
                        borderRadius: '10px', color: 'white', padding: '10px 16px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700'
                    }}
                >
                    <Plus size={18} />
                    Add New Supplier
                </button>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Total Suppliers</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>{suppliers.length}</div>
                        </div>
                        <div style={{ background: 'rgba(59,130,246,0.15)', padding: '10px', borderRadius: '12px' }}>
                            <Users size={20} color="#93c5fd" />
                        </div>
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Avg Rating</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>{avgRating}</div>
                        </div>
                        <div style={{ background: 'rgba(251,191,36,0.15)', padding: '10px', borderRadius: '12px' }}>
                            <Star size={20} color="#fbbf24" style={{ fill: '#fbbf24' }} />
                        </div>
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Avg Delivery</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: 'white' }}>0 days</div>
                        </div>
                        <div style={{ background: 'rgba(16,185,129,0.15)', padding: '10px', borderRadius: '12px' }}>
                            <Clock size={20} color="#10b981" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Suppliers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
                {isLoading ? (
                    <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                        Loading suppliers...
                    </div>
                ) : suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                        <div key={supplier._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', transition: 'transform 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', margin: '0 0 8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{supplier.name}</h3>
                                    <div style={{ 
                                        display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                                        background: supplier.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.1)',
                                        color: supplier.status === 'active' ? '#10b981' : 'rgba(255,255,255,0.5)',
                                        border: `1px solid ${supplier.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.2)'}`
                                    }}>
                                        {supplier.status || 'inactive'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(251,191,36,0.15)', padding: '4px 8px', borderRadius: '8px' }}>
                                    <Star size={14} color="#fbbf24" style={{ fill: '#fbbf24' }} />
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#fcd34d' }}>{supplier.rating || 0}</span>
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                                    <MapPin size={16} color="rgba(255,255,255,0.3)" />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{supplier.location || 'Global'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                                    <Phone size={16} color="rgba(255,255,255,0.3)" />
                                    <span>{supplier.contact || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                                    <Mail size={16} color="rgba(255,255,255,0.3)" />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{supplier.email || 'N/A'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                                    <Clock size={16} color="rgba(255,255,255,0.3)" />
                                    <span>Delivery: {supplier.deliveryTimeEstimate || '3-10 days'}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.4)' }}>
                                    Comm: <span style={{ color: 'white' }}>{((supplier.commissionRate || 0.05) * 100).toFixed(0)}%</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleOpenModal(supplier)}
                                        style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '8px', padding: '8px', color: '#38bdf8', cursor: 'pointer', display: 'flex' }}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(supplier._id)}
                                        style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '8px', color: '#f87171', cursor: 'pointer', display: 'flex' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' }}>
                        <Users size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontWeight: '600', margin: 0 }}>No suppliers configured in your database.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '600px',
                        border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        maxHeight: '90vh'
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {editingSupplier ? <Edit size={20} color="#3b82f6" /> : <Plus size={20} color="#3b82f6" />}
                                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', padding: 0 }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ padding: '24px', overflowY: 'auto' }}>
                            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supplier Name *</label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                                    <input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Number</label>
                                    <input value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Estimate</label>
                                    <input value={formData.deliveryTimeEstimate} onChange={e => setFormData({ ...formData, deliveryTimeEstimate: e.target.value })} placeholder="e.g. 3-10 days" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commission Rate</label>
                                    <input type="number" step="0.01" min="0" max="1" value={formData.commissionRate} onChange={e => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', appearance: 'none' }}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating (0-5)</label>
                                    <input type="number" step="0.1" min="0" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                                </div>

                                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px', marginTop: '12px' }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ flex: 2, padding: '14px', background: '#3b82f6', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(59,130,246,0.4)' }}>
                                        <Save size={18} />
                                        {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
