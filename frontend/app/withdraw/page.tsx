'use client';

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import {
    Wallet, Clock, CheckCircle, XCircle, CreditCard, Plus,
    ArrowRight, Building2, AlertTriangle, Info, RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';

const STATUS_CONFIG: Record<number, { label: string; color: string; bg: string; darkBg: string; icon: any }> = {
    0: { label: 'PENDING', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', darkBg: 'rgba(245,158,11,0.2)', icon: Clock },
    1: { label: 'APPROVED', color: '#10b981', bg: 'rgba(16,185,129,0.1)', darkBg: 'rgba(16,185,129,0.2)', icon: CheckCircle },
    2: { label: 'REJECTED', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', darkBg: 'rgba(239,68,68,0.2)', icon: XCircle },
};

export default function WithdrawPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { t } = useTranslate();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [transPassword, setTransPassword] = useState('');
    const [walletData, setWalletData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        bank_name: '', account_number: '', account_name: '', ifsc_code: '', upi_id: ''
    });
    const [showBankForm, setShowBankForm] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    const fetchWalletDetails = async () => {
        setIsLoading(true);
        try {
            const [walletRes, statsRes] = await Promise.all([
                api.get('/withdrawals/wallet-details/info'),
                api.get('/sellers/stats')
            ]);

            if (walletRes.success) {
                const realBalance = statsRes?.success ? (statsRes.stats?.mainWallet ?? walletRes.data.balance) : walletRes.data.balance;
                setWalletData({
                    ...walletRes.data,
                    balance: realBalance,
                    guaranteeMoney: statsRes?.success ? (statsRes.stats?.guaranteeMoney || 0) : 0
                });
                if (walletRes.data.bank_details) {
                    const bd = walletRes.data.bank_details;
                    if (bd.bank_name || bd.account_number || bd.upi_id) {
                        setBankDetails(bd);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching wallet details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchWalletDetails();
    }, [user]);

    const hasPendingWithdrawal = walletData?.transactions?.withdrawals?.some((w: any) => w.status === 0);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsError(false);
        setMessage('');

        if (!amount || parseFloat(amount) <= 0) {
            setIsError(true);
            setMessage(t('Please enter a valid withdrawal amount'));
            return;
        }
        if (parseFloat(amount) < 100) {
            setIsError(true);
            setMessage(t('Minimum withdrawal amount is ₹100'));
            return;
        }
        if (!transPassword) {
            setIsError(true);
            setMessage(t('Transaction password is required'));
            return;
        }
        if (!bankDetails.account_number && !bankDetails.upi_id) {
            setIsError(true);
            setMessage(t('Please enter your bank account details or UPI ID below'));
            setShowBankForm(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post('/withdrawals', {
                amount: parseFloat(amount),
                trans_password: transPassword,
                method: 'bank',
                bank_details: bankDetails,
            });

            if (response.success) {
                setIsError(false);
                setMessage(response.message || t('Withdrawal request submitted! Admin will review within 24-48 hours.'));
                setAmount('');
                setTransPassword('');
                fetchWalletDetails();
            }
        } catch (error: any) {
            setIsError(true);
            setMessage(error.message || t('Failed to submit withdrawal request'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelWithdrawal = async (id: string) => {
        try {
            await api.put(`/withdrawals/${id}`, { reason: 'Cancelled by seller' });
            fetchWalletDetails();
        } catch (error: any) {
            alert(t('Failed to cancel') + ': ' + error.message);
        }
    };

    if (authLoading || !user) return null;

    return (
        <Shell>
            <div className="space-y-8 max-w-6xl mx-auto">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">{t('Money Withdraw')}</h2>
                    <p className="text-gray-600 dark:text-slate-400">{t('Manage your earnings and withdrawal requests')}</p>
                </div>

                {isLoading && !walletData ? (
                    <div className="text-center py-20 text-gray-500 dark:text-slate-400 flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                        <span>{t('Loading wallet data...')}</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* LEFT COLUMN */}
                        <div className="md:col-span-1 space-y-6">
                            {/* Balance Card */}
                            <div className="premium-card p-6 bg-gradient-to-br from-primary-600 to-indigo-700 text-white relative overflow-hidden shadow-xl shadow-primary-900/20">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Wallet className="w-32 h-32" />
                                </div>
                                <p className="text-sm font-medium text-white/80 mb-1">{t('Available Balance')}</p>
                                <h3 className="text-3xl md:text-4xl font-bold mb-6">₹{walletData?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</h3>
                                <div className="flex items-center gap-4 text-xs font-semibold">
                                    <div className="bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                                        Pending: ₹{walletData?.pendingWithdraw?.toLocaleString('en-IN') || '0.00'}
                                    </div>
                                    <div className="bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                                        Guarantee: ₹{walletData?.guaranteeMoney?.toLocaleString('en-IN') || '0.00'}
                                    </div>
                                </div>
                            </div>

                            {/* Pending Request Banner */}
                            {hasPendingWithdrawal && (
                                <div className="p-5 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">{t('Request Pending')}</span>
                                    </div>
                                    <p className="text-amber-800 dark:text-amber-500/80 text-[11px] leading-relaxed font-medium">
                                        {t('You have a pending withdrawal request. Admin is reviewing it. You can only have one pending request at a time.')}
                                    </p>
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="p-6 rounded-2xl border border-primary-100 dark:border-primary-900/20 bg-primary-50/30 dark:bg-indigo-900/10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Info className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                                    <span className="text-primary-700 dark:text-primary-400 font-bold text-sm tracking-tight">{t('How it works')}</span>
                                </div>
                                <ul className="space-y-3 text-[11px] text-gray-600 dark:text-slate-400 font-medium">
                                    <li className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black flex-shrink-0 border border-primary-200/50 dark:border-primary-800/30">1</div>
                                        {t('Submit withdrawal request')}
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black flex-shrink-0 border border-primary-200/50 dark:border-primary-800/30">2</div>
                                        {t('Admin reviews & approves')}
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black flex-shrink-0 border border-primary-200/50 dark:border-primary-800/30">3</div>
                                        {t('Amount transferred to your bank')}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Request Form */}
                            <form onSubmit={handleWithdraw} className="glass-card p-8">
                                <h4 className="font-bold text-gray-900 dark:text-slate-100 mb-8">{t('Request Withdrawal')}</h4>

                                {message && (
                                    <div className={`p-4 mb-8 rounded-2xl text-sm font-bold flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${isError ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30'}`}>
                                        {isError ? <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                                        <span>{message}</span>
                                    </div>
                                )}

                                {hasPendingWithdrawal ? (
                                    <div className="text-center py-12 px-6">
                                        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                            <Clock className="w-10 h-10 text-amber-500" />
                                        </div>
                                        <p className="text-gray-900 dark:text-slate-100 font-black text-xl mb-2">{t('Withdrawal Under Review')}</p>
                                        <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">{t('Your request is being reviewed by the admin. You\'ll be notified once it\'s processed.')}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Amount Input */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('Amount to Withdraw')}</label>
                                            <div className="relative group">
                                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300 dark:text-slate-600 group-focus-within:text-primary-500 transition-colors">₹</span>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full pl-12 pr-6 py-6 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-3xl text-3xl font-black text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 transition-all placeholder:text-gray-200 dark:placeholder:text-slate-700 mx-auto"
                                                />
                                            </div>
                                            <div className="flex justify-between items-center px-2">
                                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tight">Min: ₹100</p>
                                                <p className="text-[10px] font-bold text-primary-500 dark:text-primary-400 uppercase tracking-tight">Available: ₹{walletData?.balance?.toFixed(2) || '0.00'}</p>
                                            </div>
                                        </div>

                                        {/* Quick Amount Buttons */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[500, 1000, 2500, 5000].map(val => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setAmount(val.toString())}
                                                    className="py-3 px-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-[11px] font-black text-gray-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all shadow-sm hover:shadow-lg hover:shadow-primary-500/10"
                                                >
                                                    ₹{val.toLocaleString('en-IN')}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setAmount(Math.floor(walletData?.balance || 0).toString())}
                                                className="col-span-2 py-3 px-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/30 rounded-2xl text-[11px] font-black text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all shadow-sm"
                                            >
                                                {t('Withdraw Max Balance')}
                                            </button>
                                        </div>

                                        {/* Transaction Password */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('Transaction Password')}</label>
                                            <input
                                                type="password"
                                                value={transPassword}
                                                onChange={(e) => setTransPassword(e.target.value)}
                                                placeholder={t("Enter your transaction password")}
                                                className="input-field !py-4 !px-6 !rounded-2xl dark:!bg-slate-800/50 dark:!border-slate-700"
                                            />
                                        </div>

                                        {/* Bank Details Toggle */}
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowBankForm(!showBankForm)}
                                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-700 text-xs font-black text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-all group"
                                            >
                                                <Building2 className="w-4 h-4" />
                                                {showBankForm ? t('Hide Bank Details') : t('Add / Edit Bank Details')}
                                                <Plus className={`w-4 h-4 transition-transform duration-300 ${showBankForm ? 'rotate-45 text-red-500' : 'group-hover:scale-125'}`} />
                                            </button>

                                            {showBankForm && (
                                                <div className="mt-4 p-6 bg-gray-50/50 dark:bg-slate-900/30 rounded-3xl space-y-5 border border-dashed border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-300">
                                                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider ml-1">{t('Bank details will be saved with your request')}</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1">{t('Bank Name')}</label>
                                                            <input
                                                                type="text"
                                                                value={bankDetails.bank_name}
                                                                onChange={e => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                                                                placeholder="e.g. Chase, HSBC"
                                                                className="input-field text-sm !py-3 !px-5 !rounded-xl dark:!bg-slate-800 dark:!border-slate-700"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1">{t('Account Holder Name')}</label>
                                                            <input
                                                                type="text"
                                                                value={bankDetails.account_name}
                                                                onChange={e => setBankDetails({ ...bankDetails, account_name: e.target.value })}
                                                                placeholder="Full legal name"
                                                                className="input-field text-sm !py-3 !px-5 !rounded-xl dark:!bg-slate-800 dark:!border-slate-700"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1">{t('Account Number')}</label>
                                                            <input
                                                                type="text"
                                                                value={bankDetails.account_number}
                                                                onChange={e => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                                                                placeholder="Branch account number"
                                                                className="input-field text-sm !py-3 !px-5 !rounded-xl dark:!bg-slate-800 dark:!border-slate-700"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1">{t('IFSC Code')}</label>
                                                            <input
                                                                type="text"
                                                                value={bankDetails.ifsc_code}
                                                                onChange={e => setBankDetails({ ...bankDetails, ifsc_code: e.target.value.toUpperCase() })}
                                                                placeholder="Routing / SWIFT / IFSC"
                                                                className="input-field text-sm !py-3 !px-5 !rounded-xl dark:!bg-slate-800 dark:!border-slate-700"
                                                            />
                                                        </div>
                                                        <div className="sm:col-span-2 space-y-1.5">
                                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase ml-1">{t('UPI ID (Optional)')}</label>
                                                            <input
                                                                type="text"
                                                                value={bankDetails.upi_id}
                                                                onChange={e => setBankDetails({ ...bankDetails, upi_id: e.target.value })}
                                                                placeholder="e.g. name@bank"
                                                                className="input-field text-sm !py-3 !px-5 !rounded-xl dark:!bg-slate-800 dark:!border-slate-700"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`btn-primary w-full !py-6 !rounded-3xl text-sm font-black shadow-2xl shadow-primary-500/30 group relative overflow-hidden flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-95 transition-all'}`}
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    {t('Submit Withdrawal Request')}
                                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </button>

                                        <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center font-bold uppercase tracking-widest">
                                            ⏱ {t('Withdrawal requests are reviewed within 24-48 hours')}
                                        </p>
                                    </div>
                                )}
                            </form>

                            {/* Recent Withdrawal History */}
                            <div className="glass-card p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="font-bold text-gray-900 dark:text-slate-100">{t('Withdrawal History')}</h4>
                                    <button onClick={fetchWalletDetails} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                                        <RefreshCw className="w-4 h-4 text-primary-500 group-hover:rotate-180 transition-transform duration-500" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {!walletData?.transactions?.withdrawals || walletData.transactions.withdrawals.length === 0 ? (
                                        <div className="text-center py-12 flex flex-col items-center gap-4">
                                            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                                                <Clock className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                                            </div>
                                            <p className="text-gray-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">{t('No withdrawal history yet')}</p>
                                        </div>
                                    ) : (
                                        <>
                                            {(showAllHistory ? walletData.transactions.withdrawals : walletData.transactions.withdrawals.slice(0, 3)).map((tx: any, idx: number) => {
                                                const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG[0];
                                                const Icon = cfg.icon;
                                                return (
                                                    <div key={idx} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800/30 rounded-3xl border border-gray-100 dark:border-slate-800 transition-all hover:bg-gray-50 dark:hover:bg-slate-800/50 group">
                                                        <div className="flex items-center gap-5">
                                                            <div className="p-3.5 rounded-2xl transition-colors" style={{ background: cfg.bg }}>
                                                                <Icon className="w-6 h-6" style={{ color: cfg.color }} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-gray-900 dark:text-slate-100">{t('Withdrawal Request')}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-tight">{new Date(tx.createdAt || tx.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                                {tx.reason && tx.status === 2 && (
                                                                    <p className="text-[10px] text-red-500 dark:text-red-400 mt-2 font-bold bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded-lg border border-red-100 dark:border-red-900/20">Reason: {tx.reason}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end gap-2">
                                                            <p className="text-lg font-black text-gray-900 dark:text-slate-100">₹{tx.amount?.toLocaleString('en-IN')}</p>
                                                            <div className="flex items-center gap-2">
                                                                {tx.status === 0 && (
                                                                    <button
                                                                        onClick={() => handleCancelWithdrawal(tx._id)}
                                                                        className="text-[10px] font-black text-red-500 dark:text-red-400 hover:underline uppercase tracking-widest mr-2"
                                                                    >
                                                                        {t('Cancel')}
                                                                    </button>
                                                                )}
                                                                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest border" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color + '33' }}>
                                                                    {cfg.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {walletData.transactions.withdrawals.length > 3 && (
                                                <div className="mt-6 flex justify-center">
                                                    <button
                                                        onClick={() => router.push('/withdraw/history')}
                                                        className="flex items-center gap-2 px-6 py-3 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl text-[10px] font-black text-primary-600 dark:text-primary-400 transition-all group"
                                                    >
                                                        {t('View More')}
                                                        <ArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Shell>
    );
}
