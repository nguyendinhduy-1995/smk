'use client';
import { AnalyticsData, formatVND, PAYMENT_LABELS } from './types';

export default function OperationsTab({ data }: { data: AnalyticsData }) {
    const totalShipping = data.shippingStats.reduce((a, s) => a + s.count, 0) || 1;
    const maxShipping = Math.max(...data.shippingStats.map(s => s.count), 1);
    const totalPay = Object.values(data.paymentBreakdown).reduce((a, b) => a + b.count, 0) || 1;
    const totalPayStatus = Object.values(data.paymentStatusBreakdown).reduce((a, b) => a + b, 0) || 1;

    const payStatusLabels: Record<string, { label: string; color: string }> = {
        PENDING: { label: 'Chờ TT', color: '#f59e0b' },
        PAID: { label: 'Đã TT', color: '#22c55e' },
        REFUNDED: { label: 'Hoàn tiền', color: '#a855f7' },
        FAILED: { label: 'Thất bại', color: '#ef4444' },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Operations KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 'var(--space-3)' }}>
                {[
                    { icon: '📦', label: 'Tổng vận chuyển', value: String(totalShipping), color: '#60a5fa' },
                    { icon: '❌', label: 'Đơn huỷ', value: String(data.summary.cancelledOrders), color: '#ef4444' },
                    { icon: '', label: 'Đơn hoàn', value: String(data.summary.returnedOrders), color: '#fb923c' },
                    { icon: '💳', label: 'Giao dịch', value: String(totalPay), color: '#22c55e' },
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Shipping Carriers */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">🚚 Đơn vị vận chuyển</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {data.shippingStats.sort((a, b) => b.count - a.count).map((s, i) => {
                            const pct = (s.count / totalShipping) * 100;
                            const barW = (s.count / maxShipping) * 100;
                            const colors = ['#22c55e', '#60a5fa', '#a855f7', '#f59e0b', '#ef4444'];
                            return (
                                <div key={s.carrier}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600 }}>
                                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  '} {s.carrier}
                                        </span>
                                        <span style={{ fontWeight: 700 }}>{s.count} đơn <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({pct.toFixed(0)}%)</span></span>
                                    </div>
                                    <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                                        <div style={{ height: '100%', width: `${barW}%`, background: colors[i] || colors[0], borderRadius: 99, opacity: 0.8 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Payment Status Breakdown */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">💳 Trạng thái thanh toán</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {Object.entries(data.paymentStatusBreakdown).sort(([, a], [, b]) => b - a).map(([status, count]) => {
                            const info = payStatusLabels[status] || { label: status, color: '#94a3b8' };
                            const pct = (count / totalPayStatus) * 100;
                            return (
                                <div key={status}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: info.color, flexShrink: 0 }} />
                                            <span style={{ fontWeight: 600 }}>{info.label}</span>
                                        </div>
                                        <span style={{ fontWeight: 700 }}>{count} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({pct.toFixed(0)}%)</span></span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: info.color, borderRadius: 99, opacity: 0.7 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Payment Methods Detail */}
            <div className="analytics-card">
                <h3 className="analytics-card__title">💰 Chi tiết phương thức thanh toán</h3>
                <div className="analytics-table-wrap">
                    <table className="analytics-table">
                        <thead>
                            <tr><th>Phương thức</th><th>Số đơn</th><th>Tỉ lệ</th><th>Doanh thu</th><th>TB/đơn</th></tr>
                        </thead>
                        <tbody>
                            {Object.entries(data.paymentBreakdown).sort(([, a], [, b]) => b.total - a.total).map(([method, info]) => (
                                <tr key={method}>
                                    <td style={{ fontWeight: 600 }}>{PAYMENT_LABELS[method] || method}</td>
                                    <td>{info.count}</td>
                                    <td>{((info.count / totalPay) * 100).toFixed(1)}%</td>
                                    <td style={{ fontWeight: 600, color: 'var(--gold-400)' }}>{formatVND(info.total)}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{formatVND(info.count > 0 ? Math.round(info.total / info.count) : 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cancellation & Return Analysis */}
            <div className="analytics-card">
                <h3 className="analytics-card__title">📉 Phân tích Huỷ & Hoàn trả</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                    <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: '#ef4444' }}>{data.summary.cancelRate}%</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Tỉ lệ huỷ đơn</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{data.summary.cancelledOrders} đơn huỷ</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: 20, borderRadius: 12, background: 'rgba(251,146,60,0.04)', border: '1px solid rgba(251,146,60,0.1)' }}>
                        <div style={{ fontSize: 36, fontWeight: 800, color: '#fb923c' }}>{data.summary.returnRate}%</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Tỉ lệ hoàn trả</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{data.summary.returnedOrders} đơn hoàn</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="analytics-insight-box" style={{ width: '100%' }}>
                            {data.summary.cancelRate <= 5 && data.summary.returnRate <= 3 ?
                                '✅ Tỉ lệ huỷ/hoàn thấp. Quy trình vận hành tốt!' :
                                data.summary.cancelRate > 10 ?
                                    'Tỉ lệ huỷ cao! Kiểm tra lại quy trình xác nhận đơn, thời gian giao hàng.' :
                                    '⚠️ Cần theo dõi thêm. Kiểm tra nguyên nhân huỷ/hoàn phổ biến nhất.'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
