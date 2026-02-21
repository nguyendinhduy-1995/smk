'use client';

import { useState, useEffect } from 'react';

interface Notification {
    id: string;
    title: string;
    body: string;
    icon: string;
    type: 'order' | 'commission' | 'payout' | 'system';
    createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
    order: 'rgba(96,165,250,0.1)',
    commission: 'rgba(212,168,83,0.1)',
    payout: 'rgba(34,197,94,0.1)',
    system: 'rgba(148,163,184,0.08)',
};

export default function PartnerNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');

    useEffect(() => {
        fetch('/api/partner/notifications', { headers: { 'x-user-id': 'demo-partner-user' } })
            .then((r) => r.json())
            .then((data) => setNotifications(data.notifications || []))
            .catch(() => {
                setNotifications([
                    { id: '1', title: 'Đơn hàng mới!', body: 'Khách hàng đã đặt đơn 5.890.000₫', icon: '🛒', type: 'order', createdAt: new Date().toISOString() },
                    { id: '2', title: 'Hoa hồng mới', body: 'Bạn nhận được 589.000₫ hoa hồng (đang giữ)', icon: '💰', type: 'commission', createdAt: new Date(Date.now() - 3600000).toISOString() },
                    { id: '3', title: 'Hoa hồng sẵn sàng!', body: '899.000₫ đã được giải phóng vào ví', icon: '✅', type: 'commission', createdAt: new Date(Date.now() - 86400000).toISOString() },
                    { id: '4', title: 'Đã chuyển tiền!', body: '2.000.000₫ đã được chuyển vào tài khoản', icon: '🏦', type: 'payout', createdAt: new Date(Date.now() - 172800000).toISOString() },
                    { id: '5', title: '🎉 Nâng cấp cấp bậc!', body: 'Bạn đã được nâng từ AFFILIATE lên AGENT', icon: '🎖️', type: 'system', createdAt: new Date(Date.now() - 604800000).toISOString() },
                    { id: '6', title: 'Lượt click mới', body: 'Link giới thiệu DUY123 vừa được truy cập', icon: '🔗', type: 'system', createdAt: new Date(Date.now() - 7200000).toISOString() },
                    { id: '7', title: 'Hoa hồng bị hoàn', body: '329.000₫ bị hoàn do hoàn trả', icon: '🔴', type: 'commission', createdAt: new Date(Date.now() - 259200000).toISOString() },
                ]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter ? notifications.filter((n) => n.type === filter) : notifications;
    const FILTERS = [
        { key: '', label: 'Tất cả', icon: '📋' },
        { key: 'order', label: 'Đơn hàng', icon: '🛒' },
        { key: 'commission', label: 'Hoa hồng', icon: '💰' },
        { key: 'payout', label: 'Rút tiền', icon: '💸' },
        { key: 'system', label: 'Hệ thống', icon: '⚙️' },
    ];

    function timeAgo(dateStr: string) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Vừa xong';
        if (mins < 60) return `${mins} phút trước`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs} giờ trước`;
        const days = Math.floor(hrs / 24);
        if (days < 7) return `${days} ngày trước`;
        return new Date(dateStr).toLocaleDateString('vi-VN');
    }

    return (
        <div className="animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>🔔 Thông báo</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                Theo dõi đơn hàng, hoa hồng và hoạt động của bạn
            </p>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        className="filter-chip"
                        onClick={() => setFilter(f.key)}
                        style={{
                            background: filter === f.key ? 'var(--gold-400)' : undefined,
                            color: filter === f.key ? '#0a0a0f' : undefined,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {f.icon} {f.label}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: 48, display: 'block', marginBottom: 'var(--space-3)' }}>🔕</span>
                        <p>Không có thông báo nào</p>
                    </div>
                ) : (
                    filtered.map((n) => (
                        <div key={n.id} className="card" style={{
                            padding: 'var(--space-4)',
                            display: 'flex',
                            gap: 'var(--space-3)',
                            alignItems: 'flex-start',
                            background: TYPE_COLORS[n.type] || 'var(--bg-secondary)',
                            transition: 'transform 150ms',
                        }}>
                            <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{n.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{n.title}</p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.body}</p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(n.createdAt)}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* D8: AI Smart Alerts */}
            <div className="glass-card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(212,168,83,0.04))' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    📊 SMK Smart Alerts
                    <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 99, background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>Smart</span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                        { icon: '🔥', title: 'SP hot sắp hết', msg: 'Aviator Classic Gold chỉ còn 3 SP trong kho. Đẩy nhanh trước khi hết!', color: '#ef4444' },
                        { icon: '💡', title: 'Tip bán hàng', msg: 'Khách hàng thường mua nhiều nhất 19-21h. Lên bài lúc 18:30 để tối ưu reach.', color: '#a855f7' },
                        { icon: '📈', title: 'Tối ưu hoa hồng', msg: 'Combo kính + dung dịch giúp tăng 25% giá trị đơn TB. Thêm upsell vào caption!', color: '#22c55e' },
                    ].map((alert, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                            <span style={{ fontSize: 16, flexShrink: 0 }}>{alert.icon}</span>
                            <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: alert.color }}>{alert.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>{alert.msg}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
