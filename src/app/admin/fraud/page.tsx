export default function AdminFraudPage() {
    const signals = [
        { partner: 'AFF_MINH', name: 'Minh Affiliate', returnRate: 35, cancelRate: 12, sameDevice: 3, sameAddress: 5, selfPurchase: 2, ipOverlap: 4, holdCommission: true, score: 58, level: 'AFFILIATE' },
        { partner: 'FAKE_01', name: 'Tài khoản test', returnRate: 80, cancelRate: 45, sameDevice: 12, sameAddress: 8, selfPurchase: 10, ipOverlap: 12, holdCommission: true, score: 92, level: 'AFFILIATE' },
        { partner: 'DUY123', name: 'Đại lý Duy', returnRate: 8, cancelRate: 5, sameDevice: 0, sameAddress: 1, selfPurchase: 0, ipOverlap: 0, holdCommission: false, score: 12, level: 'AGENT' },
        { partner: 'LEADER01', name: 'Shop Hà Nội', returnRate: 3, cancelRate: 2, sameDevice: 0, sameAddress: 0, selfPurchase: 0, ipOverlap: 0, holdCommission: false, score: 5, level: 'LEADER' },
    ];

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Phát hiện gian lận</h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Theo dõi risk score của đối tác</p>
                </div>
                <button className="btn btn-primary">🔄 Tính toán lại</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Đối tác cao rủi ro', value: '1', color: 'var(--error)' },
                    { label: 'Đối tác cảnh báo', value: '1', color: 'var(--warning)' },
                    { label: 'Đối tác an toàn', value: '2', color: 'var(--success)' },
                    { label: 'Tỉ lệ hoàn TB', value: '12%', color: 'var(--text-primary)' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-2xl)', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Đối tác</th>
                            <th>Cấp</th>
                            <th>Tỉ lệ hoàn (%)</th>
                            <th>Tỉ lệ huỷ (%)</th>
                            <th>Cùng device</th>
                            <th>Tự mua</th>
                            <th>IP trùng</th>
                            <th>Risk Score</th>
                            <th>HH</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {signals.sort((a, b) => b.score - a.score).map((s) => (
                            <tr key={s.partner}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.partner}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.name}</div>
                                </td>
                                <td>
                                    <span className="badge" style={{ background: 'var(--bg-tertiary)' }}>
                                        {s.level === 'LEADER' ? '👑' : s.level === 'AGENT' ? '🏆' : '⭐'} {s.level}
                                    </span>
                                </td>
                                <td style={{ color: s.returnRate > 25 ? 'var(--error)' : s.returnRate > 15 ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}>
                                    {s.returnRate}%
                                </td>
                                <td style={{ color: s.cancelRate > 20 ? 'var(--error)' : s.cancelRate > 10 ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: 600 }}>
                                    {s.cancelRate}%
                                </td>
                                <td>{s.sameDevice}</td>
                                <td style={{ color: s.selfPurchase > 0 ? 'var(--error)' : 'var(--text-muted)', fontWeight: s.selfPurchase > 0 ? 700 : 400 }}>
                                    {s.selfPurchase > 0 ? `🚨 ${s.selfPurchase}` : '0'}
                                </td>
                                <td style={{ color: s.ipOverlap > 2 ? 'var(--warning)' : 'var(--text-muted)' }}>
                                    {s.ipOverlap > 0 ? `⚠️ ${s.ipOverlap}` : '0'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                        <div style={{
                                            width: 60, height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                width: `${Math.min(s.score, 100)}%`, height: '100%',
                                                background: s.score > 60 ? 'var(--error)' : s.score > 30 ? 'var(--warning)' : 'var(--success)',
                                                borderRadius: 3,
                                            }} />
                                        </div>
                                        <span style={{
                                            fontWeight: 700, fontSize: 'var(--text-sm)',
                                            color: s.score > 60 ? 'var(--error)' : s.score > 30 ? 'var(--warning)' : 'var(--success)',
                                        }}>
                                            {s.score}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    {s.holdCommission ? (
                                        <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--error)', fontSize: 'var(--text-xs)' }}>🔒 Giữ</span>
                                    ) : (
                                        <span className="badge" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)', fontSize: 'var(--text-xs)' }}>✅ OK</span>
                                    )}
                                </td>
                                <td>
                                    {s.score > 60 && <button className="btn btn-sm btn-error" style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--error)' }}>🚫 Block</button>}
                                    {s.score > 30 && s.score <= 60 && <button className="btn btn-sm btn-ghost">⚠️ Xem</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <strong>Quy tắc tính Risk Score:</strong><br />
                Return rate &gt;25% (+30), &gt;15% (+15) · Cancel rate &gt;20% (+20), &gt;10% (+10)<br />
                Same device (+5/đơn) · Same address (+3/đơn) · <strong style={{ color: 'var(--error)' }}>Tự mua (+10/đơn)</strong> · <strong style={{ color: 'var(--warning)' }}>IP trùng (+5/đơn)</strong><br />
                Score &gt;40 → <strong>tự động giữ commission</strong> chờ admin review thủ công
            </div>
        </div>
    );
}
