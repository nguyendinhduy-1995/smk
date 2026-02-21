'use client';

import { useState } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const DEMO_PARTNERS = [
    { code: 'DUY123', name: 'Đại lý Duy', level: 'AGENT', status: 'ACTIVE', orders: 42, revenue: 85000000, commission: 8500000, risk: 12 },
    { code: 'AFF_MINH', name: 'Minh Affiliate', level: 'AFFILIATE', status: 'ACTIVE', orders: 15, revenue: 28000000, commission: 2800000, risk: 58 },
    { code: 'LEADER01', name: 'Shop Hà Nội', level: 'LEADER', status: 'ACTIVE', orders: 120, revenue: 320000000, commission: 32000000, risk: 5 },
    { code: 'NEW_AFF', name: 'Lan Ngọc', level: 'AFFILIATE', status: 'PENDING', orders: 0, revenue: 0, commission: 0, risk: 0 },
];

export default function AdminPartnersPage() {
    const [statusFilter, setStatusFilter] = useState('all');
    const filtered = statusFilter === 'all' ? DEMO_PARTNERS : DEMO_PARTNERS.filter((p) => p.status === statusFilter);

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Đối tác</h1>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {[{ v: 'all', l: 'Tất cả' }, { v: 'PENDING', l: '⏳ Chờ duyệt' }, { v: 'ACTIVE', l: '✅ Hoạt động' }, { v: 'SUSPENDED', l: '🚫 Tạm dừng' }].map((f) => (
                    <button key={f.v} className="filter-chip" onClick={() => setStatusFilter(f.v)}
                        style={{ background: statusFilter === f.v ? 'var(--gold-400)' : undefined, color: statusFilter === f.v ? '#0a0a0f' : undefined }}>
                        {f.l}
                    </button>
                ))}
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr><th>Mã</th><th>Đối tác</th><th>Cấp độ</th><th>Đơn hàng</th><th>Doanh thu</th><th>Hoa hồng</th><th>Risk</th><th></th></tr>
                    </thead>
                    <tbody>
                        {filtered.map((p) => (
                            <tr key={p.code}>
                                <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>{p.code}</td>
                                <td>{p.name}</td>
                                <td>
                                    <span className="badge" style={{ background: p.level === 'LEADER' ? 'rgba(212,168,83,0.2)' : p.level === 'AGENT' ? 'rgba(96,165,250,0.2)' : 'var(--bg-tertiary)' }}>
                                        {p.level === 'LEADER' ? '👑' : p.level === 'AGENT' ? '🏆' : '⭐'} {p.level}
                                    </span>
                                </td>
                                <td>{p.orders}</td>
                                <td style={{ fontWeight: 600 }}>{formatVND(p.revenue)}</td>
                                <td style={{ color: 'var(--gold-400)' }}>{formatVND(p.commission)}</td>
                                <td>
                                    <span style={{ color: p.risk > 40 ? 'var(--error)' : p.risk > 20 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>
                                        {p.risk}
                                    </span>
                                </td>
                                <td>
                                    {p.status === 'PENDING' ? (
                                        <button className="btn btn-sm btn-primary">Duyệt</button>
                                    ) : (
                                        <button className="btn btn-sm btn-ghost">👁️</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
