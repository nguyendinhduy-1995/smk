import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Đăng ký Đại lý / Affiliate',
    description: 'Bạn chỉ việc bán — SMK hỗ trợ viết bài, làm hình, vận hành shop, xây dựng thương hiệu!',
};

export default function PartnerRegistrationPage() {
    return (
        <div className="container animate-in" style={{ maxWidth: 640, margin: '0 auto', paddingTop: 'var(--space-8)' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <span style={{ fontSize: 48 }}>🤝</span>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginTop: 'var(--space-3)', lineHeight: 1.3 }}>
                    Bạn chỉ việc{' '}
                    <span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        bán
                    </span>
                    <br />
                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Hãy để SMK lo phần còn lại 
                    </span>
                </h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)', lineHeight: 1.6, maxWidth: 480, margin: '12px auto 0' }}>
                    SMK đồng hành toàn diện cùng bạn — từ nội dung, hình ảnh, vận hành đến xây dựng thương hiệu. Bạn chỉ cần tập trung bán hàng!
                </p>
            </div>

            {/* SMK hỗ trợ bạn */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 'var(--space-3)' }}>
                    SMK hỗ trợ bạn
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                    {[
                        { icon: '✍️', title: 'Viết bài', desc: 'Caption, bài review, kịch bản video sẵn' },
                        { icon: '🎨', title: 'Thiết kế hình ảnh', desc: 'Banner, poster, ảnh sản phẩm chuyên nghiệp' },
                        { icon: '🏪', title: 'Vận hành shop', desc: 'Hỗ trợ setup & quản lý gian hàng' },
                        { icon: '🏆', title: 'Xây thương hiệu', desc: 'Đồng hành xây dựng thương hiệu cá nhân' },
                        { icon: '🚚', title: 'Vận chuyển', desc: 'Ship COD toàn quốc, đóng gói cẩn thận' },
                        { icon: '📚', title: 'Đào tạo', desc: 'Hướng dẫn kỹ năng bán hàng, chốt đơn' },
                    ].map((b) => (
                        <div key={b.title} className="glass-card" style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                            <span style={{ fontSize: 24 }}>{b.icon}</span>
                            <p style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{b.title}</p>
                            <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.4 }}>{b.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tại sao chọn SMK */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', background: 'rgba(212,168,83,0.04)', border: '1px solid rgba(212,168,83,0.12)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>💡 Tại sao chọn SMK?</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                        '✅ Không cần vốn lớn — chỉ cần điện thoại và khả năng bán hàng',
                        '✅ Hoa hồng hấp dẫn theo từng cấp bậc đối tác',
                        '✅ Hàng chính hãng, bảo hành uy tín, khách hàng tin tưởng',
                        '✅ Đội ngũ SMK hỗ trợ 1:1 — bạn không bao giờ đơn độc',
                    ].map((t) => (
                        <p key={t} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t}</p>
                    ))}
                </div>
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
                            <option value="AFFILIATE">Cộng tác viên</option>
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
