'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Mail, Lock, LogIn, Sparkles, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [otpEmail, setOtpEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const { login, verify2FA, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const res = await login({ email, password });
            if (res && res.requiresOTP) {
                setShowOTP(true);
                setOtpEmail(res.email);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        }
    };

    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await verify2FA(otpEmail, otp);
        } catch (err: any) {
            setError(err.message || 'Invalid OTP');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] animate-pulse" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-xl mb-6 animate-float">
                        <LayoutDashboard className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-blue-600 dark:text-blue-500 mb-2">
                        {showOTP ? 'Security Verification' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 font-medium tracking-tight">
                        {showOTP ? 'Enter the security code to continue' : 'Continue managing your smart store'}
                    </p>
                </div>

                <div className="glass-card !bg-white/80 dark:!bg-slate-900/80 backdrop-blur-3xl border-white/40 dark:border-slate-800/40 p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>

                    {!showOTP ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-danger-50 border border-danger-100 text-danger-600 text-sm font-bold rounded-xl animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group/input text-left">
                                    <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within/input:text-blue-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium relative z-10 dark:text-slate-100 dark:placeholder:text-slate-600"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest">Password</label>
                                    <Link href="/password/reset" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">Forgot?</Link>
                                </div>
                                <div className="relative group/input text-left">
                                    <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within/input:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-medium relative z-10 dark:text-slate-100 dark:placeholder:text-slate-600"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In
                                        <LogIn className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOTPSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-danger-50 border border-danger-100 text-danger-600 text-sm font-bold rounded-xl animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl flex items-start gap-3 text-left">
                                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                                        Verification code has been synchronized to your session for development.
                                        Check your terminal or system logs to continue.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Security Code</label>
                                    <div className="relative group/input text-center">
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full tracking-[1em] text-center py-6 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-2xl font-black relative z-10 dark:text-white"
                                            placeholder="••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Verify & Login
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowOTP(false)}
                                className="w-full text-sm font-bold text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors py-2"
                            >
                                Back to Login
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-800 text-center">
                        <p className="text-gray-500 dark:text-slate-400 font-medium">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-blue-600 dark:text-blue-400 font-black hover:underline underline-offset-4 tracking-tight">Create Store</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center items-center gap-6 text-gray-400 dark:text-slate-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Secure</span>
                    <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Encrypted</span>
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Smart</span>
                </div>
            </div>
        </div>
    );
}
