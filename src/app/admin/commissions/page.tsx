'use client';

import { useState, useEffect } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface Commission {
    id: string;
    orderId: string;
    partnerId: string;
    amount: number;
    status: string;
    holdUntil: string | null;
    createdAt: string;
    partner: { partnerCode: string; level: string; user: { name: string } };
    order: { code: string; total: number; status: string; createdAt: string };
}

interface Summary {
    [status: string]: { total: number; count: number };
}

const STATUS_CLS: Record<string, string> = {
    PENDING: 'badge-warning',
    AVAILABLE: 'badge-success',
    PAID: 'badge-gold',
    REVERSED: 'badge-error',
};

export default function AdminCommissionsPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [summary, setSummary] = useState<Summary>({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [releaseLoading, setReleaseLoading] = useState(false);
    const [releaseResult, setReleaseResult] = useState<string | null>(null);

    const fetchData = (status?: string) => {
        setLoading(true);
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        params.set('limit', '50');

        fetch(`/api/admin/commissions?${params}`)
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((res) => {
                setCommissions(res.commissions || []);
                setSummary(res.summary || {});
            })
            .catch(() => {
                setCommissions([]);
                setSummary({});
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(filter || undefined); }, [filter]);

    const handleAction = async (commId: string, action: 'release' | 'reverse') => {
        if (!confirm(`Bạn muốn ${action === 'release' ? 'giải phóng' : 'hoàn trả'} hoa hồng này?`)) return;
        setActionLoading(commId);
        try {
            await fetch('/api/admin/commissions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commissionId: commId, action }),
            });
            fetchData(filter || undefined);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAutoRelease = async () => {
        if (!confirm('Tự động giải phóng tất cả hoa hồng quá hạn hold?')) return;
        setReleaseLoading(true);
        setReleaseResult(null);
        try {
            const res = await fetch('/api/admin/commissions/release', { method: 'POST' });
            const body = await res.json();
            setReleaseResult(`Đã xử lý ${body.processedTotal} · Giải phóng ${body.released} · Hoàn ${body.reversed} · Nâng cấp ${body.tierUpgrades?.length || 0}`);
            fetchData(filter || undefined);
        } finally {
            setReleaseLoading(false);
        }
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Quản lý Hoa hồng</h1>
                <button className="btn btn-primary" onClick={handleAutoRelease} disabled={releaseLoading}>
                    {releaseLoading ? '⏳ Đang xử lý...' : '⚡ Auto-release'}
                </button>
            </div>

            {releaseResult && (
                <div style={{ padding: 'var(--space-3)', background: 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--success)' }}>
                    ✅ {releaseResult}
                </div>
            )}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                {['PENDING', 'AVAILABLE', 'PAID', 'REVERSED'].map((st) => (
                    <div key={st} className="stat-card" style={{ cursor: 'pointer', borderColor: filter === st ? 'var(--gold-400)' : undefined }} onClick={() => setFilter(filter === st ? '' : st)}>
                        <div className="stat-card__label">{st}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-lg)' }}>
                            {formatVND(summary[st]?.total || 0)}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            {summary[st]?.count || 0} commissions
                        </div>
                    </div>
                ))}
            </div>

            {/* Commissions Table */}
            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Đơn hàng</th>
                            <th>Đối tác</th>
                            <th>Level</th>
                            <th>Hoa hồng</th>
                            <th>Trạng thái</th>
                            <th>Hold đến</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Đang tải...</td></tr>
                        ) : commissions.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Không có dữ liệu</td></tr>
                        ) : (
                            commissions.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 'var(--text-xs)' }}>{c.order.code}</td>
                                    <td>
                                        <span style={{ fontWeight: 600 }}>{c.partner.partnerCode}</span>
                                        <br /><span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.partner.user.name}</span>
                                    </td>
                                    <td><span className="badge badge-neutral" style={{ fontSize: 10 }}>{c.partner.level}</span></td>
                                    <td style={{ color: 'var(--gold-400)', fontWeight: 700 }}>{formatVND(c.amount)}</td>
                                    <td><span className={`badge ${STATUS_CLS[c.status] || ''}`}>{c.status}</span></td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                        {c.holdUntil ? new Date(c.holdUntil).toLocaleDateString('vi-VN') : '—'}
                                    </td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                        {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td>
                                        {c.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button className="btn btn-sm btn-primary" disabled={actionLoading === c.id} onClick={() => handleAction(c.id, 'release')}>
                                                    {actionLoading === c.id ? '...' : '✓'}
                                                </button>
                                                <button className="btn btn-sm btn-ghost" disabled={actionLoading === c.id} onClick={() => handleAction(c.id, 'reverse')}>
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                        {c.status === 'AVAILABLE' && (
                                            <button className="btn btn-sm btn-ghost" disabled={actionLoading === c.id} onClick={() => handleAction(c.id, 'reverse')}>
                                                ✕ Hoàn
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
