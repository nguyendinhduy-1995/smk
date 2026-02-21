import Link from 'next/link';

// Demo product data for initial render
const DEMO_PRODUCTS = [
    { id: '1', slug: 'aviator-classic-gold', name: 'Aviator Classic Gold', brand: 'Ray-Ban', price: 2990000, compareAt: 3590000, image: null, frameShape: 'Aviator', material: 'Kim loại' },
    { id: '2', slug: 'cat-eye-acetate-tortoise', name: 'Cat-Eye Acetate Tortoise', brand: 'Tom Ford', price: 4590000, compareAt: null, image: null, frameShape: 'Cat-Eye', material: 'Acetate' },
    { id: '3', slug: 'round-titanium-silver', name: 'Round Titanium Silver', brand: 'Lindberg', price: 8990000, compareAt: 9990000, image: null, frameShape: 'Round', material: 'Titanium' },
    { id: '4', slug: 'square-tr90-black', name: 'Square TR90 Black', brand: 'Oakley', price: 3290000, compareAt: null, image: null, frameShape: 'Square', material: 'TR90' },
    { id: '5', slug: 'browline-mixed-gold', name: 'Browline Mixed Gold-Black', brand: 'Persol', price: 5490000, compareAt: 6290000, image: null, frameShape: 'Browline', material: 'Mixed' },
    { id: '6', slug: 'oval-acetate-crystal', name: 'Oval Acetate Crystal Pink', brand: 'Celine', price: 6790000, compareAt: null, image: null, frameShape: 'Oval', material: 'Acetate' },
    { id: '7', slug: 'geometric-titanium-rose', name: 'Geometric Titanium Rose', brand: 'Miu Miu', price: 7290000, compareAt: 7990000, image: null, frameShape: 'Geometric', material: 'Titanium' },
    { id: '8', slug: 'rectangle-metal-gunmetal', name: 'Rectangle Metal Gunmetal', brand: 'Hugo Boss', price: 2490000, compareAt: null, image: null, frameShape: 'Rectangle', material: 'Kim loại' },
];

/* ═══ #4 — SVG line-art icons thay emoji ═══ */
const COLLECTIONS = [
    {
        slug: 'kinh-can', name: 'Kính Cận', count: 156,
        icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="4" /><circle cx="18" cy="12" r="4" /><path d="M10 12h4" /><path d="M2 12h0" /><path d="M22 12h0" /></svg>,
    },
    {
        slug: 'kinh-ram', name: 'Kính Râm', count: 89,
        icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="4" /><circle cx="18" cy="12" r="4" /><path d="M10 12h4" /><path d="M2 12h0" /><path d="M22 12h0" /><path d="M6 8v0" strokeWidth="3" stroke="var(--gold-400)" /></svg>,
    },
    {
        slug: 'gong-kinh-nam', name: 'Gọng Nam', count: 72,
        icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="9" width="8" height="7" rx="2" /><rect x="14" y="9" width="8" height="7" rx="2" /><path d="M10 12h4" /></svg>,
    },
    {
        slug: 'gong-kinh-nu', name: 'Gọng Nữ', count: 94,
        icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9c0-2 2-4 5-4s5 3 5 5-2 5-5 5-5-3-5-4" /><path d="M12 10c0-2 2-4 5-4s5 3 5 5-2 5-5 5-5-3-5-4" /><path d="M3 7l2 2" /><path d="M21 7l-2 2" /></svg>,
    },
    {
        slug: 'trong-kinh', name: 'Tròng Kính', count: 45,
        icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 4v2" /><path d="M12 18v2" /></svg>,
    },
    {
        slug: 'phu-kien', name: 'Phụ Kiện', count: 38,
        icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M4 9h16" /><circle cx="12" cy="15" r="2" /></svg>,
    },
];

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

/* ═══ #8 — Product Card with Quick Actions ═══ */
function ProductCard({ product, index }: { product: typeof DEMO_PRODUCTS[0]; index: number }) {
    return (
        <Link
            href={`/p/${product.slug}`}
            className="product-card reveal-up"
            style={{ textDecoration: 'none', animationDelay: `${index * 80}ms` }}
        >
            <div className="product-card__image">
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-hover))',
                    }}
                >
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                        <circle cx="6" cy="12" r="4" /><circle cx="18" cy="12" r="4" /><path d="M10 12h4" /><path d="M2 12h0" /><path d="M22 12h0" />
                    </svg>
                </div>
                <span className="product-card__wishlist">♡</span>
                {product.compareAt && (
                    <div className="product-card__badges">
                        <span className="badge badge-error" style={{ fontSize: '10px' }}>
                            -{Math.round((1 - product.price / product.compareAt) * 100)}%
                        </span>
                    </div>
                )}
                {/* Quick actions overlay */}
                <div className="product-card__quick-actions">
                    <span className="product-card__quick-btn" title="Thêm vào giỏ">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" x2="21" y1="6" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                    </span>
                    <span className="product-card__quick-btn" title="Xem nhanh">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </span>
                </div>
            </div>
            <div className="product-card__body">
                <div className="product-card__brand">{product.brand}</div>
                <div className="product-card__name">{product.name}</div>
                <div className="product-card__price">
                    <span className="product-card__price-current">{formatVND(product.price)}</span>
                    {product.compareAt && (
                        <span className="product-card__price-compare">{formatVND(product.compareAt)}</span>
                    )}
                </div>
                <div className="product-card__meta">
                    <span className="product-card__meta-tag">{product.frameShape}</span>
                    <span className="product-card__meta-tag">{product.material}</span>
                </div>
            </div>
        </Link>
    );
}

export default function HomePage() {
    return (
        <div className="container" style={{ paddingBottom: 'var(--space-4)' }}>
            {/* ═══ #1 — Hero với hình ảnh kính mắt ═══ */}
            <section className="hero" style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(212,168,83,0.15) 0%, transparent 50%, rgba(96,165,250,0.08) 100%)',
                    }}
                />
                <div className="hero__content reveal-up" style={{ flex: '1 1 50%', zIndex: 1 }}>
                    <span className="badge badge-gold" style={{ marginBottom: 'var(--space-3)' }}>
                        ✦ Bộ sưu tập mới
                    </span>
                    <h1 className="hero__title">
                        Kính Mắt<br />
                        <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Thời Trang 2026
                        </span>
                    </h1>
                    <p className="hero__subtitle">
                        Khám phá bộ sưu tập mới nhất. Gọng kính cao cấp, thiết kế đỉnh cao.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                        <Link href="/c/new-arrivals" className="btn btn-primary btn-lg" style={{ minHeight: 'var(--touch-target, 44px)' }}>
                            Khám phá ngay →
                        </Link>
                        <Link href="/try-on" className="btn btn-secondary btn-lg" style={{ minHeight: 'var(--touch-target, 44px)' }}>
                            Thử kính AI ✨
                        </Link>
                    </div>
                </div>
                {/* Hero illustration — kính mắt SVG */}
                <div className="hero__visual reveal-up hide-mobile" style={{ flex: '0 0 40%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1, animationDelay: '200ms' }}>
                    <div style={{
                        position: 'relative',
                        width: 320,
                        height: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {/* Glow effect */}
                        <div style={{
                            position: 'absolute',
                            width: 200,
                            height: 200,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(212,168,83,0.2) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                            animation: 'pulse 3s ease-in-out infinite',
                        }} />
                        {/* Glasses SVG */}
                        <svg width="280" height="140" viewBox="0 0 280 140" fill="none" style={{ position: 'relative', zIndex: 1 }}>
                            {/* Left lens */}
                            <ellipse cx="80" cy="70" rx="55" ry="45" stroke="var(--gold-400)" strokeWidth="3" fill="rgba(212,168,83,0.05)" />
                            {/* Right lens */}
                            <ellipse cx="200" cy="70" rx="55" ry="45" stroke="var(--gold-400)" strokeWidth="3" fill="rgba(212,168,83,0.05)" />
                            {/* Bridge */}
                            <path d="M135 65 Q140 55 145 65" stroke="var(--gold-400)" strokeWidth="3" fill="none" />
                            {/* Left temple */}
                            <path d="M25 55 L5 40" stroke="var(--gold-400)" strokeWidth="2.5" strokeLinecap="round" />
                            {/* Right temple */}
                            <path d="M255 55 L275 40" stroke="var(--gold-400)" strokeWidth="2.5" strokeLinecap="round" />
                            {/* Shine effect */}
                            <ellipse cx="60" cy="55" rx="15" ry="8" fill="rgba(255,255,255,0.1)" transform="rotate(-15 60 55)" />
                            <ellipse cx="180" cy="55" rx="15" ry="8" fill="rgba(255,255,255,0.1)" transform="rotate(-15 180 55)" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* ═══ Trust Badges ═══ */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
                {[
                    { icon: '🔄', text: 'Đổi trả 14 ngày' },
                    { icon: '🛡️', text: 'Bảo hành 1 năm' },
                    { icon: '🚚', text: 'Freeship từ 500K' },
                    { icon: '👁️', text: 'Đo mắt miễn phí' },
                ].map(b => (
                    <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                        <span style={{ fontSize: 16 }}>{b.icon}</span>
                        <span style={{ fontWeight: 500 }}>{b.text}</span>
                    </div>
                ))}
            </section>

            {/* ═══ #4 — Collections with SVG icons ═══ */}
            <section className="section reveal-up" style={{ animationDelay: '100ms' }}>
                <div className="section-header">
                    <h2 className="section-header__title">Danh mục</h2>
                    <Link href="/search" className="section-header__link">
                        Xem tất cả →
                    </Link>
                </div>
                <div className="scroll-x">
                    {COLLECTIONS.map((col) => (
                        <Link
                            key={col.slug}
                            href={`/c/${col.slug}`}
                            className="glass-card collection-card"
                            style={{
                                minWidth: 140,
                                padding: 'var(--space-5)',
                                textAlign: 'center',
                                textDecoration: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                            }}
                        >
                            <span style={{ color: 'var(--gold-400)', display: 'flex' }}>{col.icon}</span>
                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {col.name}
                            </span>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                {col.count} sản phẩm
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Trending */}
            <section className="section reveal-up" style={{ animationDelay: '200ms' }}>
                <div className="section-header">
                    <h2 className="section-header__title">🔥 Xu hướng</h2>
                    <Link href="/c/trending" className="section-header__link">
                        Xem thêm →
                    </Link>
                </div>
                <div className="sf-product-grid">
                    {DEMO_PRODUCTS.slice(0, 4).map((p, i) => (
                        <ProductCard key={p.id} product={p} index={i} />
                    ))}
                </div>
            </section>

            {/* Best Sellers */}
            <section className="section reveal-up" style={{ animationDelay: '300ms' }}>
                <div className="section-header">
                    <h2 className="section-header__title">⭐ Bán chạy nhất</h2>
                    <Link href="/c/best-sellers" className="section-header__link">
                        Xem thêm →
                    </Link>
                </div>
                <div className="sf-product-grid">
                    {DEMO_PRODUCTS.slice(4, 8).map((p, i) => (
                        <ProductCard key={p.id} product={p} index={i} />
                    ))}
                </div>
            </section>

            {/* AI Features Banner */}
            <section className="section reveal-up" style={{ animationDelay: '400ms' }}>
                <div
                    className="glass-card"
                    style={{
                        padding: 'var(--space-8)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 'var(--space-4)',
                        background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(96,165,250,0.05))',
                    }}
                >
                    <div style={{
                        width: 72, height: 72, borderRadius: 'var(--radius-full)',
                        background: 'var(--gradient-gold)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
                            <path d="M8 14v.5a4 4 0 0 0 8 0V14" />
                            <circle cx="12" cy="20" r="2" />
                            <path d="M12 18v-2" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>AI Tư Vấn Kính</h2>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 480 }}>
                        Không biết chọn gì? AI sẽ giúp bạn tìm kiểu kính phù hợp nhất với khuôn mặt và phong cách.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link href="/try-on" className="btn btn-primary">
                            Thử kính ảo
                        </Link>
                        <Link href="/support" className="btn btn-secondary">
                            Chat với AI Stylist
                        </Link>
                    </div>
                </div>
            </section>

            {/* Partner CTA */}
            <section className="section reveal-up" style={{ paddingBottom: 'var(--space-8)', animationDelay: '500ms' }}>
                <div
                    className="card"
                    style={{
                        padding: 'var(--space-8)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 'var(--space-6)',
                        flexWrap: 'wrap',
                    }}
                >
                    <div>
                        <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>
                            💼 Trở thành Đại lý / Affiliate
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', maxWidth: 400 }}>
                            Kiếm hoa hồng lên đến 20% cho mỗi đơn hàng giới thiệu thành công.
                        </p>
                    </div>
                    <Link href="/partner" className="btn btn-primary btn-lg">
                        Đăng ký ngay
                    </Link>
                </div>
            </section>
        </div>
    );
}
