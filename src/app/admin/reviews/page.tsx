'use client';

import { useState } from 'react';

interface Review {
    id: string;
    productName: string;
    customerName: string;
    rating: number;
    title: string;
    body: string;
    media: { url: string; type: string }[];
    isVerified: boolean;
    helpfulCount: number;
    reportCount: number;
    isSpam: boolean;
    createdAt: string;
}

const DEMO_REVIEWS: Review[] = [
    { id: 'r1', productName: 'Aviator Classic Gold', customerName: 'Nguyễn Văn A', rating: 5, title: 'Kính rất đẹp!', body: 'Đeo vào rất vừa mặt, chất lượng tuyệt vời. Giao hàng nhanh, đóng gói cẩn thận.', media: [{ url: '/demo/review1.jpg', type: 'image' }], isVerified: true, helpfulCount: 12, reportCount: 0, isSpam: false, createdAt: '2026-02-20T10:00:00Z' },
    { id: 'r2', productName: 'Cat Eye Retro Pink', customerName: 'Trần Thị B', rating: 4, title: 'Khá ưng', body: 'Mẫu xinh, nhưng hơi nặng một chút. Nhìn chung ok với giá tiền.', media: [], isVerified: true, helpfulCount: 5, reportCount: 0, isSpam: false, createdAt: '2026-02-19T14:00:00Z' },
    { id: 'r3', productName: 'Browline Mixed Gold-Black', customerName: 'Lê Văn C', rating: 2, title: 'Không giống hình', body: 'Màu thật khác với trên web, hơi thất vọng. Shop có thể cải thiện ảnh chụp sản phẩm.', media: [{ url: '/demo/review3.jpg', type: 'image' }, { url: '/demo/review3b.jpg', type: 'image' }], isVerified: true, helpfulCount: 8, reportCount: 1, isSpam: false, createdAt: '2026-02-18T08:00:00Z' },
    { id: 'r4', productName: 'Aviator Classic Gold', customerName: 'Khách 123', rating: 1, title: 'SPAM TEST', body: 'aaaaaaa buy now cheapest!!!', media: [], isVerified: false, helpfulCount: 0, reportCount: 5, isSpam: true, createdAt: '2026-02-17T03:00:00Z' },
    { id: 'r5', productName: 'Wayfarer Black Matte', customerName: 'Phạm Thị D', rating: 5, title: 'Mua lần 2!', body: 'Lần đầu mua cho mình, lần này mua tặng người yêu. Rất hài lòng!', media: [{ url: '/demo/review5.mp4', type: 'video' }], isVerified: true, helpfulCount: 20, reportCount: 0, isSpam: false, createdAt: '2026-02-16T16:00:00Z' },
];

const STARS = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
const fmt = (d: string) => new Date(d).toLocaleDateString('vi-VN');

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState(DEMO_REVIEWS);
    const [filter, setFilter] = useState<'all' | 'verified' | 'spam' | 'reported'>('all');
    const [sort, setSort] = useState<'recent' | 'helpful' | 'rating'>('recent');
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const toggleSpam = (id: string) => {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, isSpam: !r.isSpam } : r));
        showToast('🛡️ Đã cập nhật trạng thái spam');
    };

    const filtered = reviews
        .filter(r => {
            if (filter === 'verified') return r.isVerified && !r.isSpam;
            if (filter === 'spam') return r.isSpam;
            if (filter === 'reported') return r.reportCount > 0 && !r.isSpam;
            return true;
        })
        .sort((a, b) => {
            if (sort === 'helpful') return b.helpfulCount - a.helpfulCount;
            if (sort === 'rating') return a.rating - b.rating;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const avgRating = reviews.length > 0
        ? (reviews.filter(r => !r.isSpam).reduce((s, r) => s + r.rating, 0) / reviews.filter(r => !r.isSpam).length).toFixed(1)
        : '0';
    const ratingDist = [5, 4, 3, 2, 1].map(r => ({
        stars: r,
        count: reviews.filter(rv => rv.rating === r && !rv.isSpam).length,
        pct: reviews.filter(rv => !rv.isSpam).length > 0
            ? (reviews.filter(rv => rv.rating === r && !rv.isSpam).length / reviews.filter(rv => !rv.isSpam).length * 100)
            : 0,
    }));

    return (
        <div className="animate-in">
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>⭐ Đánh giá & UGC</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                Quản lý đánh giá khách hàng — chỉ cho review sau khi đơn DELIVERED, anti-spam, media UGC
            </p>

            {toast && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 999,
                    padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    fontSize: 'var(--text-sm)', fontWeight: 600, animation: 'fadeIn 200ms ease',
                }}>{toast}</div>
            )}

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                {/* Avg rating */}
                <div className="card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                    <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--gold-400)' }}>{avgRating}</div>
                    <div style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>⭐⭐⭐⭐⭐</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{reviews.filter(r => !r.isSpam).length} đánh giá</div>
                </div>
                {/* Rating distribution */}
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                    {ratingDist.map(d => (
                        <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 6, fontSize: 'var(--text-sm)' }}>
                            <span style={{ width: 20, textAlign: 'right', fontWeight: 600 }}>{d.stars}★</span>
                            <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${d.pct}%`, height: '100%', background: 'var(--gold-400)', borderRadius: 4, transition: 'width 500ms ease' }} />
                            </div>
                            <span style={{ width: 24, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{d.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                {([['all', 'Tất cả'], ['verified', '✅ Verified'], ['reported', '⚠️ Reported'], ['spam', '🚫 Spam']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setFilter(key)} className="btn btn-sm"
                        style={{
                            background: filter === key ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)',
                            color: filter === key ? 'var(--gold-400)' : 'var(--text-muted)',
                            border: filter === key ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)',
                        }}>
                        {label}
                    </button>
                ))}
                <div style={{ marginLeft: 'auto' }}>
                    <select value={sort} onChange={e => setSort(e.target.value as any)}
                        style={{
                            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
                            border: '1px solid var(--border-primary)', fontSize: 'var(--text-xs)',
                        }}>
                        <option value="recent">Mới nhất</option>
                        <option value="helpful">Hữu ích nhất</option>
                        <option value="rating">Rating thấp nhất</option>
                    </select>
                </div>
            </div>

            {/* Review list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {filtered.map(r => (
                    <div key={r.id} className="card" style={{
                        padding: 'var(--space-4)',
                        opacity: r.isSpam ? 0.5 : 1,
                        borderLeft: r.isSpam ? '3px solid #ef4444' : r.reportCount > 0 ? '3px solid #f59e0b' : 'none',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                                    <span style={{ fontSize: 'var(--text-sm)' }}>{STARS[r.rating - 1]}</span>
                                    <strong style={{ fontSize: 'var(--text-sm)' }}>{r.title}</strong>
                                    {r.isVerified && <span style={{ fontSize: 'var(--text-xs)', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>✓ Đã mua</span>}
                                    {r.isSpam && <span style={{ fontSize: 'var(--text-xs)', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>🚫 Spam</span>}
                                </div>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 6 }}>{r.body}</p>

                                {r.media.length > 0 && (
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 8 }}>
                                        {r.media.map((m, i) => (
                                            <div key={i} style={{
                                                width: 56, height: 56, borderRadius: 'var(--radius-sm)',
                                                background: 'var(--bg-tertiary)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
                                            }}>
                                                {m.type === 'video' ? '🎬' : '📷'}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                    <span>{r.customerName}</span>
                                    <span>📦 {r.productName}</span>
                                    <span>📅 {fmt(r.createdAt)}</span>
                                    <span>👍 {r.helpfulCount} hữu ích</span>
                                    {r.reportCount > 0 && <span style={{ color: '#f59e0b' }}>⚠️ {r.reportCount} báo cáo</span>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, marginLeft: 'var(--space-3)' }}>
                                <button onClick={() => toggleSpam(r.id)} className="btn btn-sm btn-ghost"
                                    style={{ fontSize: 'var(--text-xs)', color: r.isSpam ? '#22c55e' : '#ef4444' }}>
                                    {r.isSpam ? '✅ Khôi phục' : '🚫 Spam'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* UGC Policy */}
            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', alignItems: 'start' }}>
                <span style={{ fontSize: 24 }}>📋</span>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Quy tắc UGC:</strong><br />
                    • Chỉ khách có đơn DELIVERED mới được viết review<br />
                    • 1 review / sản phẩm / đơn hàng delivered<br />
                    • Ảnh/video tối đa 5 file, dung lượng &#60; 10MB/file<br />
                    • Auto-flag nếu ≥ 3 báo cáo → chuyển sang tab "Reported"<br />
                    • Widget "Khách đeo thực tế" hiển thị ảnh UGC trên trang sản phẩm
                </div>
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
