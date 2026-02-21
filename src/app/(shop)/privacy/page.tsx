import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chính sách bảo mật — Siêu Thị Mắt Kính',
    description: 'Cam kết bảo mật thông tin cá nhân khách hàng tại Siêu Thị Mắt Kính.',
};

export default function PrivacyPage() {
    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: 720 }}>
            <nav style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                <Link href="/" style={{ color: 'var(--text-muted)' }}>Trang chủ</Link>
                <span> / </span>
                <span style={{ color: 'var(--text-secondary)' }}>Bảo mật</span>
            </nav>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                🔒 Chính Sách Bảo Mật
            </h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>Cập nhật lần cuối: 01/02/2026</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div className="card" style={{ padding: 'var(--space-5)', background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)' }}>
                    <p style={{ fontWeight: 700, color: 'var(--gold-400)', marginBottom: 'var(--space-2)' }}>🛡️ Cam kết</p>
                    <p>Siêu Thị Mắt Kính cam kết bảo vệ thông tin cá nhân của quý khách hàng. Chúng tôi không bán, trao đổi hoặc chia sẻ thông tin cho bên thứ ba ngoài mục đích phục vụ đơn hàng.</p>
                </div>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>1. Thông tin thu thập</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <li><strong>Thông tin cá nhân:</strong> Họ tên, số điện thoại, email, địa chỉ giao hàng</li>
                        <li><strong>Thông tin đơn hàng:</strong> Sản phẩm đã mua, lịch sử giao dịch</li>
                        <li><strong>Thông tin kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thiết bị truy cập</li>
                        <li><strong>Thông tin đo mắt:</strong> Đơn thuốc kính (nếu khách hàng cung cấp)</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>2. Mục đích sử dụng</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <li>Xử lý đơn hàng và giao hàng</li>
                        <li>Hỗ trợ khách hàng, bảo hành sản phẩm</li>
                        <li>Gửi thông tin khuyến mãi (có thể từ chối nhận)</li>
                        <li>Cải thiện trải nghiệm mua sắm trên website</li>
                        <li>Phòng chống gian lận và bảo mật tài khoản</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>3. Bảo vệ thông tin</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <li>Mật khẩu được mã hóa bằng công nghệ bcrypt</li>
                        <li>Kết nối website sử dụng giao thức HTTPS/SSL</li>
                        <li>Dữ liệu thanh toán không lưu trên server</li>
                        <li>Hệ thống được giám sát và cập nhật bảo mật thường xuyên</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>4. Cookie</h2>
                    <p>Website sử dụng cookie để:</p>
                    <ul style={{ paddingLeft: 'var(--space-5)', marginTop: 'var(--space-1)' }}>
                        <li>Duy trì đăng nhập và giỏ hàng</li>
                        <li>Ghi nhớ sản phẩm đã xem</li>
                        <li>Phân tích lượt truy cập ẩn danh</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>5. Quyền của khách hàng</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <li>Yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân</li>
                        <li>Từ chối nhận email/SMS marketing</li>
                        <li>Yêu cầu xóa tài khoản vĩnh viễn</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>6. Liên hệ</h2>
                    <p>Nếu có bất kỳ thắc mắc nào về chính sách bảo mật:</p>
                    <ul style={{ paddingLeft: 'var(--space-5)', marginTop: 'var(--space-2)' }}>
                        <li>Email: <a href="mailto:baomat@sieuthimatkinh.vn" style={{ color: 'var(--gold-400)' }}>baomat@sieuthimatkinh.vn</a></li>
                        <li>Hotline: <a href="tel:0123456789" style={{ color: 'var(--gold-400)' }}>0123 456 789</a></li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
