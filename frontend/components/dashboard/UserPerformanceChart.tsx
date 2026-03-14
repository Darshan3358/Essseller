'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '@/types';
import { TrendingUp, DollarSign, ShoppingCart, CreditCard, ChevronDown, Calendar } from 'lucide-react';

interface UserPerformanceChartProps {
    data: ChartDataPoint[];
    onRangeChange?: (range: '7days' | '30days' | '6months' | '12months') => void;
}

type MetricType = 'sales' | 'profit' | 'orders' | 'aov';

const metricConfig = {
    sales: {
        label: 'Gross Sales',
        color: '#6366f1', // Indigo
        icon: DollarSign,
    },
    profit: {
        label: 'Net Profit',
        color: '#10b981', // Emerald
        icon: TrendingUp,
    },
    orders: {
        label: 'Order Volume',
        color: '#f59e0b', // Amber
        icon: ShoppingCart,
    },
    aov: {
        label: 'Average Order Value',
        color: '#ef4444', // Rose
        icon: CreditCard,
    },
};

export default function UserPerformanceChart({ data, onRangeChange }: UserPerformanceChartProps) {
    const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['sales', 'profit']);
    const [dateRange, setDateRange] = useState<'7days' | '30days' | '6months' | '12months'>('7days');

    const toggleMetric = (metric: MetricType) => {
        setSelectedMetrics(prev => 
            prev.includes(metric) 
                ? (prev.length > 1 ? prev.filter(m => m !== metric) : prev) 
                : [...prev, metric]
        );
    };

    const handleRangeChange = (range: '7days' | '30days' | '6months' | '12months') => {
        setDateRange(range);
        if (onRangeChange) onRangeChange(range);
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl backdrop-blur-xl min-w-[200px]">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">{label}</p>
                    <div className="space-y-3">
                        {payload.map((entry: any, index: number) => {
                            const metricKey = entry.dataKey as MetricType;
                            const config = metricConfig[metricKey];
                            return (
                                <div key={index} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold whitespace-nowrap">{config.label}</span>
                                    </div>
                                    <span className="text-slate-900 dark:text-white text-sm font-black">
                                        {metricKey === 'orders'
                                            ? entry.value
                                            : `₹${entry.value.toLocaleString()}`}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="premium-card bg-white dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-6 md:p-10 rounded-[2.5rem] shadow-sm">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-primary-600" />
                        Sales Statistics
                    </h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold">Monitoring your business growth and performance metrics</p>
                </div>

                {/* Range Selector */}
                <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {(['7days', '30days', '6months', '12months'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => handleRangeChange(range)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 ${dateRange === range
                                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            {range === '7days' && '1W'}
                            {range === '30days' && '1M'}
                            {range === '6months' && '6M'}
                            {range === '12months' && '1Y'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric Selection Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {(Object.keys(metricConfig) as MetricType[]).map((metric) => {
                    const item = metricConfig[metric];
                    const isSelected = selectedMetrics.includes(metric);
                    const Icon = item.icon;

                    return (
                        <button
                            key={metric}
                            onClick={() => toggleMetric(metric)}
                            className={`flex items-center gap-4 px-6 py-5 rounded-3xl border transition-all duration-500 text-left relative overflow-hidden group ${isSelected
                                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-md'
                                : 'bg-slate-50/50 dark:bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                }`}
                        >
                            {isSelected && (
                                <div 
                                    className="absolute bottom-0 left-0 h-1 bg-current transition-all duration-500" 
                                    style={{ color: item.color, width: '100%' }}
                                />
                            )}
                            
                            <div 
                                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner"
                                style={{ 
                                    backgroundColor: isSelected ? `${item.color}15` : 'rgba(0,0,0,0.03)',
                                    color: item.color
                                }}
                            >
                                <Icon size={22} className={isSelected ? 'scale-110' : 'scale-100 opacity-50'} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest truncate">{item.label}</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <p className="text-slate-900 dark:text-white font-black text-lg truncate">
                                        {metric === 'orders' 
                                            ? Math.round(data.reduce((a, b: any) => a + (b[metric] || 0), 0) / (data.length || 1))
                                            : `₹${(data.reduce((a, b: any) => a + (b[metric] || 0), 0) / (data.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                                        }
                                    </p>
                                    <span className="text-slate-400 dark:text-slate-600 text-[10px] font-bold">avg</span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Chart Area */}
            <div className="h-[450px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            {(Object.keys(metricConfig) as MetricType[]).map((metric) => (
                                <linearGradient key={metric} id={`userColor${metric}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={metricConfig[metric].color} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={metricConfig[metric].color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid 
                            vertical={false} 
                            stroke="rgba(0,0,0,0.03)" 
                            dark-stroke="rgba(255,255,255,0.03)"
                            strokeDasharray="8 8" 
                        />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            dy={15}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                        />
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }}
                        />
                        {selectedMetrics.map((metric) => (
                            <Area
                                key={metric}
                                type="monotone"
                                dataKey={metric}
                                stroke={metricConfig[metric].color}
                                strokeWidth={4}
                                fillOpacity={1}
                                fill={`url(#userColor${metric})`}
                                animationDuration={1000}
                                activeDot={{ 
                                    r: 7, 
                                    fill: metricConfig[metric].color, 
                                    stroke: '#fff', 
                                    strokeWidth: 3
                                }}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
