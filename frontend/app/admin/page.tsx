'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, LogIn, Zap } from 'lucide-react';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Login failed');

            if (data.requiresOTP) {
                setShowOTP(true);
                setMsg(data.message);
                return;
            }

            if (data.user?.role !== 'admin') {
                throw new Error('Access denied. Admin account required.');
            }

            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Verification failed');

            if (data.role !== 'admin') {
                throw new Error('Access denied. Only Admin can use this portal.');
            }

            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data));
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated background shapes */}
            <div style={{
                position: 'absolute', top: '-20%', left: '-10%',
                width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
                borderRadius: '50%', animation: 'pulse 4s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute', bottom: '-20%', right: '-10%',
                width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
                borderRadius: '50%', animation: 'pulse 5s ease-in-out infinite 1s'
            }} />

            <div style={{ width: '100%', maxWidth: '440px', padding: '24px', position: 'relative', zIndex: 10 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '80px', height: '80px',
                        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                        borderRadius: '24px', boxShadow: '0 20px 40px rgba(59,130,246,0.4)',
                        marginBottom: '24px'
                    }}>
                        <Shield size={36} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: '32px', fontWeight: '800',
                        background: 'linear-gradient(135deg, #fff, #c4b5fd)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        margin: '0 0 8px'
                    }}>Admin Panel</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
                        ESSmartseller Control Center
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                }}>
                    <div style={{
                        height: '3px',
                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #ec4899)',
                        borderRadius: '3px',
                        marginBottom: '32px',
                        marginLeft: '-40px',
                        marginRight: '-40px',
                        marginTop: '-40px',
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px'
                    }} />

                    <form onSubmit={showOTP ? handleVerifyOTP : handleSubmit}>
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '12px',
                                color: '#fca5a5',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '20px'
                            }}>
                                {error}
                            </div>
                        )}

                        {msg && !error && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(16,185,129,0.1)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                borderRadius: '12px',
                                color: '#6ee7b7',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginBottom: '20px'
                            }}>
                                {msg}
                            </div>
                        )}

                        {!showOTP ? (
                            <>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{
                                        display: 'block', fontSize: '11px', fontWeight: '700',
                                        color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                                        letterSpacing: '0.1em', marginBottom: '8px'
                                    }}>Admin Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{
                                            position: 'absolute', left: '14px', top: '50%',
                                            transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)'
                                        }} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="admin@essmarter.com"
                                            required
                                            style={{
                                                width: '100%', padding: '14px 14px 14px 44px',
                                                background: 'rgba(255,255,255,0.07)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px', color: 'white',
                                                fontSize: '14px', outline: 'none',
                                                boxSizing: 'border-box',
                                                transition: 'border-color 0.2s'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '28px' }}>
                                    <label style={{
                                        display: 'block', fontSize: '11px', fontWeight: '700',
                                        color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                                        letterSpacing: '0.1em', marginBottom: '8px'
                                    }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{
                                            position: 'absolute', left: '14px', top: '50%',
                                            transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)'
                                        }} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            style={{
                                                width: '100%', padding: '14px 14px 14px 44px',
                                                background: 'rgba(255,255,255,0.07)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '12px', color: 'white',
                                                fontSize: '14px', outline: 'none',
                                                boxSizing: 'border-box',
                                                transition: 'border-color 0.2s'
                                            }}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ marginBottom: '28px' }}>
                                <label style={{
                                    display: 'block', fontSize: '11px', fontWeight: '700',
                                    color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                                    letterSpacing: '0.1em', marginBottom: '8px'
                                }}>Verification Code</label>
                                <div style={{ position: 'relative' }}>
                                    <Shield size={18} style={{
                                        position: 'absolute', left: '14px', top: '50%',
                                        transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)'
                                    }} />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="6-digit code"
                                        required
                                        maxLength={6}
                                        style={{
                                            width: '100%', padding: '14px 14px 14px 44px',
                                            paddingLeft: '44px',
                                            background: 'rgba(255,255,255,0.07)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px', color: 'white',
                                            fontSize: '24px', letterSpacing: '0.3em', textAlign: 'left',
                                            outline: 'none', boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowOTP(false)}
                                    style={{
                                        background: 'none', border: 'none', color: '#60a5fa',
                                        fontSize: '12px', fontWeight: '600', marginTop: '12px',
                                        cursor: 'pointer', padding: 0
                                    }}>
                                    Use different account?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '15px',
                                background: loading
                                    ? 'rgba(59,130,246,0.5)'
                                    : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                                border: 'none', borderRadius: '12px',
                                color: 'white', fontSize: '15px', fontWeight: '700',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                boxShadow: loading ? 'none' : '0 10px 25px rgba(59,130,246,0.4)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? (
                                <div style={{
                                    width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white', borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                            ) : (
                                <>
                                    <Zap size={18} />
                                    {showOTP ? 'Verify & Login' : 'Access Admin Panel'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '24px' }}>
                    🔒 Secured access · Admin only
                </p>
            </div>

            <style>{`
                @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                input::placeholder { color: rgba(255,255,255,0.25) !important; }
            `}</style>
        </div>
    );
}
