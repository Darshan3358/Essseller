'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Store,
    Globe,
    Bell,
    Shield,
    Palette,
    Settings,
    Camera,
    Save,
    Lock,
    Smartphone,
    Languages,
    CreditCard,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslate } from '@/hooks/useTranslate';
import { useLanguage } from '@/context/LanguageContext';
import { api, getFullImageUrl } from '@/lib/api';
import Shell from '@/components/layout/Shell';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Profile');
    const { t } = useTranslate();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const tabs: { id: string, name: string, icon: any, color: string, bg: string, darkBg: string }[] = [
        { id: 'Profile', name: t('Shop Profile'), icon: Store, color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20' },
        { id: 'Regional', name: t('Regional & Display'), icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50', darkBg: 'dark:bg-indigo-900/20' },
        { id: 'Notifications', name: t('Alerts & Messages'), icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50', darkBg: 'dark:bg-amber-900/20' },
        { id: 'Security', name: t('Account Security'), icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', darkBg: 'dark:bg-emerald-900/20' },
        { id: 'Appearance', name: t('Visual Interface'), icon: Palette, color: 'text-purple-600', bg: 'bg-purple-50', darkBg: 'dark:bg-purple-900/20' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'Profile': return <ProfileSettings />;
            case 'Regional': return <RegionalSettings />;
            case 'Notifications': return <NotificationSettings />;
            case 'Security': return <SecuritySettings />;
            case 'Appearance': return <AppearanceSettings />;
            default: return <ProfileSettings />;
        }
    };

    if (authLoading || !user) return null;

    return (
        <Shell>
            <div className="max-w-6xl mx-auto space-y-10 pb-20">
                {/* Modern Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            <Settings className="w-3 h-3" />
                            Configuration Center
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-slate-100 tracking-tight">{t('Settings')}</h2>
                        <p className="text-gray-500 dark:text-slate-400 font-medium tracking-tight">Fine-tune your store presence, preferences, and core system behavior.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Mobile Navigation Dropdown */}
                    <div className="lg:hidden w-full mb-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Store, {
                                    className: `w-5 h-5 ${tabs.find(t => t.id === activeTab)?.color || 'text-blue-500'}`
                                })}
                            </div>
                            <select
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value)}
                                className="w-full pl-12 pr-10 py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-blue-500/20 rounded-2xl shadow-xl shadow-blue-500/5 dark:shadow-none appearance-none font-bold text-gray-900 dark:text-slate-100 outline-none transition-all cursor-pointer"
                            >
                                {tabs.map((tab) => (
                                    <option key={tab.id} value={tab.id} className="font-bold py-2 bg-white dark:bg-slate-900">
                                        {tab.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <Settings className="w-4 h-4 text-gray-400 group-hover:rotate-90 transition-transform duration-500" />
                            </div>
                        </div>
                    </div>

                    {/* Premium Sidebar (Hidden on Mobile) */}
                    <aside className="hidden lg:block lg:w-72 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/5 scale-[1.02] border-l-4 border-blue-500'
                                    : 'hover:bg-gray-100/80 dark:hover:bg-slate-800/80 grayscale opacity-70 hover:opacity-100 hover:grayscale-0'
                                    }`}
                            >
                                <div className={`p-2.5 rounded-xl transition-colors ${activeTab === tab.id ? `${tab.bg} ${tab.darkBg} ${tab.color}` : 'bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:bg-white dark:group-hover:bg-slate-700'}`}>
                                    <tab.icon className="w-5 h-5" />
                                </div>
                                <span className={`text-sm font-bold tracking-tight ${activeTab === tab.id ? 'text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-200'}`}>
                                    {tab.name}
                                </span>
                            </button>
                        ))}
                    </aside>

                    {/* Content Area with Animation */}
                    <div className="flex-1 min-w-0">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </Shell>
    );
}

function ProfileSettings() {
    const { t } = useTranslate();
    const [formData, setFormData] = useState({
        shop_name: '',
        shop_contact: '',
        shop_address: '',
        shop_metatitle: '',
        shop_metadesc: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    const [logo, setLogo] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/sellers/shop-settings');
                if (response.success) {
                    setFormData({
                        shop_name: response.data.shop_name || '',
                        shop_contact: response.data.shop_contact || '',
                        shop_address: response.data.shop_address || '',
                        shop_metatitle: response.data.shop_metatitle || '',
                        shop_metadesc: response.data.shop_metadesc || '',
                    });
                    if (response.data.shop_logo) {
                        setLogoPreview(getFullImageUrl(response.data.shop_logo));
                    }
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));

            // Proactively upload logo
            const formData = new FormData();
            formData.append('shop_logo', file);
            try {
                const response = await api.put('/sellers/shop-settings', formData);
                if (response.success) {
                    toast.success('Shop logo updated successfully');
                    updateUser({ shop_logo: response.data.shop_logo });
                }
            } catch (error: any) {
                toast.error(`Error: ${error.message}`);
            }
        }
    };

    const { user, updateUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await api.put('/sellers/shop-settings', formData);
            if (response.success) {
                setMessage('Success: Your shop settings have been updated.');
                // Update global state immediately
                updateUser({ 
                    shop_name: formData.shop_name,
                    shop_logo: response.data.shop_logo 
                });
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        }
    };

    if (isLoading) return (
        <div className="glass-card p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Initializing Profile...</p>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card p-10 relative overflow-hidden group text-left">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-blue-500/10" />

                <div className="flex items-center gap-8 mb-10 pb-10 border-b border-gray-100 dark:border-slate-800 relative z-10">
                    <div className="relative group/avatar cursor-pointer" onClick={() => document.getElementById('logo-upload')?.click()}>
                        <div className="w-28 h-28 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden group-hover/avatar:border-blue-400 transition-all duration-500 shadow-inner">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Shop Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Store className="w-12 h-12 text-gray-400 dark:text-slate-500 group-hover/avatar:text-blue-500 transition-all duration-500 group-hover/avatar:scale-110" />
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95 z-20">
                            <Camera className="w-4 h-4" />
                        </div>
                        <input
                            id="logo-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoChange}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-2xl font-black text-gray-900 dark:text-slate-100 leading-none">{t('Identity')}</h4>
                            {user?.verified === 1 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100 dark:border-amber-800/30">
                                    <Shield className="w-3 h-3" /> Unverified
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 dark:text-slate-400 font-medium tracking-tight">Customize how your shop appears to global customers.</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 mb-8 rounded-2xl border flex items-center gap-3 animate-in fade-in zoom-in-95 font-bold text-sm ${message.includes('Error') ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${message.includes('Error') ? 'bg-red-500' : 'bg-green-500'}`} />
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">{t('Shop Profile')}</label>
                        <input
                            type="text"
                            placeholder="Enter store name..."
                            value={formData.shop_name}
                            onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                            className="input-field !py-4 !px-6 !rounded-2xl !bg-gray-50/50 dark:!bg-slate-800/50 hover:!bg-white dark:hover:!bg-slate-800 focus:!bg-white dark:focus:!bg-slate-800 transition-all shadow-sm focus:shadow-xl focus:shadow-blue-500/5"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('Phone')}</label>
                        <input
                            type="text"
                            placeholder="+1 (555) 000-0000"
                            value={formData.shop_contact}
                            onChange={(e) => setFormData({ ...formData, shop_contact: e.target.value })}
                            className="input-field !py-4 !px-6 !rounded-2xl !bg-gray-50/50 hover:!bg-white focus:!bg-white transition-all shadow-sm focus:shadow-xl focus:shadow-blue-500/5"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{t('Address')}</label>
                        <textarea
                            rows={3}
                            placeholder="Full store or warehouse address..."
                            className="input-field !py-4 !px-6 !rounded-2xl !bg-gray-50/50 hover:!bg-white focus:!bg-white transition-all shadow-sm focus:shadow-xl focus:shadow-blue-500/5 resize-none"
                            value={formData.shop_address}
                            onChange={(e) => setFormData({ ...formData, shop_address: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-blue-600 uppercase tracking-widest ml-1">{t('Meta Title')}</label>
                            <input
                                type="text"
                                placeholder="Store Meta Title"
                                value={formData.shop_metatitle}
                                onChange={(e) => setFormData({ ...formData, shop_metatitle: e.target.value })}
                                className="input-field !py-4 !px-6 !rounded-2xl !bg-blue-50/30 hover:!bg-white focus:!bg-white border-blue-100 shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-blue-600 uppercase tracking-widest ml-1">{t('Meta Desc')}</label>
                            <input
                                type="text"
                                placeholder="Store Meta Description"
                                value={formData.shop_metadesc}
                                onChange={(e) => setFormData({ ...formData, shop_metadesc: e.target.value })}
                                className="input-field !py-4 !px-6 !rounded-2xl !bg-blue-50/30 hover:!bg-white focus:!bg-white border-blue-100 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex justify-end relative z-10">
                    <button type="submit" className="btn-primary !px-12 !py-4 !rounded-2xl shadow-2xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all text-sm font-black flex items-center gap-3">
                        <Save className="w-5 h-5" />
                        {t('Synchronize')}
                    </button>
                </div>
            </div>
        </form>
    );
}

function RegionalSettings() {
    const { t } = useTranslate();
    const { language, setLanguage } = useLanguage();
    const [currency, setCurrency] = useState('USD');
    const [localLang, setLocalLang] = useState(language);
    const [timezone, setTimezone] = useState('UTC');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/sellers/shop-settings');
                if (response.success && response.data.settings) {
                    setCurrency(response.data.settings.currency || 'USD');
                    setTimezone(response.data.settings.timezone || 'UTC');
                }
            } catch (error) {
                console.error('Error fetching regional settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        setLocalLang(language);
    }, [language]);

    const languages = [
        "English (US)", "English (UK)", "Spanish (Español)", "French (Français)",
        "German (Deutsch)", "Italian (Italiano)", "Portuguese (Português)",
        "Russian (Русский)", "Chinese (Simplified)", "Japanese (日本語)",
        "Korean (한국어)", "Arabic (العربية)", "Hindi (हिन्दी)",
        "Bengali (বাংলা)", "Turkish (Türkçe)"
    ];

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        try {
            // Update language via context (which calls API)
            if (localLang !== language) {
                await setLanguage(localLang as any);
            }
            // Update other settings
            const response = await api.put('/sellers/shop-settings', {
                settings: {
                    currency,
                    timezone
                }
            });
            if (response.success) {
                setMessage('Success: Regional preferences synchronized.');
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <LoadingPlaceholder label="Regional Config" />;

    return (
        <div className="glass-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl -mr-40 -mt-40 transition-colors group-hover:bg-indigo-500/10" />

            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 relative z-10">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
                    <Globe className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-gray-900 leading-none mb-2">{t('Regional')}</h4>
                    <p className="text-gray-500 font-medium">Configure units, localization, and temporal settings.</p>
                </div>
            </div>

            {message && <StatusMessage message={message} />}

            <div className="grid grid-cols-1 gap-10 max-w-2xl relative z-10">
                <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-400" /> Administrative Currency
                    </label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="input-field !py-4 !px-6 !rounded-2xl !bg-gray-50/50 hover:!bg-white focus:!bg-white cursor-pointer font-bold appearance-none shadow-sm"
                    >
                        <option value="USD">USD - United States Dollar ($)</option>
                        <option value="EUR">EUR - European Euro (€)</option>
                        <option value="GBP">GBP - British Pound Sterling (£)</option>
                        <option value="INR">INR - Indian Rupee (₹)</option>
                    </select>
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Languages className="w-4 h-4 text-indigo-400" /> Platform Language
                    </label>
                    <select
                        value={localLang}
                        onChange={(e) => setLocalLang(e.target.value as any)}
                        className="input-field !py-4 !px-6 !rounded-2xl !bg-gray-50/50 hover:!bg-white focus:!bg-white cursor-pointer font-bold appearance-none shadow-sm"
                    >
                        {languages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-indigo-400" /> System Timezone
                    </label>
                    <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="input-field !py-4 !px-6 !rounded-2xl !bg-gray-50/50 hover:!bg-white focus:!bg-white cursor-pointer font-bold appearance-none shadow-sm"
                    >
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="EST">EST (Eastern Standard Time)</option>
                        <option value="PST">PST (Pacific Standard Time)</option>
                        <option value="IST">IST (Indian Standard Time)</option>
                        <option value="GST">GST (Gulf Standard Time)</option>
                    </select>
                </div>
            </div>

            <div className="mt-12 flex justify-end relative z-10">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary !bg-indigo-600 hover:!bg-indigo-700 !px-12 !py-4 !rounded-2xl shadow-xl shadow-indigo-600/20 text-sm font-black flex items-center gap-3 disabled:opacity-50"
                >
                    {isSaving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    {t('Save Settings')}
                </button>
            </div>
        </div>
    );
}

function NotificationSettings() {
    const { t } = useTranslate();
    const [notifications, setNotifications] = useState({
        orders: true,
        stock: true,
        reviews: false,
        reports: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/sellers/shop-settings');
                if (response.success && response.data.settings?.notifications) {
                    setNotifications(response.data.settings.notifications);
                }
            } catch (error) {
                console.error('Error fetching notification settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        try {
            const response = await api.put('/sellers/shop-settings', {
                settings: { notifications }
            });
            if (response.success) {
                setMessage('Success: Notification rules updated.');
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <LoadingPlaceholder label="Alert Center" />;

    return (
        <div className="glass-card p-10">
            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100">
                <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                    <Bell className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-gray-900 leading-none mb-2">{t('Notifications')}</h4>
                    <p className="text-gray-500 font-medium">Manage how and when you receive critical alerts.</p>
                </div>
            </div>

            {message && <StatusMessage message={message} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { id: 'orders', title: 'New Order Alerts', desc: 'Real-time push for incoming customer orders.' },
                    { id: 'stock', title: 'Inventory Levels', desc: 'Alerts when products hit critical stock thresholds.' },
                    { id: 'reviews', title: 'Customer Feedback', desc: 'Notifications for new store or product reviews.' },
                    { id: 'reports', title: 'Analytics Digest', desc: 'Daily performance summary sent to your inbox.' },
                ].map((item) => (
                    <div key={item.id} className={`p-6 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer ${notifications[item.id as keyof typeof notifications] ? 'border-amber-200 bg-amber-50/50 shadow-lg shadow-amber-500/5' : 'border-gray-50 bg-gray-50/30'}`} onClick={() => toggleNotification(item.id as keyof typeof notifications)}>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h5 className={`font-black tracking-tight ${notifications[item.id as keyof typeof notifications] ? 'text-amber-900' : 'text-gray-900'}`}>{item.title}</h5>
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed max-w-[180px]">{item.desc}</p>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${notifications[item.id as keyof typeof notifications] ? 'bg-amber-500' : 'bg-gray-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${notifications[item.id as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary !bg-amber-600 hover:!bg-amber-700 !px-12 !py-4 !rounded-2xl shadow-xl shadow-amber-600/20 text-sm font-black flex items-center gap-3"
                >
                    {isSaving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    {t('Save Settings')}
                </button>
            </div>
        </div>
    );
}

function SecuritySettings() {
    const { t } = useTranslate();
    const [twoFactor, setTwoFactor] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/sellers/shop-settings');
                if (response.success && response.data.settings) {
                    setTwoFactor(response.data.settings.twoFactor || false);
                }
            } catch (error) {
                console.error('Error fetching security settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('Error: New passwords do not match');
            return;
        }
        setIsSaving(true);
        try {
            const response = await api.put('/sellers/password', {
                currentPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            if (response.success) {
                setMessage('Success: Your access credentials have been updated.');
                setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message || 'Failed to update password'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleTwoFactor = async () => {
        const newValue = !twoFactor;
        setTwoFactor(newValue);
        try {
            await api.put('/sellers/shop-settings', {
                settings: { twoFactor: newValue }
            });
        } catch (error) {
            console.error('Failed to update 2FA:', error);
            setTwoFactor(!newValue); // Rollback
        }
    };

    if (isLoading) return <LoadingPlaceholder label="Security Vault" />;

    return (
        <div className="glass-card p-10">
            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-slate-800">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <Shield className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-gray-900 dark:text-slate-100 leading-none mb-2">{t('Security')}</h4>
                    <p className="text-gray-500 dark:text-slate-400 font-medium tracking-tight">Manage security keys, encryption, and authentication.</p>
                </div>
            </div>

            {message && <StatusMessage message={message} />}

            <form onSubmit={handlePasswordChange} className="max-w-2xl space-y-8">
                <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Lock className="w-3 h-3" /> Credential Rotation
                    </h5>
                    <div className="grid grid-cols-1 gap-4">
                        <input type="password" placeholder="Current Login Password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} className="input-field !py-4 !px-6 !rounded-2xl dark:!bg-slate-800 dark:border-slate-700" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="password" placeholder="New Login Password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="input-field !py-4 !px-6 !rounded-2xl dark:!bg-slate-800 dark:border-slate-700" />
                            <input type="password" placeholder="Verify New Login Password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="input-field !py-4 !px-6 !rounded-2xl dark:!bg-slate-800 dark:border-slate-700" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button type="submit" disabled={isSaving} className="btn-primary !bg-emerald-600 hover:!bg-emerald-700 !px-12 !py-4 !rounded-2xl shadow-xl shadow-emerald-600/20 text-sm font-black flex items-center gap-3">
                        {isSaving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                        {t('Update Login Password')}
                    </button>
                </div>
            </form>

            <TransactionPasswordForm />

            <div className="pt-8 border-t border-gray-100 dark:border-slate-800 mt-10">
                <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                            <Smartphone className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h5 className="font-black text-gray-900 dark:text-slate-100 text-sm">Two-Factor Authentication</h5>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{twoFactor ? 'Active' : 'Not Active'}</p>
                        </div>
                    </div>
                    <div className={`w-14 h-7 rounded-full p-1 transition-all duration-500 cursor-pointer ${twoFactor ? 'bg-emerald-500' : 'bg-gray-300'}`} onClick={toggleTwoFactor}>
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-500 shadow-md ${twoFactor ? 'translate-x-7' : 'translate-x-0'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function TransactionPasswordForm() {
    const { t } = useTranslate();
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [data, setData] = useState({
        currentPassword: '',
        newTransactionPassword: '',
        confirmTransactionPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (data.newTransactionPassword !== data.confirmTransactionPassword) {
            setMessage('Error: New transaction passwords do not match');
            return;
        }
        setIsSaving(true);
        try {
            const response = await api.put('/sellers/transaction-password', {
                currentPassword: data.currentPassword,
                newTransactionPassword: data.newTransactionPassword
            });
            if (response.success) {
                setMessage('Success: Your transaction password has been updated.');
                setData({ currentPassword: '', newTransactionPassword: '', confirmTransactionPassword: '' });
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message || 'Failed to update transaction password'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8 mt-12 pt-12 border-t border-gray-100 dark:border-slate-800">
            <div className="space-y-6">
                <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <CreditCard className="w-3 h-3" /> Transaction Security
                </h5>
                <p className="text-xs text-gray-500 dark:text-slate-400 ml-1">Used for verifying withdrawals and critical financial operations.</p>
                <div className="grid grid-cols-1 gap-4">
                    <input type="password" placeholder="Current Login Password" value={data.currentPassword} onChange={(e) => setData({ ...data, currentPassword: e.target.value })} className="input-field !py-4 !px-6 !rounded-2xl dark:!bg-slate-800 dark:border-slate-700" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="password" placeholder="New Transaction Password" value={data.newTransactionPassword} onChange={(e) => setData({ ...data, newTransactionPassword: e.target.value })} className="input-field !py-4 !px-6 !rounded-2xl dark:!bg-slate-800 dark:border-slate-700" />
                        <input type="password" placeholder="Verify Transaction Password" value={data.confirmTransactionPassword} onChange={(e) => setData({ ...data, confirmTransactionPassword: e.target.value })} className="input-field !py-4 !px-6 !rounded-2xl dark:!bg-slate-800 dark:border-slate-700" />
                    </div>
                </div>
            </div>

            {message && <StatusMessage message={message} />}

            <div className="mt-6 flex justify-end">
                <button type="submit" disabled={isSaving} className="btn-primary !bg-blue-600 hover:!bg-blue-700 !px-12 !py-4 !rounded-2xl shadow-xl shadow-blue-600/20 text-sm font-black flex items-center gap-3">
                    {isSaving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                    {t('Update Transaction Password')}
                </button>
            </div>
        </form>
    );
}

function AppearanceSettings() {
    const { t } = useTranslate();
    const { updateUser } = useAuth();
    const [theme, setTheme] = useState('light');
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/sellers/shop-settings');
                if (response.success && response.data.settings) {
                    const savedTheme = response.data.settings.theme;
                    if (savedTheme) {
                        setTheme(savedTheme);
                    }
                }
            } catch (error) {
                console.error('Error fetching appearance settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const toggleTheme = async (newTheme: string) => {
        setTheme(newTheme);
        updateUser({ settings: { theme: newTheme } });
        try {
            await api.put('/sellers/shop-settings', {
                settings: { theme: newTheme }
            });
        } catch (error) {
            console.error('Failed to sync theme:', error);
        }
    };

    if (isLoading) return <LoadingPlaceholder label="Visual Engine" />;

    return (
        <div className="glass-card p-10">
            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-slate-800">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                    <Palette className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-gray-900 dark:text-slate-100 leading-none mb-2">{t('Appearance')}</h4>
                    <p className="text-gray-500 dark:text-slate-400 font-medium tracking-tight">Control the visual dynamics and theme of your dashboard.</p>
                </div>
            </div>

            {message && <StatusMessage message={message} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
                <div>
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Color Scheme</h5>
                    <div className="flex gap-6">
                        <div
                            onClick={() => toggleTheme('light')}
                            className={`flex-1 group cursor-pointer space-y-4`}
                        >
                            <div className={`h-32 rounded-3xl border-4 transition-all duration-300 flex flex-col p-4 bg-white shadow-lg ${theme === 'light' ? 'border-purple-500 scale-105 shadow-purple-500/10' : 'border-gray-50 hover:border-gray-200 grayscale opacity-60'}`}>
                                <div className="w-12 h-2 bg-gray-100 rounded-full mb-2" />
                                <div className="w-8 h-2 bg-gray-100 rounded-full" />
                                <div className="mt-auto flex gap-2">
                                    <div className="w-4 h-4 bg-purple-100 rounded-md" />
                                    <div className="w-4 h-4 bg-blue-100 rounded-md" />
                                </div>
                            </div>
                            <p className={`text-center font-black transition-colors ${theme === 'light' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}`}>Pristine Light</p>
                        </div>

                        <div
                            onClick={() => toggleTheme('dark')}
                            className={`flex-1 group cursor-pointer space-y-4`}
                        >
                            <div className={`h-32 rounded-3xl border-4 transition-all duration-300 flex flex-col p-4 bg-slate-900 shadow-2xl ${theme === 'dark' ? 'border-purple-500 scale-105 shadow-purple-500/20' : 'border-gray-50 hover:border-gray-200 grayscale opacity-60'}`}>
                                <div className="w-12 h-2 bg-slate-800 rounded-full mb-2" />
                                <div className="w-8 h-2 bg-slate-800 rounded-full" />
                                <div className="mt-auto flex gap-2">
                                    <div className="w-4 h-4 bg-purple-500/20 rounded-md" />
                                    <div className="w-4 h-4 bg-blue-500/20 rounded-md" />
                                </div>
                            </div>
                            <p className={`text-center font-black transition-colors ${theme === 'dark' ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'}`}>Obsidian Dark</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                <button
                    onClick={() => setMessage('Success: Appearance preferences synchronized.')}
                    className="btn-primary !bg-purple-600 hover:!bg-purple-700 !px-12 !py-4 !rounded-2xl shadow-xl shadow-purple-600/20 text-sm font-black flex items-center gap-3"
                >
                    <Save className="w-5 h-5" />
                    {t('Save Settings')}
                </button>
            </div>
        </div >
    );
}

function LoadingPlaceholder({ label }: { label: string }) {
    return (
        <div className="glass-card p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-400 font-bold text-sm tracking-widest uppercase">Syncing {label}...</p>
        </div>
    );
}

function StatusMessage({ message }: { message: string }) {
    const isError = message.includes('Error');
    return (
        <div className={`p-4 mb-8 rounded-2xl border flex items-center gap-3 animate-in fade-in zoom-in-95 font-bold text-sm ${isError
            ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
            : 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30'
            }`}>
            <div className={`w-2 h-2 rounded-full ${isError ? 'bg-red-500' : 'bg-green-500'}`} />
            {message}
        </div>
    );
}
