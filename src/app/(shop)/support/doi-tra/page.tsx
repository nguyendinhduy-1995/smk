import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Chính sách đổi trả — Siêu Thị Mắt Kính',
    description: 'Chính sách đổi trả sản phẩm trong 14 ngày tại Siêu Thị Mắt Kính. Đổi hàng miễn phí, hoàn tiền nhanh chóng.',
};

export default function DoiTraPage() {
    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: 720 }}>
            <nav style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                <Link href="/" style={{ color: 'var(--text-muted)' }}>Trang chủ</Link>
                <span> / </span>
                <Link href="/support" style={{ color: 'var(--text-muted)' }}>Hỗ trợ</Link>
                <span> / </span>
                <span style={{ color: 'var(--text-secondary)' }}>Đổi trả</span>
            </nav>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                🔄 Chính Sách Đổi Trả
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div className="card" style={{ padding: 'var(--space-5)', background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)' }}>
                    <p style={{ fontWeight: 700, color: 'var(--gold-400)', marginBottom: 'var(--space-2)' }}>✨ Cam kết của chúng tôi</p>
                    <p>Siêu Thị Mắt Kính cam kết mang lại trải nghiệm mua sắm tốt nhất. Nếu bạn không hài lòng với sản phẩm, chúng tôi sẵn sàng đổi trả trong vòng <strong>14 ngày</strong>.</p>
                </div>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>1. Điều kiện đổi trả</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <li>Sản phẩm còn nguyên tem, nhãn, hộp đựng và phụ kiện đi kèm</li>
                        <li>Sản phẩm chưa qua sử dụng, không bị trầy xước hoặc hư hỏng</li>
                        <li>Có hóa đơn mua hàng hoặc mã đơn hàng</li>
                        <li>Thời gian yêu cầu đổi trả trong vòng 14 ngày kể từ ngày nhận hàng</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>2. Sản phẩm không áp dụng đổi trả</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <li>Tròng kính đã cắt theo đơn thuốc (cận, viễn, loạn)</li>
                        <li>Sản phẩm đặt riêng theo yêu cầu khách hàng</li>
                        <li>Phụ kiện đã bóc tem sử dụng (dung dịch rửa kính, khăn lau)</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>3. Quy trình đổi trả</h2>
                    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                        {[
                            { step: '1', title: 'Liên hệ', desc: 'Gọi hotline 0987 350 626 hoặc nhắn tin qua Zalo/Facebook' },
                            { step: '2', title: 'Xác nhận', desc: 'Nhân viên xác nhận yêu cầu và hướng dẫn gửi hàng' },
                            { step: '3', title: 'Gửi hàng', desc: 'Gửi sản phẩm về địa chỉ cửa hàng (miễn phí vận chuyển)' },
                            { step: '4', title: 'Hoàn tất', desc: 'Nhận sản phẩm mới hoặc hoàn tiền trong 3-5 ngày làm việc' },
                        ].map((s) => (
                            <div key={s.step} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'start' }}>
                                <span style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', background: 'var(--gradient-gold)', color: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{s.step}</span>
                                <div>
                                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.title}</p>
                                    <p>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>4. Hình thức hoàn tiền</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <li><strong>Chuyển khoản:</strong> Hoàn tiền vào tài khoản ngân hàng trong 3-5 ngày làm việc</li>
                        <li><strong>Ví điện tử:</strong> Hoàn qua Momo, ZaloPay trong 1-2 ngày</li>
                        <li><strong>Đổi sản phẩm:</strong> Đổi ngay tại cửa hàng hoặc giao hàng mới miễn phí</li>
                    </ul>
                </section>

                <div style={{ textAlign: 'center', padding: 'var(--space-6)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Cần hỗ trợ đổi trả?</p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="tel:0123456789" className="btn btn-primary">📞 Gọi ngay</a>
                        <Link href="/support" className="btn btn-secondary" style={{ textDecoration: 'none' }}>💬 Chat hỗ trợ</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
