'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
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

/* ═══ Lightbox giống kinhhaitrieu.com ═══ */
function ZoomModal({ slides, startIdx, productName, onClose }: {
    slides: (string | null)[]; startIdx: number; productName: string; onClose: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [idx, setIdx] = useState(startIdx);
    const touchRef = useRef<{ x: number; time: number } | null>(null);

    // Open native dialog on mount
    useEffect(() => {
        const d = dialogRef.current;
        if (d && !d.open) d.showModal();
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => {
            if (d?.open) d.close();
            document.body.style.overflow = '';
        };
    }, []);

    // Handle native close (Escape)
    useEffect(() => {
        const d = dialogRef.current;
        const handle = () => onClose();
        d?.addEventListener('close', handle);
        return () => d?.removeEventListener('close', handle);
    }, [onClose]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' && idx > 0) setIdx(i => i - 1);
            if (e.key === 'ArrowRight' && idx < slides.length - 1) setIdx(i => i + 1);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [idx, slides.length]);

    // Swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) touchRef.current = { x: e.touches[0].clientX, time: Date.now() };
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchRef.current) return;
        const dx = e.changedTouches[0].clientX - touchRef.current.x;
        const dt = Date.now() - touchRef.current.time;
        if (Math.abs(dx) > 50 && dt < 400) {
            if (dx < 0 && idx < slides.length - 1) setIdx(i => i + 1);
            if (dx > 0 && idx > 0) setIdx(i => i - 1);
        }
        touchRef.current = null;
    };

    const src = slides[idx];
    const arrowStyle: React.CSSProperties = {
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(255,255,255,0.85)', border: 'none',
        color: '#222', fontSize: 22, cursor: 'pointer', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    };

    return (
        <>
            {/* Inject backdrop style for this dialog */}
            <style>{`
                dialog.zoom-lightbox::backdrop {
                    background: rgba(0, 0, 0, 0.6);
                }
                dialog.zoom-lightbox {
                    animation: zoomFadeIn 0.2s ease;
                }
                @keyframes zoomFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
            <dialog
                ref={dialogRef}
                className="zoom-lightbox"
                onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{
                    position: 'fixed',
                    margin: 'auto',
                    padding: 0,
                    border: 'none',
                    background: '#fff',
                    borderRadius: 4,
                    width: 'min(90vw, 900px)',
                    maxHeight: '85vh',
                    overflow: 'hidden',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
                }}
            >
                {/* Counter top-left — overlaid on dialog */}
                <div style={{
                    position: 'absolute', top: 12, left: 16, zIndex: 5,
                    color: '#555', fontSize: 13, fontWeight: 600,
                    background: 'rgba(255,255,255,0.8)', padding: '4px 10px',
                    borderRadius: 12, backdropFilter: 'blur(4px)',
                }}>
                    {idx + 1} / {slides.length}
                </div>

                {/* Close button top-right — overlaid on dialog */}
                <button onClick={onClose} style={{
                    position: 'absolute', top: 8, right: 8, zIndex: 5,
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.05)', border: 'none',
                    color: '#333', fontSize: 20, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>

                {/* Image area — white background, product centered */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#fff', position: 'relative',
                    minHeight: 300, padding: '48px 16px 16px',
                }}>
                    {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={src} alt={`${productName} - ${idx + 1}`}
                            draggable={false}
                            style={{
                                display: 'block',
                                maxWidth: '100%',
                                maxHeight: '75vh',
                                objectFit: 'contain',
                            }}
                        />
                    ) : (
                        <div style={{ fontSize: 48, color: '#ccc' }}>📷</div>
                    )}
                </div>

                {/* Left arrow */}
                {slides.length > 1 && idx > 0 && (
                    <button onClick={() => setIdx(i => i - 1)}
                        style={{ ...arrowStyle, position: 'absolute', left: 8 }}>
                        ←
                    </button>
                )}

                {/* Right arrow */}
                {slides.length > 1 && idx < slides.length - 1 && (
                    <button onClick={() => setIdx(i => i + 1)}
                        style={{ ...arrowStyle, position: 'absolute', right: 8 }}>
                        →
                    </button>
                )}
            </dialog>
        </>
    );
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

            {/* C7: Fullscreen Image Viewer */}
            {zoomOpen && (
                <ZoomModal
                    slides={slides}
                    startIdx={zoomIdx}
                    productName={product.name}
                    onClose={() => setZoomOpen(false)}
                />
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

                            </div>
                        )}
                        {i === 0 && discount > 0 && (
                            <span style={{ position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)', display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(220,38,38,0.88)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: 12, fontWeight: 700, letterSpacing: '0.01em', boxShadow: '0 2px 6px rgba(220,38,38,0.25)' }}>↓{discount}%</span>
                        )}
                        {i === 0 && (
                            <Link href="/try-on" className="btn btn-sm" style={{ position: 'absolute', bottom: 'var(--space-3)', right: 'var(--space-3)', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', backdropFilter: 'blur(8px)' }}>
                                Thử kính online
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
                        if (line.startsWith('📐') || line.startsWith('') || line.startsWith('🛡️')) {
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

                {/* C8: Customer Prescription Form */}
                {(product.category?.toLowerCase().includes('cận') || product.category?.toLowerCase().includes('kính') || true) && (
                    <div className="sf-accordion">
                        <button className="sf-accordion__trigger" aria-expanded={openAccordion === 'prescription'} onClick={() => toggleAccordion('prescription')}>
                            Nhập số đo mắt (tuỳ chọn)
                        </button>
                        <div className={`sf-accordion__body ${openAccordion === 'prescription' ? 'open' : ''}`}>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Nhập thông tin từ đơn kính để chúng tôi lắp tròng chính xác cho bạn.</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 6, fontSize: 12, alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: 10, color: 'var(--text-muted)' }}>&nbsp;</span>
                                <span style={{ fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>Mắt trái (OS)</span>
                                <span style={{ fontWeight: 700, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>Mắt phải (OD)</span>
                                {['SPH (Cầu)', 'CYL (Trụ)', 'AXIS', 'PD (mm)'].map(field => (
                                    <Fragment key={field}>
                                        <span style={{ fontWeight: 600, fontSize: 11 }}>{field}</span>
                                        <input className="input" placeholder={field === 'AXIS' ? '0-180' : '±0.00'} style={{ fontSize: 12, padding: '6px 8px', textAlign: 'center' }} />
                                        <input className="input" placeholder={field === 'AXIS' ? '0-180' : '±0.00'} style={{ fontSize: 12, padding: '6px 8px', textAlign: 'center' }} />
                                    </Fragment>
                                ))}
                            </div>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                📷 Hoặc chụp ảnh đơn kính và đính kèm khi đặt hàng
                            </p>
                        </div>
                    </div>
                )}

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
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}></div>
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

            <ScrollRow items={similar} scrollRef={scrollRef1} title="Sản phẩm tương tự" icon="" />

            {discovery.length > 0 && (
                <ScrollRow items={discovery} scrollRef={scrollRef2} title="Khám phá thêm" icon="🔍" />
            )}
        </section>
    );
}
