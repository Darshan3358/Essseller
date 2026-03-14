'use client';

import { useState } from 'react';
import Shell from '@/components/layout/Shell';
import { Lock, Shield, Eye, EyeOff, CheckCircle, AlertTriangle, Key, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function PasswordPage() {
    const [showPass, setShowPass] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newTransPin, setNewTransPin] = useState('');
    const [confirmTransPin, setConfirmTransPin] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword) {
            setError('Please enter your current login password.');
            return;
        }
        if (!newTransPin || newTransPin.length < 4) {
            setError('Transaction password must be at least 4 characters.');
            return;
        }
        if (newTransPin !== confirmTransPin) {
            setError('Transaction passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const data = await api.put('/sellers/transaction-password', {
                currentPassword,
                newTransactionPassword: newTransPin,
            });
            setSuccess(data.message || 'Transaction password updated successfully!');
            setCurrentPassword('');
            setNewTransPin('');
            setConfirmTransPin('');
        } catch (err: any) {
            setError(err.message || 'Failed to update transaction password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Shell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Transaction Password</h2>
                    <p className="text-gray-600 mt-1">Secure your withdrawals and sensitive transactions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Form */}
                    <div className="space-y-6">
                        <div className="glass-card p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                                    <Key className="w-6 h-6" />
                                </div>
                                <h4 className="font-bold text-gray-900">Set Transaction Password</h4>
                            </div>

                            {success && (
                                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6 text-green-700 text-sm font-medium">
                                    <CheckCircle className="w-5 h-5 shrink-0" />
                                    {success}
                                </div>
                            )}
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-red-700 text-sm font-medium">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Current Login Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Current Login Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showCurrent ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            placeholder="Enter your login password"
                                            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                        >
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Transaction Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        New Transaction Password
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            value={newTransPin}
                                            onChange={e => setNewTransPin(e.target.value)}
                                            placeholder="Enter new transaction password"
                                            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                        >
                                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Transaction Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Confirm Transaction Password
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmTransPin}
                                            onChange={e => setConfirmTransPin(e.target.value)}
                                            placeholder="Re-enter transaction password"
                                            className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {confirmTransPin && newTransPin && confirmTransPin !== newTransPin && (
                                        <p className="mt-1.5 text-xs text-red-500 font-medium">Passwords do not match</p>
                                    )}
                                    {confirmTransPin && newTransPin && confirmTransPin === newTransPin && (
                                        <p className="mt-1.5 text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : <><Key className="w-5 h-5" /> Update Password</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right: Tips */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 border-l-4 border-primary-500">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary-600" />
                                Security Tips
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    'Never share your transaction password with anyone, including staff.',
                                    'Avoid using simple combinations like 123456 or 000000.',
                                    'Regularly update your password every few months for better security.',
                                    'Each withdrawal request will require this password for verification.'
                                ].map((tip, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="glass-card p-6 bg-yellow-50/50 border border-yellow-200">
                            <div className="flex gap-4">
                                <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-yellow-900 mb-1">Important</h4>
                                    <p className="text-xs text-yellow-800">
                                        Your current <strong>login password</strong> is required to change the transaction password. This is an extra security layer to prevent unauthorized changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
