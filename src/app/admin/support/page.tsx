'use client';

import { useState } from 'react';

type AIReply = { intent: string; suggestedReply: string; priority: string; confidence: number };

interface Ticket {
    id: string; code: string; customer: string; subject: string;
    channel: string; status: string; priority: string; assignee: string; createdAt: string;
}

const TICKETS: Ticket[] = [
    { id: 't1', code: 'TK-0001', customer: 'Nguyễn Văn A', subject: 'Kính bị xước sau 2 ngày', channel: '🟦 Zalo', status: 'open', priority: 'high', assignee: '', createdAt: '21/02 09:00' },
    { id: 't2', code: 'TK-0002', customer: 'Trần Thị B', subject: 'Muốn đổi size gọng kính', channel: '💬 Chat', status: 'pending', priority: 'medium', assignee: 'Staff A', createdAt: '20/02 15:30' },
    { id: 't3', code: 'TK-0003', customer: 'Lê Văn C', subject: 'Hỏi về tròng đổi màu', channel: '📧 Email', status: 'pending', priority: 'low', assignee: 'Staff B', createdAt: '20/02 10:00' },
    { id: 't4', code: 'TK-0004', customer: 'Phạm Thị D', subject: 'Đơn hàng bị giao nhầm', channel: '📞 Phone', status: 'open', priority: 'urgent', assignee: '', createdAt: '21/02 08:30' },
    { id: 't5', code: 'TK-0005', customer: 'Hoàng Văn E', subject: 'Yêu cầu hoá đơn VAT', channel: '📧 Email', status: 'resolved', priority: 'low', assignee: 'Staff A', createdAt: '19/02 14:00' },
];

const CANNED = [
    { id: 'c1', label: '👋 Chào khách', text: 'Xin chào! Cảm ơn đã liên hệ Siêu Thị Mắt Kính. Em có thể hỗ trợ gì ạ?' },
    { id: 'c2', label: '📦 Tra cứu đơn', text: 'Anh/chị cung cấp mã đơn hàng (SMK-XXXXXX) để em kiểm tra ạ.' },
    { id: 'c3', label: '↩️ Đổi trả', text: '7 ngày đổi trả, sản phẩm còn nguyên tem/hộp. BH gọng 6 tháng, tròng 12 tháng.' },
    { id: 'c4', label: '👓 Tư vấn tròng', text: 'Chống xanh 350k, Đổi màu 650k, UV 200k, Phân cực 500k. Anh/chị muốn loại nào?' },
    { id: 'c5', label: '🙏 Đóng ticket', text: 'Cảm ơn anh/chị! Nếu cần hỗ trợ thêm, cứ nhắn cho em ạ. Chúc vui! 🌟' },
];

const P_COLORS: Record<string, { color: string; bg: string; label: string }> = {
    urgent: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: '🔴 Urgent' },
    high: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: '🟡 High' },
    medium: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', label: '🔵 Medium' },
    low: { color: '#9ca3af', bg: 'rgba(156,163,175,0.15)', label: '⚪ Low' },
};
const S_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    open: { label: '🔴 Mới', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    pending: { label: '🟡 Xử lý', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    resolved: { label: '🟢 Xong', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    closed: { label: '⚫ Đóng', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState(TICKETS);
    const [filter, setFilter] = useState('all');
    const [toast, setToast] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [aiReplies, setAiReplies] = useState<Record<string, AIReply>>({});
    const [aiLoading, setAiLoading] = useState<string | null>(null);

    const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };
    const assign = (id: string) => { setTickets(p => p.map(t => t.id === id ? { ...t, assignee: 'Admin', status: 'pending' } : t)); showToast('👤 Đã nhận ticket'); };
    const resolve = (id: string) => { setTickets(p => p.map(t => t.id === id ? { ...t, status: 'resolved' } : t)); showToast('✅ Đã giải quyết'); };
    const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

    const list = tickets.filter(t => filter === 'all' || t.status === filter)
        .sort((a, b) => { const o: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }; return (a.status === 'open' ? -10 : 0) - (b.status === 'open' ? -10 : 0) || (o[a.priority] ?? 9) - (o[b.priority] ?? 9); });

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>🎧 Hỗ trợ khách hàng</h1>
                {tickets.filter(t => t.status === 'open').length > 0 && <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>🔴 {tickets.filter(t => t.status === 'open').length} mới</span>}
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>Ticket hỗ trợ — phân công, xử lý, reply nhanh</p>

            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{toast}</div>}

            <div className="admin-filter-scroll" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                {[['all', 'Tất cả'], ['open', '🔴 Mới'], ['pending', '🟡 Xử lý'], ['resolved', '🟢 Xong']].map(([k, l]) => (
                    <button key={k} onClick={() => setFilter(k)} className="btn btn-sm" style={{ background: filter === k ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)', color: filter === k ? 'var(--gold-400)' : 'var(--text-muted)', border: filter === k ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)' }}>{l}</button>
                ))}
            </div>

            {/* Mobile Card View */}
            <div className="zen-mobile-cards" style={{ marginBottom: 'var(--space-6)' }}>
                {list.length === 0 ? (
                    <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>Không có ticket nào</div>
                ) : list.map(t => (
                    <div key={t.id} className={`zen-mobile-card ${t.status === 'open' ? 'zen-mobile-card--highlight' : ''}`}
                        style={{ borderLeftColor: t.status === 'open' ? '#ef4444' : undefined }}>
                        <div className="zen-mobile-card__header">
                            <div>
                                <div className="zen-mobile-card__title">{t.subject}</div>
                                <div className="zen-mobile-card__subtitle">{t.code} · {t.customer}</div>
                            </div>
                            <span className="zen-mobile-card__badge" style={{ background: S_LABELS[t.status]?.bg, color: S_LABELS[t.status]?.color }}>
                                {S_LABELS[t.status]?.label || t.status}
                            </span>
                        </div>
                        <div className="zen-mobile-card__fields zen-mobile-card__fields--3col">
                            <div>
                                <div className="zen-mobile-card__field-label">Kênh</div>
                                <div className="zen-mobile-card__field-value">{t.channel}</div>
                            </div>
                            <div>
                                <div className="zen-mobile-card__field-label">Ưu tiên</div>
                                <div className="zen-mobile-card__field-value" style={{ color: P_COLORS[t.priority]?.color }}>{P_COLORS[t.priority]?.label}</div>
                            </div>
                            <div>
                                <div className="zen-mobile-card__field-label">Phân công</div>
                                <div className="zen-mobile-card__field-value">{t.assignee || '—'}</div>
                            </div>
                        </div>
                        {(t.status === 'open' || t.status === 'pending') && (
                            <div className="zen-mobile-card__actions">
                                {t.status === 'open' && <button className="btn btn-sm" onClick={() => assign(t.id)}>👤 Nhận</button>}
                                <button className="btn btn-sm" style={{ color: '#22c55e' }} onClick={() => resolve(t.id)}>✅ Xong</button>
                                <button className="btn btn-sm" disabled={aiLoading === t.id} onClick={async () => {
                                    setAiLoading(t.id);
                                    try {
                                        const res = await fetch('/api/ai/support-reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject: t.subject, message: t.subject, channel: t.channel }) });
                                        const data = await res.json();
                                        setAiReplies(prev => ({ ...prev, [t.id]: data }));
                                    } catch { showToast('⚠️ Lỗi AI'); }
                                    setAiLoading(null);
                                }} style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: 'none' }}>
                                    {aiLoading === t.id ? '⏳...' : '🤖 AI Reply'}
                                </button>
                            </div>
                        )}
                        {aiReplies[t.id] && (
                            <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', background: 'rgba(168,85,247,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168,85,247,0.2)' }}>
                                <div style={{ fontSize: 10, color: '#a855f7', fontWeight: 700, marginBottom: 4 }}>🤖 AI · {aiReplies[t.id].intent} · {Math.round(aiReplies[t.id].confidence * 100)}%</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{aiReplies[t.id].suggestedReply}</div>
                                <button className="btn btn-sm" style={{ marginTop: 8, fontSize: 10 }} onClick={() => { navigator.clipboard.writeText(aiReplies[t.id].suggestedReply); showToast('📋 Đã copy!'); }}>📋 Copy</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="zen-table-desktop card" style={{ overflow: 'auto', marginBottom: 'var(--space-6)' }}>
                <table className="data-table">
                    <thead><tr><th>Mã</th><th>Kênh</th><th>Khách</th><th>Chủ đề</th><th>Ưu tiên</th><th>Trạng thái</th><th>Phân công</th><th>Tạo</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        {list.map(t => (
                            <tr key={t.id} style={{ background: t.status === 'open' ? 'rgba(239,68,68,0.03)' : undefined }}>
                                <td><strong style={{ color: 'var(--gold-400)', fontSize: 'var(--text-xs)' }}>{t.code}</strong></td>
                                <td>{t.channel}</td>
                                <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.customer}</td>
                                <td style={{ fontSize: 'var(--text-sm)' }}>{t.subject}</td>
                                <td><span className="badge" style={{ color: P_COLORS[t.priority]?.color, background: P_COLORS[t.priority]?.bg, textTransform: 'uppercase', fontSize: 'var(--text-xs)' }}>{t.priority}</span></td>
                                <td style={{ fontSize: 'var(--text-xs)' }}>{S_LABELS[t.status]?.label || t.status}</td>
                                <td style={{ fontSize: 'var(--text-xs)', color: t.assignee ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{t.assignee || '—'}</td>
                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t.createdAt}</td>
                                <td>
                                    {t.status === 'open' && <button onClick={() => assign(t.id)} className="btn btn-sm" style={{ fontSize: 'var(--text-xs)', marginRight: 4 }}>👤 Nhận</button>}
                                    {(t.status === 'open' || t.status === 'pending') && <button onClick={() => resolve(t.id)} className="btn btn-sm" style={{ fontSize: 'var(--text-xs)', color: '#22c55e' }}>✅ Xong</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>⚡ Reply nhanh</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
                {CANNED.map(cr => (
                    <div key={cr.id} className="card" style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                            <strong style={{ fontSize: 'var(--text-sm)' }}>{cr.label}</strong>
                            <button onClick={() => copy(cr.text, cr.id)} className="btn btn-sm btn-ghost" style={{ fontSize: 'var(--text-xs)', color: copiedId === cr.id ? '#22c55e' : 'var(--text-muted)' }}>{copiedId === cr.id ? '✅ Copied!' : '📋 Copy'}</button>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{cr.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
