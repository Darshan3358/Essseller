'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Star, MapPin, Phone, Mail, Clock, TrendingUp, Users, CheckCircle, X, Save } from 'lucide-react';
import Shell from '@/components/layout/Shell';
import { api } from '@/lib/api';
import { useTranslate } from '@/hooks/useTranslate';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function SuppliersPage() {
    const { t } = useTranslate();
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        location: 'Global',
        contact: '',
        email: '',
        deliveryTimeEstimate: '3-10 days',
        commissionRate: 0.05,
        status: 'active',
        rating: 0
    });

    const fetchSuppliers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/suppliers');
            if (response.success) {
                setSuppliers(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            toast.error(t('Failed to load suppliers'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleOpenModal = (supplier: any = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                location: supplier.location || 'Global',
                contact: supplier.contact || '',
                email: supplier.email || '',
                deliveryTimeEstimate: supplier.deliveryTimeEstimate || '3-10 days',
                commissionRate: supplier.commissionRate || 0.05,
                status: supplier.status || 'active',
                rating: supplier.rating || 0
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                location: 'Global',
                contact: '',
                email: '',
                deliveryTimeEstimate: '3-10 days',
                commissionRate: 0.05,
                status: 'active',
                rating: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let response;
            if (editingSupplier) {
                response = await api.put(`/suppliers/${editingSupplier._id}`, formData);
            } else {
                response = await api.post('/suppliers', formData);
            }

            if (response.success) {
                toast.success(editingSupplier ? t('Supplier updated successfully') : t('Supplier created successfully'));
                setIsModalOpen(false);
                fetchSuppliers();
            } else {
                toast.error(response.message || t('Operation failed'));
            }
        } catch (error: any) {
            console.error('Error saving supplier:', error);
            toast.error(error.message || t('An error occurred'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('Are you sure you want to delete this supplier?'))) return;
        try {
            const response = await api.delete(`/suppliers/${id}`);
            if (response.success) {
                toast.success(t('Supplier deleted successfully'));
                fetchSuppliers();
            } else {
                toast.error(response.message || t('Delete failed'));
            }
        } catch (error: any) {
            console.error('Error deleting supplier:', error);
            toast.error(error.message || t('An error occurred'));
        }
    };

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
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            {t('Add New Supplier')}
                        </button>
                    )}
                </div>

                {/* Stats Overview - Updated to 3 columns */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    <div className="metric-card text-left">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] sm:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">{t('Total Suppliers')}</p>
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                                <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-100">{suppliers.length}</h3>
                    </div>

                    <div className="metric-card text-left">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] sm:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">{t('Avg Rating')}</p>
                            <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-lg">
                                <Star className="w-5 h-5 text-warning-600 fill-warning-600 dark:text-warning-400 dark:fill-warning-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                            {avgRating}
                        </h3>
                    </div>

                    <div className="metric-card text-left col-span-2 md:col-span-1">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] sm:text-sm font-medium text-gray-600 dark:text-slate-400 truncate">{t('Avg Delivery')}</p>
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
                            <SupplierCard
                                key={supplier._id}
                                supplier={supplier}
                                t={t}
                                isAdmin={user?.role === 'admin'}
                                onEdit={() => handleOpenModal(supplier)}
                                onDelete={() => handleDelete(supplier._id)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center glass-card !bg-white/40 dark:!bg-slate-800/40 border-dashed border-2 border-gray-200 dark:border-slate-700">
                            <Users className="w-12 h-12 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-slate-400 font-medium">{t('No suppliers configured in your database.')}</p>
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                                    {editingSupplier ? <Edit className="w-5 h-5 text-primary-500" /> : <Plus className="w-5 h-5 text-primary-500" />}
                                    {editingSupplier ? t('Edit Supplier') : t('Add New Supplier')}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('Supplier Name')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-slate-100 placeholder-gray-400"
                                            placeholder={t('Enter supplier name')}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('Location')}</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-slate-100"
                                            placeholder="e.g. Hong Kong, Global"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('Contact Number')}</label>
                                        <input
                                            type="text"
                                            value={formData.contact}
                                            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('Email Address')}</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('Delivery Estimate')}</label>
                                        <input
                                            type="text"
                                            value={formData.deliveryTimeEstimate}
                                            onChange={(e) => setFormData({ ...formData, deliveryTimeEstimate: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-slate-100"
                                            placeholder="e.g. 3-10 days"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('Commission Rate')} (0.01 - 1.0)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={formData.commissionRate}
                                            onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('Status')}</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-slate-100"
                                        >
                                            <option value="active">{t('Active')}</option>
                                            <option value="inactive">{t('Inactive')}</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('Rating')} (0-5)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="5"
                                            value={formData.rating}
                                            onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-slate-100"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-3 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        {t('Cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        {editingSupplier ? t('Update Supplier') : t('Create Supplier')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

        </Shell>
    );
}

function SupplierCard({ supplier, t, isAdmin, onEdit, onDelete }: { supplier: any, t: any, isAdmin: boolean, onEdit: () => void, onDelete: () => void }) {
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
                {isAdmin && (
                    <div className="flex gap-2">
                        <button
                            onClick={onEdit}
                            className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
