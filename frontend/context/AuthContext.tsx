'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface User {
    _id: string;
    name: string;
    email: string;
    shop_name?: string;
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

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser && storedUser !== 'undefined') {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
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
            router.push('/');
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
            const data = await api.post('/auth/register', userData);
            const { token, user } = data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);
            router.push('/');
        } catch (error) {
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
