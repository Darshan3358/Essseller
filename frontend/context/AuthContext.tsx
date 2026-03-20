'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import FrozenAccountModal from '@/components/modals/FrozenAccountModal';

interface User {
    _id: string;
    name: string;
    email: string;
    shop_name?: string;
    shop_logo?: string;
    role?: string;
    verified?: number;
    settings?: {
        theme?: string;
        currency?: string;
        timezone?: string;
    },
    store_health?: number;
    store_performance?: string;
    store_status?: string;
    freeze?: number;
    store_health_updated_at?: string;
    diagnostics?: {
        fulfillment: string;
        rating: string;
        responseTime: string;
        qualityScore: string;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<any>;
    verify2FA: (email: string, otp: string) => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    register: (userData: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser && storedUser !== 'undefined') {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                
                // Refresh profile data in background to ensure sync
                api.get('/auth/profile').then(res => {
                    if (res && res._id) {
                        const updatedUser = { ...parsedUser, ...res };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                }).catch(err => {
                    console.error('Initial profile sync failed:', err.message);
                });
            } catch (error) {
                console.error('Failed to parse stored user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const theme = user?.settings?.theme || 'light';
        if (typeof document !== 'undefined') {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, [user?.settings?.theme]);

    const handleAuthSuccess = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setToken(token);
        setUser(user);

        if (user.role === 'admin') {
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));
            router.push('/admin/dashboard');
        } else {
            router.push('/dashboard');
        }
    };

    const login = async (credentials: any): Promise<any> => {
        setIsLoading(true);
        try {
            const data = await api.post('/auth/login', credentials);

            if (data && data.requiresOTP) {
                setIsLoading(false);
                return data;
            }

            const { token, user } = data;

            if (!token || !user) {
                throw new Error('Invalid response from authentication server');
            }

            handleAuthSuccess(token, user);
        } catch (error) {
            setIsLoading(false); // Ensure loading is off on error
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const verify2FA = async (email: string, otp: string) => {
        setIsLoading(true);
        try {
            const data = await api.post('/auth/verify-otp', { email, otp });
            const { token, user } = data;
            handleAuthSuccess(token, user);
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any) => {
        setIsLoading(true);
        try {
            console.log('[AUTH] Registering user with API...');
            const data = await api.post('/auth/register', userData);
            console.log('[AUTH] Registration response data:', data);
            
            const { token, user } = data;

            if (!token || !user) {
                console.error('[AUTH] Registration failed validation: token or user missing. Data:', data);
                throw new Error('Invalid registration response');
            }

            handleAuthSuccess(token, user);
        } catch (error) {
            console.error('[AUTH] Registration context failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = (userData: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...userData };
            if (userData.settings) {
                updated.settings = { ...(prev.settings || {}), ...userData.settings };
            }
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, verify2FA, updateUser, register, logout }}>
            {children}
            <FrozenAccountModal isOpen={user?.role === 'seller' && user?.freeze === 1 && pathname !== '/support'} />
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
