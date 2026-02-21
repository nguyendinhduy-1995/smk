'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WishlistItem { slug: string; name: string; price: number; compareAt?: number; image?: string }

export default function WishlistNotifications() {
    const [items, setItems] = useState<(WishlistItem & { notification?: string })[]>([]);

    useEffect(() => {
        // Load wishlist from localStorage
        try {
            const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
            // Simulate checking for price drops / back in stock
            const enhanced = stored.map((item: WishlistItem) => {
                const rand = Math.random();
                if (rand < 0.3) return { ...item, notification: '🔥 Giảm giá!' };
                if (rand < 0.5) return { ...item, notification: '✅ Có hàng trở lại' };
                return item;
            });
            setItems(enhanced);
        } catch { /* ignore */ }
    }, []);

    const notified = items.filter(i => i.notification);
    if (notified.length === 0) return null;

    return (
        <div style={{ padding: 'var(--space-3)', background: 'rgba(212,168,83,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(212,168,83,0.12)', marginBottom: 'var(--space-3)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                💛 Cập nhật Wishlist
                <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 99, background: 'rgba(212,168,83,0.12)', color: 'var(--gold-400)' }}>{notified.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {notified.map(item => (
                    <Link key={item.slug} href={`/p/${item.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit', fontSize: 12 }}>
                        <span style={{ fontSize: 16 }}>👓</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                            <span style={{ fontSize: 10, color: 'var(--gold-400)' }}>{item.notification}</span>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-400)', flexShrink: 0 }}>
                            {new Intl.NumberFormat('vi-VN').format(item.price)}₫
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
