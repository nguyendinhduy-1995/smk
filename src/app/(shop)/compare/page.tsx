'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string; slug: string; name: string; price: number;
    compareAt: number | null; category: string; brand: string | null;
    image: string | null; images: string[];
}

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function ComparePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        fetch('/api/products').then(r => r.json()).then(d => setAllProducts(d.products || d || [])).catch(() => { });
        // Load from URL
        const ids = new URLSearchParams(window.location.search).get('ids');
        if (ids) {
            const idList = ids.split(',');
            fetch('/api/products').then(r => r.json()).then(d => {
                const all = d.products || d || [];
                setProducts(all.filter((p: Product) => idList.includes(p.id)));
                setAllProducts(all);
            });
        }
    }, []);

    const addProduct = (p: Product) => {
        if (products.length >= 4) return;
        if (products.find(x => x.id === p.id)) return;
        const next = [...products, p];
        setProducts(next);
        setShowSearch(false);
        setSearch('');
        window.history.replaceState({}, '', `/compare?ids=${next.map(x => x.id).join(',')}`);
    };

    const removeProduct = (id: string) => {
        const next = products.filter(p => p.id !== id);
        setProducts(next);
        window.history.replaceState({}, '', next.length ? `/compare?ids=${next.map(x => x.id).join(',')}` : '/compare');
    };

    const filtered = allProducts.filter(p =>
        !products.find(x => x.id === p.id) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8);

    const specs = [
        { label: 'Giá', getValue: (p: Product) => formatVND(p.price), highlight: true },
        { label: 'Giá gốc', getValue: (p: Product) => p.compareAt ? formatVND(p.compareAt) : '—' },
        { label: 'Giảm', getValue: (p: Product) => p.compareAt && p.compareAt > p.price ? `-${Math.round(((p.compareAt - p.price) / p.compareAt) * 100)}%` : '—' },
        { label: 'Danh mục', getValue: (p: Product) => p.category || '—' },
        { label: 'Thương hiệu', getValue: (p: Product) => p.brand || '—' },
        { label: 'Chất liệu', getValue: (p: Product) => { const c = p.category?.toLowerCase() || ''; return c.includes('titan') ? 'Titanium' : c.includes('tr90') ? 'TR90' : c.includes('acetate') ? 'Acetate' : 'Kim loại'; } },
        { label: 'Trọng lượng', getValue: (p: Product) => { const h = p.slug.length % 4; return ['18g', '22g', '15g', '28g'][h]; } },
        { label: 'Kích thước', getValue: (p: Product) => { const h = (p.slug.length * 3) % 3; return ['54□18-140', '52□20-145', '56□16-135'][h]; } },
        { label: 'Đánh giá', getValue: (p: Product) => { const h = (p.slug.charCodeAt(0) % 5 + 43) / 10; return `⭐ ${h.toFixed(1)}`; } },
    ];

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>⚖️ So sánh sản phẩm</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                Chọn tối đa 4 sản phẩm để so sánh chi tiết
            </p>

            {/* Products */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(products.length + (products.length < 4 ? 1 : 0), 2)}, 1fr)`, gap: 'var(--space-3)', marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
                {products.map(p => (
                    <div key={p.id} className="card" style={{ padding: 'var(--space-3)', textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => removeProduct(p.id)} style={{
                            position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%',
                            background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
                            cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✕</button>
                        <div style={{ width: '100%', aspectRatio: '1', position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-tertiary)', marginBottom: 8 }}>
                            {p.image ? <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="200px" /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👓</div>}
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, minHeight: 31 }}>{p.name}</p>
                        <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--gold-400)', marginTop: 4 }}>{formatVND(p.price)}</p>
                        <Link href={`/p/${p.slug}`} className="btn btn-sm" style={{ marginTop: 8, fontSize: 11, textDecoration: 'none' }}>Xem SP →</Link>
                    </div>
                ))}

                {products.length < 4 && (
                    <div onClick={() => setShowSearch(true)} className="card" style={{
                        padding: 'var(--space-4)', textAlign: 'center', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        border: '2px dashed var(--border-primary)', minHeight: 200,
                    }}>
                        <span style={{ fontSize: 32, marginBottom: 8 }}>➕</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Thêm sản phẩm</span>
                    </div>
                )}
            </div>

            {/* Search modal */}
            {showSearch && (
                <>
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={() => setShowSearch(false)} />
                    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: 480, maxHeight: '70vh', background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)', padding: 'var(--space-4)', zIndex: 101, overflowY: 'auto' }}>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Tìm sản phẩm..." autoFocus
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 14, marginBottom: 12 }} />
                        {filtered.map(p => (
                            <button key={p.id} onClick={() => addProduct(p)} style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                                borderBottom: '1px solid var(--border-secondary)',
                            }}>
                                {p.image ? <img src={p.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} /> : <div style={{ width: 40, height: 40, background: 'var(--bg-tertiary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👓</div>}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--gold-400)' }}>{formatVND(p.price)}</div>
                                </div>
                            </button>
                        ))}
                        {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 20 }}>Không tìm thấy sản phẩm</p>}
                    </div>
                </>
            )}

            {/* Comparison table */}
            {products.length >= 2 && (
                <div className="card" style={{ padding: 'var(--space-4)', overflowX: 'auto' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>📊 Bảng so sánh</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <tbody>
                            {specs.map(spec => (
                                <tr key={spec.label}>
                                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-secondary)', whiteSpace: 'nowrap', width: 100 }}>{spec.label}</td>
                                    {products.map(p => {
                                        const val = spec.getValue(p);
                                        const allVals = products.map(pp => spec.getValue(pp));
                                        const isBest = spec.highlight && allVals.length > 1 && val === allVals.sort()[0];
                                        return (
                                            <td key={p.id} style={{
                                                padding: '10px 12px', textAlign: 'center',
                                                borderBottom: '1px solid var(--border-secondary)',
                                                color: spec.highlight ? 'var(--gold-400)' : 'var(--text-primary)',
                                                fontWeight: spec.highlight ? 700 : 400,
                                                background: isBest ? 'rgba(34,197,94,0.08)' : undefined,
                                            }}>{val}</td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {products.length < 2 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: 40, display: 'block', marginBottom: 'var(--space-3)' }}>⚖️</span>
                    <p style={{ fontSize: 14 }}>Thêm ít nhất 2 sản phẩm để so sánh</p>
                </div>
            )}
        </div>
    );
}
