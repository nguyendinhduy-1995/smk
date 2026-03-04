import Link from 'next/link';
import Image from 'next/image';
import { getAllProducts, type ProductItem } from '@/lib/product-queries';

export const dynamic = 'force-dynamic';

type Product = ProductItem;

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

/* ═══ Product Card ═══ */
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

function ProductCard({ product }: { product: Product }) {
    const discount = product.compareAt
        ? Math.round((1 - product.price / product.compareAt) * 100)
        : 0;
    const sales = getSalesCount(product.slug);
    const stars = getStarRating(product.slug);

    return (
        <div className="product-card">
            <Link href={`/p/${product.slug}`} style={{ textDecoration: 'none' }}>
                <div className="product-card__image">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)' }}>
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                                <circle cx="6" cy="12" r="4" /><circle cx="18" cy="12" r="4" /><path d="M10 12h4" />
                            </svg>
                        </div>
                    )}
                    <span className="product-card__wishlist">♡</span>
                    {discount > 0 && (
                        <div className="product-card__badges">
                            <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 2,
                                padding: '3px 8px', borderRadius: 'var(--radius-full)',
                                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                color: '#fff', fontSize: 11, fontWeight: 800,
                                letterSpacing: '0.01em', lineHeight: 1,
                                boxShadow: '0 2px 6px rgba(220,38,38,0.25)',
                            }}>
                                ↓{discount}%
                            </span>
                        </div>
                    )}
                </div>
                <div className="product-card__body" style={{ paddingBottom: 0 }}>
                    <div className="product-card__name">{product.name}</div>
                    {/* Price — stacked to prevent overflow */}
                    <div style={{ marginTop: 2 }}>
                        <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--gold-400)', display: 'block', lineHeight: 1.2 }}>
                            {formatVND(product.price)}
                        </span>
                        {product.compareAt && (
                            <span style={{ fontSize: 11, color: 'var(--error)', textDecoration: 'line-through', opacity: 0.7 }}>
                                {formatVND(product.compareAt)}
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
                    {/* Freeship or Đổi trả badge */}
                    <div style={{ marginTop: 4, marginBottom: 6 }}>
                        {product.price >= 500000 ? (
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
                    href={`/p/${product.slug}?buy=1`}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', minHeight: 34, fontSize: 'var(--text-xs)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    Mua ngay ⚡
                </Link>
            </div>
        </div>
    );
}

export default async function HomePage() {
    const products = await getAllProducts();
    const bestSellers = [...products]
        .filter((p) => p.compareAt && p.compareAt > p.price && p.image)
        .sort((a, b) => {
            const discA = a.compareAt ? (a.compareAt - a.price) / a.compareAt : 0;
            const discB = b.compareAt ? (b.compareAt - b.price) / b.compareAt : 0;
            return discB - discA;
        })
        .slice(0, 8);
    const suggestions = products
        .filter((p) => p.image && !bestSellers.includes(p))
        .slice(0, 8);
    const newArrivals = [...products]
        .filter((p) => p.image)
        .slice(-4)
        .reverse();
    return (
        <div className="container" style={{ paddingBottom: 'var(--space-4)' }}>

            {/* ═══ E1: Minimal Hero Banner ═══ */}
            <section style={{
                padding: 'var(--space-8) var(--space-5)',
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, rgba(212,168,83,0.08) 0%, rgba(168,85,247,0.06) 50%, rgba(96,165,250,0.05) 100%)',
                border: '1px solid rgba(212,168,83,0.1)',
                textAlign: 'center',
                marginBottom: 'var(--space-4)',
            }}>
                <p style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>SIÊU THỊ MẮT KÍNH</p>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, lineHeight: 1.2, marginBottom: 8, background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Kính chính hãng — Giá tốt nhất
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', maxWidth: 400, margin: '0 auto var(--space-4)' }}>
                    Gọng kính thời trang từ Ray-Ban, Tom Ford, Oakley. Freeship từ 500K.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/search" className="btn btn-primary" style={{ textDecoration: 'none' }}>🔍 Xem bộ sưu tập</Link>
                    <Link href="/quiz" className="btn" style={{ textDecoration: 'none' }}>🪩 Quiz chọn kính</Link>
                </div>
            </section>

            {/* ═══ E2: Mới về ═══ */}
            <section style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Mới về</h2>
                    <Link href="/search?sort=newest" style={{ fontSize: 12, color: 'var(--gold-400)', textDecoration: 'none', fontWeight: 600 }}>Xem tất cả →</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
                    {newArrivals.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </section>

            {/* ═══ "Bạn muốn kiểu nào?" ═══ */}
            <section style={{ marginTop: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', textAlign: 'center' }}>
                    Bạn muốn kiểu nào?
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                    {[
                        { emoji: '👑', label: 'Sang Trọng\nLịch Lãm', href: '/search?style=classic', gradient: 'linear-gradient(135deg, rgba(212,168,83,0.12), rgba(212,168,83,0.03))' },
                        { emoji: '🔥', label: 'Trẻ Trung\nCá Tính', href: '/search?style=trendy', gradient: 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.02))' },
                        { emoji: '👔', label: 'Công Sở\nThanh Lịch', href: '/search?style=office', gradient: 'linear-gradient(135deg, rgba(96,165,250,0.10), rgba(96,165,250,0.02))' },
                    ].map((s) => (
                        <Link
                            key={s.label}
                            href={s.href}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: 'var(--space-2)', padding: 'var(--space-5) var(--space-3)',
                                background: s.gradient, borderRadius: 'var(--radius-lg)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                textDecoration: 'none', textAlign: 'center',
                                transition: 'transform 200ms, box-shadow 200ms',
                                minHeight: 'var(--touch-target)',
                            }}
                        >
                            <span style={{ fontSize: 36 }}>{s.emoji}</span>
                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>
                                {s.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ═══ E3: Quiz CTA ═══ */}
            <Link href="/quiz" style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(212,168,83,0.06))',
                border: '1px solid rgba(168,85,247,0.1)',
                textDecoration: 'none', marginTop: 'var(--space-4)',
            }}>
                <span style={{ fontSize: 32 }}>🪩</span>
                <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Chưa biết chọn gọng nào?</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Làm quiz 30 giây → gợi ý kính phù hợp nhất </p>
                </div>
            </Link>

            {/* ═══ Thử Kính Online ═══ */}
            <section style={{ marginTop: 'var(--space-4)' }}>
                <Link
                    href="/try-on"
                    style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                        padding: 'var(--space-5)', textDecoration: 'none',
                        borderRadius: 'var(--radius-xl)',
                        background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(96,165,250,0.08))',
                        border: '1px solid rgba(212,168,83,0.2)',
                        transition: 'transform 200ms, box-shadow 200ms',
                    }}
                >
                    <div style={{
                        width: 56, height: 56, borderRadius: 'var(--radius-full)',
                        background: 'var(--gradient-gold)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        fontSize: 28,
                    }}>
                        🪞
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 2, color: 'var(--text-primary)' }}>
                            Thử Kính Online
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                            Upload ảnh → Chọn gọng → Xem kính trên khuôn mặt bạn
                        </p>
                    </div>
                    <span style={{ color: 'var(--gold-400)', fontSize: 20, flexShrink: 0 }}>→</span>
                </Link>
            </section>

            {/* ═══ Trust badges ═══ */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8,
                padding: 'var(--space-4) 0', marginTop: 'var(--space-3)',
            }}>
                {[
                    { icon: '🚚', label: 'Freeship', sub: 'Đơn từ 500K' },
                    { icon: '🔄', label: 'Đổi trả', sub: '14 ngày' },
                    { icon: '🛡️', label: 'Bảo hành', sub: '12 tháng' },
                    { icon: '💎', label: 'Chính hãng', sub: '100%' },
                ].map((b, i) => (
                    <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                        padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg-glass)', backdropFilter: 'blur(8px)',
                        border: '1px solid var(--border-primary)',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}>
                        <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>{b.icon}</span>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--text-primary)', lineHeight: 1.2 }}>{b.label}</p>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.2 }}>{b.sub}</p>
                        </div>
                    </div>
                ))}
            </div>


            {/* ═══ Top bán chạy — REAL PRODUCTS ═══ */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-header__title">🔥 Top bán chạy hôm nay</h2>
                    <Link href="/c/best-sellers" className="section-header__link">Xem tất cả →</Link>
                </div>
                <div className="sf-product-grid">
                    {bestSellers.slice(0, 4).map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </section>

            {/* ═══ Chọn theo ngân sách ═══ */}
            <section>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                    💰 Chọn theo ngân sách
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                    {[
                        { label: 'Dưới 500K', href: '/search?maxPrice=500000', sub: `${products.filter(p => p.price < 500000).length} sản phẩm` },
                        { label: '500K — 1tr', href: '/search?minPrice=500000&maxPrice=1000000', sub: `${products.filter(p => p.price >= 500000 && p.price <= 1000000).length} sản phẩm` },
                        { label: 'Trên 1tr', href: '/search?minPrice=1000000', sub: `${products.filter(p => p.price > 1000000).length} sản phẩm` },
                    ].map((b) => (
                        <Link
                            key={b.label}
                            href={b.href}
                            className="glass-card"
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: 'var(--space-1)', padding: 'var(--space-4)',
                                textDecoration: 'none', textAlign: 'center',
                                minHeight: 'var(--touch-target)',
                            }}
                        >
                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)' }}>{b.label}</span>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{b.sub}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ═══ Gợi ý cho bạn — REAL PRODUCTS ═══ */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-header__title">⭐ Gợi ý cho bạn</h2>
                    <Link href="/search" className="section-header__link">Xem thêm →</Link>
                </div>
                <div className="sf-product-grid">
                    {suggestions.slice(0, 4).map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </section>

            {/* ═══ More best sellers ═══ */}
            <section className="section">
                <div className="section-header">
                    <h2 className="section-header__title">💎 Khuyến mãi hot</h2>
                    <Link href="/c/best-sellers" className="section-header__link">Xem tất cả →</Link>
                </div>
                <div className="sf-product-grid">
                    {bestSellers.slice(4, 8).map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="section">
                <div className="glass-card" style={{
                    padding: 'var(--space-6)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', textAlign: 'center', gap: 'var(--space-3)',
                    background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(96,165,250,0.05))',
                }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Chưa biết chọn gì?</h2>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 400 }}>
                        Chọn giúp bạn mẫu hợp mặt — không cần đăng nhập
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link href="/try-on" className="btn btn-primary" style={{ minHeight: 44 }}>
                            🪞 Thử Kính Online
                        </Link>
                        <Link href="/support" className="btn btn-secondary" style={{ minHeight: 44 }}>
                            💬 Chat Tư Vấn
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
