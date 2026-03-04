'use client';
import { AnalyticsData, formatVND, formatCompact, STATUS_LABELS, PAYMENT_LABELS } from './types';

function GrowthBadge({ value }: { value: number }) {
    const isPos = value >= 0;
    return (
        <span style={{ fontSize: 11, fontWeight: 700, color: isPos ? '#22c55e' : '#ef4444', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            {isPos ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
        </span>
    );
}

export default function OverviewTab({ data }: { data: AnalyticsData }) {
    const s = data.summary;
    const chart = data.revenueChart || [];
    const funnel = data.conversionFunnel || [];
    const statusDist = data.orderStatusDistribution || [];
    const maxRev = chart.length > 0 ? Math.max(...chart.map(d => d.revenue), 1) : 1;
    const totalFunnel = funnel[0]?.count || 1;
    const totalStatusOrders = statusDist.reduce((a, b) => a + b.count, 0) || 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 'var(--space-3)' }}>
                {[
                    { icon: '💰', label: 'Doanh thu', value: formatVND(s.totalRevenue), growth: s.revenueGrowth, sub: `Kỳ trước: ${formatCompact(s.prevTotalRevenue)}₫` },
                    { icon: '📦', label: 'Đơn hàng', value: String(s.totalOrders), growth: s.ordersGrowth, sub: `Kỳ trước: ${s.prevTotalOrders}` },
                    { icon: '📊', label: 'Giá trị TB/đơn', value: formatVND(s.avgOrderValue), growth: s.aovGrowth, sub: `Kỳ trước: ${formatCompact(s.prevAOV)}₫` },
                    { icon: '🎫', label: 'Tổng giảm giá', value: formatVND(s.totalDiscount), growth: 0, sub: `${((s.totalDiscount / Math.max(s.totalRevenue, 1)) * 100).toFixed(1)}% doanh thu` },
                    { icon: '👤', label: 'Khách mới', value: String(s.newCustomers), growth: 0, sub: `Tổng: ${s.totalCustomers}` },
                    { icon: '🔄', label: 'Mua lại', value: `${s.repeatRate}%`, growth: 0, sub: `${s.repeatCustomers} khách` },
                    { icon: '❌', label: 'Tỉ lệ huỷ', value: `${s.cancelRate}%`, growth: 0, sub: `${s.cancelledOrders} đơn huỷ` },
                    { icon: '', label: 'Tỉ lệ hoàn', value: `${s.returnRate}%`, growth: 0, sub: `${s.returnedOrders} đơn hoàn` },
                ].map(k => (
                    <div key={k.label} className="analytics-kpi-card">
                        <div className="analytics-kpi-card__header">
                            <span className="analytics-kpi-card__icon">{k.icon}</span>
                            <span className="analytics-kpi-card__label">{k.label}</span>
                            {k.growth !== 0 && <GrowthBadge value={k.growth} />}
                        </div>
                        <div className="analytics-kpi-card__value">{k.value}</div>
                        <div className="analytics-kpi-card__sub">{k.sub}</div>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="analytics-card">
                <div className="analytics-card__header">
                    <h3>📈 Biểu đồ doanh thu ({data.period} ngày)</h3>
                    <span className="analytics-card__badge">{formatVND(s.totalRevenue)}</span>
                </div>
                <div style={{ position: 'relative', height: 200, padding: '0 4px' }}>
                    {chart.length > 1 ? (
                        <svg viewBox={`0 0 ${chart.length * 20} 180`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(212,168,83,0.35)" />
                                    <stop offset="100%" stopColor="rgba(212,168,83,0)" />
                                </linearGradient>
                            </defs>
                            {(() => {
                                const w = chart.length * 20;
                                const divisor = Math.max(chart.length - 1, 1);
                                const pts = chart.map((d, i) => `${(i / divisor) * w},${170 - (d.revenue / maxRev) * 160}`);
                                return (
                                    <>
                                        <polygon points={`0,170 ${pts.join(' ')} ${w},170`} fill="url(#areaGrad)" />
                                        <polyline points={pts.join(' ')} fill="none" stroke="var(--gold-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </>
                                );
                            })()}
                        </svg>
                    ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>Chưa có đủ dữ liệu biểu đồ</div>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    <span>{chart[0]?.date}</span>
                    <span>{chart[Math.floor(chart.length / 2)]?.date}</span>
                    <span>{chart[chart.length - 1]?.date}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Conversion Funnel */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">🔄 Phễu chuyển đổi</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {funnel.map((f, i) => {
                            const pct = (f.count / totalFunnel) * 100;
                            const prevCount = i > 0 ? funnel[i - 1].count : f.count;
                            const dropRate = prevCount > 0 ? ((1 - f.count / prevCount) * 100).toFixed(1) : '0';
                            const colors = ['#60a5fa', '#a78bfa', '#f59e0b', '#22c55e'];
                            return (
                                <div key={f.stage}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600 }}>{f.stage}</span>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <span style={{ fontWeight: 700 }}>{f.count.toLocaleString()}</span>
                                            {i > 0 && <span style={{ color: '#ef4444', fontSize: 10 }}>-{dropRate}%</span>}
                                        </div>
                                    </div>
                                    <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: colors[i], borderRadius: 99, transition: 'width 0.6s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                        {funnel.length >= 2 && (
                            <div className="analytics-insight-box">
                                Tỉ lệ chuyển đổi tổng: <strong style={{ color: '#22c55e' }}>
                                    {((funnel[funnel.length - 1].count / totalFunnel) * 100).toFixed(2)}%
                                </strong>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Status */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">📋 Trạng thái đơn hàng</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {statusDist.sort((a, b) => b.count - a.count).map(s => {
                            const info = STATUS_LABELS[s.status] || { label: s.status, color: '#94a3b8' };
                            const pct = (s.count / totalStatusOrders) * 100;
                            return (
                                <div key={s.status}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: info.color, flexShrink: 0 }} />
                                            <span>{info.label}</span>
                                        </div>
                                        <span style={{ fontWeight: 600 }}>{s.count} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct.toFixed(0)}%)</span></span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: info.color, borderRadius: 99, opacity: 0.8 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Payment Breakdown */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">💳 Phương thức thanh toán</h3>
                    {Object.entries(data.paymentBreakdown).map(([method, info]) => {
                        const totalPay = Object.values(data.paymentBreakdown).reduce((a, b) => a + b.total, 0) || 1;
                        const pct = (info.total / totalPay) * 100;
                        return (
                            <div key={method} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-primary)' }}>
                                <span style={{ fontSize: 13, flex: 1 }}>{PAYMENT_LABELS[method] || method}</span>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{formatVND(info.total)}</div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{info.count} đơn · {pct.toFixed(1)}%</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Partner Ranking */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">🏅 Top đối tác</h3>
                    {data.partnerRanking.length > 0 ? data.partnerRanking.slice(0, 5).map((p, i) => (
                        <div key={p.code} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-primary)' }}>
                            <span className={`analytics-rank ${i < 3 ? 'analytics-rank--top' : ''}`}>#{i + 1}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                    {p.code} · {p.orders} đơn
                                </div>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold-400)' }}>{formatCompact(p.revenue)}₫</span>
                        </div>
                    )) : <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>Chưa có dữ liệu</p>}
                </div>
            </div>
        </div>
    );
}
