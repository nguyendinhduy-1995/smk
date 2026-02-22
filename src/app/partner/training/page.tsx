'use client';

import { useState } from 'react';
import Link from 'next/link';

const COURSES = [
    {
        id: 'basic', title: 'Cơ bản: Bán kính cho người mới',
        lessons: [
            { title: 'Tổng quan ngành mắt kính', duration: '5 phút', icon: '👓' },
            { title: 'Phân biệt tròng kính cận/loạn/viễn', duration: '8 phút', icon: '🔍' },
            { title: 'Cách đo PD (khoảng cách đồng tử)', duration: '6 phút', icon: '📏' },
            { title: 'Kỹ năng tư vấn gọng hợp khuôn mặt', duration: '10 phút', icon: '✨' },
        ],
        level: 'Cơ bản', color: '#22c55e',
    },
    {
        id: 'sales', title: 'Nâng cao: Kỹ năng bán hàng online',
        lessons: [
            { title: 'Chụp ảnh kính đẹp bằng điện thoại', duration: '7 phút', icon: '📸' },
            { title: 'Viết bài quảng cáo kính hiệu quả', duration: '8 phút', icon: '📝' },
            { title: 'Kỹ thuật livestream bán kính', duration: '12 phút', icon: '🎥' },
            { title: 'Xử lý khiếu nại & đổi trả', duration: '6 phút', icon: '🤝' },
        ],
        level: 'Nâng cao', color: '#a855f7',
    },
    {
        id: 'brand', title: 'Chuyên gia: Nhận diện thương hiệu',
        lessons: [
            { title: 'Phân biệt hàng chính hãng vs fake', duration: '10 phút', icon: '🛡️' },
            { title: 'Câu chuyện các thương hiệu: Ray-Ban, Oakley, Gucci', duration: '15 phút', icon: '👑' },
            { title: 'Tròng kính cao cấp: Essilor, Zeiss, Hoya', duration: '12 phút', icon: '💎' },
        ],
        level: 'Chuyên gia', color: '#f59e0b',
    },
];

export default function TrainingHubPage() {
    const [completed, setCompleted] = useState<Set<string>>(new Set());
    const totalLessons = COURSES.reduce((s, c) => s + c.lessons.length, 0);
    const progress = Math.round((completed.size / totalLessons) * 100);

    const toggleLesson = (courseId: string, lessonIdx: number) => {
        const key = `${courseId}-${lessonIdx}`;
        setCompleted(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    return (
        <div className="animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>🎓 Training Hub</h1>
                <Link href="/partner/dashboard" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>← Dashboard</Link>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                Khoá đào tạo miễn phí giúp bạn trở thành chuyên gia bán kính
            </p>

            {/* Overall progress */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
                    <span>Tiến độ học: {completed.size}/{totalLessons} bài</span>
                    <span style={{ color: 'var(--gold-400)' }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 99, background: 'var(--bg-tertiary)' }}>
                    <div style={{ width: `${progress}%`, height: '100%', borderRadius: 99, background: progress >= 100 ? '#22c55e' : 'var(--gradient-gold)', transition: 'width 500ms' }} />
                </div>
                {progress >= 100 && <p style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, marginTop: 6 }}>🎉 Chúc mừng! Bạn đã hoàn thành tất cả bài học!</p>}
            </div>

            {/* Courses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {COURSES.map(course => {
                    const courseDone = course.lessons.filter((_, i) => completed.has(`${course.id}-${i}`)).length;
                    return (
                        <div key={course.id} className="card" style={{ padding: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{course.title}</h3>
                                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: `${course.color}20`, color: course.color, fontWeight: 700 }}>
                                        {course.level}
                                    </span>
                                </div>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {courseDone}/{course.lessons.length}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {course.lessons.map((lesson, i) => {
                                    const isDone = completed.has(`${course.id}-${i}`);
                                    return (
                                        <button key={i} onClick={() => toggleLesson(course.id, i)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                                                borderRadius: 'var(--radius-md)', background: isDone ? 'rgba(34,197,94,0.06)' : 'var(--bg-tertiary)',
                                                border: isDone ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                                                cursor: 'pointer', width: '100%', textAlign: 'left',
                                                transition: 'all 200ms',
                                            }}>
                                            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>
                                                {isDone ? '✅' : lesson.icon}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 12, fontWeight: isDone ? 400 : 600, color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                                                    {lesson.title}
                                                </div>
                                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>⏱ {lesson.duration}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Certification */}
            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', textAlign: 'center' }}>
                <span style={{ fontSize: 32 }}>🏅</span>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>Chứng chỉ SMK Partner</h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Hoàn thành 100% bài học để nhận chứng chỉ và badge "Verified Partner" trên trang cá nhân
                </p>
                <button className="btn btn-primary" disabled={progress < 100}
                    style={{ marginTop: 10, opacity: progress >= 100 ? 1 : 0.5 }}>
                    {progress >= 100 ? '🎓 Nhận chứng chỉ' : `📚 Hoàn thành ${100 - progress}% còn lại`}
                </button>
            </div>
        </div>
    );
}
