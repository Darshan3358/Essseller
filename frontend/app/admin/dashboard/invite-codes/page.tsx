'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Key, RefreshCw, Clock, Copy, Check, Trash2, Lock, Unlock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function CodesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'available';
    
    const [activeTab, setActiveTab] = useState(initialTab);
    const [codes, setCodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('adminToken') : '';

    const fetchCodes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiUrl}/settings/invite-codes`, { headers: { Authorization: `Bearer ${getToken()}` } });
            const data = await res.json();
            if (data.success) setCodes(data.codes);
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    };

    useEffect(() => { fetchCodes(); }, []);

    const generateRandom = async () => {
        const prefixes = ['LKC', 'ESS', 'REF', 'ACT', 'VIP'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const generated = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
        setMsg(''); setError(''); setGenerating(true);
        try {
            const res = await fetch(`${apiUrl}/settings/invite-codes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ code: generated })
            });
            const data = await res.json();
            if (data.success) {
                setMsg('✅ Code generated successfully!');
                fetchCodes();
                setTimeout(() => setMsg(''), 3000);
            } else { setError(data.message || 'Failed to create'); }
        } catch (e: any) { setError(e.message); }
        setGenerating(false);
    };

    const deleteCode = async (id: string, code: string) => {
        if (!confirm(`Delete code "${code}"?`)) return;
        try {
            const res = await fetch(`${apiUrl}/settings/invite-codes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
            const data = await res.json();
            if (data.success) { fetchCodes(); setMsg('🗑 Code deleted'); setTimeout(() => setMsg(''), 2000); }
        } catch (e: any) { setError(e.message); }
    };

    const copyCode = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const unusedCodes = codes.filter(c => !c.isUsed);
    const usedCodes = codes.filter(c => c.isUsed);

    const displayCodes = activeTab === 'available' ? unusedCodes : usedCodes;

    return (
        <div className="min-h-screen bg-[#020617] p-6 lg:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Back button and Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-bold mb-4">
                            <ArrowLeft size={16} /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                <Key size={28} className="text-blue-500" />
                            </div>
                            Activation Codes
                        </h1>
                    </div>

                    <button 
                        onClick={generateRandom}
                        disabled={generating}
                        className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {generating ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        {generating ? 'Generating...' : 'Generate New Code'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 bg-white/5 border border-white/5 rounded-2xl w-fit">
                    <button 
                        onClick={() => setActiveTab('available')}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'available' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white/60'}`}
                    >
                        Available ({unusedCodes.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('used')}
                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'used' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-white/40 hover:text-white/60'}`}
                    >
                        Used ({usedCodes.length})
                    </button>
                </div>

                {/* Messages */}
                {msg && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm font-bold animate-fade-in">{msg}</div>}
                {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm font-bold animate-fade-in">{error}</div>}

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="py-20 text-center text-white/20 font-bold animate-pulse">Loading codes...</div>
                    ) : displayCodes.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px] text-white/20 font-bold">
                            No {activeTab} codes found
                        </div>
                    ) : (
                        displayCodes.map(c => (
                            <div key={c._id} className="group relative bg-white/[0.03] border border-white/5 hover:border-white/10 p-6 rounded-[24px] transition-all duration-300">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl ${c.isUsed ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                                            {c.isUsed ? <Lock className="text-rose-500" size={24} /> : <Unlock className="text-emerald-500" size={24} />}
                                        </div>
                                        <div>
                                            <div className={`text-2xl font-black tracking-widest font-mono ${c.isUsed ? 'text-white/20 line-through' : 'text-white'}`}>
                                                {c.code}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] uppercase tracking-widest font-black text-white/20">Created on</span>
                                                <span className="text-xs font-bold text-white/40">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {c.isUsed ? (
                                        <div className="text-right">
                                            <div className="text-sm font-black text-rose-500 mb-1">Used by: {c.usedBy}</div>
                                            <div className="text-xs font-bold text-white/20">{new Date(c.usedAt).toLocaleDateString()} {new Date(c.usedAt).toLocaleTimeString()}</div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => copyCode(c.code, c._id)}
                                                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${copiedId === c._id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                {copiedId === c._id ? <Check size={16} /> : <Copy size={16} />}
                                                {copiedId === c._id ? 'Copied' : 'Copy Code'}
                                            </button>
                                            <button 
                                                onClick={() => deleteCode(c._id, c.code)}
                                                className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default function InviteCodesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CodesContent />
        </Suspense>
    );
}
