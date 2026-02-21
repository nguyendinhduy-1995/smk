'use client';

import { useState } from 'react';
import Link from 'next/link';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const TABS = ['Thông tin', 'Đơn hàng', 'Địa chỉ', 'Mật khẩu'];

// Demo user — will be replaced with auth
const DEMO_USER = {
    name: 'Nguyễn Văn Khách',
    email: 'khach@example.com',
    phone: '0912 345 678',
    avatar: null as string | null,
    joinDate: '02/2026',
    totalOrders: 5,
    totalSpent: 18500000,
};

const DEMO_ORDERS = [
    { code: 'SMK-20260220-015', date: '20/02/2026', status: 'Đang giao', total: 2990000 },
    { code: 'SMK-20260218-008', date: '18/02/2026', status: 'Đã giao', total: 5490000 },
    { code: 'SMK-20260210-003', date: '10/02/2026', status: 'Đã giao', total: 4590000 },
];

const DEMO_ADDRESSES = [
    { id: '1', name: 'Nguyễn Văn Khách', phone: '0912 345 678', street: '123 Nguyễn Huệ, P. Bến Nghé', district: 'Quận 1', province: 'TP. Hồ Chí Minh', isDefault: true },
    { id: '2', name: 'Nguyễn Văn Khách', phone: '0912 345 678', street: '45 Lê Lợi', district: 'Quận 3', province: 'TP. Hồ Chí Minh', isDefault: false },
];

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)', maxWidth: 800 }}>
            {/* Profile Header */}
            <div
                className="glass-card"
                style={{
                    padding: 'var(--space-6)',
                    marginBottom: 'var(--space-6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(96,165,250,0.04))',
                }}
            >
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--gradient-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#0a0a0f',
                        flexShrink: 0,
                    }}
                >
                    {DEMO_USER.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{DEMO_USER.name}</h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                        Thành viên từ {DEMO_USER.joinDate}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-6)', textAlign: 'center' }}>
                    <div>
                        <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--gold-400)' }}>
                            {DEMO_USER.totalOrders}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Đơn hàng</p>
                    </div>
                    <div>
                        <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--gold-400)' }}>
                            {formatVND(DEMO_USER.totalSpent)}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Đã chi</p>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                {[
                    { icon: '📦', label: 'Đơn hàng', href: '/orders' },
                    { icon: '❤️', label: 'Yêu thích', href: '/wishlist' },
                    { icon: '🤖', label: 'AI Stylist', href: '/support' },
                    { icon: '🪞', label: 'Thử kính', href: '/try-on' },
                ].map((q) => (
                    <Link
                        key={q.label}
                        href={q.href}
                        className="card"
                        style={{
                            padding: 'var(--space-4)',
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                        }}
                    >
                        <span style={{ fontSize: 24 }}>{q.icon}</span>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500 }}>{q.label}</span>
                    </Link>
                ))}
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 'var(--space-6)' }}>
                {TABS.map((tab, i) => (
                    <button
                        key={tab}
                        className={`tab ${i === activeTab ? 'tab--active' : ''}`}
                        onClick={() => setActiveTab(i)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 0 && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-5)' }}>Thông tin cá nhân</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {[
                            { label: 'Họ tên', value: DEMO_USER.name },
                            { label: 'Email', value: DEMO_USER.email },
                            { label: 'Số điện thoại', value: DEMO_USER.phone },
                        ].map((field) => (
                            <div key={field.label}>
                                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                                    {field.label}
                                </label>
                                <input className="input" defaultValue={field.value} readOnly style={{ cursor: 'default' }} />
                            </div>
                        ))}
                        <button className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}>
                            ✏️ Chỉnh sửa
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {DEMO_ORDERS.map((order) => (
                        <Link
                            key={order.code}
                            href={`/orders/${order.code}`}
                            className="card"
                            style={{
                                padding: 'var(--space-4)',
                                textDecoration: 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{order.code}</p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{order.date}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span
                                    className={`badge ${order.status === 'Đã giao' ? 'badge-success' : 'badge-warning'}`}
                                    style={{ marginBottom: 4, display: 'inline-block' }}
                                >
                                    {order.status}
                                </span>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)' }}>
                                    {formatVND(order.total)}
                                </p>
                            </div>
                        </Link>
                    ))}
                    <Link href="/orders" className="btn btn-secondary" style={{ textAlign: 'center' }}>
                        Xem tất cả đơn hàng →
                    </Link>
                </div>
            )}

            {activeTab === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {DEMO_ADDRESSES.map((addr) => (
                        <div key={addr.id} className="card" style={{ padding: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-2)' }}>
                                <div>
                                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{addr.name}</span>
                                    {addr.isDefault && <span className="badge badge-gold" style={{ marginLeft: 'var(--space-2)' }}>Mặc định</span>}
                                </div>
                                <button className="btn btn-sm btn-ghost">✏️</button>
                            </div>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                📞 {addr.phone}
                            </p>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                                📍 {addr.street}, {addr.district}, {addr.province}
                            </p>
                        </div>
                    ))}
                    <button className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
                        ➕ Thêm địa chỉ mới
                    </button>
                </div>
            )}

            {activeTab === 3 && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-5)' }}>Đổi mật khẩu</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 400 }}>
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                                Mật khẩu hiện tại
                            </label>
                            <input className="input" type="password" placeholder="••••••••" />
                        </div>
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                                Mật khẩu mới
                            </label>
                            <input className="input" type="password" placeholder="Tối thiểu 8 ký tự" />
                        </div>
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>
                                Xác nhận mật khẩu mới
                            </label>
                            <input className="input" type="password" placeholder="Nhập lại mật khẩu mới" />
                        </div>
                        <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                            🔒 Đổi mật khẩu
                        </button>
                    </div>
                </div>
            )}

            {/* Logout */}
            <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
                <button className="btn btn-ghost" style={{ color: 'var(--error)' }}>
                    🚪 Đăng xuất
                </button>
            </div>
        </div>
    );
}
