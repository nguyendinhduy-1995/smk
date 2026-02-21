'use client';

import { useState, useEffect } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface LoyaltyData {
    points: { current: number; total: number; redeemed: number; value: string };
    level: { name: string; icon: string; multiplier: number; nextLevel: { name: string; icon: string; pointsNeeded: number; progress: number } | null };
    config: { levels: { name: string; minPoints: number; multiplier: number; icon: string }[] };
    recentActivity: { type: string; points: number; description: string; date: string }[];
    stats: { totalOrders: number; totalSpent: number };
}

export default function LoyaltyPage() {
    const [data, setData] = useState<LoyaltyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/loyalty', { headers: { 'x-user-id': 'demo-user' } })
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    points: { current: 1250, total: 1750, redeemed: 500, value: '125.000 ₫' },
                    level: { name: 'Bạc', icon: '🥈', multiplier: 1.2, nextLevel: { name: 'Vàng', icon: '🥇', pointsNeeded: 250, progress: 87 } },
                    config: {
                        levels: [
                            { name: 'Đồng', minPoints: 0, multiplier: 1, icon: '🥉' },
                            { name: 'Bạc', minPoints: 500, multiplier: 1.2, icon: '🥈' },
                            { name: 'Vàng', minPoints: 2000, multiplier: 1.5, icon: '🥇' },
                            { name: 'Kim Cương', minPoints: 5000, multiplier: 2, icon: '💎' },
                        ]
                    },
                    recentActivity: [
                        { type: 'earn', points: 299, description: 'Đơn hàng SMK-001', date: new Date().toISOString() },
                        { type: 'earn', points: 589, description: 'Đơn hàng SMK-002', date: new Date(Date.now() - 86400000).toISOString() },
                        { type: 'earn', points: 329, description: 'Đơn hàng SMK-003', date: new Date(Date.now() - 172800000).toISOString() },
                    ],
                    stats: { totalOrders: 5, totalSpent: 17500000 },
                });
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="container animate-in" style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>;
    if (!data) return null;

    const { level, config } = data;
    const currentLevelIdx = config.levels.findIndex((l) => l.name === level.name);

    return (
        <div className="container animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            {/* Hero Card */}
            <div className="glass-card" style={{
                padding: 'var(--space-8)', textAlign: 'center', marginBottom: 'var(--space-6)',
                background: 'linear-gradient(135deg, rgba(212,168,83,0.12), rgba(96,165,250,0.05))',
            }}>
                <span style={{ fontSize: 56, display: 'block', marginBottom: 'var(--space-2)' }}>{level.icon}</span>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                    Thành viên {level.name}
                </h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                    Hệ số thưởng: <strong>x{level.multiplier}</strong>
                </p>

                <div style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--gold-400)', marginBottom: 'var(--space-2)' }}>
                    {data.points.current.toLocaleString('vi-VN')}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>điểm hiện tại · giá trị {data.points.value}</p>
            </div>

            {/* Next Level Progress */}
            {level.nextLevel && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                            {level.icon} {level.name} → {level.nextLevel.icon} {level.nextLevel.name}
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)', fontWeight: 600 }}>
                            {level.nextLevel.progress}%
                        </span>
                    </div>
                    <div style={{ height: 10, background: 'var(--bg-tertiary)', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', width: `${level.nextLevel.progress}%`,
                            background: 'linear-gradient(90deg, var(--gold-400), var(--gold-300))',
                            borderRadius: 5, transition: 'width 500ms',
                        }} />
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                        Còn <strong>{level.nextLevel.pointsNeeded.toLocaleString('vi-VN')}</strong> điểm nữa để đạt {level.nextLevel.name}
                    </p>
                </div>
            )}

            {/* Tier Roadmap */}
            <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>🏆 Cấp thành viên</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
                    {config.levels.map((l, i) => {
                        const active = i === currentLevelIdx;
                        const achieved = i <= currentLevelIdx;
                        return (
                            <div key={l.name} style={{
                                padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', textAlign: 'center',
                                border: active ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)',
                                background: active ? 'rgba(212,168,83,0.1)' : achieved ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                                opacity: achieved ? 1 : 0.5,
                            }}>
                                <span style={{ fontSize: 24, display: 'block' }}>{l.icon}</span>
                                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, marginTop: 4 }}>{l.name}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.minPoints > 0 ? `${l.minPoints} pts` : 'Mặc định'}</p>
                                <p style={{ fontSize: 10, color: 'var(--gold-400)' }}>x{l.multiplier}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <div className="stat-card">
                    <div className="stat-card__label">Tổng điểm tích</div>
                    <div className="stat-card__value" style={{ color: 'var(--gold-400)' }}>{data.points.total.toLocaleString('vi-VN')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Đã sử dụng</div>
                    <div className="stat-card__value" style={{ color: 'var(--success)' }}>{data.points.redeemed.toLocaleString('vi-VN')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__label">Tổng đã mua</div>
                    <div className="stat-card__value">{formatVND(data.stats.totalSpent)}</div>
                </div>
            </div>

            {/* Recent Activity */}
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>📜 Hoạt động gần đây</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {data.recentActivity.map((a, i) => (
                    <div key={i} className="card" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{a.description}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{new Date(a.date).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--gold-400)' }}>+{a.points} pts</span>
                    </div>
                ))}
                {data.recentActivity.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>Chưa có hoạt động nào</p>
                )}
            </div>
        </div>
    );
}
