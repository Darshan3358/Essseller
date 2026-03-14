'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint, DateRange } from '@/types';
import { TrendingUp, DollarSign, ShoppingCart, CreditCard, ChevronDown } from 'lucide-react';

interface SalesChartProps {
    data: ChartDataPoint[];
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

export default function SalesChart({ data }: SalesChartProps) {
    const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['sales', 'profit']);
    const [dateRange, setDateRange] = useState<DateRange>('7days');

    const toggleMetric = (metric: MetricType) => {
        setSelectedMetrics(prev => 
            prev.includes(metric) 
                ? (prev.length > 1 ? prev.filter(m => m !== metric) : prev) 
                : [...prev, metric]
        );
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1A1A1A] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl min-w-[180px]">
                    <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider mb-3">{label}</p>
                    <div className="space-y-3">
                        {payload.map((entry: any, index: number) => {
                            const metricKey = entry.dataKey as MetricType;
                            const config = metricConfig[metricKey];
                            return (
                                <div key={index} className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-white/40 text-[10px] whitespace-nowrap">{config.label}</span>
                                    </div>
                                    <span className="text-white text-sm font-bold">
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
        <div className="w-full flex flex-col gap-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Sales Statistics</h2>
                    <p className="text-white/40 text-sm font-medium">Monitoring platform performance and revenue growth</p>
                </div>

                {/* Range Selector - Pill Design */}
                <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-full h-12">
                    {(['7days', '30days', '6months', '12months'] as DateRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${dateRange === range
                                ? 'bg-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                                : 'text-white/40 hover:text-white'
                                }`}
                        >
                            {range === '7days' && '1W'}
                            {range === '30days' && '1M'}
                            {range === '6months' && '6M'}
                            {range === '12months' && '1Y'}
                        </button>
                    ))}
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button className="px-3 text-white/40 hover:text-white transition-colors">
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>

            {/* Metric Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4">
                {(Object.keys(metricConfig) as MetricType[]).map((metric) => {
                    const item = metricConfig[metric];
                    const isSelected = selectedMetrics.includes(metric);
                    const Icon = item.icon;

                    return (
                        <button
                            key={metric}
                            onClick={() => toggleMetric(metric)}
                            className={`flex items-center gap-3 px-4 lg:px-5 py-3 rounded-2xl border transition-all duration-500 flex-1 ${isSelected
                                ? 'bg-white/[0.08] border-white/20 shadow-xl'
                                : 'bg-transparent border-transparent opacity-40 hover:opacity-100 hover:bg-white/5'
                                }`}
                        >
                            <div 
                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500"
                                style={{ 
                                    backgroundColor: isSelected ? `${item.color}22` : 'rgba(255,255,255,0.05)',
                                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                                }}
                            >
                                <Icon size={18} style={{ color: item.color }} />
                            </div>
                            <div className="text-left">
                                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.1em]">{item.label}</p>
                                <p className="text-white font-bold">
                                    {metric === 'orders' 
                                        ? Math.round(data.reduce((a, b: any) => a + (b[metric] || 0), 0) / (data.length || 1))
                                        : `₹${(data.reduce((a, b: any) => a + (b[metric] || 0), 0) / (data.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                                    }
                                    <span className="text-white/30 text-[10px] font-normal ml-1">avg</span>
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Chart Area */}
            <div className="h-[450px] w-full relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl -z-10" />
                
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            {(Object.keys(metricConfig) as MetricType[]).map((metric) => (
                                <linearGradient key={metric} id={`color${metric}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={metricConfig[metric].color} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={metricConfig[metric].color} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid 
                            vertical={false} 
                            stroke="rgba(255,255,255,0.03)" 
                            strokeDasharray="8 8" 
                        />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 500 }}
                            dy={15}
                        />
                        <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 500 }}
                            tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                        />
                        <Tooltip 
                            content={<CustomTooltip />} 
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        {selectedMetrics.map((metric) => (
                            <Area
                                key={metric}
                                type="monotone"
                                dataKey={metric}
                                stroke={metricConfig[metric].color}
                                strokeWidth={3}
                                fillOpacity={1}
                                fill={`url(#color${metric})`}
                                animationDuration={1000}
                                activeDot={{ 
                                    r: 6, 
                                    fill: metricConfig[metric].color, 
                                    stroke: '#fff', 
                                    strokeWidth: 2
                                }}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
