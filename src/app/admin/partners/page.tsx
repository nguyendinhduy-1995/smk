'use client';

import { useState } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface Partner { code: string; name: string; level: string; status: string; orders: number; revenue: number; commission: number; risk: number; }

const INIT: Partner[] = [
    { code: 'DUY123', name: 'Đại lý Duy', level: 'AGENT', status: 'ACTIVE', orders: 42, revenue: 85000000, commission: 8500000, risk: 12 },
    { code: 'AFF_MINH', name: 'Minh Affiliate', level: 'AFFILIATE', status: 'ACTIVE', orders: 15, revenue: 28000000, commission: 2800000, risk: 58 },
    { code: 'LEADER01', name: 'Shop Hà Nội', level: 'LEADER', status: 'ACTIVE', orders: 120, revenue: 320000000, commission: 32000000, risk: 5 },
    { code: 'NEW_AFF', name: 'Lan Ngọc', level: 'AFFILIATE', status: 'PENDING', orders: 0, revenue: 0, commission: 0, risk: 0 },
    { code: 'AFF_HOA', name: 'Hoà KOL', level: 'AFFILIATE', status: 'PENDING', orders: 0, revenue: 0, commission: 0, risk: 0 },
    { code: 'SUSPENDED01', name: 'Fake Partner', level: 'AFFILIATE', status: 'SUSPENDED', orders: 8, revenue: 5000000, commission: 500000, risk: 85 },
];

export default function AdminPartnersPage() {
    const [partners, setPartners] = useState<Partner[]>(INIT);
    const [statusFilter, setStatusFilter] = useState('all');
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
    const filtered = statusFilter === 'all' ? partners : partners.filter(p => p.status === statusFilter);

    const approvePartner = (code: string) => {
        setPartners(prev => prev.map(p => p.code === code ? { ...p, status: 'ACTIVE' } : p));
        showToast('✅ Đã duyệt đối tác');
    };

    const rejectPartner = (code: string) => {
        if (!confirm('Từ chối đối tác này?')) return;
        setPartners(prev => prev.filter(p => p.code !== code));
        showToast('❌ Đã từ chối đối tác');
    };

    const suspendPartner = (code: string) => {
        if (!confirm('Tạm dừng đối tác này?')) return;
        setPartners(prev => prev.map(p => p.code === code ? { ...p, status: 'SUSPENDED' } : p));
        showToast('🚫 Đã tạm dừng đối tác');
    };

    const reactivatePartner = (code: string) => {
        setPartners(prev => prev.map(p => p.code === code ? { ...p, status: 'ACTIVE' } : p));
        showToast('✅ Đã kích hoạt lại đối tác');
    };

    const upgradePartner = (code: string) => {
        const NEXT: Record<string, string> = { AFFILIATE: 'AGENT', AGENT: 'LEADER' };
        setPartners(prev => prev.map(p => p.code === code ? { ...p, level: NEXT[p.level] || p.level } : p));
        showToast('⬆️ Đã nâng cấp đối tác');
    };

    return (
        <div className="animate-in">
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', background: 'rgba(34,197,94,0.9)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{toast}</div>}

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Đối tác</h1>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {[
                    { l: 'Tổng', v: partners.length, c: 'var(--text-primary)' },
                    { l: '✅ Hoạt động', v: partners.filter(p => p.status === 'ACTIVE').length, c: 'var(--success)' },
                    { l: '⏳ Chờ duyệt', v: partners.filter(p => p.status === 'PENDING').length, c: 'var(--warning)' },
                    { l: '🚫 Tạm dừng', v: partners.filter(p => p.status === 'SUSPENDED').length, c: 'var(--error)' },
                    { l: 'Tổng doanh thu', v: formatVND(partners.reduce((s, p) => s + p.revenue, 0)), c: 'var(--gold-400)' },
                ].map(s => (
                    <div key={s.l} className="stat-card">
                        <div className="stat-card__label">{s.l}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-lg)', color: s.c }}>{s.v}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="admin-filter-scroll" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                {[{ v: 'all', l: 'Tất cả' }, { v: 'PENDING', l: '⏳ Chờ duyệt' }, { v: 'ACTIVE', l: '✅ Hoạt động' }, { v: 'SUSPENDED', l: '🚫 Tạm dừng' }].map(f => (
                    <button key={f.v} className="filter-chip" onClick={() => setStatusFilter(f.v)}
                        style={{ background: statusFilter === f.v ? 'var(--gold-400)' : undefined, color: statusFilter === f.v ? '#0a0a0f' : undefined }}>{f.l}</button>
                ))}
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead><tr><th>Mã</th><th>Đối tác</th><th>Cấp độ</th><th>Đơn hàng</th><th>Doanh thu</th><th>Hoa hồng</th><th>Risk</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        {filtered.map(p => (
                            <tr key={p.code}>
                                <td style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>{p.code}</td>
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
                                    <span style={{ color: p.risk > 40 ? 'var(--error)' : p.risk > 20 ? 'var(--warning)' : 'var(--success)', fontWeight: 600 }}>{p.risk}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                        {p.status === 'PENDING' && (
                                            <>
                                                <button className="btn btn-sm btn-primary" onClick={() => approvePartner(p.code)}>✅ Duyệt</button>
                                                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => rejectPartner(p.code)}>✕</button>
                                            </>
                                        )}
                                        {p.status === 'ACTIVE' && (
                                            <>
                                                {p.level !== 'LEADER' && <button className="btn btn-sm btn-ghost" onClick={() => upgradePartner(p.code)}>⬆️ Nâng</button>}
                                                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => suspendPartner(p.code)}>🚫</button>
                                            </>
                                        )}
                                        {p.status === 'SUSPENDED' && (
                                            <button className="btn btn-sm btn-ghost" onClick={() => reactivatePartner(p.code)}>🔄 Kích hoạt</button>
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
