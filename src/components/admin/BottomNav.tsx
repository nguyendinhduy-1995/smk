'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ─── SVG Icons (16px, stroke-based) ─── */
const Icons = {
    dashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    products: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    ),
    orders: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    customers: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    more: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
        </svg>
    ),
    sun: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    ),
    moon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    ),
    /* More drawer icons */
    warehouse: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
            <path d="M6 18h12" /><path d="M6 14h12" />
        </svg>
    ),
    returns: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
    ),
    support: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
    reviews: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    partners: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
        </svg>
    ),
    commissions: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    payouts: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
    ),
    automation: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    ai: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v2a4 4 0 0 1-8 0v-2H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2V6a4 4 0 0 1 4-4z" />
            <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" /><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
    ),
    analytics: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    seo: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    fraud: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    audit: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    users: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    prescription: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="10" r="5" /><circle cx="16" cy="10" r="5" /><line x1="3" y1="10" x2="1" y2="10" /><line x1="23" y1="10" x2="21" y2="10" /><line x1="13" y1="10" x2="11" y2="10" />
        </svg>
    ),
    shipping: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
    ),
    tracking: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
};

type IconName = keyof typeof Icons;

interface NavItem {
    href: string;
    label: string;
    perm: string;
    icon: IconName;
}

const MAIN_ITEMS: NavItem[] = [
    { href: '/admin', label: 'Tổng quan', perm: 'dashboard', icon: 'dashboard' },
    { href: '/admin/products', label: 'Sản phẩm', perm: 'products', icon: 'products' },
    { href: '/admin/orders', label: 'Đơn hàng', perm: 'orders', icon: 'orders' },
    { href: '/admin/customers', label: 'Khách hàng', perm: 'customers', icon: 'customers' },
];

const MORE_ITEMS: NavItem[] = [
    { href: '/admin/warehouse', label: 'Kho hàng', perm: 'products', icon: 'warehouse' },
    { href: '/admin/returns', label: 'Đổi trả', perm: 'orders', icon: 'returns' },
    { href: '/admin/support', label: 'Hỗ trợ', perm: 'customers', icon: 'support' },
    { href: '/admin/reviews', label: 'Đánh giá', perm: 'products', icon: 'reviews' },
    { href: '/admin/partners', label: 'Đối tác', perm: 'partners', icon: 'partners' },
    { href: '/admin/commissions', label: 'Hoa hồng', perm: 'commissions', icon: 'commissions' },
    { href: '/admin/payouts', label: 'Rút tiền', perm: 'payouts', icon: 'payouts' },
    { href: '/admin/automation', label: 'Tự động', perm: 'automation', icon: 'automation' },
    { href: '/admin/ai', label: 'Trợ lý AI', perm: 'ai', icon: 'ai' },
    { href: '/admin/analytics', label: 'Phân tích', perm: 'analytics', icon: 'analytics' },
    { href: '/admin/seo', label: 'SEO', perm: 'analytics', icon: 'seo' },
    { href: '/admin/fraud', label: 'Chống gian lận', perm: 'fraud', icon: 'fraud' },
    { href: '/admin/audit', label: 'Nhật ký', perm: 'users', icon: 'audit' },
    { href: '/admin/users', label: 'Người dùng', perm: 'users', icon: 'users' },
    { href: '/admin/prescription', label: 'Đơn kính', perm: 'products', icon: 'prescription' },
    { href: '/admin/shipping', label: 'Vận chuyển', perm: 'orders', icon: 'shipping' },
];

function getSessionPerms(): { role: string; permissions: string[] } {
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
                return { role: payload.role || 'ADMIN', permissions: payload.permissions || [] };
            }
        }
    } catch { /* ignore */ }
    return { role: 'ADMIN', permissions: [] };
}

function canSee(role: string, permissions: string[], perm: string): boolean {
    if (role === 'ADMIN') return true;
    if (role === 'STORE_MANAGER') return perm !== 'users';
    return permissions.includes(perm) || perm === 'dashboard';
}

export default function BottomNav() {
    const pathname = usePathname();
    const [moreOpen, setMoreOpen] = useState(false);
    const [session, setSession] = useState<{ role: string; permissions: string[] }>({ role: 'ADMIN', permissions: [] });
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        setSession(getSessionPerms());
        const saved = localStorage.getItem('smk-admin-theme') as 'dark' | 'light' | null;
        if (saved) setTheme(saved);
    }, [pathname]);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('smk-admin-theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    const visibleMain = MAIN_ITEMS.filter(i => canSee(session.role, session.permissions, i.perm));
    const visibleMore = MORE_ITEMS.filter(i => canSee(session.role, session.permissions, i.perm));
    const isMoreActive = visibleMore.some(item => isActive(item.href));

    return (
        <>
            {/* More drawer overlay */}
            {moreOpen && (
                <div className="admin-bottomnav-overlay" onClick={() => setMoreOpen(false)} />
            )}

            {/* More drawer */}
            <div className={`admin-bottomnav-drawer ${moreOpen ? 'admin-bottomnav-drawer--open' : ''}`}>
                <div className="admin-bottomnav-drawer__handle" onClick={() => setMoreOpen(false)}>
                    <div className="admin-drawer__handle-bar" />
                </div>
                <div className="admin-bottomnav-drawer__title">Tất cả trang</div>
                <div className="admin-bottomnav-drawer__grid">
                    {visibleMore.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`admin-bottomnav-drawer__item ${isActive(item.href) ? 'admin-bottomnav-drawer__item--active' : ''}`}
                            onClick={() => setMoreOpen(false)}
                        >
                            <span className="admin-bottomnav-drawer__item-icon">{Icons[item.icon]}</span>
                            <span className="admin-bottomnav-drawer__item-label">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom nav bar */}
            <nav className="admin-bottomnav">
                {visibleMain.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-bottomnav__item ${isActive(item.href) ? 'admin-bottomnav__item--active' : ''}`}
                    >
                        <span className="admin-bottomnav__icon">{Icons[item.icon]}</span>
                        <span className="admin-bottomnav__label">{item.label}</span>
                    </Link>
                ))}
                {visibleMore.length > 0 && (
                    <button
                        className={`admin-bottomnav__item ${isMoreActive || moreOpen ? 'admin-bottomnav__item--active' : ''}`}
                        onClick={() => setMoreOpen(!moreOpen)}
                    >
                        <span className="admin-bottomnav__icon">{Icons.more}</span>
                        <span className="admin-bottomnav__label">Thêm</span>
                    </button>
                )}
            </nav>
        </>
    );
}
