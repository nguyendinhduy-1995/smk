'use client';

import { useState } from 'react';

interface ReviewPhotoProps {
    productId: string;
}

const DEMO_REVIEWS = [
    { id: '1', name: 'Nguyễn Minh A.', rating: 5, text: 'Gọng nhẹ, đeo cả ngày không đau tai. Rất hài lòng!', hasPhoto: true, date: '18/02/2026', helpful: 12 },
    { id: '2', name: 'Trần Thu B.', rating: 4, text: 'Mẫu đẹp, ship nhanh. Hơi rộng chút nhưng tổng thể ok.', hasPhoto: true, date: '15/02/2026', helpful: 8 },
    { id: '3', name: 'Lê Hương C.', rating: 5, text: 'Lần 2 mua ở SMK rồi, luôn hài lòng. Tròng chống xanh ok lắm!', hasPhoto: false, date: '10/02/2026', helpful: 5 },
];

export default function ReviewWithPhotos({ productId }: ReviewPhotoProps) {
    const [showAll, setShowAll] = useState(false);
    const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

    const reviews = showAll ? DEMO_REVIEWS : DEMO_REVIEWS.slice(0, 2);

    const toggleHelpful = (id: string) => {
        setHelpfulClicked(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <div>
            {/* Photo strip */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-2)', scrollbarWidth: 'none' }}>
                {DEMO_REVIEWS.filter(r => r.hasPhoto).map((r, i) => (
                    <div key={i} style={{
                        width: 72, height: 72, borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-hover))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, flexShrink: 0, border: '2px solid var(--border-primary)',
                    }}>
                        📸
                    </div>
                ))}
                <div style={{
                    width: 72, height: 72, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center',
                    border: '2px dashed var(--border-primary)', cursor: 'pointer',
                }}>
                    + Thêm<br />ảnh
                </div>
            </div>

            {/* Review cards */}
            {reviews.map((r) => (
                <div key={r.id} style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: 'var(--gradient-gold)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700, color: '#0a0a0f',
                            }}>
                                {r.name.charAt(0)}
                            </div>
                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{r.name}</span>
                            {r.hasPhoto && <span style={{ fontSize: 10 }}>📸</span>}
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{r.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginBottom: 'var(--space-2)' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{ color: s <= r.rating ? '#f59e0b' : 'var(--text-muted)', fontSize: 12 }}>★</span>
                        ))}
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{r.text}</p>
                    <button
                        onClick={() => toggleHelpful(r.id)}
                        style={{
                            marginTop: 'var(--space-2)', background: 'none', border: '1px solid var(--border-primary)',
                            borderRadius: 'var(--radius-md)', padding: 'var(--space-1) var(--space-3)',
                            fontSize: 'var(--text-xs)', color: helpfulClicked.has(r.id) ? 'var(--gold-400)' : 'var(--text-muted)',
                            cursor: 'pointer', minHeight: 28,
                        }}
                    >
                        👍 Hữu ích ({r.helpful + (helpfulClicked.has(r.id) ? 1 : 0)})
                    </button>
                </div>
            ))}

            {!showAll && DEMO_REVIEWS.length > 2 && (
                <button className="btn btn-sm" onClick={() => setShowAll(true)} style={{ width: '100%' }}>
                    Xem tất cả đánh giá ({DEMO_REVIEWS.length})
                </button>
            )}
        </div>
    );
}
