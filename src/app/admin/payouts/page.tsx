'use client';

import { useState } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface Payout { id: string; partner: string; name: string; amount: number; bank: string; status: string; date: string; note?: string; }

const INIT: Payout[] = [
    { id: 'p1', partner: 'DUY123', name: 'Đại lý Duy', amount: 1500000, bank: 'Vietcombank ****6789', status: 'REQUESTED', date: '20/02' },
    { id: 'p2', partner: 'AFF_MINH', name: 'Minh Affiliate', amount: 800000, bank: 'MB Bank ****4321', status: 'REQUESTED', date: '19/02' },
    { id: 'p3', partner: 'LEADER01', name: 'Shop Hà Nội', amount: 5000000, bank: 'TCB ****8765', status: 'APPROVED', date: '18/02' },
    { id: 'p4', partner: 'DUY123', name: 'Đại lý Duy', amount: 2200000, bank: 'Vietcombank ****6789', status: 'PAID', date: '15/02' },
    { id: 'p5', partner: 'LEADER01', name: 'Shop Hà Nội', amount: 3500000, bank: 'TCB ****8765', status: 'PAID', date: '10/02' },
];

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<Payout[]>(INIT);
    const [filter, setFilter] = useState('all');
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const approvePayout = (id: string) => {
        setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
        showToast('✅ Đã duyệt yêu cầu rút tiền');
    };

    const rejectPayout = (id: string) => {
        const note = prompt('Lý do từ chối:');
        if (!note) return;
        setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED', note } : p));
        showToast('❌ Đã từ chối yêu cầu');
    };

    const markPaid = (id: string) => {
        if (!confirm('Xác nhận đã chuyển tiền?')) return;
        setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: 'PAID' } : p));
        showToast('💸 Đã xác nhận thanh toán');
    };

    const filtered = filter === 'all' ? payouts : payouts.filter(p => p.status === filter);
    const totalPending = payouts.filter(p => p.status === 'REQUESTED').reduce((s, p) => s + p.amount, 0);
    const totalApproved = payouts.filter(p => p.status === 'APPROVED').reduce((s, p) => s + p.amount, 0);

    const STATUS_MAP: Record<string, { label: string; cls: string }> = {
        REQUESTED: { label: '⏳ Chờ duyệt', cls: 'badge-warning' },
        APPROVED: { label: '✅ Đã duyệt', cls: 'badge-success' },
        PAID: { label: '💸 Đã trả', cls: 'badge-info' },
        REJECTED: { label: '❌ Từ chối', cls: 'badge-error' },
    };

    return (
        <div className="animate-in">
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', background: 'rgba(34,197,94,0.9)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{toast}</div>}

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Yêu cầu rút tiền</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                {[
                    { label: 'Chờ duyệt', value: String(payouts.filter(p => p.status === 'REQUESTED').length), color: 'var(--warning)' },
                    { label: 'Đã duyệt', value: String(payouts.filter(p => p.status === 'APPROVED').length), color: 'var(--success)' },
                    { label: 'Tổng chờ duyệt', value: formatVND(totalPending), color: 'var(--warning)' },
                    { label: 'Tổng đã duyệt', value: formatVND(totalApproved), color: 'var(--gold-400)' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-xl)', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {[{ v: 'all', l: 'Tất cả' }, { v: 'REQUESTED', l: '⏳ Chờ duyệt' }, { v: 'APPROVED', l: '✅ Đã duyệt' }, { v: 'PAID', l: '💸 Đã trả' }].map(f => (
                    <button key={f.v} className="filter-chip" onClick={() => setFilter(f.v)}
                        style={{ background: filter === f.v ? 'var(--gold-400)' : undefined, color: filter === f.v ? '#0a0a0f' : undefined }}>{f.l}</button>
                ))}
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead><tr><th>Đối tác</th><th>Số tiền</th><th>Tài khoản</th><th>Trạng thái</th><th>Ngày</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Không có yêu cầu</td></tr>
                        ) : filtered.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.partner}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.name}</div>
                                </td>
                                <td style={{ fontWeight: 700, color: 'var(--gold-400)' }}>{formatVND(p.amount)}</td>
                                <td style={{ fontSize: 'var(--text-xs)' }}>{p.bank}</td>
                                <td>
                                    <span className={`badge ${STATUS_MAP[p.status]?.cls || ''}`}>{STATUS_MAP[p.status]?.label || p.status}</span>
                                    {p.note && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--error)', marginTop: 2 }}>{p.note}</div>}
                                </td>
                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.date}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {p.status === 'REQUESTED' && (
                                            <>
                                                <button className="btn btn-sm btn-primary" onClick={() => approvePayout(p.id)}>✓ Duyệt</button>
                                                <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }} onClick={() => rejectPayout(p.id)}>✕</button>
                                            </>
                                        )}
                                        {p.status === 'APPROVED' && <button className="btn btn-sm btn-primary" onClick={() => markPaid(p.id)}>💸 Thanh toán</button>}
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
