'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Mail, Lock, User, Store, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirm_password: '',
        shop_name: '',
        trans_password: '',
        confirm_trans_password: '',
        invitation_code: '',
        cert_type: '',
        cert_front: null as File | null,
        cert_back: null as File | null,
    });
    const [error, setError] = useState('');
    const { register, isLoading } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError('Login passwords do not match');
            return;
        }

        if (formData.trans_password !== formData.confirm_trans_password) {
            setError('Transaction passwords do not match');
            return;
        }

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('shop_name', formData.shop_name);
            data.append('trans_password', formData.trans_password);
            data.append('invitation_code', formData.invitation_code);
            data.append('cert_type', formData.cert_type);

            if (formData.cert_front) {
                data.append('cert_front', formData.cert_front);
            }
            if (formData.cert_back) {
                data.append('cert_back', formData.cert_back);
            }

            await register(data);
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] animate-pulse" />

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex w-20 h-20 bg-white/50 dark:bg-slate-900/50 rounded-2xl shadow-xl mb-6 animate-bounce-slow overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-blue-600 dark:text-blue-500 mb-2 mt-4">Setup Your Store</h1>
                    <p className="text-gray-500 dark:text-slate-400 font-medium">Join thousands of smart sellers today</p>
                </div>

                <div className="glass-card !bg-white/80 dark:!bg-slate-900/80 backdrop-blur-3xl border-white/40 dark:border-slate-800/40 p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-700"></div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {error && (
                            <div className="md:col-span-2 p-4 bg-danger-50 border border-danger-100 text-danger-600 text-sm font-bold rounded-xl animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group/input text-left">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within/input:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium dark:text-slate-100"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">Store Name</label>
                            <div className="relative group/input text-left">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within/input:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    name="shop_name"
                                    required
                                    value={formData.shop_name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium dark:text-slate-100"
                                    placeholder="My Awesome Store"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group/input text-left">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within/input:text-primary-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium dark:text-slate-100"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1 flex items-center gap-1">
                                Invitation Code <span className="text-gray-400 text-[10px] font-medium ml-1">(Optional)</span>
                            </label>
                            <div className="relative group/input text-left">
                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within/input:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    name="invitation_code"
                                    value={formData.invitation_code}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium dark:text-slate-100"
                                    placeholder="Enter invite code (if any)"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">Login Password</label>
                            <div className="relative group/input text-left">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within/input:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium dark:text-slate-100"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">Confirm Login Password</label>
                            <div className="relative group/input text-left">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within/input:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    name="confirm_password"
                                    required
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium dark:text-slate-100"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">Transaction Password</label>
                            <div className="relative group/input text-left">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within/input:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    name="trans_password"
                                    required
                                    value={formData.trans_password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium dark:text-slate-100"
                                    placeholder="Used for withdrawals"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">Confirm Trans.</label>
                            <div className="relative group/input text-left">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within/input:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    name="confirm_trans_password"
                                    required
                                    value={formData.confirm_trans_password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium dark:text-slate-100"
                                    placeholder="Repeat for confirmation"
                                />
                            </div>
                        </div>

                        {/* Certificate Info */}
                        <div className="md:col-span-2 mt-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-px flex-1 bg-gray-100"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verification Details</span>
                                <div className="h-px flex-1 bg-gray-100"></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">ID Type</label>
                            <select
                                name="cert_type"
                                required
                                value={formData.cert_type}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium appearance-none dark:text-slate-100"
                            >
                                <option value="" className="dark:bg-slate-900">Select ID Type</option>
                                <option value="id_card" className="dark:bg-slate-900">ID Card</option>
                                <option value="passport" className="dark:bg-slate-900">Passport</option>
                                <option value="driving_license" className="dark:bg-slate-900">Driving License</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">Front Side</label>
                            <input
                                type="file"
                                name="cert_front"
                                required
                                onChange={handleFileChange}
                                accept="image/*"
                                className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs font-medium file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary-50 dark:file:bg-slate-700 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">Back Side</label>
                            <input
                                type="file"
                                name="cert_back"
                                required
                                onChange={handleFileChange}
                                accept="image/*"
                                className="w-full px-4 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs font-medium file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary-50 dark:file:bg-slate-700 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100 transition-all"
                            />
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Launch My Store
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 font-medium">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary-600 font-black hover:underline underline-offset-4">Log In Instead</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {[
                        { title: 'Instant Setup', desc: 'Ready in under 2 minutes' },
                        { title: 'No Commitment', desc: 'Scale as you grow' },
                        { title: '24/7 Support', desc: 'Expert help anytime' }
                    ].map((feature, i) => (
                        <div key={i} className="space-y-1 animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }}>
                            <div className="flex justify-center mb-2">
                                <CheckCircle className="w-4 h-4 text-success-500" />
                            </div>
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">{feature.title}</h4>
                            <p className="text-[10px] text-gray-400 font-bold">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
