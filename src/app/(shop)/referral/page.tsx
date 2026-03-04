'use client';

import { useState } from 'react';
import Link from 'next/link';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function ReferralPage() {
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState('');
    const referralCode = 'SMKFRIEND';
    const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/ref/${referralCode}` : `https://sieuthimatkinh.vn/ref/${referralCode}`;

    const REWARDS = [
        { who: '👤 Bạn', reward: '100 điểm loyalty + Voucher 50K', icon: '🎁' },
        { who: '👥 Bạn bè', reward: 'Giảm ngay 10% đơn đầu tiên', icon: '🏷️' },
    ];

    const REFERRAL_HISTORY = [
        { name: 'Nguyễn Thị Mai', date: '20/02/2026', status: 'completed', reward: 50000 },
        { name: 'Trần Văn Bình', date: '18/02/2026', status: 'pending', reward: 0 },
        { name: 'Lê Hoàng Anh', date: '10/02/2026', status: 'completed', reward: 50000 },
    ];

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setToast('📋 Đã copy link giới thiệu!');
        setTimeout(() => { setCopied(false); setToast(''); }, 3000);
    };

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', maxWidth: 520, margin: '0 auto' }}>
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--gold-400)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', fontSize: 13, fontWeight: 600 }}>{toast}</div>}

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>👥 Giới thiệu bạn bè</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                Chia sẻ link — bạn bè mua — cả hai cùng được thưởng!
            </p>

            {/* Hero */}
            <div className="glass-card" style={{
                padding: 'var(--space-6)', textAlign: 'center', marginBottom: 'var(--space-4)',
                background: 'linear-gradient(135deg, rgba(212,168,83,0.10), rgba(34,197,94,0.05))',
            }}>
                <span style={{ fontSize: 48 }}>🤝</span>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginTop: 8, marginBottom: 4 }}>
                    Tặng bạn — nhận thưởng
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    Mỗi bạn bè mua hàng qua link → bạn nhận 100 điểm + voucher 50K
                </p>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
                    padding: '8px 12px', border: '1px solid var(--border-primary)',
                }}>
                    <code style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gold-400)', wordBreak: 'break-all', textAlign: 'left' }}>
                        {referralLink}
                    </code>
                    <button className="btn btn-primary btn-sm" onClick={copyLink} style={{ flexShrink: 0 }}>
                        {copied ? '✅ Đã copy' : '📋 Copy'}
                    </button>
                </div>
            </div>

            {/* Rewards explanation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                {REWARDS.map(r => (
                    <div key={r.who} className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                        <span style={{ fontSize: 32 }}>{r.icon}</span>
                        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{r.who}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{r.reward}</div>
                    </div>
                ))}
            </div>

            {/* Share buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-6)' }}>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener"
                    className="btn" style={{ flex: 1, textDecoration: 'none', background: 'rgba(66,103,178,0.12)', color: '#4267B2', fontWeight: 600 }}>
                    📘 Facebook
                </a>
                <a href={`https://zalo.me/share?url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noopener"
                    className="btn" style={{ flex: 1, textDecoration: 'none', background: 'rgba(0,144,206,0.12)', color: '#0090CE', fontWeight: 600 }}>
                    💬 Zalo
                </a>
                <button className="btn" onClick={copyLink}
                    style={{ flex: 1, background: 'rgba(212,168,83,0.12)', color: 'var(--gold-400)', fontWeight: 600 }}>
                    🔗 Copy Link
                </button>
            </div>

            {/* Referral History */}
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 'var(--space-3)' }}>📋 Lịch sử giới thiệu</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {REFERRAL_HISTORY.map((r, i) => (
                    <div key={i} className="card" style={{ padding: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</p>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.date}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className={`badge ${r.status === 'completed' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 10 }}>
                                {r.status === 'completed' ? '✅ Hoàn thành' : '⏳ Chờ mua'}
                            </span>
                            {r.reward > 0 && (
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', marginTop: 2 }}>+{formatVND(r.reward)}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--gold-400)' }}>3</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Đã giới thiệu</div>
                </div>
                <div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: '#22c55e' }}>2</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Đã mua hàng</div>
                </div>
                <div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--gold-400)' }}>{formatVND(100000)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Thưởng nhận được</div>
                </div>
            </div>
        </div>
    );
}
