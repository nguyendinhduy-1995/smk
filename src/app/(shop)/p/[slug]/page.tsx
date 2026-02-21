'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import ProductReviews from '@/components/ProductReviews';
import { trackView } from '@/components/RecentlyViewed';
import ShareButton from '@/components/ShareButton';

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

const GALLERY_ITEMS = [
    { type: 'image', emoji: '👓' },
    { type: 'image', emoji: '🕶️' },
    { type: 'image', emoji: '👓' },
    { type: 'video', emoji: '🎬' },
];

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function ProductDetailPage() {
    const [selectedVariant, setSelectedVariant] = useState(PRODUCT.variants[0]);
    const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'qa'>('desc');
    const [showStickyCTA, setShowStickyCTA] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const addItem = useCartStore((s) => s.addItem);
    const addToast = useUIStore((s) => s.addToast);

    // Show sticky CTA when scrolled past main CTA buttons
    useEffect(() => {
        const handleScroll = () => setShowStickyCTA(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Track product view for RecentlyViewed
    useEffect(() => {
        trackView({ slug: PRODUCT.slug, name: PRODUCT.name, brand: PRODUCT.brand, price: selectedVariant.price });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Gallery scroll tracking
    useEffect(() => {
        const el = galleryRef.current;
        if (!el) return;
        const onScroll = () => {
            const idx = Math.round(el.scrollLeft / el.clientWidth);
            setActiveSlide(idx);
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToSlide = useCallback((idx: number) => {
        galleryRef.current?.scrollTo({ left: idx * (galleryRef.current?.clientWidth || 0), behavior: 'smooth' });
    }, []);

    const handleAddToCart = useCallback(() => {
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
    }, [addItem, addToast, selectedVariant]);

    const handleBuyNow = useCallback(() => {
        handleAddToCart();
        window.location.href = '/checkout';
    }, [handleAddToCart]);

    const toggleAccordion = (key: string) => setOpenAccordion(prev => prev === key ? null : key);

    const discount = selectedVariant.compareAtPrice
        ? Math.round((1 - selectedVariant.price / selectedVariant.compareAtPrice) * 100)
        : 0;

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-2)', paddingBottom: 120 }}>
            {/* Breadcrumb — minimal on mobile */}
            <nav style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <Link href="/" style={{ color: 'var(--text-muted)' }}>Trang chủ</Link>
                <span>/</span>
                <Link href="/c/gong-kinh" style={{ color: 'var(--text-muted)' }}>Gọng kính</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{PRODUCT.name}</span>
            </nav>

            {/* ═══ Swipeable Gallery ═══ */}
            <div ref={galleryRef} className="sf-gallery" style={{ borderRadius: 'var(--radius-2xl)', marginBottom: 0 }}>
                {GALLERY_ITEMS.map((item, i) => (
                    <div key={i} className="sf-gallery__slide" style={{ fontSize: 80, position: 'relative' }}>
                        {item.emoji}
                        {i === 0 && discount > 0 && (
                            <span className="badge badge-error" style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)', fontSize: 12 }}>-{discount}%</span>
                        )}
                        {i === 0 && (
                            <Link href="/try-on" className="btn btn-sm" style={{ position: 'absolute', bottom: 'var(--space-3)', right: 'var(--space-3)', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', backdropFilter: 'blur(8px)' }}>
                                Thử kính online ✨
                            </Link>
                        )}
                    </div>
                ))}
            </div>
            {/* Gallery dots */}
            <div className="sf-gallery__dots">
                {GALLERY_ITEMS.map((_, i) => (
                    <button key={i} className={`sf-gallery__dot ${activeSlide === i ? 'sf-gallery__dot--active' : ''}`} onClick={() => scrollToSlide(i)} />
                ))}
            </div>

            {/* ═══ Product Info — Conversion-optimized order ═══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Brand + Name + Rating */}
                <div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
                        {PRODUCT.brand}
                    </p>
                    <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)', lineHeight: 1.3 }}>
                        {PRODUCT.name}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} style={{ color: s <= Math.round(PRODUCT.reviews.avg) ? '#f59e0b' : 'var(--text-muted)', fontSize: 14 }}>★</span>
                            ))}
                        </div>
                        <a href="#reviews" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                            {PRODUCT.reviews.avg} ({PRODUCT.reviews.count})
                        </a>
                        <ShareButton title={PRODUCT.name} text={`${PRODUCT.brand} ${PRODUCT.name} — ${formatVND(selectedVariant.price)}`} />
                    </div>
                </div>

                {/* Price — prominent */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gold-400)' }}>
                        {formatVND(selectedVariant.price)}
                    </span>
                    {selectedVariant.compareAtPrice && (
                        <>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                {formatVND(selectedVariant.compareAtPrice)}
                            </span>
                            <span className="badge badge-error" style={{ fontSize: 11 }}>-{discount}%</span>
                        </>
                    )}
                </div>

                {/* Price + Trust inline — 1 dòng */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    <span>🚚 Freeship từ 500K</span>
                    <span>🔄 Đổi trả 14 ngày</span>
                    <span>🛡️ BH 1 năm</span>
                </div>

                {/* ═══ CTA Buttons — MUA NGAY primary ═══ */}
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-primary btn-lg" style={{ flex: 2, minHeight: 52, fontSize: 'var(--text-base)', fontWeight: 700 }} onClick={handleBuyNow}>
                        Mua ngay — giao nhanh ⚡
                    </button>
                    <button className="btn btn-secondary btn-lg" style={{ flex: 1, minHeight: 52 }} onClick={handleAddToCart}>
                        🛒 Thêm giỏ
                    </button>
                </div>

                {/* ═══ Vì sao hợp với bạn? ═══ */}
                <div style={{ padding: 'var(--space-4)', background: 'linear-gradient(135deg, rgba(212,168,83,0.06), rgba(96,165,250,0.03))', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(212,168,83,0.15)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>✨ Vì sao hợp với bạn?</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {[
                            `Phù hợp với ${PRODUCT.faceShape.join(', ')}`,
                            `Chất liệu ${PRODUCT.material === 'METAL' ? 'kim loại nhẹ' : 'nhựa cao cấp'} — đeo cả ngày không mỏi`,
                            `Phong cách ${PRODUCT.style.join(', ')} — dễ phối đồ`,
                        ].map((reason, i) => (
                            <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'start', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--gold-400)', flexShrink: 0 }}>✓</span>
                                <span>{reason}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Variant Selector — minimal */}
                <div>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Màu gọng</p>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {PRODUCT.variants.map((v) => (
                            <button
                                key={v.id}
                                className={`sf-chip ${selectedVariant.id === v.id ? 'sf-chip--active' : ''}`}
                                onClick={() => setSelectedVariant(v)}
                            >
                                {v.frameColor}{v.lensColor ? ` / ${v.lensColor}` : ''}
                            </button>
                        ))}
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: selectedVariant.stockQty <= 5 ? '#f59e0b' : '#22c55e', marginTop: 'var(--space-2)' }}>
                        {selectedVariant.stockQty <= 5
                            ? `⚡ Chỉ còn ${selectedVariant.stockQty} sản phẩm`
                            : '✓ Còn hàng'}
                    </p>
                </div>

                {/* Upsell Combo */}
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                        🔥 Combo giảm thêm
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        {[
                            { name: 'Tròng chống ánh sáng xanh', price: 490000 },
                            { name: 'Tròng đổi màu Transitions', price: 890000 },
                            { name: 'Hộp kính + Khăn lau cao cấp', price: 190000 },
                        ].map((upsell) => (
                            <label key={upsell.name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: 'var(--touch-target)' }}>
                                <input type="checkbox" style={{ width: 20, height: 20, accentColor: 'var(--gold-400)' }} />
                                <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{upsell.name}</span>
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gold-400)', whiteSpace: 'nowrap' }}>
                                    +{formatVND(upsell.price)}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Accordion sections */}
                <div>
                    {/* Specs */}
                    <div className="sf-accordion">
                        <button className="sf-accordion__trigger" aria-expanded={openAccordion === 'specs'} onClick={() => toggleAccordion('specs')}>
                            📏 Thông số kỹ thuật
                        </button>
                        <div className={`sf-accordion__body ${openAccordion === 'specs' ? 'open' : ''}`}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Chiều rộng tròng</span>
                                    <p style={{ fontWeight: 600 }}>{PRODUCT.lensWidth}mm</p>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Cầu kính</span>
                                    <p style={{ fontWeight: 600 }}>{PRODUCT.bridge}mm</p>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Càng kính</span>
                                    <p style={{ fontWeight: 600 }}>{PRODUCT.templeLength}mm</p>
                                </div>
                            </div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)' }}>
                                ✨ <strong>Gợi ý cho bạn:</strong> Phù hợp với {PRODUCT.faceShape.join(', ')}
                            </p>
                        </div>
                    </div>
                    {/* Description */}
                    <div className="sf-accordion">
                        <button className="sf-accordion__trigger" aria-expanded={openAccordion === 'desc'} onClick={() => toggleAccordion('desc')}>
                            📋 Mô tả sản phẩm
                        </button>
                        <div className={`sf-accordion__body ${openAccordion === 'desc' ? 'open' : ''}`}>
                            <p style={{ lineHeight: 1.8, fontSize: 'var(--text-sm)' }}>{PRODUCT.description}</p>
                            <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                <span className="badge badge-neutral">Kiểu: {PRODUCT.frameShape}</span>
                                <span className="badge badge-neutral">Chất liệu: {PRODUCT.material}</span>
                                {PRODUCT.style.map((s) => <span key={s} className="badge badge-neutral">{s}</span>)}
                            </div>
                        </div>
                    </div>
                    {/* Q&A */}
                    <div className="sf-accordion">
                        <button className="sf-accordion__trigger" aria-expanded={openAccordion === 'qa'} onClick={() => toggleAccordion('qa')}>
                            ❓ Hỏi đáp ({PRODUCT.qa.length})
                        </button>
                        <div className={`sf-accordion__body ${openAccordion === 'qa' ? 'open' : ''}`}>
                            {PRODUCT.qa.map((item, i) => (
                                <div key={i} style={{ marginBottom: 'var(--space-3)' }}>
                                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>❓ {item.q}</p>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>✅ {item.a}</p>
                                </div>
                            ))}
                            <button className="btn btn-sm" style={{ marginTop: 'var(--space-2)' }}>Đặt câu hỏi</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews section */}
            <section id="reviews" style={{ marginTop: 'var(--space-8)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                    ⭐ Đánh giá ({PRODUCT.reviews.count})
                </h2>
                <ProductReviews productId={PRODUCT.id} />
            </section>

            {/* ═══ Sticky CTA Bar — upgraded ═══ */}
            <div className={`sticky-cta-bar ${showStickyCTA ? 'visible' : ''}`}>
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{PRODUCT.brand} · {selectedVariant.frameColor}</p>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--gold-400)' }}>
                        {formatVND(selectedVariant.price)}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                    <button className="btn btn-primary" style={{ minHeight: 44, fontSize: 'var(--text-sm)', fontWeight: 700, paddingLeft: 'var(--space-5)', paddingRight: 'var(--space-5)' }} onClick={handleBuyNow}>
                        Mua ngay ⚡
                    </button>
                    <button className="btn btn-secondary" style={{ minHeight: 44, fontSize: 'var(--text-sm)' }} onClick={handleAddToCart}>
                        🛒
                    </button>
                </div>
            </div>
        </div>
    );
}
