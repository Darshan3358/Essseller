import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "EssSmartSeller - Smart E-Commerce Management Platform",
    description: "Comprehensive e-commerce management system with sales analytics, supplier management, and store health monitoring",
    keywords: "e-commerce, sales analytics, supplier management, store health, dashboard",
    icons: {
        icon: "/logo.png",
        shortcut: "/logo.png",
        apple: "/logo.png",
    }
};

import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

import { Toaster } from 'react-hot-toast';
import TawkChat from "@/components/Chat/TawkChat";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    const user = JSON.parse(sessionStorage.getItem('user'));
                                    if (user && user.settings && user.settings.theme === 'dark') {
                                        document.documentElement.classList.add('dark');
                                    } else {
                                        document.documentElement.classList.remove('dark');
                                    }
                                } catch (e) {}
                            })();
                        `,
                    }}
                />
            </head>
            <body className="antialiased font-outfit" suppressHydrationWarning>
                <AuthProvider>
                    <LanguageProvider>
                        <Toaster position="top-right" />
                        <TawkChat />
                        {children}
                    </LanguageProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
