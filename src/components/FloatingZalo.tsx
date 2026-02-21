'use client';

import { useState, useEffect } from 'react';

export default function FloatingZalo() {
    const [show, setShow] = useState(false);
    const [pulse, setPulse] = useState(true);

    useEffect(() => {
        // Show after 2 seconds
        const timer = setTimeout(() => setShow(true), 2000);
        // Stop pulse after 10 seconds
        const pulseTimer = setTimeout(() => setPulse(false), 10000);
        return () => { clearTimeout(timer); clearTimeout(pulseTimer); };
    }, []);

    if (!show) return null;

    return (
        <a
            href="https://zalo.me/sieuthimatkinh"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Zalo"
            style={{
                position: 'fixed',
                bottom: 80, // above MobileNav
                right: 16,
                zIndex: 50,
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#0068ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,104,255,0.4)',
                animation: pulse ? 'zalo-pulse 2s ease-in-out infinite' : undefined,
                transition: 'transform 200ms',
                textDecoration: 'none',
            }}
        >
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm8.5 28.5h-5l-3-4.5-3 4.5h-5l5.5-8-5.5-8h5l3 4.5 3-4.5h5l-5.5 8 5.5 8z" fill="white" />
            </svg>
        </a>
    );
}
