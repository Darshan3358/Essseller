'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, RefreshCw, Edit2, Trash2, Plus, X, Save, Box, CheckCircle2, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminSpreadPackagesPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        duration: 'Month',
        features: '',
        color: 'from-blue-500 to-blue-600',
        popular: false,
        active: true
    });

    const fetchPackages = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/spread-packages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPackages(data.packages);
            }
        } catch (err) {
            console.error('Failed to fetch spread packages:', err);
            toast.error('Failed to load packages');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const handleOpenModal = (pkg: any = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            setFormData({
                name: pkg.name,
                price: pkg.price,
                duration: pkg.duration || 'Month',
                features: pkg.features.join('\n'),
                color: pkg.color || 'from-blue-500 to-blue-600',
                popular: pkg.popular || false,
                active: pkg.active ?? true
            });
        } else {
            setEditingPackage(null);
            setFormData({
                name: '',
                price: 0,
                duration: 'Month',
                features: '',
                color: 'from-blue-500 to-blue-600',
                popular: false,
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('adminToken');
        const url = editingPackage
            ? `${process.env.NEXT_PUBLIC_API_URL}/admin/spread-packages/${editingPackage._id}`
            : `${process.env.NEXT_PUBLIC_API_URL}/admin/spread-packages`;

        const method = editingPackage ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    features: formData.features.split('\n').filter(f => f.trim() !== '')
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingPackage ? 'Package updated' : 'Package created');
                setIsModalOpen(false);
                fetchPackages();
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch (err) {
            console.error('Error saving package:', err);
            toast.error('An error occurred');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this package?')) return;

        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/spread-packages/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Package deleted');
                fetchPackages();
            } else {
                toast.error(data.message || 'Delete failed');
            }
        } catch (err) {
            console.error('Error deleting package:', err);
            toast.error('An error occurred');
        }
    };

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Manage Spread Packages</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                        Configure marketing packages available to sellers
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                        border: 'none', borderRadius: '10px', color: 'white',
                        padding: '10px 20px', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                    }}
                >
                    <Plus size={18} /> New Package
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <RefreshCw size={32} style={{ animation: 'spin 1.5s linear infinite', color: '#3b82f6', marginBottom: '16px' }} />
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Loading packages...</p>
                </div>
            ) : packages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                    <Box size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No spread packages found</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {packages.map((pkg) => (
                        <div key={pkg._id} style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: pkg.popular ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden'
                        }}>
                            {!pkg.active && (
                                <div style={{
                                    position: 'absolute', top: '12px', left: '-35px', background: '#ef4444', color: 'white',
                                    fontSize: '9px', fontWeight: '900', padding: '4px 40px', transform: 'rotate(-45deg)',
                                    textTransform: 'uppercase', letterSpacing: '0.1em', zIndex: 10
                                }}>Inactive</div>
                            )}
                            {pkg.popular && (
                                <div style={{
                                    position: 'absolute', top: '12px', right: '-35px', background: '#f59e0b', color: 'black',
                                    fontSize: '10px', fontWeight: '900', padding: '4px 40px', transform: 'rotate(45deg)',
                                    textTransform: 'uppercase', letterSpacing: '0.1em'
                                }}>Popular</div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '14px',
                                    background: `linear-gradient(to bottom right, ${pkg.color?.split(' ')[0].replace('from-', '') || '#3b82f6'}, ${pkg.color?.split(' ')[1].replace('to-', '') || '#60a5fa'})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                                }}>
                                    <Sparkles size={24} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{pkg.name}</h3>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase' }}>{pkg.duration} Plan</span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>${pkg.price}</div>
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Per billing cycle</span>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', opacity: 0.3, textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Features included</div>
                                {pkg.features.map((f: string, i: number) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '8px', opacity: 0.8 }}>
                                        <CheckCircle2 size={14} color="#10b981" /> {f}
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleOpenModal(pkg)} data-tooltip="Edit Package Details" style={{ ...btnStyle, flex: 1, background: 'rgba(59,130,246,0.15)', color: '#bfdbfe', border: '1px solid rgba(59,130,246,0.2)' }}>
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(pkg._id)} data-tooltip="Delete Package Permanently" style={{ ...btnStyle, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, padding: '20px'
                }}>
                    <div style={{
                        background: '#1a163a', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '24px', width: '100%', maxWidth: '500px',
                        padding: '32px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                    }}>
                        <button onClick={() => setIsModalOpen(false)} style={{
                            position: 'absolute', top: '24px', right: '24px',
                            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer'
                        }}><X size={20} /></button>

                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {editingPackage ? <Edit2 size={20} /> : <Plus size={20} />}
                            {editingPackage ? 'Edit Spread Package' : 'Create New Package'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Package Name</label>
                                <input
                                    type="text" required value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle} placeholder="e.g. Growth Catalyst"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Price ($)</label>
                                    <input
                                        type="number" required value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={inputGroupStyle}>
                                    <label style={labelStyle}>Duration</label>
                                    <select
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                        style={inputStyle}
                                    >
                                        <option value="Month">Month</option>
                                        <option value="Year">Year</option>
                                        <option value="Lifetime">Lifetime</option>
                                    </select>
                                </div>
                            </div>

                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Features (One per line)</label>
                                <textarea
                                    required rows={4} value={formData.features}
                                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                                    style={{ ...inputStyle, resize: 'none', height: '100px' }}
                                    placeholder="Social Media Basic&#10;1,000 Impressions..."
                                />
                            </div>

                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Gradient Color Class (Tailwind)</label>
                                <input
                                    type="text" value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    style={inputStyle}
                                    placeholder="from-blue-500 to-blue-600"
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>
                                    <input
                                        type="checkbox" checked={formData.popular}
                                        onChange={e => setFormData({ ...formData, popular: e.target.checked })}
                                    /> Popular Tag
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>
                                    <input
                                        type="checkbox" checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                    /> Active Status
                                </label>
                            </div>

                            <button type="submit" style={{
                                marginTop: '12px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                border: 'none', borderRadius: '12px', color: 'white', padding: '14px',
                                fontWeight: '800', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '10px',
                                fontSize: '15px'
                            }}>
                                <Save size={18} /> {editingPackage ? 'Update Package' : 'Create Package'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

const btnStyle: any = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '10px 14px', borderRadius: '12px', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '700', transition: 'all 0.2s'
};

const inputGroupStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '6px'
};

const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', letterSpacing: '0.05em'
};

const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '12px 14px', color: 'white', fontSize: '13px',
    outline: 'none'
};
