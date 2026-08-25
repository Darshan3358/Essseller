'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const CRISP_WEBSITE_ID = 'YOUR_CRISP_WEBSITE_ID'; // 🔁 Replace with your Crisp Website ID

export default function CrispChat() {
    const { user } = useAuth();

    useEffect(() => {
        // Initialize Crisp
        // @ts-ignore
        window.$crisp = [];
        // @ts-ignore
        window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

        const script = document.createElement('script');
        script.src = 'https://client.crisp.chat/l.js';
        script.async = true;
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        // Set user identity when user logs in
        // @ts-ignore
        if (user && window.$crisp) {
            // @ts-ignore
            window.$crisp.push(['set', 'user:email', [user.email]]);
            // @ts-ignore
            window.$crisp.push(['set', 'user:nickname', [user.shop_name || user.name || 'Seller']]);
            if (user.shop_logo) {
                // @ts-ignore
                window.$crisp.push(['set', 'user:avatar', [user.shop_logo]]);
            }
            // Custom data visible to your support team
            // @ts-ignore
            window.$crisp.push(['set', 'session:data', [[
                ['shop_name', user.shop_name || 'N/A'],
                ['seller_id', user._id],
            ]]]);
        }
    }, [user]);

    return null;
}
