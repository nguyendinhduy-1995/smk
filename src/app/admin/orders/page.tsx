'use client';

import { useState } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const STATUS_MAP: Record<string, { label: string; class: string }> = {
    CREATED: { label: 'Mới', class: 'badge-info' },
    CONFIRMED: { label: 'Xác nhận', class: 'badge-warning' },
    PAID: { label: 'Đã TT', class: 'badge-success' },
    SHIPPING: { label: 'Đang giao', class: 'badge-warning' },
    DELIVERED: { label: 'Đã giao', class: 'badge-success' },
    RETURNED: { label: 'Hoàn trả', class: 'badge-error' },
    CANCELLED: { label: 'Huỷ', class: 'badge-error' },
};

const DEMO_ORDERS = [
    { code: 'SMK-20260220-015', customer: 'Nguyễn Văn Khách', status: 'CREATED', total: 2990000, date: '20/02 14:23', partner: null },
    { code: 'SMK-20260220-014', customer: 'Trần Thị Mai', status: 'CONFIRMED', total: 5890000, date: '20/02 11:45', partner: 'DUY123' },
    { code: 'SMK-20260219-013', customer: 'Lê Hoàng', status: 'SHIPPING', total: 3290000, date: '19/02 16:02', partner: null },
    { code: 'SMK-20260219-012', customer: 'Phạm Minh', status: 'DELIVERED', total: 8990000, date: '19/02 09:30', partner: 'DUY123' },
    { code: 'SMK-20260218-011', customer: 'Võ Thanh', status: 'DELIVERED', total: 4590000, date: '18/02 20:15', partner: null },
    { code: 'SMK-20260217-010', customer: 'Đỗ Lan', status: 'RETURNED', total: 7290000, date: '17/02 13:42', partner: 'AFF_MINH' },
];

export default function AdminOrdersPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const filtered = statusFilter === 'all' ? DEMO_ORDERS : DEMO_ORDERS.filter((o) => o.status === statusFilter);

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Đơn hàng</h1>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <input className="input" placeholder="Tìm mã đơn, khách hàng..." style={{ width: 240 }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                {[{ v: 'all', l: 'Tất cả' }, ...Object.entries(STATUS_MAP).map(([v, d]) => ({ v, l: d.label }))].map((f) => (
                    <button key={f.v} className="filter-chip" onClick={() => setStatusFilter(f.v)}
                        style={{ background: statusFilter === f.v ? 'var(--gold-400)' : undefined, color: statusFilter === f.v ? '#0a0a0f' : undefined }}>
                        {f.l}
                    </button>
                ))}
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr><th>Mã đơn</th><th>Khách hàng</th><th>Trạng thái</th><th>Tổng</th><th>Đối tác</th><th>Ngày</th><th></th></tr>
                    </thead>
                    <tbody>
                        {filtered.map((o) => (
                            <tr key={o.code}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono, monospace)', fontSize: 'var(--text-xs)' }}>{o.code}</td>
                                <td>{o.customer}</td>
                                <td><span className={`badge ${STATUS_MAP[o.status]?.class || ''}`}>{STATUS_MAP[o.status]?.label || o.status}</span></td>
                                <td style={{ fontWeight: 600, color: 'var(--gold-400)' }}>{formatVND(o.total)}</td>
                                <td>{o.partner ? <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{o.partner}</span> : '—'}</td>
                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{o.date}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="btn btn-sm btn-ghost">👁️</button>
                                        {o.status === 'CREATED' && <button className="btn btn-sm btn-primary">✓</button>}
                                        {o.status === 'CONFIRMED' && <button className="btn btn-sm btn-primary">📦</button>}
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
