'use client';

import { useState, useMemo } from 'react';

interface ReviewPhotoProps {
    productId: string;
}

// Vietnamese names pool
const FIRST_NAMES = [
    'Minh', 'Hương', 'Thảo', 'Tuấn', 'Linh', 'Phúc', 'Ngọc', 'Dũng',
    'Mai', 'Khoa', 'Trang', 'Đức', 'Hà', 'Nam', 'Vy', 'Bảo', 'An',
    'Thy', 'Quân', 'Thanh', 'Hiền', 'Long', 'Trâm', 'Hoàng', 'Yến',
    'Kiều', 'Phương', 'Tú', 'Hạnh', 'Lam',
];
const LAST_NAMES = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi',
    'Đỗ', 'Phan', 'Huỳnh', 'Võ', 'Dương', 'Lý', 'Tô',
];

const REVIEW_TEMPLATES = [
    { rating: 5, text: 'Gọng nhẹ, đeo cả ngày không đau tai. Rất hài lòng với chất lượng, đóng gói rất cẩn thận!' },
    { rating: 5, text: 'Mẫu đẹp đúng như hình, ship nhanh 2 ngày. Tư vấn rất nhiệt tình, sẽ quay lại mua thêm.' },
    { rating: 5, text: 'Lần 2 mua ở SMK rồi, lúc nào cũng hài lòng. Tròng chống ánh sáng xanh chất lượng lắm!' },
    { rating: 5, text: 'Chất liệu gọng cao cấp, form đeo rất vừa mặt mình. Đeo đi làm nhận được nhiều lời khen.' },
    { rating: 4, text: 'Kính đẹp, giá tốt so với đi mua ngoài tiệm. Ship nhanh, đóng gói cẩn thận.' },
    { rating: 5, text: 'Tuyệt vời! Đeo rất nhẹ nhàng, không hề nặng. Kiểu dáng sang trọng, phù hợp đi làm.' },
    { rating: 5, text: 'Mua tặng bạn gái, bạn rất thích. Hộp và phụ kiện đi kèm đẹp, xứng đáng giá tiền.' },
    { rating: 4, text: 'Gọng chắc chắn, tròng trong. Mình đeo cận -3.00, shop lắp tròng nhanh lắm.' },
    { rating: 5, text: 'Đeo cả ngày ngồi máy tính không mỏi mắt. Thiết kế thanh lịch, phù hợp nhiều hoàn cảnh.' },
    { rating: 5, text: 'Chất lượng vượt mong đợi! Gọng bền, đệm mũi mềm rất êm. Sẽ giới thiệu cho bạn bè.' },
    { rating: 4, text: 'Kính đúng mô tả, kiểu dáng thời trang. Duy nhất hơi rộng mặt mình chút nhưng ok.' },
    { rating: 5, text: 'Shop giao hàng nhanh, đóng gói kỹ. Kính đẹp lắm, mang đi chụp hình rất sáng.' },
    { rating: 5, text: 'Mình mua 3 cái cho cả gia đình rồi. Giá hợp lý, chất lượng không thua hàng triệu đồng.' },
    { rating: 5, text: 'Nhìn rất sang xịn! Bạn bè cứ tưởng mình mua kính hiệu đắt tiền. Recommend 100%!' },
    { rating: 4, text: 'Gọng ôm mặt tốt, không bị tuột khi cúi đầu. Tròng trong suốt, nhìn rõ ràng.' },
    { rating: 5, text: 'Đặt online lo lắng size không vừa nhưng đeo lên vừa khít. 10 điểm cho shop!' },
    { rating: 5, text: 'Kính siêu nhẹ, quên luôn là đang đeo. Bạn bè ai cũng hỏi mua ở đâu.' },
    { rating: 4, text: 'Đeo đi phỏng vấn xin việc, trông chuyên nghiệp hẳn. Giá sinh viên rất hợp lý.' },
    { rating: 5, text: 'Gọng titanium nhẹ khỏi nói, build quality tốt. So với giá thì quá ổn!' },
    { rating: 5, text: 'Ship về đúng hẹn, kính đẹp y hình. Đóng hộp cứng bảo vệ tốt.' },
    { rating: 5, text: 'Mua cho ba đeo, ba khen đẹp lắm. Sẽ mua thêm cho mẹ nữa.' },
    { rating: 4, text: 'Form kính hợp nhiều khuôn mặt. Mình mặt tròn đeo cũng ổn.' },
    { rating: 5, text: 'Dịch vụ tư vấn tận tâm, kiên nhẫn. Shop còn hướng dẫn chọn tròng phù hợp nữa.' },
    { rating: 5, text: 'Lắp tròng cận xong nhìn rất đẹp, tự nhiên. Không bị méo hay khó chịu.' },
    { rating: 4, text: 'Giá rẻ hơn shop ngoài nhiều mà chất lượng tương đương. Rất đáng mua!' },
    { rating: 5, text: 'Kính đeo lên rất phong cách, được nhiều đồng nghiệp khen. Cảm ơn shop!' },
    { rating: 5, text: 'Đã mua 2 lần, lần nào cũng ưng. Chất lượng ổn định, không bị lỗi gì.' },
    { rating: 5, text: 'Gọng rất bền, mình đeo 6 tháng rồi vẫn như mới. Recommend cho mọi người!' },
    { rating: 4, text: 'Kính nhẹ, đeo thoải mái cả ngày. Hơi tiếc là không có thêm màu khác.' },
    { rating: 5, text: 'Mình rất kỹ tính nhưng kính này đúng ý. Cảm ơn shop tư vấn nhiệt tình!' },
];

// Get current week number for rotating reviews
function getCurrentWeek(): number {
    const now = new Date();
    const start = new Date(2026, 0, 1); // Jan 1, 2026
    return Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

// Seed random from productId + week for weekly rotation
function seededRandom(seed: string) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    hash = Math.abs(hash) || 1;
    return function () {
        hash = Math.abs((hash * 16807) % 2147483647);
        return (hash - 1) / 2147483646;
    };
}

function generateDates(): string[] {
    const now = new Date();
    const dates: string[] = [];
    for (let i = 0; i < 10; i++) {
        const d = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000 * (1 + Math.random()));
        dates.push(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
    }
    return dates;
}

function generateReviews(productId: string) {
    const week = getCurrentWeek();
    const rng = seededRandom(productId + '-w' + week);
    const dates = generateDates();
    const reviews = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < 10; i++) {
        const templateIdx = Math.abs(Math.floor(rng() * REVIEW_TEMPLATES.length)) % REVIEW_TEMPLATES.length;
        const template = REVIEW_TEMPLATES[templateIdx];

        let name = '';
        let attempts = 0;
        do {
            const lastIdx = Math.abs(Math.floor(rng() * LAST_NAMES.length)) % LAST_NAMES.length;
            const firstIdx = Math.abs(Math.floor(rng() * FIRST_NAMES.length)) % FIRST_NAMES.length;
            name = `${LAST_NAMES[lastIdx]} ${FIRST_NAMES[firstIdx]}`;
            attempts++;
        } while (usedNames.has(name) && attempts < 50);
        usedNames.add(name);

        reviews.push({
            id: `${productId}-w${week}-r${i}`,
            name: `${name} ${name.split(' ').pop()?.charAt(0) || ''}`.trim() + '.',
            rating: template.rating,
            text: template.text,
            hasPhoto: rng() > 0.5,
            date: dates[i],
            helpful: Math.floor(rng() * 20) + 1,
            verified: rng() > 0.3,
        });
    }
    return reviews;
}

export default function ReviewWithPhotos({ productId }: ReviewPhotoProps) {
    const reviews = useMemo(() => generateReviews(productId), [productId]);
    const [showAll, setShowAll] = useState(false);
    const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

    const displayReviews = showAll ? reviews : reviews.slice(0, 3);

    const toggleHelpful = (id: string) => {
        setHelpfulClicked(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

    return (
        <div>
            {/* Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gold-400)' }}>{avg}</p>
                    <div style={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} style={{ color: s <= Math.round(Number(avg)) ? '#f59e0b' : 'var(--text-muted)', fontSize: 12 }}>★</span>
                        ))}
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{reviews.length} đánh giá</p>
                </div>
                <div style={{ flex: 1 }}>
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length;
                        const pct = (count / reviews.length) * 100;
                        return (
                            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}>
                                <span style={{ fontSize: 10, width: 12, color: 'var(--text-muted)' }}>{star}</span>
                                <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold-400)', borderRadius: 3 }} />
                                </div>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 16 }}>{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Review cards */}
            {displayReviews.map((r) => (
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
                            {r.verified && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 600 }}>✓ Đã mua</span>}
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
                         Hữu ích ({r.helpful + (helpfulClicked.has(r.id) ? 1 : 0)})
                    </button>
                </div>
            ))}

            {!showAll && reviews.length > 3 && (
                <button className="btn btn-sm" onClick={() => setShowAll(true)} style={{ width: '100%' }}>
                    Xem tất cả {reviews.length} đánh giá
                </button>
            )}
        </div>
    );
}
