'use client';

import { useState } from 'react';
import Link from 'next/link';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface WishlistProduct {
    id: string;
    slug: string;
    name: string;
    brand: string;
    price: number;
    compareAtPrice: number | null;
    frameShape: string;
}

const DEMO_WISHLIST: WishlistProduct[] = [
    { id: '1', slug: 'aviator-classic-gold', name: 'Aviator Classic Gold', brand: 'Ray-Ban', price: 2990000, compareAtPrice: 3590000, frameShape: 'Aviator' },
    { id: '2', slug: 'cat-eye-acetate-tortoise', name: 'Cat-Eye Acetate Tortoise', brand: 'Tom Ford', price: 4590000, compareAtPrice: null, frameShape: 'Cat-Eye' },
    { id: '3', slug: 'round-titanium-silver', name: 'Round Titanium Silver', brand: 'Lindberg', price: 8990000, compareAtPrice: 9990000, frameShape: 'Round' },
    { id: '4', slug: 'geometric-titanium-rose', name: 'Geometric Titanium Rose', brand: 'Miu Miu', price: 7290000, compareAtPrice: 7990000, frameShape: 'Geometric' },
];

export default function WishlistPage() {
    const [items, setItems] = useState(DEMO_WISHLIST);

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>❤️ Yêu thích</h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                        {items.length} sản phẩm
                    </p>
                </div>
            </div>

            {items.length === 0 ? (
                <>
                    <div className="empty-state" style={{ minHeight: 250 }}>
                        <div className="empty-state__icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        </div>
                        <h2 className="empty-state__title">Chưa có sản phẩm yêu thích</h2>
                        <p className="empty-state__desc">Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi</p>
                        <Link href="/search" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                            Khám phá sản phẩm
                        </Link>
                    </div>
                    {/* Suggested */}
                    <div style={{ marginTop: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            ✨ Gợi ý dành cho bạn
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                            {[
                                { slug: 'aviator-classic-gold', name: 'Aviator Classic Gold', brand: 'Ray-Ban', price: '2.990.000₫' },
                                { slug: 'cat-eye-acetate-tortoise', name: 'Cat-Eye Tortoise', brand: 'Tom Ford', price: '4.590.000₫' },
                                { slug: 'geometric-titanium-rose', name: 'Geometric Rose', brand: 'Miu Miu', price: '7.290.000₫' },
                            ].map((p) => (
                                <Link key={p.slug} href={`/p/${p.slug}`} className="card" style={{ padding: 'var(--space-4)', textDecoration: 'none', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><circle cx="6" cy="12" r="4" /><circle cx="18" cy="12" r="4" /><path d="M10 12h4" /></svg>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)', fontWeight: 600 }}>{p.brand}</p>
                                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</p>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)' }}>{p.price}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="product-grid">
                    {items.map((item) => (
                        <div key={item.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                            {/* Remove button  */}
                            <button
                                onClick={() => removeItem(item.id)}
                                style={{
                                    position: 'absolute',
                                    top: 'var(--space-2)',
                                    right: 'var(--space-2)',
                                    zIndex: 2,
                                    width: 32,
                                    height: 32,
                                    borderRadius: 'var(--radius-full)',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: 'none',
                                    color: 'var(--error)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 14,
                                }}
                                title="Xóa khỏi yêu thích"
                            >
                                ✕
                            </button>

                            {/* Image */}
                            <Link href={`/p/${item.slug}`} style={{ textDecoration: 'none' }}>
                                <div
                                    style={{
                                        aspectRatio: '1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-hover))',
                                        fontSize: 48,
                                    }}
                                >
                                    👓
                                </div>
                            </Link>

                            {/* Info */}
                            <div style={{ padding: 'var(--space-3)' }}>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)', fontWeight: 600 }}>{item.brand}</p>
                                <Link href={`/p/${item.slug}`} style={{ textDecoration: 'none' }}>
                                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                                        {item.name}
                                    </p>
                                </Link>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        fontSize: 10,
                                        padding: '2px 8px',
                                        background: 'var(--bg-tertiary)',
                                        borderRadius: 'var(--radius-sm)',
                                        color: 'var(--text-muted)',
                                        marginBottom: 'var(--space-2)',
                                    }}
                                >
                                    {item.frameShape}
                                </span>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)' }}>
                                        {formatVND(item.price)}
                                    </span>
                                    {item.compareAtPrice && (
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                            {formatVND(item.compareAtPrice)}
                                        </span>
                                    )}
                                </div>

                                <button
                                    className="btn btn-primary btn-sm"
                                    style={{ width: '100%', marginTop: 'var(--space-3)' }}
                                >
                                    🛒 Thêm vào giỏ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
