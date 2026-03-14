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
interface Category { id: string; value: string; label: string; icon: string }

const EMOJI_OPTIONS = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [catFilter, setCatFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [toast, setToast] = useState('');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [openKebab, setOpenKebab] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editName, setEditName] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editBrand, setEditBrand] = useState('');
    const [editStatus, setEditStatus] = useState('DRAFT');
    const [editPrice, setEditPrice] = useState<number | ''>('');
    const [editSaving, setEditSaving] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ ids: string[]; names: string[]; deleting: boolean } | null>(null);

    // Bulk background removal state
    const [bgRemoving, setBgRemoving] = useState(false);
    const [bgResult, setBgResult] = useState<{ message: string; processed: number; errors: number; total: number } | null>(null);
    const [bgProgress, setBgProgress] = useState<{ current: number; total: number; productName: string; percent: number; successCount: number; errorCount: number } | null>(null);
    const [metaExporting, setMetaExporting] = useState(false);

    // Categories state
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCatLabel, setNewCatLabel] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('');
    const [editingCat, setEditingCat] = useState<string | null>(null);
    const [editCatLabel, setEditCatLabel] = useState('');
    const [editCatIcon, setEditCatIcon] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    // ═══ Fetch categories ═══
    const fetchCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            setCategories(data.categories || []);
        } catch { /* silent */ }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const addCategory = async () => {
        if (!newCatLabel.trim()) return;
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label: newCatLabel.trim(), icon: newCatIcon }),
            });
            const data = await res.json();
            if (data.error) { showToast(`${data.error}`); return; }
            setCategories(prev => [...prev, data.category]);
            setNewCatLabel(''); setNewCatIcon('');
            showToast(`Đã thêm "${data.category.label}"`);
        } catch { showToast('Lỗi thêm danh mục'); }
    };

    const updateCategory = async (id: string) => {
        if (!editCatLabel.trim()) return;
        try {
            await fetch('/api/admin/categories', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, label: editCatLabel.trim(), icon: editCatIcon }),
            });
            setCategories(prev => prev.map(c => c.id === id ? { ...c, label: editCatLabel.trim(), icon: editCatIcon } : c));
            setEditingCat(null);
            showToast('Đã cập nhật danh mục');
        } catch { showToast('Lỗi cập nhật'); }
    };

    const deleteCat = async (id: string, label: string) => {
        const count = categoryCounts[categories.find(c => c.id === id)?.value || ''] || 0;
        if (!confirm(`Xóa danh mục "${label}"?${count > 0 ? `\n\nCó ${count} sản phẩm trong danh mục này.` : ''}`)) return;
        try {
            await fetch('/api/admin/categories', {
                method: 'DELETE', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            setCategories(prev => prev.filter(c => c.id !== id));
            showToast(`Đã xóa "${label}"`);
        } catch { showToast('Lỗi xóa'); }
    };

    // ═══ Fetch products ═══
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
        } catch { showToast('Lỗi tải sản phẩm'); }
        setLoading(false);
    }, [search, filter, sortBy, sortOrder]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const filteredProducts = catFilter === 'all' ? products : products.filter(p => p.category === catFilter);

    const totalProducts = products.length;
    const activeCount = products.filter(p => p.status === 'ACTIVE').length;
    const draftCount = products.filter(p => p.status === 'DRAFT').length;
    const lowStockCount = products.filter(p => p.variants.some(v => v.stockQty <= 5)).length;

    const categoryCounts: Record<string, number> = {};
    for (const p of products) {
        const cat = p.category || 'Uncategorized';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    const getMainImage = (p: Product) => p.media?.find(m => m.sort === 0)?.url || null;
    const getTotalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stockQty, 0);
    const getMinPrice = (p: Product) => Math.min(...p.variants.map(v => v.price));
    const getMaxPrice = (p: Product) => Math.max(...p.variants.map(v => v.price));
    const getCategoryLabel = (value: string | null) => categories.find(c => c.value === value)?.label || value || 'Chưa phân loại';
    const getCategoryIcon = (value: string | null) => categories.find(c => c.value === value)?.icon || '';

    const toggleSelect = (id: string) => { setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
    const toggleSelectAll = () => { selectedIds.size === filteredProducts.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(filteredProducts.map(p => p.id))); };

    const bulkPublish = async () => {
        const ids = Array.from(selectedIds); const prev = [...products];
        setProducts(p => p.map(prod => ids.includes(prod.id) ? { ...prod, publishedAt: new Date().toISOString(), status: 'ACTIVE' } : prod));
        setSelectedIds(new Set()); showToast(`Đã publish ${ids.length} SP`);
        try { for (const id of ids) await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'publish' }) }); }
        catch { setProducts(prev); showToast('Lỗi — đã hoàn tác'); }
    };

    const bulkUnpublish = async () => {
        const ids = Array.from(selectedIds); const prev = [...products];
        setProducts(p => p.map(prod => ids.includes(prod.id) ? { ...prod, publishedAt: null, status: 'DRAFT' } : prod));
        setSelectedIds(new Set()); showToast(`Đã ẩn ${ids.length} SP`);
        try { for (const id of ids) await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status: 'DRAFT' }) }); }
        catch { setProducts(prev); showToast('Lỗi — đã hoàn tác'); }
    };

    const deleteProduct = (id: string, name: string) => {
        setOpenKebab(null);
        setDeleteConfirm({ ids: [id], names: [name], deleting: false });
    };

    const bulkDelete = () => {
        const ids = Array.from(selectedIds);
        const names = ids.map(id => products.find(p => p.id === id)?.name || 'SP').slice(0, 5);
        setDeleteConfirm({ ids, names, deleting: false });
    };

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        setDeleteConfirm(prev => prev ? { ...prev, deleting: true } : null);
        const { ids } = deleteConfirm;
        const prev = [...products];
        setProducts(p => p.filter(prod => !ids.includes(prod.id)));
        setSelectedIds(new Set());
        try {
            const res = await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, permanent: true }) });
            const data = await res.json();
            showToast(data.message || `Đã xóa ${data.deleted || ids.length} SP`);
        } catch { setProducts(prev); showToast('Lỗi xóa — đã hoàn tác'); }
        setDeleteConfirm(null);
    };

    const startEdit = (p: Product) => {
        setEditingProduct(p); setEditName(p.name); setEditCategory(p.category || ''); setEditBrand(p.brand || '');
        setEditStatus(p.status); setEditPrice(p.variants?.[0]?.price ?? ''); setOpenKebab(null);
    };

    const saveEdit = async () => {
        if (!editingProduct) return;
        setEditSaving(true);
        try {
            const patchBody: Record<string, unknown> = { id: editingProduct.id, name: editName, category: editCategory, brand: editBrand, status: editStatus };
            if (editPrice !== '' && Number(editPrice) > 0) patchBody.price = Number(editPrice);
            await fetch('/api/admin/products', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patchBody),
            });
            setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
                ...p, name: editName, category: editCategory, brand: editBrand, status: editStatus,
                publishedAt: editStatus === 'ACTIVE' ? (p.publishedAt || new Date().toISOString()) : null,
                variants: editPrice !== '' ? p.variants.map(v => ({ ...v, price: Number(editPrice) })) : p.variants,
            } : p));
            showToast('Đã cập nhật'); setEditingProduct(null);
        } catch { showToast('Lỗi cập nhật'); }
        setEditSaving(false);
    };

    const exportCSV = () => { window.open('/api/admin/products/bulk', '_blank'); showToast('Đang tải CSV...'); };

    const exportMeta = async () => {
        if (metaExporting) return;
        setMetaExporting(true);
        try {
            const res = await fetch('/api/admin/products/meta-export');
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Lỗi server' }));
                showToast(`Lỗi: ${errData.error || 'Không thể xuất catalog'}`);
                setMetaExporting(false);
                return;
            }
            const exportCount = res.headers.get('X-Export-Count') || '?';
            const skippedCount = res.headers.get('X-Skipped-Count') || '0';
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'smk_meta_catalog_export.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`✅ Đã xuất ${exportCount} SP cho Meta Catalog${Number(skippedCount) > 0 ? ` (${skippedCount} bỏ qua)` : ''}`);
        } catch {
            showToast('Lỗi kết nối server');
        }
        setMetaExporting(false);
    };

    const handleSort = (col: string) => { if (sortBy === col) setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); else { setSortBy(col); setSortOrder('desc'); } };
    const SortIcon = ({ col }: { col: string }) => (<span style={{ opacity: sortBy === col ? 1 : 0.3, fontSize: 10, marginLeft: 4 }}>{sortBy === col ? (sortOrder === 'asc' ? '▲' : '▼') : '⇅'}</span>);

    const bulkRemoveBg = async (force = false) => {
        if (bgRemoving) return;
        setBgRemoving(true); setBgResult(null); setBgProgress(null);
        let successCount = 0;
        let errorCount = 0;
        try {
            const res = await fetch('/api/admin/remove-bg/bulk', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ force }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Lỗi server' }));
                showToast(`Lỗi: ${errData.error || 'Lỗi không xác định'}`);
                setBgRemoving(false);
                return;
            }
            const reader = res.body?.getReader();
            if (!reader) { showToast('Không thể đọc stream'); setBgRemoving(false); return; }
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const event = JSON.parse(line.slice(6));
                        if (event.type === 'init') {
                            setBgProgress({ current: 0, total: event.total, productName: 'Đang chuẩn bị...', percent: 0, successCount: 0, errorCount: 0 });
                            if (event.total === 0) {
                                showToast('Tất cả sản phẩm đã có ảnh tách nền!');
                            }
                        } else if (event.type === 'progress') {
                            if (event.status === 'ok') successCount++;
                            else if (event.status === 'error') errorCount++;
                            setBgProgress({
                                current: event.current,
                                total: event.total,
                                productName: event.productName,
                                percent: Math.round((event.current / event.total) * 100),
                                successCount,
                                errorCount,
                            });
                        } else if (event.type === 'done') {
                            setBgResult({ message: event.message, processed: event.processed, errors: event.errors || 0, total: event.total });
                            showToast(event.message);
                        } else if (event.type === 'error') {
                            showToast(`Lỗi: ${event.message}`);
                        }
                    } catch { /* skip bad JSON */ }
                }
            }
        } catch { showToast('Lỗi kết nối server'); }
        setBgRemoving(false); setBgProgress(null);
    };

    const filterOpts = [
        { value: 'all', label: 'Tất cả', count: totalProducts },
        { value: 'ACTIVE', label: 'Đang bán', count: activeCount },
        { value: 'DRAFT', label: 'Nháp', count: draftCount },
    ];

    return (
        <div className="animate-in">
            {toast && (<div className="admin-toast admin-toast--visible" style={{ borderLeftColor: 'var(--success)' }}><span className="admin-toast__message">{toast}</span></div>)}

            {/* ═══ Page Title + Actions ═══ */}
            <div className="admin-page-title">
                <nav className="admin-page-title__breadcrumb">
                    <a href="/admin" className="admin-page-title__breadcrumb-link">Admin</a>
                    <span className="admin-page-title__breadcrumb-sep">›</span>
                    <span className="admin-page-title__breadcrumb-current">Sản phẩm</span>
                </nav>
                <div className="admin-page-title__row">
                    <div className="admin-page-title__text">
                        <h1 className="admin-page-title__heading">Sản phẩm</h1>
                        <p className="admin-page-title__subtitle">Quản lý toàn bộ sản phẩm kính mắt</p>
                    </div>
                    <div className="admin-page-title__actions">
                        <button className="btn" onClick={() => setShowCategories(!showCategories)} style={{ fontSize: 11, padding: '6px 12px', minHeight: 36, background: showCategories ? 'rgba(212,168,83,0.15)' : undefined, color: showCategories ? 'var(--gold-400)' : undefined }}>Danh mục</button>
                        <button className="btn" onClick={exportCSV} style={{ fontSize: 11, padding: '6px 12px', minHeight: 36 }}>Xuất CSV</button>
                        <button className="btn" onClick={exportMeta} disabled={metaExporting} style={{ fontSize: 11, padding: '6px 12px', minHeight: 36, background: metaExporting ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)', color: metaExporting ? 'var(--text-muted)' : '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', cursor: metaExporting ? 'wait' : 'pointer' }}>
                            {metaExporting ? '⏳ Đang xuất...' : '📘 Export Meta'}
                        </button>
                        <button className="btn" onClick={() => bulkRemoveBg(false)} disabled={bgRemoving} style={{ fontSize: 11, padding: '6px 12px', minHeight: 36, background: bgRemoving ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.08)', color: bgRemoving ? 'var(--text-muted)' : '#a78bfa', border: '1px solid rgba(139,92,246,0.2)', cursor: bgRemoving ? 'wait' : 'pointer' }}>
                            {bgRemoving ? '⏳ Đang tách nền...' : '✨ Tách nền AI'}
                        </button>
                        <Link href="/admin/products/create" className="btn btn-primary" style={{ fontWeight: 700, textDecoration: 'none', fontSize: 11, padding: '6px 12px', minHeight: 36 }}>+ Đăng SP mới</Link>
                    </div>
                </div>
            </div>

            {/* ═══ Background Removal Progress Bar ═══ */}
            {bgProgress && bgRemoving && (
                <div style={{
                    marginBottom: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)', background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.2)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                                background: '#a78bfa', animation: 'pulse 1.5s ease-in-out infinite',
                            }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa' }}>
                                Đang tách nền... {bgProgress.current}/{bgProgress.total}
                            </span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa' }}>{bgProgress.percent}%</span>
                    </div>
                    {/* Progress bar track */}
                    <div style={{
                        width: '100%', height: 8, borderRadius: 99,
                        background: 'rgba(139,92,246,0.12)', overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${bgProgress.percent}%`, height: '100%', borderRadius: 99,
                            background: 'linear-gradient(90deg, #8b5cf6, #a78bfa, #c4b5fd)',
                            transition: 'width 0.5s ease-out',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s linear infinite',
                        }} />
                    </div>
                    {/* Product name + counters */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            🖼 {bgProgress.productName}
                        </span>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                            {bgProgress.successCount > 0 && (
                                <span style={{ color: '#22c55e' }}>✓ {bgProgress.successCount}</span>
                            )}
                            {bgProgress.errorCount > 0 && (
                                <span style={{ color: '#f59e0b' }}>✗ {bgProgress.errorCount}</span>
                            )}
                        </div>
                    </div>
                    <style>{`
                        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                    `}</style>
                </div>
            )}

            {/* ═══ Bulk BG Result Banner ═══ */}
            {bgResult && (
                <div style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', background: bgResult.errors > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${bgResult.errors > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(34,197,94,0.2)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ fontSize: 13 }}>
                        <strong style={{ color: bgResult.errors > 0 ? '#f59e0b' : '#22c55e' }}>✨ {bgResult.message}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" onClick={() => bulkRemoveBg(true)} style={{ fontSize: 10, padding: '4px 10px' }}>🔄 Chạy lại tất cả</button>
                        <button onClick={() => setBgResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: 0 }}>✕</button>
                    </div>
                </div>
            )}

            {/* ═══ Categories Manager ═══ */}
            {showCategories && (
                <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, margin: 0 }}>Quản lý danh mục</h3>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{categories.length} danh mục</span>
                    </div>

                    {/* Add new */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                        <select value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)}
                            style={{ width: 50, padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', fontSize: 16, textAlign: 'center', cursor: 'pointer' }}>
                            {EMOJI_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <input type="text" value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)}
                            placeholder="Tên danh mục mới..." onKeyDown={e => e.key === 'Enter' && addCategory()}
                            style={{ flex: '1 1 160px', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
                        <button onClick={addCategory} className="btn btn-primary" style={{ fontSize: 11, padding: '8px 16px', minHeight: 36 }} disabled={!newCatLabel.trim()}>+ Thêm</button>
                    </div>

                    {/* Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-2)' }}>
                        <button onClick={() => setCatFilter('all')} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)', border: catFilter === 'all' ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)',
                            background: catFilter === 'all' ? 'rgba(212,168,83,0.1)' : 'var(--bg-secondary)', cursor: 'pointer', textAlign: 'left',
                        }}>
                            <span style={{ fontSize: 20 }}></span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Tất cả</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{totalProducts} SP</div>
                            </div>
                        </button>

                        {categories.map(cat => {
                            const count = categoryCounts[cat.value] || 0;
                            const isActive = catFilter === cat.value;
                            const isEditing = editingCat === cat.id;
                            return (
                                <div key={cat.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-3)',
                                    borderRadius: 'var(--radius-md)', border: isActive ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)',
                                    background: isActive ? 'rgba(212,168,83,0.1)' : 'var(--bg-secondary)',
                                }}>
                                    {isEditing ? (
                                        <>
                                            <select value={editCatIcon} onChange={e => setEditCatIcon(e.target.value)}
                                                style={{ width: 36, padding: 2, border: 'none', background: 'transparent', fontSize: 16, cursor: 'pointer' }}>
                                                {EMOJI_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                                            </select>
                                            <input type="text" value={editCatLabel} onChange={e => setEditCatLabel(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && updateCategory(cat.id)} autoFocus
                                                style={{ flex: 1, padding: '4px 8px', borderRadius: 4, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 12, minWidth: 0 }} />
                                            <button onClick={() => updateCategory(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--success)', padding: 2 }}>✓</button>
                                            <button onClick={() => setEditingCat(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', padding: 2 }}>✕</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setCatFilter(isActive ? 'all' : cat.value)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                                                <span style={{ fontSize: 20, flexShrink: 0 }}>{cat.icon}</span>
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label}</div>
                                                    <div style={{ fontSize: 11, color: count > 0 ? 'var(--gold-400)' : 'var(--text-muted)' }}>{count} SP</div>
                                                </div>
                                            </button>
                                            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                                <button onClick={() => { setEditingCat(cat.id); setEditCatLabel(cat.label); setEditCatIcon(cat.icon); }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, opacity: 0.6, padding: 2 }} title="Sửa"></button>
                                                <button onClick={() => deleteCat(cat.id, cat.label)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, opacity: 0.6, padding: 2 }} title="Xóa"></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══ Stat Cards ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {[
                    { label: 'Tổng', value: totalProducts, icon: '', color: 'var(--text-primary)' },
                    { label: 'Đang bán', value: activeCount, icon: '', color: 'var(--success)' },
                    { label: 'Nháp', value: draftCount, icon: '', color: 'var(--warning)' },
                    { label: 'Hết hàng', value: lowStockCount, icon: '', color: 'var(--error)' },
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
                <input className="admin-datatable__search" placeholder="Tìm tên, SKU..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: '1 1 160px', maxWidth: 240 }} />
                <div className="admin-filter-bar" style={{ marginBottom: 0, paddingBottom: 0 }}>
                    {filterOpts.map(f => (
                        <button key={f.value} className={`admin-filter-bar__chip ${filter === f.value ? 'admin-filter-bar__chip--active' : ''}`} onClick={() => setFilter(f.value)}>
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
                {catFilter !== 'all' && (
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'rgba(212,168,83,0.15)', color: 'var(--gold-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {getCategoryIcon(catFilter)} {getCategoryLabel(catFilter)}
                        <button onClick={() => setCatFilter('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-400)', fontSize: 12, padding: 0, marginLeft: 4 }}>✕</button>
                    </span>
                )}
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className="admin-datatable__bulk-bar" style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'rgba(212,168,83,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(212,168,83,0.2)' }}>
                    <span className="admin-datatable__bulk-count">{selectedIds.size} đã chọn</span>
                    <button className="admin-datatable__bulk-btn" onClick={bulkPublish}>Publish</button>
                    <button className="admin-datatable__bulk-btn" onClick={bulkUnpublish}>Ẩn</button>
                    <button className="admin-datatable__bulk-btn" style={{ color: 'var(--error)' }} onClick={bulkDelete}>🗑 Xóa</button>
                    <button className="admin-datatable__bulk-btn" onClick={() => setSelectedIds(new Set())}>✕ Bỏ chọn</button>
                </div>
            )}

            {/* ═══ Delete Confirmation Modal ═══ */}
            {deleteConfirm && (
                <>
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} onClick={() => !deleteConfirm.deleting && setDeleteConfirm(null)} />
                    <div style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-primary)', padding: 'var(--space-4)', width: '90%', maxWidth: 360, zIndex: 201, textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                        <div style={{ fontSize: 48, marginBottom: 'var(--space-3)' }}>⚠️</div>
                        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                            Xác nhận xóa {deleteConfirm.ids.length > 1 ? `${deleteConfirm.ids.length} sản phẩm` : 'sản phẩm'}?
                        </h3>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)', lineHeight: 1.6 }}>
                            {deleteConfirm.ids.length === 1 ? (
                                <p style={{ margin: 0 }}>Bạn có chắc muốn xóa <strong style={{ color: 'var(--text-primary)' }}>&quot;{deleteConfirm.names[0]}&quot;</strong>?</p>
                            ) : (
                                <p style={{ margin: 0 }}>{deleteConfirm.names.slice(0, 3).map((n, i) => <span key={i}>• {n}<br /></span>)}{deleteConfirm.ids.length > 3 && <span>...và {deleteConfirm.ids.length - 3} sản phẩm khác</span>}</p>
                            )}
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '0 0 var(--space-4)', lineHeight: 1.5 }}>
                            Hành động này không thể hoàn tác.<br />
                            SP có đơn hàng sẽ tự động ẩn thay vì xóa.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <button onClick={() => setDeleteConfirm(null)} className="btn" style={{ flex: 1 }} disabled={deleteConfirm.deleting}>Hủy</button>
                            <button onClick={executeDelete} className="btn" disabled={deleteConfirm.deleting} style={{ flex: 1, background: 'var(--error, #ef4444)', color: '#fff', border: 'none', opacity: deleteConfirm.deleting ? 0.6 : 1 }}>
                                {deleteConfirm.deleting ? 'Đang xóa...' : '🗑 Xóa vĩnh viễn'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ Edit Modal (Top Position) ═══ */}
            {editingProduct && (
                <>
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, backdropFilter: 'blur(4px)' }} onClick={() => setEditingProduct(null)} />
                    <div style={{
                        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)',
                        border: '1px solid var(--border-primary)', padding: 'var(--space-4)',
                        width: '94%', maxWidth: 520, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto',
                        zIndex: 101, boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
                        animation: 'slideDown 0.25s ease-out',
                    }}>
                        <style>{`@keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
                        {/* Header with product image */}
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                            {editingProduct.media?.[0]?.url ? (
                                <img src={editingProduct.media[0].url} alt="" style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-primary)' }} />
                            ) : (
                                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>👓</div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Sửa nhanh</h3>
                                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{editingProduct.slug}</p>
                            </div>
                            <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                            {/* Status toggle */}
                            <div>
                                <label style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Trạng thái</label>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {[{ v: 'ACTIVE', l: '✅ Đang bán', c: '#22c55e' }, { v: 'DRAFT', l: '📝 Nháp', c: '#f59e0b' }].map(s => (
                                        <button key={s.v} onClick={() => setEditStatus(s.v)} style={{
                                            flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                            fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                                            border: editStatus === s.v ? `2px solid ${s.c}` : '1px solid var(--border-primary)',
                                            background: editStatus === s.v ? `${s.c}15` : 'var(--bg-secondary)',
                                            color: editStatus === s.v ? s.c : 'var(--text-secondary)',
                                        }}>{s.l}</button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Tên sản phẩm</label>
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
                            </div>

                            {/* Category + Brand row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Danh mục</label>
                                    <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 13, cursor: 'pointer' }}>
                                        <option value="">— Chưa phân loại —</option>
                                        {categories.map(c => <option key={c.id} value={c.value}>{c.icon} {c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Thương hiệu</label>
                                    <input type="text" value={editBrand} onChange={e => setEditBrand(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <label style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Giá bán</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="number" value={editPrice} min={0} onChange={e => setEditPrice(e.target.value ? Number(e.target.value) : '')} placeholder="500000" style={{ width: '100%', padding: '10px 14px', paddingRight: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }} />
                                    <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>₫</span>
                                </div>
                                {editPrice && Number(editPrice) > 0 && <p style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 600, margin: '4px 0 0' }}>{formatVND(Number(editPrice))}</p>}
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', alignItems: 'center' }}>
                            <Link href={`/admin/products/create?id=${editingProduct.id}`} style={{ fontSize: 11, color: 'var(--gold-400)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Sửa đầy đủ →</Link>
                            <div style={{ flex: 1 }} />
                            <button onClick={() => setEditingProduct(null)} className="btn" style={{ minWidth: 70, fontSize: 12 }}>Hủy</button>
                            <button onClick={saveEdit} className="btn btn-primary" disabled={editSaving} style={{ minWidth: 80, fontSize: 12 }}>{editSaving ? 'Đang lưu...' : '💾 Lưu'}</button>
                        </div>
                    </div>
                </>
            )}

            {/* ═══ Product Listing ═══ */}
            {loading ? (
                <div className="admin-datatable__skeleton">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="admin-datatable__skeleton-row">{Array.from({ length: 4 }).map((_, j) => (<div key={j} className="admin-datatable__skeleton-cell" />))}</div>))}</div>
            ) : filteredProducts.length === 0 ? (
                <div className="admin-empty-state">
                    <span className="admin-empty-state__icon"></span>
                    <h3 className="admin-empty-state__title">{search || catFilter !== 'all' ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}</h3>
                    <Link href="/admin/products/create" className="btn btn-primary admin-empty-state__btn" style={{ textDecoration: 'none' }}>Tạo sản phẩm đầu tiên</Link>
                </div>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="admin-datatable__cards">
                        {filteredProducts.map(p => {
                            const img = getMainImage(p); const stock = getTotalStock(p); const isLowStock = stock > 0 && stock <= 5;
                            return (
                                <div key={p.id} className={`admin-datatable__card ${selectedIds.has(p.id) ? 'admin-datatable__card--selected' : ''}`}>
                                    {/* A3: Sort handle */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4 }}>
                                        <button onClick={() => { const idx = products.findIndex(x => x.id === p.id); if (idx > 0) { const next = [...products];[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; setProducts(next); } }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1 }}>▲</button>
                                        <button onClick={() => { const idx = products.findIndex(x => x.id === p.id); if (idx < products.length - 1) { const next = [...products];[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]; setProducts(next); } }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1 }}>▼</button>
                                    </div>
                                    <input type="checkbox" className="admin-datatable__card-check" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} />
                                    {img ? <img src={img} alt={p.name} loading="lazy" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} /> : <div style={{ width: 48, height: 48, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}></div>}
                                    <div className="admin-datatable__card-body">
                                        <div className="admin-datatable__card-title" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                                        <div className="admin-datatable__card-subtitle">{getCategoryIcon(p.category)} {getCategoryLabel(p.category)} · {p.brand || '—'}</div>
                                        <div className="admin-datatable__card-fields">
                                            <div className="admin-datatable__card-field"><span className="admin-datatable__card-field-label">Giá</span><span className="admin-datatable__card-field-value" style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{formatVND(getMinPrice(p))}</span></div>
                                            <div className="admin-datatable__card-field"><span className="admin-datatable__card-field-label">Kho</span><span className="admin-datatable__card-field-value" style={{ color: stock === 0 ? 'var(--error)' : isLowStock ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>{stock}{isLowStock && ' '}</span></div>
                                            <div className="admin-datatable__card-field"><span className="admin-datatable__card-field-label">TT</span><span className="admin-datatable__card-field-value" style={{ color: p.status === 'ACTIVE' ? 'var(--success)' : 'var(--warning)' }}>{p.status === 'ACTIVE' ? '' : ''}</span></div>
                                        </div>
                                    </div>
                                    <div className="admin-datatable__card-actions">
                                        <button className="admin-datatable__kebab" onClick={() => setOpenKebab(openKebab === p.id ? null : p.id)}>⋯</button>
                                        {openKebab === p.id && (
                                            <div className="admin-datatable__kebab-menu">
                                                <button className="admin-datatable__kebab-item" onClick={() => startEdit(p)}>Sửa nhanh</button>
                                                <Link href={`/admin/products/create?id=${p.id}`} className="admin-datatable__kebab-item" style={{ textDecoration: 'none' }}>Sửa đầy đủ</Link>
                                                <Link href={`/p/${p.slug}`} target="_blank" className="admin-datatable__kebab-item" style={{ textDecoration: 'none' }}>Xem</Link>
                                                <button className="admin-datatable__kebab-item" style={{ color: 'var(--error)' }} onClick={() => deleteProduct(p.id, p.name)}>Xóa</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop table */}
                    <div className="admin-datatable__table-wrap">
                        <table className="admin-datatable__table">
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0} onChange={toggleSelectAll} /></th>
                                    <th style={{ width: 30 }} title="Sắp xếp">↕</th>
                                    <th style={{ width: 50 }}>Ảnh</th>
                                    <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Sản phẩm <SortIcon col="name" /></th>
                                    <th>Danh mục</th>
                                    <th>Brand</th>
                                    <th>SKU</th>
                                    <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>Giá <SortIcon col="price" /></th>
                                    <th onClick={() => handleSort('stockQty')} style={{ cursor: 'pointer' }}>Tồn kho <SortIcon col="stockQty" /></th>
                                    <th>TT</th>
                                    <th onClick={() => handleSort('updatedAt')} style={{ cursor: 'pointer' }}>Cập nhật <SortIcon col="updatedAt" /></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(p => {
                                    const img = getMainImage(p); const stock = getTotalStock(p); const minPrice = getMinPrice(p);
                                    const maxPrice = getMaxPrice(p); const isLowStock = stock > 0 && stock <= 5; const isSelected = selectedIds.has(p.id);
                                    return (
                                        <tr key={p.id} className={isSelected ? 'admin-datatable__row--selected' : ''}>
                                            <td><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p.id)} /></td>
                                            <td style={{ fontSize: 10, whiteSpace: 'nowrap' }}>
                                                <button onClick={() => { const idx = products.findIndex(x => x.id === p.id); if (idx > 0) { const next = [...products];[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; setProducts(next); } }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}>▲</button>
                                                <button onClick={() => { const idx = products.findIndex(x => x.id === p.id); if (idx < products.length - 1) { const next = [...products];[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]; setProducts(next); } }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)' }}>▼</button>
                                            </td>
                                            <td>{img ? <img src={img} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} /> : <div style={{ width: 40, height: 40, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}></div>}</td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                                                {p.variants.length > 1 && <div style={{ fontSize: 11, color: 'var(--gold-400)' }}>{p.variants.length} biến thể</div>}
                                            </td>
                                            <td><span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>{getCategoryIcon(p.category)} {getCategoryLabel(p.category)}</span></td>
                                            <td>{p.brand || '—'}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{p.variants[0]?.sku || '—'}{p.variants.length > 1 && <div style={{ color: 'var(--text-muted)' }}>+{p.variants.length - 1}</div>}</td>
                                            <td><span style={{ fontWeight: 600, color: 'var(--gold-400)' }}>{formatVND(minPrice)}</span>{minPrice !== maxPrice && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>→ {formatVND(maxPrice)}</div>}</td>
                                            <td><span style={{ color: stock === 0 ? 'var(--error)' : isLowStock ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>{stock}</span>{isLowStock && <span style={{ fontSize: 10, marginLeft: 4 }}></span>}</td>
                                            <td><span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: p.status === 'ACTIVE' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)', color: p.status === 'ACTIVE' ? '#22c55e' : '#f59e0b' }}>{p.status === 'ACTIVE' ? '' : ''}</span></td>
                                            <td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <div className="admin-datatable__card-actions" style={{ position: 'relative' }}>
                                                    <button className="admin-datatable__kebab" onClick={() => setOpenKebab(openKebab === p.id ? null : p.id)}>⋯</button>
                                                    {openKebab === p.id && (
                                                        <div className="admin-datatable__kebab-menu">
                                                            <button className="admin-datatable__kebab-item" onClick={() => startEdit(p)}>Sửa nhanh</button>
                                                            <Link href={`/admin/products/create?id=${p.id}`} className="admin-datatable__kebab-item" style={{ textDecoration: 'none' }}>Sửa đầy đủ</Link>
                                                            <Link href={`/p/${p.slug}`} target="_blank" className="admin-datatable__kebab-item" style={{ textDecoration: 'none' }}>Xem</Link>
                                                            <button className="admin-datatable__kebab-item" style={{ color: 'var(--error)' }} onClick={() => deleteProduct(p.id, p.name)}>Xóa</button>
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
