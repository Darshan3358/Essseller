'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Shell from '@/components/layout/Shell';
import { Box, Sparkles, Zap, ArrowUpRight, ShieldCheck, Star, Loader2, X, Lock, ArrowRight } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';

export default function SpreadPackagesPage() {
    const { t } = useTranslate();
    const [packages, setPackages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [transPassword, setTransPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await api.get('/spread-packages');
                if (res.success) {
                    setPackages(res.packages);
                }
            } catch (error) {
                console.error('Error fetching spread packages:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const openPurchaseModal = (pkg: any) => {
        setSelectedPackage(pkg);
        setTransPassword('');
        setIsPurchaseModalOpen(true);
    };

    const handlePurchase = async () => {
        if (!transPassword) {
            toast.error(t('Please enter your transaction password'));
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await api.post('/spread-packages/purchase', {
                packageId: selectedPackage._id,
                trans_password: transPassword
            });

            if (res.success) {
                toast.success(res.message);
                setIsPurchaseModalOpen(false);
                setTransPassword('');
            } else {
                toast.error(res.message || t('Purchase failed'));
            }
        } catch (error: any) {
            toast.error(error.message || t('An error occurred during purchase'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Shell>
            <div className="space-y-12 pb-20 max-w-7xl mx-auto text-left">
                {/* Header Section */}
                <div className="text-center space-y-4 max-w-3xl mx-auto py-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t('Premium Marketing')}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-slate-100 tracking-tight">{t('Spread Packages')}</h2>
                    <p className="text-gray-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                        {t('Amplify your reach and scale your sales with our curated spread packages designed for maximum conversion.')}
                    </p>
                </div>

                {/* Featured Packages Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-gray-400">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                        <span className="font-black text-lg">{t('Loading packages...')}</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
                        {packages.map((pkg) => (
                            <div key={pkg._id} className={`relative group flex flex-col ${pkg.popular ? 'scale-105 z-10' : ''}`}>
                                {pkg.popular && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl z-20 flex items-center gap-2 animate-bounce">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        {t('Most Popular')}
                                    </div>
                                )}
                                <div className={`glass-card p-10 h-full flex flex-col border-2 transition-all duration-500 backdrop-blur-3xl overflow-hidden ${pkg.popular
                                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20 bg-white/80 dark:bg-slate-900/80'
                                    : 'border-transparent dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 bg-white/60 dark:bg-slate-900/60'}`}>

                                    <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${pkg.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                                        <Box className="w-8 h-8 text-white" />
                                    </div>

                                    <div className="space-y-2 mb-8">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight leading-none">{t(pkg.name)}</h3>
                                        <p className="text-xs text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">{t('Duration')}: {t(pkg.duration || 'Month')}</p>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-10 pb-8 border-b border-gray-100/50 dark:border-slate-800/50">
                                        <span className="text-5xl font-black text-gray-900 dark:text-slate-100 tracking-tighter">
                                            {pkg.price === 0 ? t('Free') : `$${pkg.price}`}
                                        </span>
                                        {pkg.price > 0 && <span className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest">/ {t(pkg.duration || 'Month')}</span>}
                                    </div>

                                    <ul className="space-y-4 mb-12 flex-1 relative z-10">
                                        {pkg.features?.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-sm font-semibold text-gray-600 dark:text-slate-400 transition-colors">
                                                <div className="p-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-0.5">
                                                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                {t(feature)}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => openPurchaseModal(pkg)}
                                        className={`w-full py-5 rounded-[1.5rem] font-black transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn ${pkg.popular
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 active:scale-95'
                                            : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 hover:bg-gray-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 active:scale-95'
                                            }`}>
                                        <span className="relative z-10">{t('Select Package')}</span>
                                        <ArrowUpRight className="w-5 h-5 relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Purchase Modal */}
            {isPurchaseModalOpen && selectedPackage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedPackage.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-lg`}>
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <button
                                onClick={() => setIsPurchaseModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-gray-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-2">{t('Confirm Selection')}</h3>
                            <p className="text-gray-500 dark:text-slate-400 font-medium">
                                {t('You are about to purchase')} <span className="text-blue-600 dark:text-blue-400 font-bold">{t(selectedPackage.name)}</span> {t('for')} <span className="text-gray-900 dark:text-slate-100 font-black">{selectedPackage.price === 0 ? t('Free') : `$${selectedPackage.price}`}</span>
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                    {t('Transaction Password')}
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        value={transPassword}
                                        onChange={(e) => setTransPassword(e.target.value)}
                                        placeholder={t('Enter transaction password')}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all font-bold text-gray-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsPurchaseModalOpen(false)}
                                    className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all font-black text-sm"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    onClick={handlePurchase}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            {t('Confirm')}
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-[10px] text-gray-400 dark:text-slate-500 text-center font-bold uppercase tracking-widest">
                                <ShieldCheck className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                                {t('Secure transaction protected by encryption')}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .glass-card {
                    background: white;
                    border: 1px solid #f1f5f9;
                    border-radius: 40px;
                    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.02), 0 4px 6px -4px rgb(0 0 0 / 0.02);
                }
                .dark .glass-card {
                    background: rgba(15, 23, 42, 0.6);
                    border-color: rgba(51, 65, 85, 0.3);
                }
            `}</style>
        </Shell>
    );
}
