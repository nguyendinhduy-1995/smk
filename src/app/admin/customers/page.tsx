export default function AdminCustomersPage() {
    const customers = [
        { name: 'Nguyễn Văn Khách', email: 'khach@example.com', phone: '0912 345 678', orders: 5, spent: '18.500.000₫', joined: '01/2026' },
        { name: 'Trần Thị Mai', email: 'mai@example.com', phone: '0923 456 789', orders: 3, spent: '12.780.000₫', joined: '01/2026' },
        { name: 'Lê Hoàng', email: 'hoang@example.com', phone: '0934 567 890', orders: 2, spent: '6.280.000₫', joined: '02/2026' },
        { name: 'Phạm Minh', email: 'minh@example.com', phone: '0945 678 901', orders: 1, spent: '8.990.000₫', joined: '02/2026' },
        { name: 'Võ Thanh', email: 'thanh@example.com', phone: '0956 789 012', orders: 7, spent: '32.560.000₫', joined: '12/2025' },
    ];

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Khách hàng</h1>
                <input className="input" placeholder="Tìm khách hàng..." style={{ width: 260 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                {[
                    { label: 'Tổng khách', value: '156', change: '+12 tháng này' },
                    { label: 'Khách mới (30 ngày)', value: '28', change: '+18%' },
                    { label: 'Tỷ lệ quay lại', value: '34%', change: '+5%' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card__label">{s.label}</div>
                        <div className="stat-card__value" style={{ fontSize: 'var(--text-2xl)' }}>{s.value}</div>
                        <div className="stat-card__change stat-card__change--up">↑ {s.change}</div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr><th>Khách hàng</th><th>Liên hệ</th><th>Đơn hàng</th><th>Tổng chi</th><th>Tham gia</th><th></th></tr>
                    </thead>
                    <tbody>
                        {customers.map((c) => (
                            <tr key={c.email}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                                <td>
                                    <div style={{ fontSize: 'var(--text-xs)' }}>{c.email}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.phone}</div>
                                </td>
                                <td>{c.orders}</td>
                                <td style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{c.spent}</td>
                                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.joined}</td>
                                <td><button className="btn btn-sm btn-ghost">👁️</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
