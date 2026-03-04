'use client';

function sortedEntries(obj: Record<string, number>): [string, number][] {
    return Object.entries(obj).sort(([, a], [, b]) => b - a);
}

function shortPath(p: string): string {
    if (p.length <= 30) return p;
    return p.slice(0, 13) + '...' + p.slice(-14);
}

interface TrafficData {
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
}

function PieChart({ data, size = 120 }: { data: [string, number][]; size?: number }) {
    const total = data.reduce((s, [, v]) => s + v, 0) || 1;
    const colors = ['#60a5fa', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4', '#e879f9', '#94a3b8'];
    let cumAngle = 0;

    const slices = data.slice(0, 6).map(([label, value], i) => {
        const pct = value / total;
        const startAngle = cumAngle;
        cumAngle += pct * 360;
        const start = (startAngle * Math.PI) / 180;
        const end = (cumAngle * Math.PI) / 180;
        const large = pct > 0.5 ? 1 : 0;
        const r = size / 2 - 4;
        const cx = size / 2, cy = size / 2;
        const x1 = cx + r * Math.sin(start), y1 = cy - r * Math.cos(start);
        const x2 = cx + r * Math.sin(end), y2 = cy - r * Math.cos(end);
        const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
        return { d, color: colors[i], label, value, pct };
    });

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} opacity={0.8} />)}
                <circle cx={size / 2} cy={size / 2} r={size / 4} fill="var(--bg-secondary)" />
                <text x={size / 2} y={size / 2} textAnchor="middle" dy="0.35em" fontSize={14} fontWeight={800} fill="var(--text-primary)">{total}</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
                {slices.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{s.label}</span>
                        <span style={{ fontWeight: 700 }}>{(s.pct * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BarList({ entries, maxCount }: { entries: [string, number][]; maxCount: number }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {entries.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có dữ liệu</div>}
            {entries.slice(0, 8).map(([label, count]) => (
                <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
                        <span style={{ fontWeight: 500 }}>{label}</span>
                        <span style={{ fontWeight: 700 }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${(count / (maxCount || 1)) * 100}%`, background: 'var(--gold-400)', borderRadius: 99, opacity: 0.7 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function TrafficTab({ data }: { data: TrafficData }) {
    const dev = data.devices;
    const traffic = data.traffic;
    const flow = data.userFlow;

    const deviceEntries = sortedEntries(dev.types);
    const browserEntries = sortedEntries(dev.browsers);
    const osEntries = sortedEntries(dev.operatingSystems);
    const resEntries = sortedEntries(dev.screenResolutions);
    const referrerEntries = sortedEntries(traffic.referrerSources);

    const deviceIcons: Record<string, string> = { mobile: '📱', tablet: '📱', desktop: '🖥️' };
    const deviceLabels: Record<string, string> = { mobile: 'Di động', tablet: 'Máy tính bảng', desktop: 'Máy tính' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Device KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
                {deviceEntries.map(([type, count]) => (
                    <div key={type} className="analytics-kpi-card">
                        <div className="analytics-kpi-card__header">
                            <span className="analytics-kpi-card__icon">{deviceIcons[type] || '📱'}</span>
                            <span className="analytics-kpi-card__label">{deviceLabels[type] || type}</span>
                        </div>
                        <div className="analytics-kpi-card__value" style={{ color: type === 'mobile' ? '#60a5fa' : type === 'desktop' ? '#22c55e' : '#a855f7' }}>{count}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Device Type Chart */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">📱 Loại thiết bị</h3>
                    <PieChart data={deviceEntries.map(([k, v]) => [deviceLabels[k] || k, v])} />
                </div>

                {/* Browsers */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">🌐 Trình duyệt</h3>
                    <PieChart data={browserEntries} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* OS */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">💻 Hệ điều hành</h3>
                    <BarList entries={osEntries} maxCount={osEntries[0]?.[1] || 1} />
                </div>

                {/* Screen Resolutions */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">📐 Độ phân giải màn hình</h3>
                    <BarList entries={resEntries} maxCount={resEntries[0]?.[1] || 1} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Referrer Sources */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">🔗 Nguồn truy cập</h3>
                    <BarList entries={referrerEntries} maxCount={referrerEntries[0]?.[1] || 1} />
                </div>

                {/* UTM Campaigns */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">📣 Chiến dịch UTM</h3>
                    {Object.keys(traffic.utmSources).length === 0 && Object.keys(traffic.utmCampaigns).length === 0 ? (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có chiến dịch UTM. Thêm <code>?utm_source=...</code> vào link quảng cáo.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {Object.keys(traffic.utmSources).length > 0 && (
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>SOURCE</div>
                                    <BarList entries={sortedEntries(traffic.utmSources)} maxCount={sortedEntries(traffic.utmSources)[0]?.[1] || 1} />
                                </div>
                            )}
                            {Object.keys(traffic.utmCampaigns).length > 0 && (
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>CAMPAIGN</div>
                                    <BarList entries={sortedEntries(traffic.utmCampaigns)} maxCount={sortedEntries(traffic.utmCampaigns)[0]?.[1] || 1} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Entry Pages */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">🚪 Trang đầu vào (Landing)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {traffic.entryPages.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có dữ liệu</div>}
                        {traffic.entryPages.slice(0, 8).map((p, i) => (
                            <div key={p.path} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                <span className={`analytics-rank ${i < 3 ? 'analytics-rank--top' : ''}`}>#{i + 1}</span>
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.path}>{shortPath(p.path)}</span>
                                <span style={{ fontWeight: 700 }}>{p.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Exit Pages */}
                <div className="analytics-card">
                    <h3 className="analytics-card__title">🏃 Trang thoát (Exit)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {traffic.exitPages.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có dữ liệu</div>}
                        {traffic.exitPages.slice(0, 8).map((p, i) => (
                            <div key={p.path} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                <span className={`analytics-rank ${i < 3 ? 'analytics-rank--top' : ''}`}>#{i + 1}</span>
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.path}>{shortPath(p.path)}</span>
                                <span style={{ fontWeight: 700, color: '#ef4444' }}>{p.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Page Flow / User Journey */}
            <div className="analytics-card">
                <h3 className="analytics-card__title">🔄 Luồng di chuyển phổ biến</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {flow.topTransitions.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chưa có dữ liệu luồng di chuyển</div>}
                    {flow.topTransitions.slice(0, 10).map((t, i) => {
                        const max = flow.topTransitions[0]?.count || 1;
                        return (
                            <div key={`${t.flow}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className={`analytics-rank ${i < 3 ? 'analytics-rank--top' : ''}`}>#{i + 1}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: i < 3 ? 600 : 400 }} title={t.flow}>{t.flow}</div>
                                    <div style={{ height: 3, background: 'var(--bg-tertiary)', borderRadius: 99, marginTop: 2 }}>
                                        <div style={{ height: '100%', width: `${(t.count / max) * 100}%`, background: i < 3 ? '#a855f7' : 'rgba(168,85,247,0.4)', borderRadius: 99 }} />
                                    </div>
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{t.count}×</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
