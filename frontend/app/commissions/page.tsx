'use client';

import Shell from '@/components/layout/Shell';
import { DollarSign, Wallet, ArrowUpRight, ArrowDownLeft, Search, Filter, Calendar, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

export default function CommissionsPage() {
    const { t } = useTranslate();

    return (
        <Shell>
            <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
                {/* Visual Header */}
                <div className="relative p-10 lg:p-14 rounded-[3rem] bg-gradient-to-br from-indigo-600 to-purple-800 text-white overflow-hidden shadow-2xl">
                    <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-pink-500/20 rounded-full blur-[80px]" />

                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                        <div className="space-y-6 text-center lg:text-left text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span className="text-white text-xs font-black uppercase tracking-widest whitespace-nowrap">{t('Commission Dashboard')}</span>
                            </div>
                            <h2 className="text-3xl lg:text-6xl font-black tracking-tight leading-tight">{t('Your Earnings,')} <br /><span className="text-yellow-300 italic">{t('Redefined.')}</span></h2>
                            <p className="text-white/70 font-medium text-lg max-w-lg mx-auto lg:mx-0">{t('Track every penny earned through sales, referrals, and affiliate spreads in one premium interface.')}</p>
                        </div>

                        <div className="glass-card !bg-white/10 border-white/10 p-10 backdrop-blur-2xl w-full lg:w-96 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                            <div className="space-y-8 text-left">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-2">{t('Total Commissions')}</p>
                                        <h3 className="text-4xl md:text-5xl font-black text-white leading-none">$0.00</h3>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl">
                                        <TrendingUp className="w-8 h-8 text-yellow-300" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white/60 font-medium">{t('This Month Growth')}</span>
                                        <span className="text-gray-300 font-black">0.0%</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-300 w-[0%] shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <div className="glass-card p-4 flex flex-col md:flex-row items-center gap-4 !bg-white/60 dark:!bg-slate-900/60 transition-colors">
                            <div className="relative flex-1 group w-full text-left">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder={t('Search by ID, product, or source...')}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 transition-all font-medium text-sm dark:text-slate-100 dark:placeholder:text-slate-500"
                                />
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-all">
                                    <Filter className="w-4 h-4" />
                                    {t('Filter')}
                                </button>
                                <button className="flex-1 md:flex-none px-6 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-all">
                                    <Calendar className="w-4 h-4" />
                                    {t('Date')}
                                </button>
                            </div>
                        </div>

                        {/* History Table */}
                        <div className="glass-card mt-6 overflow-hidden !bg-white/60 dark:!bg-slate-900/60 transition-colors">
                            <div className="overflow-x-auto text-left">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-gray-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                                        <tr>
                                            <th className="px-8 py-5 whitespace-nowrap">{t('Transaction')}</th>
                                            <th className="px-8 py-5 whitespace-nowrap">{t('Source')}</th>
                                            <th className="px-8 py-5 whitespace-nowrap">{t('Date')}</th>
                                            <th className="px-8 py-5 whitespace-nowrap">{t('Status')}</th>
                                            <th className="px-8 py-5 text-right whitespace-nowrap">{t('Amount')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-2">
                                                        <Search className="w-8 h-8 text-gray-300 dark:text-slate-700" />
                                                    </div>
                                                    <p className="text-gray-500 dark:text-slate-400 font-bold text-lg">{t('No commissions yet')}</p>
                                                    <p className="text-gray-400 dark:text-slate-500 text-sm max-w-xs mx-auto text-center">{t('Your commission history will appear here once you start earning from your store and referrals.')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 text-left">
                        <div className="glass-card p-8 !bg-white/60 dark:!bg-slate-900/60 transition-colors text-left">
                            <h4 className="font-black text-gray-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                {t('Commission Sources')}
                            </h4>
                            <div className="space-y-6">
                                {[
                                    { name: t('Product Sales'), percentage: 0, color: 'bg-blue-500' },
                                    { name: t('Affiliate System'), percentage: 0, color: 'bg-purple-500' },
                                    { name: t('Referrals'), percentage: 0, color: 'bg-pink-500' },
                                ].map((source, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-gray-600 dark:text-slate-400">{source.name}</span>
                                            <span className="text-gray-900 dark:text-slate-100">{source.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className={`h-full ${source.color}`} style={{ width: `${source.percentage}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="premium-card p-8 bg-slate-900 dark:bg-slate-800 text-white group overflow-hidden text-left shadow-2xl">
                            <Zap className="absolute -top-4 -right-4 w-20 h-20 text-white/5 rotate-12 group-hover:rotate-45 transition-transform duration-700" />
                            <h4 className="text-xl font-black mb-2">{t('Automated Payouts')}</h4>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed mb-6">{t('Enable instant payouts to skip the 24-hour review period.')}</p>
                            <button className="w-full py-4 bg-blue-600 rounded-2xl font-black hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/50">
                                {t('Upgrade Account')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
