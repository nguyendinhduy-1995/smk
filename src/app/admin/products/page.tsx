'use client';

import { useState } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface Product {
    id: string; name: string; brand: string; sku: string; price: number; stock: number; status: string;
}

const INIT_PRODUCTS: Product[] = [
    { id: '1', name: 'Aviator Classic Gold', brand: 'Ray-Ban', sku: 'RB-AVI-GOLD-55', price: 2990000, stock: 15, status: 'ACTIVE' },
    { id: '2', name: 'Cat-Eye Acetate Tortoise', brand: 'Tom Ford', sku: 'TF-CE-TORT-52', price: 4590000, stock: 12, status: 'ACTIVE' },
    { id: '3', name: 'Round Titanium Silver', brand: 'Lindberg', sku: 'LB-RND-SIL-48', price: 8990000, stock: 5, status: 'ACTIVE' },
    { id: '4', name: 'Square TR90 Black', brand: 'Oakley', sku: 'OAK-SQ-BLK-56', price: 3290000, stock: 20, status: 'ACTIVE' },
    { id: '5', name: 'Browline Mixed Gold-Black', brand: 'Persol', sku: 'PS-BRW-GDB-51', price: 5490000, stock: 7, status: 'ACTIVE' },
    { id: '6', name: 'Oval Crystal Pink', brand: 'Celine', sku: 'CEL-OV-PINK-50', price: 6790000, stock: 8, status: 'ACTIVE' },
    { id: '7', name: 'Geometric Titanium Rose', brand: 'Miu Miu', sku: 'MM-GEO-ROSE-53', price: 7290000, stock: 6, status: 'ACTIVE' },
    { id: '8', name: 'Rectangle Metal Gunmetal', brand: 'Hugo Boss', sku: 'HB-REC-GUN-54', price: 2490000, stock: 18, status: 'DRAFT' },
];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>(INIT_PRODUCTS);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editPrice, setEditPrice] = useState(0);
    const [editStock, setEditStock] = useState(0);
    const [newName, setNewName] = useState('');
    const [newBrand, setNewBrand] = useState('');
    const [newSku, setNewSku] = useState('');
    const [newPrice, setNewPrice] = useState(0);
    const [newStock, setNewStock] = useState(0);
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const filtered = products
        .filter(p => filter === 'all' || p.status === filter)
        .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

    const startEdit = (p: Product) => { setEditingId(p.id); setEditPrice(p.price); setEditStock(p.stock); };

    const saveEdit = (id: string) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, price: editPrice, stock: editStock } : p));
        setEditingId(null);
        showToast('✅ Đã cập nhật sản phẩm');
    };

    const toggleStatus = (id: string) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' } : p));
        showToast('✅ Đã cập nhật trạng thái');
    };

    const deleteProduct = (id: string) => {
        if (!confirm('Xoá sản phẩm này?')) return;
        setProducts(prev => prev.filter(p => p.id !== id));
        showToast('🗑️ Đã xoá sản phẩm');
    };

    const addProduct = () => {
        if (!newName || !newSku) return;
        const p: Product = { id: String(Date.now()), name: newName, brand: newBrand, sku: newSku, price: newPrice, stock: newStock, status: 'DRAFT' };
        setProducts(prev => [p, ...prev]);
        setShowAddForm(false); setNewName(''); setNewBrand(''); setNewSku(''); setNewPrice(0); setNewStock(0);
        showToast('✅ Đã thêm sản phẩm mới');
    };

    return (
        <div className="animate-in">
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', background: 'rgba(34,197,94,0.9)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{toast}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Sản phẩm</h1>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>➕ Thêm sản phẩm</button>
            </div>

            {/* Add form */}
            {showAddForm && (
                <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Thêm sản phẩm mới</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
                        <input className="input" placeholder="Tên sản phẩm *" value={newName} onChange={e => setNewName(e.target.value)} />
                        <input className="input" placeholder="Thương hiệu" value={newBrand} onChange={e => setNewBrand(e.target.value)} />
                        <input className="input" placeholder="SKU *" value={newSku} onChange={e => setNewSku(e.target.value)} />
                        <input className="input" type="number" placeholder="Giá (VNĐ)" value={newPrice || ''} onChange={e => setNewPrice(Number(e.target.value))} />
                        <input className="input" type="number" placeholder="Tồn kho" value={newStock || ''} onChange={e => setNewStock(Number(e.target.value))} />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                        <button className="btn btn-primary btn-sm" onClick={addProduct} disabled={!newName || !newSku}>💾 Lưu</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setShowAddForm(false)}>Huỷ</button>
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                <input className="input" placeholder="🔍 Tìm tên, SKU, thương hiệu..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
                {[{ v: 'all', l: 'Tất cả' }, { v: 'ACTIVE', l: 'Đang bán' }, { v: 'DRAFT', l: 'Nháp' }].map(f => (
                    <button key={f.v} className="filter-chip" onClick={() => setFilter(f.v)}
                        style={{ background: filter === f.v ? 'var(--gold-400)' : undefined, color: filter === f.v ? '#0a0a0f' : undefined }}>{f.l} ({products.filter(p => f.v === 'all' || p.status === f.v).length})</button>
                ))}
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr><th>Sản phẩm</th><th>SKU</th><th>Giá</th><th>Tồn kho</th><th>Trạng thái</th><th>Thao tác</th></tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Không tìm thấy sản phẩm</td></tr>
                        ) : filtered.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.brand}</div>
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>{p.sku}</td>
                                <td>
                                    {editingId === p.id
                                        ? <input className="input" type="number" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} style={{ width: 120 }} />
                                        : <span style={{ fontWeight: 600, color: 'var(--gold-400)' }}>{formatVND(p.price)}</span>}
                                </td>
                                <td>
                                    {editingId === p.id
                                        ? <input className="input" type="number" value={editStock} onChange={e => setEditStock(Number(e.target.value))} style={{ width: 80 }} />
                                        : <span style={{ color: p.stock < 5 ? 'var(--error)' : p.stock < 10 ? 'var(--warning)' : 'var(--success)' }}>{p.stock}</span>}
                                </td>
                                <td>
                                    <button className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`} onClick={() => toggleStatus(p.id)} style={{ cursor: 'pointer', border: 'none' }}>
                                        {p.status === 'ACTIVE' ? '🟢 Đang bán' : '⏸️ Nháp'}
                                    </button>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {editingId === p.id ? (
                                            <>
                                                <button className="btn btn-sm btn-primary" onClick={() => saveEdit(p.id)}>💾</button>
                                                <button className="btn btn-sm btn-ghost" onClick={() => setEditingId(null)}>✕</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-sm btn-ghost" onClick={() => startEdit(p)} title="Sửa">✏️</button>
                                                <button className="btn btn-sm btn-ghost" onClick={() => deleteProduct(p.id)} title="Xoá" style={{ color: 'var(--error)' }}>🗑️</button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
