'use client';

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import { Package, ShieldCheck, X, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PackagesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [transPassword, setTransPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [purchasedTypes, setPurchasedTypes] = useState<Set<string>>(new Set());
    const [loadingPackages, setLoadingPackages] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    useEffect(() => {
        const loadPkg = async () => {
            setLoadingPackages(true);
            try {
                const res = await api.get('/packages');
                if (res.success && res.packages?.length > 0) {
                    const types = new Set<string>(res.packages.map((p: any) => p.type));
                    setPurchasedTypes(types);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingPackages(false);
            }
        };

        const fetchPlans = async () => {
            setLoadingPlans(true);
            try {
                const res = await api.get('/packages/plans');
                if (res.success) {
                    setPlans(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingPlans(false);
            }
        };

        if (user) {
            loadPkg();
            fetchPlans();
        }
    }, [user]);

    const isAlreadyPurchased = (pkgName: string) => purchasedTypes.has(pkgName);

    const handleOpenModal = (pkg: any) => {
        if (isAlreadyPurchased(pkg.name)) return;
        setMessage('');
        setIsError(false);
        setTransPassword('');
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    const handlePurchase = async () => {
        if (!transPassword) {
            setMessage('Please enter your transaction password.');
            setIsError(true);
            return;
        }
        setIsSubmitting(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await api.post('/packages/purchase', {
                packageId: selectedPackage.sku,
                trans_password: transPassword
            });

            if (response.success) {
                setMessage(response.message || '🎉 Package activated!');
                setIsError(false);
                setPurchasedTypes(prev => new Set([...prev, selectedPackage.name]));
                setTimeout(() => {
                    setIsModalOpen(false);
                    setMessage('');
                    setTransPassword('');
                }, 2500);
            }
        } catch (error: any) {
            setMessage(error.message || 'Something went wrong.');
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading || !user) return null;

    // Per-plan icon background colour
    const iconBg: Record<string, string> = {
        'Starter Merchant': 'bg-blue-500',
        'Professional Seller': 'bg-purple-500',
        'Enterprise Pro': 'bg-gray-900',
    };

    // Short descriptions per plan
    const desc: Record<string, string> = {
        'Starter Merchant': 'Perfect for new sellers starting their journey.',
        'Professional Seller': 'Scale your business with advanced tools.',
        'Enterprise Pro': 'Complete solution for large scale operations.',
    };

    return (
        <Shell>
            <div className="space-y-10 pb-20 max-w-6xl mx-auto px-4">

                {/* Header */}
                <div className="text-center space-y-2 py-10">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
                        Package Management
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
                        One-time activation. All packages are cumulative — stack them to unlock maximum selling power.
                    </p>
                </div>

                {/* Cards */}
                {loadingPlans ? (
                    <div className="py-24 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm font-medium">Loading plans...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((pkg) => {
                            const purchased = isAlreadyPurchased(pkg.name);

                            return (
                                <div
                                    key={pkg.sku}
                                    className="relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                                >
                                    <div className="p-8 flex flex-col flex-1 gap-6">

                                        {/* Icon + purchased badge row */}
                                        <div className="flex items-start justify-between">
                                            <div className={`w-14 h-14 ${iconBg[pkg.name] || 'bg-gray-700'} rounded-2xl flex items-center justify-center shadow-md`}>
                                                <Package className="w-7 h-7 text-white" />
                                            </div>
                                            {purchased && (
                                                <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center shadow">
                                                    {/* Checkmark SVG */}
                                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Name + description */}
                                        <div className="space-y-1.5">
                                            <h2 className="text-xl font-black text-gray-900 dark:text-slate-100 uppercase tracking-tight leading-tight">
                                                {pkg.name}
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-snug">
                                                {desc[pkg.name] || ''}
                                            </p>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-5xl font-black text-gray-900 dark:text-slate-100">{pkg.price_label}</span>
                                            <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-tight">
                                                Single<br />Charge
                                            </span>
                                        </div>

                                        {/* Divider */}
                                        <hr className="border-gray-100 dark:border-slate-800" />

                                        {/* Features */}
                                        <ul className="space-y-3 flex-1">
                                            {pkg.features.map((feature: string, i: number) => (
                                                <li key={i} className="flex items-center gap-3">
                                                    {/* Green circle check */}
                                                    <span className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                                                        <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                    <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA Button */}
                                        <button
                                            onClick={() => handleOpenModal(pkg)}
                                            disabled={purchased}
                                            className={`w-full py-4 rounded-full text-sm font-black tracking-wide transition-all mt-2 ${purchased
                                                ? 'bg-emerald-500 text-white cursor-default'
                                                : 'bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white shadow-md shadow-emerald-100'
                                                }`}
                                        >
                                            {purchased ? 'Active License' : 'Upgrade Level'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Purchase Modal */}
            {isModalOpen && selectedPackage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-slate-800">
                        <button
                            onClick={() => !isSubmitting && setIsModalOpen(false)}
                            className="absolute top-5 right-5 p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="text-center mb-8">
                            <div className={`w-16 h-16 mx-auto ${iconBg[selectedPackage.name] || 'bg-gray-700'} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                                <Package className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-slate-100">Activate Package</h3>
                            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 font-medium uppercase tracking-widest">{selectedPackage.name}</p>
                        </div>

                        {message && (
                            <div className={`p-4 mb-6 rounded-2xl text-sm font-semibold flex items-start gap-2 ${isError ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
                                {isError ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> : <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />}
                                {message}
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Summary */}
                            <div className="p-5 bg-gray-50 dark:bg-slate-800 rounded-2xl space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Amount</span>
                                    <span className="text-2xl font-black text-gray-900 dark:text-slate-100">{selectedPackage.price_label}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-100 dark:border-slate-700 pt-3">
                                    <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Access</span>
                                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Lifetime
                                    </span>
                                </div>
                            </div>

                            {/* Transaction password */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" /> Transaction Password
                                </label>
                                <input
                                    type="password"
                                    value={transPassword}
                                    onChange={(e) => setTransPassword(e.target.value)}
                                    placeholder="Enter your transaction password"
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl font-semibold text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all dark:text-slate-100 dark:placeholder:text-slate-500"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-full font-black text-base transition-all flex items-center justify-center gap-2 ${isSubmitting
                                    ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                                    : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-emerald-100'
                                    }`}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Shell>
    );
}
