'use client';

import { useState, useEffect } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface PartnerOrder {
    code: string;
    customer: string;
    total: number;
    commission: number;
    commissionStatus: string;
    orderStatus: string;
    attributionType: string;
    date: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    CREATED: { label: 'Mới tạo', cls: 'badge-neutral' },
    CONFIRMED: { label: 'Xác nhận', cls: 'badge-warning' },
    PAID: { label: 'Đã thanh toán', cls: 'badge-success' },
    SHIPPING: { label: 'Đang giao', cls: 'badge-warning' },
    DELIVERED: { label: 'Đã giao', cls: 'badge-success' },
    RETURNED: { label: 'Hoàn trả', cls: 'badge-error' },
    CANCELLED: { label: 'Huỷ', cls: 'badge-error' },
};

const COMM_STATUS: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Đang giữ', cls: 'badge-warning' },
    AVAILABLE: { label: 'Sẵn sàng', cls: 'badge-success' },
    PAID: { label: 'Đã trả', cls: 'badge-success' },
    REVERSED: { label: 'Đã hoàn', cls: 'badge-error' },
};

export default function PartnerOrdersPage() {
    const [orders, setOrders] = useState<PartnerOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetch('/api/partner/orders', {
            headers: { 'x-user-id': 'demo-partner-user' }, // TODO: replace with real session
        })
            .then((r) => {
                if (!r.ok) throw new Error('API error');
                return r.json();
            })
            .then((res) => setOrders(res.orders || []))
            .catch(() => {
                setError('Không tải được dữ liệu. Hiển thị dữ liệu mẫu.');
                setOrders([
                    { code: 'SMK-20260220-014', customer: 'Trần Thị Mai', total: 5890000, commission: 589000, commissionStatus: 'PENDING', orderStatus: 'CONFIRMED', attributionType: 'LAST_CLICK', date: new Date().toISOString() },
                    { code: 'SMK-20260219-012', customer: 'Phạm Minh', total: 8990000, commission: 899000, commissionStatus: 'AVAILABLE', orderStatus: 'DELIVERED', attributionType: 'COUPON', date: new Date().toISOString() },
                    { code: 'SMK-20260218-011', customer: 'Lê Hoa', total: 4590000, commission: 459000, commissionStatus: 'PAID', orderStatus: 'DELIVERED', attributionType: 'LAST_CLICK', date: new Date().toISOString() },
                    { code: 'SMK-20260215-007', customer: 'Nguyễn Hải', total: 12900000, commission: 1290000, commissionStatus: 'AVAILABLE', orderStatus: 'DELIVERED', attributionType: 'LAST_CLICK', date: new Date().toISOString() },
                    { code: 'SMK-20260210-003', customer: 'Đặng Lan', total: 3290000, commission: 329000, commissionStatus: 'REVERSED', orderStatus: 'RETURNED', attributionType: 'COUPON', date: new Date().toISOString() },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredOrders = statusFilter ? orders.filter(o => o.orderStatus === statusFilter) : orders;
    const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
    const totalCommission = filteredOrders.reduce((s, o) => s + (o.commissionStatus !== 'REVERSED' ? o.commission : 0), 0);

    return (
        <div className="animate-in" style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>📦 Đơn hàng giới thiệu</h1>

            {error && (
                <div style={{ padding: 'var(--space-3)', background: 'rgba(251,191,36,0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--warning)' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Tổng đơn', value: loading ? '...' : String(filteredOrders.length), color: 'var(--text-primary)' },
                    { label: 'Doanh thu', value: loading ? '...' : formatVND(totalRevenue), color: 'var(--gold-400)' },
                    { label: 'Hoa hồng', value: loading ? '...' : formatVND(totalCommission), color: 'var(--success)' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-lg)', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* D7: Status Filter + Export */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                    {[{ v: '', l: 'Tất cả' }, { v: 'CONFIRMED', l: '📋 Xác nhận' }, { v: 'PAID', l: '💰 Đã TT' }, { v: 'SHIPPING', l: '🚚 Đang giao' }, { v: 'DELIVERED', l: '✅ Đã giao' }, { v: 'RETURNED', l: '↩️ Hoàn trả' }].map(f => (
                        <button key={f.v} className="btn btn-sm" onClick={() => setStatusFilter(f.v)}
                            style={{ flexShrink: 0, background: statusFilter === f.v ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)', color: statusFilter === f.v ? 'var(--gold-400)' : 'var(--text-muted)', border: statusFilter === f.v ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)', fontSize: 11 }}>
                            {f.l}
                        </button>
                    ))}
                </div>
                <button className="btn btn-sm" onClick={() => {
                    const csv = 'Mã đơn,Khách hàng,Tổng,Hoa hồng,Trạng thái,Ngày\n' + filteredOrders.map(o => `${o.code},${o.customer},${o.total},${o.commission},${o.orderStatus},${new Date(o.date).toLocaleDateString('vi-VN')}`).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'partner-orders.csv'; a.click();
                }} style={{ fontSize: 11 }}>📊 Xuất CSV</button>
            </div>
            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Tổng</th>
                            <th>Hoa hồng</th>
                            <th>HH Status</th>
                            <th>Đơn hàng</th>
                            <th>Nguồn</th>
                            <th>Ngày</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Đang tải...</td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Chưa có đơn hàng giới thiệu nào</td></tr>
                        ) : (
                            filteredOrders.map((o) => (
                                <tr key={o.code}>
                                    <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 'var(--text-xs)' }}>{o.code}</td>
                                    <td>{o.customer}</td>
                                    <td style={{ fontWeight: 600 }}>{formatVND(o.total)}</td>
                                    <td style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{formatVND(o.commission)}</td>
                                    <td><span className={`badge ${COMM_STATUS[o.commissionStatus]?.cls || 'badge-neutral'}`}>{COMM_STATUS[o.commissionStatus]?.label || o.commissionStatus}</span></td>
                                    <td><span className={`badge ${STATUS_MAP[o.orderStatus]?.cls || ''}`}>{STATUS_MAP[o.orderStatus]?.label || o.orderStatus}</span></td>
                                    <td><span className="badge badge-neutral" style={{ fontSize: 10 }}>{o.attributionType === 'COUPON' ? '🎫' : '🔗'}</span></td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{new Date(o.date).toLocaleDateString('vi-VN')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
