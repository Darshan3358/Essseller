'use client';

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, X, RefreshCw, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DepositHistoryPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [recharges, setRecharges] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    useEffect(() => {
        setIsLoading(true);
        api.get('/recharges/myrecharges').then(res => {
            if (res.success) setRecharges(res.recharges || []);
        }).catch(console.error).finally(() => setIsLoading(false));
    }, []);

    if (authLoading || !user) return null;

    return (
        <Shell>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.push('/deposit')} className="p-2 bg-white rounded-xl shadow-sm hover:scale-105 transition-all">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Deposit History</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">View all your past deposit transactions</p>
                    </div>
                </div>

                <div className="space-y-4 pb-20">
                    {isLoading ? (
                        <div className="flex justify-center p-12">
                            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : recharges.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-gray-900">No History Found</h3>
                            <p className="text-sm text-gray-500 mt-1">You haven't made any deposits yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {recharges.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((tx, idx) => (
                                <div key={tx._id || idx} className="premium-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 hover:scale-[1.01] transition-all border-white/50">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-xl ${tx.status === 1 ? 'bg-emerald-50 text-emerald-600' : tx.status === 2 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {tx.status === 1 ? <CheckCircle2 className="w-6 h-6" /> : tx.status === 2 ? <X className="w-6 h-6" /> : <RefreshCw className="w-6 h-6 animate-pulse" />}
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-gray-900">${parseFloat(tx.amount).toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mt-1">
                                                {tx.payment_method || 'TRANSFER'} • {new Date(tx.created_at || tx.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-[10px] font-mono text-gray-400 mb-1">ID: #{tx.id || (tx._id?.substring(0, 8))}</p>
                                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg inline-block ${tx.status === 1 ? 'bg-emerald-100 text-emerald-700' :
                                            tx.status === 2 ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {tx.status === 1 ? 'Success' : tx.status === 2 ? 'Failed' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && recharges.length > ITEMS_PER_PAGE && (
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-500">
                                Showing <span className="font-bold text-gray-900">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * ITEMS_PER_PAGE, recharges.length)}</span> of <span className="font-bold text-gray-900">{recharges.length}</span> entries
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 object-center">
                                    <span className="text-sm font-black text-gray-700">{page}</span> 
                                    <span className="text-xs font-medium text-gray-400 mx-1">/</span> 
                                    <span className="text-xs font-bold text-gray-500">{Math.ceil(recharges.length / ITEMS_PER_PAGE)}</span>
                                </div>
                                <button
                                    disabled={page * ITEMS_PER_PAGE >= recharges.length}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Shell>
    );
}
