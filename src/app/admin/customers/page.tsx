'use client';

import { useState, useEffect, useCallback } from 'react';
import ExportButton from '@/components/admin/ExportButton';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface Customer {
    id: string; name: string | null; email: string | null; phone: string | null;
    createdAt: string; orderCount: number; totalSpent: number;
}

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '30' });
            if (search) params.set('q', search);
            const res = await fetch(`/api/admin/customers?${params}`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setCustomers(data.customers || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalCount(data.pagination?.total || 0);
        } catch { /* skip */ }
        setLoading(false);
    }, [page, search]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const getTier = (spent: number, orders: number) => {
        if (orders >= 5 || spent >= 5000000) return { label: 'VIP', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' };
        if (orders >= 3 || spent >= 2000000) return { label: 'Gold', color: 'var(--gold-400)', bg: 'rgba(212,168,83,0.15)' };
        if (orders >= 1) return { label: 'Silver', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' };
        return { label: 'Mới', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
    };

    const totalSpentAll = customers.reduce((s, c) => s + c.totalSpent, 0);

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Khách hàng</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: '1 1 180px', minWidth: 0, maxWidth: 360 }}>
                    <input className="input" placeholder="Tìm tên, email, SĐT..." value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)' }} />
                    <ExportButton
                        data={customers.map(c => ({ name: c.name, email: c.email, phone: c.phone, orders: c.orderCount, spent: c.totalSpent, joined: new Date(c.createdAt).toLocaleDateString('vi-VN') } as unknown as Record<string, unknown>))}
                        columns={[
                            { key: 'name', label: 'Tên' },
                            { key: 'email', label: 'Email' },
                            { key: 'phone', label: 'SĐT' },
                            { key: 'orders', label: 'Đơn hàng' },
                            { key: 'spent', label: 'Tổng chi', format: (v) => formatVND(v as number) },
                            { key: 'joined', label: 'Ngày tham gia' },
                        ]}
                        filename="khach-hang"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="zen-stat-grid">
                {[
                    { label: 'Tổng khách', value: String(totalCount), color: 'var(--text-primary)' },
                    { label: 'Tổng doanh thu', value: formatVND(totalSpentAll), color: 'var(--gold-400)' },
                ].map(s => (
                    <div key={s.label} className="admin-stat-card">
                        <div className="admin-stat-card__header">
                            <span className="admin-stat-card__label">{s.label}</span>
                        </div>
                        <div className="admin-stat-card__value" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Loading */}
            {loading && <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>⏳ Đang tải...</div>}

            {/* Detail panel */}
            {selectedCustomer && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)', border: '1px solid var(--gold-400)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{selectedCustomer.name || '—'}</h3>
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedCustomer(null)}>✕</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> {selectedCustomer.email || '—'}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>SĐT:</span> {selectedCustomer.phone || '—'}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Cấp bậc:</span> <span style={{ color: getTier(selectedCustomer.totalSpent, selectedCustomer.orderCount).color, fontWeight: 600 }}>{getTier(selectedCustomer.totalSpent, selectedCustomer.orderCount).label}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tham gia:</span> {new Date(selectedCustomer.createdAt).toLocaleDateString('vi-VN')}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tổng đơn:</span> <strong>{selectedCustomer.orderCount}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tổng chi:</span> <strong style={{ color: 'var(--gold-400)' }}>{formatVND(selectedCustomer.totalSpent)}</strong></div>
                    </div>
                </div>
            )}

            {/* Customer Cards (mobile) */}
            {!loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {customers.length === 0 ? (
                        <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy khách hàng</div>
                    ) : customers.map(c => {
                        const tier = getTier(c.totalSpent, c.orderCount);
                        return (
                            <div key={c.id} className="card" onClick={() => setSelectedCustomer(c)} style={{ padding: 'var(--space-4)', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name || '—'}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                                            {c.phone || c.email || '—'}
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: tier.bg, color: tier.color, flexShrink: 0 }}>{tier.label}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 12 }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Đơn:</span> <strong>{c.orderCount}</strong></div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Chi:</span> <strong style={{ color: 'var(--gold-400)' }}>{formatVND(c.totalSpent)}</strong></div>
                                    <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                    <button className="btn btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>← Trước</button>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Trang {page} / {totalPages}</span>
                    <button className="btn btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Sau →</button>
                </div>
            )}
        </div>
    );
}
