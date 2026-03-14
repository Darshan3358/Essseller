'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, MapPin, Phone, Mail, Clock, TrendingUp, Users, CheckCircle } from 'lucide-react';
import Shell from '@/components/layout/Shell';
import { api } from '@/lib/api';
import { useTranslate } from '@/hooks/useTranslate';

export default function SuppliersPage() {
    const { t } = useTranslate();
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const response = await api.get('/suppliers');
                if (response.success) {
                    setSuppliers(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSuppliers();
    }, []);

    const avgRating = suppliers.length > 0
        ? (suppliers.reduce((sum, s) => sum + (s.rating || 0), 0) / suppliers.length).toFixed(1)
        : "0.0";

    return (
        <Shell>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">{t('Suppliers')}</h2>
                        <p className="text-gray-600 dark:text-slate-400 focus:outline-none">{t('Manage your supplier network and performance')}</p>
                    </div>
                </div>

                {/* Stats Overview - Updated to 3 columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="metric-card text-left">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{t('Total Suppliers')}</p>
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                                <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{suppliers.length}</h3>
                    </div>

                    <div className="metric-card text-left">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{t('Avg Rating')}</p>
                            <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                                <Star className="w-5 h-5 text-warning-600 fill-warning-600 dark:text-warning-400 dark:fill-warning-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                            {avgRating}
                        </h3>
                    </div>

                    <div className="metric-card text-left">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{t('Avg Delivery')}</p>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100">0 {t('days')}</h3>
                    </div>
                </div>

                {/* Suppliers Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-full py-20 text-center glass-card !bg-white/40 dark:!bg-slate-800/40">
                            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-slate-400 font-medium">{t('Loading suppliers...')}</p>
                        </div>
                    ) : suppliers.length > 0 ? (
                        suppliers.map((supplier) => (
                            <SupplierCard key={supplier._id} supplier={supplier} t={t} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center glass-card !bg-white/40 dark:!bg-slate-800/40 border-dashed border-2 border-gray-200 dark:border-slate-700">
                            <Users className="w-12 h-12 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-slate-400 font-medium">{t('No suppliers configured in your database.')}</p>
                        </div>
                    )}
                </div>
            </div>
        </Shell>
    );
}

function SupplierCard({ supplier, t }: { supplier: any, t: any }) {
    return (
        <div className="premium-card p-6 group text-left">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 overflow-hidden">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">{supplier.name}</h3>
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${supplier.status === 'active' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                        {t(supplier.status || 'inactive')}
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-warning-50 dark:bg-warning-900/20 px-2 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-warning-500 fill-warning-500 dark:text-warning-400 dark:fill-warning-400" />
                    <span className="font-bold text-xs text-warning-700 dark:text-warning-300">{supplier.rating || 0}</span>
                </div>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{supplier.location || t('Global')}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                    <Phone className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-500 shrink-0" />
                    <span>{supplier.contact || t('N/A')}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                    <Mail className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{supplier.email || t('N/A')}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 mr-2 text-gray-400 dark:text-slate-500 shrink-0" />
                    <span>{t('Delivery')}: {supplier.deliveryTimeEstimate || t('3-10 days')}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-500 dark:text-slate-500">
                    {t('Comm')}: <span className="text-gray-900 dark:text-slate-100">{((supplier.commissionRate || 0.05) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
