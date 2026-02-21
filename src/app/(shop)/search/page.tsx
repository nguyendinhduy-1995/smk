import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tìm kiếm kính mắt',
    description: 'Tìm kiếm gọng kính, kính râm, kính cận theo hình dáng, chất liệu, khuôn mặt, phong cách.',
};

const FRAME_SHAPES = ['Vuông', 'Tròn', 'Oval', 'Cat-Eye', 'Aviator', 'Chữ nhật', 'Hình học', 'Browline'];
const MATERIALS = ['Titanium', 'TR90', 'Acetate', 'Kim loại', 'Mixed', 'Gỗ', 'Nhựa'];
const FACE_SHAPES = ['Mặt tròn', 'Mặt dài', 'Mặt vuông', 'Trái tim', 'Oval'];
const STYLES = ['Basic', 'Sang trọng', 'Cá tính', 'Công sở', 'Retro', 'Thể thao'];
const PRICE_RANGES = ['Dưới 500K', '500K - 1 triệu', '1 - 3 triệu', '3 - 5 triệu', 'Trên 5 triệu'];

export default function SearchPage() {
    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)' }}>
            {/* Search Bar */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <div style={{ position: 'relative' }}>
                    <svg
                        style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
                        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                        className="input"
                        placeholder="Tìm gọng kính, thương hiệu, kiểu dáng..."
                        style={{
                            paddingLeft: 48,
                            paddingRight: 48,
                            fontSize: 'var(--text-base)',
                            borderRadius: 'var(--radius-xl)',
                            height: 52,
                        }}
                        autoFocus
                    />
                    <button
                        className="btn btn-ghost btn-icon"
                        style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
                        title="Tìm bằng ảnh"
                    >
                        📷
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                {/* Filter Sidebar */}
                <aside
                    className="hide-mobile"
                    style={{
                        width: 240,
                        flexShrink: 0,
                        position: 'sticky',
                        top: 'calc(var(--header-height) + var(--space-4))',
                        alignSelf: 'flex-start',
                        maxHeight: 'calc(100dvh - var(--header-height) - var(--space-8))',
                        overflowY: 'auto',
                    }}
                >
                    <div className="filter-panel">
                        <FilterGroup title="Kiểu gọng" items={FRAME_SHAPES} />
                        <FilterGroup title="Chất liệu" items={MATERIALS} />
                        <FilterGroup title="Khuôn mặt" items={FACE_SHAPES} />
                        <FilterGroup title="Phong cách" items={STYLES} />
                        <FilterGroup title="Giá" items={PRICE_RANGES} />

                        <div className="filter-group">
                            <span className="filter-group__title">Size (lens width)</span>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                <input type="range" min="40" max="60" defaultValue="50" />
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', minWidth: 40 }}>50mm</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Results */}
                <div style={{ flex: 1 }}>
                    {/* Mobile filter toggle */}
                    <div
                        className="hide-desktop"
                        style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', overflowX: 'auto' }}
                    >
                        <button className="btn btn-secondary btn-sm">🔽 Bộ lọc</button>
                        <button className="btn btn-secondary btn-sm">Kiểu gọng</button>
                        <button className="btn btn-secondary btn-sm">Chất liệu</button>
                        <button className="btn btn-secondary btn-sm">Giá</button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)', alignItems: 'center' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                            Hiển thị <strong style={{ color: 'var(--text-primary)' }}>0</strong> kết quả
                        </p>
                        <select
                            className="input"
                            style={{ width: 'auto', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)' }}
                        >
                            <option>Phổ biến nhất</option>
                            <option>Mới nhất</option>
                            <option>Giá thấp → cao</option>
                            <option>Giá cao → thấp</option>
                            <option>Đánh giá cao</option>
                        </select>
                    </div>

                    {/* #3 & #6 — Enhanced empty state with trending + typeahead */}
                    <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }}>
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                            Tìm kiếm kính mắt
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                            Nhập tên sản phẩm, thương hiệu hoặc sử dụng bộ lọc
                        </p>

                        {/* Trending searches */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                🔥 Tìm kiếm phổ biến
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
                                {['Ray-Ban Aviator', 'Kính chống ánh sáng xanh', 'Gọng Titanium', 'Cat-Eye nữ', 'Oakley thể thao', 'Kính cận thời trang'].map((tag) => (
                                    <button key={tag} className="filter-chip" style={{ fontSize: 'var(--text-xs)' }}>{tag}</button>
                                ))}
                            </div>
                        </div>

                        {/* Suggested products */}
                        <div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                ⭐ Sản phẩm xu hướng
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-3)', textAlign: 'left' }}>
                                {[
                                    { slug: 'aviator-classic-gold', name: 'Aviator Classic Gold', brand: 'Ray-Ban', price: '2.990.000₫' },
                                    { slug: 'square-tr90-black', name: 'Square TR90 Black', brand: 'Oakley', price: '3.290.000₫' },
                                ].map((p) => (
                                    <Link key={p.slug} href={`/p/${p.slug}`} className="card" style={{ padding: 'var(--space-3)', textDecoration: 'none', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"><circle cx="6" cy="12" r="4" /><circle cx="18" cy="12" r="4" /><path d="M10 12h4" /></svg>
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
                </div>
            </div>
        </div>
    );
}

function FilterGroup({ title, items }: { title: string; items: string[] }) {
    return (
        <div className="filter-group">
            <span className="filter-group__title">{title}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {items.map((item) => (
                    <button key={item} className="filter-chip">{item}</button>
                ))}
            </div>
        </div>
    );
}
