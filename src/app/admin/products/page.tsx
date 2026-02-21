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

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    // Fetch products from API
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

    // Toggle select
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const toggleSelectAll = () => {
        if (selectedIds.size === products.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(products.map(p => p.id)));
        }
    };

    // Bulk actions
    const bulkPublish = async () => {
        let count = 0;
        for (const id of selectedIds) {
            try {
                await fetch('/api/admin/products', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, action: 'publish' }),
                });
                count++;
            } catch { /* skip */ }
        }
        showToast(`✅ Đã publish ${count} sản phẩm`);
        setSelectedIds(new Set());
        fetchProducts();
    };

    const bulkUnpublish = async () => {
        let count = 0;
        for (const id of selectedIds) {
            try {
                await fetch('/api/admin/products', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, status: 'DRAFT' }),
                });
                count++;
            } catch { /* skip */ }
        }
        showToast(`✅ Đã ẩn ${count} sản phẩm`);
        setSelectedIds(new Set());
        fetchProducts();
    };

    const exportCSV = () => {
        window.open('/api/admin/products/bulk', '_blank');
        showToast('📥 Đang tải CSV...');
    };

    const handleSort = (col: string) => {
        if (sortBy === col) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(col);
            setSortOrder('desc');
        }
    };

    const SortIcon = ({ col }: { col: string }) => (
        <span style={{ opacity: sortBy === col ? 1 : 0.3, fontSize: 10, marginLeft: 4 }}>
            {sortBy === col ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
    );

    return (
        <div className="animate-in">
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', background: 'rgba(34,197,94,0.9)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{toast}</div>}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div style={{ flex: '1 1 200px' }}>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>📦 Sản phẩm</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Quản lý toàn bộ sản phẩm kính mắt</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', flex: '0 0 auto' }}>
                    <button className="btn" onClick={exportCSV} style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}>📥 Xuất CSV</button>
                    <Link href="/admin/products/create" className="btn btn-primary" style={{ fontWeight: 700, textDecoration: 'none', fontSize: 'var(--text-xs)', padding: '6px 12px' }}>
                        + Đăng sản phẩm mới
                    </Link>
                </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {[
                    { label: 'Tổng', value: totalProducts, icon: '📦', color: 'var(--text-primary)' },
                    { label: 'Đang bán', value: activeCount, icon: '🟢', color: 'var(--success)' },
                    { label: 'Nháp', value: draftCount, icon: '⏸️', color: 'var(--warning)' },
                    { label: 'Hết hàng', value: lowStockCount, icon: '⚠️', color: 'var(--error)' },
                ].map(s => (
                    <div key={s.label} className="card" style={{ padding: 'var(--space-2) var(--space-2)', textAlign: 'center' }}>
                        <div style={{ fontSize: 16 }}>{s.icon}</div>
                        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="admin-filter-scroll" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
                <input className="input" placeholder="🔍 Tìm tên, SKU..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ flex: '1 1 200px', minWidth: 0, maxWidth: 300, padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }} />
                {[{ v: 'all', l: 'Tất cả', c: totalProducts }, { v: 'ACTIVE', l: '🟢 Đang bán', c: activeCount }, { v: 'DRAFT', l: '⏸️ Nháp', c: draftCount }].map(f => (
                    <button key={f.v} className="btn" onClick={() => setFilter(f.v)}
                        style={{
                            background: filter === f.v ? 'var(--gold-500)' : 'var(--bg-secondary)',
                            color: filter === f.v ? '#000' : 'var(--text-secondary)',
                            fontWeight: filter === f.v ? 700 : 500,
                            fontSize: 'var(--text-sm)', padding: '6px 14px', borderRadius: 'var(--radius-md)',
                            border: filter === f.v ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)',
                        }}>
                        {f.l} ({f.c})
                    </button>
                ))}
            </div>

            {/* Bulk actions bar */}
            {selectedIds.size > 0 && (
                <div className="card" style={{
                    padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-3)',
                    background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap',
                }}>
                    <strong style={{ fontSize: 'var(--text-sm)' }}>📋 Đã chọn {selectedIds.size} sản phẩm</strong>
                    <button className="btn btn-sm" onClick={bulkPublish} style={{ fontSize: 'var(--text-xs)' }}>🟢 Publish</button>
                    <button className="btn btn-sm" onClick={bulkUnpublish} style={{ fontSize: 'var(--text-xs)' }}>⏸️ Ẩn</button>
                    <button className="btn btn-sm" onClick={() => setSelectedIds(new Set())} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>✕ Bỏ chọn</button>
                </div>
            )}

            {/* Products table */}
            <div className="card" style={{ overflow: 'auto' }}>
                {loading ? (
                    <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                        ⏳ Đang tải sản phẩm...
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}>
                                    <input type="checkbox" checked={selectedIds.size === products.length && products.length > 0}
                                        onChange={toggleSelectAll} />
                                </th>
                                <th style={{ width: 50 }}>Ảnh</th>
                                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                    Sản phẩm <SortIcon col="name" />
                                </th>
                                <th>Brand</th>
                                <th>SKU</th>
                                <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                                    Giá <SortIcon col="price" />
                                </th>
                                <th onClick={() => handleSort('stockQty')} style={{ cursor: 'pointer' }}>
                                    Tồn kho <SortIcon col="stockQty" />
                                </th>
                                <th>Trạng thái</th>
                                <th onClick={() => handleSort('updatedAt')} style={{ cursor: 'pointer' }}>
                                    Cập nhật <SortIcon col="updatedAt" />
                                </th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={10} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                                        {search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
                                        <br />
                                        <Link href="/admin/products/create" style={{ color: 'var(--gold-400)', marginTop: 'var(--space-2)', display: 'inline-block' }}>
                                            ➕ Tạo sản phẩm đầu tiên
                                        </Link>
                                    </td>
                                </tr>
                            ) : products.map(p => {
                                const img = getMainImage(p);
                                const stock = getTotalStock(p);
                                const minPrice = getMinPrice(p);
                                const maxPrice = getMaxPrice(p);
                                const isLowStock = stock > 0 && stock <= 5;
                                const isSelected = selectedIds.has(p.id);

                                return (
                                    <tr key={p.id} style={{ background: isSelected ? 'rgba(212,175,55,0.05)' : undefined }}>
                                        <td>
                                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)} />
                                        </td>
                                        <td>
                                            {img ? (
                                                <img src={img} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                            ) : (
                                                <div style={{ width: 40, height: 40, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👓</div>
                                            )}
                                        </td>
                                        <td>
                                            <Link href={`/admin/products/create?id=${p.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                                                {p.name}
                                            </Link>
                                            {p.category && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.category}</div>}
                                            {p.variants.length > 1 && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)' }}>{p.variants.length} biến thể</div>}
                                        </td>
                                        <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{p.brand || '—'}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>
                                            {p.variants[0]?.sku || '—'}
                                            {p.variants.length > 1 && <div style={{ color: 'var(--text-muted)' }}>+{p.variants.length - 1}</div>}
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: 'var(--gold-400)' }}>
                                                {formatVND(minPrice)}
                                            </span>
                                            {minPrice !== maxPrice && (
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                                    → {formatVND(maxPrice)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                color: stock === 0 ? 'var(--error)' : isLowStock ? 'var(--warning)' : 'var(--success)',
                                                fontWeight: 600,
                                            }}>
                                                {stock}
                                            </span>
                                            {isLowStock && <span style={{ fontSize: 10, marginLeft: 4 }}>⚠️</span>}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '3px 10px', borderRadius: 99, fontSize: 'var(--text-xs)', fontWeight: 600,
                                                background: p.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                                                color: p.status === 'ACTIVE' ? '#22c55e' : '#f59e0b',
                                            }}>
                                                {p.status === 'ACTIVE' ? '🟢 Đang bán' : '⏸️ Nháp'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <Link href={`/admin/products/create?id=${p.id}`} className="btn btn-sm btn-ghost" title="Sửa" style={{ textDecoration: 'none' }}>✏️</Link>
                                                <Link href={`/p/${p.slug}`} className="btn btn-sm btn-ghost" target="_blank" title="Xem" style={{ textDecoration: 'none' }}>👁️</Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
