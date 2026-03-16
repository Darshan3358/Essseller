'use client';

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import {
    Wallet, ShieldCheck, ArrowRight, Zap, Info,
    CheckCircle2, Copy, Check, AlertTriangle,
    RefreshCw, Building2, Bitcoin, X, Clock, Eye
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const CRYPTO_NETWORKS = [
    { key: 'usdt_trc20', label: 'USDT (TRC20)', color: '#26A17B', bg: 'rgba(38,161,123,0.1)', border: 'rgba(38,161,123,0.25)', icon: '₮' },
    { key: 'usdt_erc20', label: 'USDT (ERC20)', color: '#627EEA', bg: 'rgba(98,126,234,0.1)', border: 'rgba(98,126,234,0.25)', icon: '₮' },
    { key: 'btc', label: 'Bitcoin (BTC)', color: '#F7931A', bg: 'rgba(247,147,26,0.1)', border: 'rgba(247,147,26,0.25)', icon: '₿' },
    { key: 'eth', label: 'Ethereum (ETH)', color: '#627EEA', bg: 'rgba(98,126,234,0.1)', border: 'rgba(98,126,234,0.25)', icon: 'Ξ' },
];

type PayMode = 'crypto' | 'bank';

export default function DepositPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [depositType, setDepositType] = useState<'main' | 'guarantee'>('main');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [currentRecharge, setCurrentRecharge] = useState<any>(null);
    const [payMode, setPayMode] = useState<PayMode>('crypto');
    const [payStep, setPayStep] = useState<'details' | 'confirming' | 'success'>('details');
    const [message, setMessage] = useState({ text: '', type: '' });

    // Settings
    const [cryptoSettings, setCryptoSettings] = useState<any>(null);
    const [bankSettings, setBankSettings] = useState<any>(null);
    const [selectedNetwork, setSelectedNetwork] = useState('usdt_trc20');
    const [copied, setCopied] = useState<string | null>(null);

    // Form fields
    const [transPassword, setTransPassword] = useState('');
    const [senderWallet, setSenderWallet] = useState('');
    const [txnHash, setTxnHash] = useState('');
    const [bankRef, setBankRef] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [recharges, setRecharges] = useState<any[]>([]);
    const [showAllHistory, setShowAllHistory] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    // Fetch both crypto and bank settings
    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        Promise.all([
            fetch(`${API_URL}/settings/crypto`).then(r => r.json()),
            fetch(`${API_URL}/settings/bank`).then(r => r.json()),
            api.get('/recharges/myrecharges'),
        ]).then(([cData, bData, rData]) => {
            if (cData.success) setCryptoSettings(cData.crypto);
            if (bData.success) setBankSettings(bData.bank);
            if (rData.success) setRecharges(rData.recharges);
        }).catch(console.error);
    }, []);

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            setMessage({ text: 'Please enter a valid amount', type: 'error' });
            return;
        }
        setIsSubmitting(true);
        setMessage({ text: '', type: '' });
        try {
            const response = await api.post('/recharges', { amount, mode: payMode, payment_method: payMode });
            if (response.success) {
                setCurrentRecharge(response.recharge);
                // Reset proof fields
                setTransPassword(''); setSenderWallet(''); setTxnHash(''); setBankRef('');
                setShowPayment(true);
                setPayStep('details');
            }
        } catch (error: any) {
            setMessage({ text: error.message || 'Error initializing deposit', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!transPassword) {
            alert('Transaction password is required');
            return;
        }
        if (payMode === 'crypto' && !senderWallet) {
            alert('Please enter your wallet address (address you sent from)');
            return;
        }
        if (payMode === 'bank' && !bankRef) {
            alert('Please enter the UTR/Reference number from your bank transfer');
            return;
        }

        setPayStep('confirming');
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const token = localStorage.getItem('token');

            const formData = new FormData();
            formData.append('trans_password', transPassword);
            formData.append('payment_method', payMode);
            formData.append('network', selectedNetwork);
            if (payMode === 'crypto') {
                formData.append('sender_wallet', senderWallet);
                if (txnHash) formData.append('txn_hash', txnHash);
            } else {
                formData.append('bank_reference', bankRef);
            }
            if (screenshot) {
                formData.append('screenshot', screenshot);
            }

            const res = await fetch(`${API_URL}/recharges/${currentRecharge._id}/complete`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }, // Removed Content-Type intentionally as FormData adds it with boundary
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Error');
            setPayStep('success');
            setTimeout(() => router.push('/'), 2500);
        } catch (error: any) {
            alert('Error: ' + error.message);
            setPayStep('details');
        }
    };

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const selectedCryptoAddr = cryptoSettings?.[selectedNetwork] || '';
    const selectedNetworkInfo = CRYPTO_NETWORKS.find(n => n.key === selectedNetwork);
    const hasBankDetails = bankSettings && (bankSettings.bank_name || bankSettings.account_number);

    if (authLoading || !user) return null;

    const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false }: any) => (
        <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
            <input
                type={type}
                value={value}
                onChange={(e: any) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
        </div>
    );

    return (
        <Shell>
            <div className="max-w-4xl mx-auto space-y-8 relative">

                {/* ===== PAYMENT MODAL ===== */}
                {showPayment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => payStep === 'details' && setShowPayment(false)} />
                        <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 modal-scroll" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

                            {/* ---- PAYMENT DETAILS STEP ---- */}
                            {payStep === 'details' && (
                                <div className="p-8 space-y-5">
                                    {/* Payment Mode Tabs */}
                                    <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                                        {[
                                            { key: 'crypto', label: '₿ Crypto', icon: Bitcoin },
                                            { key: 'bank', label: '🏦 Bank Transfer', icon: Building2 },
                                        ].map((tab) => (
                                            <button
                                                key={tab.key}
                                                onClick={() => setPayMode(tab.key as PayMode)}
                                                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${payMode === tab.key
                                                    ? 'bg-white shadow text-gray-900'
                                                    : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Amount badge */}
                                    <div className="text-center">
                                        <span className="bg-primary-50 text-primary-700 font-black text-lg px-4 py-2 rounded-xl inline-block">₹{amount}</span>
                                        <p className="text-xs text-gray-400 mt-1">Transfer this exact amount</p>
                                    </div>

                                    {/* ===== CRYPTO MODE ===== */}
                                    {payMode === 'crypto' && (
                                        <>
                                            {/* Network Selector */}
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Select Network</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {CRYPTO_NETWORKS.map(net => (
                                                        <button key={net.key} onClick={() => setSelectedNetwork(net.key)} style={{
                                                            background: selectedNetwork === net.key ? net.bg : 'rgba(0,0,0,0.02)',
                                                            border: `2px solid ${selectedNetwork === net.key ? net.border : 'transparent'}`,
                                                            borderRadius: '12px', padding: '10px 14px', cursor: 'pointer', textAlign: 'left'
                                                        }}>
                                                            <div style={{ fontSize: '18px', fontWeight: '900', color: net.color }}>{net.icon}</div>
                                                            <div style={{ fontSize: '12px', fontWeight: '700', color: selectedNetwork === net.key ? net.color : '#374151', marginTop: '2px' }}>{net.label}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Admin Crypto Address */}
                                            {selectedCryptoAddr ? (
                                                <div style={{ background: selectedNetworkInfo?.bg, border: `1px solid ${selectedNetworkInfo?.border}`, borderRadius: '14px', padding: '14px' }}>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Send to this address</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-mono text-sm font-bold text-gray-900 break-all flex-1">{selectedCryptoAddr}</p>
                                                        <button onClick={() => handleCopy(selectedCryptoAddr, selectedNetwork)} style={{
                                                            background: copied === selectedNetwork ? '#10b981' : '#6366f1',
                                                            border: 'none', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'white', flexShrink: 0
                                                        }}>
                                                            {copied === selectedNetwork ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                    {copied === selectedNetwork && <p className="text-green-600 text-xs mt-1 font-semibold">✅ Copied!</p>}
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-bold text-amber-700">Address not configured</p>
                                                        <p className="text-xs text-amber-600">Admin has not set a {selectedNetworkInfo?.label} address yet.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Proof fields */}
                                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 border-b border-gray-50 pb-2 uppercase tracking-[0.2em]">Transaction Evidence</p>

                                                <div className="space-y-4">
                                                    <InputField label="Your Wallet Address (sent from)" value={senderWallet} onChange={setSenderWallet} placeholder="e.g. 0x1A2b3C..." required />
                                                    <InputField label="Transaction Hash / TxID (optional)" value={txnHash} onChange={setTxnHash} placeholder="e.g. 0xabc123..." />


                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* ===== BANK MODE ===== */}
                                    {payMode === 'bank' && (
                                        <>
                                            {/* Admin Bank Details */}
                                            {hasBankDetails ? (
                                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Building2 className="w-4 h-4 text-blue-600" />
                                                        <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Transfer To This Bank Account</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { label: 'Bank Name', value: bankSettings.bank_name },
                                                            { label: 'Account Holder', value: bankSettings.account_name },
                                                            { label: 'Account Number', value: bankSettings.account_number },
                                                            { label: 'IFSC Code', value: bankSettings.ifsc_code },
                                                            { label: 'Branch', value: bankSettings.branch },
                                                            { label: 'SWIFT / BIC', value: bankSettings.swift_code },
                                                        ].filter(f => f.value).map(f => (
                                                            <div key={f.label}>
                                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.label}</p>
                                                                <div className="flex items-center gap-1 mt-0.5">
                                                                    <p className="text-sm font-bold text-gray-900 font-mono">{f.value}</p>
                                                                    <button onClick={() => handleCopy(f.value, f.label)} className="opacity-40 hover:opacity-100 transition-opacity">
                                                                        {copied === f.label ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {bankSettings.note && (
                                                        <div className="mt-2 pt-2 border-t border-blue-100">
                                                            <p className="text-xs text-blue-600 font-semibold"><Info className="w-3 h-3 inline mr-1" />{bankSettings.note}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
                                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-bold text-amber-700">Bank details not configured</p>
                                                        <p className="text-xs text-amber-600">Admin has not added bank details yet. Please use Crypto payment or contact admin.</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Proof fields */}
                                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                                <p className="text-[10px] font-black text-gray-400 border-b border-gray-50 pb-2 uppercase tracking-[0.2em]">Capture Evidence</p>

                                                <div className="space-y-4">
                                                    <InputField label="UTR / Reference Number" value={bankRef} onChange={setBankRef} placeholder="Enter bank UTR or reference no." required />


                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Transaction Password — both modes */}
                                    <div className="pt-2 border-t border-gray-100 space-y-4">
                                        <InputField label="Transaction Password" value={transPassword} onChange={setTransPassword} placeholder="••••••••" type="password" required />

                                        {/* Screenshot Field — Moved below password */}
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                Upload Payment Proof <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className={`relative border-2 border-dashed rounded-[2rem] p-6 transition-all bg-gray-50/50 ${screenshot ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 hover:border-primary-300 group'}`}>
                                                {!screenshot ? (
                                                    <div className="flex flex-col items-center justify-center gap-3">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-300 group-hover:text-primary-500 transition-colors">
                                                            <Copy className="w-6 h-6" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs font-black text-gray-900">Click to upload receipt / screenshot</p>
                                                            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">PNG, JPG supported</p>
                                                        </div>
                                                        <label className="absolute inset-0 cursor-pointer">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => e.target.files && setScreenshot(e.target.files[0])}
                                                            />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                                                <CheckCircle2 className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest leading-none mb-1">Evidence Ready</p>
                                                                <p className="text-xs font-bold text-emerald-600 truncate max-w-[200px]">{screenshot.name}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setScreenshot(null); }}
                                                            className="p-3 hover:bg-red-50 text-red-500 rounded-2xl transition-all relative z-10"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info note */}
                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2">
                                        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                            After submitting, admin will verify your payment and credit your wallet within <strong>1-24 hours</strong>.
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowPayment(false)} className="flex-1 py-4 text-sm font-black text-gray-400 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                                            Cancel
                                        </button>
                                        <button onClick={handleConfirmPayment} className="flex-1 py-4 bg-gradient-to-r from-primary-600 to-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                                            <Check className="w-4 h-4" /> I Have Sent — Submit
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ---- CONFIRMING ---- */}
                            {payStep === 'confirming' && (
                                <div className="p-12 text-center space-y-6">
                                    <div className="relative w-20 h-20 mx-auto">
                                        <div className="absolute inset-0 border-4 border-primary-100 rounded-full" />
                                        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
                                        <ShieldCheck className="absolute inset-0 m-auto w-8 h-8 text-primary-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">Submitting...</h3>
                                        <p className="text-sm text-gray-500 mt-1">Please do not close this window.</p>
                                    </div>
                                </div>
                            )}

                            {/* ---- SUCCESS ---- */}
                            {payStep === 'success' && (
                                <div className="p-12 text-center space-y-6 bg-gradient-to-b from-success-50/50 to-white">
                                    <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-success-200">
                                        <CheckCircle2 className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">Request Submitted!</h3>
                                        <p className="text-sm text-success-600 font-bold mt-2">Admin will verify and credit your wallet within 1-24 hours.</p>
                                    </div>
                                    <p className="text-xs text-gray-400">Redirecting...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ===== PAGE CONTENT ===== */}
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100/50 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in border border-primary-200/50">
                        <Wallet className="w-3 h-3" />
                        Secure Recharge System
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">Deposit Funds</h2>
                        {user.verified === 1 && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 shadow-sm" title="Verified Seller">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-500 font-medium max-w-lg leading-relaxed">Choose your preferred wallet and specify the amount to recharge using our secure gateway.</p>
                </div>

                {/* Wallet Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { key: 'main', label: 'Main Wallet', desc: 'Standard balance for products and services.', Icon: Wallet, color: 'blue' },
                        { key: 'guarantee', label: 'Guarantee Wallet', desc: 'Security deposit for advanced seller features.', Icon: ShieldCheck, color: 'indigo' },
                    ].map(({ key, label, desc, Icon, color }) => (
                        <div key={key} onClick={() => setDepositType(key as any)}
                            className={`premium-card p-8 cursor-pointer transition-all duration-300 relative group overflow-hidden ${depositType === key
                                ? `ring-2 ring-primary-500 bg-primary-50/50 shadow-2xl`
                                : 'hover:bg-white/80 opacity-70 hover:opacity-100'}`}
                        >
                            {depositType === key && (
                                <div className="absolute top-0 right-0 p-5">
                                    <div className="bg-primary-600 text-white p-1 rounded-full shadow-lg animate-scale-in">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-6 relative z-10">
                                <div className={`p-5 rounded-[1.5rem] transition-all duration-500 ${depositType === key ? `bg-primary-600 text-white shadow-xl scale-110` : 'bg-gray-100 text-gray-400 group-hover:scale-110'}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <h3 className={`text-xl font-black transition-colors ${depositType === key ? 'text-primary-900' : 'text-gray-900'}`}>{label}</h3>
                                    <p className="text-sm text-gray-500 font-medium mt-1 leading-tight">{desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Amount Form */}
                <div className="premium-card p-10 bg-white/80 backdrop-blur-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl animate-pulse" />



                    <form onSubmit={handleDeposit} className="space-y-10 relative z-10">
                        {message.text && (
                            <div className={`p-5 rounded-2xl flex items-start gap-4 animate-scale-in ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-primary-50 text-primary-700 border border-primary-100'}`}>
                                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-sm font-bold tracking-tight">{message.text}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Deposit Amount (₹)</label>
                            <div className="relative group/field">
                                <div className="absolute inset-0 bg-primary-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-500" />
                                <div className="relative flex items-center bg-gray-50/50 border-2 border-transparent focus-within:border-primary-500 focus-within:bg-white rounded-[2.5rem] transition-all duration-300 pr-4">
                                    <div className="w-24 h-24 flex items-center justify-center text-5xl font-black text-primary-500/30">₹</div>
                                    <input
                                        required
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        min="1"
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-4xl md:text-6xl font-black text-gray-900 placeholder:text-gray-100 py-8"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[100, 500, 1000, 5000].map(val => (
                                <button
                                    key={val}
                                    type="button"
                                    onClick={() => setAmount(val.toString())}
                                    className={`py-5 px-4 rounded-2xl text-sm font-black transition-all border-2 ${amount === val.toString()
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-xl scale-105'
                                        : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:text-gray-900'
                                        }`}
                                >
                                    ₹{val.toLocaleString('en-IN')}
                                </button>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !amount}
                            className={`w-full py-8 text-xl font-black rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 group transition-all relative overflow-hidden ${isSubmitting || !amount
                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : 'bg-primary-600 text-white shadow-primary-200'
                                }`}
                        >
                            {!(isSubmitting || !amount) && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-600 bg-[length:200%_100%] animate-gradientShift group-hover:opacity-90 transition-opacity" />
                            )}
                            {isSubmitting ? <RefreshCw className="w-7 h-7 animate-spin relative z-10" /> : <Zap className="w-7 h-7 fill-white relative z-10" />}
                            <span className="relative z-10 tracking-tight">{isSubmitting ? 'Preparing Gateway...' : `Proceed to Secure Payment`}</span>
                            <ArrowRight className="w-7 h-7 relative z-10 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </form>
                </div>

                {/* ===== RECENT ACTIVITY (Top 4) ===== */}
                {recharges.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-500" />
                                Recent Activity
                            </h3>
                            <button
                                onClick={() => router.push('/deposit/history')}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-primary-600 uppercase tracking-widest hover:border-primary-200 transition-all shadow-sm"
                            >
                                <Eye className="w-3 h-3" />
                                View More
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recharges.slice(0, 4).map((tx, idx) => (
                                <div key={tx._id || idx} className="premium-card p-6 bg-white flex items-center justify-between hover:scale-[1.01] transition-all border-white/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl ${tx.status === 1 ? 'bg-emerald-50 text-emerald-600' : tx.status === 2 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {tx.status === 1 ? <CheckCircle2 className="w-5 h-5" /> : tx.status === 2 ? <X className="w-5 h-5" /> : <RefreshCw className="w-5 h-5 animate-pulse" />}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900">₹{parseFloat(tx.amount).toLocaleString('en-IN')}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mt-1">
                                                {tx.payment_method || 'RECHARGE'} • {new Date(tx.created_at || tx.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-mono text-gray-300 mb-1">#{tx.id || (tx._id?.substring(0, 8))}</p>
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${tx.status === 1 ? 'bg-emerald-100 text-emerald-700' :
                                            tx.status === 2 ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {tx.status === 1 ? 'Success' : tx.status === 2 ? 'Failed' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-20">
                    <div className="flex items-center gap-4 p-2 transition-all group">
                        <div className="text-yellow-600 group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-7 h-7 fill-current" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Crypto Deposit</h4>
                            <p className="text-xs text-gray-500 font-bold leading-relaxed">USDT · BTC · ETH via Secure Multi-Chain Network</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-2 transition-all group">
                        <div className="text-blue-600 group-hover:scale-110 transition-transform duration-300">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest leading-none mb-1">Bank Payment</h4>
                            <p className="text-xs text-gray-500 font-bold leading-relaxed">Fast NEFT / Wire Transfer with Manual Verification</p>
                        </div>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
