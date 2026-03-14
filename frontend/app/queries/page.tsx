'use client';

import Shell from '@/components/layout/Shell';
import { Box, HelpCircle, MessageCircle, Reply, ArrowRight, User, Clock, CheckCircle2, MoreVertical, Heart } from 'lucide-react';

export default function QueriesPage() {
    return (
        <Shell>
            <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-black uppercase tracking-widest">
                            <HelpCircle className="w-3 h-3" />
                            Customer Inquiries
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Product Queries</h2>
                        <p className="text-gray-500 font-medium max-w-xl">Respond to potential buyers asking about product details, specifications, and availability.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-8 group">
                        <div className="flex items-start justify-between">
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full">No new</span>
                        </div>
                        <h4 className="text-4xl font-black text-gray-900 mt-6 leading-tight">0</h4>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Active Queries</p>
                    </div>
                    <div className="glass-card p-8 group">
                        <div className="flex items-start justify-between">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full">N/A</span>
                        </div>
                        <h4 className="text-4xl font-black text-gray-900 mt-6 leading-tight">--</h4>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Avg Response Time</p>
                    </div>
                    <div className="glass-card p-8 group">
                        <div className="flex items-start justify-between">
                            <div className="p-4 bg-success-50 text-success-600 rounded-2xl group-hover:bg-success-600 group-hover:text-white transition-all duration-500">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Stable</span>
                        </div>
                        <h4 className="text-4xl font-black text-gray-900 mt-6 leading-tight">0%</h4>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Resolution Rate</p>
                    </div>
                </div>

                {/* Queries List - Empty State */}
                <div className="glass-card py-32 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 relative">
                        <HelpCircle className="w-12 h-12" />
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <MessageCircle className="w-5 h-5 text-gray-300" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900">No Product Queries Yet</h3>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto">
                            When customers ask questions about your products, they will appear here. Be sure to respond quickly to build trust!
                        </p>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
