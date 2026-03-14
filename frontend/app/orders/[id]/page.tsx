'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Shell from '@/components/layout/Shell';
import {
    ChevronRight,
    Package,
    CreditCard,
    Truck,
    Clock,
    CheckCircle,
    CheckCircle2,
    XCircle,
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Wallet,
    Lock,
    Loader2,
    Check,
    Info,
    RefreshCw,
    ShieldCheck,
    ArrowRight,
    Zap,

    X,
    Bitcoin,
    Building2,
    Copy,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useTranslate } from '@/hooks/useTranslate';

export default function OrderDetailsPage() {
    const { t } = useTranslate();
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Payment Modal State
    const [showPayModal, setShowPayModal] = useState(false);
    const [transPassword, setTransPassword] = useState('');
    const [payLoading, setPayLoading] = useState(false);
    const [payError, setPayError] = useState('');
    const [paySuccess, setPaySuccess] = useState(false);
    const [payStep, setPayStep] = useState<'details' | 'confirming' | 'success'>('details');
    const [payMode, setPayMode] = useState<'wallet' | 'crypto' | 'bank'>('wallet');

    // Settings
    const [cryptoSettings, setCryptoSettings] = useState<any>(null);
    const [bankSettings, setBankSettings] = useState<any>(null);
    const [selectedNetwork, setSelectedNetwork] = useState('usdt_trc20');
    const [copied, setCopied] = useState<string | null>(null);

    const CRYPTO_NETWORKS = [
        { key: 'usdt_trc20', label: 'USDT (TRC20)', color: '#26A17B', bg: 'rgba(38,161,123,0.1)', border: 'rgba(38,161,123,0.25)', icon: '₮' },
        { key: 'usdt_erc20', label: 'USDT (ERC20)', color: '#627EEA', bg: 'rgba(98,126,234,0.1)', border: 'rgba(98,126,234,0.25)', icon: '₮' },
        { key: 'btc', label: 'Bitcoin (BTC)', color: '#F7931A', bg: 'rgba(247,147,26,0.1)', border: 'rgba(247,147,26,0.25)', icon: '₿' },
        { key: 'eth', label: 'Ethereum (ETH)', color: '#627EEA', bg: 'rgba(98,126,234,0.1)', border: 'rgba(98,126,234,0.25)', icon: 'Ξ' },
    ];

    // Wallet Stats
    const [walletStats, setWalletStats] = useState<any>(null);

    const fetchingRef = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id || fetchingRef.current) return;
            fetchingRef.current = true;
            setLoading(true);
            try {
                // Fetch Order
                const orderRes = await api.get(`/orders/${id}`);
                if (orderRes) {
                    setOrder(orderRes);
                }

                // Fetch Wallet Stats
                const statsRes = await api.get('/sellers/stats');
                if (statsRes && statsRes.success) {
                    setWalletStats(statsRes.stats);
                }
            } catch (err: any) {
                console.error('Error fetching order data:', err);
                setError(err.message || 'Failed to load order details');
            } finally {
                setLoading(false);
                fetchingRef.current = false;
            }
        };

        fetchData();

        // Fetch settings for direct payment info
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        Promise.all([
            fetch(`${API_URL}/settings/crypto`).then(r => r.json()),
            fetch(`${API_URL}/settings/bank`).then(r => r.json()),
        ]).then(([cData, bData]) => {
            if (cData.success) setCryptoSettings(cData.crypto);
            if (bData.success) setBankSettings(bData.bank);
        }).catch(console.error);

        return () => { fetchingRef.current = false; };
    }, [id]);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const handlePayStorehouse = async () => {
        if (!transPassword) {
            setPayError(t('Please enter transaction password'));
            return;
        }

        setPayLoading(true);
        setPayError('');
        setPayStep('confirming');
        try {
            await api.put(`/orders/${id}/pay-storehouse`, { trans_password: transPassword });
            setPaySuccess(true);
            setPayStep('success');
            // Refresh order data after small delay
            setTimeout(() => {
                setShowPayModal(false);
                router.refresh();
                window.location.reload();
            }, 2500);
        } catch (err: any) {
            console.error('Payment error:', err);
            setPayError(err.message || t('Payment failed'));
            setPayStep('details');
        } finally {
            setPayLoading(false);
        }
    };

    if (loading) return (
        <Shell>
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            </div>
        </Shell>
    );

    if (error || !order) return (
        <Shell>
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-900 dark:text-red-400 mb-2">{t('Error')}</h2>
                <p className="text-red-600 dark:text-red-500 mb-6">{error || t('Order not found')}</p>
                <button onClick={() => router.back()} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold">{t('Go Back')}</button>
            </div>
        </Shell>
    );

    const isPaid = order.payment_status?.toLowerCase() === 'paid';
    const storehouseTotal = parseFloat(order.cost_amount) || 0;
    const orderTotal = parseFloat(order.order_total) || 0;
    const profit = orderTotal - storehouseTotal;

    return (
        <Shell>
            <div className="max-w-6xl mx-auto space-y-6 pb-20">
                {/* Header / Breadcrumbs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-2">
                            <button onClick={() => router.push('/orders')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('Product Order')}</button>
                            <ChevronRight size={14} />
                            <span className="text-primary-600 dark:text-primary-400 font-semibold">{t('Order details')}</span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100">{t('Order Details')}</h1>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-sm shadow-sm"
                    >
                        <ArrowLeft size={16} /> {t('Back to List')}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Customer & Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Info Card */}
                        <div className="glass-card p-8 group hover:border-primary-500/20 dark:hover:border-primary-500/40 transition-all !bg-white/60 dark:!bg-slate-900/60">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                                    <Package size={20} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-slate-100">{t('Customer Details')}</h3>
                            </div>

                            <div className="space-y-6 text-left">
                                <div>
                                    <p className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-1">
                                        {(() => {
                                            const name = order.customer_name || 'N/A';
                                            if (name === 'N/A') return name;
                                            const maskSign = order.mask_sign || '*';
                                            return name.substring(0, 2) + maskSign.repeat(Math.max(0, name.length - 2));
                                        })()}
                                    </p>
                                    <p className="text-gray-500 dark:text-slate-400 font-medium">
                                        {(() => {
                                            const email = order.customer_email || t('No email provided');
                                            if (email === t('No email provided')) return email;
                                            const maskSign = order.mask_sign || '*';
                                            const [user, domain] = email.split('@');
                                            if (!domain) return email.substring(0, 2) + maskSign.repeat(Math.max(0, email.length - 2));
                                            return user.substring(0, 2) + maskSign.repeat(Math.max(0, user.length - 2)) + '@' + domain.substring(0, 1) + maskSign.repeat(Math.max(0, domain.length - 1));
                                        })()}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-400 dark:text-slate-500">
                                            <CreditCard size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('Phone Number')}</p>
                                            <p className="font-bold text-gray-900 dark:text-slate-100">
                                                {(() => {
                                                    const phone = order.customer_phone || 'N/A';
                                                    if (phone === 'N/A') return phone;
                                                    const maskSign = order.mask_sign || '*';
                                                    return phone.substring(0, 2) + maskSign.repeat(Math.max(0, phone.length - 2));
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-400 dark:text-slate-500">
                                            <Truck size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{t('Delivery Address')}</p>
                                            <p className="font-bold text-gray-900 dark:text-slate-100 leading-relaxed">
                                                {(() => {
                                                    const address = order.customer_address || 'N/A';
                                                    if (address === 'N/A') return address;
                                                    const maskSign = order.mask_sign || '*';
                                                    return address.substring(0, 2) + maskSign.repeat(Math.max(0, address.length - 2));
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table Card */}
                        <div className="glass-card overflow-hidden !bg-white/60 dark:!bg-slate-900/60">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('Photo')}</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{t('Name')}</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-center">{t('Qty')}</th>
                                        <th className="px-8 py-5 text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest text-right">{t('Price')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {(order.orderItems || []).map((item: any) => (
                                        <tr key={item._id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700">
                                                    {item.product?.image ? (
                                                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-600">
                                                            <Package size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-left">
                                                <p className="font-black text-gray-900 dark:text-slate-100 mb-1">{item.product?.name || t('Unknown Product')}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider">{t('Product ID')}: {item.product?._id?.substring(0, 8)}</p>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 font-black text-sm">{item.quantity}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-lg font-black text-gray-900 dark:text-slate-100">${parseFloat(item.price).toLocaleString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Status & Payment */}
                    <div className="space-y-6 text-left">
                        {/* Highlights Card */}
                        <div className="glass-card p-8 !bg-white/60 dark:!bg-slate-900/60">
                            {!isPaid && (
                                <button
                                    onClick={() => setShowPayModal(true)}
                                    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg mb-8 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
                                >
                                    {t('Payment to Supplier')}
                                </button>
                            )}

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Supplier Name')}</span>
                                    <span className="text-xs font-medium uppercase tracking-widest text-black dark:text-slate-100">
                                        {order.supplier_name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Payment Status')}</span>
                                    <span className="text-xs font-medium uppercase tracking-widest text-black dark:text-slate-100">
                                        {t(order.payment_status || 'unpaid')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Delivery Status')}</span>
                                    <span className={`text-xs font-medium uppercase tracking-widest ${order.status?.toLowerCase() === 'completed' || order.status?.toLowerCase() === 'delivered'
                                        ? 'text-success-600 dark:text-success-400'
                                        : 'text-primary-600 dark:text-primary-400'
                                        }`}>
                                        {order.status?.toLowerCase() === 'completed' || order.status?.toLowerCase() === 'delivered'
                                            ? t('Delivered')
                                            : t(order.status || 'pending')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Pick Status')}</span>
                                    <span className={`text-xs font-medium uppercase tracking-widest ${order.pick_status?.toLowerCase() === 'pick'
                                        ? 'text-black dark:text-slate-100'
                                        : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {order.pick_status?.toLowerCase() === 'pick' ? t('Picked') : t('Unpicked')}
                                    </span>
                                </div>
                                <div className="h-px bg-gray-100 dark:bg-slate-800 w-full" />
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Order #')}</span>
                                        <span className="text-sm font-black text-primary-600 dark:text-primary-400">{order.order_code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Order Date')}</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-slate-100">{new Date(order.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Total Amount')}</span>
                                        <span className="text-sm font-black text-red-600 dark:text-red-400">${parseFloat(order.order_total).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Payment Method')}</span>
                                        <span className="text-sm font-black text-gray-900 dark:text-slate-100 uppercase">{order.payment_method || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Delivery Date')}</span>
                                        <span className="text-sm font-black text-gray-300 dark:text-slate-700">******</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className="glass-card p-8 bg-gray-50/50 dark:bg-slate-800/30">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Storehouse Price')}:</span>
                                    <span className="font-bold text-gray-700 dark:text-slate-300">${storehouseTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Profit')}:</span>
                                    <span className="font-bold text-success-600 dark:text-success-400">${profit.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Sub Total')}:</span>
                                    <span className="font-bold text-gray-700 dark:text-slate-300">${orderTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Tax')}:</span>
                                    <span className="font-bold text-gray-700 dark:text-slate-300">$0.00</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Shipping')}:</span>
                                    <span className="font-bold text-gray-700 dark:text-slate-300">$0.00</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-400 dark:text-slate-500">{t('Coupon')}:</span>
                                    <span className="font-bold text-gray-700 dark:text-slate-300">—</span>
                                </div>
                                <div className="h-px bg-gray-200 dark:bg-slate-700 w-full my-2" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-black text-gray-900 dark:text-slate-100">{t('Total')}:</span>
                                    <span className="text-2xl font-black text-gray-900 dark:text-slate-100">${orderTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => payStep === 'details' && setShowPayModal(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 modal-scroll" style={{ maxHeight: '90vh', overflowY: 'auto' }}>

                        {/* ---- DETAILS STEP ---- */}
                        {payStep === 'details' && (
                            <div className="p-8 space-y-6">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
                                            <Wallet size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 leading-tight">{t('Payment to Supplier')}</h2>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('Select Payment Method')}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowPayModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Payment Mode Tabs */}
                                <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                                    {[
                                        { key: 'wallet', label: t('Wallet'), icon: Wallet },
                                        { key: 'crypto', label: t('Crypto'), icon: Bitcoin },
                                        { key: 'bank', label: t('Bank'), icon: Building2 },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            onClick={() => setPayMode(tab.key as any)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${payMode === tab.key
                                                ? 'bg-white shadow text-gray-900 scale-105'
                                                : 'text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            <tab.icon size={14} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Order Amount Summary */}
                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-primary-500/5 rounded-full blur-xl" />
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('Order Code')}</span>
                                        <span className="text-sm font-bold text-primary-600">#{order.order_code}</span>
                                    </div>
                                    <div className="space-y-4">
                                        {payMode === 'wallet' && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-black text-gray-500">{t('Wallet Balance')}</span>
                                                <span className="font-black text-gray-900 text-lg">${(walletStats?.mainWallet || 0).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center p-3 bg-primary-50 rounded-2xl">
                                            <span className="text-sm font-black text-primary-600">{t('Total To Pay')}</span>
                                            <span className="font-black text-primary-700 text-2xl">${storehouseTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {payMode === 'wallet' && ((walletStats?.mainWallet || 0) < storehouseTotal) && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                                            <AlertTriangle size={18} />
                                            <p className="text-xs font-black uppercase tracking-widest">{t('Insufficient Balance')}</p>
                                        </div>
                                    )}
                                </div>

                                {payMode === 'wallet' && (
                                    <>
                                        {/* Password Input */}
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">{t('Transaction Password')}</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <Lock size={18} className="text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={transPassword}
                                                    onChange={(e) => setTransPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold text-gray-900 transition-all placeholder:text-gray-200"
                                                />
                                            </div>
                                            {payError && (
                                                <p className="text-red-500 text-xs font-bold px-1 animate-shake">⚠ {payError}</p>
                                            )}
                                        </div>

                                        {/* Info Note */}
                                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
                                            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                                {t('Payment will be deducted immediately from your balance.')}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {payMode === 'crypto' && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-2">
                                            {CRYPTO_NETWORKS.map(net => (
                                                <button key={net.key} onClick={() => setSelectedNetwork(net.key)} style={{
                                                    background: selectedNetwork === net.key ? net.bg : 'rgba(0,0,0,0.02)',
                                                    border: `2px solid ${selectedNetwork === net.key ? net.border : 'transparent'}`,
                                                    borderRadius: '16px', padding: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                                                }}>
                                                    <div style={{ fontSize: '18px', fontWeight: '900', color: net.color }}>{net.icon}</div>
                                                    <div style={{ fontSize: '11px', fontWeight: '900', color: selectedNetwork === net.key ? net.color : '#64748b', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{net.label}</div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Address Display */}
                                        {cryptoSettings?.[selectedNetwork] ? (
                                            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{t('System Wallet')}</p>
                                                <div className="flex items-center gap-3">
                                                    <p className="font-mono text-sm font-bold text-slate-100 break-all flex-1">{cryptoSettings[selectedNetwork]}</p>
                                                    <button onClick={() => handleCopy(cryptoSettings[selectedNetwork], selectedNetwork)} className={`p-2 rounded-xl transition-all ${copied === selectedNetwork ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                                                        {copied === selectedNetwork ? <Check size={16} /> : <Copy size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 text-amber-700">
                                                <AlertTriangle size={20} />
                                                <p className="text-xs font-black uppercase tracking-widest">{t('Address Not Available')}</p>
                                            </div>
                                        )}

                                        <div className="p-4 bg-primary-100/50 rounded-2xl border border-primary-100 text-primary-700">
                                            <p className="text-xs font-bold leading-relaxed">
                                                {t('Payment proof must be submitted after transfer.')} <button onClick={() => router.push('/deposit')} className="underline font-black">{t('Submit proof on Deposit Page')}</button>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {payMode === 'bank' && (
                                    <div className="space-y-5">
                                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-4 shadow-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                                    <Building2 size={16} />
                                                </div>
                                                <p className="text-[11px] font-black text-blue-800 uppercase tracking-widest">{t('Bank Details')}</p>
                                            </div>

                                            {bankSettings ? (
                                                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                                    {[
                                                        { label: t('Bank'), value: bankSettings.bank_name },
                                                        { label: t('Holder'), value: bankSettings.account_name },
                                                        { label: t('Account'), value: bankSettings.account_number },
                                                        { label: t('IFSC'), value: bankSettings.ifsc_code },
                                                    ].map(f => (
                                                        <div key={f.label}>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{f.label}</p>
                                                            <p className="text-sm font-bold text-gray-900 truncate">{f.value || '—'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs font-bold text-blue-500 italic">{t('Contact support for bank details.')}</p>
                                            )}
                                        </div>

                                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-indigo-700 text-xs font-bold leading-relaxed">
                                            {t('Once transferred, remember to submit a deposit request.')}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-4 pt-2">
                                    <button onClick={() => setShowPayModal(false)} className="px-6 py-4 text-sm font-black text-gray-400 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                                        {t('Cancel')}
                                    </button>
                                    {payMode === 'wallet' ? (
                                        <button
                                            onClick={handlePayStorehouse}
                                            disabled={payLoading || (walletStats?.mainWallet || 0) < storehouseTotal || !transPassword}
                                            className="flex-1 py-4 bg-gradient-to-r from-primary-600 to-indigo-700 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                                        >
                                            <Zap className="w-4 h-4 fill-white" /> {t('Confirm & Pay Now')}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => router.push('/deposit')}
                                            className="flex-1 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                        >
                                            {t('Go to Deposit Page')} <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ---- CONFIRMING STEP ---- */}
                        {payStep === 'confirming' && (
                            <div className="p-12 text-center space-y-6">
                                <div className="relative w-20 h-20 mx-auto">
                                    <div className="absolute inset-0 border-4 border-primary-100 rounded-full" />
                                    <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
                                    <ShieldCheck className="absolute inset-0 m-auto w-8 h-8 text-primary-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">{t('Verifying Password...')}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{t('Processing your payment request.')}</p>
                                </div>
                            </div>
                        )}

                        {/* ---- SUCCESS STEP ---- */}
                        {payStep === 'success' && (
                            <div className="p-12 text-center space-y-6 bg-gradient-to-b from-success-50/50 to-white">
                                <div className="w-20 h-20 bg-success-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-success-200 animate-scale-in">
                                    <CheckCircle2 className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{t('Payment Successful!')}</h3>
                                    <p className="text-sm text-success-600 font-bold mt-2">{t('Order has been paid and is being processed.')}</p>
                                </div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">{t('Refreshing page...')}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .glass-card {
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 24px;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
                }
                .dark .glass-card {
                    background: rgba(30, 41, 59, 0.6);
                    border-color: rgba(51, 65, 85, 0.4);
                }
                .badge {
                    padding: 4px 12px;
                    border-radius: 9999px;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .badge-success { background: #ecfdf5; color: #059669; }
                .badge-warning { background: #fffbeb; color: #d97706; }
                .badge-danger { background: #fef2f2; color: #dc2626; }
                
                .dark .badge-success { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .dark .badge-warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .dark .badge-danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                
                @keyframes scale-in-center {
                    0% { transform: scale(0.5); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .scale-in-center {
                    animation: scale-in-center 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                }
            `}</style>
        </Shell>
    );
}

