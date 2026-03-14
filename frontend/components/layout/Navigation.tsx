'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Box,
    Warehouse,
    ShoppingCart,
    Truck,
    Wallet,
    Users,
    FileText,
    Settings,
    Lock,
    ChevronRight,
    Circle,
    DollarSign
} from 'lucide-react';

const groups = [
    {
        name: 'General',
        items: [
            { name: 'Dashboard', href: '/', icon: LayoutDashboard },
            { name: 'Reports', href: '/reports', icon: FileText },
        ]
    },
    {
        name: 'Management',
        items: [
            { name: 'Product', href: '/products', icon: Box },
            { name: 'Storehouse', href: '/storehouse', icon: Warehouse },
            { name: 'Order', href: '/orders', icon: ShoppingCart },
            { name: 'Package', href: '/packages', icon: Truck },
            { name: 'Spread Packages', href: '/spread-packages', icon: Box },
            { name: 'Refund Requests', href: '/refunds', icon: ShoppingCart },
            { name: 'Product Queries', href: '/queries', icon: Box },
            { name: 'Suppliers', href: '/suppliers', icon: Users },
        ]
    },
    {
        name: 'Accounts & Security',
        items: [
            { name: 'Make Payment', href: '/payment', icon: DollarSign },
            { name: 'Money Withdraw', href: '/withdraw', icon: Wallet },
            { name: 'Commission History', href: '/commissions', icon: FileText },
            { name: 'Affiliate System', href: '/affiliate', icon: Users },
            { name: 'Shop Setting', href: '/settings', icon: Settings },
            { name: 'Transaction Password', href: '/password', icon: Lock },
        ]
    },
    {
        name: 'Support & Media',
        items: [
            { name: 'Conversations', href: '/conversations', icon: Users },
            { name: 'Support Ticket', href: '/support', icon: FileText },
            { name: 'Uploaded Files', href: '/uploads', icon: Box },
        ]
    }
];

import { useTranslate } from '@/hooks/useTranslate';
import { TranslationKey } from '@/lib/translations';

export default function Navigation() {
    const pathname = usePathname();
    const { t } = useTranslate();

    // Mapping for translation keys
    const getTKey = (name: string): TranslationKey => {
        return name as TranslationKey;
    };

    return (
        <nav className="flex flex-col gap-6 p-4">
            {groups.map((group) => (
                <div key={group.name} className="space-y-1">
                    <p className="px-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-400 font-bold mb-3 flex items-center gap-2">
                        <Circle className="w-1.5 h-1.5 fill-current text-blue-500" />
                        {t(group.name as TranslationKey)}
                    </p>
                    <div className="space-y-1">
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative flex items-center justify-between group px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${isActive
                                        ? 'text-white'
                                        : 'text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    {/* Active Background Pill */}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/30 -z-10 animate-scale-in" />
                                    )}

                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className={`p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? 'bg-white/20' : 'bg-gray-100/50 dark:bg-slate-800/50 group-hover:bg-blue-50 dark:group-hover:bg-slate-700'
                                            }`}>
                                            <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
                                        </div>
                                        <span className={`text-sm tracking-tight ${isActive ? 'text-white' : 'dark:text-slate-300'}`}>{t(item.name as TranslationKey)}</span>
                                    </div>

                                    {isActive && (
                                        <div className="relative z-10">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        </div>
                                    )}

                                    {!isActive && (
                                        <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}
