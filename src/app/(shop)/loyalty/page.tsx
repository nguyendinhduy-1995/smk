'use client';

import { useState } from 'react';

const LOYALTY_TIERS = [
    { name: 'Thành viên', minPoints: 0, discount: 0, icon: '🥉', color: '#cd7f32' },
    { name: 'Bạc', minPoints: 500, discount: 3, icon: '🥈', color: '#c0c0c0' },
    { name: 'Vàng', minPoints: 2000, discount: 5, icon: '🥇', color: '#ffd700' },
    { name: 'Kim Cương', minPoints: 5000, discount: 10, icon: '💎', color: '#60a5fa' },
];

const POINT_HISTORY = [
    { date: '20/02/2026', desc: 'Mua Aviator Classic Gold', points: 299, type: 'earn' as const },
    { date: '15/02/2026', desc: 'Đánh giá sản phẩm', points: 50, type: 'earn' as const },
    { date: '10/02/2026', desc: 'Đổi voucher giảm 5%', points: -200, type: 'redeem' as const },
    { date: '05/02/2026', desc: 'Giới thiệu bạn bè', points: 100, type: 'earn' as const },
];

export default function LoyaltyPage() {
    const [currentPoints] = useState(1250);
    const currentTier = [...LOYALTY_TIERS].reverse().find(t => currentPoints >= t.minPoints) || LOYALTY_TIERS[0];
    const nextTier = LOYALTY_TIERS.find(t => t.minPoints > currentPoints);

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                🏆 Tích Điểm Thưởng
            </h1>

            {/* Current tier card */}
            <div className="glass-card" style={{
                padding: 'var(--space-6)', textAlign: 'center', marginBottom: 'var(--space-4)',
                background: 'linear-gradient(135deg, rgba(212,168,83,0.10), rgba(96,165,250,0.05))',
            }}>
                <span style={{ fontSize: 48 }}>{currentTier.icon}</span>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginTop: 'var(--space-2)' }}>
                    Hạng {currentTier.name}
                </h2>
                <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--gold-400)', margin: 'var(--space-2) 0' }}>
                    {currentPoints.toLocaleString()} điểm
                </p>
                {currentTier.discount > 0 && (
                    <p style={{ fontSize: 'var(--text-sm)', color: '#22c55e', fontWeight: 600 }}>
                        Giảm {currentTier.discount}% mọi đơn hàng
                    </p>
                )}
                {nextTier && (
                    <div style={{ marginTop: 'var(--space-4)' }}>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                            Còn {nextTier.minPoints - currentPoints} điểm → Hạng {nextTier.name} {nextTier.icon}
                        </p>
                        <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                                height: '100%', borderRadius: 3,
                                width: `${Math.min(100, (currentPoints / nextTier.minPoints) * 100)}%`,
                                background: 'var(--gradient-gold)', transition: 'width 500ms',
                            }} />
                        </div>
                    </div>
                )}
            </div>

            {/* 4-tier overview */}
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Các hạng thành viên</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                {LOYALTY_TIERS.map(t => (
                    <div key={t.name} className={currentTier.name === t.name ? 'glass-card' : 'card'} style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                        <span style={{ fontSize: 24 }}>{t.icon}</span>
                        <p style={{ fontSize: 10, fontWeight: 600, marginTop: 4 }}>{t.name}</p>
                        <p style={{ fontSize: 9, color: 'var(--text-muted)' }}>{t.discount > 0 ? `Giảm ${t.discount}%` : 'Tích điểm'}</p>
                    </div>
                ))}
            </div>

            {/* History */}
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Lịch sử điểm</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {POINT_HISTORY.map((h, i) => (
                    <div key={i} className="card" style={{ padding: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{h.desc}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{h.date}</p>
                        </div>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: h.type === 'earn' ? '#22c55e' : '#ef4444' }}>
                            {h.type === 'earn' ? '+' : ''}{h.points}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
