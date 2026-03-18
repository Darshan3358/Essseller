'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Trash2, Plus, Edit2, RefreshCw, X, Package, Store, ArrowLeft } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL;

type ProductForm = {
    name: string;
    description: string;
    price: string;
    selling_price: string;
    profit: string;
    category: string;
    brand: string;
    image: string;
    margin?: string;
};

const emptyForm: ProductForm = { name: '', description: '', price: '', selling_price: '', profit: '', category: '', brand: '', image: '', margin: '' };

function AdminProductsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sellerIdParam = searchParams.get('seller_id') || '';
    const sellerNameParam = searchParams.get('seller_name') || '';

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [catFilter, setCatFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editProduct, setEditProduct] = useState<any>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [formError, setFormError] = useState('');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const params = new URLSearchParams({ page: String(page), keyword, category: catFilter });
        if (sellerIdParam) params.set('seller_id', sellerIdParam);
        const res = await fetch(`${API}/admin/products?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setProducts(data.products);
            setTotal(data.total);
            setPages(data.pages);
            if (data.categories) setCategories(data.categories);
        }
        setLoading(false);
    }, [page, keyword, catFilter, sellerIdParam]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const openAdd = () => {
        setEditProduct(null);
        setForm(emptyForm);
        setImageFile(null);
        setImagePreview('');
        setFormError('');
        setShowForm(true);
    };

    const openEdit = (p: any) => {
        setEditProduct(p);
        setForm({
            name: p.name || '',
            description: p.description || '',
            price: String(p.price || ''),
            selling_price: String(p.selling_price || ''),
            profit: String(p.profit || ''),
            category: p.category || '',
            brand: p.brand || '',
            image: p.image || '',
            margin: '',
        });
        setImageFile(null);
        setImagePreview(p.image ? (p.image.startsWith('/') ? `http://localhost:5000${p.image}` : p.image) : '');
        setFormError('');
        setShowForm(true);
    };

    const handleFormChange = (field: keyof ProductForm | 'margin', val: string) => {
        const updated = { ...form, [field]: val } as any;
        
        if (field === 'selling_price') {
            const s = parseFloat(val) || 0;
            const m = parseFloat(updated.margin || '0');
            if (m > 0 && s > 0) {
                const cost = s - (s * m / 100);
                updated.price = String(cost);
                updated.profit = String(Math.max(0, s - cost));
            } else {
                const p = parseFloat(updated.price) || 0;
                updated.profit = String(Math.max(0, s - p));
            }
        } else if (field === 'price') {
            const p = parseFloat(val) || 0;
            const s = parseFloat(updated.selling_price) || 0;
            updated.profit = String(Math.max(0, s - p));
            updated.margin = '';
        } else if (field === 'margin') {
            const m = parseFloat(val) || 0;
            const s = parseFloat(updated.selling_price) || 0;
            if (s > 0 && m > 0) {
                const cost = s - (s * m / 100);
                updated.price = String(cost);
                updated.profit = String(Math.max(0, s - cost));
            }
        } else if (field === 'profit') {
            // Usually profit is auto-calculated, but if they type it:
            updated.margin = '';
        }
        
        setForm(updated);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        if (!form.name || !form.description || !form.price || !form.selling_price || !form.category) {
            setFormError('Please fill all required fields.');
            return;
        }
        if (!editProduct && !imageFile && !form.image) {
            setFormError('Please upload a product image.');
            return;
        }

        setSaving(true);
        const token = localStorage.getItem('adminToken');

        try {
            let res;
            if (imageFile) {
                const fd = new FormData();
                Object.entries(form).forEach(([k, v]) => {
                    if (k !== 'margin') fd.append(k, String(v));
                });
                fd.append('image', imageFile);
                const endpoint = editProduct ? `${API}/admin/products/${editProduct._id}` : `${API}/admin/products`;
                res = await fetch(endpoint, {
                    method: editProduct ? 'PUT' : 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: fd
                });
            } else {
                const submitData = { ...form } as any;
                delete submitData.margin;
                const endpoint = editProduct ? `${API}/admin/products/${editProduct._id}` : `${API}/admin/products`;
                res = await fetch(endpoint, {
                    method: editProduct ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(submitData)
                });
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed');
            setShowForm(false);
            await fetchProducts();
        } catch (err: any) {
            setFormError(err.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Remove "${name}" from storehouse?`)) return;
        setActionLoading(id);
        const token = localStorage.getItem('adminToken');
        await fetch(`${API}/admin/products/${id}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
        await fetchProducts();
        setActionLoading(null);
    };

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    {sellerIdParam ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                <button
                                    onClick={() => router.push('/admin/dashboard/products')}
                                    style={{
                                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '8px', padding: '5px 10px', cursor: 'pointer',
                                        color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px'
                                    }}
                                >
                                    <ArrowLeft size={13} /> All Products
                                </button>
                            </div>
                            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Store size={22} style={{ color: '#10b981' }} />
                                {decodeURIComponent(sellerNameParam)}'s Products
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>{total} products added by this seller</p>
                        </>
                    ) : (
                        <>
                            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Products (Storehouse)</h1>
                            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>{total} total products</p>
                        </>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={fetchProducts} style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', color: 'rgba(255,255,255,0.6)', padding: '9px 12px', cursor: 'pointer', display: 'flex'
                    }}><RefreshCw size={15} /></button>
                    {!sellerIdParam && (
                        <button onClick={openAdd} style={{
                            padding: '9px 18px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                            border: 'none', borderRadius: '10px', color: 'white', fontWeight: '700',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
                        }}><Plus size={16} /> Add Product</button>
                    )}
                </div>
            </div>

            {/* Filters row */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '350px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input
                        value={keyword}
                        onChange={e => { setKeyword(e.target.value); setPage(1); }}
                        placeholder="Search products..."
                        style={{
                            width: '100%', padding: '10px 10px 10px 36px',
                            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                        }}
                    />
                </div>
                <select
                    value={catFilter}
                    onChange={e => { setCatFilter(e.target.value); setPage(1); }}
                    style={{
                        padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                        color: catFilter ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '13px', outline: 'none', cursor: 'pointer'
                    }}
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c} style={{ background: '#1e293b' }}>{c}</option>)}
                </select>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                    <div style={{
                        display: 'inline-block', width: '36px', height: '36px',
                        border: '3px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6',
                        borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                    }} />
                </div>
            ) : products.length === 0 ? (
                <div style={{
                    padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.3)',
                    background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)'
                }}>
                    <Package size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <div style={{ fontSize: '16px' }}>No products found</div>
                    <p style={{ fontSize: '13px', marginTop: '8px' }}>Add products to the storehouse</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '16px', marginBottom: '24px'
                }}>
                    {products.map(p => (
                        <div key={p._id} style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s'
                        }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                            }}
                        >
                            {/* Image */}
                            <div style={{ height: '150px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', position: 'relative' }}>
                                {p.image ? (
                                    <img
                                        src={p.image.startsWith('/') ? `http://localhost:5000${p.image}` : p.image}
                                        alt={p.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150/1a1740/6366f1?text=No+Image'; }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <Package size={40} style={{ opacity: 0.2 }} />
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute', top: '8px', right: '8px',
                                    padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600',
                                    background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)'
                                }}>{p.category}</div>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '14px' }}>
                                <div style={{ 
                                    fontWeight: '700', 
                                    fontSize: '14px', 
                                    marginBottom: '4px', 
                                    lineHeight: '1.3',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    minHeight: '3.9em'
                                }}
                                    title={p.name}>
                                    {p.name}
                                </div>
                                {p.brand && (
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '8px' }}>{p.brand}</div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Cost</div>
                                        <div style={{ fontWeight: '700', color: '#f87171', fontSize: '14px' }}>₹{p.price}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Sell</div>
                                        <div style={{ fontWeight: '700', color: '#10b981', fontSize: '14px' }}>₹{p.selling_price}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Profit</div>
                                        <div style={{ fontWeight: '700', color: '#fbbf24', fontSize: '14px' }}>₹{p.profit}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => openEdit(p)}
                                        data-tooltip="Edit Product"
                                        style={{
                                            flex: 1, padding: '8px', background: 'rgba(59,130,246,0.15)',
                                            border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px',
                                            color: '#93c5fd', cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center'
                                        }}
                                    ><Edit2 size={16} /></button>
                                    <button
                                        onClick={() => handleDelete(p._id, p.name)}
                                        disabled={actionLoading === p._id}
                                        data-tooltip="Remove Product"
                                        style={{
                                            flex: 1, padding: '8px', background: 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
                                            color: '#f87171', cursor: 'pointer', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center'
                                        }}
                                    ><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setPage(p)} style={{
                            width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                            background: p === page ? 'linear-gradient(135deg, #3b82f6, #60a5fa)' : 'rgba(255,255,255,0.06)',
                            color: p === page ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                        }}>{p}</button>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px', overflowY: 'auto'
                }}>
                    <div style={{
                        background: '#0f172a', border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '560px',
                        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'white' }}>
                                {editProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button onClick={() => setShowForm(false)} style={{
                                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', padding: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex'
                            }}><X size={18} /></button>
                        </div>

                        {formError && (
                            <div style={{
                                padding: '12px 16px', background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px',
                                color: '#fca5a5', fontSize: '13px', marginBottom: '16px'
                            }}>{formError}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {/* Image Upload */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                    Product Image {!editProduct && <span style={{ color: '#f87171' }}>*</span>}
                                </label>
                                <div style={{
                                    border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '12px',
                                    padding: '20px', textAlign: 'center', cursor: 'pointer', position: 'relative',
                                    background: 'rgba(255,255,255,0.03)'
                                }}
                                    onClick={() => document.getElementById('prod-img-input')?.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="" style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'contain' }} />
                                    ) : (
                                        <>
                                            <Package size={32} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '8px' }} />
                                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>Click to upload image</p>
                                        </>
                                    )}
                                    <input id="prod-img-input" type="file" accept="image/*" onChange={handleImageChange}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                                </div>
                                {editProduct && (
                                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '6px' }}>Leave blank to keep existing image</p>
                                )}
                            </div>

                            {/* Name */}
                            <FormField label="Product Name *" value={form.name} onChange={v => handleFormChange('name', v)} placeholder="e.g. Wireless Headphones" />

                            {/* Description */}
                            <div style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                    Description *
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={e => handleFormChange('description', e.target.value)}
                                    placeholder="Product description..."
                                    rows={3}
                                    style={{
                                        width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                        color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical',
                                        boxSizing: 'border-box', fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            {/* Category & Brand */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                <FormField label="Category *" value={form.category} onChange={v => handleFormChange('category', v)} placeholder="e.g. Electronics" />
                                <FormField label="Brand" value={form.brand} onChange={v => handleFormChange('brand', v)} placeholder="e.g. Sony" />
                            </div>

                            {/* Prices */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                                <FormField label="Selling Price *" value={form.selling_price} onChange={v => handleFormChange('selling_price', v)} placeholder="0" type="number" />
                                <div style={{ marginBottom: '14px' }}>
                                    <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                                        Margin %
                                    </label>
                                    <select
                                        value={form.margin || ''}
                                        onChange={e => handleFormChange('margin', e.target.value)}
                                        style={{
                                            width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.07)',
                                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
                                            color: 'white', fontSize: '14px', outline: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        <option value="" style={{ background: '#0f172a' }}>Custom</option>
                                        <option value="5" style={{ background: '#0f172a' }}>5%</option>
                                        <option value="7" style={{ background: '#0f172a' }}>7%</option>
                                        <option value="10" style={{ background: '#0f172a' }}>10%</option>
                                        <option value="15" style={{ background: '#0f172a' }}>15%</option>
                                        <option value="20" style={{ background: '#0f172a' }}>20%</option>
                                    </select>
                                </div>
                                <FormField label="Cost Price *" value={form.price} onChange={v => handleFormChange('price', v)} placeholder="0" type="number" />
                                <FormField label="Profit" value={form.profit} onChange={v => handleFormChange('profit', v)} placeholder="0" type="number" />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setShowForm(false)} style={{
                                    flex: 1, padding: '13px', background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                    color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                                }}>Cancel</button>
                                <button type="submit" disabled={saving} style={{
                                    flex: 2, padding: '13px', background: saving ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                    border: 'none', borderRadius: '12px', color: 'white',
                                    fontWeight: '700', fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    boxShadow: saving ? 'none' : '0 8px 20px rgba(59,130,246,0.35)'
                                }}>
                                    {saving ? (
                                        <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    ) : editProduct ? 'Update Product' : '+ Add to Storehouse'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                input[type=number]::-webkit-inner-spin-button { opacity: 0; }
                input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25) !important; }
                option { background: #0f172a; }
            `}</style>
        </div>
    );
}

function FormField({ label, value, onChange, placeholder, type = 'text' }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    type?: string;
}) {
    return (
        <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%', padding: '11px 14px',
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.2s'
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(59,130,246,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
        </div>
    );
}

export default function AdminProductsPageWrapper() {
    return (
        <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>}>
            <AdminProductsPage />
        </Suspense>
    );
}
