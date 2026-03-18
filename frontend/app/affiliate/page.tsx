'use client';

import Shell from '@/components/layout/Shell';
import { Users, Gift, Share2, DollarSign, Trophy, ArrowRight, Copy, CheckCircle2, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AffiliatePage() {
    const { user } = useAuth();
    const [copied, setCopied] = useState(false);
    const referralLink = typeof window !== 'undefined' && user ? `${window.location.origin}/register?ref=${user._id}` : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Shell>
            <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
                {/* Hero section */}
                <div className="relative p-10 lg:p-16 rounded-[3rem] bg-slate-900 overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                    <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary-600/30 rounded-full blur-[100px] group-hover:bg-primary-500/40 transition-colors duration-1000" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                                <Trophy className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-white text-xs font-black uppercase tracking-widest">Affiliate Program</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl lg:text-6xl font-black text-white leading-tight">
                                Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">Recurring Rewards</span> for life.
                            </h1>
                            <p className="text-gray-400 text-lg font-medium max-w-lg leading-relaxed">
                                Share the future of commerce with your network. Get 15% commission on every active referral, paid out instantly.
                            </p>

                            <div className="space-y-4 pt-4">
                                <p className="text-white text-sm font-bold uppercase tracking-widest opacity-60">Your Referral link</p>
                                <div className="flex bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl max-w-md group/link">
                                    <input
                                        type="text"
                                        readOnly
                                        value={referralLink}
                                        className="bg-transparent text-white px-4 py-3 flex-1 outline-none font-bold text-sm"
                                    />
                                    <button
                                        onClick={copyToClipboard}
                                        className={`px-6 py-3 rounded-xl font-black transition-all flex items-center gap-2 ${copied ? 'bg-success-500 text-white' : 'bg-primary-600 text-white hover:bg-primary-500'
                                            }`}
                                    >
                                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 relative">
                            {[
                                { label: 'Total Earned', value: '$0.00', icon: DollarSign, color: 'text-success-400' },
                                { label: 'Active Referrals', value: '0', icon: Users, color: 'text-primary-400' },
                                { label: 'Conversion Rate', value: '0.0%', icon: TrendingUp, color: 'text-blue-400' },
                                { label: 'Pending Payout', value: '$0.00', icon: Gift, color: 'text-yellow-400' },
                            ].map((stat, i) => (
                                <div key={i} className="glass-card !bg-white/5 border-white/10 p-8 hover:!bg-white/10 transition-all duration-300 group/stat">
                                    <div className={`p-3 bg-white/5 rounded-2xl w-fit mb-4 group-hover/stat:scale-110 transition-transform ${stat.color}`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-3xl font-black text-white">{stat.value}</h4>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* How it works */}
                <div className="space-y-8">
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 text-center">Three Simple Steps</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Share Link', desc: 'Post your referral link on social media or send it directly.', icon: Share2 },
                            { title: 'Invite Friends', desc: 'When people sign up using your link, they become your referrals.', icon: Users },
                            { title: 'Get Paid', desc: 'Receive automatically generated commissions in your wallet.', icon: DollarSign },
                        ].map((step, i) => (
                            <div key={i} className="glass-card p-10 text-center space-y-4 hover:border-primary-200 transition-all">
                                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-6">
                                    <step.icon className="w-8 h-8" />
                                </div>
                                <h4 className="text-xl font-black text-gray-900">{step.title}</h4>
                                <p className="text-gray-500 font-medium">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Referral History Table */}
                <div className="glass-card overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900">Recent Referrals</h3>
                        <button className="text-primary-600 font-black text-sm flex items-center gap-2 hover:gap-3 transition-all">
                            View Performance Repo
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5">User</th>
                                    <th className="px-8 py-5">Date Joined</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Earnings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                                <Users className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-bold text-lg">No referrals yet</p>
                                            <p className="text-gray-400 text-sm max-w-xs mx-auto">Share your referral link to start building your network and earning commissions.</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
