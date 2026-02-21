'use client';

import { useState, useEffect } from 'react';

export default function FloatingZalo() {
    const [show, setShow] = useState(false);
    const [pulse, setPulse] = useState(true);
    const [hover, setHover] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 2000);
        const pulseTimer = setTimeout(() => setPulse(false), 12000);
        return () => { clearTimeout(timer); clearTimeout(pulseTimer); };
    }, []);

    if (!show) return null;

    return (
        <a
            href="https://zalo.me/sieuthimatkinh"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat Zalo tư vấn"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: 'fixed',
                bottom: 88,
                right: 16,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
            }}
        >
            {/* Tooltip - slides in on hover */}
            <span style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 16px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                boxShadow: 'var(--shadow-md)',
                opacity: hover ? 1 : 0,
                transform: hover ? 'translateX(0)' : 'translateX(10px)',
                transition: 'opacity 0.25s, transform 0.25s',
                pointerEvents: 'none',
            }}>
                💬 Chat tư vấn
            </span>

            {/* Button */}
            <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0068ff, #0050cc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: hover
                    ? '0 6px 24px rgba(0,104,255,0.5), 0 0 0 4px rgba(0,104,255,0.15)'
                    : '0 4px 16px rgba(0,104,255,0.35)',
                animation: pulse ? 'zalo-pulse 2s ease-in-out infinite' : undefined,
                transition: 'box-shadow 0.3s, transform 0.2s',
                transform: hover ? 'scale(1.08)' : 'scale(1)',
                flexShrink: 0,
            }}>
                <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
                    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm8.5 28.5h-5l-3-4.5-3 4.5h-5l5.5-8-5.5-8h5l3 4.5 3-4.5h5l-5.5 8 5.5 8z" fill="white" />
                </svg>
            </div>
        </a>
    );
}
