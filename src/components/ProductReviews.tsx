'use client';

import { useState, useEffect, useCallback } from 'react';

interface Review {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    isVerified: boolean;
    createdAt: string;
    user: { name: string | null; avatar: string | null };
}

interface ReviewStats {
    avg: number;
    total: number;
    distribution: Record<number, number>;
}

export default function ProductReviews({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats>({ avg: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Review form
    const [showForm, setShowForm] = useState(false);
    const [formRating, setFormRating] = useState(5);
    const [formTitle, setFormTitle] = useState('');
    const [formBody, setFormBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState<string | null>(null);

    const fetchReviews = useCallback(() => {
        setLoading(true);
        fetch(`/api/products/reviews?productId=${productId}&page=${page}`)
            .then((r) => r.json())
            .then((data) => {
                setReviews(data.reviews || []);
                setStats(data.stats || stats);
                setTotalPages(data.pagination?.totalPages || 1);
            })
            .catch(() => {
                // Fallback demo reviews
                setReviews([
                    { id: '1', rating: 5, title: 'Rất đẹp!', body: 'Kính đẹp lắm, đúng như hình. Đóng gói cẩn thận.', isVerified: true, createdAt: new Date(Date.now() - 86400000).toISOString(), user: { name: 'Nguyễn Văn A', avatar: null } },
                    { id: '2', rating: 4, title: 'Chất lượng tốt', body: 'Kính nhẹ, đeo thoải mái. Giá hợp lý.', isVerified: true, createdAt: new Date(Date.now() - 172800000).toISOString(), user: { name: 'Trần Thị B', avatar: null } },
                    { id: '3', rating: 5, title: null, body: 'Giao hàng nhanh, sản phẩm chính hãng.', isVerified: false, createdAt: new Date(Date.now() - 604800000).toISOString(), user: { name: 'Lê Văn C', avatar: null } },
                ]);
                setStats({ avg: 4.7, total: 3, distribution: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 } });
            })
            .finally(() => setLoading(false));
    }, [productId, page]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    const handleSubmit = async () => {
        setSubmitting(true);
        setFormMsg(null);
        try {
            const res = await fetch('/api/products/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
                body: JSON.stringify({ productId, rating: formRating, title: formTitle || null, body: formBody || null }),
            });
            const data = await res.json();
            if (!res.ok) { setFormMsg(data.error || 'Có lỗi'); return; }
            setFormMsg('✅ Đánh giá đã được gửi!');
            setShowForm(false);
            setFormTitle('');
            setFormBody('');
            fetchReviews();
        } catch {
            setFormMsg('Có lỗi, thử lại sau.');
        } finally {
            setSubmitting(false);
        }
    };

    const maxDist = Math.max(...Object.values(stats.distribution), 1);

    return (
        <div className="animate-in" style={{ maxWidth: 720 }}>
            {/* Stats Summary */}
            <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
                    {/* Avg Rating */}
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--gold-400)' }}>
                            {stats.avg.toFixed(1)}
                        </div>
                        <div className="stars" style={{ marginTop: 'var(--space-1)' }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} className={`star ${s <= Math.round(stats.avg) ? 'star--filled' : ''}`}>★</span>
                            ))}
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                            {stats.total} đánh giá
                        </p>
                    </div>

                    {/* Distribution Bars */}
                    <div style={{ flex: 1 }}>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                                <span style={{ fontSize: 'var(--text-xs)', width: 20, textAlign: 'right', color: 'var(--text-muted)' }}>{star}★</span>
                                <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(stats.distribution[star] / maxDist) * 100}%`,
                                        background: star >= 4 ? 'var(--gold-400)' : star === 3 ? 'var(--warning)' : 'var(--error)',
                                        borderRadius: 4,
                                    }} />
                                </div>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 20 }}>{stats.distribution[star]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Đóng' : '✍️ Viết đánh giá'}
                    </button>
                </div>
            </div>

            {/* Write Review Form */}
            {showForm && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                    <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Đánh giá sản phẩm</h4>

                    {/* Star selector */}
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Số sao</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} onClick={() => setFormRating(s)} style={{
                                    background: 'none', border: 'none', fontSize: 28, cursor: 'pointer',
                                    color: s <= formRating ? 'var(--gold-400)' : 'var(--bg-hover)',
                                    transform: s <= formRating ? 'scale(1.1)' : 'scale(1)',
                                    transition: 'all 150ms',
                                }}>
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <input className="input" placeholder="Tiêu đề (tuỳ chọn)" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                        style={{ marginBottom: 'var(--space-2)' }} />
                    <textarea className="input" placeholder="Nhận xét của bạn..." value={formBody} onChange={(e) => setFormBody(e.target.value)}
                        rows={3} style={{ resize: 'vertical', marginBottom: 'var(--space-3)' }} />

                    {formMsg && <p style={{ fontSize: 'var(--text-xs)', color: formMsg.startsWith('✅') ? 'var(--success)' : 'var(--error)', marginBottom: 'var(--space-2)' }}>{formMsg}</p>}

                    <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? '⏳...' : '📤 Gửi đánh giá'}
                    </button>
                </div>
            )}

            {/* Review List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Đang tải đánh giá...</div>
                ) : reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: 40, display: 'block', marginBottom: 'var(--space-2)' }}>⭐</span>
                        <p>Chưa có đánh giá. Hãy là người đầu tiên!</p>
                    </div>
                ) : (
                    reviews.map((r) => (
                        <div key={r.id} className="card" style={{ padding: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <span style={{
                                        width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-gold)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 14, fontWeight: 700, color: '#0a0a0f',
                                    }}>
                                        {(r.user.name || '?')[0].toUpperCase()}
                                    </span>
                                    <div>
                                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                                            {r.user.name || 'Khách hàng'}
                                            {r.isVerified && <span style={{ fontSize: 10, color: 'var(--success)', marginLeft: 6 }}>✓ Đã mua</span>}
                                        </p>
                                        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                                <div className="stars" style={{ fontSize: 12 }}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <span key={s} style={{ color: s <= r.rating ? 'var(--gold-400)' : 'var(--bg-hover)' }}>★</span>
                                    ))}
                                </div>
                            </div>
                            {r.title && <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 4 }}>{r.title}</p>}
                            {r.body && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.body}</p>}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i + 1} className="filter-chip" onClick={() => setPage(i + 1)}
                            style={{ background: page === i + 1 ? 'var(--gold-400)' : undefined, color: page === i + 1 ? '#0a0a0f' : undefined }}>
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
