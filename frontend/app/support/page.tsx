'use client';

import Shell from '@/components/layout/Shell';
import { FileText, Plus, Search, AlertCircle, Clock, CheckCircle2, MessageSquare, ArrowRight, LifeBuoy, Zap, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function SupportTicketPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('All Tickets');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ subject: '', description: '', priority: 'Medium' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await api.get('/support');
            if (res.success) {
                setTickets(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('/support', formData);
            if (res.success) {
                setShowModal(false);
                setFormData({ subject: '', description: '', priority: 'Medium' });
                fetchTickets();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTickets = tickets.filter(tkt => {
        const matchesSearch = tkt.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(tkt._id).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All Tickets' || tkt.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-blue-50 text-blue-600';
            case 'In Progress': return 'bg-amber-50 text-amber-600';
            case 'Resolved': return 'bg-emerald-50 text-emerald-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <Shell>
            <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
                {/* Visual Banner */}
                <div className="relative p-12 lg:p-20 rounded-[3rem] bg-blue-900 text-white overflow-hidden group">
                    <LifeBuoy className="absolute -bottom-10 -left-10 w-64 h-64 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/20 to-transparent" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                                <Zap className="w-4 h-4 text-warning-400" />
                                <span className="text-white text-[10px] font-black uppercase tracking-widest">Global Support Center</span>
                            </div>
                            <h1 className="text-3xl lg:text-7xl font-black text-white tracking-tight leading-tight">
                                Expert Help, <br />When You Need It.
                            </h1>
                            <p className="text-blue-200 text-lg font-medium max-w-lg leading-relaxed">
                                Our dedicated support engineers are on standby 24/7 to help you resolve any issues with your store or shipments.
                            </p>
                            <button onClick={() => setShowModal(true)} className="px-10 py-5 bg-white text-blue-900 rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                                <Plus className="w-6 h-6" />
                                Create New Ticket
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ticket List Header */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 group w-full md:w-auto">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search your tickets (ID or subject)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                        />
                    </div>
                    <div className="flex bg-gray-100/50 p-2 rounded-[2rem] border border-gray-100 w-full md:w-auto shrink-0 overflow-x-auto no-scrollbar">
                        {['All Tickets', 'Open', 'In Progress', 'Resolved'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tickets Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredTickets.length === 0 ? (
                        <div className="glass-card p-16 text-center border-dashed border-2 border-gray-200 bg-white/40">
                            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p className="font-bold text-lg text-gray-500 mb-2">No support tickets found</p>
                            <p className="text-sm text-gray-400">Try adjusting your filters or create a new ticket.</p>
                        </div>
                    ) : (
                        filteredTickets.map((tkt, i) => (
                            <div key={i} className="glass-card group hover:border-blue-100 transition-all p-8 flex flex-col md:flex-row items-center gap-10">
                                <div className="shrink-0">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center relative ${getStatusStyles(tkt.status)}`}>
                                        <FileText className="w-10 h-10" />
                                        <div className={`absolute -top-1 -right-1 p-2 rounded-xl shadow-lg ${tkt.priority === 'High' ? 'bg-red-500' :
                                            tkt.priority === 'Medium' ? 'bg-amber-500' : 'bg-gray-400'
                                            }`}>
                                            <AlertCircle className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{tkt.subject}</h3>
                                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg shrink-0">TKT-{tkt._id?.slice(-4).toUpperCase()}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-500">
                                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" /> Opened {new Date(tkt.createdAt).toLocaleDateString()}</span>
                                        <span className={`flex items-center gap-1.5 ${tkt.status === 'Resolved' ? 'text-emerald-600' :
                                            tkt.status === 'In Progress' ? 'text-amber-600' : 'text-blue-600 animate-pulse'
                                            }`}>
                                            {tkt.status === 'Resolved' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                            {tkt.status}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedTicket(tkt)}
                                    className="w-full md:w-auto px-8 py-4 bg-gray-50 group-hover:bg-blue-600 text-gray-500 group-hover:text-white rounded-[1.5rem] font-black shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3"
                                >
                                    View Case
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Case Detail Modal */}
                {selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedTicket(null)}>
                        <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-bold">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{selectedTicket.subject}</h3>
                                        <p className="text-xs text-gray-400 font-bold tracking-widest">TKT-{selectedTicket._id.toUpperCase()}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="p-3 text-gray-400 hover:bg-gray-100 rounded-2xl transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issue Description</p>
                                    <div className="p-6 bg-gray-50 rounded-3xl text-gray-700 font-medium leading-relaxed">
                                        {selectedTicket.description}
                                    </div>
                                </div>

                                {selectedTicket.remark && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Admin Response
                                        </p>
                                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl text-blue-900 font-bold italic leading-relaxed">
                                            "{selectedTicket.remark}"
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Status</p>
                                        <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${selectedTicket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                            {selectedTicket.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Priority Level</p>
                                        <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${selectedTicket.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {selectedTicket.priority}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Create Support Ticket</h3>
                                <p className="text-sm text-gray-500 mt-1">Describe your issue in detail below.</p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Ticket Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. Cannot update my banking details"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Description</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                    placeholder="Please provide as much context as possible..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Priority Level</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="Low">Low - General Inquiry</option>
                                    <option value="Medium">Medium - Issue impacting work</option>
                                    <option value="High">High - Critical failure/Blocker</option>
                                </select>
                            </div>
                            <div className="pt-4 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Creating...' : 'Submit Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Shell>
    );
}
