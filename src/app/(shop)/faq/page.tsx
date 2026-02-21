'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQ_CATEGORIES = [
    {
        title: '🛒 Đặt hàng & Thanh toán',
        items: [
            { q: 'Làm sao để đặt hàng?', a: 'Chọn sản phẩm → Thêm vào giỏ → Nhập thông tin giao hàng → Chọn thanh toán → Xác nhận. Bạn sẽ nhận mã đơn hàng ngay sau khi đặt.' },
            { q: 'Có những hình thức thanh toán nào?', a: 'Hỗ trợ: COD (thanh toán khi nhận), chuyển khoản ngân hàng, ví Momo, ZaloPay, và thẻ quốc tế (Visa/Mastercard).' },
            { q: 'Tôi có thể sử dụng mã giảm giá không?', a: 'Nhập mã coupon tại bước giỏ hàng. Mỗi đơn chỉ dùng được 1 mã. Mã từ đối tác/affiliate cũng áp dụng tại đây.' },
        ],
    },
    {
        title: '🚚 Giao hàng & Vận chuyển',
        items: [
            { q: 'Thời gian giao hàng bao lâu?', a: 'Nội thành HCM/HN: 1-2 ngày. Tỉnh thành khác: 3-5 ngày. Kính cắt theo đơn thuốc: thêm 2-3 ngày gia công.' },
            { q: 'Phí ship bao nhiêu?', a: 'Miễn phí ship cho đơn từ 500.000đ. Đơn dưới 500k: phí 30.000đ toàn quốc.' },
            { q: 'Tra cứu đơn hàng ở đâu?', a: 'Vào trang "Tra cứu vận đơn" trên menu, nhập mã đơn hàng hoặc mã vận đơn để theo dõi trạng thái.' },
        ],
    },
    {
        title: '↩️ Đổi trả & Bảo hành',
        items: [
            { q: 'Chính sách đổi trả thế nào?', a: 'Đổi trả trong 7 ngày kể từ ngày nhận hàng, sản phẩm còn nguyên tem/hộp/phụ kiện. Hoàn tiền trong 3-5 ngày làm việc.' },
            { q: 'Bảo hành kính bao lâu?', a: 'Gọng kính: bảo hành 6 tháng (lỗi sản xuất). Tròng kính: bảo hành 12 tháng (bong tróc, rạn nứt do lỗi).' },
            { q: 'Kính cắt theo đơn có đổi trả được không?', a: 'Kính cắt theo đơn thuốc được đổi nếu sai độ (cung cấp đơn gốc). Không đổi nếu do thay đổi ý định.' },
        ],
    },
    {
        title: '👓 Tư vấn chọn kính',
        items: [
            { q: 'Làm sao chọn kính phù hợp khuôn mặt?', a: 'Dùng tính năng "Thử Kính Online" hoặc chat với Chuyên Viên Tư Vấn để nhận gợi ý dựa trên hình dáng khuôn mặt.' },
            { q: 'Độ cận bao nhiêu thì nên dùng tròng gì?', a: 'Cận nhẹ (<2 độ): tròng 1.56 thường. Cận trung (2-6 độ): tròng 1.60/1.67. Cận nặng (>6 độ): tròng 1.74 siêu mỏng.' },
            { q: 'Chống ánh sáng xanh có cần thiết không?', a: 'Rất khuyên dùng nếu bạn ngồi máy tính/điện thoại >4 giờ/ngày. Giảm mỏi mắt, bảo vệ giấc ngủ.' },
        ],
    },
    {
        title: '🤝 Đối tác & Affiliate',
        items: [
            { q: 'Làm sao đăng ký đối tác?', a: 'Vào trang "Đăng ký đối tác" → Điền thông tin → Nhận link giới thiệu riêng → Chia sẻ và kiếm hoa hồng 5-12%.' },
            { q: 'Hoa hồng tính thế nào?', a: 'Affiliate 5%, Agent 8%, Leader 12% trên giá trị đơn hàng DELIVERED. Hoa hồng khả dụng sau 14 ngày hold.' },
            { q: 'Rút tiền về đâu?', a: 'Rút về tài khoản ngân hàng cá nhân. Tối thiểu 100.000đ/lần. Xử lý trong 1-3 ngày làm việc.' },
        ],
    },
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggle = (key: string) => setOpenIndex(prev => prev === key ? null : key);

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)', textAlign: 'center' }}>❓ Câu hỏi thường gặp</h1>
            <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-8)' }}>
                Tìm câu trả lời nhanh cho các thắc mắc phổ biến
            </p>

            {FAQ_CATEGORIES.map((cat, ci) => (
                <div key={ci} style={{ marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>{cat.title}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {cat.items.map((item, qi) => {
                            const key = `${ci}-${qi}`;
                            const isOpen = openIndex === key;
                            return (
                                <div key={key} className="card" style={{ overflow: 'hidden' }}>
                                    <button onClick={() => toggle(key)} style={{
                                        width: '100%', padding: 'var(--space-4)', background: 'none', border: 'none',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        cursor: 'pointer', color: 'var(--text-primary)', textAlign: 'left',
                                    }}>
                                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', flex: 1 }}>{item.q}</span>
                                        <span style={{
                                            fontSize: 'var(--text-lg)', transition: 'transform 200ms',
                                            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                                            color: 'var(--gold-400)', flexShrink: 0, marginLeft: 12,
                                        }}>+</span>
                                    </button>
                                    {isOpen && (
                                        <div style={{
                                            padding: '0 var(--space-4) var(--space-4)',
                                            fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6,
                                            borderTop: '1px solid var(--border-primary)', paddingTop: 'var(--space-3)',
                                        }}>
                                            {item.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Contact section */}
            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Chưa tìm được câu trả lời?</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                    Liên hệ với đội ngũ hỗ trợ của chúng tôi
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/support" className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>💬 Chat Tư Vấn</Link>
                    <a href="tel:1900XXXX" className="btn" style={{ fontSize: 'var(--text-sm)', background: 'var(--bg-tertiary)' }}>📞 Hotline: 1900-XXXX</a>
                    <a href="mailto:support@sieuthimatkinh.vn" className="btn" style={{ fontSize: 'var(--text-sm)', background: 'var(--bg-tertiary)' }}>📧 Email hỗ trợ</a>
                </div>
            </div>
        </div>
    );
}
