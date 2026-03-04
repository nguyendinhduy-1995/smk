'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
    id: string; type: string; title: string; message: string;
    read: boolean; createdAt: string; link?: string;
    requiresAuth?: boolean; // requires logged-in user
}

// Types that require authentication: order, loyalty, wishlist
const AUTH_TYPES = new Set(['order', 'loyalty', 'wishlist']);

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'order', title: '📦 Đơn hàng đang giao', message: 'Đơn #SMK-2026001 đã được giao cho đơn vị vận chuyển.', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), link: '/account', requiresAuth: true },
    { id: '2', type: 'promo', title: '🔥 Flash Sale cuối tuần!', message: 'Giảm đến 50% tất cả gọng kính. Chỉ trong 48h.', read: false, createdAt: new Date(Date.now() - 8 * 3600000).toISOString(), link: '/search' },
    { id: '3', type: 'loyalty', title: '🏆 Bạn nhận được 150 điểm!', message: 'Cảm ơn bạn đã đánh giá sản phẩm. +150 điểm thưởng.', read: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), link: '/loyalty', requiresAuth: true },
    { id: '4', type: 'wishlist', title: '💛 SP yêu thích đang giảm giá!', message: 'Kính Aviator Classic Gold giảm 30%. Nhanh tay!', read: true, createdAt: new Date(Date.now() - 48 * 3600000).toISOString(), link: '/wishlist', requiresAuth: true },
    { id: '5', type: 'product', title: 'SP mới trong danh mục của bạn', message: 'Gọng kính titan siêu nhẹ vừa ra mắt.', read: true, createdAt: new Date(Date.now() - 72 * 3600000).toISOString(), link: '/search' },
    { id: '6', type: 'order', title: '✅ Đã giao thành công', message: 'Đơn #SMK-2025998 đã giao thành công. Đánh giá ngay!', read: true, createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), link: '/account', requiresAuth: true },
    { id: '7', type: 'promo', title: '🎁 Mã giảm giá 10% cho đơn đầu tiên!', message: 'Nhập mã WELCOME10 khi thanh toán để được giảm 10%.', read: true, createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), link: '/search' },
];

const TYPE_ICONS: Record<string, string> = {
    order: '📦', promo: '🔥', loyalty: '🏆', wishlist: '💛', product: '', system: '🔔',
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return `${days} ngày trước`;
}

export default function NotificationsPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState('all');

    // Check auth status
    useEffect(() => {
        const hasAuth = document.cookie.includes('auth_token=') || document.cookie.includes('smk_session=');
        setIsLoggedIn(hasAuth);

        // Filter: guests only see promo + product
        if (hasAuth) {
            setNotifications(MOCK_NOTIFICATIONS);
        } else {
            setNotifications(MOCK_NOTIFICATIONS.filter(n => !AUTH_TYPES.has(n.type)));
        }
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;
    const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);

    const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const filterOpts = [
        { value: 'all', label: 'Tất cả' },
        { value: 'unread', label: `Chưa đọc (${unreadCount})` },
        ...(isLoggedIn ? [{ value: 'order', label: '📦 Đơn hàng' }] : []),
        { value: 'promo', label: '🔥 Khuyến mãi' },
        ...(isLoggedIn ? [{ value: 'loyalty', label: '🏆 Tích điểm' }] : []),
    ];

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>🔔 Thông báo</h1>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--gold-400)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        ✓ Đọc tất cả
                    </button>
                )}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-4)', overflowX: 'auto', paddingBottom: 4 }}>
                {filterOpts.map(f => (
                    <button key={f.value} onClick={() => setFilter(f.value)} style={{
                        padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                        border: filter === f.value ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)',
                        background: filter === f.value ? 'rgba(212,168,83,0.15)' : 'var(--bg-secondary)',
                        color: filter === f.value ? 'var(--gold-400)' : 'var(--text-secondary)',
                        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>{f.label}</button>
                ))}
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: 40 }}>🔔</span>
                        <p style={{ marginTop: 'var(--space-2)' }}>Không có thông báo</p>
                    </div>
                )}
                {filtered.map(n => (
                    <Link key={n.id} href={n.link || '#'} onClick={() => markRead(n.id)} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{
                            padding: 'var(--space-3) var(--space-4)', display: 'flex', gap: 12,
                            alignItems: 'start', cursor: 'pointer', transition: 'all 0.15s',
                            borderLeft: !n.read ? '3px solid var(--gold-400)' : '3px solid transparent',
                            background: !n.read ? 'rgba(212,168,83,0.04)' : undefined,
                        }}>
                            <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{TYPE_ICONS[n.type] || '🔔'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: !n.read ? 700 : 500, color: 'var(--text-primary)', margin: 0 }}>{n.title}</h3>
                                    {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold-400)', flexShrink: 0 }} />}
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{n.message}</p>
                                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(n.createdAt)}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Guest login prompt */}
            {!isLoggedIn && (
                <div style={{
                    marginTop: 'var(--space-4)', padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)', textAlign: 'center',
                    background: 'rgba(212,168,83,0.06)', border: '1px solid rgba(212,168,83,0.15)',
                }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        🔒 Đăng nhập để nhận thông báo giao hàng, tích điểm và khuyến mãi cá nhân hoá
                    </p>
                    <Link href="/login" className="btn btn-primary" style={{
                        fontSize: 13, padding: '8px 24px', textDecoration: 'none',
                    }}>
                        Đăng nhập
                    </Link>
                </div>
            )}
        </div>
    );
}
