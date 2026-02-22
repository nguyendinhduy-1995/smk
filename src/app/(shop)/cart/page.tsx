'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/stores/cartStore';
import allProducts from '@/data/products.json';

type CatalogProduct = {
    slug: string;
    name: string;
    brand: string | null;
    price: number;
    compareAt: number | null;
    image: string | null;
    images: string[];
};

function getSalesCount(slug: string): number {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) hash = ((hash << 5) - hash) + slug.charCodeAt(i) | 0;
    return 500 + (Math.abs(hash) % 2500);
}

function getStarRating(slug: string): number {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) hash = ((hash << 3) - hash) + slug.charCodeAt(i) | 0;
    const ratings = [4.3, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
    return ratings[Math.abs(hash) % ratings.length];
}

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const FREESHIP_THRESHOLD = 500000;

export default function CartPage() {
    const { items, removeItem, updateQty, couponCode, setCoupon, subtotal, clearCart } = useCartStore();
    const sub = subtotal();
    const shipping = sub >= FREESHIP_THRESHOLD ? 0 : 30000;
    const total = sub + shipping;
    const freeshipProgress = Math.min(100, (sub / FREESHIP_THRESHOLD) * 100);
    const [savedItems, setSavedItems] = useState<{ variantId: string; productName: string; price: number; productSlug: string }[]>([]);

    // Pick 6 random products with images from catalog
    const suggested = useMemo(() => {
        const withImages = (allProducts as CatalogProduct[]).filter(p => p.image);
        const shuffled = [...withImages].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 6);
    }, []);

    if (items.length === 0) {
        return (
            <div className="container animate-in">
                <div className="empty-state" style={{ paddingTop: 'var(--space-16)' }}>
                    <div className="empty-state__icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" x2="21" y1="6" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                    </div>
                    <h3 className="empty-state__title">Giỏ hàng trống</h3>
                    <p className="empty-state__desc">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
                    <Link href="/search" className="btn btn-primary" style={{ marginTop: 'var(--space-4)', minHeight: 44 }}>
                        Khám phá ngay →
                    </Link>
                </div>
                {/* Suggested — real products from DB */}
                {suggested.length > 0 && (
                    <div style={{ marginTop: 'var(--space-10)' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            ⭐ Có thể bạn sẽ thích
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
                            {suggested.map((p) => {
                                const discount = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
                                const sales = getSalesCount(p.slug);
                                const stars = getStarRating(p.slug);
                                return (
                                    <div key={p.slug} className="product-card">
                                        <Link href={`/p/${p.slug}`} style={{ textDecoration: 'none' }}>
                                            <div className="product-card__image">
                                                {p.image ? (
                                                    <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}>👓</div>
                                                )}
                                                <span className="product-card__wishlist">♡</span>
                                                {discount > 0 && (
                                                    <div className="product-card__badges">
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: '#fff', fontSize: 11, fontWeight: 800, boxShadow: '0 2px 6px rgba(220,38,38,0.25)' }}>
                                                            ↓{discount}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="product-card__body" style={{ paddingBottom: 0 }}>
                                                <div className="product-card__name">{p.name}</div>
                                                <div style={{ marginTop: 2 }}>
                                                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--gold-400)', display: 'block', lineHeight: 1.2 }}>
                                                        {formatVND(p.price)}
                                                    </span>
                                                    {p.compareAt && (
                                                        <span style={{ fontSize: 11, color: 'var(--error)', textDecoration: 'line-through', opacity: 0.7 }}>
                                                            {formatVND(p.compareAt)}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Stars + Sales */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                                    <span style={{ color: '#f59e0b', fontSize: 11 }}>{'★'.repeat(Math.floor(stars))}{stars % 1 >= 0.5 ? '★' : ''}</span>
                                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stars}</span>
                                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>·</span>
                                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Đã bán {sales >= 1000 ? `${(sales / 1000).toFixed(1)}k` : sales}</span>
                                                </div>
                                                {/* Freeship or Exchange badge */}
                                                <div style={{ marginTop: 4, marginBottom: 6 }}>
                                                    {p.price >= 500000 ? (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: '#16a34a', background: 'rgba(22,163,74,0.08)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(22,163,74,0.15)' }}>
                                                            🚚 Freeship
                                                        </span>
                                                    ) : (
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, color: 'var(--info)', background: 'var(--info-bg)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(96,165,250,0.15)' }}>
                                                            🔄 Đổi trả 14 ngày
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                        <div style={{ padding: '0 var(--space-3) var(--space-3)' }}>
                                            <Link
                                                href={`/p/${p.slug}?buy=1`}
                                                className="btn btn-primary btn-sm"
                                                style={{ width: '100%', minHeight: 34, fontSize: 'var(--text-xs)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                Mua ngay ⚡
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>
                    Giỏ hàng ({items.length})
                </h1>
                {items.length > 1 && (
                    <button className="btn btn-sm" onClick={() => {
                        if (confirm('Bạn có chắc muốn xoá toàn bộ giỏ hàng?')) clearCart();
                    }} style={{ color: '#ef4444', fontSize: 11 }}>
                        🗑️ Xoá tất cả
                    </button>
                )}
            </div>

            {/* Freeship progress */}
            <div className="sf-freeship" style={{ marginBottom: 'var(--space-4)' }}>
                {sub >= FREESHIP_THRESHOLD ? (
                    <span>🎉 Bạn đã được <strong style={{ color: '#22c55e' }}>miễn phí vận chuyển!</strong></span>
                ) : (
                    <span>Mua thêm <strong style={{ color: 'var(--gold-400)' }}>{formatVND(FREESHIP_THRESHOLD - sub)}</strong> để được freeship 🚚</span>
                )}
                <div className="sf-freeship__bar">
                    <div className="sf-freeship__fill" style={{ width: `${freeshipProgress}%` }} />
                </div>
            </div>

            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {items.map((item) => (
                    <div key={item.variantId} className="card" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                        <Link href={`/p/${item.productSlug}`} style={{ flexShrink: 0 }}>
                            <div style={{ width: 72, height: 72, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                                👓
                            </div>
                        </Link>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Link href={`/p/${item.productSlug}`} style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.productName}
                            </Link>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                {item.frameColor}{item.lensColor ? ` / ${item.lensColor}` : ''}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-2)', gap: 'var(--space-2)' }}>
                                {/* 44px Quantity stepper */}
                                <div className="sf-qty">
                                    <button className="sf-qty__btn" onClick={() => updateQty(item.variantId, item.qty - 1)}>−</button>
                                    <span className="sf-qty__val">{item.qty}</span>
                                    <button className="sf-qty__btn" onClick={() => updateQty(item.variantId, item.qty + 1)}>+</button>
                                </div>
                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)', whiteSpace: 'nowrap' }}>
                                    {formatVND(item.price * item.qty)}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSavedItems(prev => [...prev, { variantId: item.variantId, productName: item.productName, price: item.price, productSlug: item.productSlug }]);
                                removeItem(item.variantId);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 'var(--space-2)', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                            title="Để dành"
                        >
                            💾
                        </button>
                        <button
                            onClick={() => removeItem(item.variantId)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 'var(--space-2)', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            aria-label="Xóa"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                        </button>
                    </div>
                ))}
            </div>

            {/* C10: Saved for Later */}
            {savedItems.length > 0 && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>💾 Để dành ({savedItems.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {savedItems.map(s => (
                            <div key={s.variantId} className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, opacity: 0.7 }}>
                                <span style={{ fontSize: 20 }}>👓</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.productName}</p>
                                    <p style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 700 }}>{formatVND(s.price)}</p>
                                </div>
                                <button className="btn btn-sm btn-primary" style={{ fontSize: 10 }} onClick={() => {
                                    setSavedItems(prev => prev.filter(x => x.variantId !== s.variantId));
                                }}>🛒 Chọn lại</button>
                                <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }} onClick={() => setSavedItems(prev => prev.filter(x => x.variantId !== s.variantId))}>✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Coupon */}
            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'block' }}>🎫 Mã giảm giá / mã đại lý</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <input
                        className="input"
                        placeholder="Nhập mã..."
                        value={couponCode || ''}
                        onChange={(e) => setCoupon(e.target.value || null)}
                        style={{ fontSize: 16, flex: 1, minHeight: 44 }}
                    />
                    <button className="btn btn-secondary" style={{ minHeight: 44, minWidth: 80 }}>Áp dụng</button>
                </div>
            </div>

            {/* Order Summary */}
            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>📋 Tóm tắt</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-tertiary)' }}>Tạm tính ({items.length} sản phẩm)</span>
                        <span>{formatVND(sub)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-tertiary)' }}>Phí vận chuyển</span>
                        <span style={{ color: shipping === 0 ? '#22c55e' : 'inherit', fontWeight: shipping === 0 ? 700 : 400 }}>
                            {shipping === 0 ? 'Miễn phí ✨' : formatVND(shipping)}
                        </span>
                    </div>
                </div>
                <div className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700 }}>Tổng cộng</span>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--gold-400)' }}>
                        {formatVND(total)}
                    </span>
                </div>
            </div>

            {/* Sticky Checkout Bar */}
            <div className="sticky-cta-bar visible">
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{items.length} sản phẩm</p>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--gold-400)' }}>
                        {formatVND(total)}
                    </p>
                </div>
                <Link href="/checkout" className="btn btn-primary" style={{ flex: 1, maxWidth: 220, textAlign: 'center', minHeight: 44, fontWeight: 700, fontSize: 'var(--text-base)' }}>
                    Thanh toán →
                </Link>
            </div>
        </div>
    );
}
