'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface DashboardData {
    partner: { id: string; partnerCode: string; level: string; status: string };
    stats: {
        monthlyRevenue: number;
        monthlyOrders: number;
        pendingCommission: number;
        availableCommission: number;
        paidCommission: number;
        walletBalance: number;
    };
    recentOrders: {
        code: string;
        total: number;
        status: string;
        createdAt: string;
        attributionType: string;
    }[];
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    CREATED: { label: 'Mới tạo', cls: 'badge-neutral' },
    CONFIRMED: { label: 'Xác nhận', cls: 'badge-warning' },
    PAID: { label: 'Đã thanh toán', cls: 'badge-success' },
    SHIPPING: { label: 'Đang giao', cls: 'badge-warning' },
    DELIVERED: { label: 'Đã giao', cls: 'badge-success' },
    RETURNED: { label: 'Hoàn trả', cls: 'badge-error' },
    CANCELLED: { label: 'Huỷ', cls: 'badge-error' },
};

const LEVEL_MAP: Record<string, string> = {
    AFFILIATE: 'Cộng tác viên',
    AGENT: 'Đại lý',
    LEADER: 'Trưởng nhóm',
};

export default function PartnerDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/partner/dashboard', {
            headers: { 'x-user-id': 'demo-partner-user' }, // TODO: replace with real session
        })
            .then((r) => {
                if (!r.ok) throw new Error('Không tải được dữ liệu');
                return r.json();
            })
            .then(setData)
            .catch(() => setError('Không tải được dữ liệu. Đang hiển thị dữ liệu mẫu.'))
            .finally(() => setLoading(false));
    }, []);

    // Fallback demo data if API fails
    const partner = data?.partner || { partnerCode: 'DUY123', level: 'AGENT', status: 'ACTIVE' };
    const stats = data?.stats || {
        monthlyRevenue: 15890000, monthlyOrders: 23,
        pendingCommission: 1589000, availableCommission: 890000,
        paidCommission: 5200000, walletBalance: 3566000,
    };
    const recentOrders = data?.recentOrders || [
        { code: 'SMK-001', total: 2990000, status: 'DELIVERED', createdAt: new Date().toISOString(), attributionType: 'LAST_CLICK' },
        { code: 'SMK-002', total: 5890000, status: 'SHIPPING', createdAt: new Date().toISOString(), attributionType: 'COUPON' },
        { code: 'SMK-003', total: 3290000, status: 'CONFIRMED', createdAt: new Date().toISOString(), attributionType: 'LAST_CLICK' },
    ];

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Bảng điều khiển</h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                        Xin chào, {LEVEL_MAP[partner.level] || partner.level} {partner.partnerCode}
                    </p>
                </div>
                <span className="badge badge-gold">{LEVEL_MAP[partner.level] || partner.level}</span>
            </div>

            {error && (
                <div style={{ padding: 'var(--space-3)', background: 'rgba(251,191,36,0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--warning)' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* D1: Onboarding Checklist */}
            {(() => {
                const steps = [
                    { label: 'Tạo link đại lý', done: true, icon: '🔗' },
                    { label: 'Post bài đầu tiên', done: stats.monthlyOrders > 0 || recentOrders.length > 0, icon: '📝' },
                    { label: 'Đơn hàng đầu tiên', done: recentOrders.some(o => o.status === 'DELIVERED'), icon: '📦' },
                    { label: 'Rút hoa hồng', done: stats.paidCommission > 0, icon: '💰' },
                ];
                const doneCount = steps.filter(s => s.done).length;
                if (doneCount >= steps.length) return null;
                return (
                    <div className="glass-card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(212,168,83,0.04))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 700 }}>🚀 Bắt đầu nhanh</h3>
                            <span style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 700 }}>{doneCount}/{steps.length}</span>
                        </div>
                        <div style={{ width: '100%', height: 4, borderRadius: 99, background: 'var(--bg-tertiary)', marginBottom: 10 }}>
                            <div style={{ width: `${(doneCount / steps.length) * 100}%`, height: '100%', borderRadius: 99, background: 'var(--gradient-gold)' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {steps.map((s, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', opacity: s.done ? 0.6 : 1 }}>
                                    <span style={{ fontSize: 16 }}>{s.done ? '✅' : s.icon}</span>
                                    <span style={{ fontSize: 12, fontWeight: s.done ? 400 : 600, textDecoration: s.done ? 'line-through' : 'none', color: s.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>{s.label}</span>
                                    {!s.done && i === doneCount && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 99, background: 'rgba(212,168,83,0.15)', color: 'var(--gold-400)', fontWeight: 700, marginLeft: 'auto' }}>Bước tiếp</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })()}

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {[
                    { label: 'Doanh thu tháng', value: formatVND(stats.monthlyRevenue) },
                    { label: 'Hoa hồng tạm tính', value: formatVND(stats.pendingCommission) },
                    { label: 'Hoa hồng có thể rút', value: formatVND(stats.availableCommission) },
                    { label: 'Đơn hàng tháng', value: String(stats.monthlyOrders) },
                ].map((stat) => (
                    <div key={stat.label} className="stat-card">
                        <div className="stat-card__label">{stat.label}</div>
                        <div className="stat-card__value">{loading ? '...' : stat.value}</div>
                    </div>
                ))}
            </div>

            {/* ═══ Smart Link ═══ */}
            <div className="glass-card" style={{
                padding: 'var(--space-4)', marginBottom: 'var(--space-4)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(96,165,250,0.04))',
                border: '1px solid rgba(212,168,83,0.2)',
            }}>
                <span style={{ fontSize: 28 }}>✨</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Smart Link của bạn</p>
                    <code style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)', wordBreak: 'break-all' }}>
                        {typeof window !== 'undefined' ? window.location.origin : 'https://sieuthimatkinh.vn'}/s/{data?.partner.partnerCode || 'CODE'}
                    </code>
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                        const url = `${window.location.origin}/s/${data?.partner.partnerCode || 'CODE'}`;
                        navigator.clipboard.writeText(url);
                    }}
                    style={{ flexShrink: 0, minHeight: 36 }}
                >
                    📋 Copy
                </button>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                {[
                    { href: '/partner/links', icon: '🔗', label: 'Link giới thiệu' },
                    { href: '/partner/orders', icon: '📦', label: 'Đơn hàng' },
                    { href: '/partner/wallet', icon: '💰', label: 'Ví tiền' },
                    { href: '/partner/analytics', icon: '📊', label: 'Thống kê' },
                    { href: '/partner/notifications', icon: '🔔', label: 'Thông báo' },
                    { href: '/partner/content', icon: '🎨', label: 'Thư viện nội dung' },
                    { href: '/partner/toolkit', icon: '📦', label: 'Marketing Kit' },
                ].map((link) => (
                    <Link key={link.href} href={link.href} className="glass-card" style={{ padding: 'var(--space-4)', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', textAlign: 'center' }}>
                        <span style={{ fontSize: 28 }}>{link.icon}</span>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{link.label}</span>
                    </Link>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
                <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Đơn hàng gần đây</h3>
                    <Link href="/partner/orders" className="section-header__link" style={{ fontSize: 'var(--text-xs)' }}>Xem tất cả →</Link>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Giá trị</th>
                                <th>Nguồn</th>
                                <th>Trạng thái</th>
                                <th>Ngày</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.code}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.code}</td>
                                    <td>{formatVND(order.total)}</td>
                                    <td><span className="badge badge-neutral" style={{ fontSize: 10 }}>{order.attributionType === 'COUPON' ? '🎫 Mã giảm giá' : '🔗 Link'}</span></td>
                                    <td><span className={`badge ${STATUS_MAP[order.status]?.cls || 'badge-neutral'}`}>{STATUS_MAP[order.status]?.label || order.status}</span></td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>Chưa có đơn hàng nào</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AI Performance Coach */}
            <AICoach partnerCode={partner.partnerCode} stats={stats} />
        </div>
    );
}

function AICoach({ partnerCode, stats }: { partnerCode: string; stats: DashboardData['stats'] }) {
    const [tips, setTips] = useState<{ title: string; message: string; icon: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const fetchCoach = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/customer-insights', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ partnerCode, stats, type: 'coach' }),
            });
            const data = await res.json();
            if (data.tips) setTips(data.tips);
            else throw new Error('no tips');
        } catch {
            // Fallback coaching tips
            const convRate = stats.monthlyOrders > 0 ? Math.round((stats.monthlyOrders / Math.max(stats.monthlyOrders * 4, 1)) * 100) : 0;
            setTips([
                { icon: '📈', title: 'Doanh thu tháng', message: `Bạn đạt ${new Intl.NumberFormat('vi-VN').format(stats.monthlyRevenue)}₫. ${stats.monthlyRevenue > 10000000 ? 'Xuất sắc! Tiếp tục phát huy.' : 'Cố gắng push thêm SP hot để đạt 10tr+.'}` },
                { icon: '🎯', title: 'Tỷ lệ chuyển đổi', message: `~${convRate}% click → mua. ${convRate > 8 ? 'Rất tốt!' : 'Thử dùng SMK Content để tạo bài viết thu hút hơn.'}` },
                { icon: '💡', title: 'Gợi ý SP', message: 'Kính Aviator và Wayfarer đang hot, nên tập trung quảng bá 2 dòng này.' },
                { icon: '⏰', title: 'Thời điểm post', message: 'Khách hàng online nhiều nhất 19:00-21:00. Đăng bài vào khung giờ này.' },
            ]);
        }
        setLoading(false);
        setLoaded(true);
    };

    return (
        <div className="glass-card" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(212,168,83,0.06))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    📊 SMK Coach
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>Smart</span>
                </h3>
                {!loaded && (
                    <button className="btn btn-sm btn-primary" onClick={fetchCoach} disabled={loading}>
                        {loading ? '⏳...' : '✨ Phân tích'}
                    </button>
                )}
            </div>
            {!loaded && !loading && (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Phân tích hiệu suất và đề xuất chiến thuật bán hàng cá nhân hoá cho bạn.</p>
            )}
            {loading && <div style={{ height: 80, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />}
            {loaded && tips.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tips.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                            <span style={{ fontSize: 20, flexShrink: 0 }}>{tip.icon}</span>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 700 }}>{tip.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>{tip.message}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
