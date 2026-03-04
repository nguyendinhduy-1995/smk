import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hướng dẫn đo mắt — Siêu Thị Mắt Kính',
    description: 'Hướng dẫn tự đo số mắt tại nhà và cách đọc đơn thuốc kính. Tư vấn miễn phí từ chuyên gia.',
};

export default function DoMatPage() {
    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: 720 }}>
            <nav style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                <Link href="/" style={{ color: 'var(--text-muted)' }}>Trang chủ</Link>
                <span> / </span>
                <Link href="/support" style={{ color: 'var(--text-muted)' }}>Hỗ trợ</Link>
                <span> / </span>
                <span style={{ color: 'var(--text-secondary)' }}>Đo mắt</span>
            </nav>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                 Hướng Dẫn Đo Mắt
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div className="card" style={{ padding: 'var(--space-5)', background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)' }}>
                    <p style={{ fontWeight: 700, color: 'var(--gold-400)', marginBottom: 'var(--space-2)' }}>💡 Lời khuyên</p>
                    <p>Để có kết quả chính xác nhất, bạn nên đo mắt tại cửa hàng hoặc bệnh viện mắt. Nếu đã có đơn thuốc, bạn có thể gửi cho chúng tôi để lắp tròng.</p>
                </div>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Cách đọc đơn thuốc kính</h2>
                    <div className="card" style={{ padding: 'var(--space-4)', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'left', color: 'var(--text-muted)' }}>Ký hiệu</th>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'left', color: 'var(--text-muted)' }}>Ý nghĩa</th>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'left', color: 'var(--text-muted)' }}>Ví dụ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { sym: 'SPH', meaning: 'Độ cầu (cận/viễn)', ex: '-2.00 (cận 2 độ)' },
                                    { sym: 'CYL', meaning: 'Độ trụ (loạn thị)', ex: '-0.75' },
                                    { sym: 'AXIS', meaning: 'Trục loạn', ex: '180°' },
                                    { sym: 'ADD', meaning: 'Độ cộng (lão thị)', ex: '+1.50' },
                                    { sym: 'PD', meaning: 'Khoảng cách đồng tử', ex: '62mm' },
                                ].map((r) => (
                                    <tr key={r.sym} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                                        <td style={{ padding: 'var(--space-2)', fontWeight: 700, color: 'var(--gold-400)' }}>{r.sym}</td>
                                        <td style={{ padding: 'var(--space-2)' }}>{r.meaning}</td>
                                        <td style={{ padding: 'var(--space-2)', color: 'var(--text-muted)' }}>{r.ex}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Tự đo PD (khoảng cách đồng tử)</h2>
                    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                        {[
                            { step: '1', desc: 'Đứng trước gương cách khoảng 20cm, ánh sáng đầy đủ' },
                            { step: '2', desc: 'Đặt thước kẻ lên sống mũi, mép trái thước ngang tâm mắt trái' },
                            { step: '3', desc: 'Nhắm mắt trái, nhìn thẳng vào gương bằng mắt phải' },
                            { step: '4', desc: 'Đọc số mm ở tâm mắt phải — đó là PD của bạn (thường 58-68mm)' },
                        ].map((s) => (
                            <div key={s.step} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'start' }}>
                                <span style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', background: 'var(--gradient-gold)', color: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{s.step}</span>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Dịch vụ đo mắt tại cửa hàng</h2>
                    <ul style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <li>✅ Đo mắt miễn phí bằng máy đo chuyên dụng</li>
                        <li>✅ Tư vấn chọn tròng kính phù hợp</li>
                        <li>✅ Lắp ráp và canh chỉnh kính tại chỗ</li>
                        <li>✅ Thời gian: 15-20 phút</li>
                    </ul>
                </section>

                <div style={{ textAlign: 'center', padding: 'var(--space-6)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Đã có đơn thuốc?</p>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Gửi ảnh đơn thuốc qua Zalo để được tư vấn chọn tròng</p>
                    <a href="tel:0123456789" className="btn btn-primary">📞 Liên hệ tư vấn</a>
                </div>
            </div>
        </div>
    );
}
