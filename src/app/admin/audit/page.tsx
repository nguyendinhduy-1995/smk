'use client';

import { useState, useEffect } from 'react';

interface AuditLog {
    id: string; action: string; entity: string; entityId: string;
    actor: string; role: string; detail: string; ip: string; at: string;
}

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
    CREATE: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
    UPDATE: { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa' },
    DELETE: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    LOGIN: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' },
};
const ROLE_COLORS: Record<string, string> = { ADMIN: '#ef4444', STORE_MANAGER: '#3b82f6', STAFF: '#22c55e', SYSTEM: '#9ca3af', CUSTOMER: '#f59e0b' };

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const PER_PAGE = 50;

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/audit?page=${page}&limit=${PER_PAGE}`, { credentials: 'include' })
            .then(r => r.ok ? r.json() : { logs: [] })
            .then(data => setLogs(data.logs || []))
            .catch(() => setLogs([]))
            .finally(() => setLoading(false));
    }, [page]);

    const filtered = logs.filter(l => filter === 'all' || l.action === filter);

    if (loading) return (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="analytics-loading__spinner" />
            <p>Đang tải nhật ký...</p>
        </div>
    );

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Nhật ký hệ thống</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>Ai làm gì, lúc nào — toàn bộ thao tác trên hệ thống</p>

            <div className="zen-stat-grid">
                {[
                    { label: 'Tổng', value: logs.length, color: 'var(--text-primary)', icon: '📊' },
                    { label: 'CREATE', value: logs.filter(l => l.action === 'CREATE').length, color: '#22c55e', icon: '➕' },
                    { label: 'UPDATE', value: logs.filter(l => l.action === 'UPDATE').length, color: '#60a5fa', icon: '✏️' },
                    { label: 'DELETE', value: logs.filter(l => l.action === 'DELETE').length, color: '#ef4444', icon: '🗑' },
                ].map(s => (
                    <div key={s.label} className="admin-stat-card">
                        <div className="admin-stat-card__header">
                            <span className="admin-stat-card__icon">{s.icon}</span>
                            <span className="admin-stat-card__label">{s.label}</span>
                        </div>
                        <div className="admin-stat-card__value" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="admin-filter-scroll" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                {[['all', 'Tất cả'], ['CREATE', 'Create'], ['UPDATE', 'Update'], ['DELETE', 'Delete'], ['LOGIN', 'Login']].map(([k, l]) => (
                    <button key={k} onClick={() => setFilter(k)} className="btn btn-sm" style={{ background: filter === k ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)', color: filter === k ? 'var(--gold-400)' : 'var(--text-muted)', border: filter === k ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)' }}>{l}</button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 8 }}>Chưa có nhật ký hệ thống</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                        Các thao tác CREATE/UPDATE/DELETE sẽ được tự động ghi log khi bạn quản lý sản phẩm, đơn hàng, người dùng và các cấu hình hệ thống.
                    </p>
                </div>
            ) : (
                <>
                    {/* Mobile Card View */}
                    <div className="zen-mobile-cards">
                        {filtered.map(l => {
                            const a = ACTION_COLORS[l.action] || ACTION_COLORS.UPDATE;
                            return (
                                <div key={l.id} className="zen-mobile-card" style={{ borderLeft: `3px solid ${a.text}` }}>
                                    <div className="zen-mobile-card__header">
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                                                <span className="zen-mobile-card__badge" style={{ background: a.bg, color: a.text }}>{l.action}</span>
                                                <span style={{ fontWeight: 600, fontSize: 13 }}>{l.entity}</span>
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--gold-400)', fontFamily: 'monospace' }}>{l.entityId}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.at}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--space-2)', lineHeight: 1.4 }}>
                                        {l.detail}
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 11, color: 'var(--text-muted)' }}>
                                        <span>{l.actor}</span>
                                        <span style={{ padding: '1px 6px', borderRadius: 3, background: `${ROLE_COLORS[l.role] || '#9ca3af'}22`, color: ROLE_COLORS[l.role] || '#9ca3af', fontWeight: 600, fontSize: 10 }}>{l.role}</span>
                                        {l.ip !== '—' && <span style={{ fontFamily: 'monospace' }}>{l.ip}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop Table */}
                    <div className="zen-table-desktop card" style={{ overflow: 'auto' }}>
                        <table className="data-table">
                            <thead><tr><th>Thời gian</th><th>Action</th><th>Entity</th><th>ID</th><th>Chi tiết</th><th>Người</th><th>Role</th><th>IP</th></tr></thead>
                            <tbody>
                                {filtered.map(l => {
                                    const a = ACTION_COLORS[l.action] || ACTION_COLORS.UPDATE;
                                    return (
                                        <tr key={l.id}>
                                            <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{l.at}</td>
                                            <td><span className="badge" style={{ background: a.bg, color: a.text, fontSize: 'var(--text-xs)' }}>{l.action}</span></td>
                                            <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{l.entity}</td>
                                            <td><code style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)' }}>{l.entityId}</code></td>
                                            <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: 250 }}>{l.detail}</td>
                                            <td style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{l.actor}</td>
                                            <td><span className="badge" style={{ background: `${ROLE_COLORS[l.role] || '#9ca3af'}22`, color: ROLE_COLORS[l.role] || '#9ca3af', fontSize: 'var(--text-xs)' }}>{l.role}</span></td>
                                            <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{l.ip}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                        <button className="btn btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>← Trước</button>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: '6px 12px' }}>Trang {page}</span>
                        <button className="btn btn-sm" onClick={() => setPage(p => p + 1)} disabled={logs.length < PER_PAGE}>Sau →</button>
                    </div>
                </>
            )}

            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 24 }}>🔒</span>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>RBAC &amp; Audit Policy:</strong><br />
                    • Mọi thao tác CREATE/UPDATE/DELETE đều được ghi log<br />
                    • Log bao gồm: actor, role, IP, timestamp, entity + detail<br />
                    • Audit logs lưu vĩnh viễn, không thể xoá
                </div>
            </div>
        </div>
    );
}
