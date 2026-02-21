'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const NAMES = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Minh C', 'Phạm Thu D', 'Hoàng Anh E', 'Đỗ Hương F'];
const PRODUCTS = ['Aviator Classic', 'Cat-Eye Acetate', 'Round Titanium', 'Square TR90', 'Browline Mixed', 'Geometric Rose'];
const CITIES = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế'];

export default function SocialProof() {
    const [visible, setVisible] = useState(false);
    const [notification, setNotification] = useState({ name: '', product: '', city: '', time: '' });
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showNotification = useCallback(() => {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const minutes = Math.floor(Math.random() * 30) + 1;
        setNotification({ name, product, city, time: `${minutes} phút trước` });
        setVisible(true);
        // Clear any existing hide timer
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setVisible(false), 4000);
    }, []);

    useEffect(() => {
        // First show after 8 seconds
        const initial = setTimeout(showNotification, 8000);
        // Then every 25-40 seconds
        const delay = 25000 + Math.random() * 15000;
        const interval = setInterval(() => {
            if (Math.random() > 0.3) showNotification(); // 70% chance
        }, delay);
        return () => {
            clearTimeout(initial);
            clearInterval(interval);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, [showNotification]);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 80,
                left: 16,
                zIndex: 40,
                maxWidth: 280,
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                transform: visible ? 'translateY(0)' : 'translateY(120%)',
                opacity: visible ? 1 : 0,
                transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                pointerEvents: visible ? 'auto' : 'none',
            }}
        >
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <span style={{ fontSize: 24 }}>🛒</span>
                <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, lineHeight: 1.4 }}>
                        {notification.name} ({notification.city})
                    </p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        vừa mua <strong style={{ color: 'var(--gold-400)' }}>{notification.product}</strong>
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        {notification.time}
                    </p>
                </div>
            </div>
        </div>
    );
}
