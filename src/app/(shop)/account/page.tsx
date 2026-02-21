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
    const [orders, setOrders] = useState<{ id: string; code: string; status: string; total: number; createdAt: string; itemCount: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then(r => r.json())
            .then(d => setOrders(d.orders || []))
            .catch(() => setOrders([
                { id: '1', code: 'SMK-20260220-014', status: 'CONFIRMED', total: 5890000, createdAt: new Date().toISOString(), itemCount: 2 },
                { id: '2', code: 'SMK-20260218-011', status: 'DELIVERED', total: 4590000, createdAt: new Date(Date.now() - 172800000).toISOString(), itemCount: 1 },
            ]))
            .finally(() => setLoading(false));
    }, []);

    const STATUS: Record<string, { label: string; color: string }> = {
        CREATED: { label: 'Mới tạo', color: '#94a3b8' },
        CONFIRMED: { label: 'Xác nhận', color: '#fbbf24' },
        PAID: { label: 'Đã thanh toán', color: '#22c55e' },
        SHIPPING: { label: 'Đang giao', color: '#60a5fa' },
        DELIVERED: { label: 'Đã giao', color: '#22c55e' },
        CANCELLED: { label: 'Đã hủy', color: '#ef4444' },
    };

    if (loading) return <div className="zen-view"><p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</p></div>;

    return (
        <div className="zen-view">
            <h2 className="zen-view__title">Đơn hàng của tôi</h2>
            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 'var(--space-3)', opacity: 0.3 }}>📦</div>
                    <p style={{ fontSize: 'var(--text-sm)' }}>Chưa có đơn hàng nào</p>
                    <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)', textDecoration: 'none', display: 'inline-block' }}>Mua sắm ngay</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {orders.map(o => {
                        const st = STATUS[o.status] || STATUS.CREATED;
                        return (
                            <Link key={o.id} href={`/orders/${o.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                                <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📦</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{o.code}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{o.itemCount} SP · {new Date(o.createdAt).toLocaleDateString('vi-VN')}</div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-400)' }}>{formatVND(o.total)}</div>
                                    <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: `${st.color}20`, color: st.color, fontWeight: 700 }}>{st.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AddressView() {
    const [addresses, setAddresses] = useState<{ id: number; name: string; phone: string; address: string; isDefault: boolean }[]>([
        { id: 1, name: 'Nhà riêng', phone: '0909 123 456', address: '123 Nguyễn Huệ, Q.1, TP.HCM', isDefault: true },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', address: '' });

    const addAddr = () => {
        if (!form.name || !form.phone || !form.address) return;
        setAddresses(prev => [...prev, { id: Date.now(), name: form.name, phone: form.phone, address: form.address, isDefault: prev.length === 0 }]);
        setForm({ name: '', phone: '', address: '' });
        setShowForm(false);
    };

    return (
        <div className="zen-view">
            <h2 className="zen-view__title">Sổ địa chỉ</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'var(--space-4)' }}>
                {addresses.map(a => (
                    <div key={a.id} style={{ padding: 14, borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: a.isDefault ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)', position: 'relative' }}>
                        {a.isDefault && <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(212,168,83,0.15)', color: 'var(--gold-400)', fontWeight: 700 }}>Mặc định</span>}
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.phone}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{a.address}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 11 }}>
                            {!a.isDefault && <button onClick={() => setAddresses(prev => prev.map(x => ({ ...x, isDefault: x.id === a.id })))} style={{ background: 'none', border: 'none', color: 'var(--gold-400)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>⭐ Đặt mặc định</button>}
                            <button onClick={() => setAddresses(prev => prev.filter(x => x.id !== a.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, padding: 0 }}>🗑️ Xóa</button>
                        </div>
                    </div>
                ))}
            </div>

            {showForm ? (
                <div style={{ padding: 14, borderRadius: 'var(--radius-lg)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                    <div className="zen-form" style={{ gap: 10 }}>
                        <div className="zen-field">
                            <label className="zen-field__label">Tên</label>
                            <input className="zen-field__input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: Nhà riêng, Công ty..." />
                        </div>
                        <div className="zen-field">
                            <label className="zen-field__label">SĐT</label>
                            <input className="zen-field__input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="0912 345 678" />
                        </div>
                        <div className="zen-field">
                            <label className="zen-field__label">Địa chỉ</label>
                            <input className="zen-field__input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Số nhà, đường, phường, quận, TP" />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="zen-btn-primary" onClick={addAddr} style={{ flex: 1 }}>💾 Lưu</button>
                            <button className="zen-btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                        </div>
                    </div>
                </div>
            ) : (
                <button className="zen-btn-secondary" onClick={() => setShowForm(true)}>+ Thêm địa chỉ</button>
            )}
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
