'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

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
            { icon: '🪞', label: 'Thử kính online', href: '/try-on' },
        ],
    },
    {
        title: 'Hỗ trợ',
        items: [
            { icon: '💬', label: 'Trung tâm hỗ trợ', href: '/support' },
            { icon: '❓', label: 'Câu hỏi thường gặp', href: '/faq' },
        ],
    },
];

export default function AccountPage() {
    const [activeView, setActiveView] = useState<number | null>(null);
    const { user, loading, fetchMe, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => { fetchMe(); }, [fetchMe]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !user) router.replace('/login');
    }, [loading, user, router]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="zen-account" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
                <p style={{ color: 'var(--text-muted)' }}>Đang tải...</p>
            </div>
        );
    }

    if (!user) return null;

    /* ─── Detail Views ─── */
    if (activeView !== null) {
        return (
            <div className="zen-account">
                <button className="zen-back" onClick={() => setActiveView(null)}>
                    ← Quay lại
                </button>
                {activeView === 0 && <ProfileView user={user} />}
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
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="zen-name">{user.name}</h1>
                    <p className="zen-meta">{user.phone}</p>
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
            <button className="zen-logout" onClick={handleLogout}>
                Đăng xuất
            </button>
        </div>
    );
}

/* ═══ Sub Views ═══ */
function ProfileView({ user }: { user: { name: string; phone: string; email: string | null } }) {
    return (
        <div className="zen-view">
            <h2 className="zen-view__title">Thông tin cá nhân</h2>
            <div className="zen-form">
                {[
                    { label: 'Họ tên', value: user.name },
                    { label: 'Số điện thoại', value: user.phone },
                    { label: 'Email', value: user.email || 'Chưa cập nhật' },
                ].map((f) => (
                    <div key={f.label} className="zen-field">
                        <label className="zen-field__label">{f.label}</label>
                        <input className="zen-field__input" defaultValue={f.value} readOnly />
                    </div>
                ))}
            </div>
        </div>
    );
}

function OrdersView() {
    return (
        <div className="zen-view">
            <h2 className="zen-view__title">Đơn hàng của tôi</h2>
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 'var(--space-3)', opacity: 0.3 }}>📦</div>
                <p style={{ fontSize: 'var(--text-sm)' }}>Chưa có đơn hàng nào</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)', textDecoration: 'none', display: 'inline-block' }}>
                    Mua sắm ngay
                </Link>
            </div>
        </div>
    );
}

function AddressView() {
    return (
        <div className="zen-view">
            <h2 className="zen-view__title">Sổ địa chỉ</h2>
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 'var(--space-3)', opacity: 0.3 }}>📍</div>
                <p style={{ fontSize: 'var(--text-sm)' }}>Chưa có địa chỉ nào</p>
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
                    { label: 'Mật khẩu mới', placeholder: 'Tối thiểu 6 ký tự' },
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
