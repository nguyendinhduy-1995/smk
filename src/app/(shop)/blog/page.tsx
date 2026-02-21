import Link from 'next/link';

const POSTS = [
    {
        slug: 'cach-chon-kinh-theo-khuon-mat',
        title: 'Cách chọn kính phù hợp với khuôn mặt',
        excerpt: 'Không biết mặt mình thuộc dạng nào? Hướng dẫn 5 phút giúp bạn chọn đúng gọng kính.',
        category: 'Hướng dẫn',
        readTime: '3 phút đọc',
        emoji: '🪞',
        date: '20/02/2026',
    },
    {
        slug: 'top-5-gong-kinh-2026',
        title: 'Top 5 gọng kính thời trang 2026',
        excerpt: 'Những mẫu gọng đang "hot" nhất năm nay: từ Aviator cổ điển đến Cat-Eye hiện đại.',
        category: 'Xu hướng',
        readTime: '4 phút đọc',
        emoji: '🔥',
        date: '18/02/2026',
    },
    {
        slug: 'bao-ve-mat-khoi-anh-sang-xanh',
        title: 'Bảo vệ mắt khỏi ánh sáng xanh trong thời đại số',
        excerpt: 'Tại sao bạn cần tròng chống ánh sáng xanh? Tác hại & giải pháp cho dân văn phòng.',
        category: 'Sức khoẻ',
        readTime: '5 phút đọc',
        emoji: '👁️',
        date: '15/02/2026',
    },
    {
        slug: 'kinh-ram-va-tia-uv',
        title: 'Kính râm không chỉ để "sống ảo" — tác dụng thật',
        excerpt: 'Tia UV gây tổn thương mắt nghiêm trọng. Đây là cách chọn kính râm bảo vệ mắt đúng cách.',
        category: 'Sức khoẻ',
        readTime: '4 phút đọc',
        emoji: '🕶️',
        date: '12/02/2026',
    },
];

export default function BlogPage() {
    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                📖 Góc Tư Vấn Kính
            </h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                Kiến thức chọn kính, xu hướng, chăm sóc mắt — đọc nhanh, hiểu ngay
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {POSTS.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="card"
                        style={{
                            padding: 'var(--space-4)', textDecoration: 'none',
                            display: 'flex', gap: 'var(--space-4)', alignItems: 'start',
                            transition: 'transform 150ms',
                        }}
                    >
                        <span style={{ fontSize: 32, flexShrink: 0 }}>{post.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                                <span className="badge badge-gold" style={{ fontSize: 10 }}>{post.category}</span>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{post.readTime}</span>
                            </div>
                            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-1)', lineHeight: 1.4 }}>
                                {post.title}
                            </h2>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                                {post.excerpt}
                            </p>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)', display: 'inline-block' }}>
                                {post.date}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center', marginTop: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(96,165,250,0.05))' }}>
                <p style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                    Vẫn chưa biết chọn gì?
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                    Thử ngay tính năng Thử Kính Online — xem kính trên khuôn mặt bạn
                </p>
                <Link href="/try-on" className="btn btn-primary" style={{ minHeight: 44 }}>
                    🪞 Thử Kính Online
                </Link>
            </div>
        </div>
    );
}
