'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import BottomNav from '@/components/admin/BottomNav';
import AdminHeader from '@/components/admin/AdminHeader';
import ThemeToggle from '@/components/admin/ThemeToggle';
import ErrorBoundary from '@/components/admin/ErrorBoundary';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

/* Sidebar SVG icons — 16px stroke-based, matching BottomNav */
const SIDEBAR_ICONS: Record<string, React.ReactNode> = {
    '/admin': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
    '/admin/products': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
    '/admin/prescription': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="10" r="5" /><circle cx="16" cy="10" r="5" /><line x1="3" y1="10" x2="1" y2="10" /><line x1="23" y1="10" x2="21" y2="10" /><line x1="13" y1="10" x2="11" y2="10" /></svg>,
    '/admin/orders': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    '/admin/shipping': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
    '/admin/returns': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>,
    '/admin/warehouse': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" /><path d="M6 18h12" /><path d="M6 14h12" /></svg>,
    '/admin/customers': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    '/admin/support': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    '/admin/reviews': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    '/admin/partners': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>,
    '/admin/commissions': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
    '/admin/payouts': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    '/admin/fraud': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    '/admin/automation': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.05 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    '/admin/ai': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v2a4 4 0 0 1-8 0v-2H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2V6a4 4 0 0 1 4-4z" /></svg>,
    '/admin/analytics': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    '/admin/meta-pixel': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    '/admin/seo': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    '/admin/audit': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    '/admin/users': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
};

const NAV_SECTIONS: { title: string | null; items: { href: string; label: string; perm: string }[] }[] = [
    {
        title: null,
        items: [
            { href: '/admin', label: 'Tổng quan', perm: 'dashboard' },
        ],
    },
    {
        title: 'Bán hàng',
        items: [
            { href: '/admin/products', label: 'Sản phẩm', perm: 'products' },
            { href: '/admin/prescription', label: 'Tròng kính', perm: 'products' },
            { href: '/admin/orders', label: 'Đơn hàng', perm: 'orders' },
            { href: '/admin/shipping', label: 'Vận chuyển', perm: 'orders' },
            { href: '/admin/returns', label: 'Đổi trả', perm: 'orders' },
            { href: '/admin/warehouse', label: 'Kho hàng', perm: 'products' },
        ],
    },
    {
        title: 'Khách hàng',
        items: [
            { href: '/admin/customers', label: 'Khách hàng', perm: 'customers' },
            { href: '/admin/support', label: 'Hỗ trợ', perm: 'customers' },
            { href: '/admin/reviews', label: 'Đánh giá', perm: 'products' },
        ],
    },
    {
        title: 'Đối tác',
        items: [
            { href: '/admin/partners', label: 'Đại lý', perm: 'partners' },
            { href: '/admin/commissions', label: 'Hoa hồng', perm: 'commissions' },
            { href: '/admin/payouts', label: 'Chi trả', perm: 'payouts' },
            { href: '/admin/fraud', label: 'Gian lận', perm: 'fraud' },
        ],
    },
    {
        title: 'Hệ thống',
        items: [
            { href: '/admin/automation', label: 'Tự động', perm: 'automation' },
            { href: '/admin/ai', label: 'AI', perm: 'ai' },
            { href: '/admin/analytics', label: 'Phân tích', perm: 'analytics' },
            { href: '/admin/meta-pixel', label: 'Tracking', perm: 'analytics' },
            { href: '/admin/seo', label: 'SEO', perm: 'analytics' },
            { href: '/admin/audit', label: 'Nhật ký', perm: 'users' },
            { href: '/admin/users', label: 'Người dùng', perm: 'users' },
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
        if (pathname === '/admin/login') return;
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
        setSidebarOpen(false);
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
            items: s.items.filter(i => canSee(i.perm)),
        }))
        .filter(s => s.items.length > 0);

    const roleInfo = ROLE_LABELS[session?.role || 'ADMIN'] || ROLE_LABELS.ADMIN;

    return (
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
                    SMK Quản trị
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
                                        {SIDEBAR_ICONS[item.href] && (
                                            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{SIDEBAR_ICONS[item.href]}</span>
                                        )}
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
                            Đăng xuất
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
                            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Phím tắt</h3>
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
    );
}
