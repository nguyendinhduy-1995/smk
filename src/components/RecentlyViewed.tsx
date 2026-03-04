'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';


const STORAGE_KEY = 'smk_recently_viewed';
const MAX_ITEMS = 6;

type Product = { slug: string; name: string; price: number; compareAt?: number | null; image?: string | null; images?: string[] };

interface ViewedItem {
    slug: string;
    name: string;
    brand: string;
    price: number;
    viewedAt: number;
}

export function trackView(item: Omit<ViewedItem, 'viewedAt'>) {
    if (typeof window === 'undefined') return;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const items: ViewedItem[] = raw ? JSON.parse(raw) : [];
        const filtered = items.filter((i) => i.slug !== item.slug);
        filtered.unshift({ ...item, viewedAt: Date.now() });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
    } catch { /* silently fail */ }
}

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function RecentlyViewed() {
    const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());
    useEffect(() => {
        fetch('/api/products?limit=999')
            .then(r => r.json())
            .then(data => {
                const m = new Map<string, Product>();
                (data.products || []).forEach((p: any) => {
                    m.set(p.slug, {
                        slug: p.slug,
                        name: p.name,
                        price: p.variants?.[0]?.price || 0,
                        compareAt: p.variants?.[0]?.compareAtPrice || null,
                        image: p.media?.[0]?.url || null,
                        images: (p.media || []).map((m: any) => m.url),
                    });
                });
                setProductsMap(m);
            })
            .catch(() => {});
    }, []);

    const [items, setItems] = useState<ViewedItem[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setItems(JSON.parse(raw));
        } catch { /* silently fail */ }
    }, []);

    if (items.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: 64,
            left: 0,
            right: 0,
            zIndex: 30,
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-primary)',
            padding: 'var(--space-2) var(--space-3)',
            display: 'flex',
            gap: 'var(--space-2)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
        }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', paddingRight: 'var(--space-2)' }}>
                Vừa xem
            </span>
            {items.slice(0, 3).map((item) => {
                const product = productsMap.get(item.slug);
                const thumb = product?.image || null;
                return (
                    <Link
                        key={item.slug}
                        href={`/p/${item.slug}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-1) var(--space-2)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-secondary)',
                            textDecoration: 'none',
                            flexShrink: 0,
                            minHeight: 36,
                        }}
                    >
                        {/* Real thumbnail */}
                        <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative', flexShrink: 0, background: 'var(--bg-tertiary)' }}>
                            {thumb ? (
                                <Image src={thumb} alt={item.name} fill sizes="28px" style={{ objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}></span>
                            )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 10, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80, color: 'var(--text-primary)' }}>{item.name}</p>
                            <p style={{ fontSize: 9, color: 'var(--gold-400)', fontWeight: 600 }}>{formatVND(item.price)}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
