'use client';

import { useState } from 'react';

interface Customer {
    name: string; email: string; phone: string; orders: number; spent: number; joined: string; tier: string;
}

const TIERS: Record<string, { label: string; color: string }> = {
    NEW: { label: '🆕 Mới', color: 'var(--text-muted)' },
    SILVER: { label: '🥈 Silver', color: '#9ca3af' },
    GOLD: { label: '🥇 Gold', color: 'var(--gold-400)' },
    VIP: { label: '💎 VIP', color: '#a78bfa' },
};

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const INIT_CUSTOMERS: Customer[] = [
    { name: 'Võ Thanh', email: 'thanh@example.com', phone: '0956 789 012', orders: 7, spent: 32560000, joined: '12/2025', tier: 'VIP' },
    { name: 'Nguyễn Văn Khách', email: 'khach@example.com', phone: '0912 345 678', orders: 5, spent: 18500000, joined: '01/2026', tier: 'GOLD' },
    { name: 'Trần Thị Mai', email: 'mai@example.com', phone: '0923 456 789', orders: 3, spent: 12780000, joined: '01/2026', tier: 'SILVER' },
    { name: 'Lê Hoàng', email: 'hoang@example.com', phone: '0934 567 890', orders: 2, spent: 6280000, joined: '02/2026', tier: 'NEW' },
    { name: 'Phạm Minh', email: 'minh@example.com', phone: '0945 678 901', orders: 1, spent: 8990000, joined: '02/2026', tier: 'NEW' },
    { name: 'Đỗ Lan', email: 'lan@example.com', phone: '0967 890 123', orders: 4, spent: 15230000, joined: '01/2026', tier: 'SILVER' },
];

export default function AdminCustomersPage() {
    const [search, setSearch] = useState('');
    const [tierFilter, setTierFilter] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'name'>('spent');

    const filtered = INIT_CUSTOMERS
        .filter(c => tierFilter === 'all' || c.tier === tierFilter)
        .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
        .sort((a, b) => sortBy === 'spent' ? b.spent - a.spent : sortBy === 'orders' ? b.orders - a.orders : a.name.localeCompare(b.name));

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Khách hàng</h1>
                <input className="input" placeholder="🔍 Tìm tên, email, SĐT..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: '1 1 180px', minWidth: 0, maxWidth: 280, fontSize: 'var(--text-sm)' }} />
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                {[
                    { label: 'Tổng khách', value: String(INIT_CUSTOMERS.length), color: 'var(--text-primary)' },
                    { label: '💎 VIP', value: String(INIT_CUSTOMERS.filter(c => c.tier === 'VIP').length), color: '#a78bfa' },
                    { label: '🥇 Gold', value: String(INIT_CUSTOMERS.filter(c => c.tier === 'GOLD').length), color: 'var(--gold-400)' },
                    { label: 'Tổng doanh thu', value: formatVND(INIT_CUSTOMERS.reduce((s, c) => s + c.spent, 0)), color: 'var(--gold-400)' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-lg)', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters & Sort */}
            <div className="admin-filter-scroll" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                {[{ v: 'all', l: 'Tất cả' }, ...Object.entries(TIERS).map(([v, d]) => ({ v, l: d.label }))].map(f => (
                    <button key={f.v} className="filter-chip" onClick={() => setTierFilter(f.v)}
                        style={{ background: tierFilter === f.v ? 'var(--gold-400)' : undefined, color: tierFilter === f.v ? '#0a0a0f' : undefined }}>{f.l}</button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Sắp xếp:</span>
                {[{ v: 'spent' as const, l: '💰 Chi tiêu' }, { v: 'orders' as const, l: '📦 Đơn hàng' }, { v: 'name' as const, l: '🔤 Tên' }].map(s => (
                    <button key={s.v} className="filter-chip" onClick={() => setSortBy(s.v)}
                        style={{ background: sortBy === s.v ? 'rgba(212,168,83,0.2)' : undefined, color: sortBy === s.v ? 'var(--gold-400)' : undefined, fontSize: 'var(--text-xs)' }}>{s.l}</button>
                ))}
            </div>

            {/* Detail panel */}
            {selectedCustomer && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)', border: '1px solid var(--gold-400)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>👤 {selectedCustomer.name}</h3>
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedCustomer(null)}>✕</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {selectedCustomer.email}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>SĐT:</span> {selectedCustomer.phone}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Cấp bậc:</span> <span style={{ color: TIERS[selectedCustomer.tier]?.color }}>{TIERS[selectedCustomer.tier]?.label}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tham gia:</span> {selectedCustomer.joined}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tổng đơn:</span> <strong>{selectedCustomer.orders}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tổng chi:</span> <strong style={{ color: 'var(--gold-400)' }}>{formatVND(selectedCustomer.spent)}</strong></div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Cấp bậc</th><th>Đơn hàng</th><th>Tổng chi</th><th>Tham gia</th><th></th></tr></thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Không tìm thấy khách hàng</td></tr>
                        ) : filtered.map(c => (
                            <tr key={c.email}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                                <td>
                                    <div style={{ fontSize: 'var(--text-xs)' }}>{c.email}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.phone}</div>
                                </td>
                                <td><span style={{ color: TIERS[c.tier]?.color, fontSize: 'var(--text-xs)', fontWeight: 600 }}>{TIERS[c.tier]?.label}</span></td>
                                <td>{c.orders}</td>
                                <td style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{formatVND(c.spent)}</td>
                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.joined}</td>
                                <td><button className="btn btn-sm btn-ghost" onClick={() => setSelectedCustomer(c)}>👁️ Chi tiết</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
