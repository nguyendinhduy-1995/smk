'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import allProducts from '@/data/products.json';

const FRAME_SHAPES = ['Vuông', 'Tròn', 'Oval', 'Cat-Eye', 'Aviator', 'Chữ nhật', 'Hình học', 'Browline'];
const MATERIALS = ['Titanium', 'TR90', 'Acetate', 'Kim loại', 'Mixed'];
const PRICE_RANGES = ['Dưới 500K', '500K-1 triệu', '1-3 triệu', '3-5 triệu', 'Trên 5 triệu'];
const BRANDS = ['Camel', 'Louisika', 'Farzin', 'DI&J', 'Sedonna', 'Kenzo', 'Flowers', 'Onassis', 'Nikon'];

const QUICK_FILTERS = ['🔥 Bán chạy', '🆕 Mới về', '🏷️ Sale', '👓 Kính cận', '🕶️ Kính râm'];

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const CATALOG = (allProducts as any[]).map(p => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand || null,
    price: p.price,
    compareAt: p.compareAt || null,
    image: p.image || null,
    category: p.category || '',
}));

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

    const filtered = CATALOG.filter(p => {
        if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !(p.brand || '').toLowerCase().includes(query.toLowerCase())) return false;
        // Quick filter matching
        if (activeFilters.length > 0) {
            const matchesBrand = activeFilters.some(f => BRANDS.includes(f) && p.brand === f);
            const matchesQuick = activeFilters.some(f => QUICK_FILTERS.includes(f));
            const matchesShape = activeFilters.some(f => FRAME_SHAPES.includes(f) && p.name.toLowerCase().includes(f.toLowerCase()));
            if (!matchesBrand && !matchesQuick && !matchesShape) return false;
        }
        return true;
    }).sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        return 0;
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
                            <div key={p.slug} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <Link href={`/p/${p.slug}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ aspectRatio: '1', background: 'var(--bg-tertiary)', position: 'relative', overflow: 'hidden' }}>
                                        {p.image ? (
                                            <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👓</div>
                                        )}
                                        {discount > 0 && (
                                            <span style={{
                                                position: 'absolute', top: 8, left: 8, zIndex: 1,
                                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                                background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                                color: '#fff', fontSize: 12, fontWeight: 800,
                                                letterSpacing: '0.02em', lineHeight: 1,
                                                boxShadow: '0 2px 8px rgba(220,38,38,0.35)',
                                            }}>
                                                ↓{discount}%
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ padding: 'var(--space-3)' }}>
                                        {p.brand && <p style={{ fontSize: 10, color: 'var(--gold-400)', fontWeight: 600, textTransform: 'uppercase' }}>{p.brand}</p>}
                                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: 4 }}>
                                            <span style={{ fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--gold-400)' }}>{formatVND(p.price)}</span>
                                            {p.compareAt && (
                                                <span style={{ fontSize: 11, color: 'var(--error)', textDecoration: 'line-through', opacity: 0.8 }}>{formatVND(p.compareAt)}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                                <div style={{ padding: '0 var(--space-3) var(--space-3)' }}>
                                    <Link
                                        href={`/p/${p.slug}?buy=1`}
                                        className="btn btn-primary btn-sm"
                                        style={{
                                            width: '100%', minHeight: 34, fontSize: 'var(--text-xs)', fontWeight: 700,
                                            textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            borderRadius: 'var(--radius-md)', gap: 4,
                                        }}
                                    >
                                        Mua ngay ⚡
                                    </Link>
                                </div>
                            </div>
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
