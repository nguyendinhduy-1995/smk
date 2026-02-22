'use client';

import { useState, useEffect } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface AnalyticsData {
    summary: {
        clicks30d: number;
        orders30d: number;
        revenue30d: number;
        conversionRate: string;
        totalEarned: number;
        avgCommission: number;
    };
    chartData: { date: string; revenue: number; orders: number; clicks: number }[];
    partnerLevel: string;
}

const LEVEL_MAP: Record<string, string> = { AFFILIATE: 'Cộng tác viên', AGENT: 'Đại lý', LEADER: 'Trưởng nhóm' };

export default function PartnerAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
    const [showCompare, setShowCompare] = useState(false);

    useEffect(() => {
        fetch('/api/partner/analytics', { headers: { 'x-user-id': 'demo-partner-user' } })
            .then((r) => r.json())
            .then(setData)
            .catch(() => {
                setData({
                    summary: { clicks30d: 342, orders30d: 23, revenue30d: 35660000, conversionRate: '6.7', totalEarned: 3566000, avgCommission: 155000 },
                    chartData: Array.from({ length: 30 }, (_, i) => {
                        const d = new Date(); d.setDate(d.getDate() - 29 + i);
                        return { date: d.toISOString().slice(0, 10), revenue: Math.round(Math.random() * 3000000), orders: Math.round(Math.random() * 3), clicks: Math.round(Math.random() * 20) };
                    }),
                    partnerLevel: 'AGENT',
                });
            })
            .finally(() => setLoading(false));
    }, []);

    // D3: Filter chart data by period
    const periodDays = Number(period);
    const chartSlice = data?.chartData?.slice(-periodDays) || [];
    const prevSlice = data?.chartData?.slice(-periodDays * 2, -periodDays) || [];

    const summary = data?.summary;
    const chart = data?.chartData || [];
    const maxRevenue = Math.max(...chart.map((d) => d.revenue), 1);

    if (loading) return <div className="container animate-in" style={{ padding: 'var(--space-16)', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>;

    return (
        <div className="animate-in" style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>📊 Thống kê hiệu suất</h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{period} ngày gần nhất</p>
                </div>
                <span className="badge badge-gold">{LEVEL_MAP[data?.partnerLevel || ''] || data?.partnerLevel}</span>
            </div>

            {/* D3: Period Selector + Compare Toggle */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
                {(['7', '30', '90'] as const).map(p => (
                    <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : ''}`}
                        onClick={() => setPeriod(p)}
                        style={{ minWidth: 60, fontWeight: period === p ? 700 : 400 }}>
                        {p} ngày
                    </button>
                ))}
                <button className={`btn btn-sm ${showCompare ? 'btn-primary' : ''}`}
                    onClick={() => setShowCompare(!showCompare)}
                    style={{ marginLeft: 'auto', fontSize: 11 }}>
                    {showCompare ? '✓ ' : ''}So sánh kỳ trước
                </button>
            </div>
            {showCompare && prevSlice.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', fontSize: 12 }}>
                    <p style={{ fontWeight: 700, marginBottom: 6 }}>📈 So sánh với kỳ trước ({period} ngày)</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Doanh thu</span>
                            <div style={{ fontWeight: 700, color: 'var(--gold-400)' }}>{formatVND(chartSlice.reduce((s, d) => s + d.revenue, 0))}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Trước: {formatVND(prevSlice.reduce((s, d) => s + d.revenue, 0))}</div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Đơn hàng</span>
                            <div style={{ fontWeight: 700 }}>{chartSlice.reduce((s, d) => s + d.orders, 0)}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Trước: {prevSlice.reduce((s, d) => s + d.orders, 0)}</div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-muted)' }}>Clicks</span>
                            <div style={{ fontWeight: 700 }}>{chartSlice.reduce((s, d) => s + d.clicks, 0)}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Trước: {prevSlice.reduce((s, d) => s + d.clicks, 0)}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                {[
                    { label: 'Lượt click', value: String(summary?.clicks30d || 0), icon: '🔗', color: 'var(--text-primary)' },
                    { label: 'Đơn hàng', value: String(summary?.orders30d || 0), icon: '📦', color: 'var(--success)' },
                    { label: 'Tỉ lệ chuyển đổi', value: `${summary?.conversionRate || 0}%`, icon: '🎯', color: 'var(--gold-400)' },
                    { label: 'Doanh thu', value: formatVND(summary?.revenue30d || 0), icon: '💰', color: 'var(--gold-400)' },
                    { label: 'Tổng hoa hồng', value: formatVND(summary?.totalEarned || 0), icon: '✨', color: 'var(--success)' },
                    { label: 'HH trung bình/đơn', value: formatVND(summary?.avgCommission || 0), icon: '📈', color: 'var(--text-secondary)' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card__label"><span style={{ marginRight: 4 }}>{s.icon}</span>{s.label}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-lg)', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart (CSS bars) */}
            <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📈 Doanh thu theo ngày</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 160, overflow: 'hidden' }}>
                    {chart.map((d) => (
                        <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }} title={`${d.date}: ${formatVND(d.revenue)} · ${d.orders} đơn · ${d.clicks} click`}>
                            <div style={{
                                width: '100%', minHeight: 4,
                                height: `${Math.max(4, (d.revenue / maxRevenue) * 140)}px`,
                                background: d.revenue > 0 ? 'var(--gold-400)' : 'var(--bg-tertiary)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 300ms',
                                opacity: d.revenue > 0 ? 0.85 : 0.3,
                            }} />
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <span>{chart[0]?.date.slice(5)}</span>
                    <span>{chart[Math.floor(chart.length / 2)]?.date.slice(5)}</span>
                    <span>{chart[chart.length - 1]?.date.slice(5)}</span>
                </div>
            </div>

            {/* Funnel */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>🔄 Phễu chuyển đổi</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {[
                        { label: 'Click link', value: summary?.clicks30d || 0, pct: 100 },
                        { label: 'Xem sản phẩm', value: Math.round((summary?.clicks30d || 0) * 0.65), pct: 65 },
                        { label: 'Thêm giỏ hàng', value: Math.round((summary?.clicks30d || 0) * 0.2), pct: 20 },
                        { label: 'Đặt hàng', value: summary?.orders30d || 0, pct: Number(summary?.conversionRate || 0) },
                    ].map((step) => (
                        <div key={step.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                                <span>{step.label}</span>
                                <span style={{ fontWeight: 600 }}>{step.value} <span style={{ color: 'var(--text-muted)' }}>({step.pct.toFixed(1)}%)</span></span>
                            </div>
                            <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${step.pct}%`, background: 'var(--gold-400)', borderRadius: 4, transition: 'width 500ms' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
