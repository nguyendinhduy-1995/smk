'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/* ═══ Hero Carousel ═══ */
const SLIDES = [
    {
        title: 'Kính Mắt Chính Hãng 100%',
        subtitle: 'Ray-Ban · Tom Ford · Oakley · Gucci',
        cta: 'Khám phá ngay',
        href: '/search',
        gradient: 'linear-gradient(135deg, rgba(212,168,83,0.18), rgba(96,165,250,0.08))',
        emoji: '👓',
    },
    {
        title: 'Freeship Toàn Quốc',
        subtitle: 'Đơn hàng từ 500K · Giao 1-3 ngày',
        cta: 'Mua sắm',
        href: '/search',
        gradient: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(212,168,83,0.06))',
        emoji: '🚚',
    },
    {
        title: 'Thử Kính Online',
        subtitle: 'Upload ảnh → Chọn gọng → Xem ngay trên mặt bạn',
        cta: 'Thử ngay',
        href: '/try-on',
        gradient: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(96,165,250,0.06))',
        emoji: '🪞',
    },
];

export function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);

    useEffect(() => {
        const t = setInterval(next, 5000);
        return () => clearInterval(t);
    }, [next]);

    const slide = SLIDES[current];
    return (
        <section style={{ marginTop: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <div style={{
                position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                background: slide.gradient, padding: 'var(--space-6) var(--space-5)',
                minHeight: 160, display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                transition: 'background 500ms',
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 6, lineHeight: 1.2 }}>
                        {slide.title}
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12, lineHeight: 1.4 }}>
                        {slide.subtitle}
                    </p>
                    <Link href={slide.href} className="btn btn-primary btn-sm" style={{ textDecoration: 'none', fontWeight: 700 }}>
                        {slide.cta} →
                    </Link>
                </div>
                <span style={{ fontSize: 56, flexShrink: 0, opacity: 0.8 }}>{slide.emoji}</span>
            </div>
            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                {SLIDES.map((_, i) => (
                    <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
                        style={{
                            width: current === i ? 20 : 6, height: 6, borderRadius: 99,
                            background: current === i ? 'var(--gold-400)' : 'var(--border-primary)',
                            border: 'none', cursor: 'pointer', transition: 'all 300ms', padding: 0,
                        }} />
                ))}
            </div>
        </section>
    );
}

/* ═══ Flash Sale Countdown ═══ */
interface FSProduct {
    slug: string; name: string; price: number; compareAt: number | null; image: string | null;
}

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export function FlashSaleSection({ products }: { products: FSProduct[] }) {
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

    useEffect(() => {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const tick = () => {
            const diff = Math.max(0, endOfDay.getTime() - Date.now());
            setTimeLeft({
                h: Math.floor(diff / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            });
        };
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, []);

    if (products.length === 0) return null;

    return (
        <section style={{ marginTop: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⚡ Flash Sale
                </h2>
                <div style={{ display: 'flex', gap: 4 }}>
                    {[
                        { v: String(timeLeft.h).padStart(2, '0') },
                        { v: String(timeLeft.m).padStart(2, '0') },
                        { v: String(timeLeft.s).padStart(2, '0') },
                    ].map((t, i) => (
                        <span key={i}>
                            <span style={{
                                display: 'inline-block', minWidth: 28, textAlign: 'center',
                                padding: '3px 5px', borderRadius: 6, fontWeight: 800, fontSize: 13,
                                background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontFamily: 'var(--font-mono, monospace)',
                            }}>{t.v}</span>
                            {i < 2 && <span style={{ color: 'var(--text-muted)', fontWeight: 800, margin: '0 1px' }}>:</span>}
                        </span>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollSnapType: 'x mandatory' }}>
                {products.map(p => {
                    const disc = p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
                    return (
                        <Link key={p.slug} href={`/p/${p.slug}`} style={{
                            minWidth: 150, scrollSnapAlign: 'start', textDecoration: 'none', flexShrink: 0,
                            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                            border: '1px solid rgba(239,68,68,0.15)', background: 'var(--bg-secondary)',
                        }}>
                            <div style={{
                                aspectRatio: '1', background: 'var(--bg-tertiary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                                position: 'relative',
                            }}>
                                {p.image ? (
                                    <Image src={p.image} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="150px" />
                                ) : '👓'}
                                {disc > 0 && (
                                    <span style={{
                                        position: 'absolute', top: 6, left: 6, padding: '2px 6px',
                                        borderRadius: 4, background: '#ef4444', color: '#fff',
                                        fontSize: 10, fontWeight: 800,
                                    }}>-{disc}%</span>
                                )}
                            </div>
                            <div style={{ padding: '8px 10px' }}>
                                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginTop: 4 }}>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: '#ef4444' }}>{formatVND(p.price)}</span>
                                    {p.compareAt && <span style={{ fontSize: 10, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{formatVND(p.compareAt)}</span>}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

/* ═══ Testimonials ═══ */
const TESTIMONIALS = [
    { name: 'Trần Mai', text: 'Kính đẹp, giao nhanh, đóng gói cẩn thận!', rating: 5 },
    { name: 'Phạm Minh', text: 'Tư vấn nhiệt tình, chọn đúng gọng hợp mặt.', rating: 5 },
    { name: 'Lê Hoa', text: 'Giá tốt, hàng chính hãng. Rất hài lòng!', rating: 5 },
];

export function Testimonials() {
    return (
        <section style={{ marginTop: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
                💬 Khách hàng nói gì?
            </h2>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {TESTIMONIALS.map((t, i) => (
                    <div key={i} style={{
                        minWidth: 220, flexShrink: 0, padding: 14, borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                    }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0a0a0f' }}>
                                {t.name[0]}
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700 }}>{t.name}</div>
                                <div style={{ fontSize: 10, color: '#fbbf24' }}>{'⭐'.repeat(t.rating)}</div>
                            </div>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>"{t.text}"</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
