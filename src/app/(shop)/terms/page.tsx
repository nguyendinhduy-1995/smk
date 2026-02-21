import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Điều khoản dịch vụ — Siêu Thị Mắt Kính',
    description: 'Điều khoản sử dụng website và dịch vụ tại Siêu Thị Mắt Kính.',
};

export default function TermsPage() {
    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: 720 }}>
            <nav style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                <Link href="/" style={{ color: 'var(--text-muted)' }}>Trang chủ</Link>
                <span> / </span>
                <span style={{ color: 'var(--text-secondary)' }}>Điều khoản dịch vụ</span>
            </nav>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                📋 Điều Khoản Dịch Vụ
            </h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>Cập nhật lần cuối: 01/02/2026</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>1. Giới thiệu</h2>
                    <p>Chào mừng bạn đến với Siêu Thị Mắt Kính (sieuthimatkinh.vn). Khi sử dụng trang web và dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản dưới đây.</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>2. Tài khoản người dùng</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <li>Bạn cần cung cấp thông tin chính xác khi đăng ký tài khoản</li>
                        <li>Bạn chịu trách nhiệm bảo mật mật khẩu và hoạt động tài khoản</li>
                        <li>Mỗi người chỉ được sở hữu một tài khoản</li>
                        <li>Chúng tôi có quyền khóa tài khoản vi phạm điều khoản</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>3. Đặt hàng và thanh toán</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <li>Giá sản phẩm được niêm yết bằng VNĐ, đã bao gồm VAT</li>
                        <li>Đơn hàng chỉ được xác nhận sau khi chúng tôi gửi email/SMS xác nhận</li>
                        <li>Chúng tôi có quyền hủy đơn hàng nếu phát hiện sai sót về giá hoặc thông tin sản phẩm</li>
                        <li>Thanh toán hỗ trợ: COD, chuyển khoản, thẻ, ví điện tử</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>4. Giao hàng</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <li>Thời gian giao hàng: 2-5 ngày tùy khu vực</li>
                        <li>Miễn phí giao hàng cho đơn từ 500.000đ</li>
                        <li>Khách hàng vui lòng kiểm tra sản phẩm trước khi nhận</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>5. Sở hữu trí tuệ</h2>
                    <p>Tất cả nội dung trên website bao gồm hình ảnh, logo, bài viết đều thuộc quyền sở hữu của Siêu Thị Mắt Kính. Nghiêm cấm sao chép, tái sử dụng khi chưa được phép.</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>6. Giới hạn trách nhiệm</h2>
                    <p>Chúng tôi không chịu trách nhiệm cho các thiệt hại gián tiếp phát sinh từ việc sử dụng website. Mọi thông tin sản phẩm được cung cấp với độ chính xác cao nhất, nhưng có thể có sai sót nhỏ.</p>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>7. Liên hệ</h2>
                    <p>Mọi thắc mắc về điều khoản dịch vụ, xin liên hệ:</p>
                    <ul style={{ paddingLeft: 'var(--space-5)', marginTop: 'var(--space-2)' }}>
                        <li>Email: <a href="mailto:info@sieuthimatkinh.vn" style={{ color: 'var(--gold-400)' }}>info@sieuthimatkinh.vn</a></li>
                        <li>Hotline: <a href="tel:0123456789" style={{ color: 'var(--gold-400)' }}>0123 456 789</a></li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
