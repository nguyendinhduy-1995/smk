'use client';

import { useState, useCallback } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const STATUS_MAP: Record<string, { label: string; class: string; next?: string; nextLabel?: string; nextIcon?: string }> = {
    CREATED: { label: 'Mới', class: 'badge-info', next: 'CONFIRMED', nextLabel: 'Xác nhận', nextIcon: '✓' },
    CONFIRMED: { label: 'Xác nhận', class: 'badge-warning', next: 'SHIPPING', nextLabel: 'Giao hàng', nextIcon: '' },
    SHIPPING: { label: 'Đang giao', class: 'badge-warning', next: 'DELIVERED', nextLabel: 'Đã giao', nextIcon: '' },
    DELIVERED: { label: 'Đã giao', class: 'badge-success' },
    RETURNED: { label: 'Hoàn trả', class: 'badge-error' },
    CANCELLED: { label: 'Huỷ', class: 'badge-error' },
};

interface Order { code: string; customer: string; status: string; total: number; date: string; partner: string | null; phone: string; }

const INIT_ORDERS: Order[] = [];

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>(INIT_ORDERS);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
    const [toast, setToast] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const toggleSelect = (code: string) => setSelected(prev => { const n = new Set(prev); if (n.has(code)) n.delete(code); else n.add(code); return n; });
    const toggleAll = () => { const f = filtered.map(o => o.code); setSelected(prev => prev.size === f.length ? new Set() : new Set(f)); };

    const bulkAdvance = () => {
        setOrders(prev => prev.map(o => {
            if (!selected.has(o.code)) return o;
            const next = STATUS_MAP[o.status]?.next;
            return next ? { ...o, status: next } : o;
        }));
        showToast(`Đã cập nhật ${selected.size} đơn hàng`);
        setSelected(new Set());
    };

    const exportCSV = () => {
        const rows = [['Mã đơn', 'Khách', 'SĐT', 'Trạng thái', 'Tổng', 'Đối tác', 'Ngày']];
        (selected.size > 0 ? orders.filter(o => selected.has(o.code)) : filtered).forEach(o => {
            rows.push([o.code, o.customer, o.phone, STATUS_MAP[o.status]?.label || o.status, o.total.toString(), o.partner || '', o.date]);
        });
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        showToast('Đã xuất CSV');
    };

    const printOrders = () => {
        const printContent = (selected.size > 0 ? orders.filter(o => selected.has(o.code)) : filtered)
            .map(o => `${o.code} | ${o.customer} | ${o.phone} | ${formatVND(o.total)} | ${STATUS_MAP[o.status]?.label}`).join('\n');
        const w = window.open('', '_blank');
        if (w) { w.document.write(`<pre style="font-family:monospace;font-size:14px">${printContent}</pre>`); w.print(); }
        showToast('Đang in...');
    };

    const refreshOrders = useCallback(async () => {
        // In production, fetch from API
        setOrders([...INIT_ORDERS]);
    }, []);
    const { refreshing } = usePullToRefresh({ onRefresh: refreshOrders });

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
        showToast('Đã cập nhật trạng thái đơn hàng');
    };

    const cancelOrder = (code: string) => {
        if (!confirm('Huỷ đơn hàng này?')) return;
        setOrders(prev => prev.map(o => o.code === code ? { ...o, status: 'CANCELLED' } : o));
        showToast('Đã huỷ đơn hàng');
    };

    const detail = orders.find(o => o.code === selectedOrder);

    return (
        <div className="animate-in">
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', background: 'rgba(34,197,94,0.9)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{toast}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Đơn hàng</h1>
                <input className="input" placeholder="Tìm mã đơn, khách..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: '1 1 120px', minWidth: 0, maxWidth: 200, fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-3)', minHeight: 36 }} />
            </div>

            {/* Stats */}
            <div className="admin-filter-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                {[{ v: 'all', l: 'Tất cả', c: orders.length }, ...Object.entries(STATUS_MAP).map(([v, d]) => ({ v, l: d.label, c: orders.filter(o => o.status === v).length }))].map(f => (
                    <button key={f.v} className="stat-card" onClick={() => setStatusFilter(statusFilter === f.v ? 'all' : f.v)}
                        style={{ cursor: 'pointer', border: statusFilter === f.v ? '2px solid var(--gold-400)' : '2px solid transparent', textAlign: 'left', padding: 'var(--space-3)' }}>
                        <div className="stat-card__label" style={{ fontSize: 'var(--text-xs)' }}>{f.l}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-lg)' }}>{f.c}</div>
                    </button>
                ))}
            </div>

            {/* Bulk Actions Bar */}
            {selected.size > 0 && (
                <div style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} đơn hàng đã chọn</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-sm btn-primary" onClick={bulkAdvance}>Chuyển trạng thái</button>
                        <button className="btn btn-sm" onClick={exportCSV}>Xuất CSV</button>
                        <button className="btn btn-sm" onClick={printOrders}>In đơn</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelected(new Set())} style={{ color: 'var(--error)' }}>✕ Bỏ chọn</button>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {detail && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)', border: '1px solid var(--gold-400)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Chi tiết: {detail.code}</h3>
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
                            {detail.status !== 'DELIVERED' && <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => { cancelOrder(detail.code); setSelectedOrder(null); }}>Huỷ đơn</button>}
                        </div>
                    )}

                    {/* A2: Order Timeline */}
                    <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-primary)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>TRẠNG THÁI ĐƠN HÀNG</p>
                        <div style={{ display: 'flex', gap: 0, alignItems: 'flex-start', position: 'relative' }}>
                            {(['CREATED', 'CONFIRMED', 'SHIPPING', 'DELIVERED'] as const).map((st, i, arr) => {
                                const statusOrder = ['CREATED', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];
                                const currentIdx = statusOrder.indexOf(detail.status);
                                const isCancelled = detail.status === 'CANCELLED' || detail.status === 'RETURNED';
                                const isDone = !isCancelled && i <= currentIdx;
                                const isCurrent = !isCancelled && i === currentIdx;
                                const labels: Record<string, string> = { CREATED: 'Mới tạo', CONFIRMED: 'Xác nhận', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao' };
                                return (
                                    <div key={st} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                        {i > 0 && <div style={{ position: 'absolute', top: 10, right: '50%', width: '100%', height: 2, background: isDone ? '#22c55e' : 'var(--border-primary)', zIndex: 0 }} />}
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', zIndex: 1,
                                            background: isCurrent ? 'var(--gold-400)' : isDone ? '#22c55e' : 'var(--bg-tertiary)',
                                            border: `2px solid ${isCurrent ? 'var(--gold-400)' : isDone ? '#22c55e' : 'var(--border-primary)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 10, color: isDone ? '#fff' : 'var(--text-muted)',
                                        }}>{isDone && !isCurrent ? '✓' : i + 1}</div>
                                        <span style={{ fontSize: 9, marginTop: 4, color: isCurrent ? 'var(--gold-400)' : isDone ? '#22c55e' : 'var(--text-muted)', fontWeight: isCurrent ? 700 : 400, textAlign: 'center' }}>{labels[st]}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {(detail.status === 'CANCELLED' || detail.status === 'RETURNED') && (
                            <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, marginTop: 8, textAlign: 'center' }}>
                                {detail.status === 'CANCELLED' ? 'Đơn đã bị huỷ' : 'Đơn đã hoàn trả'}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* === Mobile Card View (hidden on desktop) === */}
            <div className="orders-cards-mobile" style={{ display: 'none', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {filtered.length === 0 ? (
                    <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>Không tìm thấy đơn hàng</div>
                ) : filtered.map(o => (
                    <div key={o.code} className="card" onClick={() => setSelectedOrder(o.code)}
                        style={{ padding: 'var(--space-4)', cursor: 'pointer', border: selectedOrder === o.code ? '2px solid var(--gold-400)' : '2px solid transparent' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, fontFamily: 'monospace' }}>{o.code}</div>
                                <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 2 }}>{o.customer}</div>
                            </div>
                            <span className={`badge ${STATUS_MAP[o.status]?.class || ''}`} style={{ fontSize: 13 }}>{STATUS_MAP[o.status]?.label || o.status}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--gold-400)' }}>{formatVND(o.total)}</span>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                {STATUS_MAP[o.status]?.next && (
                                    <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); advanceStatus(o.code); }}>
                                        {STATUS_MAP[o.status].nextIcon} {STATUS_MAP[o.status].nextLabel}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* === Desktop Table View (hidden on mobile) === */}
            <div className="orders-table-desktop card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead><tr><th style={{ width: 30 }}><input type="checkbox" onChange={toggleAll} checked={selected.size === filtered.length && filtered.length > 0} /></th><th>Mã đơn</th><th>Khách hàng</th><th>Trạng thái</th><th>Tổng</th><th>Đối tác</th><th>Ngày</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Không tìm thấy đơn hàng</td></tr>
                        ) : filtered.map(o => (
                            <tr key={o.code}>
                                <td><input type="checkbox" checked={selected.has(o.code)} onChange={() => toggleSelect(o.code)} /></td>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>{o.code}</td>
                                <td>{o.customer}</td>
                                <td><span className={`badge ${STATUS_MAP[o.status]?.class || ''}`}>{STATUS_MAP[o.status]?.label || o.status}</span></td>
                                <td style={{ fontWeight: 600, color: 'var(--gold-400)' }}>{formatVND(o.total)}</td>
                                <td>{o.partner ? <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{o.partner}</span> : '—'}</td>
                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{o.date}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedOrder(o.code)} title="Xem chi tiết"></button>
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
