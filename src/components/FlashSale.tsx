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
    if (diff <= 0) return null;
    return {
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
    };
}

export default function FlashSaleBanner({
    endTime: endTimeProp,
    discount = 15,
    label = 'Flash Sale',
}: FlashSaleProps) {
    // Use ref to keep stable endTime — never triggers re-render
    const endTimeRef = useRef(endTimeProp || DEFAULT_END_TIME);

    const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(endTimeRef.current));
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calcTimeLeft(endTimeRef.current));
        }, 1000);
        return () => clearInterval(interval);
    }, []); // empty deps — endTimeRef is stable

    if (dismissed || !timeLeft) return null;

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        <div style={{
            background: 'linear-gradient(90deg, #dc2626, #ea580c)',
            color: '#fff',
            padding: 'var(--space-2) var(--space-4)',
            display: 'flex',
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
