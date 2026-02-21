'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

const FRAME_SHAPES = ['Vuông', 'Tròn', 'Oval', 'Cat-Eye', 'Aviator', 'Chữ nhật', 'Hình học', 'Browline'];
const MATERIALS = ['Titanium', 'TR90', 'Acetate', 'Kim loại', 'Mixed'];
const PRICE_RANGES = ['Dưới 500K', '500K-1 triệu', '1-3 triệu', '3-5 triệu', 'Trên 5 triệu'];
const BRANDS = ['Ray-Ban', 'Oakley', 'Tom Ford', 'Gucci', 'Lindberg', 'Hugo Boss'];

const QUICK_FILTERS = ['🔥 Bán chạy', '🆕 Mới về', '🏷️ Sale', '👓 Kính cận', '🕶️ Kính râm'];

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const DEMO_PRODUCTS = [
    { slug: 'aviator-classic-gold', name: 'Aviator Classic Gold', brand: 'Ray-Ban', price: 2990000, compareAt: 3590000, tagline: 'Huyền thoại — hợp mọi mặt' },
    { slug: 'square-tr90-black', name: 'Square TR90 Black', brand: 'Oakley', price: 3290000, compareAt: null, tagline: 'Thể thao — năng động' },
    { slug: 'cat-eye-acetate-tortoise', name: 'Cat-Eye Tortoise', brand: 'Tom Ford', price: 4590000, compareAt: 5290000, tagline: 'Sang trọng — nổi bật' },
    { slug: 'round-titanium-silver', name: 'Round Titanium Silver', brand: 'Lindberg', price: 8990000, compareAt: null, tagline: 'Siêu nhẹ — đeo cả ngày' },
    { slug: 'rectangle-metal-gunmetal', name: 'Rectangle Gunmetal', brand: 'Hugo Boss', price: 2490000, compareAt: null, tagline: 'Công sở — chuyên nghiệp' },
    { slug: 'browline-acetate-black', name: 'Browline Classic', brand: 'Ray-Ban', price: 2790000, compareAt: 3190000, tagline: 'Vintage — không bao giờ lỗi mốt' },
];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [showSheet, setShowSheet] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [sort, setSort] = useState('popular');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const toggleFilter = (f: string) => {
        setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
    };

    const clearFilters = () => setActiveFilters([]);

    const filtered = DEMO_PRODUCTS.filter(p => {
        if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.brand.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-3)' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <input
                    ref={inputRef}
                    className="input"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Tìm gọng kính, thương hiệu..."
                    style={{ paddingLeft: 44, fontSize: 16, borderRadius: 'var(--radius-xl)', minHeight: 48 }}
                    autoComplete="off"
                    enterKeyHint="search"
                />
                {query && (
                    <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                )}
            </div>

            {/* Quick Filters + Filter button */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-4)', scrollbarWidth: 'none' }}>
                <button className={`sf-chip ${showSheet ? 'sf-chip--active' : ''}`} onClick={() => setShowSheet(true)} style={{ gap: 6 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                    Lọc {activeFilters.length > 0 && `(${activeFilters.length})`}
                </button>
                {QUICK_FILTERS.map(f => (
                    <button key={f} className={`sf-chip ${activeFilters.includes(f) ? 'sf-chip--active' : ''}`} onClick={() => toggleFilter(f)}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Active filter summary */}
            {activeFilters.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Đã lọc:</span>
                    {activeFilters.map(f => (
                        <span key={f} className="badge badge-gold" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => toggleFilter(f)}>{f} ✕</span>
                    ))}
                    <button onClick={clearFilters} style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, minHeight: 32, padding: '0 var(--space-2)' }}>Xóa lọc</button>
                </div>
            )}

            {/* Sort + Results count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> kết quả
                </p>
                <select className="input" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-xs)', minHeight: 36 }}>
                    <option value="popular">Phổ biến</option>
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá ↑</option>
                    <option value="price-desc">Giá ↓</option>
                    <option value="rating">Đánh giá</option>
                </select>
            </div>

            {/* Product Grid — 2 columns mobile */}
            {filtered.length > 0 ? (
                <div className="sf-product-grid">
                    {filtered.map(p => {
                        const discount = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
                        return (
                            <Link key={p.slug} href={`/p/${p.slug}`} className="card" style={{ padding: 0, textDecoration: 'none', overflow: 'hidden' }}>
                                <div style={{ aspectRatio: '1', background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, position: 'relative' }}>
                                    👓
                                    {discount > 0 && <span className="badge badge-error" style={{ position: 'absolute', top: 8, left: 8, fontSize: 10 }}>-{discount}%</span>}
                                </div>
                                <div style={{ padding: 'var(--space-3)' }}>
                                    <p style={{ fontSize: 10, color: 'var(--gold-400)', fontWeight: 600, textTransform: 'uppercase' }}>{p.brand}</p>
                                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: '2px 0 4px', lineHeight: 1.3 }}>{p.tagline}</p>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: 4 }}>
                                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)' }}>{formatVND(p.price)}</span>
                                        {p.compareAt && <span style={{ fontSize: 10, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatVND(p.compareAt)}</span>}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
                    <p style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>🔍</p>
                    <p style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Không tìm thấy kết quả</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 4 }}>Thử từ khóa khác hoặc bỏ bớt bộ lọc</p>
                </div>
            )}

            {/* ═══ Bottom Sheet Filter ═══ */}
            <div className={`sf-sheet-overlay ${showSheet ? 'open' : ''}`} onClick={() => setShowSheet(false)}>
                <div className="sf-sheet" onClick={e => e.stopPropagation()}>
                    <div className="sf-sheet__handle" />
                    <div className="sf-sheet__title">Bộ lọc</div>

                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>Kiểu gọng</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                            {FRAME_SHAPES.map(s => (
                                <button key={s} className={`sf-chip ${activeFilters.includes(s) ? 'sf-chip--active' : ''}`} onClick={() => toggleFilter(s)}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>Chất liệu</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                            {MATERIALS.map(s => (
                                <button key={s} className={`sf-chip ${activeFilters.includes(s) ? 'sf-chip--active' : ''}`} onClick={() => toggleFilter(s)}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>Thương hiệu</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                            {BRANDS.map(s => (
                                <button key={s} className={`sf-chip ${activeFilters.includes(s) ? 'sf-chip--active' : ''}`} onClick={() => toggleFilter(s)}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--text-secondary)' }}>Khoảng giá</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                            {PRICE_RANGES.map(s => (
                                <button key={s} className={`sf-chip ${activeFilters.includes(s) ? 'sf-chip--active' : ''}`} onClick={() => toggleFilter(s)}>{s}</button>
                            ))}
                        </div>
                    </div>

                    <div className="sf-sheet__actions">
                        <button className="btn" onClick={clearFilters}>Xóa tất cả</button>
                        <button className="btn btn-primary" onClick={() => setShowSheet(false)}>Áp dụng ({activeFilters.length})</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
