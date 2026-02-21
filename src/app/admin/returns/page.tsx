'use client';

import { useState, useEffect } from 'react';

interface ReturnRequest {
    id: string;
    code: string;
    orderCode: string;
    customerName: string;
    type: string;
    reason: string;
    description?: string;
    status: string;
    resolution?: string;
    refundAmount?: number;
    adminNote?: string;
    createdAt: string;
}

const TYPE_MAP: Record<string, { label: string; icon: string; color: string }> = {
    RETURN: { label: 'Đổi trả', icon: '↩️', color: '#f59e0b' },
    EXCHANGE: { label: 'Đổi sản phẩm', icon: '🔄', color: '#60a5fa' },
    WARRANTY: { label: 'Bảo hành', icon: '🛡️', color: '#a855f7' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: 'Chờ xử lý', color: '#f59e0b' },
    APPROVED: { label: 'Đã duyệt', color: '#22c55e' },
    REJECTED: { label: 'Từ chối', color: '#ef4444' },
    PROCESSING: { label: 'Đang xử lý', color: '#60a5fa' },
    COMPLETED: { label: 'Hoàn thành', color: '#22c55e' },
    CANCELLED: { label: 'Đã huỷ', color: '#6b7280' },
};

const fmt = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtMoney = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default function AdminReturnsPage() {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [filter, setFilter] = useState('ALL');
    const [toast, setToast] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/returns').then(r => r.json()).then(data => setReturns(data.returns || []));
    }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const updateStatus = async (id: string, status: string) => {
        await fetch('/api/admin/returns', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
        });
        setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        showToast(`✅ Cập nhật trạng thái → ${STATUS_MAP[status]?.label || status}`);
    };

    const filtered = filter === 'ALL' ? returns : returns.filter(r => r.status === filter);
    const counts = {
        ALL: returns.length,
        PENDING: returns.filter(r => r.status === 'PENDING').length,
        APPROVED: returns.filter(r => r.status === 'APPROVED').length,
        PROCESSING: returns.filter(r => r.status === 'PROCESSING').length,
        COMPLETED: returns.filter(r => r.status === 'COMPLETED').length,
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>↩️ Đổi trả / Bảo hành</h1>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                Quản lý yêu cầu đổi trả, bảo hành gọng/tròng kính
            </p>

            {toast && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 999,
                    padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    fontSize: 'var(--text-sm)', fontWeight: 600, animation: 'fadeIn 200ms ease',
                }}>{toast}</div>
            )}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                {Object.entries(counts).map(([key, count]) => (
                    <button key={key} onClick={() => setFilter(key)}
                        className="card" style={{
                            padding: 'var(--space-3)', textAlign: 'center', cursor: 'pointer', border: 'none',
                            outline: filter === key ? '2px solid var(--gold-400)' : 'none',
                        }}>
                        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: key === 'PENDING' && count > 0 ? '#f59e0b' : 'var(--text-primary)' }}>{count}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {key === 'ALL' ? 'Tất cả' : STATUS_MAP[key]?.label || key}
                        </div>
                    </button>
                ))}
            </div>

            {/* Returns Table */}
            <div className="card" style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                            {['Mã RMA', 'Đơn hàng', 'Khách hàng', 'Loại', 'Lý do', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                                Không có yêu cầu nào
                            </td></tr>
                        )}
                        {filtered.map(r => (
                            <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.05))' }}>
                                <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--gold-400)' }}>{r.code}</td>
                                <td style={{ padding: 'var(--space-3)' }}>{r.orderCode}</td>
                                <td style={{ padding: 'var(--space-3)' }}>{r.customerName}</td>
                                <td style={{ padding: 'var(--space-3)' }}>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
                                        background: `${TYPE_MAP[r.type]?.color || '#888'}22`,
                                        color: TYPE_MAP[r.type]?.color || '#888',
                                    }}>
                                        {TYPE_MAP[r.type]?.icon} {TYPE_MAP[r.type]?.label || r.type}
                                    </span>
                                </td>
                                <td style={{ padding: 'var(--space-3)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {r.reason}
                                </td>
                                <td style={{ padding: 'var(--space-3)' }}>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
                                        background: `${STATUS_MAP[r.status]?.color || '#888'}22`,
                                        color: STATUS_MAP[r.status]?.color || '#888', fontWeight: 600,
                                    }}>
                                        {STATUS_MAP[r.status]?.label || r.status}
                                    </span>
                                    {r.refundAmount ? (
                                        <div style={{ fontSize: 'var(--text-xs)', color: '#ef4444', marginTop: 2 }}>
                                            Hoàn: {fmtMoney(r.refundAmount)}
                                        </div>
                                    ) : null}
                                </td>
                                <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{fmt(r.createdAt)}</td>
                                <td style={{ padding: 'var(--space-3)' }}>
                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                        {r.status === 'PENDING' && (
                                            <>
                                                <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(r.id, 'APPROVED')} style={{ fontSize: 'var(--text-xs)', color: '#22c55e' }}>✅ Duyệt</button>
                                                <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(r.id, 'REJECTED')} style={{ fontSize: 'var(--text-xs)', color: '#ef4444' }}>❌ Từ chối</button>
                                            </>
                                        )}
                                        {r.status === 'APPROVED' && (
                                            <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(r.id, 'PROCESSING')} style={{ fontSize: 'var(--text-xs)' }}>⚙️ Xử lý</button>
                                        )}
                                        {r.status === 'PROCESSING' && (
                                            <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(r.id, 'COMPLETED')} style={{ fontSize: 'var(--text-xs)', color: '#22c55e' }}>✅ Hoàn tất</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Policy reminder */}
            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', alignItems: 'start' }}>
                <span style={{ fontSize: 24 }}>📋</span>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Chính sách:</strong><br />
                    • Đổi trả trong 7 ngày kể từ ngày nhận hàng, sản phẩm còn nguyên tem/hộp<br />
                    • Bảo hành gọng: 6 tháng — Bảo hành tròng: 12 tháng<br />
                    • Đơn RETURNED sẽ trừ khỏi "Doanh thu đã giao" (Net Delivered Revenue)
                </div>
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
