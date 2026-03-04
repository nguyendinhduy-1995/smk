'use client';

import { useState } from 'react';
import Link from 'next/link';

const STEPS = [
    {
        question: 'Khuôn mặt bạn thuộc dạng nào?',
        options: [
            { id: 'oval', emoji: '🥚', label: 'Trái xoan', desc: 'Cằm nhỏ, trán rộng vừa' },
            { id: 'round', emoji: '🔵', label: 'Tròn', desc: 'Má phúng phính, cằm tròn' },
            { id: 'square', emoji: '⬜', label: 'Vuông', desc: 'Hàm rộng, góc cạnh' },
            { id: 'heart', emoji: '💛', label: 'Trái tim', desc: 'Trán rộng, cằm nhọn' },
        ],
    },
    {
        question: 'Phong cách bạn muốn?',
        options: [
            { id: 'classic', emoji: '👑', label: 'Sang trọng', desc: 'Lịch lãm, thanh lịch' },
            { id: 'trendy', emoji: '🔥', label: 'Trẻ trung', desc: 'Cá tính, nổi bật' },
            { id: 'minimal', emoji: '🤍', label: 'Tối giản', desc: 'Nhẹ nhàng, tinh tế' },
            { id: 'sport', emoji: '🏃', label: 'Thể thao', desc: 'Năng động, bền bỉ' },
        ],
    },
    {
        question: 'Ngân sách của bạn?',
        options: [
            { id: 'under1m', emoji: '💵', label: 'Dưới 1 triệu', desc: 'Tiết kiệm' },
            { id: '1to3m', emoji: '💰', label: '1 – 3 triệu', desc: 'Phổ biến nhất' },
            { id: 'over3m', emoji: '💎', label: 'Trên 3 triệu', desc: 'Cao cấp' },
        ],
    },
];

const ALL_RESULTS = [
    { name: 'Aviator Classic Gold', slug: 'aviator-classic-gold', brand: 'Ray-Ban', price: 2990000, priceFmt: '2.990.000₫', faces: ['oval', 'heart', 'square'], styles: ['classic', 'minimal'], reason: 'Huyền thoại — hợp mọi khuôn mặt' },
    { name: 'Cat-Eye Acetate', slug: 'cat-eye-acetate-tortoise', brand: 'Tom Ford', price: 4590000, priceFmt: '4.590.000₫', faces: ['oval', 'heart'], styles: ['classic', 'trendy'], reason: 'Sang trọng, nổi bật' },
    { name: 'Square TR90 Black', slug: 'square-tr90-black', brand: 'Oakley', price: 3290000, priceFmt: '3.290.000₫', faces: ['round', 'oval'], styles: ['sport', 'minimal'], reason: 'Nhẹ, bền, năng động' },
    { name: 'Round Metal Gold', slug: 'round-metal-gold', brand: 'Ray-Ban', price: 3490000, priceFmt: '3.490.000₫', faces: ['square', 'heart'], styles: ['classic', 'trendy'], reason: 'Vintage-intellectual, TikTok hot' },
    { name: 'Wayfarer Classic', slug: 'wayfarer-classic', brand: 'Ray-Ban', price: 2790000, priceFmt: '2.790.000₫', faces: ['round', 'square', 'oval'], styles: ['trendy', 'classic'], reason: 'Iconic, phù hợp nhiều phong cách' },
    { name: 'Rimless Titanium', slug: 'rimless-titanium', brand: 'Silhouette', price: 890000, priceFmt: '890.000₫', faces: ['oval', 'round', 'heart', 'square'], styles: ['minimal', 'classic'], reason: 'Siêu nhẹ, thanh lịch tối giản' },
    { name: 'Sport Wrap', slug: 'sport-wrap-black', brand: 'Oakley', price: 2490000, priceFmt: '2.490.000₫', faces: ['oval', 'square'], styles: ['sport'], reason: 'Ôm sát, chống gió, hoạt động ngoài trời' },
    { name: 'Geometric Hex', slug: 'geometric-hex-gold', brand: 'Ray-Ban', price: 3190000, priceFmt: '3.190.000₫', faces: ['oval', 'round'], styles: ['trendy'], reason: 'Khác biệt, cá tính, nổi bật đám đông' },
];

function getSmartResults(answers: string[]) {
    const [face, style, budget] = answers;
    const maxPrice = budget === 'under1m' ? 1000000 : budget === '1to3m' ? 3000000 : 99999999;
    const scored = ALL_RESULTS.map(r => {
        let score = 0;
        if (r.faces.includes(face)) score += 3;
        if (r.styles.includes(style)) score += 2;
        if (r.price <= maxPrice) score += 2;
        else score -= 1;
        return { ...r, score };
    });
    return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}

export default function QuizPage() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [done, setDone] = useState(false);

    const handleSelect = (id: string) => {
        const next = [...answers, id];
        setAnswers(next);
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            setDone(true);
        }
    };

    const reset = () => { setStep(0); setAnswers([]); setDone(false); };

    const results = getSmartResults(answers);

    if (done) {
        return (
            <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <span style={{ fontSize: 48 }}></span>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginTop: 'var(--space-2)' }}>
                        Kính phù hợp với bạn!
                    </h1>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                        Dựa trên câu trả lời của bạn, đây là 3 mẫu được gợi ý
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {results.map((p, i) => (
                        <Link key={p.slug} href={`/p/${p.slug}`} className="card" style={{ padding: 'var(--space-4)', textDecoration: 'none', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 'var(--radius-md)',
                                background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-hover))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0,
                            }}></div>
                            <div style={{ flex: 1 }}>
                                <span className="badge badge-gold" style={{ fontSize: 10, marginBottom: 4, display: 'inline-block' }}>#{i + 1} Gợi ý</span>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)', fontWeight: 600, textTransform: 'uppercase' }}>{p.brand}</p>
                                <p style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{p.name}</p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{p.reason}</p>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)', marginTop: 4 }}>{p.priceFmt}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                    <button className="btn" onClick={reset} style={{ flex: 1 }}>Làm lại Quiz</button>
                    <Link href="/try-on" className="btn btn-primary" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🪞 Thử kính online</Link>
                </div>
            </div>
        );
    }

    const current = STEPS[step];

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
            {/* Progress */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                {STEPS.map((_, i) => (
                    <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i <= step ? 'var(--gradient-gold)' : 'var(--bg-tertiary)',
                        transition: 'background 300ms',
                    }} />
                ))}
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                Bước {step + 1}/{STEPS.length}
            </p>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                {current.question}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {current.options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id)}
                        className="card"
                        style={{
                            padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)',
                            alignItems: 'center', cursor: 'pointer', textAlign: 'left',
                            border: '2px solid transparent', transition: 'all 200ms',
                            background: 'var(--bg-card)',
                        }}
                    >
                        <span style={{ fontSize: 32, flexShrink: 0 }}>{opt.emoji}</span>
                        <div>
                            <p style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{opt.label}</p>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{opt.desc}</p>
                        </div>
                    </button>
                ))}
            </div>

            {step > 0 && (
                <button className="btn btn-sm" onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }} style={{ marginTop: 'var(--space-4)' }}>
                    ← Quay lại
                </button>
            )}
        </div>
    );
}
