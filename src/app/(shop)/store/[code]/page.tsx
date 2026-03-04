import Link from 'next/link';
import db from '@/lib/db';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// GET /partner/store/[code] — partner's mini-store
export default async function PartnerStorePage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const { code } = await params;

    const partner = await db.partnerProfile.findUnique({
        where: { partnerCode: code.toUpperCase() },
        include: {
            user: { select: { name: true, avatar: true } },
            coupons: {
                where: { isActive: true, endsAt: { gte: new Date() } },
                select: { code: true, type: true, value: true },
                take: 3,
            },
        },
    });

    if (!partner || partner.status !== 'ACTIVE') {
        return (
            <div className="container animate-in" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: 64, marginBottom: 'var(--space-4)' }}>🏪</div>
                <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                    Cửa hàng không tồn tại
                </h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                    Mã đại lý không hợp lệ hoặc chưa được kích hoạt.
                </p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-6)' }}>
                    Về trang chủ
                </Link>
            </div>
        );
    }

    // Fetch products for the mini-store
    const products = await db.product.findMany({
        where: { status: 'ACTIVE' },
        include: {
            variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
            media: { take: 1, orderBy: { sort: 'asc' } },
        },
        take: 12,
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
            {/* Store Header */}
            <div
                className="glass-card"
                style={{
                    padding: 'var(--space-6)',
                    marginBottom: 'var(--space-6)',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(212,168,83,0.1), rgba(96,165,250,0.05))',
                }}
            >
                <div
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--gradient-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        margin: '0 auto var(--space-3)',
                    }}
                >
                    {partner.user.avatar ? '👤' : '🏪'}
                </div>
                <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                    {partner.storeName || `Cửa hàng ${partner.user.name}`}
                </h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                    {partner.bio || 'Chuyên mắt kính thời trang cao cấp'}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center' }}>
                    <span className="badge badge-gold">
                        {partner.level === 'LEADER' ? '👑 Leader' : partner.level === 'AGENT' ? '🏆 Đại lý' : '⭐ Affiliate'}
                    </span>
                    <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>
                        Mã: {partner.partnerCode}
                    </span>
                </div>

                {/* Coupons */}
                {partner.coupons.length > 0 && (
                    <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {partner.coupons.map((c) => (
                            <div
                                key={c.code}
                                className="card"
                                style={{
                                    padding: 'var(--space-2) var(--space-3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-2)',
                                    border: '1px dashed var(--gold-500)',
                                }}
                            >
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)', fontWeight: 700 }}>
                                    🎫 {c.code}
                                </span>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                    Giảm {c.type === 'PERCENT' ? `${c.value}%` : formatVND(c.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Products */}
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                Sản phẩm
            </h2>
            <div className="product-grid">
                {products.map((p) => (
                    <Link
                        key={p.id}
                        href={`/p/${p.slug}?ref=${partner.partnerCode}`}
                        className="product-card"
                        style={{ textDecoration: 'none' }}
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
                                    fontSize: 48,
                                }}
                            >
                                
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
                                {p.variants[0]?.compareAtPrice && (
                                    <span className="product-card__price-compare">{formatVND(p.variants[0].compareAtPrice)}</span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
