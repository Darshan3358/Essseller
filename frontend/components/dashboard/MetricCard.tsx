'use client';

import { TrendingUp, TrendingDown, DollarSign, Calendar, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string;
    subtitle?: string;
    change?: number;
    icon: React.ReactNode;
    color: 'primary' | 'success' | 'warning' | 'danger';
}

const colorClasses = {
    primary: 'text-primary-600 bg-primary-50 border-primary-100',
    success: 'text-success-600 bg-success-50 border-success-100',
    warning: 'text-warning-600 bg-warning-50 border-warning-100',
    danger: 'text-danger-600 bg-danger-50 border-danger-100',
};


export default function MetricCard({ title, value, subtitle, change, icon, color }: MetricCardProps) {
    const isPositive = change !== undefined && change >= 0;

    // Map color to Package-style border and icon backgrounds
    const theme = {
        primary: { border: 'border-primary-500', icon: 'bg-primary-500', bg: 'bg-primary-50/50' },
        success: { border: 'border-emerald-500', icon: 'bg-emerald-500', bg: 'bg-emerald-50/50' },
        warning: { border: 'border-orange-500', icon: 'bg-orange-500', bg: 'bg-orange-50/50' },
        danger: { border: 'border-rose-500', icon: 'bg-rose-500', bg: 'bg-rose-50/50' },
    }[color];

    return (
        <div className={`bg-white rounded-[2rem] border-2 transition-all duration-500 group relative overflow-hidden h-full flex flex-col p-6 ${theme.border} shadow-[0_10px_40px_rgba(0,0,0,0.04)]`}>
            {/* Top Row: Icon and Trends */}
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 ${theme.icon} rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>

                {change !== undefined && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>

            {/* Content Box */}
            <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                    {value}
                </h3>
                {subtitle && (
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`w-2 h-2 rounded-full ${theme.icon} animate-pulse`} />
                        <p className="text-xs font-bold text-slate-500">{subtitle}</p>
                    </div>
                )}
            </div>

            {/* Subtle bottom accent like the Green border in image */}
            <div className={`absolute bottom-0 left-0 h-1.5 w-full bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity ${theme.icon}`} />
        </div>
    );
}


export function AmountReceivablesCard({ amount }: { amount: number }) {
    return (
        <MetricCard
            title="Receivables"
            value={`$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            subtitle="Pending clearance"
            icon={<DollarSign className="w-6 h-6" />}
            color="warning"
        />
    );
}

export function TotalLifetimeSalesCard({ amount }: { amount: number }) {
    return (
        <MetricCard
            title="Total Revenue"
            value={`$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            subtitle="Life-to-date"
            icon={<ShoppingBag className="w-6 h-6" />}
            color="success"
        />
    );
}

export function TodaySalesCard({ amount, change }: { amount: number; change: number }) {
    return (
        <MetricCard
            title="Sales Velocity"
            value={`$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            change={change}
            icon={<Calendar className="w-6 h-6" />}
            color="primary"
        />
    );
}

export function ThisMonthSalesCard({ amount, change }: { amount: number; change: number }) {
    return (
        <MetricCard
            title="Monthly Target"
            value={`$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            change={change}
            icon={<Calendar className="w-6 h-6" />}
            color="primary"
        />
    );
}

export function LastMonthSalesCard({ amount }: { amount: number }) {
    return (
        <MetricCard
            title="Previous Performance"
            value={`$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            subtitle="Closed month"
            icon={<Calendar className="w-6 h-6" />}
            color="primary"
        />
    );
}
