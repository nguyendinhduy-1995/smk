'use client';
import { AnalyticsData, formatVND, formatCompact } from './types';

export default function CustomersTab({ data }: { data: AnalyticsData }) {
    const s = data.summary;
    const maxGeo = Math.max(...data.geoDistribution.map(g => g.count), 1);
    const totalGeo = data.geoDistribution.reduce((a, g) => a + g.count, 0) || 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Customer KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 'var(--space-3)' }}>
                {[
                    { icon: '👥', label: 'Tổng khách hàng', value: String(s.totalCustomers), color: '#60a5fa' },
                    { icon: '🆕', label: 'Khách mới', value: String(s.newCustomers), color: '#22c55e' },
                    { icon: '🔄', label: 'Khách quay lại', value: String(s.repeatCustomers), color: '#a855f7' },
                    { icon: '📊', label: 'Tỉ lệ mua lại', value: `${s.repeatRate}%`, color: '#fbbf24' },
                    { icon: '💰', label: 'Giá trị TB/khách', value: formatVND(s.totalCustomers > 0 ? Math.round(s.totalRevenue / s.totalCustomers) : 0), color: 'var(--gold-400)' },
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

            {/* Customer Composition */}
            <div className="analytics-card">
                <h3 className="analytics-card__title">👥 Cơ cấu khách hàng</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                    {/* Pie-like visual */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { label: 'Khách mới', value: s.newCustomers, color: '#22c55e', pct: s.totalCustomers > 0 ? (s.newCustomers / s.totalCustomers * 100) : 0 },
                            { label: 'Khách quay lại', value: s.repeatCustomers, color: '#a855f7', pct: s.totalCustomers > 0 ? (s.repeatCustomers / s.totalCustomers * 100) : 0 },
                            { label: 'Khách 1 lần', value: Math.max(0, s.totalCustomers - s.newCustomers - s.repeatCustomers), color: '#94a3b8', pct: 0 },
                        ].map(seg => {
                            if (seg.label === 'Khách 1 lần') seg.pct = Math.max(0, 100 - (s.totalCustomers > 0 ? (s.newCustomers / s.totalCustomers * 100) : 0) - (s.totalCustomers > 0 ? (s.repeatCustomers / s.totalCustomers * 100) : 0));
                            return (
                                <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                            <span>{seg.label}</span>
                                            <span style={{ fontWeight: 700 }}>{seg.value}</span>
                                        </div>
                                        <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 99, marginTop: 4 }}>
                                            <div style={{ height: '100%', width: `${seg.pct}%`, background: seg.color, borderRadius: 99 }} />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>{seg.pct.toFixed(0)}%</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Retention insight */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                        <div className="analytics-insight-box">
                            {parseFloat(s.repeatRate) >= 30 ?
                                '✅ Tỉ lệ mua lại tốt! Khách hàng hài lòng với sản phẩm.' :
                                parseFloat(s.repeatRate) >= 15 ?
                                    '⚠️ Tỉ lệ mua lại trung bình. Hãy xem xét chương trình loyalty/voucher.' :
                                    'Tỉ lệ mua lại thấp. Cần cải thiện trải nghiệm khách hàng.'}
                        </div>
                        <div style={{ padding: 16, borderRadius: 8, background: 'rgba(168,85,247,0.04)', border: '1px solid rgba(168,85,247,0.12)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#a855f7', marginBottom: 6 }}>💡 Đề xuất</div>
                            <ul style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 16, margin: 0, lineHeight: 1.8 }}>
                                <li>Gửi voucher giảm giá cho khách mới sau đơn đầu tiên</li>
                                <li>Chương trình tích điểm cho khách thân thiết</li>
                                <li>Email marketing nhắc khách quay lại sau 30 ngày</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Geographic Distribution */}
            <div className="analytics-card">
                <h3 className="analytics-card__title">🗺️ Phân bố địa lý khách hàng</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.geoDistribution.map((g, i) => {
                        const pct = (g.count / totalGeo) * 100;
                        const barW = (g.count / maxGeo) * 100;
                        return (
                            <div key={g.province} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span className={`analytics-rank ${i < 3 ? 'analytics-rank--top' : ''}`} style={{ width: 28 }}>#{i + 1}</span>
                                <span style={{ fontSize: 13, width: 160, flexShrink: 0, fontWeight: i < 3 ? 600 : 400 }}>{g.province}</span>
                                <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                                    <div style={{ height: '100%', width: `${barW}%`, background: i < 3 ? 'var(--gold-400)' : 'rgba(212,168,83,0.4)', borderRadius: 99, transition: 'width 0.4s' }} />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 600, width: 60, textAlign: 'right' }}>{g.count} đơn</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
