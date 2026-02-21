'use client';

import { useState } from 'react';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    actor: string;
    role: string;
    detail: string;
    ip: string;
    at: string;
}

const LOGS: AuditLog[] = [
    { id: 'a1', action: 'UPDATE', entity: 'Order', entityId: 'SMK-240220-B01', actor: 'Admin', role: 'ADMIN', detail: 'Chuyển trạng thái CONFIRMED → SHIPPING', ip: '103.x.x.1', at: '2026-02-21 09:30' },
    { id: 'a2', action: 'CREATE', entity: 'ReturnRequest', entityId: 'RMA-00005', actor: 'System', role: 'SYSTEM', detail: 'Khách yêu cầu đổi trả sản phẩm', ip: '—', at: '2026-02-21 09:15' },
    { id: 'a3', action: 'UPDATE', entity: 'CarrierConfig', entityId: 'GHN', actor: 'Admin', role: 'ADMIN', detail: 'Bật carrier GHN, mode = Webhook', ip: '103.x.x.1', at: '2026-02-21 08:45' },
    { id: 'a4', action: 'DELETE', entity: 'Product', entityId: 'prod_old001', actor: 'Quản lý A', role: 'STORE_MANAGER', detail: 'Xoá sản phẩm "Gọng kính cũ"', ip: '113.x.x.5', at: '2026-02-20 16:00' },
    { id: 'a5', action: 'UPDATE', entity: 'Commission', entityId: 'comm_123', actor: 'System', role: 'SYSTEM', detail: 'Giải phóng hoa hồng 150k → AVAILABLE (đơn delivered)', ip: '—', at: '2026-02-20 02:00' },
    { id: 'a6', action: 'UPDATE', entity: 'User', entityId: 'user_abc', actor: 'Admin', role: 'ADMIN', detail: 'Cập nhật role: STAFF → STORE_MANAGER', ip: '103.x.x.1', at: '2026-02-19 14:30' },
    { id: 'a7', action: 'CREATE', entity: 'Product', entityId: 'prod_new002', actor: 'Staff B', role: 'STAFF', detail: 'Thêm sản phẩm "Cat Eye Retro Blue"', ip: '113.x.x.8', at: '2026-02-19 10:00' },
    { id: 'a8', action: 'UPDATE', entity: 'FraudSignal', entityId: 'FAKE_01', actor: 'System', role: 'SYSTEM', detail: 'Risk score = 92, auto-hold commission', ip: '—', at: '2026-02-19 04:00' },
];

const ACTION_COLORS: Record<string, { bg: string; text: string }> = {
    CREATE: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
    UPDATE: { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa' },
    DELETE: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
};
const ROLE_COLORS: Record<string, string> = { ADMIN: '#ef4444', STORE_MANAGER: '#3b82f6', STAFF: '#22c55e', SYSTEM: '#9ca3af' };

export default function AdminAuditPage() {
    const [filter, setFilter] = useState('all');
    const filtered = LOGS.filter(l => filter === 'all' || l.action === filter);

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>📋 Nhật ký hệ thống</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>Ai làm gì, lúc nào — toàn bộ thao tác trên hệ thống</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Tổng actions', value: LOGS.length, color: 'var(--text-primary)' },
                    { label: '🟢 CREATE', value: LOGS.filter(l => l.action === 'CREATE').length, color: '#22c55e' },
                    { label: '🔵 UPDATE', value: LOGS.filter(l => l.action === 'UPDATE').length, color: '#60a5fa' },
                    { label: '🔴 DELETE', value: LOGS.filter(l => l.action === 'DELETE').length, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {[['all', 'Tất cả'], ['CREATE', '🟢 Create'], ['UPDATE', '🔵 Update'], ['DELETE', '🔴 Delete']].map(([k, l]) => (
                    <button key={k} onClick={() => setFilter(k)} className="btn btn-sm" style={{ background: filter === k ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)', color: filter === k ? 'var(--gold-400)' : 'var(--text-muted)', border: filter === k ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)' }}>{l}</button>
                ))}
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
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
                                    <td><span className="badge" style={{ background: `${ROLE_COLORS[l.role]}22`, color: ROLE_COLORS[l.role], fontSize: 'var(--text-xs)' }}>{l.role}</span></td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{l.ip}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: 24 }}>🔒</span>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>RBAC & Audit Policy:</strong><br />
                    • Mọi thao tác CREATE/UPDATE/DELETE đều được ghi log<br />
                    • Log bao gồm: actor, role, IP, timestamp, entity + detail<br />
                    • ADMIN: toàn quyền · STORE_MANAGER: quản lý SP, đơn, KH · STAFF: xem + xử lý đơn<br />
                    • Audit logs lưu vĩnh viễn, không thể xoá
                </div>
            </div>
        </div>
    );
}
