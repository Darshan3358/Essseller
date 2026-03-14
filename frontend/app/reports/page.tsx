'use client';

import { useState } from 'react';
import { Filter, Calendar, DollarSign, Package, TrendingUp, BarChart3, FilePieChart } from 'lucide-react';
import Shell from '@/components/layout/Shell';

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedCategory, setSelectedCategory] = useState('all');


    return (
        <Shell>
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Reports & Analytics</h2>
                        <p className="text-gray-600">Deep dive into your store performance metrics</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="glass-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary-500" /> Start Date
                            </label>
                            <input
                                type="date"
                                className="input-field py-2 text-sm"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary-500" /> End Date
                            </label>
                            <input
                                type="date"
                                className="input-field py-2 text-sm"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-primary-500" /> Category
                            </label>
                            <select
                                className="input-field py-2 text-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                <option value="electronics">Electronics</option>
                                <option value="fashion">Fashion</option>
                                <option value="home">Home & Living</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button className="btn-primary w-full py-2">Apply Filters</button>
                        </div>
                    </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: 'Total Revenue', value: '$0.00', change: '0.0%', icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-50' },
                        { title: 'Orders Placed', value: '0', change: '0.0%', icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { title: 'Avg Order Value', value: '$0.00', change: '0.0%', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { title: 'Gross Profit', value: '$0.00', change: '0.0%', icon: TrendingUp, color: 'text-success-600', bg: 'bg-success-50' },
                    ].map((stat, idx) => (
                        <div key={idx} className="metric-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <span className={`text-xs font-bold text-gray-400`}>
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                {/* Main Report Table */}
                <div className="glass-card overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <FilePieChart className="w-5 h-5 text-primary-600" />
                            Recent Performance Data
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Revenue</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Net Profit</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-center">Orders</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Avg Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500 italic">
                                        No performance data available for selected range.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Extra Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Channel Performance</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Direct Store', value: 65, color: 'bg-primary-500' },
                                { name: 'Marketplace', value: 25, color: 'bg-indigo-500' },
                                { name: 'Social Media', value: 10, color: 'bg-purple-500' },
                            ].map((item, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold text-gray-700">{item.name}</span>
                                        <span className="font-bold text-gray-900">{item.value}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="premium-card p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <TrendingUp className="w-10 h-10 mb-4 opacity-50" />
                        <h3 className="text-xl font-bold mb-2">Growth Forecast</h3>
                        <p className="text-indigo-100 text-sm mb-6">Based on your current data, we expect a 25% revenue increase in the next quarter. Keep optimizing your product stock!</p>
                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl font-bold transition-all">
                            View Detailed Forecast
                        </button>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
