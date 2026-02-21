'use client';

import { useState } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const STATUS_MAP: Record<string, { label: string; class: string; next?: string; nextLabel?: string; nextIcon?: string }> = {
    CREATED: { label: 'Mới', class: 'badge-info', next: 'CONFIRMED', nextLabel: 'Xác nhận', nextIcon: '✓' },
    CONFIRMED: { label: 'Xác nhận', class: 'badge-warning', next: 'SHIPPING', nextLabel: 'Giao hàng', nextIcon: '📦' },
    SHIPPING: { label: 'Đang giao', class: 'badge-warning', next: 'DELIVERED', nextLabel: 'Đã giao', nextIcon: '✅' },
    DELIVERED: { label: 'Đã giao', class: 'badge-success' },
    RETURNED: { label: 'Hoàn trả', class: 'badge-error' },
    CANCELLED: { label: 'Huỷ', class: 'badge-error' },
};

interface Order { code: string; customer: string; status: string; total: number; date: string; partner: string | null; phone: string; }

const INIT_ORDERS: Order[] = [
    { code: 'SMK-20260220-015', customer: 'Nguyễn Văn Khách', phone: '0912xxx678', status: 'CREATED', total: 2990000, date: '20/02 14:23', partner: null },
    { code: 'SMK-20260220-014', customer: 'Trần Thị Mai', phone: '0923xxx789', status: 'CONFIRMED', total: 5890000, date: '20/02 11:45', partner: 'DUY123' },
    { code: 'SMK-20260219-013', customer: 'Lê Hoàng', phone: '0934xxx890', status: 'SHIPPING', total: 3290000, date: '19/02 16:02', partner: null },
    { code: 'SMK-20260219-012', customer: 'Phạm Minh', phone: '0945xxx901', status: 'DELIVERED', total: 8990000, date: '19/02 09:30', partner: 'DUY123' },
    { code: 'SMK-20260218-011', customer: 'Võ Thanh', phone: '0956xxx012', status: 'DELIVERED', total: 4590000, date: '18/02 20:15', partner: null },
    { code: 'SMK-20260217-010', customer: 'Đỗ Lan', phone: '0967xxx123', status: 'RETURNED', total: 7290000, date: '17/02 13:42', partner: 'AFF_MINH' },
    { code: 'SMK-20260216-009', customer: 'Hồ Anh', phone: '0978xxx234', status: 'CANCELLED', total: 2490000, date: '16/02 08:10', partner: null },
];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>(INIT_ORDERS);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const filtered = orders
        .filter(o => statusFilter === 'all' || o.status === statusFilter)
        .filter(o => !search || o.code.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()));

    const advanceStatus = (code: string) => {
        setOrders(prev => prev.map(o => {
            if (o.code !== code) return o;
            const next = STATUS_MAP[o.status]?.next;
            if (!next) return o;
            return { ...o, status: next };
        }));
        showToast('✅ Đã cập nhật trạng thái đơn hàng');
    };

    const cancelOrder = (code: string) => {
        if (!confirm('Huỷ đơn hàng này?')) return;
        setOrders(prev => prev.map(o => o.code === code ? { ...o, status: 'CANCELLED' } : o));
        showToast('❌ Đã huỷ đơn hàng');
    };

    const detail = orders.find(o => o.code === selectedOrder);

    return (
        <div className="animate-in">
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', background: 'rgba(34,197,94,0.9)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{toast}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Đơn hàng</h1>
                <input className="input" placeholder="🔍 Tìm mã đơn, khách hàng..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                {[{ v: 'all', l: 'Tất cả', c: orders.length }, ...Object.entries(STATUS_MAP).map(([v, d]) => ({ v, l: d.label, c: orders.filter(o => o.status === v).length }))].map(f => (
                    <button key={f.v} className="stat-card" onClick={() => setStatusFilter(statusFilter === f.v ? 'all' : f.v)}
                        style={{ cursor: 'pointer', border: statusFilter === f.v ? '2px solid var(--gold-400)' : '2px solid transparent', textAlign: 'left', padding: 'var(--space-3)' }}>
                        <div className="stat-card__label" style={{ fontSize: 'var(--text-xs)' }}>{f.l}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-lg)' }}>{f.c}</div>
                    </button>
                ))}
            </div>

            {/* Order Detail Modal */}
            {detail && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)', border: '1px solid var(--gold-400)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>📋 Chi tiết: {detail.code}</h3>
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedOrder(null)}>✕ Đóng</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Khách hàng:</span> <strong>{detail.customer}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>SĐT:</span> {detail.phone}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tổng tiền:</span> <strong style={{ color: 'var(--gold-400)' }}>{formatVND(detail.total)}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Đối tác:</span> {detail.partner || '— Trực tiếp'}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Trạng thái:</span> <span className={`badge ${STATUS_MAP[detail.status]?.class}`}>{STATUS_MAP[detail.status]?.label}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Ngày:</span> {detail.date}</div>
                    </div>
                    {STATUS_MAP[detail.status]?.next && (
                        <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => { advanceStatus(detail.code); setSelectedOrder(null); }}>
                                {STATUS_MAP[detail.status].nextIcon} {STATUS_MAP[detail.status].nextLabel}
                            </button>
                            {detail.status !== 'DELIVERED' && <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => { cancelOrder(detail.code); setSelectedOrder(null); }}>❌ Huỷ đơn</button>}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Trạng thái</th><th>Tổng</th><th>Đối tác</th><th>Ngày</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Không tìm thấy đơn hàng</td></tr>
                        ) : filtered.map(o => (
                            <tr key={o.code}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>{o.code}</td>
                                <td>{o.customer}</td>
                                <td><span className={`badge ${STATUS_MAP[o.status]?.class || ''}`}>{STATUS_MAP[o.status]?.label || o.status}</span></td>
                                <td style={{ fontWeight: 600, color: 'var(--gold-400)' }}>{formatVND(o.total)}</td>
                                <td>{o.partner ? <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{o.partner}</span> : '—'}</td>
                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{o.date}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedOrder(o.code)} title="Xem chi tiết">👁️</button>
                                        {STATUS_MAP[o.status]?.next && (
                                            <button className="btn btn-sm btn-primary" onClick={() => advanceStatus(o.code)} title={STATUS_MAP[o.status].nextLabel}>
                                                {STATUS_MAP[o.status].nextIcon}
                                            </button>
                                        )}
                                        {['CREATED', 'CONFIRMED'].includes(o.status) && (
                                            <button className="btn btn-sm btn-ghost" onClick={() => cancelOrder(o.code)} title="Huỷ" style={{ color: 'var(--error)' }}>✕</button>
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
