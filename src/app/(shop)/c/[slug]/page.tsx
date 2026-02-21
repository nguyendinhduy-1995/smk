import Link from 'next/link';
import db from '@/lib/db';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const collection = await db.collection.findUnique({
        where: { slug },
        include: {
            products: {
                include: {
                    product: {
                        include: {
                            variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
                            media: { take: 1, orderBy: { sort: 'asc' } },
                        },
                    },
                },
                orderBy: { sort: 'asc' },
            },
        },
    });

    if (!collection) {
        return (
            <div className="container animate-in" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: 64, marginBottom: 'var(--space-4)' }}>🔍</div>
                <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Bộ sưu tập không tồn tại</h1>
                <Link href="/search" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>Khám phá sản phẩm</Link>
            </div>
        );
    }

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                <Link href="/" style={{ color: 'var(--text-tertiary)' }}>Trang chủ</Link>
                <span>/</span>
                <span style={{ color: 'var(--gold-400)' }}>{collection.name}</span>
            </div>

            {/* Collection Header */}
            <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(96,165,250,0.04))' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{collection.name}</h1>
                {collection.description && <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>{collection.description}</p>}
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>{collection.products.length} sản phẩm</p>
            </div>

            {/* Products Grid */}
            {collection.products.length === 0 ? (
                <div className="empty-state"><div className="empty-state__icon">📦</div><h2 className="empty-state__title">Chưa có sản phẩm</h2></div>
            ) : (
                <div className="product-grid">
                    {collection.products.map(({ product: p }) => (
                        <Link key={p.id} href={`/p/${p.slug}`} className="product-card" style={{ textDecoration: 'none' }}>
                            <div className="product-card__image">
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-hover))', fontSize: 48 }}>
                                    👓
                                </div>
                                {p.variants[0]?.compareAtPrice && (
                                    <div className="product-card__badges">
                                        <span className="badge badge-error" style={{ fontSize: 10 }}>
                                            -{Math.round((1 - (p.variants[0].price / p.variants[0].compareAtPrice)) * 100)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="product-card__body">
                                <div className="product-card__brand">{p.brand}</div>
                                <div className="product-card__name">{p.name}</div>
                                <div className="product-card__price">
                                    <span className="product-card__price-current">{formatVND(p.variants[0]?.price || 0)}</span>
                                    {p.variants[0]?.compareAtPrice && <span className="product-card__price-compare">{formatVND(p.variants[0].compareAtPrice)}</span>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
