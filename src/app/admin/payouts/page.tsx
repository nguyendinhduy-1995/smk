export default function AdminPayoutsPage() {
    const payouts = [
        { partner: 'DUY123', name: 'Đại lý Duy', amount: '1.500.000₫', bank: 'Vietcombank ****6789', status: 'REQUESTED', date: '20/02' },
        { partner: 'AFF_MINH', name: 'Minh Affiliate', amount: '800.000₫', bank: 'MB Bank ****4321', status: 'REQUESTED', date: '19/02' },
        { partner: 'LEADER01', name: 'Shop Hà Nội', amount: '5.000.000₫', bank: 'TCB ****8765', status: 'APPROVED', date: '18/02' },
        { partner: 'DUY123', name: 'Đại lý Duy', amount: '2.200.000₫', bank: 'Vietcombank ****6789', status: 'PAID', date: '15/02' },
    ];

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Yêu cầu rút tiền</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Chờ duyệt', value: '2', color: 'var(--warning)' },
                    { label: 'Đã duyệt', value: '1', color: 'var(--success)' },
                    { label: 'Tổng chờ xử lý', value: '7.300.000₫', color: 'var(--gold-400)' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-xl)', color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr><th>Đối tác</th><th>Số tiền</th><th>Tài khoản</th><th>Trạng thái</th><th>Ngày</th><th></th></tr>
                    </thead>
                    <tbody>
                        {payouts.map((p, i) => (
                            <tr key={i}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.partner}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.name}</div>
                                </td>
                                <td style={{ fontWeight: 700, color: 'var(--gold-400)' }}>{p.amount}</td>
                                <td style={{ fontSize: 'var(--text-xs)' }}>{p.bank}</td>
                                <td>
                                    <span className={`badge ${p.status === 'REQUESTED' ? 'badge-warning' : p.status === 'APPROVED' ? 'badge-success' : 'badge-info'}`}>
                                        {p.status === 'REQUESTED' ? 'Chờ duyệt' : p.status === 'APPROVED' ? 'Đã duyệt' : 'Đã trả'}
                                    </span>
                                </td>
                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.date}</td>
                                <td>
                                    {p.status === 'REQUESTED' && (
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn btn-sm btn-primary">✓ Duyệt</button>
                                            <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }}>✕</button>
                                        </div>
                                    )}
                                    {p.status === 'APPROVED' && <button className="btn btn-sm btn-primary">💸 Thanh toán</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
