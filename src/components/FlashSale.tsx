'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface FlashSaleProps {
    endTime?: Date;
    discount?: number;
    label?: string;
}

// Stable reference — created once per module load
const DEFAULT_END_TIME = new Date(Date.now() + 4 * 60 * 60 * 1000);

function calcTimeLeft(end: Date) {
    const diff = end.getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
    };
}

export default function FlashSaleBanner({
    endTime: endTimeProp,
    discount = 15,
    label = 'Flash Sale',
}: FlashSaleProps) {
    const endTimeRef = useRef(endTimeProp || DEFAULT_END_TIME);

    const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(endTimeRef.current));
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const tl = calcTimeLeft(endTimeRef.current);
            setTimeLeft((prev) => {
                // Only update if values actually changed (prevent needless re-renders)
                if (prev.hours === tl.hours && prev.minutes === tl.minutes && prev.seconds === tl.seconds && prev.expired === tl.expired) {
                    return prev;
                }
                return tl;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Use display:none instead of returning null to prevent unmount/remount cycles
    const hidden = dismissed || timeLeft.expired;

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        <div style={{
            background: 'linear-gradient(90deg, #dc2626, #ea580c)',
            color: '#fff',
            padding: 'var(--space-2) var(--space-4)',
            display: hidden ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            position: 'relative',
        }}>
            <span>⚡ {label}</span>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.05em' }}>
                {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
            </span>
            <Link href="/search?sale=true" style={{ color: '#fff', textDecoration: 'underline', fontSize: 'var(--text-xs)' }}>
                Giảm {discount}% →
            </Link>
            <button
                onClick={() => setDismissed(true)}
                aria-label="Đóng"
                style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer', fontSize: 14, padding: 4, minWidth: 32, minHeight: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >✕</button>
        </div>
    );
}
