'use client';

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import { api } from '@/lib/api';
import { Bell, CheckCircle2, Package, Wallet, Settings, Clock, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/notifications');
            if (res.success) {
                setNotifications(res.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleRead = async (id: string, link: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            router.push(link || '/dashboard');
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <Package className="w-5 h-5" />;
            case 'wallet': return <Wallet className="w-5 h-5" />;
            case 'system': return <Settings className="w-5 h-5" />;
            case 'package': return <Package className="w-5 h-5" />;
            default: return <Bell className="w-5 h-5" />;
        }
    };

    const getBgColor = (type: string, read: boolean) => {
        if (read) return 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500';
        switch (type) {
            case 'order': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
            case 'wallet': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
            case 'system': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
            default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
        }
    };

    return (
        <Shell>
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-left">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 flex items-center gap-3">
                            <Bell className="w-7 h-7 text-blue-600" />
                            Notification Center
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 font-semibold mt-1">Stay updated with your store activity and alerts</p>
                    </div>
                    {notifications.length > 0 && (
                        <button 
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl text-blue-600 dark:text-blue-400 font-bold hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-all text-sm shadow-sm"
                        >
                            <CheckCircle2 size={16} /> Mark All as Read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900/60 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
                                        <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <div 
                                key={notif._id}
                                onClick={() => handleRead(notif._id, notif.link)}
                                className={`group p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                                    !notif.read 
                                        ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/40 shadow-md shadow-blue-500/5' 
                                        : 'bg-gray-50/50 dark:bg-slate-900/30 border-gray-100 dark:border-slate-800 opacity-80'
                                }`}
                            >
                                {!notif.read && (
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                )}
                                
                                <div className="flex gap-5 items-start">
                                    <div className={`p-3.5 rounded-2xl transition-transform group-hover:scale-110 shadow-sm ${getBgColor(notif.type, notif.read)}`}>
                                        {getIcon(notif.type)}
                                    </div>
                                    
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center justify-between gap-4 mb-1">
                                            <h3 className={`font-black text-lg ${notif.read ? 'text-gray-600 dark:text-slate-400' : 'text-gray-900 dark:text-slate-100'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 shrink-0">
                                                <Clock size={12} />
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${notif.read ? 'text-gray-500 dark:text-slate-500' : 'text-gray-700 dark:text-slate-300 font-medium'}`}>
                                            {notif.message}
                                        </p>
                                        
                                        <div className="mt-4 flex items-center gap-4">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-wider ${
                                                !notif.read ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                {notif.type || 'Alert'}
                                            </span>
                                            {!notif.read && (
                                                <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    View Details →
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Bell size={40} className="text-gray-300 dark:text-slate-600" />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-slate-100 mb-2">No notifications yet</h2>
                            <p className="text-gray-500 dark:text-slate-400 font-medium max-w-xs mx-auto">We'll notify you when something important happens in your store.</p>
                        </div>
                    )}
                </div>
            </div>
        </Shell>
    );
}
