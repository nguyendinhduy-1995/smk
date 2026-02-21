'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import allProducts from '@/data/products.json';

type Product = {
    id: string; slug: string; name: string; price: number;
    image: string | null; category: string;
};

const products = allProducts as Product[];
const productsWithImage = products.filter((p) => p.image);

// Vietnamese-sounding realistic names
const FIRST_NAMES = ['Minh', 'Hương', 'Thảo', 'Tuấn', 'Linh', 'Phúc', 'Ngọc', 'Dũng', 'Mai', 'Khoa', 'Trang', 'Đức'];
const LAST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Phan'];
const CITIES = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế', 'Nha Trang', 'Biên Hòa', 'Bắc Ninh', 'Vũng Tàu', 'Đà Lạt', 'Quy Nhơn'];

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function SocialProof() {
    const [visible, setVisible] = useState(false);
    const [notification, setNotification] = useState<{
        name: string; city: string; product: string;
        slug: string; image: string | null; price: number; time: string;
    } | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showNotification = useCallback(() => {
        if (productsWithImage.length === 0) return;
        const product = pickRandom(productsWithImage);
        const firstName = pickRandom(FIRST_NAMES);
        const lastName = pickRandom(LAST_NAMES);
        const city = pickRandom(CITIES);
        const minutes = Math.floor(Math.random() * 30) + 1;

        setNotification({
            name: `${lastName} ${firstName}`,
            city,
            product: product.name,
            slug: product.slug,
            image: product.image,
            price: product.price,
            time: `${minutes} phút trước`,
        });
        setVisible(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setVisible(false), 4000);
    }, []);

    useEffect(() => {
        const initial = setTimeout(showNotification, 8000);
        const delay = 25000 + Math.random() * 15000;
        const interval = setInterval(() => {
            if (Math.random() > 0.3) showNotification();
        }, delay);
        return () => {
            clearTimeout(initial);
            clearInterval(interval);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, [showNotification]);

    if (!notification) return null;

    return (
        <Link
            href={`/p/${notification.slug}`}
            style={{ textDecoration: 'none' }}
        >
            <div
                style={{
                    position: 'fixed',
                    bottom: 80,
                    left: 16,
                    zIndex: 40,
                    maxWidth: 300,
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    transform: visible ? 'translateY(0)' : 'translateY(120%)',
                    opacity: visible ? 1 : 0,
                    transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    pointerEvents: visible ? 'auto' : 'none',
                    cursor: 'pointer',
                }}
            >
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                    {/* Product thumbnail */}
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', flexShrink: 0, background: 'var(--bg-secondary)' }}>
                        {notification.image ? (
                            <Image src={notification.image} alt={notification.product} fill sizes="40px" style={{ objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>🛒</span>
                        )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                            {notification.name} ({notification.city})
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                            vừa mua <strong style={{ color: 'var(--gold-400)' }}>{notification.product}</strong>
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                            {notification.time} · {formatVND(notification.price)}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
