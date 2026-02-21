import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hướng dẫn chọn size kính — Siêu Thị Mắt Kính',
    description: 'Cách đo kích thước kính phù hợp với khuôn mặt. Hướng dẫn đọc thông số gọng kính và chọn size chuẩn.',
};

export default function SizeGuidePage() {
    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)', maxWidth: 720 }}>
            <nav style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                <Link href="/" style={{ color: 'var(--text-muted)' }}>Trang chủ</Link>
                <span> / </span>
                <Link href="/support" style={{ color: 'var(--text-muted)' }}>Hỗ trợ</Link>
                <span> / </span>
                <span style={{ color: 'var(--text-secondary)' }}>Chọn size</span>
            </nav>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                📏 Hướng Dẫn Chọn Size Kính
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Cách đọc thông số gọng kính</h2>
                    <p>Trên mọi gọng kính đều có 3 số in ở mặt trong càng kính, ví dụ: <strong style={{ color: 'var(--gold-400)' }}>52-18-140</strong></p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                        {[
                            { num: '52', name: 'Chiều rộng tròng', unit: 'mm', desc: 'Đo ngang tròng kính' },
                            { num: '18', name: 'Cầu kính', unit: 'mm', desc: 'Khoảng cách 2 tròng' },
                            { num: '140', name: 'Càng kính', unit: 'mm', desc: 'Chiều dài gọng gài tai' },
                        ].map((s) => (
                            <div key={s.num} className="card" style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                                <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gold-400)' }}>{s.num}</p>
                                <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>{s.name}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Bảng size theo khuôn mặt</h2>
                    <div className="card" style={{ padding: 'var(--space-4)', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'left', color: 'var(--text-muted)' }}>Khuôn mặt</th>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'center', color: 'var(--text-muted)' }}>Tròng (mm)</th>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'center', color: 'var(--text-muted)' }}>Cầu (mm)</th>
                                    <th style={{ padding: 'var(--space-2)', textAlign: 'center', color: 'var(--text-muted)' }}>Càng (mm)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { face: 'Nhỏ', lens: '48-51', bridge: '16-18', temple: '135-140' },
                                    { face: 'Trung bình', lens: '51-55', bridge: '17-19', temple: '140-145' },
                                    { face: 'Lớn', lens: '55-60', bridge: '18-22', temple: '145-150' },
                                ].map((r) => (
                                    <tr key={r.face} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                                        <td style={{ padding: 'var(--space-2)', fontWeight: 600 }}>{r.face}</td>
                                        <td style={{ padding: 'var(--space-2)', textAlign: 'center', color: 'var(--gold-400)', fontWeight: 600 }}>{r.lens}</td>
                                        <td style={{ padding: 'var(--space-2)', textAlign: 'center' }}>{r.bridge}</td>
                                        <td style={{ padding: 'var(--space-2)', textAlign: 'center' }}>{r.temple}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Mẹo chọn kính theo khuôn mặt</h2>
                    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                        {[
                            { face: 'Mặt tròn', tip: 'Chọn gọng vuông, chữ nhật hoặc browline để tạo góc cạnh' },
                            { face: 'Mặt vuông', tip: 'Chọn gọng tròn, oval hoặc aviator để làm mềm đường nét' },
                            { face: 'Mặt trái xoan', tip: 'May mắn! Hầu hết kiểu gọng đều phù hợp' },
                            { face: 'Mặt dài', tip: 'Chọn gọng to, oversized hoặc cat-eye để cân bằng chiều dài' },
                            { face: 'Mặt trái tim', tip: 'Chọn gọng nhẹ phần trên, mở rộng phần dưới như aviator' },
                        ].map((item) => (
                            <div key={item.face} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'start' }}>
                                <span style={{ color: 'var(--gold-400)', fontWeight: 600, flexShrink: 0, minWidth: 90 }}>{item.face}:</span>
                                <p>{item.tip}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div style={{ textAlign: 'center', padding: 'var(--space-6)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>Không chắc size nào phù hợp?</p>
                    <Link href="/try-on" className="btn btn-primary" style={{ textDecoration: 'none' }}>🪞 Thử kính online</Link>
                </div>
            </div>
        </div>
    );
}
