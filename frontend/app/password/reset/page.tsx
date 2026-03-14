'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, Send, Sparkles, LayoutDashboard, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.message || 'Recovery link sent! Please check your email.');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background blobs — same as login page */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] animate-pulse" />

            <div className="w-full max-w-md relative z-10">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl mb-6 animate-float">
                        <LayoutDashboard className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-blue-600 mb-2">
                        Forgot Password
                    </h1>
                    <p className="text-gray-500 font-medium">Reset your store access via email</p>
                </div>

                {/* Card */}
                <div className="glass-card !bg-white/80 backdrop-blur-3xl border-white/40 p-10 shadow-2xl relative overflow-hidden">
                    {/* Top accent bar — matches login blue gradient */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700" />

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Error alert */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* Success alert */}
                        {message && (
                            <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm font-bold rounded-xl flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-green-500" />
                                <span>{message}</span>
                            </div>
                        )}

                        {/* Email field */}
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-widest ml-1">
                                Email Address
                            </label>
                            <div className="relative group/input">
                                <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-white/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-sm font-medium relative z-10"
                                    placeholder="name@example.com"
                                />
                            </div>
                            <p className="text-xs text-gray-400 ml-1 mt-1">
                                We&apos;ll send a password reset link to this email.
                            </p>
                        </div>

                        {/* Submit button — exact same style as login "Sign In" */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Send Recovery Link
                                    <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-blue-600 font-black hover:gap-3 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Footer badges */}
                <div className="mt-8 flex justify-center items-center gap-6 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Secure</span>
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Encrypted</span>
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Smart</span>
                </div>
            </div>
        </div>
    );
}
