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
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--gold-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: hover
                    ? 'var(--shadow-gold), 0 0 0 4px rgba(196,154,32,0.12)'
                    : 'var(--shadow-md)',
                animation: pulse ? 'zalo-pulse 2s ease-in-out infinite' : undefined,
                transition: 'box-shadow 0.3s, transform 0.2s, border-color 0.2s',
                transform: hover ? 'scale(1.08)' : 'scale(1)',
                flexShrink: 0,
                backdropFilter: 'blur(12px)',
            }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="var(--gold-400)" stroke="none" />
                    <path d="M8 10h.01M12 10h.01M16 10h.01" stroke="var(--bg-primary)" strokeWidth="2.5" />
                </svg>
            </div>
        </a>
    );
}
