'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface Variant { sku: string; frameColor: string; lensColor: string | null; price: number; compareAtPrice: number | null; stockQty: number; reservedQty: number }
interface Product {
    id: string; name: string; slug: string; brand: string | null; category: string | null;
    status: string; tags: string[]; createdAt: string; updatedAt: string;
    frameShape: string | null; material: string | null; gender: string | null;
    variants: Variant[]; media: { url: string; type: string; sort: number }[];
    publishedAt: string | null;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState('');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [openKebab, setOpenKebab] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search, sortBy, sortOrder,
                ...(filter !== 'all' ? { status: filter } : {}),
            });
            const res = await fetch(`/api/admin/products?${params}`);
            const data = await res.json();
            setProducts(data.products || []);
        } catch {
            showToast('⚠️ Lỗi tải sản phẩm');
        }
        setLoading(false);
    }, [search, filter, sortBy, sortOrder]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Computed
    const totalProducts = products.length;
    const activeCount = products.filter(p => p.status === 'ACTIVE').length;
    const draftCount = products.filter(p => p.status === 'DRAFT').length;
    const lowStockCount = products.filter(p => p.variants.some(v => v.stockQty <= 5)).length;

    // Helpers
    const getMainImage = (p: Product) => p.media?.find(m => m.sort === 0)?.url || null;
    const getTotalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stockQty, 0);
    const getMinPrice = (p: Product) => Math.min(...p.variants.map(v => v.price));
    const getMaxPrice = (p: Product) => Math.max(...p.variants.map(v => v.price));

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        if (selectedIds.size === products.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(products.map(p => p.id)));
    };

    // Bulk actions (optimistic)
    const bulkPublish = async () => {
        const ids = Array.from(selectedIds);
        const prev = [...products];
        // Optimistic update
        setProducts(p => p.map(prod => ids.includes(prod.id) ? { ...prod, publishedAt: new Date().toISOString(), status: 'ACTIVE' } : prod));
        setSelectedIds(new Set());
        showToast(`✅ Đã publish ${ids.length} sản phẩm`);
        // Sync with server
        try {
            for (const id of ids) {
                await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'publish' }) });
            }
        } catch { setProducts(prev); showToast('⚠️ Lỗi — đã hoàn tác'); }
    };

    const bulkUnpublish = async () => {
        const ids = Array.from(selectedIds);
        const prev = [...products];
        // Optimistic update
        setProducts(p => p.map(prod => ids.includes(prod.id) ? { ...prod, publishedAt: null, status: 'DRAFT' } : prod));
        setSelectedIds(new Set());
        showToast(`✅ Đã ẩn ${ids.length} sản phẩm`);
        // Sync with server
        try {
            for (const id of ids) {
                await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'DRAFT' }) });
            }
        } catch { setProducts(prev); showToast('⚠️ Lỗi — đã hoàn tác'); }
    };

    const exportCSV = () => { window.open('/api/admin/products/bulk', '_blank'); showToast('📥 Đang tải CSV...'); };

    const handleSort = (col: string) => {
        if (sortBy === col) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortOrder('desc'); }
    };

    const SortIcon = ({ col }: { col: string }) => (
        <span style={{ opacity: sortBy === col ? 1 : 0.3, fontSize: 10, marginLeft: 4 }}>
            {sortBy === col ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
    );

    // Filter options for FilterBar CSS classes
    const filterOpts = [
        { value: 'all', label: 'Tất cả', count: totalProducts },
        { value: 'ACTIVE', label: '🟢 Đang bán', count: activeCount },
        { value: 'DRAFT', label: '⏸️ Nháp', count: draftCount },
    ];

    return (
        <div className="animate-in">
            {/* Toast */}
            {toast && (
                <div className="admin-toast admin-toast--visible" style={{ borderLeftColor: 'var(--success)' }}>
                    <span className="admin-toast__message">{toast}</span>
                </div>
            )}

            {/* ═══ Page Title + Actions ═══ */}
            <div className="admin-page-title">
                <nav className="admin-page-title__breadcrumb">
                    <a href="/admin" className="admin-page-title__breadcrumb-link">Admin</a>
                    <span className="admin-page-title__breadcrumb-sep">›</span>
                    <span className="admin-page-title__breadcrumb-current">Sản phẩm</span>
                </nav>
                <div className="admin-page-title__row">
                    <div className="admin-page-title__text">
                        <h1 className="admin-page-title__heading">📦 Sản phẩm</h1>
                        <p className="admin-page-title__subtitle">Quản lý toàn bộ sản phẩm kính mắt</p>
                    </div>
                    <div className="admin-page-title__actions">
                        <button className="btn" onClick={exportCSV} style={{ fontSize: 11, padding: '6px 12px', minHeight: 36 }}>📥 Xuất CSV</button>
                        <Link href="/admin/products/create" className="btn btn-primary" style={{ fontWeight: 700, textDecoration: 'none', fontSize: 11, padding: '6px 12px', minHeight: 36 }}>
                            + Đăng sản phẩm mới
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═══ Stat Cards ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {[
                    { label: 'Tổng', value: totalProducts, icon: '📦', color: 'var(--text-primary)' },
                    { label: 'Đang bán', value: activeCount, icon: '🟢', color: 'var(--success)' },
                    { label: 'Nháp', value: draftCount, icon: '⏸️', color: 'var(--warning)' },
                    { label: 'Hết hàng', value: lowStockCount, icon: '⚠️', color: 'var(--error)' },
                ].map(s => (
                    <div key={s.label} className="admin-stat-card" style={{ textAlign: 'center', padding: 'var(--space-2)' }}>
                        <div style={{ fontSize: 16 }}>{s.icon}</div>
                        <div className="admin-stat-card__value" style={{ fontSize: 'var(--text-lg)', color: s.color }}>{s.value}</div>
                        <div className="admin-stat-card__label">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ═══ Search + Filters ═══ */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    className="admin-datatable__search"
                    placeholder="🔍 Tìm tên, SKU..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: '1 1 160px', maxWidth: 240 }}
                />
                <div className="admin-filter-bar" style={{ marginBottom: 0, paddingBottom: 0 }}>
                    {filterOpts.map(f => (
                        <button key={f.value}
                            className={`admin-filter-bar__chip ${filter === f.value ? 'admin-filter-bar__chip--active' : ''}`}
                            onClick={() => setFilter(f.value)}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══ Bulk Actions ═══ */}
            {selectedIds.size > 0 && (
                <div className="admin-datatable__bulk-bar" style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'rgba(212,168,83,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(212,168,83,0.2)' }}>
                    <span className="admin-datatable__bulk-count">📋 {selectedIds.size} đã chọn</span>
                    <button className="admin-datatable__bulk-btn" onClick={bulkPublish}>🟢 Publish</button>
                    <button className="admin-datatable__bulk-btn" onClick={bulkUnpublish}>⏸️ Ẩn</button>
                    <button className="admin-datatable__bulk-btn" onClick={() => setSelectedIds(new Set())}>✕ Bỏ chọn</button>
                </div>
            )}

            {/* ═══ Card View (mobile) ═══ */}
            {loading ? (
                <div className="admin-datatable__skeleton">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="admin-datatable__skeleton-row">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="admin-datatable__skeleton-cell" />
                            ))}
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="admin-empty-state">
                    <span className="admin-empty-state__icon">📦</span>
                    <h3 className="admin-empty-state__title">{search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}</h3>
                    <Link href="/admin/products/create" className="btn btn-primary admin-empty-state__btn" style={{ textDecoration: 'none' }}>
                        ➕ Tạo sản phẩm đầu tiên
                    </Link>
                </div>
            ) : (
                <>
                    {/* Cards for mobile */}
                    <div className="admin-datatable__cards">
                        {products.map(p => {
                            const img = getMainImage(p);
                            const stock = getTotalStock(p);
                            const isLowStock = stock > 0 && stock <= 5;
                            return (
                                <div key={p.id} className={`admin-datatable__card ${selectedIds.has(p.id) ? 'admin-datatable__card--selected' : ''}`}>
                                    {/* Checkbox */}
                                    <input type="checkbox" className="admin-datatable__card-check" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} />
                                    {/* Image */}
                                    {img ? (
                                        <img src={img} alt={p.name} loading="lazy" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                                    ) : (
                                        <div style={{ width: 48, height: 48, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👓</div>
                                    )}
                                    <div className="admin-datatable__card-body">
                                        <Link href={`/admin/products/create?id=${p.id}`} className="admin-datatable__card-title" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>{p.name}</Link>
                                        <div className="admin-datatable__card-subtitle">{p.brand || '—'} · {p.variants[0]?.sku || '—'}</div>
                                        <div className="admin-datatable__card-fields">
                                            <div className="admin-datatable__card-field">
                                                <span className="admin-datatable__card-field-label">Giá</span>
                                                <span className="admin-datatable__card-field-value" style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{formatVND(getMinPrice(p))}</span>
                                            </div>
                                            <div className="admin-datatable__card-field">
                                                <span className="admin-datatable__card-field-label">Kho</span>
                                                <span className="admin-datatable__card-field-value" style={{ color: stock === 0 ? 'var(--error)' : isLowStock ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>{stock}{isLowStock && ' ⚠️'}</span>
                                            </div>
                                            <div className="admin-datatable__card-field">
                                                <span className="admin-datatable__card-field-label">Trạng thái</span>
                                                <span className="admin-datatable__card-field-value" style={{ color: p.status === 'ACTIVE' ? 'var(--success)' : 'var(--warning)' }}>{p.status === 'ACTIVE' ? '🟢 Bán' : '⏸️ Nháp'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Kebab */}
                                    <div className="admin-datatable__card-actions">
                                        <button className="admin-datatable__kebab" onClick={() => setOpenKebab(openKebab === p.id ? null : p.id)}>⋯</button>
                                        {openKebab === p.id && (
                                            <div className="admin-datatable__kebab-menu">
                                                <Link href={`/admin/products/create?id=${p.id}`} className="admin-datatable__kebab-item" style={{ textDecoration: 'none' }}>✏️ Sửa</Link>
                                                <Link href={`/p/${p.slug}`} target="_blank" className="admin-datatable__kebab-item" style={{ textDecoration: 'none' }}>👁️ Xem</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Table for desktop */}
                    <div className="admin-datatable__table-wrap">
                        <table className="admin-datatable__table">
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === products.length && products.length > 0} onChange={toggleSelectAll} /></th>
                                    <th style={{ width: 50 }}>Ảnh</th>
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Sản phẩm <SortIcon col="name" /></th>
                                    <th>Brand</th>
                                    <th>SKU</th>
                                    <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>Giá <SortIcon col="price" /></th>
                                    <th onClick={() => handleSort('stockQty')} style={{ cursor: 'pointer' }}>Tồn kho <SortIcon col="stockQty" /></th>
                                    <th>Trạng thái</th>
                                    <th onClick={() => handleSort('updatedAt')} style={{ cursor: 'pointer' }}>Cập nhật <SortIcon col="updatedAt" /></th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(p => {
                                    const img = getMainImage(p);
                                    const stock = getTotalStock(p);
                                    const minPrice = getMinPrice(p);
                                    const maxPrice = getMaxPrice(p);
                                    const isLowStock = stock > 0 && stock <= 5;
                                    const isSelected = selectedIds.has(p.id);
                                    return (
                                        <tr key={p.id} className={isSelected ? 'admin-datatable__row--selected' : ''}>
                                            <td><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)} /></td>
                                            <td>
                                                {img ? (
                                                    <img src={img} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                                ) : (
                                                    <div style={{ width: 40, height: 40, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👓</div>
                                                )}
                                            </td>
                                            <td>
                                                <Link href={`/admin/products/create?id=${p.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>{p.name}</Link>
                                                {p.category && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.category}</div>}
                                                {p.variants.length > 1 && <div style={{ fontSize: 11, color: 'var(--gold-400)' }}>{p.variants.length} biến thể</div>}
                                            </td>
                                            <td>{p.brand || '—'}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                                                {p.variants[0]?.sku || '—'}
                                                {p.variants.length > 1 && <div style={{ color: 'var(--text-muted)' }}>+{p.variants.length - 1}</div>}
                                            </td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: 'var(--gold-400)' }}>{formatVND(minPrice)}</span>
                                                {minPrice !== maxPrice && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>→ {formatVND(maxPrice)}</div>}
                                            </td>
                                            <td>
                                                <span style={{ color: stock === 0 ? 'var(--error)' : isLowStock ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                                                    {stock}
                                                </span>
                                                {isLowStock && <span style={{ fontSize: 10, marginLeft: 4 }}>⚠️</span>}
                                            </td>
                                            <td>
                                                <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: p.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: p.status === 'ACTIVE' ? '#22c55e' : '#f59e0b' }}>
                                                    {p.status === 'ACTIVE' ? '🟢 Đang bán' : '⏸️ Nháp'}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                                {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td>
                                                <div className="admin-datatable__card-actions" style={{ position: 'relative' }}>
                                                    <button className="admin-datatable__kebab" onClick={() => setOpenKebab(openKebab === p.id ? null : p.id)}>⋯</button>
                                                    {openKebab === p.id && (
                                                        <div className="admin-datatable__kebab-menu">
                                                            <Link href={`/admin/products/create?id=${p.id}`} className="admin-datatable__kebab-item" style={{ textDecoration: 'none' }}>✏️ Sửa</Link>
                                                            <Link href={`/p/${p.slug}`} target="_blank" className="admin-datatable__kebab-item" style={{ textDecoration: 'none' }}>👁️ Xem</Link>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
