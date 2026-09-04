'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Save, RefreshCw, Upload, Trash2, QrCode } from 'lucide-react';

const CRYPTO_NETWORKS = [
    { key: 'usdt_trc20', label: 'USDT TRC20 Address', placeholder: 'TRC20 address (starts with T...)' },
    { key: 'usdt_erc20', label: 'USDT ERC20 Address', placeholder: 'ERC20 address (starts with 0x...)' },
    { key: 'btc', label: 'Bitcoin (BTC) Address', placeholder: 'BTC wallet address' },
    { key: 'bnb', label: 'BNB (BEP20) Address', placeholder: 'BNB address (starts with 0x...)' },
];

const BANK_FIELDS = [
    { key: 'bank_name', label: 'Bank Name', placeholder: 'e.g. HDFC Bank, State Bank of India' },
    { key: 'account_name', label: 'Account Holder Name', placeholder: 'Full name as on bank account' },
    { key: 'account_number', label: 'Account Number', placeholder: 'Bank account number' },
    { key: 'ifsc_code', label: 'IFSC Code', placeholder: 'e.g. HDFC0001234' },
    { key: 'branch', label: 'Branch Name', placeholder: 'e.g. Mumbai Main Branch' },
    { key: 'swift_code', label: 'SWIFT / BIC Code', placeholder: 'For international transfers (optional)' },
];

const emptyForm = (keys: string[]) => Object.fromEntries(keys.map(k => [k, '']));

export default function AdminSettingsPage() {
    const [tab, setTab] = useState<'crypto' | 'bank' | 'security'>('crypto');
    const [cryptoForm, setCryptoForm] = useState<any>({
        usdt_trc20: '', usdt_erc20: '', btc: '', bnb: '', qr_code_url: '',
        network_note: 'Please verify the network before sending. Wrong network = lost funds.',
        min_deposit: '10'
    });
    const [bankForm, setBankForm] = useState<any>({
        ...emptyForm(['bank_name', 'account_name', 'account_number', 'ifsc_code', 'branch', 'swift_code']),
        qr_code_url: '',
        note: 'Please include your email as payment reference'
    });
    const [securityForm, setSecurityForm] = useState<any>({
        mask_sign: '*'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingQr, setUploadingQr] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const getToken = () => sessionStorage.getItem('adminToken');

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const [cRes, bRes, sRes] = await Promise.all([
                fetch(`${API_URL}/settings/crypto`).then(r => r.json()),
                fetch(`${API_URL}/settings/bank`).then(r => r.json()),
                fetch(`${API_URL}/settings/security`).then(r => r.json()),
            ]);
            if (cRes.success && cRes.crypto) {
                setCryptoForm({
                    usdt_trc20: cRes.crypto.usdt_trc20 || '',
                    usdt_erc20: cRes.crypto.usdt_erc20 || '',
                    btc: cRes.crypto.btc || '',
                    bnb: cRes.crypto.bnb || '',
                    qr_code_url: cRes.crypto.qr_code_url || '',
                    network_note: cRes.crypto.network_note || '',
                    min_deposit: String(cRes.crypto.min_deposit || '10'),
                });
            }
            if (bRes.success && bRes.bank) {
                setBankForm({
                    bank_name: bRes.bank.bank_name || '',
                    account_name: bRes.bank.account_name || '',
                    account_number: bRes.bank.account_number || '',
                    ifsc_code: bRes.bank.ifsc_code || '',
                    branch: bRes.bank.branch || '',
                    swift_code: bRes.bank.swift_code || '',
                    qr_code_url: bRes.bank.qr_code_url || '',
                    note: bRes.bank.note || '',
                });
            }
            if (sRes.success && sRes.security) {
                setSecurityForm({
                    mask_sign: sRes.security.mask_sign || '*',
                });
            }
        } catch (e) {
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            const endpoint = tab === 'crypto' ? 'crypto' : tab === 'bank' ? 'bank' : 'security';
            const body = tab === 'crypto'
                ? { ...cryptoForm, min_deposit: Number(cryptoForm.min_deposit) }
                : tab === 'bank' ? bankForm : securityForm;

            const res = await fetch(`${API_URL}/settings/${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setError(data.message || 'Failed to save');
            }
        } catch (e: any) {
            setError(e.message || 'Error saving');
        } finally {
            setSaving(false);
        }
    };

    const handleUploadQr = async (file: File, formType: 'bank' | 'crypto') => {
        setUploadingQr(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('qr_image', file);
            formData.append('type', formType);
            const res = await fetch(`${API_URL}/settings/upload-qr`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success && data.url) {
                if (formType === 'bank') {
                    const updated = { ...bankForm, qr_code_url: data.url };
                    setBankForm(updated);
                    await fetch(`${API_URL}/settings/bank`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                        body: JSON.stringify(updated)
                    });
                } else {
                    const updated = { ...cryptoForm, qr_code_url: data.url };
                    setCryptoForm(updated);
                    await fetch(`${API_URL}/settings/crypto`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                        body: JSON.stringify({ ...updated, min_deposit: Number(updated.min_deposit) })
                    });
                }
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setError(data.message || 'Failed to upload QR image');
            }
        } catch (err: any) {
            setError(err.message || 'Error uploading QR image');
        } finally {
            setUploadingQr(false);
        }
    };

    const handleRemoveQr = async (formType: 'bank' | 'crypto') => {
        setSaving(true);
        try {
            if (formType === 'bank') {
                const updated = { ...bankForm, qr_code_url: '' };
                setBankForm(updated);
                await fetch(`${API_URL}/settings/bank`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                    body: JSON.stringify(updated)
                });
            } else {
                const updated = { ...cryptoForm, qr_code_url: '' };
                setCryptoForm(updated);
                await fetch(`${API_URL}/settings/crypto`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                    body: JSON.stringify({ ...updated, min_deposit: Number(updated.min_deposit) })
                });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            setError(e.message || 'Failed to remove QR');
        } finally {
            setSaving(false);
        }
    };

    const S: any = {
        card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' },
        label: { display: 'block', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: '8px' },
        input: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: 'white', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const },
    };

    return (
        <div style={{ padding: '32px', color: 'white', maxWidth: '720px' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Site Settings</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                    Configure global site configurations, payment details, and dashboard display elements.
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
                {[
                    { key: 'crypto', label: '₿  Crypto' },
                    { key: 'bank', label: '🏦  Bank' },
                    { key: 'security', label: '🔒  Security' },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key as any)} style={{
                        flex: 1, padding: '10px', borderRadius: '9px', border: 'none',
                        background: tab === t.key ? 'rgba(59,130,246,0.3)' : 'transparent',
                        color: tab === t.key ? '#bfdbfe' : 'rgba(255,255,255,0.4)',
                        fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
                    }}>{t.label}</button>
                ))}
            </div>

            {/* Alerts */}
            {saved && (
                <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#10b981', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} /> Settings saved successfully!
                </div>
            )}
            {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '14px', fontWeight: '600' }}>
                    ❌ {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                    <RefreshCw size={20} style={{ margin: '0 auto 8px', display: 'block', animation: 'spin 1s linear infinite' }} />
                    Loading...
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* ===== CRYPTO TAB ===== */}
                    {tab === 'crypto' && (
                        <>
                            <div style={S.card}>
                                <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Wallet Addresses</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {CRYPTO_NETWORKS.map(net => (
                                        <div key={net.key}>
                                            <label style={S.label}>{net.label}</label>
                                            <input
                                                type="text"
                                                value={cryptoForm[net.key]}
                                                onChange={e => setCryptoForm({ ...cryptoForm, [net.key]: e.target.value })}
                                                placeholder={net.placeholder}
                                                style={{ ...S.input, fontFamily: 'monospace' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={S.card}>
                                <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Display Settings</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={S.label}>Minimum Deposit Amount ($)</label>
                                        <input type="number" value={cryptoForm.min_deposit} onChange={e => setCryptoForm({ ...cryptoForm, min_deposit: e.target.value })}
                                            style={{ ...S.input, width: '140px' }} />
                                    </div>
                                    <div>
                                        <label style={S.label}>Network Warning Note (shown to sellers)</label>
                                        <textarea value={cryptoForm.network_note} onChange={e => setCryptoForm({ ...cryptoForm, network_note: e.target.value })}
                                            placeholder="e.g. Make sure to use TRC20 network for USDT. Wrong network = lost funds."
                                            style={{ ...S.input, minHeight: '80px', resize: 'vertical' }} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===== BANK TAB ===== */}
                    {tab === 'bank' && (
                        <>
                            <div style={S.card}>
                                <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bank Account Details</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    {BANK_FIELDS.map(field => (
                                        <div key={field.key} style={{ gridColumn: field.key === 'account_name' || field.key === 'bank_name' ? 'span 2' : 'span 1' }}>
                                            <label style={S.label}>{field.label}</label>
                                            <input
                                                type="text"
                                                value={bankForm[field.key]}
                                                onChange={e => setBankForm({ ...bankForm, [field.key]: e.target.value })}
                                                placeholder={field.placeholder}
                                                style={{ ...S.input, fontFamily: field.key === 'account_number' || field.key === 'ifsc_code' || field.key === 'swift_code' ? 'monospace' : 'inherit' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={S.card}>
                                <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bank / UPI QR Code</h2>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }}>
                                    Upload your UPI / Bank Payment QR code image (PhonePe, GPay, Paytm, or NetBanking QR). It will be displayed to sellers on the Deposit & Payment page.
                                </p>
                                {bankForm.qr_code_url ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ background: '#ffffff', padding: '8px', borderRadius: '10px', display: 'inline-block' }}>
                                            <img
                                                src={bankForm.qr_code_url.startsWith('http') ? bankForm.qr_code_url : `${API_URL.replace('/api', '')}${bankForm.qr_code_url}`}
                                                alt="Bank QR Code"
                                                style={{ width: '120px', height: '120px', objectFit: 'contain', display: 'block' }}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', marginBottom: '6px' }}>✓ Bank / UPI QR Code Active</div>
                                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', wordBreak: 'break-all' }}>{bankForm.qr_code_url}</p>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQr('bank')}
                                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <Trash2 size={14} /> Remove QR
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 24px', background: 'rgba(59,130,246,0.15)', border: '1px dashed rgba(59,130,246,0.4)', borderRadius: '12px', color: '#bfdbfe', cursor: uploadingQr ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700' }}>
                                        <Upload size={16} /> {uploadingQr ? 'Uploading QR Image...' : 'Click to Upload Bank / UPI QR Image'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            disabled={uploadingQr}
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) handleUploadQr(file, 'bank');
                                            }}
                                        />
                                    </label>
                                )}
                            </div>

                            <div style={S.card}>
                                <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Instruction Note</h2>
                                <div>
                                    <label style={S.label}>Note shown to sellers when transferring (optional)</label>
                                    <textarea value={bankForm.note} onChange={e => setBankForm({ ...bankForm, note: e.target.value })}
                                        placeholder="e.g. Please include your registered email as payment reference"
                                        style={{ ...S.input, minHeight: '80px', resize: 'vertical' }} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===== SECURITY TAB ===== */}
                    {tab === 'security' && (
                        <div style={S.card}>
                            <h2 style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Data Masking Settings</h2>
                            <div>
                                <label style={S.label}>Masking Character (Sign)</label>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>
                                    The character used to mask sensitive customer details in order pages. (Default is *)
                                </p>
                                <input
                                    type="text"
                                    value={securityForm.mask_sign}
                                    onChange={e => setSecurityForm({ ...securityForm, mask_sign: e.target.value.substring(0, 5) })}
                                    placeholder="*"
                                    maxLength={5}
                                    style={{ ...S.input, width: '120px', textAlign: 'center', fontSize: '18px', fontWeight: '800' }}
                                />
                            </div>
                        </div>
                    )}
                    
                    {/* Save */}
                    <button onClick={handleSave} disabled={saving} style={{
                        background: saving ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                        border: 'none', borderRadius: '14px', padding: '16px 32px', color: 'white',
                        fontSize: '15px', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center',
                        transition: 'all 0.2s', width: '100%'
                    }}>
                        {saving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                        {saving ? 'Saving...' : `Save ${tab === 'crypto' ? 'Crypto' : tab === 'bank' ? 'Bank' : 'Security'} Settings`}
                    </button>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
