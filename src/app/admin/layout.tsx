'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
    { href: '/admin', icon: '📊', label: 'Tổng quan', perm: 'dashboard' },
    { href: '/admin/products', icon: '📦', label: 'Sản phẩm', perm: 'products' },
    { href: '/admin/prescription', icon: '👓', label: 'Tròng kính', perm: 'products' },
    { href: '/admin/orders', icon: '🧾', label: 'Đơn hàng', perm: 'orders' },
    { href: '/admin/shipping', icon: '🚚', label: 'Vận chuyển', perm: 'orders' },
    { href: '/admin/returns', icon: '↩️', label: 'Đổi trả/BH', perm: 'orders' },
    { href: '/admin/warehouse', icon: '🏭', label: 'Kho hàng', perm: 'products' },
    { href: '/admin/customers', icon: '👥', label: 'Khách hàng', perm: 'customers' },
    { href: '/admin/support', icon: '🎧', label: 'Hỗ trợ KH', perm: 'customers' },
    { href: '/admin/reviews', icon: '⭐', label: 'Đánh giá/UGC', perm: 'products' },
    { href: '/admin/partners', icon: '🤝', label: 'Đại lý/Aff', perm: 'partners' },
    { href: '/admin/commissions', icon: '💰', label: 'Hoa hồng', perm: 'commissions' },
    { href: '/admin/payouts', icon: '🏦', label: 'Chi trả', perm: 'payouts' },
    { href: '/admin/automation', icon: '⚡', label: 'Tự động hoá', perm: 'automation' },
    { href: '/admin/ai', icon: '🤖', label: 'AI & KB', perm: 'ai' },
    { href: '/admin/analytics', icon: '📊', label: 'Phân tích', perm: 'analytics' },
    { href: '/admin/seo', icon: '🔍', label: 'SEO', perm: 'analytics' },
    { href: '/admin/fraud', icon: '🛡️', label: 'Chống gian lận', perm: 'fraud' },
    { href: '/admin/audit', icon: '📋', label: 'Nhật ký', perm: 'users' },
    { href: '/admin/users', icon: '👤', label: 'Quản lý users', perm: 'users' },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    ADMIN: { label: 'Admin', color: '#ef4444' },
    STORE_MANAGER: { label: 'Quản lý', color: '#3b82f6' },
    STAFF: { label: 'Nhân viên', color: '#22c55e' },
};

interface SessionInfo {
    name: string;
    email: string;
    role: string;
    permissions: string[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [session, setSession] = useState<SessionInfo | null>(null);

    // If on login page, render children without layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Read session from cookie (client-side)
    useEffect(() => {
        try {
            const cookies = document.cookie.split(';').reduce((acc, c) => {
                const [k, v] = c.trim().split('=');
                acc[k] = v;
                return acc;
            }, {} as Record<string, string>);
            const token = cookies['smk_admin_session'];
            if (token) {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    setSession({
                        name: payload.name || 'Admin',
                        email: payload.email || '',
                        role: payload.role || 'ADMIN',
                        permissions: payload.permissions || [],
                    });
                }
            }
        } catch { /* ignore parse errors */ }
    }, [pathname]);

    const handleLogout = async () => {
        await fetch('/api/auth/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    // Filter nav items based on permissions
    const visibleItems = NAV_ITEMS.filter((item) => {
        if (!session) return true; // show all while loading
        if (session.role === 'ADMIN') return true;
        if (session.role === 'STORE_MANAGER') return item.perm !== 'users';
        return session.permissions.includes(item.perm) || item.perm === 'dashboard';
    });

    const roleInfo = ROLE_LABELS[session?.role || 'ADMIN'] || ROLE_LABELS.ADMIN;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <Link
                    href="/admin"
                    style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'var(--text-lg)',
                        fontWeight: 800,
                        background: 'var(--gradient-gold)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textDecoration: 'none',
                        marginBottom: 'var(--space-8)',
                        display: 'block',
                    }}
                >
                    SMK Admin ✦
                </Link>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flex: 1 }}>
                    {visibleItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-3) var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-sm)',
                                    color: isActive ? 'var(--gold-400)' : 'var(--text-secondary)',
                                    background: isActive ? 'rgba(212,168,83,0.1)' : 'transparent',
                                    textDecoration: 'none',
                                    transition: 'all 150ms',
                                    fontWeight: isActive ? 600 : 400,
                                }}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="divider" style={{ margin: 'var(--space-4) 0' }} />

                {/* Session Info */}
                {session && (
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 14, fontWeight: 700, color: '#0a0a0f',
                            }}>
                                {session.name.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {session.name}
                                </p>
                                <span style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: 4,
                                    background: roleInfo.color,
                                    color: '#fff',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.03em',
                                }}>
                                    {roleInfo.label}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: 'var(--space-2)',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--error)',
                                fontSize: 'var(--text-xs)',
                                cursor: 'pointer',
                                transition: 'all 150ms',
                                fontWeight: 600,
                            }}
                        >
                            🚪 Đăng xuất
                        </button>
                    </div>
                )}

                <Link
                    href="/"
                    style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                    }}
                >
                    ← Về cửa hàng
                </Link>
            </aside>

            <main className="admin-main">{children}</main>
        </div>
    );
}
