import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Đăng ký Đại lý / Affiliate',
    description: 'Trở thành đối tác của Siêu Thị Mắt Kính — kiếm hoa hồng lên đến 20%',
};

export default function PartnerRegistrationPage() {
    return (
        <div className="container animate-in" style={{ maxWidth: 640, margin: '0 auto', paddingTop: 'var(--space-8)' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <span style={{ fontSize: 48 }}>💼</span>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginTop: 'var(--space-3)' }}>
                    Trở thành{' '}
                    <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Đối tác
                    </span>
                </h1>
                <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                    Kiếm hoa hồng lên đến 20% cho mỗi đơn hàng giới thiệu thành công
                </p>
            </div>

            {/* Benefits */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                {[
                    { icon: '💰', title: 'Hoa hồng cao', desc: 'Đến 20%/đơn' },
                    { icon: '📊', title: 'Dashboard', desc: 'Theo dõi realtime' },
                    { icon: '🤖', title: 'AI hỗ trợ', desc: 'Content tự động' },
                ].map((b) => (
                    <div key={b.title} className="glass-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                        <span style={{ fontSize: 28 }}>{b.icon}</span>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 'var(--space-2)' }}>{b.title}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{b.desc}</p>
                    </div>
                ))}
            </div>

            {/* Registration Form */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                    Đăng ký đối tác
                </h3>
                <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div className="input-group">
                        <label className="input-label">Họ và tên *</label>
                        <input className="input" placeholder="Nguyễn Văn A" required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                        <div className="input-group">
                            <label className="input-label">Số điện thoại *</label>
                            <input className="input" placeholder="0912 345 678" type="tel" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input className="input" placeholder="email@example.com" type="email" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Loại đối tác *</label>
                        <select className="input">
                            <option value="AFFILIATE">Affiliate (cộng tác viên)</option>
                            <option value="AGENT">Đại lý</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Mã đối tác mong muốn</label>
                        <input className="input" placeholder="VD: DUY123 (3-10 ký tự)" />
                        <span className="input-helper">Mã này sẽ xuất hiện trong link giới thiệu và mã giảm giá</span>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Kênh bán hàng chính</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                            {['Facebook', 'TikTok', 'Zalo', 'Instagram', 'YouTube', 'Khác'].map((ch) => (
                                <label key={ch} className="filter-chip" style={{ cursor: 'pointer' }}>
                                    <input type="checkbox" style={{ display: 'none' }} />
                                    {ch}
                                </label>
                            ))}
                        </div>
                    </div>

                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 'var(--space-2)' }}>
                        🏦 Thông tin ngân hàng
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                        <div className="input-group">
                            <label className="input-label">Ngân hàng</label>
                            <select className="input">
                                <option>Chọn ngân hàng</option>
                                <option>Vietcombank</option>
                                <option>Techcombank</option>
                                <option>MB Bank</option>
                                <option>VPBank</option>
                                <option>ACB</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Số tài khoản</label>
                            <input className="input" placeholder="0123456789" />
                        </div>
                    </div>
                    <div className="input-group">
                        <label className="input-label">Chủ tài khoản</label>
                        <input className="input" placeholder="NGUYEN VAN A" />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                        Gửi đăng ký
                    </button>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Đơn đăng ký sẽ được xét duyệt trong 24 giờ làm việc
                    </p>
                </form>
            </div>
        </div>
    );
}
