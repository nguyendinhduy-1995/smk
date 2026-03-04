'use client';

interface VisitorData {
    today: {
        views: number;
        uniqueVisitors: number;
        activeSessions: number;
        topPages: { path: string; views: number }[];
        topActions: { action: string; count: number }[];
        hourlyViews: number[];
    };
    last30Days: { date: string; day: string; views: number; unique: number }[];
    behavior: {
        totalSessions: number;
        categoryInterest: Record<string, number>;
        avgPrice: number;
        pagesPerSession: string;
        avgTimeOnPage: number;
        avgSessionDuration: number;
        avgScrollDepth: number;
        bounceRate: number;
        bounceSessions: number;
    };
    devices: {
        types: Record<string, number>;
        browsers: Record<string, number>;
        operatingSystems: Record<string, number>;
        screenResolutions: Record<string, number>;
        languages: Record<string, number>;
        connectionTypes: Record<string, number>;
    };
    traffic: {
        referrerSources: Record<string, number>;
        utmSources: Record<string, number>;
        utmMediums: Record<string, number>;
        utmCampaigns: Record<string, number>;
        entryPages: { path: string; count: number }[];
        exitPages: { path: string; count: number }[];
    };
    userFlow: {
        topTransitions: { flow: string; count: number }[];
        topPagesAllTime: { path: string; views: number }[];
    };
    aiInsights: string[];
}

function fmtMs(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}p${sec > 0 ? `${sec}s` : ''}`;
}

function shortPath(p: string): string {
    if (p.length <= 35) return p;
    return p.slice(0, 15) + '...' + p.slice(-17);
}

function sortedEntries(obj: Record<string, number>): [string, number][] {
    return Object.entries(obj).sort(([, a], [, b]) => b - a);
}

export default function BehaviorTab({ data }: { data: VisitorData }) {
    const b = data.behavior;
    const totalSessions = b.totalSessions || 1;

    const maxHourly = Math.max(...data.today.hourlyViews, 1);
    const max30d = Math.max(...data.last30Days.map(d => d.views), 1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Behavior KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
                {[
                    { icon: '', label: 'Lượt xem hôm nay', value: String(data.today.views), color: '#60a5fa' },
                    { icon: '👤', label: 'Khách truy cập', value: String(data.today.uniqueVisitors), color: '#22c55e' },
                    { icon: '', label: 'Đang online', value: String(data.today.activeSessions), color: '#10b981' },
                    { icon: '📄', label: 'Trang/phiên', value: b.pagesPerSession, color: '#a855f7' },
                    { icon: '⏱️', label: 'TB thời gian/trang', value: fmtMs(b.avgTimeOnPage), color: '#f59e0b' },
                    { icon: '📏', label: 'Cuộn trang TB', value: `${b.avgScrollDepth}%`, color: '#06b6d4' },
                    { icon: '🔄', label: 'Thời gian TB/phiên', value: fmtMs(b.avgSessionDuration), color: '#e879f9' },
                    { icon: '🚪', label: 'Tỉ lệ thoát', value: `${b.bounceRate}%`, color: b.bounceRate > 50 ? '#ef4444' : '#22c55e' },
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

            {/* Traffic 30-day chart */}
            <div className="analytics-card">
                <h3 className="analytics-card__title">📈 Lượt truy cập 30 ngày</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120, padding: '0 4px' }}>
                    {data.last30Days.map(d => {
                        const h = Math.max(2, (d.views / max30d) * 100);
                        return (
                            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <span style={{ fontSize: 9, color: 'var(--text-muted)', opacity: d.views > 0 ? 1 : 0.3 }}>{d.views || ''}</span>
                                <div style={{ width: '100%', height: `${h}%`, background: d.date === new Date().toISOString().slice(0, 10) ? 'var(--gold-400)' : 'rgba(96,165,250,0.5)', borderRadius: '3px 3px 0 0', minHeight: 2, transition: 'height 0.3s' }} title={`${d.date}: ${d.views} lượt`} />
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                    <span>{data.last30Days[0]?.date}</span>
                    <span>Hôm nay</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Top Pages Today */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">📊 Trang phổ biến hôm nay</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {data.today.topPages.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có dữ liệu</div>}
                        {data.today.topPages.slice(0, 10).map((p, i) => {
                            const maxP = data.today.topPages[0]?.views || 1;
                            return (
                                <div key={p.path} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className={`analytics-rank ${i < 3 ? 'analytics-rank--top' : ''}`}>#{i + 1}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: i < 3 ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.path}>{shortPath(p.path)}</div>
                                        <div style={{ height: 3, background: 'var(--bg-tertiary)', borderRadius: 99, marginTop: 2 }}>
                                            <div style={{ height: '100%', width: `${(p.views / maxP) * 100}%`, background: i < 3 ? 'var(--gold-400)' : 'rgba(212,168,83,0.4)', borderRadius: 99 }} />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>{p.views}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Hourly Traffic */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">🕐 Lượt xem theo giờ (hôm nay)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 100 }}>
                        {data.today.hourlyViews.map((v, h) => {
                            const barH = Math.max(2, (v / maxHourly) * 90);
                            const now = new Date().getHours();
                            return (
                                <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    {v > 0 && <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{v}</span>}
                                    <div style={{ width: '100%', height: `${barH}%`, background: h === now ? 'var(--gold-400)' : v > 0 ? 'rgba(96,165,250,0.6)' : 'var(--bg-tertiary)', borderRadius: '2px 2px 0 0', minHeight: 2 }} title={`${h}:00 — ${v} lượt`} />
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                        <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* User Actions */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">🖱️ Hành vi người dùng hôm nay</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {data.today.topActions.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có hành vi nào</div>}
                        {data.today.topActions.slice(0, 10).map((a, i) => {
                            const [type, ...rest] = a.action.split(':');
                            const target = rest.join(':');
                            const typeLabels: Record<string, string> = { click: '👆 Click', buy: '🛒 Mua', add_cart: '🛍️ Thêm giỏ', search: '🔍 Tìm kiếm', filter: '⚙️ Lọc', try_on: ' Thử kính', share: '📤 Chia sẻ', scroll_deep: '📜 Cuộn sâu' };
                            return (
                                <div key={`${a.action}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                    <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'var(--gold-400)' }}>{typeLabels[type] || type}</span>
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }} title={target}>{shortPath(target)}</span>
                                    <span style={{ fontWeight: 700, flexShrink: 0 }}>{a.count}×</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Category Interest */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">🏷️ Danh mục quan tâm</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {sortedEntries(b.categoryInterest).length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có dữ liệu</div>}
                        {sortedEntries(b.categoryInterest).slice(0, 8).map(([cat, count]) => {
                            const maxC = sortedEntries(b.categoryInterest)[0]?.[1] || 1;
                            return (
                                <div key={cat}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                                        <span style={{ fontWeight: 600 }}>{cat}</span>
                                        <span>{count} phiên</span>
                                    </div>
                                    <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                                        <div style={{ height: '100%', width: `${(count / maxC) * 100}%`, background: 'var(--gold-400)', borderRadius: 99, opacity: 0.7 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            {data.aiInsights.length > 0 && (
                <div className="analytics-card" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.04), rgba(59,130,246,0.04))' }}>
                    <h3 className="analytics-card__title">🤖 AI Insights</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
                        {data.aiInsights.map((insight, i) => (
                            <div key={i} className="analytics-insight-box">{insight}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
