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

// A2: Sentiment Analysis
const POSITIVE_WORDS = ['đẹp', 'tuyệt', 'hài lòng', 'chất lượng', 'nhanh', 'cẩn thận', 'ưng', 'tốt', 'xinh', 'ok'];
const NEGATIVE_WORDS = ['thất vọng', 'xấu', 'kém', 'chậm', 'hỏng', 'khác', 'tệ', 'dở', 'lỗi', 'không giống'];
function getSentiment(r: Review): { label: string; color: string; bg: string } {
    if (r.isSpam) return { label: 'Spam', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
    const text = (r.title + ' ' + r.body).toLowerCase();
    const posScore = POSITIVE_WORDS.filter(w => text.includes(w)).length;
    const negScore = NEGATIVE_WORDS.filter(w => text.includes(w)).length;
    if (r.rating >= 4 || posScore > negScore) return { label: 'Tích cực', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
    if (r.rating <= 2 || negScore > posScore) return { label: 'Tiêu cực', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
    return { label: 'Trung lập', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState(DEMO_REVIEWS);
    const [filter, setFilter] = useState<'all' | 'verified' | 'spam' | 'reported'>('all');
    const [sort, setSort] = useState<'recent' | 'helpful' | 'rating'>('recent');
    const [toast, setToast] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const toggleSpam = (id: string) => {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, isSpam: !r.isSpam } : r));
        showToast('Đã cập nhật trạng thái spam');
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
                            <span style={{ width: 20, textAlign: 'right', fontWeight: 600 }}>{d.stars}</span>
                            <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: `${d.pct}%`, height: '100%', background: 'var(--gold-400)', borderRadius: 4, transition: 'width 500ms ease' }} />
                            </div>
                            <span style={{ width: 24, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{d.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* A2: AI Sentiment Summary */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', border: '1px solid rgba(168,85,247,0.15)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#a855f7', marginBottom: 8 }}>Phân tích cảm xúc AI</div>
                {(() => {
                    const valid = reviews.filter(r => !r.isSpam);
                    const pos = valid.filter(r => getSentiment(r).label.includes('Tích cực')).length;
                    const neg = valid.filter(r => getSentiment(r).label.includes('Tiêu cực')).length;
                    const neu = valid.length - pos - neg;
                    return (
                        <div>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{pos} tích cực</span>
                                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>{neu} trung lập</span>
                                <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{neg} tiêu cực</span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', marginBottom: 8 }}>
                                <div style={{ width: `${pos / valid.length * 100}%`, background: '#22c55e' }} />
                                <div style={{ width: `${neu / valid.length * 100}%`, background: '#f59e0b' }} />
                                <div style={{ width: `${neg / valid.length * 100}%`, background: '#ef4444' }} />
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {pos > neg ? 'Đa số khách hàng hài lòng. ' : 'Có nhiều review tiêu cực cần xử lý. '}
                                {neg > 0 ? `Chủ đề phàn nàn chính: ${reviews.filter(r => getSentiment(r).label.includes('Tiêu cực')).map(r => r.productName).filter((v, i, a) => a.indexOf(v) === i).join(', ')}.` : ''}
                                {pos > 2 ? ` Đề xuất: highlight ${reviews.filter(r => r.rating >= 4 && r.isVerified).length} review 4-5⭐ trên trang sản phẩm.` : ''}
                            </p>
                        </div>
                    );
                })()}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                {([['all', 'Tất cả'], ['verified', 'Verified'], ['reported', 'Reported'], ['spam', 'Spam']] as const).map(([key, label]) => (
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

            {/* A5: Bulk Actions */}
            {selected.size > 0 && (
                <div style={{ padding: '10px 16px', marginBottom: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{selected.size} review đã chọn</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'none' }} onClick={() => {
                            setReviews(prev => prev.map(r => selected.has(r.id) ? { ...r, isSpam: false } : r));
                            setSelected(new Set()); showToast(`Đã duyệt ${selected.size} reviews`);
                        }}>Duyệt tất cả</button>
                        <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'none' }} onClick={() => {
                            setReviews(prev => prev.map(r => selected.has(r.id) ? { ...r, isSpam: true } : r));
                            setSelected(new Set()); showToast(`Đã gắn spam ${selected.size} reviews`);
                        }}>Spam tất cả</button>
                        <button className="btn btn-sm" style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7', border: 'none' }} onClick={() => {
                            const autoCount = reviews.filter(r => selected.has(r.id) && r.rating >= 4).length;
                            setReviews(prev => prev.map(r => selected.has(r.id) && r.rating >= 4 ? { ...r, isSpam: false } : r));
                            setSelected(new Set()); showToast(`Auto-approve ${autoCount} reviews (≥4⭐)`);
                        }}>Auto ≥4⭐</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => setSelected(new Set())} style={{ color: 'var(--error)', fontSize: 11 }}>✕ Bỏ chọn</button>
                    </div>
                </div>
            )}

            {/* Review list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {filtered.map(r => (
                    <div key={r.id} className="card" style={{
                        padding: 'var(--space-4)',
                        opacity: r.isSpam ? 0.5 : 1,
                        borderLeft: r.isSpam ? '3px solid #ef4444' : r.reportCount > 0 ? '3px solid #f59e0b' : 'none',
                        border: selected.has(r.id) ? '2px solid var(--gold-400)' : undefined,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ display: 'flex', gap: 10, flex: 1 }}>
                                <input type="checkbox" checked={selected.has(r.id)} onChange={() => setSelected(prev => {
                                    const next = new Set(prev); next.has(r.id) ? next.delete(r.id) : next.add(r.id); return next;
                                })} style={{ marginTop: 4 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                                        <span style={{ fontSize: 'var(--text-sm)' }}>{STARS[r.rating - 1]}</span>
                                        <strong style={{ fontSize: 'var(--text-sm)' }}>{r.title}</strong>
                                        {r.isVerified && <span style={{ fontSize: 'var(--text-xs)', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>✓ Đã mua</span>}
                                        {r.isSpam && <span style={{ fontSize: 'var(--text-xs)', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>Spam</span>}
                                        {(() => { const s = getSentiment(r); return <span style={{ fontSize: 'var(--text-xs)', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: s.bg, color: s.color }}>{s.label}</span>; })()}
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
                                                    {m.type === 'video' ? '' : ''}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                        <span>{r.customerName}</span>
                                        <span>{r.productName}</span>
                                        <span>{fmt(r.createdAt)}</span>
                                        <span>{r.helpfulCount} hữu ích</span>
                                        {r.reportCount > 0 && <span style={{ color: '#f59e0b' }}>{r.reportCount} báo cáo</span>}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0, marginLeft: 'var(--space-3)' }}>
                                <button onClick={() => toggleSpam(r.id)} className="btn btn-sm btn-ghost"
                                    style={{ fontSize: 'var(--text-xs)', color: r.isSpam ? '#22c55e' : '#ef4444' }}>
                                    {r.isSpam ? 'Khôi phục' : 'Spam'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* UGC Policy */}
            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', alignItems: 'start' }}>
                <span style={{ fontSize: 24 }}></span>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Quy tắc UGC:</strong><br />
                    • Chỉ khách có đơn DELIVERED mới được viết review<br />
                    • 1 review / sản phẩm / đơn hàng delivered<br />
                    • Ảnh/video tối đa 5 file, dung lượng &lt; 10MB/file<br />
                    • Auto-flag nếu ≥ 3 báo cáo → chuyển sang tab &quot;Reported&quot;<br />
                    • Widget &quot;Khách đeo thực tế&quot; hiển thị ảnh UGC trên trang sản phẩm
                </div>
            </div>

            {/* C4: AI Review Summary per Product */}
            <div className="card" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 'var(--space-3)' }}>AI Tóm tắt theo sản phẩm</h3>
                <button className="btn btn-primary" style={{ width: '100%', fontWeight: 600 }} onClick={() => {
                    const el = document.getElementById('ai-review-summary');
                    if (el) { el.style.display = el.style.display === 'none' ? 'block' : 'none'; return; }
                    const grouped: Record<string, Review[]> = {};
                    reviews.filter(r => !r.isSpam).forEach(r => {
                        if (!grouped[r.productName]) grouped[r.productName] = [];
                        grouped[r.productName].push(r);
                    });
                    const report = document.createElement('div');
                    report.id = 'ai-review-summary';
                    report.style.cssText = 'margin-top:12px';
                    report.innerHTML = Object.entries(grouped).map(([product, revs]) => {
                        const avg = (revs.reduce((s, r) => s + r.rating, 0) / revs.length).toFixed(1);
                        const allText = revs.map(r => r.title + ' ' + r.body).join(' ').toLowerCase();
                        const posHits = POSITIVE_WORDS.filter(w => allText.includes(w));
                        const negHits = NEGATIVE_WORDS.filter(w => allText.includes(w));
                        return `
                            <div style="padding:12px;margin-bottom:8px;background:var(--bg-tertiary);border-radius:8px">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                                    <span style="font-size:13px;font-weight:700">${product}</span>
                                    <span style="font-size:11px;color:${Number(avg) >= 4 ? '#22c55e' : Number(avg) >= 3 ? '#f59e0b' : '#ef4444'};font-weight:700">⭐ ${avg} (${revs.length} reviews)</span>
                                </div>
                                ${posHits.length > 0 ? `<div style="font-size:11px;color:#22c55e;margin-bottom:4px">Điểm mạnh: ${posHits.join(', ')}</div>` : ''}
                                ${negHits.length > 0 ? `<div style="font-size:11px;color:#ef4444;margin-bottom:4px">Cần cải thiện: ${negHits.join(', ')}</div>` : ''}
                                ${negHits.length === 0 && posHits.length > 0 ? '<div style="font-size:11px;color:#22c55e">Không có phản hồi tiêu cực</div>' : ''}
                            </div>
                        `;
                    }).join('');
                    document.getElementById('ai-review-container')?.appendChild(report);
                }}>
                    Tóm tắt AI theo sản phẩm
                </button>
                <div id="ai-review-container" />
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
