'use client';

import { useState, useEffect, useCallback } from 'react';
import ExportButton from '@/components/admin/ExportButton';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

type AICategory = { category: string; confidence: number; recommendation: string; reasoning: string };

interface ReturnRequest {
    id: string; code: string; orderCode: string; customerName: string;
    type: string; reason: string; description?: string; status: string;
    resolution?: string; refundAmount?: number; adminNote?: string; createdAt: string;
}

const TYPE_MAP: Record<string, { label: string; icon: string; color: string; bg: string }> = {
    RETURN: { label: 'Đổi trả', icon: '↩️', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    EXCHANGE: { label: 'Đổi SP', icon: '🔄', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    WARRANTY: { label: 'Bảo hành', icon: '🛡️', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'Chờ xử lý', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    APPROVED: { label: 'Đã duyệt', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    REJECTED: { label: 'Từ chối', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    PROCESSING: { label: 'Đang xử lý', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)' },
    COMPLETED: { label: 'Hoàn thành', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    CANCELLED: { label: 'Đã huỷ', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

const fmt = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtMoney = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default function AdminReturnsPage() {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [filter, setFilter] = useState('ALL');
    const [toast, setToast] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [aiCategories, setAiCategories] = useState<Record<string, AICategory>>({});
    const [aiCatLoading, setAiCatLoading] = useState<string | null>(null);

    const fetchReturns = useCallback(async () => {
        const res = await fetch('/api/admin/returns');
        const data = await res.json();
        setReturns(data.returns || []);
    }, []);

    const { refreshing } = usePullToRefresh({ onRefresh: fetchReturns });

    const toggleSelect = (id: string) => setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });

    const batchAction = async (status: string) => {
        // Optimistic: update UI immediately
        const idsToUpdate = Array.from(selectedIds);
        const previousReturns = [...returns];
        setReturns(prev => prev.map(r => idsToUpdate.includes(r.id) ? { ...r, status } : r));
        setSelectedIds(new Set());
        showToast(`✅ Đã ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} ${idsToUpdate.length} yêu cầu`);

        // Then sync with server
        try {
            for (const id of idsToUpdate) await updateStatus(id, status);
        } catch {
            // Rollback on error
            setReturns(previousReturns);
            showToast('⚠️ Lỗi — đã hoàn tác');
        }
    };

    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const updateStatus = async (id: string, status: string) => {
        await fetch('/api/admin/returns', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status }),
        });
        setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        showToast(`✅ Cập nhật → ${STATUS_MAP[status]?.label || status}`);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>↩️ Đổi trả / Bảo hành</h1>
                <ExportButton
                    data={filtered.map(r => ({ ...r } as unknown as Record<string, unknown>))}
                    columns={[
                        { key: 'code', label: 'Mã' },
                        { key: 'customerName', label: 'Khách hàng' },
                        { key: 'type', label: 'Loại' },
                        { key: 'status', label: 'Trạng thái' },
                        { key: 'reason', label: 'Lý do' },
                        { key: 'createdAt', label: 'Ngày tạo' },
                    ]}
                    filename="doi-tra"
                />
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
            <div className="zen-stat-grid">
                {Object.entries(counts).map(([key, count]) => (
                    <button key={key} onClick={() => setFilter(key)}
                        className="admin-stat-card" style={{
                            cursor: 'pointer', border: 'none',
                            outline: filter === key ? '2px solid var(--gold-400)' : 'none',
                        }}>
                        <div className="admin-stat-card__value" style={{ color: key === 'PENDING' && count > 0 ? '#f59e0b' : 'var(--text-primary)' }}>{count}</div>
                        <div className="admin-stat-card__label">
                            {key === 'ALL' ? 'Tất cả' : STATUS_MAP[key]?.label || key}
                        </div>
                    </button>
                ))}
            </div>

            {/* Batch Action Bar */}
            {selectedIds.size > 0 && (
                <div className="zen-batch-bar">
                    <span className="zen-batch-bar__count">📋 {selectedIds.size} đã chọn</span>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-sm" onClick={() => batchAction('APPROVED')} style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'none', padding: '6px 14px', borderRadius: 99, fontWeight: 600, fontSize: 12 }}>✅ Duyệt tất cả</button>
                        <button className="btn btn-sm" onClick={() => batchAction('REJECTED')} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', padding: '6px 14px', borderRadius: 99, fontWeight: 600, fontSize: 12 }}>❌ Từ chối</button>
                        <button className="btn btn-sm" onClick={() => setSelectedIds(new Set())} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}>✕</button>
                    </div>
                </div>
            )}

            {/* Mobile Card View */}
            <div className="zen-mobile-cards">
                {filtered.length === 0 ? (
                    <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>Không có yêu cầu nào</div>
                ) : filtered.map(r => (
                    <div key={r.id} className="zen-mobile-card" style={{ outline: selectedIds.has(r.id) ? '2px solid var(--gold-400)' : 'none' }}>
                        <div className="zen-mobile-card__header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} style={{ width: 16, height: 16, accentColor: 'var(--gold-400)' }} />
                                <div>
                                    <div className="zen-mobile-card__title">{r.code}</div>
                                    <div className="zen-mobile-card__subtitle">{r.customerName} · {r.orderCode}</div>
                                </div>
                            </div>
                            <span className="zen-mobile-card__badge" style={{ background: STATUS_MAP[r.status]?.bg, color: STATUS_MAP[r.status]?.color }}>
                                {STATUS_MAP[r.status]?.label || r.status}
                            </span>
                        </div>
                        <div className="zen-mobile-card__fields">
                            <div>
                                <div className="zen-mobile-card__field-label">Loại</div>
                                <div className="zen-mobile-card__field-value" style={{ color: TYPE_MAP[r.type]?.color }}>
                                    {TYPE_MAP[r.type]?.icon} {TYPE_MAP[r.type]?.label || r.type}
                                </div>
                            </div>
                            <div>
                                <div className="zen-mobile-card__field-label">Ngày tạo</div>
                                <div className="zen-mobile-card__field-value">{fmt(r.createdAt)}</div>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <div className="zen-mobile-card__field-label">Lý do</div>
                                <div className="zen-mobile-card__field-value">{r.reason}</div>
                            </div>
                            {r.refundAmount ? (
                                <div>
                                    <div className="zen-mobile-card__field-label">Hoàn tiền</div>
                                    <div className="zen-mobile-card__field-value" style={{ color: '#ef4444', fontWeight: 600 }}>{fmtMoney(r.refundAmount)}</div>
                                </div>
                            ) : null}
                        </div>
                        {(r.status === 'PENDING' || r.status === 'APPROVED' || r.status === 'PROCESSING') && (
                            <div className="zen-mobile-card__actions">
                                {r.status === 'PENDING' && (
                                    <>
                                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(r.id, 'APPROVED')}>✅ Duyệt</button>
                                        <button className="btn btn-sm btn-ghost" style={{ color: '#ef4444' }} onClick={() => updateStatus(r.id, 'REJECTED')}>❌ Từ chối</button>
                                    </>
                                )}
                                {r.status === 'APPROVED' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(r.id, 'PROCESSING')}>⚙️ Xử lý</button>}
                                {r.status === 'PROCESSING' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(r.id, 'COMPLETED')}>✅ Hoàn tất</button>}
                                <button className="btn btn-sm" disabled={aiCatLoading === r.id} onClick={async () => {
                                    setAiCatLoading(r.id);
                                    try {
                                        const res = await fetch('/api/ai/categorize-return', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: r.reason, description: r.description, type: r.type }) });
                                        const data = await res.json();
                                        setAiCategories(prev => ({ ...prev, [r.id]: data }));
                                    } catch { /* skip */ }
                                    setAiCatLoading(null);
                                }} style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: 'none' }}>
                                    {aiCatLoading === r.id ? '⏳...' : '🤖 Phân loại'}
                                </button>
                            </div>
                        )}
                        {aiCategories[r.id] && (
                            <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', background: 'rgba(168,85,247,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168,85,247,0.2)' }}>
                                <div style={{ fontSize: 10, color: '#a855f7', fontWeight: 700, marginBottom: 4 }}>
                                    🤖 {aiCategories[r.id].category} · {Math.round(aiCategories[r.id].confidence * 100)}% · Đề xuất: {aiCategories[r.id].recommendation === 'approve' ? '✅ Duyệt' : aiCategories[r.id].recommendation === 'reject' ? '❌ Từ chối' : '👁️ Xem xét'}
                                </div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{aiCategories[r.id].reasoning}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="zen-table-desktop card" style={{ overflow: 'auto' }}>
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
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Không có yêu cầu nào</td></tr>
                        )}
                        {filtered.map(r => (
                            <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.05))' }}>
                                <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--gold-400)' }}>{r.code}</td>
                                <td style={{ padding: 'var(--space-3)' }}>{r.orderCode}</td>
                                <td style={{ padding: 'var(--space-3)' }}>{r.customerName}</td>
                                <td style={{ padding: 'var(--space-3)' }}>
                                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', background: TYPE_MAP[r.type]?.bg, color: TYPE_MAP[r.type]?.color }}>
                                        {TYPE_MAP[r.type]?.icon} {TYPE_MAP[r.type]?.label || r.type}
                                    </span>
                                </td>
                                <td style={{ padding: 'var(--space-3)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                                <td style={{ padding: 'var(--space-3)' }}>
                                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', background: STATUS_MAP[r.status]?.bg, color: STATUS_MAP[r.status]?.color, fontWeight: 600 }}>
                                        {STATUS_MAP[r.status]?.label || r.status}
                                    </span>
                                    {r.refundAmount ? <div style={{ fontSize: 'var(--text-xs)', color: '#ef4444', marginTop: 2 }}>Hoàn: {fmtMoney(r.refundAmount)}</div> : null}
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
                                        {r.status === 'APPROVED' && <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(r.id, 'PROCESSING')} style={{ fontSize: 'var(--text-xs)' }}>⚙️ Xử lý</button>}
                                        {r.status === 'PROCESSING' && <button className="btn btn-sm btn-ghost" onClick={() => updateStatus(r.id, 'COMPLETED')} style={{ fontSize: 'var(--text-xs)', color: '#22c55e' }}>✅ Hoàn tất</button>}
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
                    • Đơn RETURNED sẽ trừ khỏi &quot;Doanh thu đã giao&quot; (Net Delivered Revenue)
                </div>
            </div>
        </div>
    );
}
