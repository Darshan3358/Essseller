'use client';

import { useEffect, useState, useCallback } from 'react';
import { Package, Plus, Edit2, Trash2, Save, X, RefreshCw, CheckCircle2, Star, Zap } from 'lucide-react';

const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '13px', outline: 'none'
};

const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '0.05em'
};

const btnStyle: any = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
    fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
};

export default function AdminPackagePlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>(null);

    // Helper functions for formatting/parsing numbers with K/M suffixes
    const parseFriendlyNumber = (val: string): number => {
        if (!val) return 0;
        const s = val.toString().toUpperCase().trim();
        let num = parseFloat(s) || 0;
        if (s.endsWith('K')) num = parseFloat(s.slice(0, -1)) * 1000;
        else if (s.endsWith('M')) num = parseFloat(s.slice(0, -1)) * 1000000;
        return num;
    };

    const formatFriendlyNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return Math.max(0, Math.floor(num)).toString();
    };

    const updateBannerField = (value: string) => {
        const totalNum = parseFriendlyNumber(value);
        setPlanBanner({ 
            ...planBanner, 
            views_text: value,
            used_text: '0',
            remaining_text: formatFriendlyNumber(totalNum)
        });
    };

    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState<any>({
        sku: '',
        name: '',
        price_label: '$',
        amount: 0,
        description: '',
        features: '',
        color: 'from-blue-500 to-cyan-500',
        popular: false,
        activeBg: 'bg-blue-500',
        product_limit: 5000,
        views_limit: 10000,
        order_index: 0
    });

    const [planBanner, setPlanBanner] = useState<any>({
        plan_title: 'Enterprise Pro',
        used_text: '0',
        remaining_text: '0',
        views_text: '0',
        features: [
            { text: '', icon: '' },
            { text: '', icon: '' },
            { text: '', icon: '' },
            { text: '', icon: '' }
        ]
    });
    const [savingBanner, setSavingBanner] = useState(false);

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        try {
            const [plansRes, bannerRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/package-plans`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/plan-display`)
            ]);

            const plansData = await plansRes.json();
            if (plansData.success) setPlans(plansData.data);

            const bannerData = await bannerRes.json();
            if (bannerData.success && bannerData.data) setPlanBanner(bannerData.data);

        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPlans(); }, [fetchPlans]);

    const handleSaveBanner = async () => {
        setSavingBanner(true);
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/plan-display`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(planBanner)
            });
            const data = await res.json();
            if (data.success) {
                alert('Plan banner updated successfully');
            }
        } catch (err) {
            console.error('Failed to save banner:', err);
        } finally {
            setSavingBanner(false);
        }
    };

    const handleEdit = (plan: any) => {
        setIsEditing(plan._id);
        setEditForm({ ...plan, features: plan.features.join('\n') });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const body = {
                ...editForm,
                features: editForm.features.split('\n').filter((f: string) => f.trim() !== '')
            };
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/package-plans/${isEditing}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setPlans(plans.map(p => p._id === isEditing ? data.data : p));
                setIsEditing(null);
            } else {
                alert(data.message || 'Update failed');
            }
        } catch (err) {
            console.error('Save failed:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this plan?')) return;
        const token = localStorage.getItem('adminToken');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/package-plans/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setPlans(plans.filter(p => p._id !== id));
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleAdd = async () => {
        const token = localStorage.getItem('adminToken');
        try {
            const body = {
                ...addForm,
                features: addForm.features.split('\n').filter((f: string) => f.trim() !== '')
            };
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/package-plans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setPlans([...plans, data.data].sort((a, b) => a.order_index - b.order_index));
                setShowAdd(false);
                setAddForm({
                    sku: '', name: '', price_label: '$', amount: 0,
                    description: '', features: '', color: 'from-blue-500 to-cyan-500',
                    popular: false, activeBg: 'bg-blue-500', product_limit: 5000, order_index: plans.length
                });
            } else {
                alert(data.message || 'Creation failed');
            }
        } catch (err) {
            console.error('Add failed:', err);
        }
    };

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>System Package Plans</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                        Configure the available merchant tiers shown on the user frontend.
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', border: 'none',
                        borderRadius: '8px', color: 'white', padding: '10px 18px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700'
                    }}
                >
                    <Plus size={18} /> Add New Plan
                </button>
            </div>

            {/* Plan Display Card (New request) */}
            <div style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: '24px', padding: '24px',
                border: '1px solid rgba(255,255,255,0.08)', marginBottom: '40px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>Dashboard Plan Banner</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Configure the main plan title and feature badges shown on the seller dashboard.</p>
                    </div>
                    <button
                        onClick={handleSaveBanner}
                        disabled={savingBanner}
                        style={{ ...btnStyle, background: '#10b981', color: 'white', padding: '8px 24px' }}>
                        {savingBanner ? <RefreshCw size={16} style={{ animation: 'spin 1.5s linear infinite' }} /> : <Save size={16} />}
                        Save Banner Data
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Banner Title</label>
                            <input
                                style={inputStyle}
                                value={planBanner.plan_title}
                                onChange={e => setPlanBanner({ ...planBanner, plan_title: e.target.value })}
                                placeholder="e.g. Enterprise Pro"
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                            <div>
                                <label style={labelStyle}>Total Views Limit (Set by Admin)</label>
                                <input 
                                    style={inputStyle} 
                                    value={planBanner.views_text} 
                                    onChange={e => updateBannerField(e.target.value)} 
                                    placeholder="e.g. 10K" 
                                />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Feature Badges</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {planBanner.features.map((f: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: '6px' }}>
                                        <input
                                            style={{ ...inputStyle, width: '45px', textAlign: 'center' }}
                                            value={f.icon}
                                            onChange={e => {
                                                const nf = [...planBanner.features];
                                                nf[i].icon = e.target.value;
                                                setPlanBanner({ ...planBanner, features: nf });
                                            }}
                                            placeholder="⚡"
                                        />
                                        <input
                                            style={inputStyle}
                                            value={f.text}
                                            onChange={e => {
                                                const nf = [...planBanner.features];
                                                nf[i].text = e.target.value;
                                                setPlanBanner({ ...planBanner, features: nf });
                                            }}
                                            placeholder="Feature"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div style={{
                        background: 'linear-gradient(135deg, #3b82f6, #60a5fa, #ec4899)',
                        borderRadius: '20px', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', padding: '32px',
                        color: 'white', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(2px)' }}></div>
                        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                <Star size={20} />
                            </div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 12px' }}>{planBanner.plan_title}</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                                {planBanner.features.map((f: any, i: number) => (
                                    <span key={i} style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '700' }}>
                                        {f.icon} {f.text}
                                    </span>
                                ))}
                            </div>

                            {/* Views/Used/Rem Preview Section */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', width: '100%', maxWidth: '300px' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'white' }}>{planBanner.used_text || '0'}</p>
                                    <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Used</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: 'white' }}>{planBanner.remaining_text || '0'}</p>
                                    <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Remaining</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#fbcfe8' }}>{planBanner.views_text || '0'}</p>
                                    <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>Views</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px' }}>Membership Tiers</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Configure the actual purchaseable plans.</p>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {loading ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
                        <RefreshCw size={32} style={{ animation: 'spin 1.5s linear infinite', color: '#3b82f6', marginBottom: '16px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Synchronizing plans...</p>
                    </div>
                ) : plans.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px' }}>
                        <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.4)' }}>No plans configured yet</p>
                    </div>
                ) : plans.map(plan => (
                    <div key={plan._id} style={{
                        background: 'rgba(255,255,255,0.04)', border: plan.popular ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden'
                    }}>
                        {plan.popular && (
                            <div style={{
                                position: 'absolute', top: '12px', right: '-35px', background: '#f59e0b', color: 'black',
                                fontSize: '10px', fontWeight: '900', padding: '4px 40px', transform: 'rotate(45deg)',
                                textTransform: 'uppercase', letterSpacing: '0.1em'
                            }}>Popular</div>
                        )}

                        {isEditing === plan._id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input placeholder="SKU (e.g. silver)" value={editForm.sku} onChange={e => setEditForm({ ...editForm, sku: e.target.value })} style={inputStyle} />
                                <input placeholder="Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input placeholder="$ label" value={editForm.price_label} onChange={e => setEditForm({ ...editForm, price_label: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                                    <input type="number" placeholder="Amount" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: Number(e.target.value) })} style={{ ...inputStyle, flex: 1 }} />
                                </div>
                                <input placeholder="Product Limit" type="number" value={editForm.product_limit} onChange={e => setEditForm({ ...editForm, product_limit: Number(e.target.value) })} style={inputStyle} />
                                <textarea placeholder="Description" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ ...inputStyle, height: '60px' }} />
                                <textarea placeholder="Features (one per line)" value={editForm.features} onChange={e => setEditForm({ ...editForm, features: e.target.value })} style={{ ...inputStyle, height: '100px' }} />

                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                                        <input type="checkbox" checked={editForm.popular} onChange={e => setEditForm({ ...editForm, popular: e.target.checked })} /> Most Popular
                                    </label>
                                    <input type="number" placeholder="Sort Order" value={editForm.order_index} onChange={e => setEditForm({ ...editForm, order_index: Number(e.target.value) })} style={{ ...inputStyle, width: '80px' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                    <button onClick={handleSave} style={{ ...btnStyle, flex: 1, background: '#10b981' }}><Save size={16} /> Save Changes</button>
                                    <button onClick={() => setIsEditing(null)} style={{ ...btnStyle, background: 'rgba(255,255,255,0.05)', color: 'white' }}><X size={16} /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '14px',
                                        background: `linear-gradient(135deg, #3b82f6, #a855f7)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Zap size={24} color="white" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{plan.name}</h3>
                                        <span style={{ fontSize: '10px', fontWeight: '700', opacity: 0.4, textTransform: 'uppercase' }}>SKU: {plan.sku}</span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>{plan.price_label}</div>
                                    <p style={{ fontSize: '13px', opacity: 0.5, margin: '4px 0' }}>{plan.description}</p>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '800', opacity: 0.3, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Features included</div>
                                    {plan.features.map((f: string, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '6px', opacity: 0.8 }}>
                                            <CheckCircle2 size={12} color="#10b981" /> {f}
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px', paddingTop: '8px', fontSize: '13px', fontWeight: '700', color: '#3b82f6' }}>
                                        {plan.product_limit.toLocaleString()} Products Limit
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleEdit(plan)} data-tooltip="Edit Plan Details" style={{ ...btnStyle, flex: 1, background: 'rgba(59,130,246,0.15)', color: '#bfdbfe', border: '1px solid rgba(59,130,246,0.2)' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(plan._id)} data-tooltip="Delete Plan Permanently" style={{ ...btnStyle, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAdd && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{ background: '#1c1c1c', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0 }}>Add New Package Plan</h2>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}><label style={labelStyle}>Plan SKU</label><input placeholder="e.g. silver" value={addForm.sku} onChange={e => setAddForm({ ...addForm, sku: e.target.value })} style={inputStyle} /></div>
                                <div style={{ flex: 1 }}><label style={labelStyle}>Plan Name</label><input placeholder="Starter Merchant" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} style={inputStyle} /></div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}><label style={labelStyle}>Price Label</label><input placeholder="$50" value={addForm.price_label} onChange={e => setAddForm({ ...addForm, price_label: e.target.value })} style={inputStyle} /></div>
                                <div style={{ flex: 1 }}><label style={labelStyle}>Numeric Amount</label><input type="number" placeholder="50" value={addForm.amount} onChange={e => setAddForm({ ...addForm, amount: Number(e.target.value) })} style={inputStyle} /></div>
                            </div>
                            <div>
                                <label style={labelStyle}>Product Listing Limit</label>
                                <input type="number" value={addForm.product_limit} onChange={e => setAddForm({ ...addForm, product_limit: Number(e.target.value) })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Features (One per line)</label>
                                <textarea placeholder="5000 Products Limit&#10;Basic Analytics" value={addForm.features} onChange={e => setAddForm({ ...addForm, features: e.target.value })} style={{ ...inputStyle, height: '100px' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={addForm.popular} onChange={e => setAddForm({ ...addForm, popular: e.target.checked })} /> Mark as Popular
                                </label>
                                <input type="number" placeholder="Order" value={addForm.order_index} onChange={e => setAddForm({ ...addForm, order_index: Number(e.target.value) })} style={{ ...inputStyle, width: '80px' }} />
                            </div>

                            <button onClick={handleAdd} style={{
                                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', color: 'white',
                                fontWeight: '700', marginTop: '12px', cursor: 'pointer'
                            }}>Create Package Plan</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
