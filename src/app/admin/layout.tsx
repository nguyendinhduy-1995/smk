'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import BottomNav from '@/components/admin/BottomNav';
import AdminHeader from '@/components/admin/AdminHeader';
import ThemeToggle from '@/components/admin/ThemeToggle';
import ErrorBoundary from '@/components/admin/ErrorBoundary';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { FeatureProvider, useFeatures } from '@/lib/features/gate';
import type { FeatureKey } from '@/lib/features/flags';

const NAV_SECTIONS: { title: string | null; items: { href: string; icon: string; label: string; perm: string; featureKey?: string }[] }[] = [
    {
        title: null, // no header for primary
        items: [
            { href: '/admin', icon: '📊', label: 'Tổng quan', perm: 'dashboard' },
        ],
    },
    {
        title: 'Bán hàng',
        items: [
            { href: '/admin/products', icon: '📦', label: 'Sản phẩm', perm: 'products' },
            { href: '/admin/prescription', icon: '👓', label: 'Tròng kính', perm: 'products', featureKey: 'ADV_PRESCRIPTION' },
            { href: '/admin/orders', icon: '🧾', label: 'Đơn hàng', perm: 'orders' },
            { href: '/admin/shipping', icon: '🚚', label: 'Vận chuyển', perm: 'orders', featureKey: 'ADV_SHIPPING' },
            { href: '/admin/returns', icon: '↩️', label: 'Đổi trả', perm: 'orders', featureKey: 'ADV_RETURNS' },
            { href: '/admin/warehouse', icon: '🏭', label: 'Kho hàng', perm: 'products', featureKey: 'ADV_WAREHOUSE' },
        ],
    },
    {
        title: 'Khách hàng',
        items: [
            { href: '/admin/customers', icon: '👥', label: 'Khách hàng', perm: 'customers' },
            { href: '/admin/support', icon: '🎧', label: 'Hỗ trợ', perm: 'customers', featureKey: 'ADV_SUPPORT' },
            { href: '/admin/reviews', icon: '⭐', label: 'Đánh giá', perm: 'products', featureKey: 'ADV_REVIEWS' },
        ],
    },
    {
        title: 'Đối tác',
        items: [
            { href: '/admin/partners', icon: '🤝', label: 'Đại lý', perm: 'partners', featureKey: 'ADV_PARTNER' },
            { href: '/admin/commissions', icon: '💰', label: 'Hoa hồng', perm: 'commissions', featureKey: 'ADV_PARTNER' },
            { href: '/admin/payouts', icon: '🏦', label: 'Chi trả', perm: 'payouts', featureKey: 'ADV_PARTNER' },
            { href: '/admin/fraud', icon: '🛡️', label: 'Gian lận', perm: 'fraud', featureKey: 'ADV_PARTNER' },
        ],
    },
    {
        title: 'Hệ thống',
        items: [
            { href: '/admin/automation', icon: '⚡', label: 'Tự động', perm: 'automation', featureKey: 'ADV_AUTOMATION' },
            { href: '/admin/ai', icon: '🤖', label: 'AI', perm: 'ai', featureKey: 'ADV_AI' },
            { href: '/admin/analytics', icon: '📈', label: 'Phân tích', perm: 'analytics', featureKey: 'ADV_ANALYTICS' },
            { href: '/admin/seo', icon: '🔍', label: 'SEO', perm: 'analytics', featureKey: 'ADV_SEO' },
            { href: '/admin/audit', icon: '📋', label: 'Nhật ký', perm: 'users' },
            { href: '/admin/users', icon: '👤', label: 'Người dùng', perm: 'users' },
            { href: '/admin/entitlements', icon: '🔑', label: 'Tính năng', perm: 'users' },
        ],
    },
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Keyboard shortcuts
    const shortcuts = useMemo(() => [
        { key: 'k', label: 'Tìm kiếm', action: () => { const btn = document.querySelector('.admin-header__search-trigger') as HTMLButtonElement; btn?.click(); }, meta: true },
        { key: 'g', label: 'Tổng quan', action: () => router.push('/admin'), meta: false },
        { key: 'o', label: 'Đơn hàng', action: () => router.push('/admin/orders'), meta: false },
        { key: 'p', label: 'Sản phẩm', action: () => router.push('/admin/products'), meta: false },
    ], [router]);
    const { showHelp, setShowHelp } = useKeyboardShortcuts(shortcuts);

    // Read session from cookie (client-side) — MUST be before any conditional return
    useEffect(() => {
        if (pathname === '/admin/login') return; // skip for login page
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
        setSidebarOpen(false); // close on nav
    }, [pathname]);

    // If on login page, render children without layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        await fetch('/api/auth/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    // Feature flags from context
    const { isEnabled: isFeatureOn } = useFeatures();

    // Filter nav sections based on permissions + feature flags
    const canSee = (perm: string) => {
        if (!session) return true;
        if (session.role === 'ADMIN') return true;
        if (session.role === 'STORE_MANAGER') return perm !== 'users';
        return session.permissions.includes(perm) || perm === 'dashboard';
    };
    const visibleSections = NAV_SECTIONS
        .map(s => ({
            ...s,
            items: s.items.filter(i => {
                if (!canSee(i.perm)) return false;
                if (i.featureKey && !isFeatureOn(i.featureKey as FeatureKey)) return false;
                return true;
            }),
        }))
        .filter(s => s.items.length > 0);

    const roleInfo = ROLE_LABELS[session?.role || 'ADMIN'] || ROLE_LABELS.ADMIN;

    return (
        <FeatureProvider>
            <div className="admin-layout">
                {/* Mobile header with global search */}
                <AdminHeader />

                {/* Mobile hamburger toggle (hidden on phone ≤768px where BottomNav is used) */}
                <button
                    className="admin-hamburger"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle admin menu"
                >
                    <span style={{
                        display: 'flex', flexDirection: 'column', gap: 5, width: 22,
                    }}>
                        <span style={{
                            display: 'block', height: 2, background: 'var(--text-primary)',
                            borderRadius: 2, transition: 'all 200ms',
                            transform: sidebarOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                        }} />
                        <span style={{
                            display: 'block', height: 2, background: 'var(--text-primary)',
                            borderRadius: 2, transition: 'all 200ms',
                            opacity: sidebarOpen ? 0 : 1,
                        }} />
                        <span style={{
                            display: 'block', height: 2, background: 'var(--text-primary)',
                            borderRadius: 2, transition: 'all 200ms',
                            transform: sidebarOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                        }} />
                    </span>
                </button>

                {/* Overlay */}
                {sidebarOpen && (
                    <div
                        className="admin-overlay"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
                    <Link
                        href="/admin"
                        style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: 15,
                            fontWeight: 800,
                            background: 'var(--gradient-gold)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textDecoration: 'none',
                            marginBottom: 20,
                            display: 'block',
                            letterSpacing: '0.02em',
                        }}
                    >
                        ✦ SMK Quản trị
                    </Link>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 0, flex: 1, overflowY: 'auto' }}>
                        {visibleSections.map((section, si) => (
                            <div key={si} style={{ marginBottom: 4 }}>
                                {section.title && (
                                    <div style={{
                                        fontSize: 9.5,
                                        fontWeight: 700,
                                        color: 'rgba(255,255,255,0.28)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.12em',
                                        padding: '12px 12px 4px',
                                    }}>
                                        {section.title}
                                    </div>
                                )}
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '8px 12px',
                                                borderRadius: 6,
                                                fontSize: 13,
                                                color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                                                background: isActive ? 'rgba(212,168,83,0.12)' : 'transparent',
                                                textDecoration: 'none',
                                                transition: 'all 120ms',
                                                fontWeight: isActive ? 600 : 400,
                                                borderLeft: isActive ? '2px solid var(--gold-400)' : '2px solid transparent',
                                                marginLeft: -2,
                                            }}
                                        >
                                            <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />

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

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                        <ThemeToggle />
                    </div>

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

                <main className="admin-main"><ErrorBoundary>{children}</ErrorBoundary></main>

                {/* Mobile bottom navigation */}
                <BottomNav />

                {/* Keyboard shortcuts help modal */}
                {showHelp && (
                    <div className="zen-shortcuts-modal" onClick={() => setShowHelp(false)}>
                        <div className="zen-shortcuts-modal__content" onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>⌨️ Phím tắt</h3>
                                <button onClick={() => setShowHelp(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>✕</button>
                            </div>
                            {[...shortcuts, { key: '?', label: 'Hiện phím tắt', action: () => { }, meta: false }].map(s => (
                                <div key={s.key} className="zen-shortcut-row">
                                    <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                                    <span className="zen-shortcut-key">{s.meta ? '⌘' : ''}{s.key.toUpperCase()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </FeatureProvider >
    );
}
