'use client';

import { useState } from 'react';
import Link from 'next/link';

interface OrderItem { name: string; slug: string; qty: number; price: number; image?: string }

export default function QuickBuyButton({ items }: { items: OrderItem[] }) {
    const [adding, setAdding] = useState(false);
    const [done, setDone] = useState(false);

    const buyAgain = async () => {
        setAdding(true);
        try {
            for (const item of items) {
                await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug: item.slug, qty: item.qty }),
                });
            }
            setDone(true);
            setTimeout(() => setDone(false), 3000);
        } catch { /* ignore */ }
        setAdding(false);
    };

    if (done) {
        return (
            <Link href="/cart" className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'none', textDecoration: 'none', fontSize: 11 }}>
                ✅ Đã thêm — Xem giỏ →
            </Link>
        );
    }

    return (
        <button className="btn btn-sm" onClick={buyAgain} disabled={adding}
            style={{ background: 'rgba(212,168,83,0.12)', color: 'var(--gold-400)', border: 'none', fontSize: 11 }}>
            {adding ? '⏳...' : '🔄 Mua lại'}
        </button>
    );
}
