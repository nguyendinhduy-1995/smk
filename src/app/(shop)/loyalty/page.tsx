'use client';

import { useState, useEffect } from 'react';

const LOYALTY_TIERS = [
    { name: 'Thành viên', minPoints: 0, discount: 0, icon: '🥉', color: '#cd7f32' },
    { name: 'Bạc', minPoints: 500, discount: 3, icon: '🥈', color: '#c0c0c0' },
    { name: 'Vàng', minPoints: 2000, discount: 5, icon: '🥇', color: '#ffd700' },
    { name: 'Kim Cương', minPoints: 5000, discount: 10, icon: '💎', color: '#60a5fa' },
];

const VOUCHERS = [
    { id: 'v1', name: 'Giảm 5%', cost: 200, code: 'LOYAL5', icon: '🏷️', desc: 'Giảm 5% toàn đơn (tối đa 100K)' },
    { id: 'v2', name: 'Giảm 50K', cost: 300, code: 'LOYAL50K', icon: '💰', desc: 'Giảm 50K cho đơn từ 500K' },
    { id: 'v3', name: 'Free Ship', cost: 150, code: 'LOYALFS', icon: '🚚', desc: 'Miễn phí vận chuyển toàn quốc' },
    { id: 'v4', name: 'Giảm 10%', cost: 500, code: 'LOYAL10', icon: '🎫', desc: 'Giảm 10% (tối đa 200K). Hạng Vàng+' },
    { id: 'v5', name: 'Dung dịch rửa kính', cost: 100, code: 'LOYALGIFT', icon: '🧴', desc: 'Tặng dung dịch vệ sinh kính 30ml' },
];

interface PointEntry { date: string; desc: string; points: number; type: 'earn' | 'redeem' }

export default function LoyaltyPage() {
    const [currentPoints, setCurrentPoints] = useState(1250);
    const [history, setHistory] = useState<PointEntry[]>([
        { date: '20/02/2026', desc: 'Mua Aviator Classic Gold', points: 299, type: 'earn' },
        { date: '15/02/2026', desc: 'Đánh giá sản phẩm', points: 50, type: 'earn' },
        { date: '10/02/2026', desc: 'Đổi voucher giảm 5%', points: -200, type: 'redeem' },
        { date: '05/02/2026', desc: 'Giới thiệu bạn bè', points: 100, type: 'earn' },
    ]);
    const [toast, setToast] = useState('');
    const [redeemingId, setRedeemingId] = useState<string | null>(null);
    const [tab, setTab] = useState<'overview' | 'redeem' | 'history'>('overview');

    const currentTier = [...LOYALTY_TIERS].reverse().find(t => currentPoints >= t.minPoints) || LOYALTY_TIERS[0];
    const nextTier = LOYALTY_TIERS.find(t => t.minPoints > currentPoints);

    useEffect(() => {
        // Try to fetch real loyalty data
        fetch('/api/loyalty').then(r => r.json()).then(data => {
            if (data.points !== undefined) setCurrentPoints(data.points);
            if (data.history) setHistory(data.history);
        }).catch(() => { /* keep mock */ });
    }, []);

    const redeem = (voucher: typeof VOUCHERS[0]) => {
        if (currentPoints < voucher.cost) { setToast('❌ Không đủ điểm!'); setTimeout(() => setToast(''), 2500); return; }
        setRedeemingId(voucher.id);
        setTimeout(() => {
            setCurrentPoints(prev => prev - voucher.cost);
            setHistory(prev => [{
                date: new Date().toLocaleDateString('vi-VN'),
                desc: `Đổi: ${voucher.name} (${voucher.code})`,
                points: -voucher.cost,
                type: 'redeem',
            }, ...prev]);
            setToast(`✅ Đã đổi ${voucher.name}! Mã: ${voucher.code}`);
            setRedeemingId(null);
            setTimeout(() => setToast(''), 4000);
        }, 800);
    };

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--gold-400)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', fontSize: 13, fontWeight: 600 }}>{toast}</div>}

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>🏆 Tích Điểm Thưởng</h1>

            {/* Current tier card */}
            <div className="glass-card" style={{ padding: 'var(--space-5)', textAlign: 'center', marginBottom: 'var(--space-4)', background: 'linear-gradient(135deg, rgba(212,168,83,0.10), rgba(96,165,250,0.05))' }}>
                <span style={{ fontSize: 48 }}>{currentTier.icon}</span>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginTop: 4 }}>Hạng {currentTier.name}</h2>
                <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--gold-400)', margin: '4px 0' }}>{currentPoints.toLocaleString()} điểm</p>
                {currentTier.discount > 0 && <p style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Giảm {currentTier.discount}% mọi đơn hàng</p>}
                {nextTier && (
                    <div style={{ marginTop: 'var(--space-3)' }}>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Còn {nextTier.minPoints - currentPoints} điểm → {nextTier.icon} {nextTier.name}</p>
                        <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(100, (currentPoints / nextTier.minPoints) * 100)}%`, background: 'var(--gradient-gold)', transition: 'width 500ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-4)' }}>
                {([['overview', '🏅 Hạng'], ['redeem', '🎁 Đổi thưởng'], ['history', '📋 Lịch sử']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)} className="btn btn-sm"
                        style={{ background: tab === key ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)', color: tab === key ? 'var(--gold-400)' : 'var(--text-muted)', border: tab === key ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)' }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Tier overview */}
            {tab === 'overview' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        {LOYALTY_TIERS.map(t => (
                            <div key={t.name} className={currentTier.name === t.name ? 'glass-card' : 'card'} style={{ padding: 'var(--space-4)', textAlign: 'center', border: currentTier.name === t.name ? '2px solid var(--gold-400)' : undefined }}>
                                <span style={{ fontSize: 32 }}>{t.icon}</span>
                                <p style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{t.name}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t.minPoints.toLocaleString()} điểm</p>
                                {t.discount > 0 && <p style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, marginTop: 4 }}>Giảm {t.discount}%</p>}
                            </div>
                        ))}
                    </div>
                    <div className="card" style={{ padding: 'var(--space-4)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        <strong>Cách tích điểm:</strong><br />
                        🛒 Mua hàng: 1 điểm / 10.000₫<br />
                        ⭐ Đánh giá SP: +50 điểm<br />
                        👥 Giới thiệu bạn bè: +100 điểm<br />
                        🎂 Sinh nhật: x2 điểm cả tháng
                    </div>
                </>
            )}

            {/* Redeem vouchers */}
            {tab === 'redeem' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {VOUCHERS.map(v => (
                        <div key={v.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 12, opacity: currentPoints >= v.cost ? 1 : 0.5 }}>
                            <span style={{ fontSize: 28, flexShrink: 0 }}>{v.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{v.desc}</div>
                                <div style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 600, marginTop: 2 }}>🪙 {v.cost} điểm</div>
                            </div>
                            <button className="btn btn-sm btn-primary" disabled={currentPoints < v.cost || redeemingId === v.id} onClick={() => redeem(v)} style={{ flexShrink: 0 }}>
                                {redeemingId === v.id ? '⏳...' : currentPoints >= v.cost ? '🎁 Đổi' : '🔒'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* History */}
            {tab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {history.map((h, i) => (
                        <div key={i} className="card" style={{ padding: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 500 }}>{h.desc}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{h.date}</p>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: h.type === 'earn' ? '#22c55e' : '#ef4444' }}>
                                {h.type === 'earn' ? '+' : ''}{h.points}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* F5: Spin Wheel */}
            <div className="card" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-4)', textAlign: 'center' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 'var(--space-2)' }}>🎰 Vòng quay may mắn</h3>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                    100 điểm / lượt quay · Cơ hội nhận voucher, điểm thưởng, và nhiều hơn nữa!
                </p>
                <div style={{ width: 160, height: 160, margin: '0 auto var(--space-4)', borderRadius: '50%', border: '4px solid var(--gold-400)', background: 'conic-gradient(rgba(212,168,83,0.15) 0deg 60deg, rgba(34,197,94,0.1) 60deg 120deg, rgba(96,165,250,0.1) 120deg 180deg, rgba(168,85,247,0.1) 180deg 240deg, rgba(239,68,68,0.1) 240deg 300deg, rgba(251,191,36,0.15) 300deg 360deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <span style={{ fontSize: 32 }}>🎁</span>
                    <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 16 }}>▼</div>
                </div>
                <button
                    className="btn btn-primary"
                    disabled={currentPoints < 100}
                    onClick={() => {
                        if (currentPoints < 100) return;
                        const prizes = [
                            { name: '+50 điểm', points: 50, icon: '⭐' },
                            { name: '+100 điểm', points: 100, icon: '🌟' },
                            { name: 'Voucher giảm 10%', points: 0, icon: '🎫' },
                            { name: 'Free Ship', points: 0, icon: '🚚' },
                            { name: '+200 điểm', points: 200, icon: '💎' },
                            { name: '+20 điểm', points: 20, icon: '✨' },
                        ];
                        const prize = prizes[Math.floor(Math.random() * prizes.length)];
                        setCurrentPoints(prev => prev - 100 + prize.points);
                        setHistory(prev => [
                            { date: new Date().toLocaleDateString('vi-VN'), desc: `Quay may mắn: ${prize.name}`, points: -100 + prize.points, type: prize.points >= 100 ? 'earn' : 'redeem' },
                            ...prev,
                        ]);
                        setToast(`${prize.icon} Chúc mừng! Bạn nhận được: ${prize.name}`);
                        setTimeout(() => setToast(''), 3000);
                    }}
                    style={{ fontSize: 14 }}
                >
                    🎰 Quay ngay (100 điểm)
                </button>
                {currentPoints < 100 && (
                    <p style={{ fontSize: 11, color: 'var(--error)', marginTop: 6 }}>Cần ít nhất 100 điểm để quay</p>
                )}
            </div>
        </div>
    );
}
