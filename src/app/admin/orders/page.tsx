'use client';

import { useState, useEffect, useCallback } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const STATUS_MAP: Record<string, { label: string; class: string; next?: string; nextLabel?: string }> = {
    CREATED: { label: 'Mới', class: 'badge-info', next: 'CONFIRMED', nextLabel: 'Xác nhận' },
    CONFIRMED: { label: 'Xác nhận', class: 'badge-warning', next: 'SHIPPING', nextLabel: 'Giao hàng' },
    PAID: { label: 'Đã TT', class: 'badge-success', next: 'SHIPPING', nextLabel: 'Giao hàng' },
    SHIPPING: { label: 'Đang giao', class: 'badge-warning', next: 'DELIVERED', nextLabel: 'Đã giao' },
    DELIVERED: { label: 'Đã giao', class: 'badge-success' },
    FAILED_DELIVERY: { label: 'Giao thất bại', class: 'badge-error', next: 'SHIPPING', nextLabel: 'Giao lại' },
    RETURNED: { label: 'Hoàn trả', class: 'badge-error' },
    CANCELLED: { label: 'Huỷ', class: 'badge-error' },
};

interface OrderItem { nameSnapshot: string; qty: number; price: number; }
interface Order {
    id: string; code: string; status: string; total: number; subtotal: number;
    shippingFee: number; discountTotal: number; paymentMethod: string; note: string | null;
    createdAt: string; shippingAddress: Record<string, string> | null;
    user: { name: string | null; phone: string | null; email: string | null } | null;
    items: OrderItem[];
    referral: { partner: { partnerCode: string } } | null;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '30' });
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (search) params.set('q', search);
            const res = await fetch(`/api/admin/orders?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setOrders(data.orders || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch {
            showToast('Lỗi tải đơn hàng');
        }
        setLoading(false);
    }, [page, statusFilter, search]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const advanceStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status: newStatus }),
            });
            if (!res.ok) {
                const data = await res.json();
                showToast(data.error || 'Lỗi cập nhật');
                return;
            }
            showToast('Đã cập nhật trạng thái');
            fetchOrders();
        } catch {
            showToast('Lỗi cập nhật');
        }
    };

    const cancelOrder = async (orderId: string) => {
        if (!confirm('Huỷ đơn hàng này?')) return;
        await advanceStatus(orderId, 'CANCELLED');
    };

    const detail = orders.find(o => o.id === selectedId);
    const statusCounts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {} as Record<string, number>);

    return (
        <div className="animate-in">
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', background: 'rgba(34,197,94,0.9)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{toast}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Đơn hàng</h1>
                <input className="input" placeholder="Tìm mã đơn, khách..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    style={{ flex: '1 1 120px', minWidth: 0, maxWidth: 200, fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-3)', minHeight: 36 }} />
            </div>

            {/* Status filter tabs */}
            <div className="admin-filter-scroll" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', overflowX: 'auto' }}>
                {[{ v: 'all', l: 'Tất cả' }, ...Object.entries(STATUS_MAP).map(([v, d]) => ({ v, l: d.label }))].map(f => (
                    <button key={f.v} className="btn btn-sm" onClick={() => { setStatusFilter(f.v); setPage(1); }}
                        style={{ background: statusFilter === f.v ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)', color: statusFilter === f.v ? 'var(--gold-400)' : 'var(--text-muted)', border: statusFilter === f.v ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {f.l} {statusCounts[f.v] ? `(${statusCounts[f.v]})` : ''}
                    </button>
                ))}
            </div>

            {/* Detail panel */}
            {detail && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)', border: '1px solid var(--gold-400)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Chi tiết: {detail.code}</h3>
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedId(null)}>✕ Đóng</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Khách:</span> <strong>{detail.user?.name || (detail.shippingAddress as Record<string, string>)?.name || '—'}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>SĐT:</span> {detail.user?.phone || (detail.shippingAddress as Record<string, string>)?.phone || '—'}</div>
                        <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--text-muted)' }}>Địa chỉ:</span> {(() => { const addr = detail.shippingAddress as Record<string, string> | null; if (!addr) return '—'; const parts = [addr.address, addr.ward, addr.district, addr.province].filter(Boolean); return parts.length > 0 ? parts.join(', ') : '—'; })()}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tổng:</span> <strong style={{ color: 'var(--gold-400)' }}>{formatVND(detail.total)}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Thanh toán:</span> {detail.paymentMethod}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Trạng thái:</span> <span className={`badge ${STATUS_MAP[detail.status]?.class || ''}`}>{STATUS_MAP[detail.status]?.label || detail.status}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Đối tác:</span> {detail.referral?.partner?.partnerCode || '— Trực tiếp'}</div>
                    </div>
                    {/* Items */}
                    <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--border-primary)', paddingTop: 'var(--space-3)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>SẢN PHẨM</p>
                        {detail.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                <span>{item.nameSnapshot} × {item.qty}</span>
                                <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{formatVND(item.price * item.qty)}</span>
                            </div>
                        ))}
                    </div>
                    {detail.note && <p style={{ marginTop: 'var(--space-2)', fontSize: 12, color: 'var(--text-tertiary)' }}>📝 {detail.note}</p>}
                    {STATUS_MAP[detail.status]?.next && (
                        <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => advanceStatus(detail.id, STATUS_MAP[detail.status].next!)}>
                                ✓ {STATUS_MAP[detail.status].nextLabel}
                            </button>
                            {['CREATED', 'CONFIRMED', 'PAID'].includes(detail.status) && (
                                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => cancelOrder(detail.id)}>Huỷ đơn</button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Loading */}
            {loading && <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>⏳ Đang tải...</div>}

            {/* Order Cards */}
            {!loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {orders.length === 0 ? (
                        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy đơn hàng</div>
                    ) : orders.map(o => {
                        const customerName = o.user?.name || (o.shippingAddress as Record<string, string>)?.name || '—';
                        const phone = o.user?.phone || (o.shippingAddress as Record<string, string>)?.phone || '';
                        const addr = o.shippingAddress as Record<string, string> | null;
                        const addressStr = addr ? [addr.address, addr.ward, addr.district, addr.province].filter(Boolean).join(', ') : '';
                        return (
                            <div key={o.id} className="card" onClick={() => setSelectedId(o.id)}
                                style={{ padding: 'var(--space-4)', cursor: 'pointer', border: selectedId === o.id ? '2px solid var(--gold-400)' : '2px solid transparent' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'monospace' }}>{o.code}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{customerName} {phone ? `· ${phone}` : ''}</div>
                                        {addressStr && <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>📍 {addressStr}</div>}
                                    </div>
                                    <span className={`badge ${STATUS_MAP[o.status]?.class || ''}`} style={{ fontSize: 12, flexShrink: 0 }}>{STATUS_MAP[o.status]?.label || o.status}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gold-400)' }}>{formatVND(o.total)}</span>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                                        {STATUS_MAP[o.status]?.next && (
                                            <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); advanceStatus(o.id, STATUS_MAP[o.status].next!); }}>
                                                {STATUS_MAP[o.status].nextLabel}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {/* Items preview */}
                                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>
                                    {o.items.map(it => `${it.nameSnapshot} ×${it.qty}`).join(', ')}
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
