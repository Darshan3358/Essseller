'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getFullImageUrl } from '@/lib/api';

export default function TawkChat() {
    const { user } = useAuth();
    const scriptLoaded = useRef(false);

    useEffect(() => {
        // Do NOT load the script here. We must wait for the user to be available
        // so we can set visitor.name BEFORE Tawk initialises the session.
        // Setting visitor.name before script load is the ONLY way to replace
        // the auto-generated "V17804..." ID with the real shop name.

        // If user is not available yet, wait for the next render.
        if (!user) return;

        // ── Script already loaded (user changed after first load) ──────────────
        if (scriptLoaded.current) {
            applyAttributes();
            return;
        }

        // ── First load: set visitor.name THEN inject the script ────────────────
        const visitorName = user.shop_name
            ? `${user.shop_name} (${user.name || 'Seller'})`
            : (user.name || 'Seller');

        // @ts-ignore
        window.Tawk_API = window.Tawk_API || {};
        // @ts-ignore
        window.Tawk_LoadStart = new Date();

        // Set visitor BEFORE the script loads only if we have a secure hash.
        // Setting visitor object without a hash when Secure Mode is enabled in the tawk.to dashboard
        // causes a 400 Bad Request on /v1/session/start, blocking the widget from loading.
        if (user.tawkHash && user.email) {
            // @ts-ignore
            window.Tawk_API.visitor = {
                name: visitorName,
                email: user.email,
                hash: user.tawkHash,
            };
        }

        // Hook onLoad to also push custom sidebar attributes once session is established
        // @ts-ignore
        window.Tawk_API.onLoad = function () {
            applyAttributes();
        };

        // Inject the Tawk.to script
        const s1 = document.createElement('script');
        const s0 = document.getElementsByTagName('script')[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/68022bc67bc83f19076d0c8d/1ip47m0r4';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        if (s0 && s0.parentNode) {
            s0.parentNode.insertBefore(s1, s0);
        } else {
            document.head.appendChild(s1);
        }
        scriptLoaded.current = true;

        function applyAttributes() {
            if (!user) return;

            const name = user.shop_name
                ? `${user.shop_name} (${user.name || 'Seller'})`
                : (user.name || 'Seller');

            const logoUrl = user.shop_logo ? getFullImageUrl(user.shop_logo) : '';

            const attrs: any = {
                name,
                store_email: user.email || '',
            };
            if (logoUrl && logoUrl.startsWith('http')) {
                attrs.shop_logo = logoUrl;
            }

            // @ts-ignore
            if (typeof window.Tawk_API?.setAttributes === 'function') {
                // @ts-ignore
                window.Tawk_API.setAttributes(attrs, (err: unknown) => {
                    if (err) console.warn('[TawkChat] setAttributes error:', err);
                });
            }
        }
    }, [user]);

    return null;
}
