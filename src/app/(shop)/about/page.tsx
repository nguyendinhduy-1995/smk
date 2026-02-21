import Link from 'next/link';

export default function AboutPage() {
    const stats = [
        { icon: '👓', number: '200+', label: 'Sản phẩm' },
        { icon: '👥', number: '5,000+', label: 'Khách hàng' },
        { icon: '⭐', number: '4.8', label: 'Đánh giá' },
        { icon: '🏪', number: '3', label: 'Chi nhánh' },
        { icon: '🚚', number: '63', label: 'Tỉnh thành' },
        { icon: '🤝', number: '50+', label: 'Đại lý' },
    ];

    const timeline = [
        { year: '2020', title: 'Khởi đầu', desc: 'Thành lập với mục tiêu mang kính mắt chất lượng đến mọi người' },
        { year: '2022', title: 'Mở rộng', desc: 'Chi nhánh thứ 2 - Hệ thống đại lý toàn quốc' },
        { year: '2024', title: 'Công nghệ', desc: 'Tích hợp AI Stylist, thử kính AR, hệ thống quản lý thông minh' },
        { year: '2026', title: 'Hiện tại', desc: 'Nền tảng kính mắt #1: AI tư vấn, 200+ SP, giao hàng 63 tỉnh' },
    ];

    const values = [
        { icon: '💎', title: 'Chính hãng 100%', desc: 'Cam kết sản phẩm chính hãng, có giấy chứng nhận' },
        { icon: '🔬', title: 'Kiểm tra miễn phí', desc: 'Đo mắt, đo khoảng cách đồng tử miễn phí tại cửa hàng' },
        { icon: '🛡️', title: 'Bảo hành 12 tháng', desc: 'Bảo hành gọng 6 tháng, tròng 12 tháng. Đổi trả 7 ngày' },
        { icon: '🚀', title: 'Giao nhanh', desc: 'Miễn phí giao hàng đơn từ 500K. Nội thành 2h, liên tỉnh 1-3 ngày' },
    ];

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <span style={{ fontSize: 48 }}>👓</span>
                <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 800, lineHeight: 1.2, marginTop: 'var(--space-2)' }}>
                    Siêu Thị Mắt Kính
                </h1>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-tertiary)', maxWidth: 600, margin: 'var(--space-3) auto 0', lineHeight: 1.6 }}>
                    Nền tảng kính mắt thời trang hàng đầu Việt Nam. Chính hãng 100%, AI tư vấn, thử kính online.
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                {stats.map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                        <span style={{ fontSize: 28 }}>{s.icon}</span>
                        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--gold-400)', marginTop: 4 }}>{s.number}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Timeline */}
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, textAlign: 'center', marginBottom: 'var(--space-6)' }}>📅 Hành trình phát triển</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', maxWidth: 600, margin: '0 auto var(--space-8)' }}>
                {timeline.map((t, i) => (
                    <div key={t.year} style={{ display: 'flex', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: i === timeline.length - 1 ? 'var(--gradient-gold)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: i === timeline.length - 1 ? '#000' : 'var(--text-primary)', flexShrink: 0 }}>{t.year}</div>
                            {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border-primary)', marginTop: 4 }} />}
                        </div>
                        <div className="card" style={{ padding: 'var(--space-4)', flex: 1 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{t.title}</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Values */}
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, textAlign: 'center', marginBottom: 'var(--space-6)' }}>🌟 Cam kết của chúng tôi</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {values.map(v => (
                    <div key={v.title} className="glass-card" style={{ padding: 'var(--space-5)' }}>
                        <span style={{ fontSize: 32 }}>{v.icon}</span>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginTop: 'var(--space-2)' }}>{v.title}</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 4 }}>{v.desc}</p>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(96,165,250,0.04))' }}>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Khám phá ngay!</h2>
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>Tìm kính phù hợp với bạn trong 2 phút với AI Stylist</p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/search" className="btn btn-primary" style={{ textDecoration: 'none' }}>🔍 Xem sản phẩm</Link>
                    <Link href="/quiz" className="btn" style={{ textDecoration: 'none' }}>🤖 Quiz tìm kính</Link>
                    <Link href="/try-on" className="btn" style={{ textDecoration: 'none' }}>🪞 Thử kính AR</Link>
                </div>
            </div>
        </div>
    );
}
