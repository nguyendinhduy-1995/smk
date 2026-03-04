'use client';
import { AnalyticsData, formatVND, formatCompact, CATEGORY_LABELS } from './types';

export default function ProductsTab({ data }: { data: AnalyticsData }) {
    const maxSold = Math.max(...data.productPerformance.map(p => p.sold), 1);
    const totalCatRevenue = data.categoryBreakdown.reduce((a, c) => a + c.revenue, 0) || 1;
    const totalReviewCount = data.reviews.distribution.reduce((a, d) => a + d.count, 0) || 1;
    const maxReviewCount = Math.max(...data.reviews.distribution.map(d => d.count), 1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
                {[
                    { icon: '📦', label: 'SKU đang bán', value: String(data.inventory.totalVariants), color: '#60a5fa' },
                    { icon: '⚠️', label: 'Sắp hết hàng', value: String(data.inventory.lowStockCount), color: '#f59e0b' },
                    { icon: '🚫', label: 'Hết hàng', value: String(data.inventory.outOfStockCount), color: '#ef4444' },
                    { icon: '⭐', label: 'Đánh giá TB', value: data.reviews.avgRating.toFixed(1), color: '#fbbf24' },
                    { icon: '💬', label: 'Đánh giá mới', value: String(data.reviews.total), color: '#a855f7' },
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

            {/* Top Products */}
            <div className="analytics-card">
                <h3 className="analytics-card__title">🏆 Sản phẩm bán chạy</h3>
                <div className="analytics-table-wrap">
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>#</th><th>Sản phẩm</th><th>Thương hiệu</th><th>Đã bán</th><th>Doanh thu</th><th>Đơn hàng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.productPerformance.map((p, i) => (
                                <tr key={i}>
                                    <td><span className={`analytics-rank ${i < 3 ? 'analytics-rank--top' : ''}`}>#{i + 1}</span></td>
                                    <td style={{ fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{p.brand}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontWeight: 600 }}>{p.sold}</span>
                                            <div style={{ flex: 1, height: 4, background: 'var(--bg-tertiary)', borderRadius: 99, minWidth: 40 }}>
                                                <div style={{ height: '100%', width: `${(p.sold / maxSold) * 100}%`, background: 'var(--gold-400)', borderRadius: 99 }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--gold-400)' }}>{formatCompact(p.revenue)}₫</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{p.orders}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Category Breakdown */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">📂 Danh mục sản phẩm</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {data.categoryBreakdown.sort((a, b) => b.revenue - a.revenue).map(c => {
                            const info = CATEGORY_LABELS[c.category] || { label: c.category, icon: '📁' };
                            const pct = (c.revenue / totalCatRevenue) * 100;
                            return (
                                <div key={c.category}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600 }}>{info.icon} {info.label}</span>
                                        <span style={{ fontWeight: 600, color: 'var(--gold-400)' }}>{formatCompact(c.revenue)}₫</span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold-400)', borderRadius: 99, opacity: 0.7 }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                                        <span>{c.productCount} sản phẩm</span>
                                        <span>{c.sold} đã bán · {pct.toFixed(1)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reviews & Ratings */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">⭐ Đánh giá & Xếp hạng</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 42, fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                                {data.reviews.avgRating.toFixed(1)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                {'★'.repeat(Math.round(data.reviews.avgRating))}{'☆'.repeat(5 - Math.round(data.reviews.avgRating))}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{data.reviews.total} đánh giá</div>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {[5, 4, 3, 2, 1].map(r => {
                                const item = data.reviews.distribution.find(d => d.rating === r);
                                const count = item?.count || 0;
                                const pct = (count / maxReviewCount) * 100;
                                return (
                                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 11, width: 14, textAlign: 'right', color: 'var(--text-muted)' }}>{r}★</span>
                                        <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                                            <div style={{
                                                height: '100%', width: `${pct}%`, borderRadius: 99,
                                                background: r >= 4 ? '#22c55e' : r >= 3 ? '#fbbf24' : '#ef4444',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: 11, width: 24, color: 'var(--text-muted)' }}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="analytics-insight-box">
                        {data.reviews.avgRating >= 4 ? '✅ Đánh giá rất tốt! Khách hàng hài lòng.' :
                            data.reviews.avgRating >= 3 ? '⚠️ Đánh giá trung bình. Cần cải thiện chất lượng SP/dịch vụ.' :
                                'Đánh giá thấp. Cần kiểm tra chất lượng sản phẩm ngay.'}
                    </div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {data.inventory.lowStockItems.length > 0 && (
                <div className="analytics-card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                    <h3 className="analytics-card__title">🚨 Cảnh báo tồn kho thấp</h3>
                    <div className="analytics-table-wrap">
                        <table className="analytics-table">
                            <thead>
                                <tr><th>Sản phẩm</th><th>SKU</th><th>Tồn kho</th><th>Đang giữ</th><th>Khả dụng</th></tr>
                            </thead>
                            <tbody>
                                {data.inventory.lowStockItems.map((item, i) => (
                                    <tr key={i}>
                                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                                        <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 11 }}>{item.sku}</td>
                                        <td style={{ fontWeight: 700, color: item.stock <= 2 ? '#ef4444' : '#f59e0b' }}>{item.stock}</td>
                                        <td>{item.reserved}</td>
                                        <td style={{ fontWeight: 700, color: item.stock - item.reserved <= 0 ? '#ef4444' : 'var(--text-primary)' }}>{item.stock - item.reserved}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
