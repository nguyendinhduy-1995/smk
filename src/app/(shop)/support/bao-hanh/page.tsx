import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chính sách bảo hành — Siêu Thị Mắt Kính',
    description: 'Bảo hành chính hãng 12 tháng cho gọng kính, 6 tháng cho tròng kính tại Siêu Thị Mắt Kính.',
};

export default function BaoHanhPage() {
    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: 720 }}>
            <nav style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                <Link href="/" style={{ color: 'var(--text-muted)' }}>Trang chủ</Link>
                <span> / </span>
                <Link href="/support" style={{ color: 'var(--text-muted)' }}>Hỗ trợ</Link>
                <span> / </span>
                <span style={{ color: 'var(--text-secondary)' }}>Bảo hành</span>
            </nav>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                🛡️ Chính Sách Bảo Hành
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div className="card" style={{ padding: 'var(--space-5)', background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)' }}>
                    <p style={{ fontWeight: 700, color: 'var(--gold-400)', marginBottom: 'var(--space-2)' }}>✨ Bảo hành chính hãng</p>
                    <p>Tất cả sản phẩm tại Siêu Thị Mắt Kính đều được bảo hành chính hãng. Quý khách yên tâm mua sắm.</p>
                </div>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Thời gian bảo hành</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                        {[
                            { icon: '🔲', name: 'Gọng kính', time: '12 tháng', desc: 'Lỗi sản xuất, gãy bản lề, tróc sơn' },
                            { icon: '🔵', name: 'Tròng kính', time: '6 tháng', desc: 'Tróc lớp phủ, bong tròng, lỗi quang học' },
                            { icon: '🕶️', name: 'Kính râm', time: '12 tháng', desc: 'Lỗi sản xuất, phai màu, gãy gọng' },
                            { icon: '🧴', name: 'Phụ kiện', time: '3 tháng', desc: 'Lỗi sản xuất, hư hỏng do chất liệu' },
                        ].map((item) => (
                            <div key={item.name} className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                                <div style={{ fontSize: 32, marginBottom: 'var(--space-2)' }}>{item.icon}</div>
                                <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</p>
                                <p style={{ fontWeight: 700, color: 'var(--gold-400)', fontSize: 'var(--text-lg)' }}>{item.time}</p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Không áp dụng bảo hành</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <li>Hư hỏng do tác động ngoại lực: rơi, va đập, ngồi đè</li>
                        <li>Hư hỏng do tiếp xúc hóa chất, nhiệt độ cao</li>
                        <li>Sản phẩm đã tự ý sửa chữa tại nơi khác</li>
                        <li>Trầy xước do sử dụng hàng ngày (trầy tròng, xước gọng)</li>
                        <li>Hết thời hạn bảo hành</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Quy trình bảo hành</h2>
                    <ol style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <li>Mang sản phẩm đến cửa hàng hoặc gửi qua bưu điện</li>
                        <li>Nhân viên kiểm tra và xác nhận tình trạng</li>
                        <li>Sửa chữa hoặc thay thế trong 3-7 ngày làm việc</li>
                        <li>Nhận lại sản phẩm tại cửa hàng hoặc giao tận nơi</li>
                    </ol>
                </section>

                <div style={{ textAlign: 'center', padding: 'var(--space-6)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Cần bảo hành sản phẩm?</p>
                    <a href="tel:0123456789" className="btn btn-primary">📞 Gọi hotline: 0123 456 789</a>
                </div>
            </div>
        </div>
    );
}
