'use client';

import { useState } from 'react';
import Link from 'next/link';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

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

/* ═══ Zen Menu Items ═══ */
type MenuItem = { icon: string; label: string } & ({ tab: number } | { href: string });

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
    {
        title: 'Tài khoản',
        items: [
            { icon: '👤', label: 'Thông tin cá nhân', tab: 0 },
            { icon: '📍', label: 'Sổ địa chỉ', tab: 2 },
            { icon: '🔐', label: 'Bảo mật', tab: 3 },
        ],
    },
    {
        title: 'Hoạt động',
        items: [
            { icon: '📦', label: 'Đơn hàng của tôi', tab: 1 },
            { icon: '♡', label: 'Sản phẩm yêu thích', href: '/wishlist' },
            { icon: '🕐', label: 'Đã xem gần đây', href: '/recently-viewed' },
        ],
    },
    {
        title: 'Hỗ trợ',
        items: [
            { icon: '💬', label: 'Trung tâm hỗ trợ', href: '/support' },
            { icon: '🪞', label: 'Thử kính online', href: '/try-on' },
        ],
    },
];

export default function AccountPage() {
    const [activeView, setActiveView] = useState<number | null>(null);

    /* ─── Detail Views ─── */
    if (activeView !== null) {
        return (
            <div className="zen-account">
                <button
                    className="zen-back"
                    onClick={() => setActiveView(null)}
                >
                    ← Quay lại
                </button>

                {activeView === 0 && <ProfileView />}
                {activeView === 1 && <OrdersView />}
                {activeView === 2 && <AddressView />}
                {activeView === 3 && <SecurityView />}
            </div>
        );
    }

    /* ─── Main Account View ─── */
    return (
        <div className="zen-account">
            {/* Avatar + Name */}
            <div className="zen-profile-header">
                <div className="zen-avatar">
                    {DEMO_USER.name.charAt(0)}
                </div>
                <div>
                    <h1 className="zen-name">{DEMO_USER.name}</h1>
                    <p className="zen-meta">Thành viên từ {DEMO_USER.joinDate}</p>
                </div>
            </div>

            {/* Stats — clean horizontal */}
            <div className="zen-stats">
                <div className="zen-stat">
                    <span className="zen-stat__value">{DEMO_USER.totalOrders}</span>
                    <span className="zen-stat__label">Đơn hàng</span>
                </div>
                <div className="zen-stat-divider" />
                <div className="zen-stat">
                    <span className="zen-stat__value">{formatVND(DEMO_USER.totalSpent)}</span>
                    <span className="zen-stat__label">Tổng chi tiêu</span>
                </div>
            </div>

            {/* Menu Sections */}
            {MENU_SECTIONS.map((section) => (
                <div key={section.title} className="zen-section">
                    <p className="zen-section__title">{section.title}</p>
                    <div className="zen-menu-card">
                        {section.items.map((item, i) => {
                            const borderClass = i < section.items.length - 1 ? 'zen-menu-item--border' : '';
                            const inner = (
                                <>
                                    <span className="zen-menu-item__icon">{item.icon}</span>
                                    <span className="zen-menu-item__label">{item.label}</span>
                                    <span className="zen-menu-item__arrow">›</span>
                                </>
                            );

                            if ('href' in item) {
                                return (
                                    <Link key={item.label} href={item.href} className={`zen-menu-item ${borderClass}`}>
                                        {inner}
                                    </Link>
                                );
                            }
                            return (
                                <button key={item.label} className={`zen-menu-item ${borderClass}`} onClick={() => setActiveView(item.tab)}>
                                    {inner}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Logout */}
            <button className="zen-logout">
                Đăng xuất
            </button>
        </div>
    );
}

/* ═══ Sub Views ═══ */
function ProfileView() {
    return (
        <div className="zen-view">
            <h2 className="zen-view__title">Thông tin cá nhân</h2>
            <div className="zen-form">
                {[
                    { label: 'Họ tên', value: DEMO_USER.name },
                    { label: 'Email', value: DEMO_USER.email },
                    { label: 'Số điện thoại', value: DEMO_USER.phone },
                ].map((f) => (
                    <div key={f.label} className="zen-field">
                        <label className="zen-field__label">{f.label}</label>
                        <input className="zen-field__input" defaultValue={f.value} readOnly />
                    </div>
                ))}
                <button className="zen-btn-primary">Chỉnh sửa</button>
            </div>
        </div>
    );
}

function OrdersView() {
    return (
        <div className="zen-view">
            <h2 className="zen-view__title">Đơn hàng của tôi</h2>
            <div className="zen-orders">
                {DEMO_ORDERS.map((order) => (
                    <Link
                        key={order.code}
                        href={`/orders/${order.code}`}
                        className="zen-order-card"
                    >
                        <div>
                            <p className="zen-order-card__code">{order.code}</p>
                            <p className="zen-order-card__date">{order.date}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className={`zen-order-status ${order.status === 'Đã giao' ? 'zen-order-status--done' : 'zen-order-status--active'}`}>
                                {order.status}
                            </span>
                            <p className="zen-order-card__total">{formatVND(order.total)}</p>
                        </div>
                    </Link>
                ))}
            </div>
            <Link href="/orders" className="zen-link-all">
                Xem tất cả đơn hàng →
            </Link>
        </div>
    );
}

function AddressView() {
    return (
        <div className="zen-view">
            <h2 className="zen-view__title">Sổ địa chỉ</h2>
            <div className="zen-addresses">
                {DEMO_ADDRESSES.map((addr) => (
                    <div key={addr.id} className="zen-address-card">
                        <div className="zen-address-card__header">
                            <span className="zen-address-card__name">{addr.name}</span>
                            {addr.isDefault && <span className="zen-address-default">Mặc định</span>}
                        </div>
                        <p className="zen-address-card__phone">{addr.phone}</p>
                        <p className="zen-address-card__street">{addr.street}, {addr.district}, {addr.province}</p>
                    </div>
                ))}
            </div>
            <button className="zen-btn-secondary">+ Thêm địa chỉ</button>
        </div>
    );
}

function SecurityView() {
    return (
        <div className="zen-view">
            <h2 className="zen-view__title">Bảo mật</h2>
            <div className="zen-form" style={{ maxWidth: 400 }}>
                {[
                    { label: 'Mật khẩu hiện tại', placeholder: '••••••••' },
                    { label: 'Mật khẩu mới', placeholder: 'Tối thiểu 8 ký tự' },
                    { label: 'Xác nhận', placeholder: 'Nhập lại mật khẩu mới' },
                ].map((f) => (
                    <div key={f.label} className="zen-field">
                        <label className="zen-field__label">{f.label}</label>
                        <input className="zen-field__input" type="password" placeholder={f.placeholder} />
                    </div>
                ))}
                <button className="zen-btn-primary">Đổi mật khẩu</button>
            </div>
        </div>
    );
}
