'use client';

import Link from 'next/link';
import { useState } from 'react';

const POSTS = [
    {
        slug: 'cach-chon-kinh-theo-khuon-mat', title: 'Cách chọn kính phù hợp với khuôn mặt',
        excerpt: 'Không biết mặt mình thuộc dạng nào? Hướng dẫn 5 phút giúp bạn chọn đúng gọng kính.',
        category: 'Hướng dẫn', readTime: '3 phút', emoji: '🪞', date: '20/02/2026',
        content: `<h2>1. Xác định khuôn mặt</h2><p>Có 5 dạng chính: Oval, Tròn, Vuông, Tim, Dài. Tự nhận dạng bằng cách đo chiều rộng trán, gò má, hàm và chiều dài mặt.</p><h2>2. Chọn gọng phù hợp</h2><p><strong>Oval</strong>: gần như hợp mọi kiểu. <strong>Tròn</strong>: chọn gọng vuông, angular. <strong>Vuông</strong>: gọng tròn, oval sẽ làm mềm khuôn mặt. <strong>Tim</strong>: gọng nhẹ, mảnh, aviator. <strong>Dài</strong>: gọng to, oversized giúp cân đối.</p><h2>3. Quy tắc vàng</h2><ul><li>Gọng rộng bằng hoặc hơn phần rộng nhất của mặt</li><li>Đường bridge ngang tầm lông mày</li><li>Gọng không chạm vào gò má</li></ul>`,
    },
    {
        slug: 'top-5-gong-kinh-2026', title: 'Top 5 gọng kính thời trang 2026',
        excerpt: 'Những mẫu gọng "hot" nhất: từ Aviator cổ điển đến Cat-Eye hiện đại.',
        category: 'Xu hướng', readTime: '4 phút', emoji: '🔥', date: '18/02/2026',
        content: `<h2>1. Aviator Classic</h2><p>Vĩnh cửu, không bao giờ lỗi mốt. Phù hợp nam & nữ.</p><h2>2. Cat-Eye Retro</h2><p>Comeback mạnh mẽ, đặc biệt với nữ giới. Tạo điểm nhấn cá tính.</p><h2>3. Round Metal</h2><p>Phong cách vintage-intellectual. Hot trên TikTok.</p><h2>4. Geometric</h2><p>Hexagonal, octagonal — vì chúng ta khác biệt.</p><h2>5. Rimless Ultra-light</h2><p>Nhẹ như không, dành cho minimalist. Trọng lượng chỉ 8-12g.</p>`,
    },
    {
        slug: 'bao-ve-mat-khoi-anh-sang-xanh', title: 'Bảo vệ mắt khỏi ánh sáng xanh',
        excerpt: 'Tại sao cần tròng chống ánh sáng xanh? Tác hại & giải pháp cho dân văn phòng.',
        category: 'Sức khoẻ', readTime: '5 phút', emoji: '', date: '15/02/2026',
        content: `<h2>Ánh sáng xanh là gì?</h2><p>Blue light (380-500nm) phát ra từ màn hình điện thoại, máy tính, LED. 8 tiếng/ngày trước màn hình = nguy cơ cao.</p><h2>Tác hại</h2><ul><li>Mỏi mắt, khô mắt</li><li>Rối loạn giấc ngủ</li><li>Nguy cơ thoái hóa hoàng điểm</li></ul><h2>Giải pháp</h2><p>Tròng chống ánh sáng xanh lọc 30-50% blue light. Kết hợp quy tắc 20-20-20: mỗi 20 phút, nhìn xa 20 feet trong 20 giây.</p>`,
    },
    {
        slug: 'kinh-ram-va-tia-uv', title: 'Kính râm không chỉ để "sống ảo"',
        excerpt: 'Tia UV gây tổn thương mắt nghiêm trọng. Cách chọn kính râm bảo vệ mắt đúng cách.',
        category: 'Sức khoẻ', readTime: '4 phút', emoji: '🕶️', date: '12/02/2026',
        content: `<h2>Tia UV và mắt</h2><p>UVA (320-400nm) và UVB (280-320nm) đều gây hại cho mắt. Đục thủy tinh thể, ung thư mắt, cháy giác mạc.</p><h2>Chọn kính râm đúng cách</h2><ul><li>UV400 hoặc 100% UV protection</li><li>Tròng phân cực (polarized) giảm chói</li><li>Gọng ôm sát mặt, che cả bên hông</li></ul><h2>Lưu ý</h2><p>Tròng đen KHÔNG = chống UV. Kính giá rẻ không đạt chuẩn có thể HẠI hơn không đeo.</p>`,
    },
    {
        slug: 'huong-dan-do-pd', title: 'Hướng dẫn đo PD (khoảng cách đồng tử) tại nhà',
        excerpt: 'Đo PD chính xác tại nhà chỉ với thước kẻ và gương. Quan trọng khi mua kính cận online.',
        category: 'Hướng dẫn', readTime: '3 phút', emoji: '📏', date: '08/02/2026',
        content: `<h2>PD là gì?</h2><p>Pupillary Distance — khoảng cách giữa 2 đồng tử. PD trung bình: 54-74mm (người lớn).</p><h2>Cách đo</h2><ol><li>Đứng cách gương 20cm</li><li>Đặt thước lên sống mũi</li><li>Nhắm mắt phải → đọc vạch ở đồng tử trái</li><li>Nhắm mắt trái → đọc vạch ở đồng tử phải</li><li>PD = hiệu của 2 giá trị</li></ol>`,
    },
    {
        slug: 'cham-soc-kinh-mat', title: '5 mẹo chăm sóc kính mắt để dùng lâu bền',
        excerpt: 'Kính bị xước, mờ, lỏng ốc? Những mẹo đơn giản giúp kính luôn như mới.',
        category: 'Mẹo', readTime: '3 phút', emoji: '', date: '05/02/2026',
        content: `<h2>1. Rửa bằng xà phòng</h2><p>Không dùng nước nóng, không dùng khăn giấy. Xà phòng nhẹ + nước mát + khăn microfiber.</p><h2>2. Luôn gập đúng cách</h2><p>Gập gọng trái trước, phải sau. Khi để xuống, úp mặt kính lên.</p><h2>3. Tránh nhiệt cao</h2><p>Không để trong xe ô tô (>50°C). Nhiệt làm cong gọng nhựa, bong tróng.</p><h2>4. Siết ốc định kỳ</h2><p>Mỗi tháng kiểm tra 1 lần. Dùng tua vít nhỏ kèm theo.</p><h2>5. Bảo quản trong hộp</h2><p>Luôn cho vào hộp cứng khi không đeo.</p>`,
    },
];

const CATEGORIES = ['Tất cả', 'Hướng dẫn', 'Xu hướng', 'Sức khoẻ', 'Mẹo'];

export default function BlogPage() {
    const [category, setCategory] = useState('Tất cả');
    const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
    const selectedPost = POSTS.find(p => p.slug === selectedSlug);
    const filtered = category === 'Tất cả' ? POSTS : POSTS.filter(p => p.category === category);

    if (selectedPost) {
        return (
            <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)', maxWidth: 700 }}>
                <button onClick={() => setSelectedSlug(null)} className="btn btn-sm btn-ghost" style={{ marginBottom: 'var(--space-3)' }}>← Quay lại</button>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <span className="badge badge-gold" style={{ fontSize: 10 }}>{selectedPost.category}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{selectedPost.readTime} đọc · {selectedPost.date}</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 800, lineHeight: 1.3 }}>
                        {selectedPost.emoji} {selectedPost.title}
                    </h1>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)', lineHeight: 1.8, fontSize: 14 }}
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                <div className="glass-card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', textAlign: 'center' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Thấy hữu ích?</p>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <Link href="/search" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>🔍 Xem sản phẩm</Link>
                        <Link href="/quiz" className="btn btn-sm" style={{ textDecoration: 'none' }}>Quiz tìm kính</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 4 }}>📖 Góc Tư Vấn Kính</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginBottom: 'var(--space-4)' }}>Kiến thức chọn kính, xu hướng, chăm sóc mắt — đọc nhanh, hiểu ngay</p>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-4)', overflowX: 'auto', paddingBottom: 4 }}>
                {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategory(c)} className="btn btn-sm"
                        style={{ flexShrink: 0, background: category === c ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)', color: category === c ? 'var(--gold-400)' : 'var(--text-muted)', border: category === c ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)' }}>
                        {c}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {filtered.map(post => (
                    <div key={post.slug} onClick={() => setSelectedSlug(post.slug)} className="card" style={{ padding: 'var(--space-4)', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'start' }}>
                        <span style={{ fontSize: 32, flexShrink: 0 }}>{post.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                                <span className="badge badge-gold" style={{ fontSize: 10 }}>{post.category}</span>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{post.readTime}</span>
                            </div>
                            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{post.title}</h2>
                            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{post.excerpt}</p>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>{post.date}</span>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Chưa có bài viết nào trong mục này
                </div>
            )}

            {/* F4: Related Products */}
            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}> Sản phẩm liên quan</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                        { name: 'Aviator Classic Gold', slug: 'aviator-classic-gold', price: '2.990.000₫' },
                        { name: 'Cat-Eye Acetate', slug: 'cat-eye-acetate-tortoise', price: '4.590.000₫' },
                        { name: 'Square TR90 Black', slug: 'square-tr90-black', price: '3.290.000₫' },
                    ].map(p => (
                        <Link key={p.slug} href={`/p/${p.slug}`} style={{ textDecoration: 'none', textAlign: 'center' }}>
                            <div style={{ width: '100%', aspectRatio: '1', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 4 }}></div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-400)' }}>{p.price}</p>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="glass-card" style={{ padding: 'var(--space-5)', textAlign: 'center', marginTop: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(96,165,250,0.05))' }}>
                <p style={{ fontWeight: 700, marginBottom: 4 }}>Vẫn chưa biết chọn gì?</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>Thử ngay tính năng Thử Kính Online!</p>
                <Link href="/try-on" className="btn btn-primary" style={{ minHeight: 44, textDecoration: 'none' }}>🪞 Thử Kính Online</Link>
            </div>
        </div>
    );
}
