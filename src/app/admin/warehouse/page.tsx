'use client';

import { useState } from 'react';

/* ═══ Types ═══ */
interface Product {
    id: string;
    name: string;
    sku: string;
    stockQty: number;
    reserved: number;
    available: number;
    lowStockThreshold: number;
    lastRestocked: string;
    location: string;
}

interface Movement {
    id: string;
    sku: string;
    productName: string;
    type: 'IN' | 'OUT' | 'ADJUST';
    qty: number;
    note: string;
    by: string;
    at: string;
}

const DEMO_PRODUCTS: Product[] = [
    { id: '1', name: 'Aviator Classic Gold', sku: 'AVI-GOLD-001', stockQty: 45, reserved: 3, available: 42, lowStockThreshold: 10, lastRestocked: '2026-02-18', location: 'A1-01' },
    { id: '2', name: 'Cat Eye Retro Pink', sku: 'CAT-PINK-002', stockQty: 8, reserved: 2, available: 6, lowStockThreshold: 10, lastRestocked: '2026-02-10', location: 'A1-02' },
    { id: '3', name: 'Browline Mixed Gold-Black', sku: 'BRW-GOLD-003', stockQty: 32, reserved: 0, available: 32, lowStockThreshold: 10, lastRestocked: '2026-02-15', location: 'A2-01' },
    { id: '4', name: 'Wayfarer Black Matte', sku: 'WAY-BLK-004', stockQty: 3, reserved: 1, available: 2, lowStockThreshold: 5, lastRestocked: '2026-02-05', location: 'A2-02' },
    { id: '5', name: 'Round Wire Silver', sku: 'RND-SLV-005', stockQty: 0, reserved: 0, available: 0, lowStockThreshold: 5, lastRestocked: '2026-01-20', location: 'B1-01' },
    { id: '6', name: 'Tròng chống ánh sáng xanh', sku: 'LENS-BLU-001', stockQty: 120, reserved: 5, available: 115, lowStockThreshold: 20, lastRestocked: '2026-02-19', location: 'C1-01' },
    { id: '7', name: 'Tròng đổi màu tự động', sku: 'LENS-PHT-002', stockQty: 15, reserved: 3, available: 12, lowStockThreshold: 20, lastRestocked: '2026-02-12', location: 'C1-02' },
];

const DEMO_MOVEMENTS: Movement[] = [
    { id: 'm1', sku: 'AVI-GOLD-001', productName: 'Aviator Classic Gold', type: 'OUT', qty: 2, note: 'Đơn SMK-240220-B01', by: 'System', at: '2026-02-20 15:30' },
    { id: 'm2', sku: 'LENS-BLU-001', productName: 'Tròng chống ánh sáng xanh', type: 'IN', qty: 50, note: 'Nhập kho lô 02/2026', by: 'Admin', at: '2026-02-19 10:00' },
    { id: 'm3', sku: 'WAY-BLK-004', productName: 'Wayfarer Black Matte', type: 'OUT', qty: 1, note: 'Đơn SMK-240219-A05', by: 'System', at: '2026-02-19 14:20' },
    { id: 'm4', sku: 'RND-SLV-005', productName: 'Round Wire Silver', type: 'ADJUST', qty: -2, note: 'Kiểm kê: thiếu 2 cái', by: 'Quản lý A', at: '2026-02-18 09:00' },
    { id: 'm5', sku: 'CAT-PINK-002', productName: 'Cat Eye Retro Pink', type: 'IN', qty: 20, note: 'Nhập kho bổ sung', by: 'Admin', at: '2026-02-10 08:30' },
];

const fmtDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');
const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    IN: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: '📥 Nhập' },
    OUT: { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa', label: '📤 Xuất' },
    ADJUST: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: '🔧 Điều chỉnh' },
};

export default function AdminWarehousePage() {
    const [products, setProducts] = useState(DEMO_PRODUCTS);
    const [movements, setMovements] = useState(DEMO_MOVEMENTS);
    const [tab, setTab] = useState<'stock' | 'movements'>('stock');
    const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const adjustStock = (id: string, qty: number) => {
        const p = products.find(x => x.id === id);
        if (!p) return;
        const note = prompt(`Điều chỉnh tồn kho cho ${p.name}. Nhập số lượng (+ nhập, - xuất):`, String(qty));
        if (!note) return;
        const delta = parseInt(note);
        if (isNaN(delta)) return;
        setProducts(prev => prev.map(x => x.id === id ? { ...x, stockQty: Math.max(0, x.stockQty + delta), available: Math.max(0, x.available + delta) } : x));
        setMovements(prev => [{
            id: `m${Date.now()}`, sku: p.sku, productName: p.name,
            type: delta > 0 ? 'IN' as const : delta < 0 ? 'OUT' as const : 'ADJUST' as const,
            qty: delta, note: `Điều chỉnh thủ công`, by: 'Admin',
            at: new Date().toLocaleString('sv-SE').replace('T', ' '),
        }, ...prev]);
        showToast(`✅ Đã cập nhật tồn kho ${p.sku}: ${delta > 0 ? '+' : ''}${delta}`);
    };

    const handleImport = () => {
        alert('📥 Chức năng Import Excel:\n\n1. Tải file template .xlsx\n2. Điền SKU, số lượng, vị trí kho\n3. Upload file → hệ thống tự cập nhật tồn kho\n\n(Demo mode — chưa kết nối)');
    };

    const filtered = products.filter(p => {
        if (filter === 'low') return p.available > 0 && p.available <= p.lowStockThreshold;
        if (filter === 'out') return p.available === 0;
        return true;
    });

    const totalSKUs = products.length;
    const lowStock = products.filter(p => p.available > 0 && p.available <= p.lowStockThreshold).length;
    const outOfStock = products.filter(p => p.available === 0).length;
    const totalUnits = products.reduce((s, p) => s + p.stockQty, 0);

    return (
        <div className="animate-in">
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', background: 'rgba(34,197,94,0.9)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{toast}</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>🏭 Kho hàng (Mini WMS)</h1>
                <button className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }} onClick={handleImport}>📥 Import Excel</button>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                Quản lý tồn kho, cảnh báo sắp hết, log xuất nhập kho
            </p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Tổng SKU', value: totalSKUs, color: 'var(--text-primary)' },
                    { label: 'Tổng tồn kho', value: `${totalUnits} sp`, color: 'var(--text-primary)' },
                    { label: '⚠️ Sắp hết', value: lowStock, color: 'var(--warning)' },
                    { label: '🚫 Hết hàng', value: outOfStock, color: 'var(--error)' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-primary)', paddingBottom: 'var(--space-3)' }}>
                {([['stock', '📦 Tồn kho'], ['movements', '📋 Lịch sử xuất/nhập']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                            background: tab === key ? 'rgba(212,168,83,0.15)' : 'transparent',
                            color: tab === key ? 'var(--gold-400)' : 'var(--text-muted)',
                            fontWeight: tab === key ? 600 : 400, fontSize: 'var(--text-sm)',
                        }}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'stock' && (
                <>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        {([['all', 'Tất cả'], ['low', '⚠️ Sắp hết'], ['out', '🚫 Hết hàng']] as const).map(([key, label]) => (
                            <button key={key} onClick={() => setFilter(key)} className="btn btn-sm"
                                style={{
                                    background: filter === key ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)',
                                    color: filter === key ? 'var(--gold-400)' : 'var(--text-muted)',
                                    border: filter === key ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)',
                                }}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="card" style={{ overflow: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Sản phẩm</th>
                                    <th>Vị trí</th>
                                    <th>Tồn kho</th>
                                    <th>Đặt trước</th>
                                    <th>Khả dụng</th>
                                    <th>Nhập cuối</th>
                                    <th>Trạng thái</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(p => (
                                    <tr key={p.id}>
                                        <td><code style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)' }}>{p.sku}</code></td>
                                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                                        <td><span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{p.location}</span></td>
                                        <td style={{ fontWeight: 600 }}>{p.stockQty}</td>
                                        <td style={{ color: p.reserved > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{p.reserved}</td>
                                        <td style={{ fontWeight: 700, color: p.available === 0 ? 'var(--error)' : p.available <= p.lowStockThreshold ? 'var(--warning)' : 'var(--success)' }}>
                                            {p.available}
                                        </td>
                                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{fmtDate(p.lastRestocked)}</td>
                                        <td>
                                            {p.available === 0 ? (
                                                <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>🚫 Hết hàng</span>
                                            ) : p.available <= p.lowStockThreshold ? (
                                                <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>⚠️ Sắp hết</span>
                                            ) : (
                                                <span className="badge" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>✅ Đủ hàng</span>
                                            )}
                                        </td>
                                        <td><button className="btn btn-sm btn-ghost" onClick={() => adjustStock(p.id, 0)} title="Điều chỉnh tồn kho">📝</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {tab === 'movements' && (
                <div className="card" style={{ overflow: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>SKU</th>
                                <th>Sản phẩm</th>
                                <th>Loại</th>
                                <th>Số lượng</th>
                                <th>Ghi chú</th>
                                <th>Người thực hiện</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map(m => {
                                const t = TYPE_COLORS[m.type];
                                return (
                                    <tr key={m.id}>
                                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.at}</td>
                                        <td><code style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)' }}>{m.sku}</code></td>
                                        <td style={{ fontWeight: 500 }}>{m.productName}</td>
                                        <td><span className="badge" style={{ background: t.bg, color: t.text }}>{t.label}</span></td>
                                        <td style={{ fontWeight: 700, color: m.type === 'IN' ? '#22c55e' : m.type === 'OUT' ? '#60a5fa' : '#f59e0b' }}>
                                            {m.type === 'IN' ? '+' : m.type === 'ADJUST' && m.qty > 0 ? '+' : ''}{m.qty}
                                        </td>
                                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{m.note}</td>
                                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.by}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
