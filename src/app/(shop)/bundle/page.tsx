'use client';

import { useState } from 'react';
import Link from 'next/link';

const BUNDLES = [
    {
        id: 'bundle-1',
        name: 'Combo Cơ Bản',
        desc: 'Gọng + Tròng cận thường',
        items: [
            { name: 'Gọng kính (tuỳ chọn)', price: 2990000 },
            { name: 'Tròng cận thường', price: 490000 },
        ],
        bundlePrice: 2990000,
        savings: 490000,
        badge: 'Tiết kiệm nhất',
    },
    {
        id: 'bundle-2',
        name: 'Combo Chống Sáng Xanh',
        desc: 'Gọng + Tròng chống ánh sáng xanh',
        items: [
            { name: 'Gọng kính (tuỳ chọn)', price: 2990000 },
            { name: 'Tròng chống ánh sáng xanh', price: 890000 },
        ],
        bundlePrice: 3480000,
        savings: 400000,
        badge: 'Phổ biến',
    },
    {
        id: 'bundle-3',
        name: 'Combo Premium',
        desc: 'Gọng + Tròng đổi màu + Hộp cao cấp',
        items: [
            { name: 'Gọng kính (tuỳ chọn)', price: 2990000 },
            { name: 'Tròng đổi màu Transitions', price: 1290000 },
            { name: 'Hộp kính + Khăn lau cao cấp', price: 190000 },
        ],
        bundlePrice: 3790000,
        savings: 680000,
        badge: 'Cao cấp',
    },
];

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function BundlePage() {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                🎁 Mua Combo — Giảm Thêm
            </h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                Chọn combo, tiết kiệm hơn mua lẻ. Gọng tuỳ chọn theo ý bạn.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {BUNDLES.map((bundle) => (
                    <div
                        key={bundle.id}
                        className={selected === bundle.id ? 'glass-card' : 'card'}
                        style={{
                            padding: 'var(--space-5)', cursor: 'pointer',
                            border: selected === bundle.id ? '2px solid var(--gold-400)' : undefined,
                            transition: 'all 200ms',
                        }}
                        onClick={() => setSelected(bundle.id)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-3)' }}>
                            <div>
                                <span className="badge badge-gold" style={{ fontSize: 10, marginBottom: 'var(--space-2)', display: 'inline-block' }}>{bundle.badge}</span>
                                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{bundle.name}</h3>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{bundle.desc}</p>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--gold-400)' }}>{formatVND(bundle.bundlePrice)}</p>
                                <p style={{ fontSize: 'var(--text-xs)', color: '#22c55e', fontWeight: 600 }}>Tiết kiệm {formatVND(bundle.savings)}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                            {bundle.items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                    <span>✓ {item.name}</span>
                                    <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatVND(item.price)}</span>
                                </div>
                            ))}
                        </div>
                        {selected === bundle.id && (
                            <Link
                                href="/search?bundle=true"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginTop: 'var(--space-4)', minHeight: 48, fontSize: 'var(--text-base)', fontWeight: 700 }}
                            >
                                Chọn gọng cho combo này →
                            </Link>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
