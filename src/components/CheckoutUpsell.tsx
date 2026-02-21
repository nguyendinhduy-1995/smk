'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface UpsellProduct {
    id: string; slug: string; name: string; price: number;
    compareAt: number | null; image: string | null; reason: string;
}

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function CheckoutUpsell({ cartItems }: { cartItems: { id: string; name: string; category?: string }[] }) {
    const [products, setProducts] = useState<UpsellProduct[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (cartItems.length === 0) return;
        // Fetch recommendations based on cart
        const firstItem = cartItems[0];
        fetch(`/api/ai/recommendations?productId=${firstItem.id}&limit=4`)
            .then(r => r.json())
            .then(data => {
                const recs = (data.similar || []).slice(0, 3).map((p: UpsellProduct) => ({
                    ...p, reason: '🤖 Khách thường mua thêm',
                }));
                // Add accessories suggestion
                recs.push({
                    id: 'acc-cleaning', slug: 'search', name: 'Dung dịch vệ sinh kính', price: 85000,
                    compareAt: 120000, image: null, reason: '🧴 Phụ kiện thiết yếu',
                });
                setProducts(recs);
            }).catch(() => { });
    }, [cartItems]);

    const visible = products.filter(p => !dismissed.has(p.id));
    if (visible.length === 0) return null;

    return (
        <div style={{ marginTop: 'var(--space-5)', padding: 'var(--space-4)', background: 'rgba(212,168,83,0.04)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(212,168,83,0.15)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                🤖 Có thể bạn cần thêm
                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(212,168,83,0.12)', color: 'var(--gold-400)', fontWeight: 500 }}>AI Suggest</span>
            </h3>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                {visible.map(p => {
                    const discount = p.compareAt && p.compareAt > p.price ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0;
                    return (
                        <div key={p.id} style={{
                            minWidth: 140, maxWidth: 160, flexShrink: 0, borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', overflow: 'hidden', position: 'relative',
                        }}>
                            <button onClick={() => setDismissed(prev => new Set(prev).add(p.id))} style={{
                                position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%',
                                background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', fontSize: 10, color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                            }}>✕</button>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: 'var(--bg-tertiary)' }}>
                                {p.image ? <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="160px" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👓</div>}
                                {discount > 0 && <span style={{ position: 'absolute', top: 4, left: 4, padding: '2px 6px', borderRadius: 99, fontSize: 9, fontWeight: 700, background: 'var(--error)', color: '#fff' }}>-{discount}%</span>}
                            </div>
                            <div style={{ padding: 8 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gold-400)' }}>{formatVND(p.price)}</span>
                                    {p.compareAt && p.compareAt > p.price && <span style={{ fontSize: 9, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatVND(p.compareAt)}</span>}
                                </div>
                                <span style={{ display: 'inline-block', marginTop: 4, fontSize: 8, padding: '1px 6px', borderRadius: 99, background: 'rgba(212,168,83,0.1)', color: 'var(--gold-400)' }}>{p.reason}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
