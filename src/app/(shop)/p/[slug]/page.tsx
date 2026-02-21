'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import ProductReviews from '@/components/ProductReviews';

// Demo PDP data
const PRODUCT = {
    id: 'demo-1',
    name: 'Aviator Classic Gold',
    slug: 'aviator-classic-gold',
    brand: 'Ray-Ban',
    description: 'Gọng kính Aviator huyền thoại với thiết kế kim loại vàng sang trọng. Phù hợp cho mọi khuôn mặt, đặc biệt là mặt vuông và mặt dài.',
    frameShape: 'AVIATOR',
    material: 'METAL',
    faceShape: ['Mặt vuông', 'Mặt dài', 'Oval'],
    style: ['Sang trọng', 'Basic', 'Công sở'],
    lensWidth: 55,
    bridge: 14,
    templeLength: 135,
    metaTitle: 'Ray-Ban Aviator Classic Gold | Siêu Thị Mắt Kính',
    variants: [
        { id: 'v1', sku: 'RB-AVI-GOLD-55', frameColor: 'Vàng', lensColor: 'Xanh lá', price: 2990000, compareAtPrice: 3590000, stockQty: 15 },
        { id: 'v2', sku: 'RB-AVI-SILVER-55', frameColor: 'Bạc', lensColor: 'Xám', price: 2990000, compareAtPrice: 3590000, stockQty: 8 },
        { id: 'v3', sku: 'RB-AVI-BLACK-55', frameColor: 'Đen', lensColor: 'Xanh dương', price: 3190000, compareAtPrice: null, stockQty: 3 },
    ],
    reviews: { avg: 4.7, count: 128 },
    qa: [
        { q: 'Có bảo hành không?', a: 'Sản phẩm được bảo hành chính hãng 1 năm.' },
        { q: 'Có đo mắt lắp tròng cận không?', a: 'Có, shop hỗ trợ lắp tròng cận theo đơn thuốc.' },
    ],
};

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function ProductDetailPage() {
    const [selectedVariant, setSelectedVariant] = useState(PRODUCT.variants[0]);
    const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'qa'>('desc');
    const [showStickyCTA, setShowStickyCTA] = useState(false);
    const addItem = useCartStore((s) => s.addItem);
    const addToast = useUIStore((s) => s.addToast);

    // #2 — Show sticky CTA when scrolled past main CTA buttons
    useEffect(() => {
        const handleScroll = () => {
            setShowStickyCTA(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAddToCart = () => {
        addItem({
            variantId: selectedVariant.id,
            productId: PRODUCT.id,
            productName: PRODUCT.name,
            productSlug: PRODUCT.slug,
            sku: selectedVariant.sku,
            frameColor: selectedVariant.frameColor,
            lensColor: selectedVariant.lensColor,
            price: selectedVariant.price,
            compareAtPrice: selectedVariant.compareAtPrice ?? undefined,
        });
        addToast({ type: 'success', message: `Đã thêm ${PRODUCT.name} vào giỏ hàng!` });
    };

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)' }}>
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                <Link href="/" style={{ color: 'var(--text-muted)' }}>Trang chủ</Link>
                <span>/</span>
                <Link href="/c/gong-kinh" style={{ color: 'var(--text-muted)' }}>Gọng kính</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-secondary)' }}>{PRODUCT.name}</span>
            </nav>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-8)' }}>
                {/* Gallery */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-2)' }}>
                    {/* Main Image */}
                    <div
                        className="glass-card"
                        style={{
                            aspectRatio: '4/3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 80,
                            borderRadius: 'var(--radius-2xl)',
                            background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-hover))',
                            position: 'relative',
                        }}
                    >
                        👓
                        <button
                            className="btn btn-secondary btn-sm"
                            style={{ position: 'absolute', bottom: 'var(--space-3)', right: 'var(--space-3)' }}
                        >
                            Thử kính ảo ✨
                        </button>
                    </div>
                    {/* Thumbnails */}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                style={{
                                    width: 72,
                                    height: 72,
                                    flexShrink: 0,
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: i === 1 ? '2px solid var(--gold-400)' : '1px solid var(--border-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 24,
                                    cursor: 'pointer',
                                }}
                            >
                                {i === 4 ? '🎬' : '👓'}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
                            {PRODUCT.brand}
                        </p>
                        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                            {PRODUCT.name}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className={`star ${s <= Math.round(PRODUCT.reviews.avg) ? 'star--filled' : ''}`}>★</span>
                                ))}
                            </div>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                {PRODUCT.reviews.avg} ({PRODUCT.reviews.count} đánh giá)
                            </span>
                        </div>
                    </div>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--gold-400)' }}>
                            {formatVND(selectedVariant.price)}
                        </span>
                        {selectedVariant.compareAtPrice && (
                            <>
                                <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                    {formatVND(selectedVariant.compareAtPrice)}
                                </span>
                                <span className="badge badge-error">
                                    -{Math.round((1 - selectedVariant.price / selectedVariant.compareAtPrice) * 100)}%
                                </span>
                            </>
                        )}
                    </div>

                    {/* Variants */}
                    <div>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Màu gọng</p>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            {PRODUCT.variants.map((v) => (
                                <button
                                    key={v.id}
                                    className={`filter-chip ${selectedVariant.id === v.id ? 'filter-chip--active' : ''}`}
                                    onClick={() => setSelectedVariant(v)}
                                >
                                    {v.frameColor}
                                    {v.lensColor && ` / ${v.lensColor}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stock */}
                    <p style={{ fontSize: 'var(--text-xs)', color: selectedVariant.stockQty <= 5 ? 'var(--warning)' : 'var(--success)' }}>
                        {selectedVariant.stockQty <= 5
                            ? `⚡ Chỉ còn ${selectedVariant.stockQty} sản phẩm`
                            : '✓ Còn hàng'}
                    </p>

                    {/* Size Guide */}
                    <div className="card" style={{ padding: 'var(--space-4)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                            📏 Thông số kỹ thuật
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Lens Width</span>
                                <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{PRODUCT.lensWidth}mm</p>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Bridge</span>
                                <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{PRODUCT.bridge}mm</p>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)' }}>Temple</span>
                                <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{PRODUCT.templeLength}mm</p>
                            </div>
                        </div>
                        <div style={{ marginTop: 'var(--space-3)' }}>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                ✨ <strong>AI gợi ý:</strong> Phù hợp với {PRODUCT.faceShape.join(', ')}
                            </p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                        <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart}>
                            Thêm vào giỏ
                        </button>
                        <Link href="/checkout" className="btn btn-secondary btn-lg" style={{ flex: 1, textAlign: 'center' }}>
                            Mua ngay
                        </Link>
                    </div>

                    {/* Upsell */}
                    <div className="card" style={{ padding: 'var(--space-4)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                            🔥 Combo giảm thêm
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {[
                                { name: 'Tròng chống ánh sáng xanh', price: 490000 },
                                { name: 'Tròng đổi màu Transitions', price: 890000 },
                                { name: 'Hộp kính + Khăn lau cao cấp', price: 190000 },
                            ].map((upsell) => (
                                <label
                                    key={upsell.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        padding: 'var(--space-2)',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <input type="checkbox" />
                                    <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{upsell.name}</span>
                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gold-400)' }}>
                                        +{formatVND(upsell.price)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Policies */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                        {[
                            { icon: '🔄', text: 'Đổi trả 14 ngày' },
                            { icon: '🛡️', text: 'Bảo hành 1 năm' },
                            { icon: '🚚', text: 'Freeship từ 500K' },
                            { icon: '👁️', text: 'Đo mắt miễn phí' },
                        ].map((p) => (
                            <div
                                key={p.text}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--text-tertiary)',
                                    padding: 'var(--space-2) var(--space-3)',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <span>{p.icon}</span>
                                <span>{p.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs: Description / Reviews / Q&A */}
            <section style={{ marginTop: 'var(--space-12)' }}>
                <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                    <button className={`tab ${activeTab === 'desc' ? 'tab--active' : ''}`} onClick={() => setActiveTab('desc')}>
                        Mô tả
                    </button>
                    <button className={`tab ${activeTab === 'reviews' ? 'tab--active' : ''}`} onClick={() => setActiveTab('reviews')}>
                        Đánh giá ({PRODUCT.reviews.count})
                    </button>
                    <button className={`tab ${activeTab === 'qa' ? 'tab--active' : ''}`} onClick={() => setActiveTab('qa')}>
                        Hỏi đáp ({PRODUCT.qa.length})
                    </button>
                </div>

                {activeTab === 'desc' && (
                    <div className="animate-in" style={{ maxWidth: 720 }}>
                        <p style={{ lineHeight: 1.8 }}>{PRODUCT.description}</p>
                        <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                            <span className="badge badge-neutral">Kiểu: {PRODUCT.frameShape}</span>
                            <span className="badge badge-neutral">Chất liệu: {PRODUCT.material}</span>
                            {PRODUCT.style.map((s) => (
                                <span key={s} className="badge badge-neutral">{s}</span>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <ProductReviews productId={PRODUCT.id} />
                )}

                {activeTab === 'qa' && (
                    <div className="animate-in" style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {PRODUCT.qa.map((item, i) => (
                            <div key={i} className="card" style={{ padding: 'var(--space-4)' }}>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                                    ❓ {item.q}
                                </p>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                    ✅ {item.a}
                                </p>
                            </div>
                        ))}
                        <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
                            Đặt câu hỏi
                        </button>
                    </div>
                )}
            </section>

            {/* #2 — Sticky CTA for mobile */}
            <div className={`sticky-cta-bar ${showStickyCTA ? 'visible' : ''}`}>
                <div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{PRODUCT.brand}</p>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--gold-400)' }}>
                        {formatVND(selectedVariant.price)}
                    </p>
                </div>
                <button className="btn btn-primary" style={{ flex: 1, maxWidth: 200 }} onClick={handleAddToCart}>
                    Thêm vào giỏ
                </button>
            </div>
        </div>
    );
}
