'use client';

export default function PartnerStorePage() {
    const PARTNER_CODE = 'DUY123';

    return (
        <div className="animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>🏪 Cửa hàng cá nhân</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                Quản lý mini-store của bạn tại <code style={{ color: 'var(--gold-400)' }}>/store/{PARTNER_CODE}</code>
            </p>

            {/* Preview */}
            <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Xem trước cửa hàng</h3>
                <div className="glass-card" style={{ padding: 'var(--space-5)', background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(96,165,250,0.04))' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#0a0a0f' }}>
                            D
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Đại lý Duy</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>🏆 AGENT · 42 đơn · ⭐ 4.8</p>
                        </div>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                        Chuyên gọng kính thời trang cao cấp. Tư vấn miễn phí, ship toàn quốc.
                    </p>
                </div>
            </div>

            {/* Settings */}
            <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Tuỳ chỉnh cửa hàng</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Mô tả cửa hàng</label>
                        <textarea className="input" rows={3} defaultValue="Chuyên gọng kính thời trang cao cấp. Tư vấn miễn phí, ship toàn quốc." style={{ resize: 'vertical' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Sản phẩm hiển thị</label>
                        <select className="input">
                            <option>Tất cả sản phẩm</option>
                            <option>Chỉ sản phẩm yêu thích</option>
                            <option>Best sellers</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>💾 Lưu thay đổi</button>
                </div>
            </div>

            {/* Stats */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📊 Thống kê cửa hàng</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                    {[
                        { label: 'Lượt xem', value: '1,245' },
                        { label: 'Đơn hàng', value: '42' },
                        { label: 'Tỷ lệ mua', value: '3.4%' },
                    ].map((s) => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--gold-400)' }}>{s.value}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
