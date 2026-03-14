'use client';

import { useState } from 'react';
import Shell from '@/components/layout/Shell';
import { ShoppingCart, RefreshCcw, Search, CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight, Box, ChevronDown } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

export default function RefundsPage() {
    const { t } = useTranslate();
    const [selectedTab, setSelectedTab] = useState('All Requests');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = [
        { name: t('All Requests'), count: 0 },
        { name: t('Pending'), count: 0 },
        { name: t('Approved'), count: 0 },
        { name: t('Rejected'), count: 0 },
    ];

    return (
        <Shell>
            <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-widest">
                            <AlertTriangle className="w-3 h-3" />
                            {t('Refund Center')}
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tight">{t('Received Refund Requests')}</h2>
                        <p className="text-gray-500 dark:text-slate-400 font-medium max-w-xl">{t('Manage and process customer refund requests efficiently to maintain high satisfaction scores.')}</p>
                    </div>
                </div>

                {/* Status Selection */}
                <div className="relative">
                    {/* Mobile Dropdown */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-sm text-sm font-black text-primary-600 dark:text-primary-400 transition-colors"
                        >
                            <span className="flex items-center gap-3">
                                {selectedTab}
                                <span className="px-2 py-0.5 rounded-lg text-[10px] bg-primary-50 dark:bg-primary-900/40">0</span>
                            </span>
                            <ChevronDown className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMobileMenuOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.name}
                                        onClick={() => {
                                            setSelectedTab(tab.name);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-6 py-4 rounded-xl text-sm font-black transition-all ${selectedTab === tab.name ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                            }`}
                                    >
                                        {tab.name}
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] ${selectedTab === tab.name ? 'bg-primary-100 dark:bg-primary-900/40' : 'bg-gray-100 dark:bg-slate-800'
                                            }`}>{tab.count}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop Tabs */}
                    <div className="hidden md:flex flex-wrap gap-4 bg-gray-100/50 dark:bg-slate-800/50 p-2 rounded-[2rem] w-fit border border-gray-100 dark:border-slate-800 transition-colors">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setSelectedTab(tab.name)}
                                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-3 ${selectedTab === tab.name ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-200'
                                    }`}
                            >
                                {tab.name}
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${selectedTab === tab.name ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
                                    }`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Requests Grid - Empty State */}
                <div className="glass-card py-32 flex flex-col items-center justify-center text-center space-y-6 !bg-white/60 dark:!bg-slate-900/60 transition-colors">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center text-gray-200 dark:text-slate-700 relative">
                        <Box className="w-12 h-12" />
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                            <Search className="w-5 h-5 text-gray-300 dark:text-slate-600" />
                        </div>
                    </div>
                    <div className="space-y-2 text-left text-center">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100">{t('No Refund Requests Found')}</h3>
                        <p className="text-gray-400 dark:text-slate-500 font-medium max-w-sm mx-auto">
                            {t('There are currently no refund requests for')} <span className="text-primary-600 dark:text-primary-400">"{selectedTab}"</span>.
                        </p>
                    </div>
                </div>

                {/* Stats Footer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-10 bg-slate-900 dark:bg-slate-900/40 text-white relative overflow-hidden group border-slate-800">
                        <RefreshCcw className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:rotate-45 transition-transform duration-1000" />
                        <h3 className="text-2xl font-black mb-4">{t('Refund Analytics')}</h3>
                        <p className="text-gray-400 font-medium">{t('Your refund rate is')} <span className="text-success-400 font-bold">2.4%</span>, {t('which is 1.5% lower than the industry average. Good job!')}</p>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
