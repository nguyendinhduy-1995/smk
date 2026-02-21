import Link from 'next/link';
import Image from 'next/image';
import allProducts from '@/data/products.json';

type Product = {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAt: number | null;
    category: string;
    image: string | null;
    images: string[];
    description: string;
};

const products = allProducts as Product[];

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// Pick best-selling (highest discount) and newest
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

/* ═══ Product Card ═══ */
function ProductCard({ product }: { product: Product }) {
    const discount = product.compareAt
        ? Math.round((1 - product.price / product.compareAt) * 100)
        : 0;

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
                            <span className="badge badge-error" style={{ fontSize: '10px' }}>
                                -{discount}%
                            </span>
                        </div>
                    )}
                </div>
                <div className="product-card__body" style={{ paddingBottom: 0 }}>
                    <div className="product-card__name">{product.name}</div>
                    <div className="product-card__price">
                        <span className="product-card__price-current">{formatVND(product.price)}</span>
                        {product.compareAt && (
                            <span className="product-card__price-compare">{formatVND(product.compareAt)}</span>
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

export default function HomePage() {
    return (
        <div className="container" style={{ paddingBottom: 'var(--space-4)' }}>

            {/* ═══ "Bạn muốn kiểu nào?" ═══ */}
            <section className="scroll-reveal" style={{ marginTop: 'var(--space-4)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)', textAlign: 'center' }}>
                    Bạn muốn kiểu nào?
                </h2>
                <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                    {[
                        { emoji: '👑', label: 'Sang Trọng\nLịch Lãm', href: '/search?style=classic', gradient: 'linear-gradient(135deg, rgba(212,168,83,0.12), rgba(212,168,83,0.03))' },
                        { emoji: '✨', label: 'Trẻ Trung\nCá Tính', href: '/search?style=trendy', gradient: 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.02))' },
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

            {/* ═══ Thử Kính Online ═══ */}
            <section className="scroll-reveal-left" style={{ marginTop: 'var(--space-4)' }}>
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

            {/* ═══ Trust line ═══ */}
            <div className="trust-line" style={{
                display: 'flex', justifyContent: 'center', gap: 'var(--space-4)',
                padding: 'var(--space-3) 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                marginTop: 'var(--space-3)',
            }}>
                <span>🚚 Freeship 500K</span>
                <span>🔄 Đổi trả 14 ngày</span>
                <span>🛡️ BH 1 năm</span>
            </div>

            {/* ═══ Top bán chạy — REAL PRODUCTS ═══ */}
            <section className="section scroll-reveal">
                <div className="section-header">
                    <h2 className="section-header__title">🔥 Top bán chạy hôm nay</h2>
                    <Link href="/c/best-sellers" className="section-header__link">Xem tất cả →</Link>
                </div>
                <div className="sf-product-grid stagger-children">
                    {bestSellers.slice(0, 4).map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </section>

            {/* ═══ Chọn theo ngân sách ═══ */}
            <section className="scroll-scale">
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                    💰 Chọn theo ngân sách
                </h2>
                <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
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
            <section className="section scroll-reveal">
                <div className="section-header">
                    <h2 className="section-header__title">⭐ Gợi ý cho bạn</h2>
                    <Link href="/search" className="section-header__link">Xem thêm →</Link>
                </div>
                <div className="sf-product-grid stagger-children">
                    {suggestions.slice(0, 4).map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </section>

            {/* ═══ More best sellers ═══ */}
            <section className="section scroll-reveal-right">
                <div className="section-header">
                    <h2 className="section-header__title">💎 Khuyến mãi hot</h2>
                    <Link href="/c/best-sellers" className="section-header__link">Xem tất cả →</Link>
                </div>
                <div className="sf-product-grid stagger-children">
                    {bestSellers.slice(4, 8).map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </section>

            {/* ═══ CTA ═══ */}
            <section className="section scroll-scale">
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
