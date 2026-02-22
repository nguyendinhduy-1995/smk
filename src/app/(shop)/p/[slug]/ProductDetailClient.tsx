'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import ProductReviews from '@/components/ProductReviews';
import { trackView } from '@/components/RecentlyViewed';
import ShareButton from '@/components/ShareButton';
import ReviewWithPhotos from '@/components/ReviewWithPhotos';

interface RecommendedProduct {
    id: string; slug: string; name: string; price: number;
    compareAt: number | null; category: string; brand: string | null;
    image: string | null; score: number; reason: string;
}

type Variant = {
    id: string; sku: string; frameColor: string;
    lensColor: string | null; price: number;
    compareAtPrice: number | null; stockQty: number;
};

type Product = {
    id: string; slug: string; name: string; price: number;
    compareAt: number | null; category: string;
    image: string | null; images: string[]; description: string;
    brand?: string | null;
};

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function ProductDetailClient({ product, variant, galleryImages }: {
    product: Product; variant: Variant; galleryImages: string[];
}) {
    const [selectedVariant] = useState(variant);
    const [showStickyCTA, setShowStickyCTA] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const addItem = useCartStore((s) => s.addItem);
    const addToast = useUIStore((s) => s.addToast);

    const discount = selectedVariant.compareAtPrice
        ? Math.round((1 - selectedVariant.price / selectedVariant.compareAtPrice) * 100)
        : 0;

    useEffect(() => {
        const handleScroll = () => setShowStickyCTA(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        trackView({ slug: product.slug, name: product.name, brand: product.brand || '', price: selectedVariant.price });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            sku: selectedVariant.sku,
            frameColor: selectedVariant.frameColor,
            lensColor: selectedVariant.lensColor ?? '',
            price: selectedVariant.price,
            compareAtPrice: selectedVariant.compareAtPrice ?? undefined,
        });
        addToast({ type: 'success', message: `Đã thêm ${product.name} vào giỏ hàng!` });
    }, [addItem, addToast, selectedVariant, product]);

    const handleBuyNow = useCallback(() => {
        handleAddToCart();
        window.location.href = '/checkout';
    }, [handleAddToCart]);

    const toggleAccordion = (key: string) => setOpenAccordion(prev => prev === key ? null : key);
    const [zoomOpen, setZoomOpen] = useState(false);
    const [zoomIdx, setZoomIdx] = useState(0);

    const slides = galleryImages.length > 0 ? galleryImages : [null];

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-2)', paddingBottom: 120 }}>

            {/* C7: Fullscreen Zoom Gallery */}
            {zoomOpen && (
                <div onClick={() => setZoomOpen(false)} style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
                }}>
                    <button onClick={(e) => { e.stopPropagation(); setZoomOpen(false); }} style={{
                        position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)',
                        border: 'none', color: '#fff', fontSize: 20, width: 40, height: 40,
                        borderRadius: '50%', cursor: 'pointer', zIndex: 10,
                    }}>✕</button>
                    <div style={{ position: 'relative', width: '90vw', height: '80vh', touchAction: 'pinch-zoom' }} onClick={e => e.stopPropagation()}>
                        {slides[zoomIdx] ? (
                            <Image src={slides[zoomIdx]!} alt={`${product.name} zoom`} fill style={{ objectFit: 'contain' }} sizes="90vw" />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 120, color: '#fff' }}>👓</div>
                        )}
                    </div>
                    {slides.length > 1 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            {slides.map((_, i) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); setZoomIdx(i); }}
                                    style={{
                                        width: i === zoomIdx ? 24 : 8, height: 8, borderRadius: 99,
                                        background: i === zoomIdx ? 'var(--gold-400)' : 'rgba(255,255,255,0.3)',
                                        border: 'none', cursor: 'pointer', transition: 'all 200ms', padding: 0,
                                    }} />
                            ))}
                        </div>
                    )}
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 8 }}>{zoomIdx + 1} / {slides.length} · Nhấn để đóng</p>
                </div>
            )}
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                <Link href="/" style={{ color: 'var(--text-muted)' }}>Trang chủ</Link>
                <span>/</span>
                <Link href={`/c/${product.category || 'all'}`} style={{ color: 'var(--text-muted)' }}>{product.category || 'Tất cả'}</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
            </nav>

            {/* ═══ Gallery — real images ═══ */}
            <div ref={galleryRef} className="sf-gallery" style={{ borderRadius: 'var(--radius-2xl)', marginBottom: 0 }}>
                {slides.map((img, i) => (
                    <div key={i} className="sf-gallery__slide" style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => { setZoomIdx(i); setZoomOpen(true); }}>
                        {img ? (
                            <Image
                                src={img}
                                alt={`${product.name} - ảnh ${i + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'cover' }}
                                priority={i === 0}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', fontSize: 80 }}>
                                👓
                            </div>
                        )}
                        {i === 0 && discount > 0 && (
                            <span style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)', display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(220,38,38,0.88)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.01em', boxShadow: '0 2px 6px rgba(220,38,38,0.25)' }}>↓{discount}%</span>
                        )}
                        {i === 0 && (
                            <Link href="/try-on" className="btn btn-sm" style={{ position: 'absolute', bottom: 'var(--space-3)', right: 'var(--space-3)', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', backdropFilter: 'blur(8px)' }}>
                                Thử kính online ✨
                            </Link>
                        )}
                    </div>
                ))}
            </div>
            {slides.length > 1 && (
                <div className="sf-gallery__dots">
                    {slides.map((_, i) => (
                        <button key={i} className={`sf-gallery__dot ${activeSlide === i ? 'sf-gallery__dot--active' : ''}`} onClick={() => scrollToSlide(i)} />
                    ))}
                </div>
            )}

            {/* ═══ Product Info ═══ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {/* Brand + Name + Rating */}
                <div>
                    {product.brand && (
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gold-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-1)' }}>
                            {product.brand}
                        </p>
                    )}
                    <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)', lineHeight: 1.3 }}>
                        {product.name}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} style={{ color: s <= 4 ? '#f59e0b' : 'var(--text-muted)', fontSize: 14 }}>★</span>
                            ))}
                        </div>
                        <ShareButton title={product.name} text={`${product.name} — ${formatVND(selectedVariant.price)}`} />
                    </div>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gold-400)' }}>
                        {formatVND(selectedVariant.price)}
                    </span>
                    {selectedVariant.compareAtPrice && (
                        <>
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                {formatVND(selectedVariant.compareAtPrice)}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(220,38,38,0.88)', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.01em' }}>↓{discount}%</span>
                        </>
                    )}
                </div>

                {/* Trust line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    <span>🚚 Freeship từ 500K</span>
                    <span>🔄 Đổi trả 14 ngày</span>
                    <span>🛡️ BH 1 năm</span>
                </div>

                {/* CTA Buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-primary" style={{ flex: 2, minHeight: 46, fontSize: 'var(--text-sm)', fontWeight: 700, borderRadius: 'var(--radius-xl)', gap: 6 }} onClick={handleBuyNow}>
                        ⚡ Mua ngay
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1, minHeight: 46, borderRadius: 'var(--radius-xl)', fontSize: 'var(--text-sm)' }} onClick={handleAddToCart}>
                        🛒 Thêm giỏ
                    </button>
                </div>

                {/* Short Description */}
                {product.description && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, borderLeft: '3px solid var(--gold-400)', paddingLeft: 'var(--space-3)' }}>
                        {product.description.split('\n')[0]}
                    </p>
                )}

                {/* Product Details — always visible */}
                {product.description && (() => {
                    const lines = product.description.split('\n').filter(Boolean);
                    const sections: { title: string; items: string[] }[] = [];
                    let current: { title: string; items: string[] } | null = null;
                    for (const line of lines) {
                        if (line.startsWith('📐') || line.startsWith('✨') || line.startsWith('🛡️')) {
                            if (current) sections.push(current);
                            current = { title: line, items: [] };
                        } else if (line.startsWith('•') && current) {
                            current.items.push(line.replace(/^•\s*/, ''));
                        }
                    }
                    if (current) sections.push(current);

                    return sections.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {sections.map((sec, i) => (
                                <div key={i} className="card" style={{ padding: 'var(--space-4)' }}>
                                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{sec.title}</p>
                                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                        {sec.items.map((item, j) => (
                                            <li key={j} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', paddingLeft: 'var(--space-3)', position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: 0, color: 'var(--gold-400)' }}>·</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                <span className="badge badge-neutral">{product.category}</span>
                                {product.brand && <span className="badge badge-neutral">{product.brand}</span>}
                            </div>
                        </div>
                    ) : (
                        <div className="sf-accordion">
                            <button className="sf-accordion__trigger" aria-expanded={openAccordion === 'desc'} onClick={() => toggleAccordion('desc')}>
                                📋 Mô tả sản phẩm
                            </button>
                            <div className={`sf-accordion__body ${openAccordion === 'desc' ? 'open' : ''}`}>
                                <p style={{ lineHeight: 1.8, fontSize: 'var(--text-sm)' }}>{product.description}</p>
                                <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                    <span className="badge badge-neutral">{product.category}</span>
                                </div>
                            </div>
                        </div>
                    );
                })()}

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

                {/* Q&A */}
                <div className="sf-accordion">
                    <button className="sf-accordion__trigger" aria-expanded={openAccordion === 'qa'} onClick={() => toggleAccordion('qa')}>
                        ❓ Hỏi đáp
                    </button>
                    <div className={`sf-accordion__body ${openAccordion === 'qa' ? 'open' : ''}`}>
                        {[
                            { q: 'Có bảo hành không?', a: 'Sản phẩm được bảo hành chính hãng 1 năm.' },
                            { q: 'Có đo mắt lắp tròng cận không?', a: 'Có, shop hỗ trợ lắp tròng cận theo đơn thuốc.' },
                        ].map((item, i) => (
                            <div key={i} style={{ marginBottom: 'var(--space-3)' }}>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>❓ {item.q}</p>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>✅ {item.a}</p>
                            </div>
                        ))}
                        <button className="btn btn-sm" style={{ marginTop: 'var(--space-2)' }}>Đặt câu hỏi</button>
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <section id="reviews" style={{ marginTop: 'var(--space-8)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                    ⭐ Đánh giá
                </h2>
                <div style={{ marginTop: 'var(--space-4)' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>📸 Đánh giá từ khách hàng</h3>
                    <ReviewWithPhotos productId={product.id} />
                </div>
                <ProductReviews productId={product.id} />
            </section>

            {/* AI Recommendations */}
            <RecommendationsSection productId={product.id} />

            {/* Sticky CTA Bar */}
            <div className={`sticky-cta-bar ${showStickyCTA ? 'visible' : ''}`}>
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.brand || product.category} · {selectedVariant.frameColor}</p>
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

/* ═══ AI Recommendations Section ═══ */
function RecommendationsSection({ productId }: { productId: string }) {
    const [similar, setSimilar] = useState<RecommendedProduct[]>([]);
    const [discovery, setDiscovery] = useState<RecommendedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollRef1 = useRef<HTMLDivElement>(null);
    const scrollRef2 = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`/api/ai/recommendations?productId=${productId}&limit=8`)
            .then(r => r.json())
            .then(data => {
                setSimilar(data.similar || []);
                setDiscovery(data.discovery || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [productId]);

    if (loading) {
        return (
            <section style={{ marginTop: 'var(--space-8)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>💡 Gợi ý cho bạn</h2>
                <div style={{ display: 'flex', gap: 'var(--space-3)', overflow: 'hidden' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ minWidth: 160, height: 220, borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', animation: 'pulse 1.5s infinite' }} />
                    ))}
                </div>
            </section>
        );
    }

    if (similar.length === 0) return null;

    const ProductCard = ({ item }: { item: RecommendedProduct }) => {
        const discount = item.compareAt && item.compareAt > item.price
            ? Math.round(((item.compareAt - item.price) / item.compareAt) * 100)
            : 0;
        return (
            <Link href={`/p/${item.slug}`} style={{ textDecoration: 'none', minWidth: 160, maxWidth: 180, flexShrink: 0 }}>
                <div style={{
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                    transition: 'all 0.2s', position: 'relative',
                }}>
                    {/* Image */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: 'var(--bg-tertiary)' }}>
                        {item.image ? (
                            <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="180px" />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👓</div>
                        )}
                        {discount > 0 && (
                            <span style={{
                                position: 'absolute', top: 6, right: 6, padding: '2px 6px',
                                borderRadius: 99, fontSize: 10, fontWeight: 700,
                                background: 'var(--error)', color: '#fff',
                            }}>-{discount}%</span>
                        )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '10px 10px 12px' }}>
                        <p style={{
                            fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                            lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                            minHeight: 31,
                        }}>{item.name}</p>

                        {item.brand && (
                            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{item.brand}</p>
                        )}

                        <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--gold-400)' }}>
                                {formatVND(item.price)}
                            </span>
                            {item.compareAt && item.compareAt > item.price && (
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                    {formatVND(item.compareAt)}
                                </span>
                            )}
                        </div>

                        <span style={{
                            display: 'inline-block', marginTop: 6, padding: '2px 8px',
                            borderRadius: 99, fontSize: 9, fontWeight: 600,
                            background: 'rgba(212,168,83,0.12)', color: 'var(--gold-400)',
                        }}>{item.reason}</span>
                    </div>
                </div>
            </Link>
        );
    };

    const ScrollRow = ({ items, scrollRef: ref, title, icon }: {
        items: RecommendedProduct[]; scrollRef: React.RefObject<HTMLDivElement | null>; title: string; icon: string;
    }) => (
        <div style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{icon} {title}</h3>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => ref.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                        style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
                    <button onClick={() => ref.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                        style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
                </div>
            </div>
            <div ref={ref} style={{
                display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', scrollSnapType: 'x mandatory',
                scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: 4,
            }}>
                {items.map(item => <ProductCard key={item.id} item={item} />)}
            </div>
        </div>
    );

    return (
        <section style={{ marginTop: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                💡 Gợi ý cho bạn
                <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 99, background: 'var(--bg-secondary)' }}>
                    SMK
                </span>
            </h2>

            <ScrollRow items={similar} scrollRef={scrollRef1} title="Sản phẩm tương tự" icon="✨" />

            {discovery.length > 0 && (
                <ScrollRow items={discovery} scrollRef={scrollRef2} title="Khám phá thêm" icon="🔍" />
            )}
        </section>
    );
}
