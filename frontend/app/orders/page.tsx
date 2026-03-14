'use client';

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import { ShoppingCart, Search, Filter, MoreHorizontal, Eye, Truck, CheckCircle, Clock, XCircle, Plus, Minus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslate } from '@/hooks/useTranslate';

export default function OrdersPage() {
    const { t } = useTranslate();
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        counts: {
            all: 0,
            pending: 0,
            completed: 0,
            cancelled: 0
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const url = `/orders/myorders?status=${statusFilter}${searchTerm ? `&keyword=${searchTerm}` : ''}`;
                const response = await api.get(url);
                if (response.success) {
                    setOrders(response.orders || []);
                    setStats(response.stats || { counts: { all: 0, pending: 0, completed: 0, cancelled: 0 } });
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user, statusFilter, searchTerm]);

    if (authLoading || (!user)) return null;

    return (
        <Shell>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">{t('Orders')}</h2>
                        <p className="text-gray-600 dark:text-slate-400">{t('Track and manage your actual customer orders')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: t('All Orders'), count: stats?.counts?.all || 0, icon: ShoppingCart, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-900/20' },
                        { label: t('Pending'), count: stats?.counts?.pending || 0, icon: Clock, color: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-50 dark:bg-warning-900/20' },
                        { label: t('Completed'), count: (stats?.counts?.completed || 0) + (stats?.counts?.delivered || 0), icon: CheckCircle, color: 'text-success-600 dark:text-success-400', bg: 'bg-success-50 dark:bg-success-900/20' },
                        { label: t('Cancelled'), count: stats?.counts?.cancelled || 0, icon: XCircle, color: 'text-danger-600 dark:text-danger-400', bg: 'bg-danger-50 dark:bg-danger-900/20' },
                    ].map((stat, idx) => (
                        <div key={idx} className="glass-card p-4 flex items-center gap-4 !bg-white/60 dark:!bg-slate-900/60 transition-colors">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stat.count}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-card overflow-hidden !bg-white dark:!bg-slate-900/60 transition-colors">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="relative w-full md:w-80 text-left">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('Search by Order ID, Customer...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm dark:text-slate-100 dark:placeholder:text-slate-500"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap ${statusFilter === status
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {t(status)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── MOBILE TABLE (hidden on md+) ── */}
                    <div className="block md:hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-slate-400">{t('Order ID')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-slate-400">{t('Customer')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-slate-400">{t('Pickup')}</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-700 dark:text-slate-400 text-right">{t('Action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {isLoading ? (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-slate-500 text-sm">{t('Loading orders...')}</td></tr>
                                ) : orders?.length === 0 ? (
                                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-slate-500 text-sm">{t('No orders found.')}</td></tr>
                                ) : (
                                    (orders || []).map((order) => {
                                        const isExpanded = expandedRows.has(order._id);
                                        const last4 = (order.order_code || '').slice(-4);
                                        const statusColor = order.status === 'completed' || order.status === 'delivered'
                                            ? 'badge-success' : order.status === 'pending' || order.status === 'processing'
                                                ? 'badge-warning' : 'badge-danger';
                                        return (
                                            <>
                                                <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <span className="font-bold text-primary-600 dark:text-primary-400 text-sm">...{last4}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{order.customer_name}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-slate-500">{order.customer_email}</p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-lg ${order.pick_up_status === 'Picked-Up' ? 'bg-gray-100 text-black dark:bg-slate-800 dark:text-black' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                                                            {order.pick_up_status === 'Unpicked-Up' ? t('Unpicked') : (order.pick_up_status || t('Unpicked'))}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => router.push(`/orders/${order._id}`)}
                                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-slate-400 transition-all"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleRow(order._id)}
                                                                className={`p-1.5 rounded-lg transition-all ${isExpanded ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'}`}
                                                            >
                                                                {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <tr key={`${order._id}-expanded`} className="bg-primary-50/40 dark:bg-primary-900/10">
                                                        <td colSpan={4} className="px-4 pb-3 pt-1">
                                                            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs">
                                                                <div className="text-left">
                                                                    <span className="text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wide">{t('Date')}</span>
                                                                    <p className="font-bold text-gray-700 dark:text-slate-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                                    <p className="text-gray-400 dark:text-slate-500">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                </div>
                                                                <div className="text-left">
                                                                    <span className="text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wide">{t('Total')}</span>
                                                                    <p className="font-bold text-gray-800 dark:text-slate-200">${parseFloat(order.order_total).toLocaleString()}</p>
                                                                </div>
                                                                <div className="text-left">
                                                                    <span className="text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wide">{t('Status')}</span>
                                                                    <div className="mt-0.5"><span className={`badge ${statusColor}`}>{t(order.status)}</span></div>
                                                                </div>
                                                                <div className="text-left">
                                                                    <span className="text-gray-400 dark:text-slate-500 font-semibold uppercase tracking-wide">{t('Pickup')}</span>
                                                                    <p className={`${order.pick_up_status === 'Picked-Up' ? 'text-gray-900 dark:text-slate-200' : 'text-red-600'}`}>
                                                                        {order.pick_up_status === 'Unpicked-Up' ? t('Unpicked') : (order.pick_up_status || t('Unpicked'))}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── DESKTOP TABLE (hidden on mobile) ── */}
                    <div className="hidden md:block overflow-x-auto text-left">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-slate-400">{t('Order ID')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-slate-400">{t('Customer')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-slate-400">{t('Date')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-slate-400">{t('Total')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-slate-400">{t('Status')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-slate-400">{t('Pickup Status')}</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 dark:text-slate-400 text-right">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-slate-500">{t('Loading orders...')}</td>
                                    </tr>
                                ) : (orders?.length === 0) ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-gray-500 dark:text-slate-500">{t('No orders found.')}</td>
                                    </tr>
                                ) : (
                                    (orders || []).map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-primary-600 dark:text-primary-400">#{order.order_code}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-slate-100">{order.customer_name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-500">{order.customer_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 dark:text-slate-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[11px] text-gray-400 dark:text-slate-500 font-medium mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-gray-900 dark:text-slate-100">${parseFloat(order.order_total).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`badge ${order.status === 'completed' || order.status === 'delivered' ? 'badge-success' :
                                                    order.status === 'pending' || order.status === 'processing' ? 'badge-warning' : 'badge-danger'
                                                    }`}>
                                                    {t(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs uppercase tracking-wider px-3 py-1 rounded-full ${order.pick_up_status === 'Picked-Up'
                                                    ? 'bg-gray-100 text-black dark:bg-slate-800 dark:text-black'
                                                    : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                                                    }`}>
                                                    {order.pick_up_status === 'Unpicked-Up' ? t('Unpicked') : (order.pick_up_status || t('Unpicked'))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => router.push(`/orders/${order._id}`)}
                                                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-slate-400 transition-all"
                                                        title={t('View Details')}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-600 dark:text-slate-400 transition-all">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>{/* end overflow-x-auto */}
                </div>{/* end glass-card */}
            </div>{/* end space-y-8 */}

            <style jsx global>{`
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
            `}</style>
        </Shell>
    );
}
