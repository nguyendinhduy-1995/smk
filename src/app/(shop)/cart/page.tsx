'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function CartPage() {
    const { items, removeItem, updateQty, couponCode, setCoupon, subtotal, clearCart } = useCartStore();
    const sub = subtotal();
    const shipping = sub >= 500000 ? 0 : 30000;
    const total = sub + shipping;

    if (items.length === 0) {
        return (
            <div className="container animate-in">
                <div className="empty-state" style={{ paddingTop: 'var(--space-16)' }}>
                    <div className="empty-state__icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" x2="21" y1="6" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                    </div>
                    <h3 className="empty-state__title">Giỏ hàng trống</h3>
                    <p className="empty-state__desc">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm.</p>
                    <Link href="/search" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                        Khám phá ngay
                    </Link>
                </div>
                {/* Suggested products */}
                <div style={{ marginTop: 'var(--space-10)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                        ⭐ Có thể bạn sẽ thích
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                        {[
                            { slug: 'aviator-classic-gold', name: 'Aviator Classic Gold', brand: 'Ray-Ban', price: '2.990.000₫' },
                            { slug: 'cat-eye-acetate-tortoise', name: 'Cat-Eye Tortoise', brand: 'Tom Ford', price: '4.590.000₫' },
                            { slug: 'round-titanium-silver', name: 'Round Titanium Silver', brand: 'Lindberg', price: '8.990.000₫' },
                        ].map((p) => (
                            <Link key={p.slug} href={`/p/${p.slug}`} className="card" style={{ padding: 'var(--space-4)', textDecoration: 'none', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><circle cx="6" cy="12" r="4" /><circle cx="18" cy="12" r="4" /><path d="M10 12h4" /></svg>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)', fontWeight: 600 }}>{p.brand}</p>
                                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{p.name}</p>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)' }}>{p.price}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                Giỏ hàng ({items.length})
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
                {/* Cart Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {items.map((item) => (
                        <div
                            key={item.variantId}
                            className="card"
                            style={{
                                padding: 'var(--space-4)',
                                display: 'flex',
                                gap: 'var(--space-4)',
                                alignItems: 'center',
                            }}
                        >
                            <div
                                style={{
                                    width: 80,
                                    height: 80,
                                    flexShrink: 0,
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 32,
                                }}
                            >
                                👓
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Link
                                    href={`/p/${item.productSlug}`}
                                    style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
                                >
                                    {item.productName}
                                </Link>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                    {item.frameColor}{item.lensColor ? ` / ${item.lensColor}` : ''} • {item.sku}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                        <button
                                            onClick={() => updateQty(item.variantId, item.qty - 1)}
                                            style={{ width: 32, height: 32, background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}
                                        >
                                            −
                                        </button>
                                        <span style={{ width: 36, textAlign: 'center', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                                            {item.qty}
                                        </span>
                                        <button
                                            onClick={() => updateQty(item.variantId, item.qty + 1)}
                                            style={{ width: 32, height: 32, background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 16 }}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)' }}>
                                        {formatVND(item.price * item.qty)}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => removeItem(item.variantId)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, padding: 'var(--space-2)' }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="card" style={{ padding: 'var(--space-5)', position: 'sticky', top: 'calc(var(--header-height) + var(--space-4))' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                        Tóm tắt đơn hàng
                    </h3>

                    {/* Coupon */}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        <input
                            className="input"
                            placeholder="Mã giảm giá / mã đại lý"
                            value={couponCode || ''}
                            onChange={(e) => setCoupon(e.target.value || null)}
                            style={{ fontSize: 'var(--text-sm)' }}
                        />
                        <button className="btn btn-secondary btn-sm">Áp dụng</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Tạm tính</span>
                            <span>{formatVND(sub)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-tertiary)' }}>Phí vận chuyển</span>
                            <span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
                                {shipping === 0 ? 'Miễn phí ✨' : formatVND(shipping)}
                            </span>
                        </div>
                        {sub < 500000 && (
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Mua thêm {formatVND(500000 - sub)} để freeship
                            </p>
                        )}
                    </div>

                    <div className="divider" />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 600 }}>Tổng cộng</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gold-400)' }}>
                            {formatVND(total)}
                        </span>
                    </div>

                    <Link
                        href="/checkout"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', marginTop: 'var(--space-4)', textAlign: 'center' }}
                    >
                        Thanh toán
                    </Link>
                </div>
            </div>
        </div>
    );
}
