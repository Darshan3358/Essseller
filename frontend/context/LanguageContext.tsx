'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';

type Language = "English (US)" | "English (UK)" | "Spanish (Español)" | "French (Français)" |
    "German (Deutsch)" | "Italian (Italiano)" | "Portuguese (Português)" |
    "Russian (Русский)" | "Chinese (Simplified)" | "Japanese (日本語)" |
    "Korean (한국어)" | "Arabic (العربية)" | "Hindi (हिन्दी)" |
    "Bengali (বাংলা)" | "Turkish (Türkçe)";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [language, setLanguageState] = useState<Language>('English (US)');

    useEffect(() => {
        // Init from user settings if available
        if (user && (user as any).language) {
            setLanguageState((user as any).language);
        } else {
            // Or from local storage
            const stored = localStorage.getItem('app_language');
            if (stored) setLanguageState(stored as Language);
        }
    }, [user]);

    const setLanguage = async (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app_language', lang);

        if (user) {
            try {
                await api.put('/sellers/shop-settings', { language: lang });
            } catch (err) {
                console.error("Failed to sync language to backend", err);
            }
        }
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
