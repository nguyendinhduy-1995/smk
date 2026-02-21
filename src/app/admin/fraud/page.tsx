'use client';

import { useState } from 'react';

interface Signal {
    partner: string; name: string; returnRate: number; cancelRate: number; sameDevice: number; sameAddress: number;
    selfPurchase: number; ipOverlap: number; holdCommission: boolean; score: number; level: string; blocked: boolean;
}

const INIT: Signal[] = [
    { partner: 'FAKE_01', name: 'Tài khoản test', returnRate: 80, cancelRate: 45, sameDevice: 12, sameAddress: 8, selfPurchase: 10, ipOverlap: 12, holdCommission: true, score: 92, level: 'AFFILIATE', blocked: false },
    { partner: 'AFF_MINH', name: 'Minh Affiliate', returnRate: 35, cancelRate: 12, sameDevice: 3, sameAddress: 5, selfPurchase: 2, ipOverlap: 4, holdCommission: true, score: 58, level: 'AFFILIATE', blocked: false },
    { partner: 'DUY123', name: 'Đại lý Duy', returnRate: 8, cancelRate: 5, sameDevice: 0, sameAddress: 1, selfPurchase: 0, ipOverlap: 0, holdCommission: false, score: 12, level: 'AGENT', blocked: false },
    { partner: 'LEADER01', name: 'Shop Hà Nội', returnRate: 3, cancelRate: 2, sameDevice: 0, sameAddress: 0, selfPurchase: 0, ipOverlap: 0, holdCommission: false, score: 5, level: 'LEADER', blocked: false },
];

export default function AdminFraudPage() {
    const [signals, setSignals] = useState<Signal[]>(INIT);
    const [selectedPartner, setSelectedPartner] = useState<Signal | null>(null);
    const [toast, setToast] = useState('');
    const [recalculating, setRecalculating] = useState(false);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const blockPartner = (code: string) => {
        if (!confirm(`Block đối tác ${code}? Hoa hồng sẽ bị giữ vĩnh viễn.`)) return;
        setSignals(prev => prev.map(s => s.partner === code ? { ...s, blocked: true, holdCommission: true } : s));
        showToast(`🚫 Đã block ${code}`);
    };

    const unblockPartner = (code: string) => {
        setSignals(prev => prev.map(s => s.partner === code ? { ...s, blocked: false } : s));
        showToast(`✅ Đã unblock ${code}`);
    };

    const toggleHoldCommission = (code: string) => {
        setSignals(prev => prev.map(s => s.partner === code ? { ...s, holdCommission: !s.holdCommission } : s));
        showToast('✅ Đã cập nhật trạng thái hoa hồng');
    };

    const recalculate = () => {
        setRecalculating(true);
        setTimeout(() => {
            setSignals(prev => prev.map(s => {
                let score = 0;
                if (s.returnRate > 25) score += 30; else if (s.returnRate > 15) score += 15;
                if (s.cancelRate > 20) score += 20; else if (s.cancelRate > 10) score += 10;
                score += s.sameDevice * 5 + s.sameAddress * 3 + s.selfPurchase * 10 + s.ipOverlap * 5;
                return { ...s, score: Math.min(score, 100), holdCommission: score > 40 ? true : s.holdCommission };
            }));
            setRecalculating(false);
            showToast('✅ Đã tính toán lại risk score');
        }, 800);
    };

    const high = signals.filter(s => s.score > 60).length;
    const warn = signals.filter(s => s.score > 30 && s.score <= 60).length;
    const safe = signals.filter(s => s.score <= 30).length;
    const avgReturn = signals.length > 0 ? Math.round(signals.reduce((sum, s) => sum + s.returnRate, 0) / signals.length) : 0;

    return (
        <div className="animate-in">
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', background: 'rgba(34,197,94,0.9)', color: '#fff', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{toast}</div>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Phát hiện gian lận</h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Theo dõi risk score của đối tác</p>
                </div>
                <button className="btn btn-primary" onClick={recalculate} disabled={recalculating}>
                    {recalculating ? '⏳ Đang tính...' : '🔄 Tính toán lại'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                {[
                    { label: '🔴 Cao rủi ro', value: String(high), color: 'var(--error)' },
                    { label: '🟡 Cảnh báo', value: String(warn), color: 'var(--warning)' },
                    { label: '🟢 An toàn', value: String(safe), color: 'var(--success)' },
                    { label: 'Tỉ lệ hoàn TB', value: `${avgReturn}%`, color: 'var(--text-primary)' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-2xl)', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Detail panel */}
            {selectedPartner && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)', border: '1px solid var(--gold-400)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>🔍 Chi tiết: {selectedPartner.partner}</h3>
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedPartner(null)}>✕</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tên:</span> {selectedPartner.name}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Level:</span> {selectedPartner.level}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Score:</span> <strong style={{ color: selectedPartner.score > 60 ? 'var(--error)' : 'var(--warning)' }}>{selectedPartner.score}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Return rate:</span> <span style={{ color: selectedPartner.returnRate > 25 ? 'var(--error)' : 'inherit' }}>{selectedPartner.returnRate}%</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Cancel rate:</span> {selectedPartner.cancelRate}%</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Same device:</span> {selectedPartner.sameDevice}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Tự mua:</span> <span style={{ color: selectedPartner.selfPurchase > 0 ? 'var(--error)' : 'inherit' }}>{selectedPartner.selfPurchase}</span></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>IP trùng:</span> {selectedPartner.ipOverlap}</div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Trạng thái:</span> {selectedPartner.blocked ? '🚫 Blocked' : selectedPartner.holdCommission ? '🔒 Hold HH' : '✅ OK'}</div>
                    </div>
                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-sm" onClick={() => toggleHoldCommission(selectedPartner.partner)} style={{ background: 'var(--bg-tertiary)' }}>
                            {selectedPartner.holdCommission ? '🔓 Giải phóng HH' : '🔒 Giữ HH'}
                        </button>
                        {selectedPartner.blocked
                            ? <button className="btn btn-sm btn-primary" onClick={() => { unblockPartner(selectedPartner.partner); setSelectedPartner(null); }}>✅ Unblock</button>
                            : <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--error)' }} onClick={() => { blockPartner(selectedPartner.partner); setSelectedPartner(null); }}>🚫 Block</button>
                        }
                    </div>
                </div>
            )}

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr><th>Đối tác</th><th>Cấp</th><th>Hoàn (%)</th><th>Huỷ (%)</th><th>Cùng device</th><th>Tự mua</th><th>IP trùng</th><th>Risk Score</th><th>HH</th><th>Thao tác</th></tr>
                    </thead>
                    <tbody>
                        {signals.sort((a, b) => b.score - a.score).map(s => (
                            <tr key={s.partner} style={{ opacity: s.blocked ? 0.5 : 1 }}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.partner} {s.blocked && '🚫'}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.name}</div>
                                </td>
                                <td><span className="badge" style={{ background: 'var(--bg-tertiary)' }}>{s.level === 'LEADER' ? '👑' : s.level === 'AGENT' ? '🏆' : '⭐'} {s.level}</span></td>
                                <td style={{ color: s.returnRate > 25 ? 'var(--error)' : s.returnRate > 15 ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}>{s.returnRate}%</td>
                                <td style={{ color: s.cancelRate > 20 ? 'var(--error)' : s.cancelRate > 10 ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}>{s.cancelRate}%</td>
                                <td>{s.sameDevice}</td>
                                <td style={{ color: s.selfPurchase > 0 ? 'var(--error)' : 'var(--text-muted)', fontWeight: s.selfPurchase > 0 ? 700 : 400 }}>
                                    {s.selfPurchase > 0 ? `🚨 ${s.selfPurchase}` : '0'}
                                </td>
                                <td style={{ color: s.ipOverlap > 2 ? 'var(--warning)' : 'var(--text-muted)' }}>{s.ipOverlap > 0 ? `⚠️ ${s.ipOverlap}` : '0'}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(s.score, 100)}%`, height: '100%', background: s.score > 60 ? 'var(--error)' : s.score > 30 ? 'var(--warning)' : 'var(--success)', borderRadius: 3 }} />
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: s.score > 60 ? 'var(--error)' : s.score > 30 ? 'var(--warning)' : 'var(--success)' }}>{s.score}</span>
                                    </div>
                                </td>
                                <td>
                                    <button className={`badge`} onClick={() => toggleHoldCommission(s.partner)}
                                        style={{ cursor: 'pointer', border: 'none', background: s.holdCommission ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: s.holdCommission ? 'var(--error)' : 'var(--success)', fontSize: 'var(--text-xs)' }}>
                                        {s.holdCommission ? '🔒 Giữ' : '✅ OK'}
                                    </button>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button className="btn btn-sm btn-ghost" onClick={() => setSelectedPartner(s)}>👁️</button>
                                        {!s.blocked && s.score > 60 && <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--error)' }} onClick={() => blockPartner(s.partner)}>🚫</button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong>Quy tắc tính Risk Score:</strong><br />
                Return rate &gt;25% (+30), &gt;15% (+15) · Cancel rate &gt;20% (+20), &gt;10% (+10)<br />
                Same device (+5/đơn) · Same address (+3/đơn) · <strong style={{ color: 'var(--error)' }}>Tự mua (+10/đơn)</strong> · <strong style={{ color: 'var(--warning)' }}>IP trùng (+5/đơn)</strong><br />
                Score &gt;40 → <strong>tự động giữ commission</strong> chờ admin review thủ công
            </div>
        </div>
    );
}
