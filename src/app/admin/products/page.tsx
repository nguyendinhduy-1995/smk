'use client';

import { useState } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const DEMO_PRODUCTS = [
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
    const [filter, setFilter] = useState('all');
    const filtered = filter === 'all' ? DEMO_PRODUCTS : DEMO_PRODUCTS.filter((p) => p.status === filter);

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Sản phẩm</h1>
                <button className="btn btn-primary">➕ Thêm sản phẩm</button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {[{ v: 'all', l: 'Tất cả' }, { v: 'ACTIVE', l: 'Đang bán' }, { v: 'DRAFT', l: 'Nháp' }, { v: 'ARCHIVED', l: 'Lưu trữ' }].map((f) => (
                    <button key={f.v} className="filter-chip" onClick={() => setFilter(f.v)}
                        style={{ background: filter === f.v ? 'var(--gold-400)' : undefined, color: filter === f.v ? '#0a0a0f' : undefined }}>
                        {f.l}
                    </button>
                ))}
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>SKU</th>
                            <th>Giá</th>
                            <th>Tồn kho</th>
                            <th>Trạng thái</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((p) => (
                            <tr key={p.id}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.brand}</div>
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 'var(--text-xs)' }}>{p.sku}</td>
                                <td style={{ fontWeight: 600, color: 'var(--gold-400)' }}>{formatVND(p.price)}</td>
                                <td>
                                    <span style={{ color: p.stock < 5 ? 'var(--error)' : p.stock < 10 ? 'var(--warning)' : 'var(--success)' }}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td><span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>{p.status === 'ACTIVE' ? 'Đang bán' : 'Nháp'}</span></td>
                                <td><button className="btn btn-sm btn-ghost">✏️</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
