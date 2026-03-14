'use client';

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import {
    Clock, CheckCircle, XCircle, ArrowLeft, RefreshCw,
    Search, Calendar, Filter, Wallet, Download
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';

const STATUS_CONFIG: Record<number, { label: string; color: string; bg: string; icon: any }> = {
    0: { label: 'PENDING', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
    1: { label: 'APPROVED', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle },
    2: { label: 'REJECTED', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
};

export default function WithdrawalHistoryPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { t } = useTranslate();
    const router = useRouter();
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/withdrawals/wallet-details/info');
            if (res.success) {
                setHistory(res.data.transactions?.withdrawals || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchHistory();
    }, [user]);

    const filteredHistory = history.filter(tx => {
        const matchesSearch = tx.amount?.toString().includes(searchTerm) ||
            new Date(tx.createdAt).toLocaleDateString().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || tx.status.toString() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (authLoading || !user) return null;

    return (
        <Shell>
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                        </button>
                        <div className="text-left">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight">{t('Withdrawal History')}</h2>
                            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{t('Full record of all your withdrawal requests')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchHistory}
                            className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 font-black text-xs uppercase tracking-widest text-gray-600 dark:text-slate-400"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            {t('Refresh')}
                        </button>
                        <button className="p-3 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest">
                            <Download className="w-4 h-4" />
                            {t('Export CSV')}
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('Search by amount or date...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="all">{t('All Status')}</option>
                            <option value="0">{t('Pending')}</option>
                            <option value="1">{t('Approved')}</option>
                            <option value="2">{t('Rejected')}</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="glass-card overflow-hidden">
                    {isLoading ? (
                        <div className="py-32 flex flex-col items-center gap-4 text-gray-400">
                            <RefreshCw className="w-10 h-10 animate-spin text-primary-500" />
                            <p className="font-black text-sm uppercase tracking-widest">{t('Loading transaction records...')}</p>
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="py-32 flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center">
                                <Wallet className="w-10 h-10 text-gray-200 dark:text-slate-700" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-gray-900 dark:text-slate-100 font-black text-xl">{t('No results found')}</p>
                                <p className="text-gray-400 dark:text-slate-500 text-sm font-medium">{t('Try adjusting your filters or check back later.')}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Request Details')}</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Date')}</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('Amount')}</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">{t('Status')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                    {filteredHistory.map((tx, idx) => {
                                        const cfg = STATUS_CONFIG[tx.status] || STATUS_CONFIG[0];
                                        const StatusIcon = cfg.icon;
                                        return (
                                            <tr key={idx} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: cfg.bg }}>
                                                            <StatusIcon className="w-6 h-6" style={{ color: cfg.color }} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 dark:text-slate-100 mb-1">{t('Withdrawal Request')}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tight">ID: {tx._id?.substring(tx._id.length - 8).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-bold text-gray-700 dark:text-slate-300">
                                                        {new Date(tx.createdAt || tx.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{new Date(tx.createdAt || tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-xl font-black text-gray-900 dark:text-slate-100 tracking-tight">${tx.amount?.toLocaleString()}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">{t('Transferred to Bank')}</p>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black tracking-widest border" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.color + '22' }}>
                                                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.color }}></span>
                                                        {cfg.label}
                                                    </span>
                                                    {tx.reason && tx.status === 2 && (
                                                        <p className="text-[10px] text-red-500 mt-2 font-bold max-w-[150px] mx-auto italic opacity-80">{tx.reason}</p>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Summary Info */}
                {!isLoading && filteredHistory.length > 0 && (
                    <div className="flex justify-between items-center px-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {t('Showing')} <span className="text-gray-900 dark:text-slate-100">{filteredHistory.length}</span> {t('of')} <span className="text-gray-900 dark:text-slate-100">{history.length}</span> {t('records')}
                        </p>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-xs font-black text-gray-400 cursor-not-allowed uppercase">{t('Previous')}</button>
                            <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-xs font-black text-gray-400 cursor-not-allowed uppercase">{t('Next')}</button>
                        </div>
                    </div>
                )}
            </div>
        </Shell>
    );
}
