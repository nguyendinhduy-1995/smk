'use client';
import { AnalyticsData, formatVND, formatCompact } from './types';

export default function RevenueTab({ data }: { data: AnalyticsData }) {
    const maxRev = Math.max(...data.revenueChart.map(d => d.revenue), 1);
    const maxHourly = Math.max(...data.timeAnalysis.hourlyRevenue, 1);
    const maxWeekday = Math.max(...data.timeAnalysis.weekdayRevenue, 1);
    const totalOrders = data.revenueChart.reduce((a, d) => a + d.orders, 0);
    const totalCancelled = data.revenueChart.reduce((a, d) => a + d.cancelled, 0);

    // Find best/worst days
    const sortedDays = [...data.revenueChart].sort((a, b) => b.revenue - a.revenue);
    const bestDay = sortedDays[0];
    const worstDay = sortedDays[sortedDays.length - 1];
    const avgDaily = data.summary.totalRevenue / Math.max(data.revenueChart.length, 1);

    // Peak hour
    const peakHour = data.timeAnalysis.hourlyRevenue.indexOf(Math.max(...data.timeAnalysis.hourlyRevenue));
    const peakWeekday = data.timeAnalysis.weekdayRevenue.indexOf(Math.max(...data.timeAnalysis.weekdayRevenue));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Revenue Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
                {[
                    { icon: '📊', label: 'TB/ngày', value: formatVND(avgDaily), color: 'var(--gold-400)' },
                    { icon: '🔝', label: 'Ngày cao nhất', value: formatVND(bestDay?.revenue || 0), color: '#22c55e' },
                    { icon: '🔻', label: 'Ngày thấp nhất', value: formatVND(worstDay?.revenue || 0), color: '#ef4444' },
                    { icon: '📦', label: 'Tổng đơn', value: String(totalOrders), color: '#60a5fa' },
                    { icon: '❌', label: 'Đơn huỷ', value: String(totalCancelled), color: '#ef4444' },
                ].map(k => (
                    <div key={k.label} className="analytics-kpi-card">
                        <div className="analytics-kpi-card__header">
                            <span className="analytics-kpi-card__icon">{k.icon}</span>
                            <span className="analytics-kpi-card__label">{k.label}</span>
                        </div>
                        <div className="analytics-kpi-card__value" style={{ color: k.color }}>{k.value}</div>
                    </div>
                ))}
            </div>

            {/* Revenue Bar Chart with orders overlay */}
            <div className="analytics-card">
                <div className="analytics-card__header">
                    <h3>📊 Doanh thu & Đơn hàng theo ngày</h3>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--gold-400)', opacity: 0.7 }} /> Doanh thu
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#60a5fa' }} /> Đơn hàng
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 180, overflowX: 'auto', paddingBottom: 4 }}>
                    {data.revenueChart.map((d, i) => {
                        const barH = Math.max(3, (d.revenue / maxRev) * 160);
                        return (
                            <div key={d.date} style={{ flex: '1 0 auto', minWidth: data.revenueChart.length > 60 ? 4 : 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
                                title={`${d.date}\nDoanh thu: ${formatVND(d.revenue)}\nĐơn: ${d.orders}\nGiảm giá: ${formatVND(d.discount)}`}>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <div style={{
                                        width: '100%', height: barH, borderRadius: '3px 3px 0 0',
                                        background: d.cancelled > 0 ? 'linear-gradient(to top, rgba(239,68,68,0.3), var(--gold-400))' : 'var(--gold-400)',
                                        opacity: 0.7, transition: 'height 0.3s',
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    <span>{data.revenueChart[0]?.date}</span>
                    <span>{data.revenueChart[data.revenueChart.length - 1]?.date}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Hourly Heatmap */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">⏰ Doanh thu theo giờ</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
                        {data.timeAnalysis.hourlyRevenue.map((v, h) => {
                            const intensity = maxHourly > 0 ? v / maxHourly : 0;
                            return (
                                <div key={h} title={`${h}:00 — ${formatVND(v)} · ${data.timeAnalysis.hourlyOrders[h]} đơn`}
                                    style={{
                                        height: 36, borderRadius: 4,
                                        background: intensity > 0 ? `rgba(212,168,83,${0.15 + intensity * 0.85})` : 'var(--bg-tertiary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 9, color: intensity > 0.5 ? '#0a0a0f' : 'var(--text-muted)',
                                        fontWeight: intensity > 0.5 ? 700 : 400, cursor: 'default',
                                    }}>
                                    {h}h
                                </div>
                            );
                        })}
                    </div>
                    <div className="analytics-insight-box" style={{ marginTop: 12 }}>
                        ⏱️ Giờ cao điểm: <strong>{peakHour}:00</strong> ({formatCompact(data.timeAnalysis.hourlyRevenue[peakHour])}₫ · {data.timeAnalysis.hourlyOrders[peakHour]} đơn)
                    </div>
                </div>

                {/* Weekday Analysis */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">📅 Doanh thu theo thứ</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
                        {data.timeAnalysis.weekdayRevenue.map((v, i) => {
                            const barH = Math.max(8, (v / maxWeekday) * 110);
                            const isPeak = i === peakWeekday;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
                                    title={`${data.timeAnalysis.weekdayNames[i]}: ${formatVND(v)} · ${data.timeAnalysis.weekdayOrders[i]} đơn`}>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: isPeak ? 'var(--gold-400)' : 'var(--text-muted)' }}>
                                        {formatCompact(v)}
                                    </span>
                                    <div style={{
                                        width: '100%', height: barH, borderRadius: 6,
                                        background: isPeak ? 'var(--gradient-gold)' : 'rgba(212,168,83,0.3)',
                                        transition: 'height 0.4s',
                                    }} />
                                    <span style={{ fontSize: 11, fontWeight: isPeak ? 700 : 500, color: isPeak ? 'var(--gold-400)' : 'var(--text-muted)' }}>
                                        {data.timeAnalysis.weekdayNames[i]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="analytics-insight-box" style={{ marginTop: 12 }}>
                        📅 Ngày bán chạy nhất: <strong>{data.timeAnalysis.weekdayNames[peakWeekday]}</strong> ({formatCompact(data.timeAnalysis.weekdayRevenue[peakWeekday])}₫)
                    </div>
                </div>
            </div>

            {/* Discount Analysis */}
            <div className="analytics-card">
                <h3 className="analytics-card__title">🏷️ Phân tích giảm giá</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
                    <div style={{ padding: 12, borderRadius: 8, background: 'rgba(251,191,36,0.06)', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold-400)' }}>{formatVND(data.summary.totalDiscount)}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Tổng giảm giá</div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 8, background: 'rgba(96,165,250,0.06)', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#60a5fa' }}>
                            {((data.summary.totalDiscount / Math.max(data.summary.totalRevenue, 1)) * 100).toFixed(1)}%
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>% trên doanh thu</div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 8, background: 'rgba(34,197,94,0.06)', textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>
                            {formatVND(data.summary.totalOrders > 0 ? Math.round(data.summary.totalDiscount / data.summary.totalOrders) : 0)}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>TB giảm giá/đơn</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
